import { useState } from "react";
import AlgorithmSelector from "./components/AlgorithmSelector";
import ProcessForm from "./components/ProcessForm";
import ProcessTable from "./components/ProcessTable";
import { createProcess } from "./core/processModel";
import { fcfsScheduler } from "./core/schedulers/fcfs";
import { computeMetrics } from "./core/metrics";

function App() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
  const [processes, setProcesses] = useState([]);

  // Simulation results (temporary)
  const [simulationResult, setSimulationResult] = useState(null);
  const [metrics, setMetrics] = useState(null);

  const handleAddProcess = (rawProcess) => {
    const newProcess = createProcess({
      id: rawProcess.id,
      arrivalTime: rawProcess.arrivalTime,
      burstTime: rawProcess.burstTime,
      priority:
        selectedAlgorithm === "Priority"
          ? rawProcess.priority
          : null,
      color: rawProcess.color,
    });

    setProcesses((prev) => [...prev, newProcess]);
  };

  const handleDeleteProcess = (pid) => {
    setProcesses((prev) => prev.filter((p) => p.id !== pid));
  };

  const handleClearAll = () => {
    setProcesses([]);
    setSimulationResult(null);
    setMetrics(null);
  };

  // 🚀 SIMULATE BUTTON HANDLER
  const handleSimulate = () => {
    if (selectedAlgorithm !== "FCFS") {
      alert("Only FCFS is wired right now.");
      return;
    }

    if (processes.length === 0) {
      alert("Add at least one process before simulation.");
      return;
    }

    const result = fcfsScheduler(processes);
    const computedMetrics = computeMetrics(result);

    setSimulationResult(result);
    setMetrics(computedMetrics);

    // Debug (temporary)
    console.log("Timeline:", result.timeline);
    console.log("Processes:", result.processes);
    console.log("Metrics:", computedMetrics);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl font-extrabold text-slate-800 mb-8 text-center">
        CPU Scheduling Algorithm Simulator
      </h1>

      <div className="w-full max-w-6xl px-4 pt-4 rounded-lg space-y-10 bg-gray-300">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-900 p-6 rounded-xl shadow-xl flex items-center justify-center">
            <AlgorithmSelector
              selected={selectedAlgorithm}
              onSelect={setSelectedAlgorithm}
            />
          </div>

          <ProcessForm
            onAddProcess={handleAddProcess}
            selectedAlgorithm={selectedAlgorithm}
          />
        </div>

        {/* Process Table */}
        <ProcessTable
          processes={processes}
          onDeleteProcess={handleDeleteProcess}
          onClearAll={handleClearAll}
        />

        {/* Simulate Button */}
        <div className="text-center">
          <button
            onClick={handleSimulate}
            className="px-8 py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition"
          >
            Simulate
          </button>
        </div>

        {/* Temporary Metrics Output */}
        {metrics && (
          <div className="bg-white rounded-xl p-6 shadow-md space-y-2">
            <h2 className="text-lg font-bold text-slate-800">
              Simulation Metrics (FCFS)
            </h2>
            <p>Average Waiting Time: {metrics.averageWaitingTime.toFixed(2)}</p>
            <p>Average Turnaround Time: {metrics.averageTurnaroundTime.toFixed(2)}</p>
            <p>CPU Utilization: {metrics.cpuUtilization.toFixed(2)}%</p>
            <p>Throughput: {metrics.throughput.toFixed(4)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
