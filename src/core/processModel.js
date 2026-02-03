//  process factory for the simulator to simulate different process

export function createProcess(
    {
  id,
  arrivalTime,
  burstTime,
  priority = null,
  color,
}) {
  return {
    id,                     // e.g. P1, P2
    arrivalTime: Number(arrivalTime),
    burstTime: Number(burstTime),
    remainingTime: Number(burstTime), // used in preemptive algorithms
    priority,                        // used in Priority scheduling
    color,                          // for Gantt chart visualization

    // For simulation Part
    startTime: null,
    completionTime: null,
  };
}
