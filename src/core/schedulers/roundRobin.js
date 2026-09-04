import { createTimelineBlock } from "../simulationTypes.js";

// Round Robin Scheduling (Preemptive)
export function roundRobinScheduler(processes, timeQuantum = 2) {
  const procList = processes.map((p) => ({
    ...p,
    remainingTime: p.burstTime,
    startTime: null,
    completionTime: null,
    timeInQuantum: 0,
  }));

  const timeline = [];
  let currentTime = 0;
  let completed = 0;
  const n = procList.length;

  let currentProc = null;
  let blockStart = 0;
  let readyQueue = [];

  procList.sort((a, b) => a.arrivalTime - b.arrivalTime);

  while (completed < n) {
    // 1. Handle new arrivals
    const arrivals = procList.filter((p) => p.arrivalTime === currentTime);
    for (const p of arrivals) {
      readyQueue.push(p);
    }

    // 2. Check current process status (finished or exhausted quantum)
    let needsSwitch = false;
    let preempted = false;

    if (currentProc !== null && currentProc.id !== "IDLE") {
      if (currentProc.remainingTime === 0) {
        currentProc.completionTime = currentTime;
        completed++;
        needsSwitch = true;
      } else if (currentProc.timeInQuantum === timeQuantum) {
        readyQueue.push(currentProc);
        currentProc.timeInQuantum = 0;
        needsSwitch = true;
        preempted = true;
      }
    } else if (currentProc !== null && currentProc.id === "IDLE") {
      needsSwitch = true;
    }

    // If we just completed the last process, break out so we don't log an extra tick
    if (completed === n) {
      break;
    }

    // 3. Select next process
    let nextProc = currentProc;
    if (currentProc === null || needsSwitch) {
      nextProc = readyQueue.length > 0 ? readyQueue.shift() : null;
      if (nextProc) {
        nextProc.timeInQuantum = 0; // ensure reset
      }
    }

    // Logging for debugging
    const readyStr = `[${readyQueue.map(p => p.id).join(", ")}]`;
    let event = "CONTINUE";
    if (currentProc === null && nextProc !== null) event = "DISPATCH";
    else if (preempted && nextProc !== null) event = "PREEMPT";
    else if (needsSwitch && nextProc !== null) event = "DISPATCH";
    
    console.log(`[ t=${currentTime} ] Running: ${nextProc ? nextProc.id : 'IDLE'} (rem: ${nextProc ? nextProc.remainingTime : '-'}) | Ready: ${readyStr} | Event: ${event}`);

    // Update timeline
    if (currentProc !== nextProc || (preempted && currentProc === nextProc)) {
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

    // 4. Execute
    if (currentProc !== null) {
      if (currentProc.startTime === null) {
        currentProc.startTime = currentTime;
      }
      currentProc.remainingTime--;
      currentProc.timeInQuantum++;
    } else {
      // CPU is idle
      currentProc = { id: "IDLE", remainingTime: 0, timeInQuantum: 0, color: "#ffffff" };
    }

    currentTime++;
  }

  // Push the last block
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
