import { createTimelineBlock, createSimulationResult } from "../simulationTypes";

// First Come First Serve Scheduling
export function fcfsScheduler(processes) {
  // Defensive copy (never mutate original input)
  const procList = processes.map(p => ({ ...p }));

  // Sort by arrival time
  procList.sort((a, b) => a.arrivalTime - b.arrivalTime);

  const timeline = [];
  let currentTime = 0;

  for (const proc of procList) {
    // CPU idle if process arrives later
    if (currentTime < proc.arrivalTime) {
      timeline.push(
        createTimelineBlock({
          pid: "IDLE",
          start: currentTime,
          end: proc.arrivalTime,
          color: "#9ca3af", // gray for idle
        })
      );
      currentTime = proc.arrivalTime;
    }

    // Process starts execution
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
  }

  return createSimulationResult({
    timeline,
    processes: procList,
  });
}
