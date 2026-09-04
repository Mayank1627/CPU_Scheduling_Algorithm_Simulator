function GanttChart({ timeline }) {
    if (!timeline || timeline.length === 0) {
        return null;
    }

    const totalTime = timeline[timeline.length - 1].end - timeline[0].start;

    // Layout constants
    const SVG_BASE_WIDTH = 900;
    const LEFT_PADDING = 30; // ✅ FIX: prevents clipping of "0"
    const BAR_HEIGHT = 50;
    const TOP_MARGIN = 20;
    const AXIS_Y = TOP_MARGIN + BAR_HEIGHT + 10;
    const LABEL_Y = AXIS_Y + 15;

    // Scale adjusted for left padding
    const SCALE = (SVG_BASE_WIDTH - LEFT_PADDING) / totalTime;

    // Integer time ticks
    const ticks = Array.from({ length: totalTime + 1 }, (_, i) => i);

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-lg font-bold text-slate-700 uppercase tracking-wide mb-6 text-center">
                Gantt Chart
            </h2>

            <div className="overflow-x-auto w-full flex-1 flex items-center justify-center neu-pressed rounded-xl p-4">
                <svg
                    width="100%"
                    height={LABEL_Y + 24}
                    viewBox={`0 0 ${SVG_BASE_WIDTH} ${LABEL_Y + 24}`}
                    preserveAspectRatio="xMinYMin meet"
                >
                    {/* Process bars */}
                    {timeline.map((block, index) => {
                        const x = LEFT_PADDING + block.start * SCALE;
                        const width = (block.end - block.start) * SCALE;
                        const isIdle = block.pid === "IDLE";

                        return (
                            <g key={index}>
                                <rect
                                    x={x}
                                    y={TOP_MARGIN}
                                    width={width}
                                    height={BAR_HEIGHT}
                                    fill={isIdle ? "#B5BAC4" : block.color}
                                    opacity={1}
                                    stroke={isIdle ? "#cbd5e1" : "rgba(0,0,0,0.1)"}
                                    strokeWidth="2"
                                    rx={8}
                                    className={!isIdle ? "drop-shadow-sm" : ""}
                                >
                                    {/* Tooltip */}
                                    <title>
                                        {`${block.pid}
Start: ${block.start}
End: ${block.end}
Duration: ${block.end - block.start}`}
                                    </title>
                                </rect>

                                {/* Process label */}
                                <text
                                    x={x + width / 2}
                                    y={TOP_MARGIN + BAR_HEIGHT / 2}
                                    fill={isIdle ? "#334155" : "#ffffff"}
                                    fontSize="14"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    pointerEvents="none"
                                >
                                    {block.pid}
                                </text>
                            </g>
                        );
                    })}

                    {/* X-axis */}
                    <line
                        x1={LEFT_PADDING}
                        y1={AXIS_Y}
                        x2={SVG_BASE_WIDTH}
                        y2={AXIS_Y}
                        stroke="#94a3b8"
                        strokeWidth="2"
                    />

                    {/* Time ticks + labels */}
                    {ticks.map((t) => {
                        const x = LEFT_PADDING + t * SCALE;
                        return (
                            <g key={t}>
                                <line
                                    x1={x}
                                    y1={AXIS_Y}
                                    x2={x}
                                    y2={AXIS_Y + 6}
                                    stroke="#94a3b8"
                                />
                                <text
                                    x={x}
                                    y={LABEL_Y}
                                    fill="#64748b"
                                    fontSize="12"
                                    fontWeight="bold"
                                    fontFamily="JetBrains Mono"
                                    textAnchor="middle"
                                >
                                    {t}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
}

export default GanttChart;
