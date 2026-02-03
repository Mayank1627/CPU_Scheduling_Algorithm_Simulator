const ALGORITHMS = [
  { id: "FCFS", label: "FCFS", description: "First Come First Serve" },
  { id: "SJF", label: "SJF", description: "Shortest Job First" },
  { id: "SRTF", label: "SRTF", description: "Shortest Remaining Time First" },
  { id: "RR", label: "RR", description: "Round Robin" },
  { id: "PRIORITY", label: "Priority", description: "Priority Scheduling" },
];

function AlgorithmSelector({ selected, onSelect }) {
  return (
    <div>
        
      <h2 className="text-lg font-semibold text-slate-800 mb-3">
        Select Scheduling Algorithm
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ALGORITHMS.map((algo) => {
          const isActive = selected === algo.id;

          return (
            <button
              key={algo.id}
              onClick={() => onSelect(algo.id)}
              className={`
                border rounded-lg p-4 text-left transition-all
                ${
                  isActive
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                }
              `}
            >
              <div className="font-medium text-slate-800">
                {algo.label}
              </div>
              <div className="text-sm text-slate-600">
                {algo.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default AlgorithmSelector;
