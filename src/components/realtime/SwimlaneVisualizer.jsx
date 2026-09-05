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
            <div className={`rt-lane rt-lane-${laneKey} ${isActive ? 'rt-lane-active' : ''} neu-pressed rounded-xl p-3 flex flex-col h-auto bg-transparent`}>
                <div className="flex items-center gap-2 mb-3 text-slate-200 font-bold text-xs tracking-wider uppercase shrink-0">
                    <span className="text-slate-300"><Icon /></span>
                    <span>{meta.label}</span>
                    {processes.length > 0 && (
                        <span className="ml-auto neu-extruded px-2 py-0.5 rounded text-[10px] text-slate-700">{processes.length}</span>
                    )}
                </div>
                <div className="flex flex-col gap-2 pb-2">
                    {processes.length === 0 ? (
                        laneKey === 'running' && snapshot.currentTime > 0 && !snapshot.isComplete ? (
                            <div className="rt-idle-text flex items-center justify-center font-bold uppercase tracking-widest text-m py-4" style={{ color: '#FFBF00' }}>IDLE</div>
                        ) : (
                            <span className="text-slate-400 text-xs italic">{meta.emptyText}</span>
                        )
                    ) : (
                        <div className="flex flex-col gap-2">
                            {processes.map((proc, idx) => (
                                <div key={proc.pid} className="flex flex-col items-center">
                                    <ProcessCard
                                        process={proc}
                                        showProgress={shouldShowProgress(laneKey)}
                                        isSelected={selectedPid === proc.pid}
                                        onClick={() => onSelectProcess(proc.pid)}
                                    />
                                    {laneKey === 'terminated' && idx < processes.length - 1 && (
                                        <div className="text-slate-400 my-2">
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
        <div className="flex-1 flex flex-col gap-5 min-h-0">
            {/* ── Playback Control Bar (inline, not portaled) ──────── */}
            <div className="rt-playback-bar shrink-0">
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
            </div>

            {/* ── Process States — Spatial Grid Layout ──────────────── */}
            <div className="rt-simulation-canvas flex-1 flex flex-col gap-4 min-h-0">
                {/* Schematic Heading */}
                <div 
                    className="absolute top-4 left-4 font-['JetBrains_Mono'] text-[0.8rem] uppercase tracking-[1.5px] text-slate-200 font-bold z-10 pointer-events-none"
                >
                    PROCESS STATES
                </div>

                <div className="rt-states-grid flex-1 min-h-0 mt-8">
                    {/* Left column */}
                    <div className="rt-grid-left">
                        {renderLane('arriving')}
                        <div className="rt-grid-arrow rt-arrow-down text-slate-300">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
                        </div>
                        {renderLane('readyQueue')}
                    </div>

                    {/* Center — arrows + CPU */}
                    <div className="rt-grid-arrow rt-arrow-right text-slate-300" style={{ alignSelf: 'start', marginTop: '140px' }}>
                        <span className="rt-arrow-label text-slate-200 font-bold uppercase tracking-wider text-[10px] mb-1 relative left-4">dispatch</span>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: 'rotate(-45deg)' }}>
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </div>

                    <div className="rt-grid-center mt-20" style={{ flexDirection: 'column', justifyContent: 'center' }}>
                        {renderLane('running')}
                        {/* I/O Blocked — below CPU */}
                        <div className="rt-grid-bottom mt-10">
                            <div className="rt-grid-arrow-group text-slate-300">
                                <div className="rt-grid-arrow rt-arrow-down">
                                    <span className="rt-arrow-label text-slate-200 font-bold uppercase tracking-wider text-[10px] mb-2">I/O wait</span>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
                                </div>
                            </div>
                            <div className="flex-1">
                                {renderLane('blocked')}
                            </div>
                            <div className="rt-grid-arrow-group text-slate-300">
                                <div className="rt-grid-arrow rt-arrow-up">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                                    <span className="rt-arrow-label text-slate-200 font-bold uppercase tracking-wider text-[10px]">I/O done</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Exit arrow */}
                    <div className="rt-grid-arrow rt-arrow-right text-slate-300" style={{ alignSelf: 'start', marginTop: '140px' }}>
                        <span className="rt-arrow-label text-slate-200 font-bold uppercase tracking-wider text-[10px] mb-1">exit</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </div>

                    {/* Right column — Terminated */}
                    <div className="rt-grid-right mt-12">
                        {renderLane('terminated')}
                    </div>
                </div>
            </div>

            {/* ── Event Log ────────────────────────────────────────── */}
            <div className="shrink-0 h-64 rt-event-log-wrapper">
                <EventLog events={snapshot.events} />
            </div>
        </div>
    );
}

export default SwimlaneVisualizer;
