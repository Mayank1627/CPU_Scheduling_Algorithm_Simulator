import { useState } from "react";
import AlgorithmSelector from "./components/AlgorithmSelector";
import ProcessForm from "./components/ProcessForm";
import ProcessTable from "./components/ProcessTable";
import GanttChart from "./components/GanttChart";
import ProcessStatsTable from "./components/ProcessStatsTable";
import ComparisonTable from "./components/ComparisonTable";

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
  const [comparisonResults, setComparisonResults] = useState(null);

  const [timeQuantum, setTimeQuantum] = useState(2);
  const [formError, setFormError] = useState("");

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

  const handleDeleteProcess = (pid) => {
    setProcesses((prev) => prev.filter((p) => p.id !== pid));
  };

  const handleClearAll = () => {
    setProcesses([]);
    setSimulationResult(null);
    setMetrics(null);
    setComparisonResults(null);
    setFormError("");
  };

  const recreateProcesses = () =>
    processes.map((p) =>
      createProcess({
        id: p.id,
        arrivalTime: p.arrivalTime,
        burstTime: p.burstTime,
        priority: p.priority,
        color: p.color,
      })
    );

  const handleSimulate = () => {
    if (!selectedAlgorithm || processes.length === 0) return;

    const fresh = recreateProcesses();
    let result;

    switch (selectedAlgorithm) {
      case "FCFS":
        result = fcfsScheduler(fresh);
        break;
      case "SJF":
        result = sjfScheduler(fresh);
        break;
      case "Priority":
        result = priorityScheduler(fresh);
        break;
      case "SRTF":
        result = srtfScheduler(fresh);
        break;
      case "RR":
        result = roundRobinScheduler(fresh, timeQuantum);
        break;
      default:
        return;
    }

    setSimulationResult(result);
    setMetrics(computeMetrics(result));
    setComparisonResults(null);
  };

  const handleCompareAll = () => {
    if (processes.length === 0) return;

    const algorithms = [
      { id: "FCFS", run: fcfsScheduler },
      { id: "SJF", run: sjfScheduler },
      { id: "SRTF", run: srtfScheduler },
      { id: "RR", run: (p) => roundRobinScheduler(p, timeQuantum) },
      { id: "Priority", run: priorityScheduler },
    ];

    const results = algorithms.map(({ id, run }) => {
      const fresh = recreateProcesses();
      const result = run(fresh);
      const metrics = computeMetrics(result);
      return { algorithm: id, ...metrics };
    });

    setComparisonResults(results);
    setSimulationResult(null);
    setMetrics(null);
  };

  return (
    <div className="min-h-screen bg-gray-600 py-10 px-6">
      <h1 className="text-3xl font-extrabold mb-10 text-center">
        CPU Scheduling Algorithm Simulator
      </h1>

      <div className="w-full max-w-[1600px] mx-auto space-y-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          <div className="bg-gray-900 p-8 rounded-xl shadow-xl flex items-center justify-center">
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

        {/* Buttons */}
        <div className="flex justify-center gap-8">
          <button
            onClick={handleSimulate}
            className="px-12 py-4 text-lg rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition"
          >
            Simulate Algorithm
          </button>

          <button
            onClick={handleCompareAll}
            className="px-12 py-4 text-lg rounded-lg bg-amber-500 text-white font-bold hover:bg-yellow-700 transition"
          >
            Compare All Algorithms
          </button>
        </div>

        {/* PROCESS TABLE / PER-PROCESS STATS LOGIC */}
        {!simulationResult || comparisonResults ? (
          <div className="flex justify-center">
            <div className="w-full xl:w-1/2">
              <ProcessTable
                processes={processes}
                onDeleteProcess={handleDeleteProcess}
                onClearAll={handleClearAll}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-start">
            <ProcessTable
              processes={processes}
              onDeleteProcess={handleDeleteProcess}
              onClearAll={handleClearAll}
            />
            <ProcessStatsTable processes={simulationResult.processes} />
          </div>
        )}

        {/* METRICS */}
        {metrics && (
          <div className="w-full bg-slate-800 rounded-xl p-10 shadow-xl space-y-8">
            <h2 className="text-2xl font-extrabold text-center text-slate-100">
              Simulation Metrics ({selectedAlgorithm})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
              <div className="bg-slate-900 rounded-lg p-8 text-center">
                <p className="text-sm uppercase tracking-wide text-slate-400">
                  Avg Waiting Time
                </p>
                <p className="mt-3 text-4xl font-extrabold text-slate-100">
                  {metrics.averageWaitingTime.toFixed(2)}
                </p>
              </div>

              <div className="bg-slate-900 rounded-lg p-8 text-center">
                <p className="text-sm uppercase tracking-wide text-slate-400">
                  Avg Turnaround Time
                </p>
                <p className="mt-3 text-4xl font-extrabold text-slate-100">
                  {metrics.averageTurnaroundTime.toFixed(2)}
                </p>
              </div>

              <div className="bg-slate-900 rounded-lg p-8 text-center">
                <p className="text-sm uppercase tracking-wide text-slate-400">
                  CPU Utilization
                </p>
                <p className="mt-3 text-4xl font-extrabold text-slate-100">
                  {metrics.cpuUtilization.toFixed(2)}%
                </p>
              </div>

              <div className="bg-slate-900 rounded-lg p-8 text-center">
                <p className="text-sm uppercase tracking-wide text-slate-400">
                  Throughput
                </p>
                <p className="mt-3 text-4xl font-extrabold text-slate-100">
                  {metrics.throughput.toFixed(4)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* COMPARISON */}
        {comparisonResults && (
          <div className="w-full">
            <ComparisonTable results={comparisonResults} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
