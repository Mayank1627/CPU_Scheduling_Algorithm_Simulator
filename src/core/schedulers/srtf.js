import { createTimelineBlock } from "../simulationTypes";

// Shortest Remaining Time First (Preemptive)
export function srtfScheduler(processes) {
  const procList = processes.map((p) => ({
    ...p,
    remainingTime: p.burstTime,
  }));

  const timeline = [];
  let currentTime = 0;
  let completed = 0;
  const n = procList.length;

  let lastPid = null;
  let blockStart = 0;

  while (completed < n) {
    const available = procList.filter(
      (p) => p.arrivalTime <= currentTime && p.remainingTime > 0
    );

    // CPU idle
    if (available.length === 0) {
      if (lastPid !== "IDLE") {
        if (lastPid !== null) {
          timeline.push(
            createTimelineBlock({
              pid: lastPid,
              start: blockStart,
              end: currentTime,
              color:
                lastPid === "IDLE"
                  ? "#9ca3af"
                  : procList.find((p) => p.id === lastPid).color,
            })
          );
        }
        lastPid = "IDLE";
        blockStart = currentTime;
      }
      currentTime++;
      continue;
    }

    // Pick process with shortest remaining time
    available.sort((a, b) => a.remainingTime - b.remainingTime);
    const currentProc = available[0];

    // Context switch
    if (lastPid !== currentProc.id) {
      if (lastPid !== null) {
        timeline.push(
          createTimelineBlock({
            pid: lastPid,
            start: blockStart,
            end: currentTime,
            color:
              lastPid === "IDLE"
                ? "#9ca3af"
                : procList.find((p) => p.id === lastPid).color,
          })
        );
      }
      lastPid = currentProc.id;
      blockStart = currentTime;
    }

    // Execute for 1 unit
    currentProc.remainingTime--;
    currentTime++;

    if (currentProc.remainingTime === 0) {
      completed++;
    }
  }

  // Close last block
  if (lastPid !== null) {
    timeline.push(
      createTimelineBlock({
        pid: lastPid,
        start: blockStart,
        end: currentTime,
        color:
          lastPid === "IDLE"
            ? "#9ca3af"
            : procList.find((p) => p.id === lastPid).color,
      })
    );
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
