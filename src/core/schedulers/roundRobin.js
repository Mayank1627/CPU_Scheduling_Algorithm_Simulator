import { createTimelineBlock, createSimulationResult } from "../simulationTypes";

// Round Robin Scheduling (Preemptive)
export function roundRobinScheduler(processes, timeQuantum = 2) {
  const procList = processes.map(p => ({
    ...p,
    remainingTime: p.burstTime,
  }));

  const timeline = [];
  const readyQueue = [];
  let currentTime = 0;
  let completed = 0;
  const n = procList.length;

  // Sort by arrival time initially
  procList.sort((a, b) => a.arrivalTime - b.arrivalTime);

  let i = 0; // index for arrivals

  while (completed < n) {
    // Add newly arrived processes
    while (i < n && procList[i].arrivalTime <= currentTime) {
      readyQueue.push(procList[i]);
      i++;
    }

    // If no process ready → IDLE
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

    // Add arrivals during execution
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

  return createSimulationResult({
    timeline,
    processes: procList,
  });
}
