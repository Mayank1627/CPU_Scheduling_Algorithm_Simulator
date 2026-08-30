/**
 * RealtimeProcessTable — displays added processes for real-time mode.
 *
 * Shows PID, Arrival Time, Color, and the full burst sequence as visual tags.
 */

function RealtimeProcessTable({ processes, onDeleteProcess, onClearAll }) {
    if (processes.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-slate-600 font-semibold bg-slate-800/50 p-8 text-center text-slate-400">
                No processes added yet. Use the form to add processes with burst sequences.
            </div>
        );
    }

    return (
        <div className="bg-slate-900 rounded-xl shadow-lg overflow-hidden border border-slate-700/50">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-800 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-100">
                    Process List ({processes.length})
                </h2>
                <button
                    onClick={onClearAll}
                    className="text-sm px-4 py-2 rounded-lg font-semibold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition"
                >
                    Clear All
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-800/50 text-slate-300">
                        <tr>
                            <th className="px-5 py-3 text-left font-semibold">PID</th>
                            <th className="px-5 py-3 text-left font-semibold">Arrival</th>
                            <th className="px-5 py-3 text-left font-semibold">Burst Sequence</th>
                            <th className="px-5 py-3 text-right font-semibold"></th>
                        </tr>
                    </thead>

                    <tbody>
                        {processes.map((p) => (
                            <tr
                                key={p.pid}
                                className="border-t border-slate-700/50 hover:bg-slate-800/30 transition"
                            >
                                <td className="px-5 py-3 font-bold text-slate-100">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="w-3 h-3 rounded"
                                            style={{ backgroundColor: p.color }}
                                        />
                                        {p.pid}
                                    </div>
                                </td>

                                <td className="px-5 py-3 text-slate-300 font-semibold">
                                    {p.arrivalTime}
                                </td>

                                <td className="px-5 py-3">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        {p.bursts.map((burst, idx) => (
                                            <span key={idx} className="flex items-center gap-0.5">
                                                {idx > 0 && (
                                                    <span className="text-slate-600 mx-0.5 text-xs">→</span>
                                                )}
                                                <span
                                                    className={`
                            inline-block px-2 py-0.5 rounded text-xs font-bold
                            ${burst.type === 'CPU'
                                                            ? 'bg-emerald-500/20 text-emerald-400'
                                                            : 'bg-amber-500/20 text-amber-400'
                                                        }
                          `}
                                                >
                                                    {burst.type}:{burst.duration}
                                                </span>
                                            </span>
                                        ))}
                                    </div>
                                </td>

                                <td className="px-5 py-3 text-right">
                                    <button
                                        onClick={() => onDeleteProcess(p.pid)}
                                        className="px-3 py-1 text-xs rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition font-semibold"
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default RealtimeProcessTable;
