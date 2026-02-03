function ProcessTable({ processes }) {
  if (processes.length === 0) {
    return (
      <div className="text-center text-slate-500 py-6">
        No processes added yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">
              PID
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">
              Arrival Time
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">
              Burst Time
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">
              Priority
            </th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">
              Color
            </th>
          </tr>
        </thead>

        <tbody>
          {processes.map((p) => (
            <tr
              key={p.id}
              className="border-t border-slate-200 hover:bg-slate-50"
            >
              <td className="px-4 py-3 font-medium text-slate-800">
                {p.id}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {p.arrivalTime}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {p.burstTime}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {p.priority ?? "—"}
              </td>
              <td className="px-4 py-3">
                <div
                  className="h-4 w-4 rounded"
                  style={{ backgroundColor: p.color }}
                  title={p.color}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProcessTable;
