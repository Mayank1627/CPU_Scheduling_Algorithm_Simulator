import { useState } from "react";

function App() {
  
  // Global state: currently selected CPU scheduling algorithm
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-xl">
        <h1 className="text-2xl font-bold text-slate-800 mb-4 text-center">
          CPU Scheduling Algorithm Simulator
        </h1>

        <p className="text-slate-600 text-center">
          Selected Algorithm:{" "}
          <span className="font-semibold">
            {selectedAlgorithm ?? "None"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default App;
