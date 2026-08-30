/**
 * SwimlaneVisualizer — Process State Diagram spatial layout.
 *
 * Uses CSS Grid to replicate an OS Process State Diagram:
 *   - Left column: NEW (top-left), READY QUEUE (mid-left)
 *   - Center column: CPU / RUNNING (prominent center)
 *   - Bottom span: I/O BLOCKED (below CPU/Ready)
 *   - Right column: TERMINATED (far right, full height)
 *
 * Zero emojis. Clean SVG icons. Professional OS-simulator aesthetic.
 */

import ProcessCard from './ProcessCard.jsx';
import PlaybackControls from './PlaybackControls.jsx';
import EventLog from './EventLog.jsx';

/* ── SVG Icons (inline, no emojis) ────────────────────────── */
const IconNew = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
    </svg>
);
const IconReady = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
);
const IconCPU = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
    </svg>
);
const IconIO = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
);
const IconDone = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const ICON_MAP = {
    arriving: IconNew,
    readyQueue: IconReady,
    running: IconCPU,
    blocked: IconIO,
    terminated: IconDone,
};

const LANE_META = {
    arriving: { label: 'NEW', emptyText: 'No arriving processes' },
    readyQueue: { label: 'READY QUEUE', emptyText: 'Queue empty' },
    running: { label: 'CPU / RUNNING', emptyText: '' },
    blocked: { label: 'I/O BLOCKED', emptyText: 'No blocked processes' },
    terminated: { label: 'TERMINATED', emptyText: 'None' },
};

function SwimlaneVisualizer({
    snapshot,
    isRunning,
    isComplete,
    speed,
    onPlay,
    onPause,
    onStep,
    onStepBack,
    onReset,
    onSetSpeed,
    selectedPid,
    onSelectProcess,
}) {
    if (!snapshot) return null;

    const getProcessesForLane = (laneKey) => {
        switch (laneKey) {
            case 'arriving': return snapshot.arriving;
            case 'readyQueue': return snapshot.readyQueue;
            case 'running': return snapshot.running ? [snapshot.running] : [];
            case 'blocked': return snapshot.blocked;
            case 'terminated': return snapshot.terminated;
            default: return [];
        }
    };

    const shouldShowProgress = () => true;

    const renderLane = (laneKey) => {
        const processes = getProcessesForLane(laneKey);
        const meta = LANE_META[laneKey];
        const Icon = ICON_MAP[laneKey];
        const isActive = processes.length > 0;

        return (
            <div className={`rt-lane rt-lane-${laneKey} ${isActive ? 'rt-lane-active' : ''}`}>
                <div className="rt-lane-header">
                    <span className="rt-lane-icon"><Icon /></span>
                    <span className="rt-lane-label">{meta.label}</span>
                    {processes.length > 0 && (
                        <span className="rt-lane-count">{processes.length}</span>
                    )}
                </div>
                <div className="rt-lane-content">
                    {processes.length === 0 ? (
                        laneKey === 'running' && snapshot.currentTime > 0 && !snapshot.isComplete ? (
                            <div className="rt-cpu-idle">IDLE</div>
                        ) : (
                            <span className="rt-lane-empty">{meta.emptyText}</span>
                        )
                    ) : (
                        <div className={`rt-lane-processes ${laneKey === 'terminated' ? 'rt-lane-processes-vertical' : ''}`}>
                            {processes.map((proc, idx) => (
                                <div key={proc.pid} className="rt-lane-process-wrapper">
                                    <ProcessCard
                                        process={proc}
                                        showProgress={shouldShowProgress(laneKey)}
                                        isSelected={selectedPid === proc.pid}
                                        onClick={() => onSelectProcess(proc.pid)}
                                    />
                                    {laneKey === 'terminated' && idx < processes.length - 1 && (
                                        <div className="rt-terminated-arrow">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="12" y1="4" x2="12" y2="20" />
                                                <polyline points="18 14 12 20 6 14" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="rt-swimlane-container">
            {/* Playback Controls */}
            <PlaybackControls
                currentTime={snapshot.currentTime}
                isRunning={isRunning}
                isComplete={isComplete}
                speed={speed}
                onPlay={onPlay}
                onPause={onPause}
                onStep={onStep}
                onStepBack={onStepBack}
                onReset={onReset}
                onSetSpeed={onSetSpeed}
            />

            {/* ── Process States — Spatial Grid Layout ──────────────── */}
            <div className="rt-states-section">
                <h3 className="rt-states-heading">Process States</h3>
                <div className="rt-states-grid">
                    {/* Left column */}
                    <div className="rt-grid-left">
                        {renderLane('arriving')}
                        <div className="rt-grid-arrow rt-arrow-down">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
                        </div>
                        {renderLane('readyQueue')}
                    </div>

                    {/* Center — arrows + CPU */}
                    <div className="rt-grid-center">
                        <div className="rt-grid-arrow rt-arrow-right">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                            <span className="rt-arrow-label">dispatch</span>
                        </div>
                        {renderLane('running')}
                        <div className="rt-grid-arrow rt-arrow-right">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                            <span className="rt-arrow-label">exit</span>
                        </div>
                    </div>

                    {/* Right column — Terminated */}
                    <div className="rt-grid-right">
                        {renderLane('terminated')}
                    </div>
                </div>

                {/* I/O Blocked — Bottom span */}
                <div className="rt-grid-bottom">
                    <div className="rt-grid-arrow-group">
                        <div className="rt-grid-arrow rt-arrow-down">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
                            <span className="rt-arrow-label">I/O wait</span>
                        </div>
                    </div>
                    {renderLane('blocked')}
                    <div className="rt-grid-arrow-group">
                        <div className="rt-grid-arrow rt-arrow-up">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                            <span className="rt-arrow-label">I/O done</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Log */}
            <EventLog events={snapshot.events} />
        </div>
    );
}

export default SwimlaneVisualizer;
