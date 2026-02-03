import { useState } from "react";
import AlgorithmSelector from "./components/AlgorithmSelector";
import ProcessForm from "./components/ProcessForm";
import ProcessTable from "./components/ProcessTable";
import GanttChart from "./components/GanttChart";
import ProcessStatsTable from "./components/ProcessStatsTable";
import { createProcess } from "./core/processModel";

import { fcfsScheduler } from "./core/schedulers/fcfs";
import { sjfScheduler } from "./core/schedulers/sjf";
import { priorityScheduler } from "./core/schedulers/priority";
import { srtfScheduler } from "./core/schedulers/srtf";
import { roundRobinScheduler } from "./core/schedulers/roundRobin";

import { computeMetrics } from "./core/metrics";

function App() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
  const [processes, setProcesses] = useState([]);

  const [simulationResult, setSimulationResult] = useState(null);
  const [metrics, setMetrics] = useState(null);

  // ⏱️ Round Robin time quantum
  const [timeQuantum, setTimeQuantum] = useState(2);

  // ❌ Form-level error (duplicate PID, etc.)
  const [formError, setFormError] = useState("");

  // ➕ Add process
  const handleAddProcess = (rawProcess) => {
    const pidExists = processes.some(
      (p) => p.id.trim().toLowerCase() === rawProcess.id.trim().toLowerCase()
    );

    if (pidExists) {
      setFormError(`Process ID "${rawProcess.id}" already exists.`);
      return;
    }

    setFormError("");

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

  // ❌ Delete process
  const handleDeleteProcess = (pid) => {
    setProcesses((prev) => prev.filter((p) => p.id !== pid));
  };

  // 🧹 Clear all
  const handleClearAll = () => {
    setProcesses([]);
    setSimulationResult(null);
    setMetrics(null);
    setFormError("");
  };

  // 🚀 Run simulation
  const handleSimulate = () => {
    if (!selectedAlgorithm) {
      alert("Please select a scheduling algorithm.");
      return;
    }

    if (processes.length === 0) {
      alert("Add at least one process before simulation.");
      return;
    }

    let result;

    switch (selectedAlgorithm) {
      case "FCFS":
        result = fcfsScheduler(processes);
        break;

      case "SJF":
        result = sjfScheduler(processes);
        break;

      case "Priority":
        result = priorityScheduler(processes);
        break;

      case "SRTF":
        result = srtfScheduler(processes);
        break;

      case "RR":
        result = roundRobinScheduler(processes, timeQuantum);
        break;

      default:
        alert("Unsupported algorithm selected.");
        return;
    }

    const computedMetrics = computeMetrics(result);
    setSimulationResult(result);
    setMetrics(computedMetrics);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl font-extrabold text-slate-800 mb-8 text-center text-yellow-400">
        CPU Scheduling Algorithm Simulator
      </h1>

      <div className="w-full max-w-6xl px-10 py-10 rounded-lg space-y-10 bg-gray-300">

        {/* Top Section */}
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
            onSetTimeQuantum={setTimeQuantum}
            error={formError}
          />
        </div>

        {/* Simulate Button */}
        <div className="text-center">
          <button
            onClick={handleSimulate}
            className="px-10 py-4 text-lg rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition"
          >
            Simulate 
            Algorithm
          </button>
        </div>

        {/* Process Input Table */}
        <ProcessTable
          processes={processes}
          onDeleteProcess={handleDeleteProcess}
          onClearAll={handleClearAll}
        />

        

        

        {/* Gantt Chart */}
        {simulationResult && (
          <GanttChart timeline={simulationResult.timeline} />
        )}

        {/* Per-Process Statistics */}
        {simulationResult && (
          <ProcessStatsTable processes={simulationResult.processes} />
        )}

        {/* Metrics */}
        {metrics && (
          <div className="bg-slate-800 rounded-xl p-8 shadow-xl space-y-8">
            <h2 className="text-2xl font-extrabold text-center text-slate-100">
              Simulation Metrics ({selectedAlgorithm})
            </h2>

            <div className="flex flex-col md:flex-row gap-6 justify-between">
              <div className="flex-1 bg-slate-900 rounded-lg p-6 text-center">
                <p className="text-sm uppercase tracking-wide text-slate-400">
                  Avg Waiting Time
                </p>
                <p className="mt-2 text-3xl font-extrabold text-slate-100">
                  {metrics.averageWaitingTime.toFixed(2)}
                </p>
              </div>

              <div className="flex-1 bg-slate-900 rounded-lg p-6 text-center">
                <p className="text-sm uppercase tracking-wide text-slate-400">
                  Avg Turnaround Time
                </p>
                <p className="mt-2 text-3xl font-extrabold text-slate-100">
                  {metrics.averageTurnaroundTime.toFixed(2)}
                </p>
              </div>

              <div className="flex-1 bg-slate-900 rounded-lg p-6 text-center">
                <p className="text-sm uppercase tracking-wide text-slate-400">
                  CPU Utilization
                </p>
                <p className="mt-2 text-3xl font-extrabold text-slate-100">
                  {metrics.cpuUtilization.toFixed(2)}%
                </p>
              </div>

              <div className="flex-1 bg-slate-900 rounded-lg p-6 text-center">
                <p className="text-sm uppercase tracking-wide text-slate-400">
                  Throughput
                </p>
                <p className="mt-2 text-3xl font-extrabold text-slate-100">
                  {metrics.throughput.toFixed(4)}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
