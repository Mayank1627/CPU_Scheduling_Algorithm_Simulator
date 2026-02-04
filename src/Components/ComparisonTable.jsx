function ComparisonTable({ results }) {
  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 bg-slate-700">
        <h2 className="text-lg font-bold text-white text-center">
          Algorithm Comparison
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-m">
          <thead className="bg-slate-800 text-slate-100">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Algorithm</th>
              <th className="px-6 py-3 text-left font-semibold">
                Avg Waiting Time
              </th>
              <th className="px-6 py-3 text-left font-semibold">
                Avg Turnaround Time
              </th>
              <th className="px-6 py-3 text-left font-semibold">
                CPU Utilization (%)
              </th>
              <th className="px-6 py-3 text-left font-semibold">
                Throughput
              </th>
            </tr>
          </thead>

          <tbody className = "text-lg">
            {results.map((r) => (
              <tr
                key={r.algorithm}
                className="border-t border-slate-200 hover:bg-slate-50 transition"
              >
                <td className="px-6 py-4 font-bold text-slate-800">
                  {r.algorithm}
                </td>

                <td className="px-6 py-4 font-semibold text-slate-700">
                  {r.averageWaitingTime.toFixed(2)}
                </td>

                <td className="px-6 py-4 font-semibold text-slate-700">
                  {r.averageTurnaroundTime.toFixed(2)}
                </td>

                <td className="px-6 py-4 font-semibold text-slate-700">
                  {r.cpuUtilization.toFixed(2)}
                </td>

                <td className="px-6 py-4 font-semibold text-slate-700">
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
