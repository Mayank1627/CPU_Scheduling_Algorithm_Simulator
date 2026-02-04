import { useState } from "react";
import AlgorithmSelector from "./components/AlgorithmSelector.jsx";
import ProcessForm from "./components/ProcessForm.jsx";
import ProcessTable from "./components/ProcessTable.jsx";
import GanttChart from "./components/GanttChart.jsx";
import ProcessStatsTable from "./components/ProcessStatsTable.jsx";
import ComparisonTable from "./components/ComparisonTable.jsx";


import { createProcess } from "./core/processModel";

import { fcfsScheduler } from "./core/schedulers/fcfs.js";
import { sjfScheduler } from "./core/schedulers/sjf.js";
import { priorityScheduler } from "./core/schedulers/priority.js";
import { srtfScheduler } from "./core/schedulers/srtf.js";
import { roundRobinScheduler } from "./core/schedulers/roundRobin.js";

import { computeMetrics } from "./core/metrics.js";

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
    <div className="min-h-screen  py-10 px-6">
  <h1 className="relative text-center mb-16">
  

  <span className="text-4xl md:text-5xl font-extrabold font-[monospace] text-slate-900 tracking-tight">
    CPU Scheduling Algorithms
  </span>

  <span className="block mt-2 text-base text-slate-600 text-lg font-[monospace]">
    Interactive Visualization & Performance Analysis
  </span>
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

        {/* GANTT CHART */}
        {simulationResult && (
          <div className="w-full">
            <GanttChart timeline={simulationResult.timeline} />
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

      <footer className="mt-24 py-6 text-center text-lg text-slate-600 font-[JetBrains_Mono]">
        <span>Built by</span>
        <span className="mx-2">•</span>
       <a
            href="https://github.com/Mayank1627/CPU_Scheduling_Algorithm_Simulator.git"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 hover:text-slate-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.1 3.29 9.43 7.86 10.96.57.1.78-.25.78-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.73.08-.72.08-.72 1.17.08 1.79 1.21 1.79 1.21 1.04 1.78 2.73 1.27 3.4.97.1-.75.4-1.27.73-1.56-2.56-.29-5.26-1.28-5.26-5.69 0-1.26.45-2.29 1.19-3.1-.12-.3-.52-1.52.11-3.17 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.65.24 2.87.12 3.17.74.81 1.18 1.84 1.18 3.1 0 4.42-2.7 5.39-5.28 5.67.41.36.78 1.08.78 2.18 0 1.57-.02 2.83-.02 3.22 0 .31.21.67.79.56 4.56-1.53 7.84-5.86 7.84-10.96C23.5 5.74 18.27.5 12 .5z" />
            </svg>
            GitHub
    </a>

        <span className="mx-2">•</span>
        
      </footer>


    </div>
  );
}

export default App;
