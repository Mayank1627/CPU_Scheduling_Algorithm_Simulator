import { createTimelineBlock } from "../simulationTypes";

// Shortest Remaining Time First (Preemptive)
export function srtfScheduler(processes) {
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

  let lastPid = null;
  let blockStart = 0;

  while (completed < n) {
    const available = procList.filter(
      (p) => p.arrivalTime <= currentTime && p.remainingTime > 0
    );

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

    available.sort((a, b) => a.remainingTime - b.remainingTime);
    const currentProc = available[0];

    if (currentProc.startTime === null) {
      currentProc.startTime = currentTime;
    }

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

    currentProc.remainingTime--;
    currentTime++;

    if (currentProc.remainingTime === 0) {
      currentProc.completionTime = currentTime;
      completed++;
    }
  }

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
