import { createTimelineBlock } from "../simulationTypes";

// Round Robin Scheduling (Preemptive)
export function roundRobinScheduler(processes, timeQuantum = 2) {
  // Defensive copy + remaining time
  const procList = processes.map((p) => ({
    ...p,
    remainingTime: p.burstTime,
  }));

  const timeline = [];
  const readyQueue = [];
  let currentTime = 0;
  let completed = 0;
  const n = procList.length;

  // Sort by arrival time
  procList.sort((a, b) => a.arrivalTime - b.arrivalTime);

  let i = 0; // arrival index

  while (completed < n) {
    // Add arrived processes
    while (i < n && procList[i].arrivalTime <= currentTime) {
      readyQueue.push(procList[i]);
      i++;
    }

    // CPU idle
    if (readyQueue.length === 0) {
      const nextArrival = procList[i].arrivalTime;

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

    const proc = readyQueue.shift();

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

    // Add processes that arrived during execution
    while (i < n && procList[i].arrivalTime <= currentTime) {
      readyQueue.push(procList[i]);
      i++;
    }

    if (proc.remainingTime > 0) {
      readyQueue.push(proc);
    } else {
      completed++;
    }
  }

  // ✅ FIX: derive completion time from timeline
  const completionMap = {};
  timeline.forEach((block) => {
    if (block.pid !== "IDLE") {
      completionMap[block.pid] = block.end; // last slice wins
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
