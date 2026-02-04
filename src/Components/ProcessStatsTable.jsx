function ProcessStatsTable({ processes }) {
  if (!processes || processes.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-5 bg-slate-700 ">
        <h2 className="text-lg font-bold  text-white text-center">
          Per-Process Statistics
        </h2>
      </div>

      <div className="overflow-x-auto pb-2">
        <table className="w-full text-m ">
          <thead className="bg-slate-800 text-slate-100">
            <tr>
              <th className="px-6 py-3 text-left">PID</th>
              <th className="px-6 py-3 text-left">Arrival</th>
              <th className="px-6 py-3 text-left">Burst</th>
              <th className="px-6 py-3 text-left">Completion</th>
              <th className="px-6 py-3 text-left">Waiting</th>
              <th className="px-6 py-3 text-left">Turnaround</th>
            </tr>
          </thead>

          <tbody>
            {processes.map((p) => (
              <tr
                key={p.id}
                className="border-t border-slate-200 hover:bg-slate-50 transition"
              >
                <td className="px-6 py-4 font-bold text-slate-800">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: p.color }}
                    />
                    {p.id}
                  </div>
                </td>

                <td className="px-6 py-4 font-semibold text-slate-700">
                  {p.arrivalTime}
                </td>
                <td className="px-6 py-4 font-semibold text-slate-700">
                  {p.burstTime}
                </td>
                <td className="px-6 py-4 font-semibold text-slate-700">
                  {p.completionTime}
                </td>
                <td className="px-6 py-4 font-semibold text-slate-700">
                  {p.waitingTime}
                </td>
                <td className="px-6 py-4 font-semibold text-slate-700">
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
