/**
 * CPU class — represents a single CPU slot.
 *
 * At most one Process can occupy the CPU at any time.
 * The engine loads / releases processes through this interface.
 */

export class CPU {
  constructor() {
    this.currentProcess = null;
  }

  /** Load a process onto the CPU. */
  load(process) {
    this.currentProcess = process;
  }

  /** Release the current process from the CPU. Returns the released process. */
  release() {
    const released = this.currentProcess;
    this.currentProcess = null;
    return released;
  }

  /** True if a process is currently executing. */
  isBusy() {
    return this.currentProcess !== null;
  }

  /** Returns a snapshot of the CPU state. */
  toSnapshot() {
    return {
      busy: this.isBusy(),
      process: this.currentProcess ? this.currentProcess.toSnapshot() : null,
    };
  }
}
