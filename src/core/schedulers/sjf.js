import { createTimelineBlock, createSimulationResult } from "../simulationTypes";

// Shortest Job First (Non-Preemptive)
export function sjfScheduler(processes) {
  const procList = processes.map(p => ({ ...p }));
  const timeline = [];

  let currentTime = 0;
  let completed = 0;
  const n = procList.length;

  // Track completion
  const isCompleted = new Set();

  while (completed < n) {
    // Get available processes
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

    // Pick shortest burst time
    available.sort((a, b) => a.burstTime - b.burstTime);
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

  return createSimulationResult({
    timeline,
    processes: procList,
  });
}
