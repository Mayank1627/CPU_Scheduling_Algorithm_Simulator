import { createTimelineBlock, createSimulationResult } from "../simulationTypes";

// Priority Scheduling (Non-Preemptive)
// Lower priority number = higher priority
export function priorityScheduler(processes) {
  const procList = processes.map(p => ({ ...p }));
  const timeline = [];

  let currentTime = 0;
  let completed = 0;
  const n = procList.length;

  const isCompleted = new Set();

  while (completed < n) {
    // Processes that have arrived and are not completed
    const available = procList.filter(
      p =>
        !isCompleted.has(p.id) &&
        p.arrivalTime <= currentTime
    );

    // If none available → CPU idle
    if (available.length === 0) {
      const nextArrival = Math.min(
        ...procList
          .filter(p => !isCompleted.has(p.id))
          .map(p => p.arrivalTime)
      );

      timeline.push(
        createTimelineBlock({
          pid: "IDLE",
          start: currentTime,
          end: nextArrival,
          color: "#9ca3af",
        })
      );

      currentTime = nextArrival;
      continue;
    }

    // Pick highest priority (lowest number)
    available.sort((a, b) => a.priority - b.priority);
    const proc = available[0];

    proc.startTime = currentTime;

    timeline.push(
      createTimelineBlock({
        pid: proc.id,
        start: currentTime,
        end: currentTime + proc.burstTime,
        color: proc.color,
      })
    );

    currentTime += proc.burstTime;
    proc.completionTime = currentTime;
    proc.remainingTime = 0;

    isCompleted.add(proc.id);
    completed++;
  }

 const finalizedProcesses = processes.map((p) => {
  const turnaroundTime = p.completionTime - p.arrivalTime;
  const waitingTime = turnaroundTime - p.burstTime;

  return {
    ...p,
    turnaroundTime,
    waitingTime,
  };
});

return {
  timeline,
  processes: finalizedProcesses,
};

}
