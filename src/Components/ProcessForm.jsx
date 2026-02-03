import { useState } from "react";

function ProcessForm({ onAddProcess }) {
  const [pid, setPid] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [burstTime, setBurstTime] = useState("");
  const [priority, setPriority] = useState("");
  const [color, setColor] = useState("#60a5fa"); // default blue

  const handleSubmit = (e) => {
    e.preventDefault();

    // In this step, we only pass raw data upward
    onAddProcess({
      id: pid,
      arrivalTime,
      burstTime,
      priority,
      color,
    });

    setPid("");
    setArrivalTime("");
    setBurstTime("");
    setPriority("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-slate-900 p-6 rounded-xl shadow-lg"
    >
      <h2 className="text-xl font-bold text-slate-100">
        Add Process
      </h2>

      {/* Process ID */}
      <div>
        <label className="block text-sm text-slate-300 mb-1">
          Process ID
        </label>
        <input
          type="text"
          value={pid}
          onChange={(e) => setPid(e.target.value)}
          placeholder="P1"
          className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Arrival Time */}
      <div>
        <label className="block text-sm text-slate-300 mb-1">
          Arrival Time
        </label>
        <input
          type="number"
          min="0"
          value={arrivalTime}
          onChange={(e) => setArrivalTime(e.target.value)}
          placeholder="0"
          className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Burst Time */}
      <div>
        <label className="block text-sm text-slate-300 mb-1">
          Burst Time
        </label>
        <input
          type="number"
          min="1"
          value={burstTime}
          onChange={(e) => setBurstTime(e.target.value)}
          placeholder="5"
          className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Priority (optional) */}
      <div>
        <label className="block text-sm text-slate-300 mb-1">
          Priority (optional)
        </label>
        <input
          type="number"
          min="0"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          placeholder="1"
          className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Color Picker */}
      <div className="flex items-center gap-4">
        <label className="text-sm text-slate-300">
          Process Color
        </label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-10 w-16 rounded-md border border-slate-700 bg-slate-800"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full rounded-md bg-blue-600 hover:bg-blue-500 text-white py-2 font-semibold transition"
      >
        Add Process
      </button>
    </form>
  );
}

export default ProcessForm;
