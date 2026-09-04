function ProcessTable({ processes, selectedAlgorithm, timeQuantum, onDeleteProcess, onClearAll }) {
    if (processes.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500 font-bold uppercase tracking-widest text-sm">
                No processes added yet.
            </div>
        );
    }

    const isPriorityAlgo = selectedAlgorithm === "Priority";
    const isRR = selectedAlgorithm === "RR";

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-slate-700 uppercase tracking-wide">
                    Process List
                </h2>

                <button
                    onClick={onClearAll}
                    className="text-xs px-4 py-2 font-bold neu-btn text-red-500 hover:text-red-600 transition"
                >
                    Clear All
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto w-full">
                <table className="w-full table-fixed text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase font-bold tracking-wider border-b-2 border-[#d1d9e6]">
                        <tr>
                            <th className="px-4 py-3">PID</th>
                            <th className="px-4 py-3">Arrival</th>
                            <th className="px-4 py-3">Burst</th>
                            {isPriorityAlgo && <th className="px-4 py-3">Priority</th>}
                            {isRR && <th className="px-4 py-3">Time Quantum</th>}
                            <th className="px-4 py-3">Color</th>
                            <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                    </thead>

                    <tbody className="text-slate-700 font-medium">
                        {processes.map((p) => (
                            <tr
                                key={p.id}
                                className="border-b border-[#d1d9e6]/50 hover:bg-[#d1d9e6]/20 transition"
                            >
                                <td className="px-4 py-4 font-extrabold font-['JetBrains_Mono']">
                                    {p.id}
                                </td>
                                <td className="px-4 py-4 font-['JetBrains_Mono']">
                                    {p.arrivalTime}
                                </td>
                                <td className="px-4 py-4 font-['JetBrains_Mono']">
                                    {p.burstTime}
                                </td>
                                {isPriorityAlgo && (
                                    <td className="px-4 py-4 font-['JetBrains_Mono']">
                                        {p.priority ?? "—"}
                                    </td>
                                )}
                                {isRR && (
                                    <td className="px-4 py-4 font-['JetBrains_Mono']">
                                        {timeQuantum}
                                    </td>
                                )}
                                <td className="px-4 py-4">
                                    <span
                                        className="inline-block h-5 w-5 rounded-md neu-extruded"
                                        style={{ backgroundColor: p.color }}
                                    />
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <button
                                        onClick={() => onDeleteProcess(p.id)}
                                        className="px-3 py-1.5 text-xs font-bold rounded-lg neu-btn text-red-500"
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

export default ProcessTable;
