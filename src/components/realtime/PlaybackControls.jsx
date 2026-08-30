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
        <div className="rt-playback-bar">
            {/* Transport controls — left */}
            <div className="rt-transport">
                {!isRunning ? (
                    <button
                        onClick={onPlay}
                        disabled={isComplete}
                        className="rt-btn rt-btn-play"
                        title="Play"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        Play
                    </button>
                ) : (
                    <button
                        onClick={onPause}
                        className="rt-btn rt-btn-pause"
                        title="Pause"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                        Pause
                    </button>
                )}

                <button
                    onClick={onStepBack}
                    disabled={currentTime === 0 || isRunning}
                    className="rt-btn rt-btn-step"
                    title="Step Back"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 18l-8.5-6L18 6v12zM8 6v12H6V6h2z" />
                    </svg>
                    Back
                </button>

                <button
                    onClick={onStep}
                    disabled={isComplete || isRunning}
                    className="rt-btn rt-btn-step"
                    title="Step Forward"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                    </svg>
                    Step
                </button>

                <button
                    onClick={onReset}
                    className="rt-btn rt-btn-reset"
                    title="Reset"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                    </svg>
                    Reset
                </button>
            </div>

            {/* Clock — prominent center */}
            <div className="rt-clock">
                <span className="rt-clock-label">Time : </span>
                <div className="rt-clock-readout">
                    {timeStr.split('').map((ch, i) => (
                        <span key={i} className="rt-clock-digit">{ch}</span>
                    ))}
                </div>
            </div>

            {/* Speed — segmented toggle */}
            <div className="rt-speed-group">
                <span className="rt-speed-label">SPEED</span>
                <div className="rt-speed-segmented">
                    {SPEEDS.map((s) => (
                        <button
                            key={s}
                            onClick={() => onSetSpeed(s)}
                            className={`rt-speed-seg ${speed === s ? 'rt-speed-seg-active' : ''}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Status indicator */}
            {isComplete && (
                <div className="rt-status-complete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    DONE
                </div>
            )}
        </div>
    );
}

export default PlaybackControls;
