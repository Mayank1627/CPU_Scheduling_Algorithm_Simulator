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
    let starvationStyle = {};
    if (waitingTime >= 5 && isInReady) {
        const excess = waitingTime - 5; // 0 at exactly 5s
        const level = Math.min(excess, 5); // cap at 5 extra levels
        // Interpolate yellow (#fbbf24) → red (#ef4444)
        const r = Math.round(251 + (239 - 251) * (level / 5));
        const g = Math.round(191 - 191 * (level / 5));
        const b_val = Math.round(36 + (68 - 36) * (level / 5));
        const colorVal = `rgb(${r}, ${g}, ${b_val})`;
        starvationStyle = {
            boxShadow: `0 0 10px ${colorVal}, inset 0 0 4px ${colorVal}`,
            borderColor: colorVal,
            color: colorVal
        };
    }

    return (
        <div
            className={`relative flex flex-col min-w-[120px] rounded-lg overflow-hidden transition-transform duration-150 cursor-pointer ${isSelected ? 'ring-2 ring-blue-400' : ''} ${onClick ? 'hover:-translate-y-0.5' : ''} neu-extruded`}
            onClick={onClick}
            style={{
                viewTransitionName: `process-${pid}`,
                ...starvationStyle
            }}
        >
            <div className="flex items-stretch min-h-[40px]">
                {/* Color PID Block */}
                <div className="flex items-center justify-center px-3 font-['JetBrains_Mono'] text-sm font-extrabold text-slate-800" style={{ backgroundColor: color }}>
                    {pid}
                </div>

                <div className="flex items-center gap-1.5 px-2 py-1 flex-1 bg-transparent">
                    {/* Burst info */}
                    {!isTerminated && currentBurst && (
                        <span className="font-['JetBrains_Mono'] text-[10px] font-bold bg-gray-100 text-black px-1.5 py-0.5 rounded-sm" style={{ backgroundColor: '#f3f4f6', color: '#000000' }}>
                            {burstLabel}
                        </span>
                    )}
                    {isTerminated && (
                        <svg className="shrink-0 ml-auto" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    )}
                </div>
            </div>

            {/* Waiting time indicator — only in Ready Queue */}
            {waitingTime > 0 && isInReady && (
                <div
                    className="flex items-center gap-1 px-2 py-1 font-['JetBrains_Mono'] text-[10px] font-bold tracking-wider border-t border-slate-700/50 bg-[#0f172a]"
                    style={{
                        color: starvationStyle.color || '#ffffff'
                    }}
                >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    WAIT: {waitingTime}s
                    {waitingTime >= 5 && (
                        <span
                            className="ml-1 px-1 text-[8px] font-extrabold uppercase rounded-sm border text-white"
                            style={{
                                borderColor: starvationStyle.color,
                                backgroundColor: starvationStyle.color ? `${starvationStyle.color.replace('rgb', 'rgba').replace(')', ', 0.2)')}` : 'rgba(239, 68, 68, 0.2)'
                            }}
                        >
                            STARVING
                        </span>
                    )}
                </div>
            )}

            {/* Progress bar */}
            {showProgress && bursts && bursts.length > 0 && (
                <div className="h-[3px] bg-slate-200 overflow-hidden">
                    <div
                        className="h-full bg-emerald-500 transition-[width] duration-250 ease-linear shadow-[0_0_6px_rgba(16,185,129,0.5)]"
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
