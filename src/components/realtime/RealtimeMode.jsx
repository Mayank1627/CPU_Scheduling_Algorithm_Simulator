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

function RealtimeMode({ onExitMode, processes, onAddProcess, onDeleteProcess, onClearAll }) {
    const [phase, setPhase] = useState('setup'); // 'setup' | 'simulation'
    const [selectedPid, setSelectedPid] = useState(null);

    const sim = useRealtimeSimulation(processes);

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

    // ── LAYOUT ─────────────────────────────────────────────
    return (
        <div className="flex-1 flex gap-6 overflow-hidden">
            {/* ── Left Sidebar (Configuration) ────────────────────── */}
            <aside className="w-[320px] shrink-0 flex flex-col gap-6 overflow-y-auto pr-2">
                <div className="neu-extruded p-5 rounded-[16px] flex-1">
                    <BurstSequenceBuilder
                        onAddProcess={onAddProcess}
                        existingPids={existingPids}
                    />
                </div>

                <div className="flex gap-4 mt-auto mb-4">
                    {phase === 'setup' ? (
                        <button
                            onClick={handleStartSimulation}
                            disabled={processes.length === 0}
                            className="flex-1 py-3 text-sm font-bold btn-start-sim disabled:opacity-40 disabled:shadow-none"
                        >
                            ▶ Start Simulation
                        </button>
                    ) : (
                        <button
                            onClick={handleBackToSetup}
                            className="flex-1 py-3 text-sm font-bold neu-btn text-amber-600"
                        >
                            ■ Stop Simulation
                        </button>
                    )}
                </div>
            </aside>

            {/* ── Center Workspace (Main Canvas) ──────────────────── */}
            <main className="flex-1 flex flex-col gap-6 clean-scroll pr-2 pb-6">
                {/* Process List Table */}
                <div className="shrink-0 neu-extruded p-6 rounded-[16px] w-full">
                    <RealtimeProcessTable
                        processes={processes}
                        onDeleteProcess={phase === 'setup' ? onDeleteProcess : undefined}
                        onClearAll={phase === 'setup' ? onClearAll : undefined}
                        readOnly={phase === 'simulation'}
                    />
                </div>

                {/* Simulation Panel */}
                {phase === 'simulation' && (
                    <div className="flex-1 flex flex-col min-h-0">
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
                    </div>
                )}
            </main>


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
