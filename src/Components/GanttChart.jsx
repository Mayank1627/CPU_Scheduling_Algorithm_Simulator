function GanttChart({ timeline }) {
  if (!timeline || timeline.length === 0) {
    return null;
  }

  // Total simulation time
  const totalTime = timeline[timeline.length - 1].end;

  // SVG sizing
  const SVG_WIDTH = 900;
  const BAR_HEIGHT = 50;
  const SCALE = SVG_WIDTH / totalTime;

  return (
    <div className="bg-slate-900 p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold text-slate-100 mb-4 text-center">
        Gantt Chart
      </h2>

      <svg
        width="100%"
        height={BAR_HEIGHT + 40}
        viewBox={`0 0 ${SVG_WIDTH} ${BAR_HEIGHT + 40}`}
      >
        {/* Process bars */}
        {timeline.map((block, index) => {
          const x = block.start * SCALE;
          const width = (block.end - block.start) * SCALE;

          return (
            <g key={index}>
              <rect
                x={x}
                y={20}
                width={width}
                height={BAR_HEIGHT}
                fill={block.color}
                stroke="#020617"
              />

              {/* Process ID */}
              <text
                x={x + width / 2}
                y={50}
                fill="#020617"
                fontSize="14"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {block.pid}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default GanttChart;
