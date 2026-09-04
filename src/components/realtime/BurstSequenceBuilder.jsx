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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-700 uppercase tracking-wide">Add Process</h2>

            {error && (
                <div className="rounded-xl neu-pressed px-4 py-3 text-sm text-red-500 font-bold">
                    {error}
                </div>
            )}

            {/* PID + Arrival + Color */}
            <div className="flex flex-col gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Process ID</label>
                    <input
                        type="text"
                        value={pid}
                        onChange={(e) => setPid(e.target.value)}
                        placeholder="P1"
                        className="w-full neu-pressed px-3 py-3 text-slate-700 font-bold focus:outline-none text-sm"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Arrival Time</label>
                    <input
                        type="number"
                        min="0"
                        value={arrivalTime}
                        onChange={(e) => setArrivalTime(e.target.value)}
                        placeholder="0"
                        className="w-full neu-pressed px-3 py-3 text-slate-700 font-bold focus:outline-none text-sm"
                    />
                </div>
                <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Process Color</label>
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-16 h-10 neu-pressed cursor-pointer bg-transparent"
                    />
                </div>
            </div>

            {/* Burst Sequence Display */}
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Burst Sequence</label>

                <div className="flex flex-wrap items-center gap-2 min-h-[48px] neu-pressed rounded-xl p-3">
                    {bursts.length === 0 && !pendingType && (
                        <span className="text-slate-400 text-xs italic font-semibold">No bursts added yet.</span>
                    )}

                    {bursts.map((burst, index) => (
                        <div key={index} className="flex items-center gap-1">
                            {index > 0 && (
                                <span className="text-slate-400 mx-0.5 text-xs font-bold">→</span>
                            )}
                            <span
                                className={`
                                    inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold neu-extruded shadow-sm
                                    ${burst.type === 'CPU' ? 'text-emerald-600' : 'text-amber-600'}
                                `}
                            >
                                {burst.type === 'CPU' ? <IconCPU /> : <IconIO />} {burst.duration}
                                <button
                                    type="button"
                                    onClick={() => removeBurst(index)}
                                    className="ml-1 text-slate-400 hover:text-red-500 transition text-xs"
                                    aria-label={`Remove burst ${index}`}
                                >
                                    ✕
                                </button>
                            </span>
                        </div>
                    ))}

                    {/* Pending burst input */}
                    {pendingType && (
                        <div className="flex items-center gap-1">
                            {bursts.length > 0 && (
                                <span className="text-slate-400 mx-0.5 text-xs font-bold">→</span>
                            )}
                            <div className="flex items-center gap-1 px-2 py-1 rounded-md neu-extruded shadow-sm">
                                <span className={`text-xs font-extrabold flex items-center gap-1 ${pendingType === 'CPU' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {pendingType === 'CPU' ? <IconCPU /> : <IconIO />}
                                </span>
                                <input
                                    type="number"
                                    min="1"
                                    value={pendingDuration}
                                    onChange={(e) => setPendingDuration(e.target.value)}
                                    placeholder="?"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            confirmBurst();
                                        }
                                        if (e.key === 'Escape') cancelPending();
                                    }}
                                    className="w-8 bg-transparent text-center text-slate-700 font-bold text-xs py-0.5 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <div className="flex items-center gap-1 ml-1 border-l border-slate-300 pl-1">
                                    <button
                                        type="button"
                                        onClick={confirmBurst}
                                        className="text-emerald-500 hover:text-emerald-600 transition"
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={cancelPending}
                                        className="text-red-500 hover:text-red-600 transition"
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
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
                    className="flex-1 py-2 text-xs font-bold neu-btn text-emerald-600 disabled:opacity-50 disabled:shadow-none"
                >
                    + CPU Burst
                </button>
                <button
                    type="button"
                    onClick={() => addBurst('IO')}
                    disabled={pendingType !== null}
                    className="flex-1 py-2 text-xs font-bold neu-btn text-amber-600 disabled:opacity-50 disabled:shadow-none"
                >
                    + I/O Burst
                </button>
            </div>

            {/* Submit */}
            <button
                type="submit"
                className="w-full py-3 mt-2 text-sm font-bold neu-btn-primary"
            >
                Add Process
            </button>
        </form>
    );
}

export default BurstSequenceBuilder;
