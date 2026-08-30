import React from 'react';

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
      <div className="pcb-inspector-overlay" onClick={onClose}></div>
      <div className="pcb-inspector-panel">
        <div className="pcb-header">
          <div className="pcb-title-group">
            <h3 className="pcb-title">PROCESS CONTROL BLOCK</h3>
            <span className="pcb-subtitle">Inspector - {process.pid}</span>
          </div>
          <button className="pcb-close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="pcb-content">
          <div className="pcb-section">
            <h4 className="pcb-section-title">CORE IDENTIFICATION</h4>
            <div className="pcb-grid">
              <div className="pcb-field">
                <span className="pcb-label">PID</span>
                <span className="pcb-value" style={{ color: process.color }}>{process.pid}</span>
              </div>
              <div className="pcb-field">
                <span className="pcb-label">STATE</span>
                <span className={`pcb-value pcb-state-${currentState.toLowerCase()}`}>{currentState}</span>
              </div>
              <div className="pcb-field">
                <span className="pcb-label">ARRIVAL TIME</span>
                <span className="pcb-value">t={process.arrivalTime}</span>
              </div>
            </div>
          </div>

          <div className="pcb-section">
            <h4 className="pcb-section-title">{isTerminated ? 'FINALIZED METRICS' : 'LIVE EXECUTION DATA'}</h4>
            <div className="pcb-grid">
              {isTerminated ? (
                <>
                  <div className="pcb-field">
                    <span className="pcb-label">TURNAROUND TIME</span>
                    <span className="pcb-value">{turnaroundTime} ticks</span>
                  </div>
                  <div className="pcb-field">
                    <span className="pcb-label">TOTAL WAIT TIME</span>
                    <span className="pcb-value">{process.waitingTime} ticks</span>
                  </div>
                  <div className="pcb-field">
                    <span className="pcb-label">TOTAL CPU TIME</span>
                    <span className="pcb-value">{totalCpuBurst} ticks</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="pcb-field">
                    <span className="pcb-label">TOTAL BURST TIME</span>
                    <span className="pcb-value">{totalCpuBurst + totalIoBurst} ticks</span>
                  </div>
                  <div className="pcb-field">
                    <span className="pcb-label">REMAINING CPU</span>
                    <span className="pcb-value">{remainingCpu} ticks</span>
                  </div>
                  <div className="pcb-field">
                    <span className="pcb-label">REMAINING I/O</span>
                    <span className="pcb-value">{remainingIo} ticks</span>
                  </div>
                  <div className="pcb-field">
                    <span className="pcb-label">CURRENT WAIT</span>
                    <span className="pcb-value">{process.waitingTime || 0} ticks</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="pcb-section">
            <h4 className="pcb-section-title">BURST SEQUENCE TRACE</h4>
            <div className="pcb-bursts">
              {process.bursts.map((b, i) => {
                let statusIcon = (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                );
                let statusClass = 'pcb-burst-pending';
                
                if (isTerminated || i < process.burstIndex) {
                  statusIcon = (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  );
                  statusClass = 'pcb-burst-done';
                } else if (i === process.burstIndex) {
                  statusIcon = (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rt-spin-icon">
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
                  statusClass = 'pcb-burst-active';
                }

                return (
                  <div key={i} className={`pcb-burst-item ${statusClass}`}>
                    <span className="pcb-burst-status flex items-center justify-center">{statusIcon}</span>
                    <span className="pcb-burst-type">{b.type}</span>
                    <span className="pcb-burst-duration">{b.duration}t</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PcbInspector;
