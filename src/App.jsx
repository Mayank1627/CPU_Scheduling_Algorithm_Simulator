import { useState, useEffect } from "react";
import AlgorithmSelector from "./components/AlgorithmSelector.jsx";
import ProcessForm from "./components/ProcessForm.jsx";
import ProcessTable from "./components/ProcessTable.jsx";
import GanttChart from "./components/GanttChart.jsx";
import ProcessStatsTable from "./components/ProcessStatsTable.jsx";
import ComparisonTable from "./components/ComparisonTable.jsx";
import RealtimeMode from "./components/realtime/RealtimeMode.jsx";


import { createProcess } from "./core/processModel.js";

import { fcfsScheduler } from "./core/schedulers/fcfs.js";
import { sjfScheduler } from "./core/schedulers/sjf.js";
import { priorityScheduler } from "./core/schedulers/priority.js";
import { srtfScheduler } from "./core/schedulers/srtf.js";
import { roundRobinScheduler } from "./core/schedulers/roundRobin.js";

import { computeMetrics } from "./core/metrics.js";

const loadState = (key, defaultValue) => {
    try {
        const saved = localStorage.getItem(key);
        if (saved !== null) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error(`Failed to parse local storage for ${key}`, e);
    }
    return defaultValue;
};

function App() {
    const [mode, setMode] = useState(() => loadState('cpu_sim_mode', 'static'));
    const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
    const [processes, setProcesses] = useState(() => loadState('cpu_sim_processes', []));
    const [timeQuantum, setTimeQuantum] = useState(() => loadState('cpu_sim_quantum', 2));

    useEffect(() => {
        try {
            localStorage.setItem('cpu_sim_mode', JSON.stringify(mode));
            localStorage.setItem('cpu_sim_algo', JSON.stringify(selectedAlgorithm));
            localStorage.setItem('cpu_sim_processes', JSON.stringify(processes));
            localStorage.setItem('cpu_sim_quantum', JSON.stringify(timeQuantum));
        } catch(e) {
            console.error("Failed to save state to local storage", e);
        }
    }, [mode, selectedAlgorithm, processes, timeQuantum]);

    const [simulationResult, setSimulationResult] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const [comparisonResults, setComparisonResults] = useState(null);
    const [formError, setFormError] = useState("");
    const [noAlgorithmError, setNoAlgorithmError] = useState(false);

    const handleSelectAlgorithm = (algo) => {
        setSelectedAlgorithm(algo);
        setNoAlgorithmError(false);

        // Priority & RR need extra fields (priority / time quantum) that
        // previously-added processes won't have, so clear them.
        if ((algo === "Priority" || algo === "RR") && processes.length > 0) {
            setProcesses([]);
            setSimulationResult(null);
            setMetrics(null);
            setComparisonResults(null);
        }
    };

    const handleAddProcess = (rawProcess) => {
        const pId = rawProcess.id || rawProcess.pid;
        const pidExists = processes.some(
            (p) => (p.id || p.pid).trim().toLowerCase() === pId.trim().toLowerCase()
        );
        if (pidExists) {
            setFormError(`Process ID "${pId}" already exists.`);
            return;
        }

        setFormError("");

        let computedBurst = 0;
        let burstsArray = [];

        if (rawProcess.burstTime !== undefined) {
            computedBurst = Number(rawProcess.burstTime);
            burstsArray = [{ type: 'CPU', duration: computedBurst }];
        } else if (rawProcess.bursts) {
            burstsArray = rawProcess.bursts;
            computedBurst = burstsArray.filter(b => b.type === 'CPU').reduce((acc, curr) => acc + curr.duration, 0);
        }

        const newProcess = createProcess({
            id: pId,
            arrivalTime: rawProcess.arrivalTime,
            burstTime: computedBurst,
            priority:
                selectedAlgorithm === "Priority" && rawProcess.priority !== undefined
                    ? rawProcess.priority
                    : null,
            color: rawProcess.color,
        });

        // Add realtime compatibility fields
        newProcess.pid = pId;
        newProcess.bursts = burstsArray;

        setProcesses((prev) => [...prev, newProcess]);
    };

    const handleDeleteProcess = (pid) => {
        setProcesses((prev) => prev.filter((p) => p.id !== pid && p.pid !== pid));
    };

    const handleClearAll = () => {
        setProcesses([]);
        setSimulationResult(null);
        setMetrics(null);
        setComparisonResults(null);
        setFormError("");
        setNoAlgorithmError(false);
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
        if (!selectedAlgorithm) {
            if (processes.length > 0) {
                setNoAlgorithmError(true);
            }
            return;
        }
        if (processes.length === 0) return;

        setNoAlgorithmError(false);

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

        setNoAlgorithmError(false);

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
        <div className="h-screen w-screen flex flex-col bg-[#e0e5ec] overflow-hidden text-slate-700">
            {/* ── Top Command Bar (Sticky Header) ─────────────────── */}
            <header className="shrink-0 flex items-center justify-between px-8 py-4 neu-extruded mx-6 my-4 rounded-2xl z-10">
                <div>
                    <h1 className="text-xl font-extrabold tracking-tight font-['Inter'] text-slate-700">
                        CPU Allocation & Process State Tracing Engine
                    </h1>
                </div>


                {/* Mode Toggle with Sliding Indicator */}
                <div className="mode-track shrink-0">
                    <div
                        className="mode-slider-pill"
                        style={{
                            transform: mode === 'static' ? 'translateX(0%)' : 'translateX(100%)'
                        }}
                        aria-hidden="true"
                    />

                    <button
                        onClick={() => setMode('static')}
                        className={`mode-btn-option ${mode === 'static' ? 'active' : 'inactive'}`}
                    >
                        Static Metrics
                    </button>
                    <button
                        onClick={() => setMode('realtime')}
                        className={`mode-btn-option ${mode === 'realtime' ? 'active' : 'inactive'}`}
                    >
                        Real-Time Tracing
                    </button>
                </div>
            </header>

            {/* ── Main Content ────────────────────────────────────── */}
            {mode === 'realtime' ? (
                <div className="flex-1 overflow-hidden px-6 pb-6 flex">
                    <RealtimeMode 
                        onExitMode={() => setMode('static')} 
                        processes={processes}
                        onAddProcess={handleAddProcess}
                        onDeleteProcess={handleDeleteProcess}
                        onClearAll={handleClearAll}
                    />
                </div>
            ) : (
                <div className="flex-1 flex gap-6 px-6 pb-6 overflow-hidden">
                    {/* ── Left Sidebar (Setup) ────────────────────── */}
                    <aside className="clean-scroll w-[320px] shrink-0 flex flex-col gap-6 sticky top-0 h-full pr-2">
                        {/* Algorithm Selector */}
                        <div className="neu-extruded p-5 rounded-[16px]">
                            <AlgorithmSelector
                                selected={selectedAlgorithm}
                                onSelect={handleSelectAlgorithm}
                            />
                        </div>

                        {/* Global Time Quantum for Round Robin */}
                        {selectedAlgorithm === "RR" && (
                            <div className="neu-extruded p-5 rounded-[16px]">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                                    Set Time Quantum
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={timeQuantum}
                                    onChange={(e) => {
                                        const value = Number(e.target.value);
                                        if (value > 0) setTimeQuantum(value);
                                    }}
                                    className="w-full neu-pressed px-4 py-3 text-slate-700 font-bold focus:outline-none"
                                />
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={handleSimulate}
                                className="flex-1 py-3 text-sm font-bold btn-simulate"
                            >
                                Simulate
                            </button>
                            <button
                                onClick={handleCompareAll}
                                className="flex-1 py-3 text-sm font-bold btn-compare"
                            >
                                Compare All
                            </button>
                        </div>

                        {/* No Algorithm Warning */}
                        {noAlgorithmError && (
                            <div className="neu-pressed p-4 rounded-xl flex items-center gap-3 text-amber-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86l-8.6 14.92A1 1 0 002.54 20h18.92a1 1 0 00.85-1.22l-8.6-14.92a1 1 0 00-1.42 0z" />
                                </svg>
                                <span className="text-sm font-bold">Select an algorithm</span>
                            </div>
                        )}

                        {/* Process Form */}
                        <div className="neu-extruded p-5 rounded-[16px] mb-4">
                            <ProcessForm
                                onAddProcess={handleAddProcess}
                                selectedAlgorithm={selectedAlgorithm}
                                error={formError}
                            />
                        </div>
                    </aside>

                    {/* ── Center Workspace (The Main Canvas) ──────── */}
                    <main className="clean-scroll flex-1 flex flex-col gap-6 h-full pr-4 pb-12">
                        {/* Process List Section */}
                        <div className="neu-extruded p-6 rounded-[16px] w-full shrink-0">
                            <ProcessTable
                                processes={processes}
                                selectedAlgorithm={selectedAlgorithm}
                                timeQuantum={timeQuantum}
                                onDeleteProcess={handleDeleteProcess}
                                onClearAll={handleClearAll}
                            />
                        </div>

                        {/* Per Process Stats Section */}
                        {simulationResult && !comparisonResults && (
                            <div className="neu-extruded p-6 rounded-[16px] w-full shrink-0">
                                <ProcessStatsTable processes={simulationResult.processes} />
                            </div>
                        )}

                        {/* Comparison Table Section */}
                        {comparisonResults && (
                            <div className="neu-extruded p-6 rounded-[16px] w-full shrink-0">
                                <ComparisonTable results={comparisonResults} />
                            </div>
                        )}

                        {/* Gantt Chart Section */}
                        {simulationResult && (
                            <div className="neu-extruded p-6 rounded-[16px] w-full shrink-0 flex flex-col min-h-[300px]">
                                <GanttChart timeline={simulationResult.timeline} />
                            </div>
                        )}

                        {/* Metrics Section */}
                        {metrics && (
                            <div className="neu-extruded p-6 rounded-[16px] w-full shrink-0">
                                <h2 className="text-lg font-bold text-slate-700 mb-6 text-center uppercase tracking-wide">
                                    Metrics ({selectedAlgorithm})
                                </h2>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Avg Waiting', value: metrics.averageWaitingTime.toFixed(2) },
                                        { label: 'Avg Turnaround', value: metrics.averageTurnaroundTime.toFixed(2) },
                                        { label: 'CPU Util', value: `${metrics.cpuUtilization.toFixed(2)}%` },
                                        { label: 'Throughput', value: metrics.throughput.toFixed(4) },
                                    ].map((m) => (
                                        <div key={m.label} className="neu-pressed p-4 rounded-[12px] text-center">
                                            <p className="text-xs uppercase font-bold text-slate-500 mb-2">
                                                {m.label}
                                            </p>
                                            <p className="text-2xl font-extrabold text-slate-700 font-['JetBrains_Mono']">
                                                {m.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            )}
        </div>
    );
}

export default App;
