/**
 * BurstSequenceBuilder — form component for the real-time mode.
 *
 * Replaces the static ProcessForm with a dynamic burst sequence builder.
 * Users add alternating CPU/IO bursts as visual tags.
 */

import { useState } from 'react';

// Predefined color palette for auto-assignment
const COLOR_PALETTE = [
    '#60a5fa', '#f472b6', '#34d399', '#fbbf24', '#a78bfa',
    '#fb923c', '#22d3ee', '#e879f9', '#4ade80', '#f87171',
];

const IconCPU = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
    </svg>
);
const IconIO = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
);

function BurstSequenceBuilder({ onAddProcess, existingPids = [] }) {
    const [pid, setPid] = useState('');
    const [arrivalTime, setArrivalTime] = useState('');
    const [color, setColor] = useState(COLOR_PALETTE[0]);
    const [bursts, setBursts] = useState([]);
    const [pendingDuration, setPendingDuration] = useState('');
    const [pendingType, setPendingType] = useState(null); // 'CPU' or 'IO'
    const [error, setError] = useState('');

    const addBurst = (type) => {
        setPendingType(type);
        setPendingDuration('');
        setError('');
    };

    const confirmBurst = () => {
        const dur = Number(pendingDuration);
        if (!dur || dur <= 0) {
            setError('Duration must be a positive number.');
            return;
        }
        setBursts((prev) => [...prev, { type: pendingType, duration: dur }]);
        setPendingType(null);
        setPendingDuration('');
        setError('');
    };

    const cancelPending = () => {
        setPendingType(null);
        setPendingDuration('');
    };

    const removeBurst = (index) => {
        setBursts((prev) => prev.filter((_, i) => i !== index));
    };

    const validate = () => {
        if (!pid.trim()) return 'Process ID is required.';
        if (existingPids.some((p) => p.toLowerCase() === pid.trim().toLowerCase())) {
            return `Process ID "${pid}" already exists.`;
        }
        if (arrivalTime === '' || Number(arrivalTime) < 0) return 'Arrival time must be ≥ 0.';
        if (bursts.length === 0) return 'Add at least one burst.';
        if (bursts[0].type !== 'CPU') return 'Burst sequence must start with a CPU burst.';
        if (bursts[bursts.length - 1].type !== 'CPU') return 'Burst sequence must end with a CPU burst.';
        return null;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        onAddProcess({
            pid: pid.trim(),
            arrivalTime: Number(arrivalTime),
            bursts: bursts.map((b) => ({ ...b })),
            color,
        });

        // Reset form
        setPid('');
        setArrivalTime('');
        setBursts([]);
        setError('');
        // Auto-advance color
        const nextIdx = (COLOR_PALETTE.indexOf(color) + 1) % COLOR_PALETTE.length;
        setColor(COLOR_PALETTE[nextIdx]);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5 bg-slate-900 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-slate-100">Add Process (Real-Time Mode)</h2>

            {error && (
                <div className="rounded-md bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm text-red-400 font-semibold">
                    {error}
                </div>
            )}

            {/* PID + Arrival + Color row */}
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm text-slate-300 mb-1">Process ID</label>
                    <input
                        type="text"
                        value={pid}
                        onChange={(e) => setPid(e.target.value)}
                        placeholder="P1"
                        className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                </div>
                <div>
                    <label className="block text-sm text-slate-300 mb-1">Arrival Time</label>
                    <input
                        type="number"
                        min="0"
                        value={arrivalTime}
                        onChange={(e) => setArrivalTime(e.target.value)}
                        placeholder="0"
                        className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                </div>
                <div className="flex items-end gap-3">
                    <div>
                        <label className="block text-sm text-slate-300 mb-1">Color</label>
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="h-10 w-16 rounded-md border border-slate-700 bg-slate-800 cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* Burst Sequence Display */}
            <div>
                <label className="block text-sm text-slate-300 mb-2 font-semibold">Burst Sequence</label>

                <div className="flex flex-wrap items-center gap-2 min-h-[44px] bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                    {bursts.length === 0 && !pendingType && (
                        <span className="text-slate-500 text-sm italic">No bursts added yet. Use the buttons below.</span>
                    )}

                    {bursts.map((burst, index) => (
                        <div key={index} className="flex items-center gap-0.5">
                            {index > 0 && (
                                <span className="text-slate-500 mx-1 text-lg font-bold">→</span>
                            )}
                            <span
                                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm
                  ${burst.type === 'CPU'
                                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                    }
                `}
                            >
                                {burst.type === 'CPU' ? <IconCPU /> : <IconIO />} {burst.duration}ms
                                <button
                                    type="button"
                                    onClick={() => removeBurst(index)}
                                    className="ml-0.5 text-slate-400 hover:text-red-400 transition text-xs"
                                    aria-label={`Remove burst ${index}`}
                                >
                                    ✕
                                </button>
                            </span>
                        </div>
                    ))}

                    {/* Pending burst input */}
                    {pendingType && (
                        <div className="flex items-center gap-0.5">
                            {bursts.length > 0 && (
                                <span className="text-slate-500 mx-1 text-lg font-bold">→</span>
                            )}
                            <div
                                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-lg border shadow-sm
                  ${pendingType === 'CPU'
                                        ? 'bg-emerald-500/10 border-emerald-500/40'
                                        : 'bg-amber-500/10 border-amber-500/40'
                                    }
                `}
                            >
                                <span className={`text-sm font-extrabold flex items-center gap-1.5 ${pendingType === 'CPU' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {pendingType === 'CPU' ? <IconCPU /> : <IconIO />} {pendingType}
                                </span>
                                <input
                                    type="number"
                                    min="1"
                                    value={pendingDuration}
                                    onChange={(e) => setPendingDuration(e.target.value)}
                                    placeholder="dur"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            confirmBurst();
                                        }
                                        if (e.key === 'Escape') cancelPending();
                                    }}
                                    className="w-16 bg-slate-900 border border-slate-700 rounded text-center text-slate-100 font-mono text-sm py-1 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <span className="text-slate-500 text-xs font-semibold mr-1">ms</span>
                                <div className="flex items-center gap-1 border-l border-slate-700/50 pl-2 ml-1">
                                    <button
                                        type="button"
                                        onClick={confirmBurst}
                                        className="p-1 rounded text-emerald-400 hover:bg-emerald-400/20 transition"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={cancelPending}
                                        className="p-1 rounded text-rose-400 hover:bg-rose-400/20 transition"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Burst Buttons */}
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={() => addBurst('CPU')}
                    disabled={pendingType !== null}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-semibold hover:bg-emerald-600/30 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    + Add CPU Burst
                </button>
                <button
                    type="button"
                    onClick={() => addBurst('IO')}
                    disabled={pendingType !== null}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-amber-600/20 text-amber-300 border border-amber-500/30 font-semibold hover:bg-amber-600/30 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    + Add I/O Burst
                </button>
            </div>

            {/* Submit */}
            <button
                type="submit"
                className="w-full rounded-md bg-cyan-600 hover:bg-cyan-500 text-white py-2.5 font-semibold transition shadow-lg shadow-cyan-500/20"
            >
                Add Process
            </button>
        </form>
    );
}

export default BurstSequenceBuilder;
