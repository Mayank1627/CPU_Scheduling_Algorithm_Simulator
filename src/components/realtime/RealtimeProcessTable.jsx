/**
 * RealtimeProcessTable — displays added processes for real-time mode.
 *
 * Shows PID, Arrival Time, Color, and the full burst sequence as visual tags.
 */

function RealtimeProcessTable({ processes, onDeleteProcess, onClearAll, readOnly }) {
    if (processes.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500 font-bold uppercase tracking-widest text-sm">
                No processes added yet.
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            {!readOnly && (
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-slate-700 uppercase tracking-wide">
                        Process List ({processes.length})
                    </h2>
                    <button
                        onClick={onClearAll}
                        className="text-xs px-4 py-2 font-bold neu-btn text-red-500 hover:text-red-600 transition"
                    >
                        Clear All
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto w-full">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase font-bold tracking-wider border-b-2 border-[#d1d9e6]">
                        <tr>
                            <th className="px-4 py-3">PID</th>
                            <th className="px-4 py-3">Arrival</th>
                            <th className="px-4 py-3">Burst Sequence</th>
                            {!readOnly && <th className="px-4 py-3 text-right">Action</th>}
                        </tr>
                    </thead>

                    <tbody className="text-slate-700 font-medium">
                        {processes.map((p) => (
                            <tr
                                key={p.pid}
                                className="border-b border-[#d1d9e6]/50 hover:bg-[#d1d9e6]/20 transition"
                            >
                                <td className="px-4 py-4 font-extrabold font-['JetBrains_Mono']">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className="w-4 h-4 rounded-md neu-extruded"
                                            style={{ backgroundColor: p.color }}
                                        />
                                        {p.pid}
                                    </div>
                                </td>

                                <td className="px-4 py-4 font-['JetBrains_Mono']">
                                    {p.arrivalTime}
                                </td>

                                <td className="px-4 py-4">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        {p.bursts.map((burst, idx) => (
                                            <span key={idx} className="flex items-center gap-1">
                                                {idx > 0 && (
                                                    <span className="text-slate-400 font-bold mx-0.5 text-xs">→</span>
                                                )}
                                                <span
                                                    className={`
                                                        inline-block px-2 py-1 rounded-md text-xs font-bold neu-pressed
                                                        ${burst.type === 'CPU' ? 'text-emerald-600' : 'text-amber-600'}
                                                    `}
                                                >
                                                    {burst.type}:{burst.duration}
                                                </span>
                                            </span>
                                        ))}
                                    </div>
                                </td>

                                {!readOnly && (
                                    <td className="px-4 py-4 text-right">
                                        <button
                                            onClick={() => onDeleteProcess(p.pid)}
                                            className="px-3 py-1.5 text-xs font-bold rounded-lg neu-btn text-red-500"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default RealtimeProcessTable;
