// A single execution slice in the CPU timeline
export function createTimelineBlock({ pid, start, end, color }) {
  return {
    pid,       // Process ID or "IDLE"
    start,     // start time (inclusive)
    end,       // end time (exclusive)
    color,     // used for Gantt chart rendering
  };
}

// Standard simulation result returned by every algorithm
export function createSimulationResult({ timeline, processes }) {
  return {
    timeline,   // Array of timeline blocks
    processes,  // Final state of processes after execution
  };
}
