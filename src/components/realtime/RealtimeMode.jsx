/**
 * RealtimeMode — container component orchestrating the entire real-time mode.
 *
 * Two phases:
 *  1. SETUP: BurstSequenceBuilder + RealtimeProcessTable
 *  2. SIMULATION: SwimlaneVisualizer with playback controls
 *
 * Keeps App.jsx clean — it just mounts <RealtimeMode /> when mode is 'realtime'.
 */

import { useState, useCallback } from 'react';
import BurstSequenceBuilder from './BurstSequenceBuilder.jsx';
import RealtimeProcessTable from './RealtimeProcessTable.jsx';
import SwimlaneVisualizer from './SwimlaneVisualizer.jsx';
import PcbInspector from './PcbInspector.jsx';
import { useRealtimeSimulation } from '../../hooks/useRealtimeSimulation.js';

function RealtimeMode({ onExitMode }) {
    const [processes, setProcesses] = useState([]);
    const [phase, setPhase] = useState('setup'); // 'setup' | 'simulation'
    const [selectedPid, setSelectedPid] = useState(null);

    const sim = useRealtimeSimulation(processes);

    const handleAddProcess = useCallback((processData) => {
        setProcesses((prev) => [...prev, processData]);
    }, []);

    const handleDeleteProcess = useCallback((pid) => {
        setProcesses((prev) => prev.filter((p) => p.pid !== pid));
    }, []);

    const handleClearAll = useCallback(() => {
        setProcesses([]);
    }, []);

    const handleStartSimulation = () => {
        if (processes.length === 0) return;
        sim.initialize(processes);
        setPhase('simulation');
    };

    const handleBackToSetup = () => {
        sim.pause();
        setSelectedPid(null);
        setPhase('setup');
    };

    const existingPids = processes.map((p) => p.pid);

    // ── SETUP PHASE ─────────────────────────────────────────────
    if (phase === 'setup') {
        return (
            <div className="w-full max-w-[1600px] mx-auto space-y-10">
                {/* Header row with back button */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                            Process States
                        </h2>
                        <p className="text-slate-700 mt-1">
                            Define processes with CPU/I/O burst sequences, then watch them execute live.
                        </p>
                    </div>
                    <button
                        onClick={onExitMode}
                        className="px-5 py-2.5 rounded-lg bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition"
                    >
                        ← Back to Static Mode
                    </button>
                </div>

                {/* Form + Table */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                    <BurstSequenceBuilder
                        onAddProcess={handleAddProcess}
                        existingPids={existingPids}
                    />
                    <RealtimeProcessTable
                        processes={processes}
                        onDeleteProcess={handleDeleteProcess}
                        onClearAll={handleClearAll}
                    />
                </div>

                {/* Start Simulation button */}
                <div className="flex justify-center">
                    <button
                        onClick={handleStartSimulation}
                        disabled={processes.length === 0}
                        className="px-14 py-4 text-lg rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold hover:from-cyan-500 hover:to-blue-500 transition shadow-lg shadow-cyan-500/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        ▶ Start Real-Time Simulation
                    </button>
                </div>
            </div>
        );
    }

    // ── SIMULATION PHASE ────────────────────────────────────────
    return (
        <div className="w-full max-w-[1600px] mx-auto space-y-6">
            {/* Header with back button */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                        Live Simulation
                    </h2>
                    <p className="text-slate-500 mt-1">
                        {processes.length} process{processes.length !== 1 ? 'es' : ''} •
                        {sim.isComplete ? ' Simulation complete' : ' Running…'}
                    </p>
                </div>
                <button
                    onClick={handleBackToSetup}
                    className="px-5 py-2.5 rounded-lg bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition"
                >
                    ← Back to Setup
                </button>
            </div>

            {/* Summary Table */}
            <RealtimeProcessTable processes={processes} readOnly={true} />

            {/* Swimlane Visualizer */}
            <SwimlaneVisualizer
                snapshot={sim.snapshot}
                isRunning={sim.isRunning}
                isComplete={sim.isComplete}
                speed={sim.speed}
                onPlay={sim.play}
                onPause={sim.pause}
                onStep={sim.step}
                onStepBack={sim.stepBack}
                onReset={sim.reset}
                onSetSpeed={sim.setSpeed}
                selectedPid={selectedPid}
                onSelectProcess={setSelectedPid}
            />

            {/* PCB Inspector Overlay */}
            <PcbInspector
                selectedPid={selectedPid}
                snapshot={sim.snapshot}
                onClose={() => setSelectedPid(null)}
            />
        </div>
    );
}

export default RealtimeMode;
