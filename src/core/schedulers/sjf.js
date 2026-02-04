import { createTimelineBlock } from "../simulationTypes";

// Shortest Job First (Non-Preemptive)
export function sjfScheduler(processes) {
  const procList = processes.map((p) => ({
    ...p,
    remainingTime: p.burstTime,
    startTime: null,
    completionTime: null,
  }));

  const timeline = [];
  let currentTime = 0;
  let completed = 0;
  const n = procList.length;
  const isCompleted = new Set();

  while (completed < n) {
    const available = procList.filter(
      (p) =>
        !isCompleted.has(p.id) &&
        p.arrivalTime <= currentTime
    );

    if (available.length === 0) {
      const nextArrival = Math.min(
        ...procList
          .filter((p) => !isCompleted.has(p.id))
          .map((p) => p.arrivalTime)
      );

      timeline.push(
        createTimelineBlock({
          pid: "IDLE",
          start: currentTime,
          end: nextArrival,
          color: "#ffffff",
        })
      );

      currentTime = nextArrival;
      continue;
    }

    available.sort((a, b) => a.burstTime - b.burstTime);
    const proc = available[0];

    if (proc.startTime === null) {
      proc.startTime = currentTime;
    }

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
    isCompleted.add(proc.id);
    completed++;
  }

  const finalizedProcesses = procList.map((p) => {
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
