import { createTimelineBlock } from "../simulationTypes";

// First Come First Serve Scheduling
export function fcfsScheduler(processes) {
  // Defensive copy
  const procList = processes.map((p) => ({ ...p }));

  // Sort by arrival time
  procList.sort((a, b) => a.arrivalTime - b.arrivalTime);

  const timeline = [];
  let currentTime = 0;

  for (const proc of procList) {
    // CPU idle
    if (currentTime < proc.arrivalTime) {
      timeline.push(
        createTimelineBlock({
          pid: "IDLE",
          start: currentTime,
          end: proc.arrivalTime,
          color: "#9ca3af",
        })
      );
      currentTime = proc.arrivalTime;
    }

    // Execute process
    timeline.push(
      createTimelineBlock({
        pid: proc.id,
        start: currentTime,
        end: currentTime + proc.burstTime,
        color: proc.color,
      })
    );

    currentTime += proc.burstTime;
  }

  // ✅ FIX: derive completion time from timeline
  const completionMap = {};
  timeline.forEach((block) => {
    if (block.pid !== "IDLE") {
      completionMap[block.pid] = block.end; // last execution wins
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
