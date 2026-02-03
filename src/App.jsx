import { useState } from "react";
import AlgorithmSelector from "./components/AlgorithmSelector";
import ProcessForm from "./components/ProcessForm";
import { createProcess } from "./core/processModel";

function App() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
  const [processes, setProcesses] = useState([]);

  // Handle adding a process from the form
  const handleAddProcess = (rawProcess) => {
    const newProcess = createProcess({
      id: rawProcess.id,
      arrivalTime: rawProcess.arrivalTime,
      burstTime: rawProcess.burstTime,
      priority: rawProcess.priority || null,
      color: rawProcess.color,
    });

    setProcesses((prev) => [...prev, newProcess]);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-10 px-4">
      {/* Main Heading */}
      <h1 className="text-3xl font-extrabold text-slate-800 mb-8 text-center">
        CPU Scheduling Algorithm Simulator
      </h1>

      <div className="w-full max-w-xl space-y-8">
        {/* Algorithm Selector */}
        <div className="bg-white p-8 rounded-xl shadow-md">
          <AlgorithmSelector
            selected={selectedAlgorithm}
            onSelect={setSelectedAlgorithm}
          />
        </div>

        {/* Process Form */}
        <ProcessForm onAddProcess={handleAddProcess} />

        {/* Debug Output (temporary) */}
        <div className="bg-white p-4 rounded-md shadow text-sm text-slate-700">
          <p className="font-semibold mb-2">Processes (debug):</p>
          <pre className="overflow-x-auto">
            {JSON.stringify(processes, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default App;
