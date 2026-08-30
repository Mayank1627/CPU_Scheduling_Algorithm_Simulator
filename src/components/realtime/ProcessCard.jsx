/**
 * ProcessCard — individual process card rendered inside state lanes.
 *
 * Shows PID, current burst info, progress bar, and starvation indicator.
 * Uses viewTransitionName for cross-lane animation.
 * Clean SVG checkmark instead of emoji. Sharp edges.
 *
 * Starvation visual levels:
 *   0-4s  → default (no indicator styling)
 *   5s    → warning (yellow border + pulse)
 *   6s+   → critical (yellow→red gradient, faster pulse)
 */

function ProcessCard({ process, showProgress = false, isSelected = false, onClick }) {
    const { pid, color, currentBurst, burstProgress, state, bursts, burstIndex, waitingTime = 0 } = process;

    let progressPercent = 0;
    if (showProgress && bursts && bursts.length > 0) {
        const totalDuration = bursts.reduce((sum, b) => sum + b.duration, 0);
        if (totalDuration > 0) {
            if (state === 'TERMINATED') {
                progressPercent = 100;
            } else {
                let completedDuration = 0;
                for (let i = 0; i < (burstIndex || 0); i++) {
                    completedDuration += bursts[i].duration;
                }
                completedDuration += (burstProgress || 0);
                progressPercent = Math.min((completedDuration / totalDuration) * 100, 100);
            }
        }
    }

    const isTerminated = state === 'TERMINATED';
    const isInReady = state === 'READY';
    const burstLabel = currentBurst
        ? `${currentBurst.type}: ${burstProgress}/${currentBurst.duration}`
        : '';

    // Starvation level calculation — only applies visually in READY state
    let starvationClass = '';
    let starvationBorderColor = undefined;
    if (waitingTime >= 5 && isInReady) {
        const excess = waitingTime - 5; // 0 at exactly 5s
        const level = Math.min(excess, 5); // cap at 5 extra levels
        if (level === 0) {
            starvationClass = 'rt-card-starving-warn';
        } else {
            starvationClass = `rt-card-starving-critical rt-card-starving-level-${level}`;
        }
        // Interpolate yellow (#fbbf24) → red (#ef4444)
        const r = Math.round(251 + (239 - 251) * (level / 5));
        const g = Math.round(191 - 191 * (level / 5));
        const b_val = Math.round(36 + (68 - 36) * (level / 5));
        starvationBorderColor = `rgb(${r}, ${g}, ${b_val})`;
    }

    return (
        <div
            className={`rt-process-card ${starvationClass} ${onClick ? 'rt-process-card-interactive' : ''} ${isSelected ? 'rt-process-card-selected' : ''}`}
            onClick={onClick}
            style={{
                '--process-color': color,
                '--starve-color': starvationBorderColor,
                viewTransitionName: `process-${pid}`,
            }}
        >
            <div className="rt-card-main">
                {/* Color PID Block */}
                <div className="rt-card-pid-block">
                    {pid}
                </div>

                <div className="rt-card-content">
                    {/* Burst info */}
                    {!isTerminated && currentBurst && (
                        <span className="rt-card-burst-info">{burstLabel}</span>
                    )}
                    {isTerminated && (
                        <svg className="rt-card-done-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    )}
                </div>
            </div>

            {/* Waiting time indicator — only in Ready Queue */}
            {waitingTime > 0 && isInReady && (
                <div className="rt-card-wait-indicator" style={starvationBorderColor ? { color: starvationBorderColor } : {}}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    WAIT: {waitingTime}s
                    {waitingTime >= 5 && <span className="rt-card-starving-label">STARVING</span>}
                </div>
            )}

            {/* Progress bar */}
            {showProgress && bursts && bursts.length > 0 && (
                <div className="rt-card-progress-track">
                    <div
                        className="rt-card-progress-fill"
                        style={{
                            width: `${progressPercent}%`
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default ProcessCard;
