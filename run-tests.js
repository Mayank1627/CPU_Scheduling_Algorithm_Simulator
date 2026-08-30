import assert from 'assert';
import { RealtimeScheduler } from './src/core/realtime/RealtimeScheduler.js';

function runTest(testName, processes) {
  console.log(`\nRunning ${testName}...`);
  
  const scheduler = new RealtimeScheduler(processes);
  let isComplete = false;
  
  const processStats = {};
  processes.forEach(p => {
    processStats[p.pid] = {
      arrivalTime: p.arrivalTime,
      totalCpuBurst: p.bursts.filter(b => b.type === 'CPU').reduce((sum, b) => sum + b.duration, 0),
      totalIoBurst: p.bursts.filter(b => b.type === 'IO').reduce((sum, b) => sum + b.duration, 0),
      timeInRunning: 0,
      completionTime: -1
    };
  });
  
  let totalSimulationTime = 0;
  let totalCpuActiveTime = 0;
  let totalIdleTime = 0;
  
  let maxTicks = 1000;
  let currentTick = 0;
  
  while (!isComplete && currentTick < maxTicks) {
    const snap = scheduler.tick();
    currentTick = snap.currentTime;
    
    // Check CPU state
    if (snap.running) {
      totalCpuActiveTime++;
      processStats[snap.running.pid].timeInRunning++;
    } else {
      if (!snap.isComplete) {
         totalIdleTime++;
      }
    }
    
    // Check terminated processes
    snap.terminated.forEach(p => {
      if (processStats[p.pid].completionTime === -1) {
        processStats[p.pid].completionTime = snap.currentTime - 1;
      }
    });
    
    isComplete = snap.isComplete;
    if (isComplete) {
      totalSimulationTime = snap.currentTime - 1;
    }
  }
  
  if (currentTick >= maxTicks) {
    throw new Error(`Simulation did not complete within ${maxTicks} ticks.`);
  }
  
  // Verify OS Invariants
  try {
    // 1. CPU Utilization Rule
    assert.strictEqual(
      totalCpuActiveTime, 
      totalSimulationTime - totalIdleTime, 
      `CPU Utilization Rule failed. Active: ${totalCpuActiveTime}, SimTime: ${totalSimulationTime}, Idle: ${totalIdleTime}`
    );
    
    for (const p of processes) {
      const stats = processStats[p.pid];
      const turnaroundTime = stats.completionTime - stats.arrivalTime;
      const totalBurstTime = stats.totalCpuBurst + stats.totalIoBurst;
      
      const terminatedProc = scheduler.terminatedList.find(proc => proc.pid === p.pid);
      const actualWaitingTime = terminatedProc ? terminatedProc.waitingTime : -1;
      
      // 2. Turnaround Time Rule (sanity check)
      assert.ok(turnaroundTime > 0, `Turnaround time must be > 0 for ${p.pid}`);
      
      // 3. Waiting Time Rule
      assert.strictEqual(
        actualWaitingTime,
        turnaroundTime - totalBurstTime,
        `${p.pid} Waiting Time Rule failed. Expected: ${turnaroundTime - totalBurstTime} (TAT ${turnaroundTime} - TotalBurst ${totalBurstTime}), Actual: ${actualWaitingTime}`
      );
      
      // 4. Burst Conservation
      assert.strictEqual(
        stats.timeInRunning,
        stats.totalCpuBurst,
        `${p.pid} Burst Conservation failed. Time in RUNNING: ${stats.timeInRunning}, Total CPU Burst: ${stats.totalCpuBurst}`
      );
    }
    
    console.log(`✅ ${testName} passed!`);
  } catch (error) {
    console.error(`❌ ${testName} failed!`);
    console.error(error.message);
    throw error; // Re-throw to fail the overall run
  }
}

try {
  // Test 1: Basic FCFS (no I/O)
  runTest('Test 1: Basic FCFS', [
    { pid: 'P1', arrivalTime: 0, bursts: [{ type: 'CPU', duration: 5 }], color: '#000' },
    { pid: 'P2', arrivalTime: 2, bursts: [{ type: 'CPU', duration: 3 }], color: '#000' },
    { pid: 'P3', arrivalTime: 4, bursts: [{ type: 'CPU', duration: 2 }], color: '#000' }
  ]);

  // Test 2: I/O Overlap
  runTest('Test 2: I/O Overlap', [
    { pid: 'P1', arrivalTime: 0, bursts: [{ type: 'CPU', duration: 2 }, { type: 'IO', duration: 3 }, { type: 'CPU', duration: 2 }], color: '#000' },
    { pid: 'P2', arrivalTime: 1, bursts: [{ type: 'CPU', duration: 4 }], color: '#000' }
  ]);

  // Test 3: All Arrive at t=0
  runTest('Test 3: All Arrive at t=0', [
    { pid: 'P1', arrivalTime: 0, bursts: [{ type: 'CPU', duration: 2 }, { type: 'IO', duration: 1 }, { type: 'CPU', duration: 2 }], color: '#000' },
    { pid: 'P2', arrivalTime: 0, bursts: [{ type: 'CPU', duration: 3 }, { type: 'IO', duration: 2 }, { type: 'CPU', duration: 1 }], color: '#000' }
  ]);

  // Test 4: Edge Case (Consecutive I/O and CPU)
  runTest('Test 4: Edge Case', [
    { pid: 'P1', arrivalTime: 0, bursts: [{ type: 'CPU', duration: 1 }, { type: 'IO', duration: 1 }, { type: 'IO', duration: 1 }, { type: 'CPU', duration: 1 }, { type: 'CPU', duration: 1 }], color: '#000' },
    { pid: 'P2', arrivalTime: 2, bursts: [{ type: 'CPU', duration: 2 }], color: '#000' }
  ]);

  console.log('\n🎉 All engine invariants passed successfully!');
} catch (e) {
  console.error('\n🚨 Tests aborted due to failure.');
  process.exit(1);
}
