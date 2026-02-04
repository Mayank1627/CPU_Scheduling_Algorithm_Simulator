import { createTimelineBlock } from "../simulationTypes.js";

export function fcfsScheduler(processes) {
  const procList = processes.map((p) => ({
    ...p,
    remainingTime: p.burstTime,
    startTime: null,
    completionTime: null,
  }));

  procList.sort((a, b) => a.arrivalTime - b.arrivalTime);

  const timeline = [];
  let currentTime = 0;

  for (const proc of procList) {
    if (currentTime < proc.arrivalTime) {
      timeline.push(
        createTimelineBlock({
          pid: "IDLE",
          start: currentTime,
          end: proc.arrivalTime,
          color: "#ffffff",
        })
      );
      currentTime = proc.arrivalTime;
    }

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
