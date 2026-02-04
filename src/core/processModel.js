// process factory for the simulator

export function createProcess({
  id,
  arrivalTime,
  burstTime,
  priority = null,
  color,
}) {
  return {
    id,                                   // e.g. P1, P2
    arrivalTime: Number(arrivalTime),
    burstTime: Number(burstTime),
    originalBurstTime: Number(burstTime), // immutable reference
    remainingTime: Number(burstTime),     // used in preemptive algorithms
    priority: priority !== null ? Number(priority) : null,
    color,                                // for Gantt chart visualization

    // Simulation results
    startTime: null,
    completionTime: null,
  };
}
