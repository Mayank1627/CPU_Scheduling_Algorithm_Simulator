function ComparisonTable({ results }) {
    if (!results || results.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-700 uppercase tracking-wide">
                    Algorithm Comparison
                </h2>
            </div>

            <div className="overflow-x-auto w-full">
                <table className="w-full table-fixed text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase font-bold tracking-wider border-b-2 border-[#d1d9e6]">
                        <tr>
                            <th className="px-4 py-3">Algorithm</th>
                            <th className="px-4 py-3">Avg Waiting Time</th>
                            <th className="px-4 py-3">Avg Turnaround Time</th>
                            <th className="px-4 py-3">CPU Utilization (%)</th>
                            <th className="px-4 py-3">Throughput</th>
                        </tr>
                    </thead>

                    <tbody className="text-slate-700 font-medium">
                        {results.map((r) => (
                            <tr
                                key={r.algorithm}
                                className="border-b border-[#d1d9e6]/50 hover:bg-[#d1d9e6]/20 transition"
                            >
                                <td className="px-4 py-4 font-extrabold">
                                    {r.algorithm}
                                </td>

                                <td className="px-4 py-4 font-['JetBrains_Mono']">
                                    {r.averageWaitingTime.toFixed(2)}
                                </td>

                                <td className="px-4 py-4 font-['JetBrains_Mono']">
                                    {r.averageTurnaroundTime.toFixed(2)}
                                </td>

                                <td className="px-4 py-4 font-['JetBrains_Mono']">
                                    {r.cpuUtilization.toFixed(2)}
                                </td>

                                <td className="px-4 py-4 font-['JetBrains_Mono']">
                                    {r.throughput.toFixed(4)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ComparisonTable;
