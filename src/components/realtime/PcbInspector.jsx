const STATE_COLOR_MAP = {
  ARRIVING: '#06b6d4',   // cyan-500 (ARR in EventLog: text-cyan-600)
  READY: '#6366f1',      // indigo-500 (READY in EventLog: text-indigo-600)
  RUNNING: '#10b981',    // emerald-500 (CPU in EventLog: text-emerald-600)
  BLOCKED: '#f59e0b',    // amber-500 (I/O in EventLog: text-amber-600)
  TERMINATED: '#a855f7', // purple-500 (TERM in EventLog: text-purple-600)
};

function PcbInspector({ selectedPid, snapshot, onClose }) {
  if (!selectedPid || !snapshot) return null;

  // Find the process in all lanes
  let process = null;
  let currentState = null;

  const searchLane = (lane, stateName) => {
    if (Array.isArray(lane)) {
      const p = lane.find(proc => proc.pid === selectedPid);
      if (p) {
        process = p;
        currentState = stateName;
      }
    } else if (lane && lane.pid === selectedPid) {
      process = lane;
      currentState = stateName;
    }
  };

  searchLane(snapshot.arriving, 'ARRIVING');
  if (!process) searchLane(snapshot.readyQueue, 'READY');
  if (!process) searchLane(snapshot.running, 'RUNNING');
  if (!process) searchLane(snapshot.blocked, 'BLOCKED');
  if (!process) searchLane(snapshot.terminated, 'TERMINATED');

  if (!process) return null; // Shouldn't happen unless process is deleted

  const isTerminated = currentState === 'TERMINATED';

  // Calculate live/finalized metrics
  const totalCpuBurst = process.bursts.filter(b => b.type === 'CPU').reduce((acc, b) => acc + b.duration, 0);
  const totalIoBurst = process.bursts.filter(b => b.type === 'IO').reduce((acc, b) => acc + b.duration, 0);

  let remainingCpu = 0;
  let remainingIo = 0;
  if (!isTerminated) {
    for (let i = process.burstIndex; i < process.bursts.length; i++) {
      const b = process.bursts[i];
      let left = b.duration;
      if (i === process.burstIndex) {
        left -= process.burstProgress;
      }
      if (b.type === 'CPU') remainingCpu += left;
      if (b.type === 'IO') remainingIo += left;
    }
  }

  // Calculate turnaround if it is terminated. 
  // Note: the engine doesn't explicitly store completionTime on the process object itself in the frontend yet.
  // We can calculate turnaround using waitingTime + totalBurstTime, since Waiting = Turnaround - Burst
  const turnaroundTime = process.waitingTime + totalCpuBurst + totalIoBurst;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40" onClick={onClose}></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50">
        <div
          className="neu-extruded rounded-2xl p-6 flex flex-col gap-6"
          style={{
            boxShadow: '4px 4px 16px rgba(163, 177, 198, 0.4), -4px -4px 16px rgba(255, 255, 255, 0.7), 0 10px 25px -5px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Process Control Block</h3>
              <span className="text-xl font-extrabold text-slate-700 tracking-tight">Inspector - {process.pid}</span>
            </div>
            <button className="p-2 neu-btn text-slate-400 hover:text-red-500 transition" onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Core Identification</h4>
              <div className="neu-pressed rounded-xl p-4 grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">PID</span>
                  <span className="font-extrabold font-['JetBrains_Mono'] text-lg" style={{ color: process.color }}>{process.pid}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">State</span>
                  <span
                    className={`pcb-state-label pcb-state-${currentState} font-extrabold tracking-wide`}
                    style={{ color: STATE_COLOR_MAP[currentState] || '#334155' }}
                  >
                    {currentState}
                  </span>
                </div>
                <div className="flex flex-col col-span-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Arrival Time</span>
                  <span className="font-bold text-slate-700 font-['JetBrains_Mono']">t={process.arrivalTime}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isTerminated ? 'Finalized Metrics' : 'Live Execution Data'}</h4>
              <div className="neu-pressed rounded-xl p-4 grid grid-cols-2 gap-4">
                {isTerminated ? (
                  <>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Turnaround Time</span>
                      <span className="font-bold text-slate-700 font-['JetBrains_Mono']">{turnaroundTime} ticks</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Wait Time</span>
                      <span className="font-bold text-slate-700 font-['JetBrains_Mono']">{process.waitingTime} ticks</span>
                    </div>
                    <div className="flex flex-col col-span-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total CPU Time</span>
                      <span className="font-bold text-slate-700 font-['JetBrains_Mono']">{totalCpuBurst} ticks</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Burst Time</span>
                      <span className="font-bold text-slate-700 font-['JetBrains_Mono']">{totalCpuBurst + totalIoBurst} ticks</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Current Wait</span>
                      <span className="font-bold text-slate-700 font-['JetBrains_Mono']">{process.waitingTime} ticks</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Remaining CPU</span>
                      <span className="font-bold text-slate-700 font-['JetBrains_Mono']">{remainingCpu} ticks</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Remaining I/O</span>
                      <span className="font-bold text-slate-700 font-['JetBrains_Mono']">{remainingIo} ticks</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Burst Sequence Trace</h4>
              <div className="neu-pressed rounded-xl p-4 flex gap-2 flex-wrap">
                {process.bursts.map((b, i) => {
                  let statusIcon = (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                  );
                  let statusClass = 'bg-slate-200 text-slate-400';

                  if (isTerminated || i < process.burstIndex) {
                    statusIcon = (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    );
                    statusClass = 'bg-emerald-500/20 text-emerald-600';
                  } else if (i === process.burstIndex) {
                    statusIcon = (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                        <line x1="12" y1="2" x2="12" y2="6" />
                        <line x1="12" y1="18" x2="12" y2="22" />
                        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                        <line x1="2" y1="12" x2="6" y2="12" />
                        <line x1="18" y1="12" x2="22" y2="12" />
                        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                        <line x1="16.24" y1="4.93" x2="19.07" y2="7.76" />
                      </svg>
                    );
                    statusClass = 'bg-amber-500/20 text-amber-600 border border-amber-500/30';
                  }

                  return (
                    <div key={i} className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-bold ${statusClass}`}>
                      <span className="flex items-center justify-center">{statusIcon}</span>
                      <span>{b.type}</span>
                      <span>{b.duration}t</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PcbInspector;
