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
        name: "Priority",
        fullName: "Preemptive Priority Scheduling",
        description: "Executes the process with the highest priority first. If a new process arrives with a higher priority, it preempts the running process.",
        type: "Preemptive",
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
        <div className="w-full flex flex-col gap-4">
            {/* Select Algorithm Button */}
            <div
                onClick={() => setOpen(!open)}
                className="algo-selector-btn cursor-pointer px-5 py-4 flex flex-col justify-center items-center text-center transition-all"
            >
                <p className={`font-bold ${selectedAlgo ? "text-xs tracking-wide uppercase" : "text-base font-extrabold"}`}>
                    {selectedAlgo ? "Selected Algorithm:" : "Select Scheduling Algorithm"}
                </p>

                {selectedAlgo && (
                    <div className="mt-1 text-center w-full">
                        <p className="text-base font-extrabold">
                            {selectedAlgo.fullName}
                        </p>
                    </div>
                )}
            </div>

            {/* Algorithm List */}
            {open && (
                <div className="flex flex-col gap-3">
                    {ALGORITHMS.map(algo => {
                        const isSelected = selected === algo.id;
                        return (
                            <div
                                key={algo.id}
                                onClick={() => {
                                    onSelect(algo.id);
                                    setOpen(false);
                                }}
                                className={`algo-card relative px-5 py-4 transition-all ${isSelected ? "selected" : ""}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="text-sm font-bold tracking-tight text-white">
                                        {algo.name}
                                    </h3>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-white opacity-80">
                                        {algo.type.includes("Non-Preemptive") ? "Non-Preemptive" : "Preemptive"}
                                    </span>
                                </div>
                                <p className="text-xs leading-relaxed text-white opacity-90">
                                    {algo.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default AlgorithmSelector;
