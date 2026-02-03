import { useState } from "react";
import AlgorithmSelector from "./components/AlgorithmSelector";
import ProcessForm from "./components/ProcessForm";
import ProcessTable from "./components/ProcessTable";
import { createProcess } from "./core/processModel";

function App() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
  const [processes, setProcesses] = useState([]);

  const handleAddProcess = (rawProcess) => {
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

  // ✅ DELETE SINGLE PROCESS
  const handleDeleteProcess = (pid) => {
    setProcesses((prev) => prev.filter((p) => p.id !== pid));
  };

  // ✅ CLEAR ALL PROCESSES
  const handleClearAll = () => {
    setProcesses([]);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-10 px-4">
      {/* Main Heading */}
      <h1 className="text-3xl font-extrabold text-slate-800 mb-8 text-center">
        CPU Scheduling Algorithm Simulator
      </h1>

      <div className="w-full max-w-6xl px-4 pt-4 rounded-lg space-y-10 bg-gray-300">
        {/* Top section: Algorithm + Process Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-900 p-6 rounded-xl shadow-xl flex items-center justify-center">
            <AlgorithmSelector
              selected={selectedAlgorithm}
              onSelect={setSelectedAlgorithm}
            />
          </div>

          <ProcessForm
            onAddProcess={handleAddProcess}
            selectedAlgorithm={selectedAlgorithm}
          />
        </div>

        {/* Process Table */}
        <ProcessTable
          processes={processes}
          onDeleteProcess={handleDeleteProcess}
          onClearAll={handleClearAll}
        />
      </div>
    </div>
  );
}

export default App;
