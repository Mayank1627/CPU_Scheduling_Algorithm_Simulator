/**
 * RealtimeScheduler — the tick-based simulation engine.
 *
 * This class is completely decoupled from the DOM and React.
 * It advances the simulation by 1 time unit per tick() call
 * and returns a SystemSnapshot describing the full system state.
 *
 * Scheduling policy: FCFS (non-preemptive) for the CPU queue.
 * I/O model: single I/O device (one process does I/O at a time,
 *            others wait in the blocked queue).
 */

import { Process, ProcessState } from './Process.js';
import { CPU } from './CPU.js';
import { createSystemSnapshot } from './SystemSnapshot.js';

export class RealtimeScheduler {
  /**
   * @param {Array<{pid: string, arrivalTime: number, bursts: Array, color: string}>} processDefinitions
   * @param {string} algorithm - 'FCFS', 'SJF', or 'SRTF'
   */
  constructor(processDefinitions, algorithm = 'FCFS') {
    // Build Process instances from definitions
    this.allProcesses = processDefinitions.map(
      (def) => new Process(def.pid, def.arrivalTime, def.bursts, def.color)
    );
    this.algorithm = algorithm;

    this.cpu = new CPU();
    this.readyQueue = [];
    this.blockedQueue = [];
    this.terminatedList = [];
    this.currentTime = 0;
    this.eventLog = []; // cumulative log of all events
  }

  /**
   * Advance the simulation by 1 time unit.
   * Returns a SystemSnapshot describing the full state after this tick.
   */
  tick() {
    const tickEvents = [];

    // ── Step 1: Check arrivals ────────────────────────────────────────
    // Move processes whose arrivalTime === currentTime from NEW → READY
    for (const proc of this.allProcesses) {
      if (proc.state === ProcessState.NEW && proc.arrivalTime === this.currentTime) {
        const firstBurst = proc.getCurrentBurst();
        if (firstBurst && firstBurst.type === 'IO') {
          proc.state = ProcessState.BLOCKED;
          this.blockedQueue.push(proc);
          tickEvents.push(`t=${this.currentTime}: ${proc.pid} arrived → I/O Device (${firstBurst.duration}ms)`);
        } else {
          proc.state = ProcessState.READY;
          this.readyQueue.push(proc);
          tickEvents.push(`t=${this.currentTime}: ${proc.pid} arrived → Ready Queue`);
        }
      }
    }

    // ── Step 2: Check blocked processes (I/O completion) ──────────────
    // Advance I/O progress for the FIRST process in the blocked queue
    // (single I/O device model). If its I/O burst completes, move → READY.
    // If next burst is also I/O, remain in BLOCKED queue.
    const newlyUnblocked = [];
    if (this.blockedQueue.length > 0) {
      const ioProcess = this.blockedQueue[0]; // only the first gets I/O device
      ioProcess.burstProgress++;

      if (ioProcess.burstProgress >= ioProcess.getCurrentBurst().duration) {
        // I/O burst complete
        this.blockedQueue.shift(); // remove from blocked queue
        const nextBurst = ioProcess.advanceBurst();

        if (nextBurst === null) {
          // No more bursts
          ioProcess.state = ProcessState.TERMINATED;
          ioProcess.completionTime = this.currentTime;
          ioProcess.turnaroundTime = ioProcess.completionTime - ioProcess.arrivalTime;
          this.terminatedList.push(ioProcess);
          tickEvents.push(`t=${this.currentTime}: ${ioProcess.pid} terminated (from I/O)`);
        } else if (nextBurst.type === 'IO') {
          // Next burst is ALSO an I/O burst — stay in blocked queue
          ioProcess.state = ProcessState.BLOCKED;
          this.blockedQueue.push(ioProcess);
          tickEvents.push(
            `t=${this.currentTime}: ${ioProcess.pid} I/O burst complete → next I/O Device (${nextBurst.duration}ms)`
          );
        } else {
          // Next burst is CPU — move to READY queue
          ioProcess.state = ProcessState.READY;
          this.readyQueue.push(ioProcess);
          newlyUnblocked.push(ioProcess);
          tickEvents.push(`t=${this.currentTime}: ${ioProcess.pid} I/O complete → Ready Queue`);
        }
      }
    }

    // ── Step 3: Check CPU (burst completion) ──────────────────────────
    if (this.cpu.isBusy()) {
      const running = this.cpu.currentProcess;
      running.burstProgress++;

      if (running.burstProgress >= running.getCurrentBurst().duration) {
        // Current CPU burst complete
        const nextBurst = running.advanceBurst();
        this.cpu.release();

        if (nextBurst === null) {
          // No more bursts — process terminates
          running.state = ProcessState.TERMINATED;
          running.completionTime = this.currentTime;
          running.turnaroundTime = running.completionTime - running.arrivalTime;
          this.terminatedList.push(running);
          tickEvents.push(`t=${this.currentTime}: ${running.pid} terminated`);
        } else if (nextBurst.type === 'IO') {
          // Next burst is I/O — move to blocked queue
          running.state = ProcessState.BLOCKED;
          this.blockedQueue.push(running);
          tickEvents.push(
            `t=${this.currentTime}: ${running.pid} → I/O Device (${nextBurst.duration}ms)`
          );
        } else {
          // Next burst is CPU — back to ready queue (shouldn't happen in
          // well-formed alternating sequences, but handle it)
          running.state = ProcessState.READY;
          this.readyQueue.push(running);
          tickEvents.push(`t=${this.currentTime}: ${running.pid} → Ready Queue`);
        }
      }
    }

    // ── Step 4: Sort Ready Queue and Handle Preemption ────────────────────
    if (this.algorithm === 'SJF') {
      this.readyQueue.sort((a, b) => a.getTotalBurstTime() - b.getTotalBurstTime());
    } else if (this.algorithm === 'SRTF') {
      this.readyQueue.sort((a, b) => a.getTotalRemainingBurstTime() - b.getTotalRemainingBurstTime());
    }

    if (this.algorithm === 'SRTF' && this.cpu.isBusy() && this.readyQueue.length > 0) {
      const running = this.cpu.currentProcess;
      const firstReady = this.readyQueue[0];
      if (firstReady.getTotalRemainingBurstTime() < running.getTotalRemainingBurstTime()) {
        const released = this.cpu.release();
        released.state = ProcessState.READY;
        this.readyQueue.push(released);
        this.readyQueue.sort((a, b) => a.getTotalRemainingBurstTime() - b.getTotalRemainingBurstTime());
        tickEvents.push(`t=${this.currentTime}: ${released.pid} PREEMPTED by ${firstReady.pid}`);
      }
    }

    // ── Step 4b: Load next process onto CPU if idle ────────────────────
    if (!this.cpu.isBusy() && this.readyQueue.length > 0) {
      const next = this.readyQueue.shift(); // Take front of queue (FCFS, or already sorted)
      next.state = ProcessState.RUNNING;
      this.cpu.load(next);
      tickEvents.push(`t=${this.currentTime}: ${next.pid} → CPU`);
      if (next.waitingTime >= 5) {
        tickEvents.push(
          `t=${this.currentTime}: INFO - ${next.pid} dispatched to CPU after waiting ${next.waitingTime}s`
        );
      }
    }

    // ── Step 4b: Increment waitingTime for processes still in Ready Queue ─
    for (const proc of this.readyQueue) {
      proc.waitingTime++;
      if (proc.waitingTime === 5 && !proc.starvationWarned) {
        proc.starvationWarned = true;
        tickEvents.push(
          `t=${this.currentTime}: WARNING - ${proc.pid} has been waiting for 5s (Starvation Risk)`
        );
      }
    }

    // Increment waiting time for processes waiting for the I/O device (index >= 1)
    for (let i = 1; i < this.blockedQueue.length; i++) {
      this.blockedQueue[i].waitingTime++;
    }

    // ── Step 5: Advance time ──────────────────────────────────────────
    this.currentTime++;

    // ── Step 6: Record events ─────────────────────────────────────────
    this.eventLog.push(...tickEvents);

    // ── Step 7: Build and return snapshot ──────────────────────────────
    const arriving = this.allProcesses
      .filter((p) => p.state === ProcessState.NEW && p.arrivalTime <= this.currentTime)
      .map((p) => p.toSnapshot());

    const readyQueue = this.readyQueue.map((p) => p.toSnapshot());
    const running = this.cpu.currentProcess
      ? this.cpu.currentProcess.toSnapshot()
      : null;
    const blocked = this.blockedQueue.map((p) => p.toSnapshot());
    const terminated = this.terminatedList.map((p) => p.toSnapshot());

    const isComplete = this.allProcesses.every(
      (p) => p.state === ProcessState.TERMINATED
    );

    return createSystemSnapshot({
      currentTime: this.currentTime,
      arriving,
      readyQueue,
      running,
      blocked,
      terminated,
      isComplete,
      events: [...this.eventLog], // full cumulative log
    });
  }

  /** Get the initial snapshot at t=0 before any ticks. */
  getInitialSnapshot() {
    const arriving = this.allProcesses
      .filter((p) => p.arrivalTime <= 0)
      .map((p) => p.toSnapshot());

    return createSystemSnapshot({
      currentTime: 0,
      arriving,
      readyQueue: [],
      running: null,
      blocked: [],
      terminated: [],
      isComplete: false,
      events: [],
    });
  }
}
