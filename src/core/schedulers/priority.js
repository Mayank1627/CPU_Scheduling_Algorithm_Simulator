import { createTimelineBlock } from "../simulationTypes.js";

// Priority Scheduling (Preemptive)
// Lower priority number = higher priority
export function priorityScheduler(processes) {
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

  let currentProc = null;
  let blockStart = 0;
  let readyQueue = [];

  // Sort by arrival time initially
  procList.sort((a, b) => a.arrivalTime - b.arrivalTime);

  while (completed < n) {
    // 1. Handle new arrivals at currentTime
    const arrivals = procList.filter((p) => p.arrivalTime === currentTime);
    for (const p of arrivals) {
      readyQueue.push(p);
    }

    // 2. Put the currently running process back into the ready queue if it's not finished
    if (currentProc !== null && currentProc.remainingTime > 0) {
      readyQueue.push(currentProc);
    }

    // 3. Sort the ready queue by priority (stable sort preserves FIFO for ties)
    readyQueue.sort((a, b) => {
      if (a.priority === null && b.priority === null) return 0;
      if (a.priority === null) return 1;
      if (b.priority === null) return -1;
      return a.priority - b.priority;
    });

    // 4. Select the next process to run
    let nextProc = readyQueue.length > 0 ? readyQueue.shift() : null;

    // Logging for debugging as requested
    const readyStr = `[${readyQueue.map(p => p.id).join(", ")}]`;
    let event = "CONTINUE";
    if (currentProc === null && nextProc !== null) event = "DISPATCH";
    else if (currentProc !== null && nextProc !== null && currentProc.id !== nextProc.id) event = "PREEMPT";
    
    console.log(`[ t=${currentTime} ] Running: ${nextProc ? nextProc.id : 'IDLE'} (rem: ${nextProc ? nextProc.remainingTime : '-'}) | Ready: ${readyStr} | Event: ${event}`);

    // Update timeline blocks
    if (currentProc !== nextProc) {
      if (currentProc !== null) {
        timeline.push(
          createTimelineBlock({
            pid: currentProc.id,
            start: blockStart,
            end: currentTime,
            color: currentProc.id === "IDLE" ? "#ffffff" : currentProc.color,
          })
        );
      }
      blockStart = currentTime;
      currentProc = nextProc;
    }

    // 5. Execute the selected process
    if (currentProc !== null) {
      if (currentProc.startTime === null) {
        currentProc.startTime = currentTime;
      }
      currentProc.remainingTime--;
      if (currentProc.remainingTime === 0) {
        currentProc.completionTime = currentTime + 1;
        completed++;
      }
    } else {
      // CPU is idle
      currentProc = { id: "IDLE", remainingTime: 0, color: "#ffffff" };
    }

    currentTime++;
  }

  // Push the last block
  if (currentProc !== null && currentProc.id !== "IDLE") {
    timeline.push(
      createTimelineBlock({
        pid: currentProc.id,
        start: blockStart,
        end: currentTime,
        color: currentProc.color,
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
