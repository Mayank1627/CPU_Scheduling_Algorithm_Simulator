function ProcessTable({ processes }) {
  if (processes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 font-semibold bg-slate-50 p-8 text-center text-gray-800">
        No processes added yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4  border-slate-200 bg-gray-600">
        <h2 className="text-lg font-bold text-white text-center">
          Process List
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-m ">
          <thead className="bg-slate-700 text-slate-100">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">PID</th>
              <th className="px-6 py-3 text-left font-semibold">Arrival</th>
              <th className="px-6 py-3 text-left font-semibold">Burst</th>
              <th className="px-6 py-3 text-left font-semibold">Priority</th>
              <th className="px-6 py-3 text-left font-semibold">Color</th>
            </tr>
          </thead>

          <tbody>
            {processes.map((p) => (
              <tr
                key={p.id}
                className="border-t border-slate-200 hover:bg-slate-50 transition"
              >
                <td className="px-6 py-4 font-bold text-slate-800">
                  {p.id}
                </td>
                <td className="px-6 py-4 text-slate-700 font-semibold">
                  {p.arrivalTime}
                </td>
                <td className="px-6 py-4 text-slate-700 font-semibold">
                  {p.burstTime}
                </td>
                <td className="px-6 py-4 text-slate-700 font-semibold">
                  {p.priority ?? "N/A"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 font-semibold">
                    <span
                      className="h-4 w-4 rounded"
                      style={{ backgroundColor: p.color }}
                    />
                    
                  </div>
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
