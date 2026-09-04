import { useState } from "react";

function ProcessForm({
    onAddProcess,
    selectedAlgorithm,
    onSetTimeQuantum,
    error,
}) {
    const isPriorityAlgo = selectedAlgorithm === "Priority";
    const isRR = selectedAlgorithm === "RR";

    const PREDEFINED_COLORS = [
        "#60a5fa", // Blue
        "#f472b6", // Pink
        "#34d399", // Emerald
        "#fbbf24", // Amber
        "#a78bfa", // Purple
        "#fb923c", // Orange
        "#2dd4bf", // Teal
        "#f87171"  // Red
    ];

    const [pid, setPid] = useState("");
    const [arrivalTime, setArrivalTime] = useState("");
    const [burstTime, setBurstTime] = useState("");
    const [priority, setPriority] = useState("");
    
    const [colorIndex, setColorIndex] = useState(0);
    const [color, setColor] = useState(PREDEFINED_COLORS[0]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // basic validation (hard stop on bad input)
        if (!pid || arrivalTime === "" || burstTime === "") return;
        if (Number(arrivalTime) < 0) return;
        if (Number(burstTime) <= 0) return;

        onAddProcess({
            id: pid,
            arrivalTime: Number(arrivalTime),
            burstTime: Number(burstTime),
            priority: isPriorityAlgo ? Number(priority) : null,
            color,
        });

        setPid("");
        setArrivalTime("");
        setBurstTime("");
        setPriority("");
        
        // Cycle to the next default color
        const nextIndex = (colorIndex + 1) % PREDEFINED_COLORS.length;
        setColorIndex(nextIndex);
        setColor(PREDEFINED_COLORS[nextIndex]);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
        >
            <h2 className="text-lg font-bold text-slate-700">Add Process</h2>

            {error && (
                <div className="rounded-xl neu-pressed px-4 py-3 text-sm text-red-500 font-bold">
                    {error}
                </div>
            )}

            {/* Process ID */}
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Process ID
                </label>
                <input
                    type="text"
                    value={pid}
                    onChange={(e) => setPid(e.target.value)}
                    placeholder="P1"
                    className="w-full neu-pressed px-4 py-3 text-slate-700 font-bold focus:outline-none"
                />
            </div>

            {/* Arrival Time */}
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Arrival Time
                </label>
                <input
                    type="number"
                    min="0"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    placeholder="0"
                    className="w-full neu-pressed px-4 py-3 text-slate-700 font-bold focus:outline-none"
                />
            </div>

            {/* Burst Time */}
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Burst Time
                </label>
                <input
                    type="number"
                    min="1"
                    value={burstTime}
                    onChange={(e) => setBurstTime(e.target.value)}
                    placeholder="5"
                    className="w-full neu-pressed px-4 py-3 text-slate-700 font-bold focus:outline-none"
                />
            </div>

            {/* Priority */}
            {isPriorityAlgo && (
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Priority
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        placeholder="0 (Lower = Higher)"
                        className="w-full neu-pressed px-4 py-3 text-slate-700 font-bold focus:outline-none"
                    />
                </div>
            )}



            {/* Color Picker */}
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Process Color
                </label>
                <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-10 w-16 neu-pressed cursor-pointer bg-transparent"
                />
            </div>

            {/* Submit */}
            <button
                type="submit"
                className="w-full py-3 mt-4 text-sm font-bold neu-btn-primary"
            >
                Add Process
            </button>
        </form>
    );
}

export default ProcessForm;
