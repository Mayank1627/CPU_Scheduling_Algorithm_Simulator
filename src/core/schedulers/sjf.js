import { createTimelineBlock } from "../simulationTypes";

// Shortest Job First (Non-Preemptive)
export function sjfScheduler(processes) {
  // Defensive copy
  const procList = processes.map((p) => ({ ...p }));
  const timeline = [];

  let currentTime = 0;
  let completed = 0;
  const n = procList.length;

  const isCompleted = new Set();

  while (completed < n) {
    // Available processes
    const available = procList.filter(
      (p) =>
        !isCompleted.has(p.id) &&
        p.arrivalTime <= currentTime
    );

    // CPU idle
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
          color: "#9ca3af",
        })
      );

      currentTime = nextArrival;
      continue;
    }

    // Pick shortest burst time
    available.sort((a, b) => a.burstTime - b.burstTime);
    const proc = available[0];

    timeline.push(
      createTimelineBlock({
        pid: proc.id,
        start: currentTime,
        end: currentTime + proc.burstTime,
        color: proc.color,
      })
    );

    currentTime += proc.burstTime;
    isCompleted.add(proc.id);
    completed++;
  }

  // ✅ FIX: derive completion time from timeline
  const completionMap = {};
  timeline.forEach((block) => {
    if (block.pid !== "IDLE") {
      completionMap[block.pid] = block.end;
    }
  });

  const finalizedProcesses = procList.map((p) => {
    const completionTime = completionMap[p.id];
    const turnaroundTime = completionTime - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;

    return {
      ...p,
      completionTime,
      turnaroundTime,
      waitingTime,
    };
  });

  return {
    timeline,
    processes: finalizedProcesses,
  };
}
