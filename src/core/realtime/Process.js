/**
 * Process class for the real-time simulation engine.
 *
 * A process is defined by an alternating sequence of CPU and I/O bursts.
 * The engine advances the process through these bursts one at a time.
 *
 * States: NEW → READY → RUNNING → BLOCKED → READY → … → TERMINATED
 */

// Valid process states
export const ProcessState = Object.freeze({
  NEW: 'NEW',
  READY: 'READY',
  RUNNING: 'RUNNING',
  BLOCKED: 'BLOCKED',
  TERMINATED: 'TERMINATED',
});

export class Process {
  /**
   * @param {string} pid         — e.g. "P1"
   * @param {number} arrivalTime — when the process enters the system
   * @param {Array<{type: 'CPU'|'IO', duration: number}>} bursts
   * @param {string} color       — hex color for visualization
   */
  constructor(pid, arrivalTime, bursts, color) {
    this.pid = pid;
    this.arrivalTime = arrivalTime;
    this.bursts = bursts.map((b) => ({ ...b })); // defensive copy
    this.color = color;

    this.state = ProcessState.NEW;
    this.burstIndex = 0;     // index into bursts array
    this.burstProgress = 0;  // ms elapsed in current burst
    this.waitingTime = 0;    // ticks spent in READY state
    this.starvationWarned = false; // true once the 5s warning has been emitted
  }

  /** Returns the burst object currently being executed, or null if done. */
  getCurrentBurst() {
    if (this.burstIndex >= this.bursts.length) return null;
    return this.bursts[this.burstIndex];
  }

  /** How much of the current burst remains (in ms). */
  getRemainingBurstTime() {
    const burst = this.getCurrentBurst();
    if (!burst) return 0;
    return burst.duration - this.burstProgress;
  }

  /** Total duration of all bursts combined (CPU + I/O). */
  getTotalBurstTime() {
    return this.bursts.reduce((sum, b) => sum + b.duration, 0);
  }

  /** 
   * Total remaining duration across all bursts combined.
   * Includes remaining time on current burst + all future bursts. 
   */
  getTotalRemainingBurstTime() {
    let remaining = 0;
    if (this.burstIndex < this.bursts.length) {
      // Remaining of current burst
      remaining += this.bursts[this.burstIndex].duration - this.burstProgress;
      // All subsequent bursts
      for (let i = this.burstIndex + 1; i < this.bursts.length; i++) {
        remaining += this.bursts[i].duration;
      }
    }
    return remaining;
  }

  /**
   * Advance to the next burst in the sequence.
   * Resets burstProgress to 0.
   * Returns the NEW current burst, or null if the process is complete.
   */
  advanceBurst() {
    this.burstIndex++;
    this.burstProgress = 0;
    return this.getCurrentBurst();
  }

  /** True if all bursts have been completed. */
  isComplete() {
    return this.burstIndex >= this.bursts.length;
  }

  /** Create a serializable snapshot for the UI (no methods). */
  toSnapshot() {
    const currentBurst = this.getCurrentBurst();
    return {
      pid: this.pid,
      arrivalTime: this.arrivalTime,
      color: this.color,
      state: this.state,
      burstIndex: this.burstIndex,
      burstProgress: this.burstProgress,
      currentBurst: currentBurst ? { ...currentBurst } : null,
      remainingBurstTime: this.getRemainingBurstTime(),
      totalBursts: this.bursts.length,
      bursts: this.bursts.map((b) => ({ ...b })),
      waitingTime: this.waitingTime,
      completionTime: this.completionTime,
      turnaroundTime: this.turnaroundTime,
    };
  }
}
