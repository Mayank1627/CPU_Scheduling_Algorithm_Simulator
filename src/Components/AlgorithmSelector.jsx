import { useState } from "react";
const ALGORITHMS = [
  {
    id: "FCFS",
    name: "FCFS",
    fullName: "First Come First Serve",
    description: "Processes are executed in the order they arrive in the ready queue.",
    type: "Non-Preemptive",
    details: [
      "CPU is allocated in arrival order",
      "Simple and easy to implement",
      "May cause long waiting time (convoy effect)",
    ],
  },
  {
    id: "SJF",
    name: "SJF",
    fullName: "Shortest Job First",
    description: "The process with the smallest burst time is executed first.",
    type: "Non-Preemptive",
    details: [
      "Selects process with minimum burst time",
      "Optimal for minimizing average waiting time",
      "Requires knowledge of burst time in advance",
    ],
  },
  {
    id: "SRTF",
    name: "SRTF",
    fullName: "Shortest Remaining Time First",
    description: "CPU is always allocated to the process with the least remaining time.",
    type: "Preemptive",
    details: [
      "Preemptive version of SJF",
      "Currently running process can be interrupted",
      "Provides better response time",
    ],
  },
  {
    id: "RR",
    name: "Round Robin",
    fullName: "Round Robin Scheduling",
    description: "Each process gets CPU time in fixed time slices in a cyclic order.",
    type: "Preemptive",
    details: [
      "Each process gets a fixed time quantum",
      "Fair scheduling for time-sharing systems",
      "Performance depends heavily on time quantum",
    ],
  },
  {
    id: "Priority",
    name: "Priority Scheduling",
    fullName: "Priority Scheduling",
    description: "CPU is allocated based on process priority values.",
    type: "Preemptive / Non-Preemptive",
    details: [
      "Higher priority processes execute first",
      "Can be preemptive or non-preemptive",
      "May cause starvation without aging",
    ],
  },
];


function AlgorithmSelector({ selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const selectedAlgo = ALGORITHMS.find(a => a.id === selected);

  return (
    <div className="space-y-8 shadow-xl">
      {/* Select Algorithm Button */}
      <div
        onClick={() => setOpen(!open)}
        className="
      cursor-pointer mt-4 rounded-xl bg-blue-600 px-6 py-5 text-center
      shadow-xl hover:shadow-2xl hover:bg-slate-700
      ring-1 ring-slate-700 transition-all 
    ">
        <p className="text-lg font-semibold text-gray-300">
          {selectedAlgo ? "Selected Algorithm" : "Select Scheduling Algorithm"}
        </p>

          {selectedAlgo && (
      <div className="mt-4 text-left">
        <p className="text-2xl font-extrabold text-gray-100 text-center">
          {selectedAlgo.fullName}
        </p>

        <ul className="mt-4 space-y-2 text-sm text-gray-200 list-disc list-inside">
          {selectedAlgo.details.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
      </div>
    )}

      </div>

      {/* Algorithm List */}
      {open && (
        <div className="space-y-4">
          {ALGORITHMS.map(algo => {
            const isSelected = selected === algo.id;

            return (
              <div
                key={algo.id}
                onClick={() => {
                  onSelect(algo.id);
                  setOpen(false);
                }}
                className={`
                  relative cursor-pointer rounded-xl px-6 py-5 transition-all
                  ${
                    isSelected
                      ? "bg-slate-300 text-slate-900 shadow-xl"
                      : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                  }
                `}
              >
                {/* Preemptive tag */}
                <span
                  className={`
                    absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-full
                    ${
                      algo.type.includes("Preemptive")
                        ? "bg-purple-500/20 text-white-800"
                        : "bg-emerald-500/20 text-emerald-300"
                    }
                  `}
                >
                  {algo.type}
                </span>

                <h3 className="text-xl font-bold tracking-tight">
                  {algo.name}
                </h3>

                <p className="mt-2 text-sm leading-relaxed max-w-3xl">
                  {algo.description}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div className="h-8" />
    </div>
  );
}

export default AlgorithmSelector;
