function ProcessStatsTable({ processes }) {
    if (!processes || processes.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-700 uppercase tracking-wide">
                    Per-Process Statistics
                </h2>
            </div>

            <div className="overflow-x-auto w-full">
                <table className="w-full table-fixed text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase font-bold tracking-wider border-b-2 border-[#d1d9e6]">
                        <tr>
                            <th className="px-4 py-3">PID</th>
                            <th className="px-4 py-3">Arrival</th>
                            <th className="px-4 py-3">Burst</th>
                            <th className="px-4 py-3">Completion</th>
                            <th className="px-4 py-3">Waiting</th>
                            <th className="px-4 py-3">Turnaround</th>
                        </tr>
                    </thead>

                    <tbody className="text-slate-700 font-medium">
                        {processes.map((p) => (
                            <tr
                                key={p.id}
                                className="border-b border-[#d1d9e6]/50 hover:bg-[#d1d9e6]/20 transition"
                            >
                                <td className="px-4 py-4 font-extrabold font-['JetBrains_Mono']">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className="w-4 h-4 rounded-md neu-extruded"
                                            style={{ backgroundColor: p.color }}
                                        />
                                        {p.id}
                                    </div>
                                </td>

                                <td className="px-4 py-4 font-['JetBrains_Mono']">
                                    {p.arrivalTime}
                                </td>
                                <td className="px-4 py-4 font-['JetBrains_Mono']">
                                    {p.burstTime}
                                </td>
                                <td className="px-4 py-4 font-['JetBrains_Mono']">
                                    {p.completionTime}
                                </td>
                                <td className="px-4 py-4 font-['JetBrains_Mono']">
                                    {p.waitingTime}
                                </td>
                                <td className="px-4 py-4 font-['JetBrains_Mono']">
                                    {p.turnaroundTime}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ProcessStatsTable;
