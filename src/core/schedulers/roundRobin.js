import { createTimelineBlock } from "../simulationTypes";

// Round Robin Scheduling (Preemptive)
export function roundRobinScheduler(processes, timeQuantum = 2) {
  const procList = processes.map((p) => ({
    ...p,
    remainingTime: p.burstTime,
    startTime: null,
    completionTime: null,
  }));

  const timeline = [];
  const readyQueue = [];
  let currentTime = 0;
  let completed = 0;
  const n = procList.length;

  procList.sort((a, b) => a.arrivalTime - b.arrivalTime);

  let i = 0;

  while (completed < n) {
    while (i < n && procList[i].arrivalTime <= currentTime) {
      readyQueue.push(procList[i]);
      i++;
    }

    if (readyQueue.length === 0) {
      const nextArrival = procList[i].arrivalTime;

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

    const proc = readyQueue.shift();

    if (proc.startTime === null) {
      proc.startTime = currentTime;
    }

    const execTime = Math.min(timeQuantum, proc.remainingTime);
    const start = currentTime;
    const end = currentTime + execTime;

    timeline.push(
      createTimelineBlock({
        pid: proc.id,
        start,
        end,
        color: proc.color,
      })
    );

    proc.remainingTime -= execTime;
    currentTime = end;

    while (i < n && procList[i].arrivalTime <= currentTime) {
      readyQueue.push(procList[i]);
      i++;
    }

    if (proc.remainingTime > 0) {
      readyQueue.push(proc);
    } else {
      proc.completionTime = currentTime;
      completed++;
    }
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
