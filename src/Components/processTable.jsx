function ProcessTable({ processes, onDeleteProcess, onClearAll }) {
  if (processes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 font-semibold bg-slate-50 p-8 text-center text-gray-800">
        No processes added yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-600 flex justify-between items-center">
        <h2 className="text-lg font-bold text-white ml-[45%]">
          Process List
        </h2>

        <button
          onClick={onClearAll}
          className="text-sm px-4 py-2 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 transition"
        >
          Clear All
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-m">
          <thead className="bg-slate-700 text-slate-100">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">PID</th>
              <th className="px-6 py-3 text-left font-semibold">Arrival</th>
              <th className="px-6 py-3 text-left font-semibold">Burst</th>
              <th className="px-6 py-3 text-left font-semibold">Priority</th>
              <th className="px-6 py-3 text-left font-semibold">Color</th>
              <th className="px-6 py-3 text-right font-semibold"></th>
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
                  <span
                    className="inline-block h-4 w-4 rounded"
                    style={{ backgroundColor: p.color }}
                  />
                </td>

                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onDeleteProcess(p.id)}
                    className="px-3 py-1 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
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
