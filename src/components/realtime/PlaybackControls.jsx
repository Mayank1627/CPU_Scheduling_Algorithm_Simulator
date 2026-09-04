/**
 * PlaybackControls — Professional debugger-style toolbar.
 *
 * Features:
 * - Large, prominent digital clock readout (center)
 * - Solid primary Play/Pause button
 * - Ghost secondary Step/Reset buttons
 * - Segmented speed toggle control
 * - Clean SVG icons, zero emojis
 */

const SPEEDS = ['0.25x', '0.5x', '1x'];

function PlaybackControls({
    currentTime,
    isRunning,
    isComplete,
    speed,
    onPlay,
    onPause,
    onStep,
    onStepBack,
    onReset,
    onSetSpeed,
}) {
    const timeStr = String(currentTime).padStart(2, '0');

    return (
        <div className="w-full flex items-center justify-between">
            {/* 1. Transport controls — Left */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onStepBack}
                    disabled={currentTime === 0 || isRunning}
                    className="p-2 neu-btn btn-step text-white disabled:opacity-50 disabled:shadow-none"
                    title="Step Back"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ffffff' }}>
                        <polygon points="19 20 9 12 19 4 19 20" fill="#ffffff" />
                        <line x1="5" y1="19" x2="5" y2="5" stroke="#ffffff" strokeWidth="3" />
                    </svg>
                </button>

                {!isRunning ? (
                    <button
                        onClick={onPlay}
                        disabled={isComplete}
                        className="px-6 py-2 neu-btn-primary btn-play flex items-center gap-2 font-bold disabled:opacity-50 disabled:shadow-none"
                        style={{
                            backgroundColor: '#73E3E6',
                            color: '#0f172a'
                        }}
                        title="Play"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        Play
                    </button>
                ) : (
                    <button
                        onClick={onPause}
                        className="px-6 py-2 neu-pressed flex items-center gap-2 text-amber-600 font-bold"
                        title="Pause"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                        Pause
                    </button>
                )}

                <button
                    onClick={onStep}
                    disabled={isComplete || isRunning}
                    className="p-2 neu-btn btn-step text-white disabled:opacity-50 disabled:shadow-none"
                    title="Step Forward"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ffffff' }}>
                        <polygon points="5 4 15 12 5 20 5 4" fill="#ffffff" />
                        <line x1="19" y1="5" x2="19" y2="19" stroke="#ffffff" strokeWidth="3" />
                    </svg>
                </button>

                <button
                    onClick={onReset}
                    className="p-2 neu-btn text-red-400 hover:text-red-500 ml-2"
                    title="Reset"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                    </svg>
                </button>
            </div>

            {/* 2. Clock — Exact Center */}
            <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Time</span>
                <div className="flex gap-1">
                    {timeStr.split('').map((ch, i) => (
                        <span key={i} className="neu-pressed w-10 h-12 flex items-center justify-center text-2xl font-extrabold text-slate-200 font-['JetBrains_Mono']">
                            {ch}
                        </span>
                    ))}
                </div>
            </div>

            {/* 3. Speed & Status — Exact Right */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Speed</span>
                    <div className="neu-pressed p-1 flex rounded-xl">
                        {SPEEDS.map((s) => (
                            <button
                                key={s}
                                onClick={() => onSetSpeed(s)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                    speed === s
                                        ? 'speed-btn-active font-extrabold'
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                                style={
                                    speed === s
                                        ? { backgroundColor: '#f1f5f9', color: '#000000' }
                                        : {}
                                }
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Status indicator */}
                {isComplete && (
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                        DONE
                    </div>
                )}
            </div>
        </div>
    );
}

export default PlaybackControls;
