// Compute scheduling metrics from simulation result
export function computeMetrics({ timeline, processes }) {
  const n = processes.length;

  let totalTurnaroundTime = 0;
  let totalWaitingTime = 0;

  const perProcess = processes.map((p) => {
    const turnaroundTime = p.completionTime - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;

    totalTurnaroundTime += turnaroundTime;
    totalWaitingTime += waitingTime;

    return {
      pid: p.id,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      completionTime: p.completionTime,
      turnaroundTime,
      waitingTime,
    };
  });

  const totalTime =
    timeline.length > 0
      ? timeline[timeline.length - 1].end - timeline[0].start
      : 0;

  const busyTime = timeline
    .filter((block) => block.pid !== "IDLE")
    .reduce((sum, block) => sum + (block.end - block.start), 0);

  const cpuUtilization =
    totalTime === 0 ? 0 : (busyTime / totalTime) * 100;

  const averageTurnaroundTime =
    n === 0 ? 0 : totalTurnaroundTime / n;

  const averageWaitingTime =
    n === 0 ? 0 : totalWaitingTime / n;

  const throughput =
    totalTime === 0 ? 0 : n / totalTime;

  return {
    perProcess,
    averageWaitingTime,
    averageTurnaroundTime,
    cpuUtilization,
    throughput,
  };
}
