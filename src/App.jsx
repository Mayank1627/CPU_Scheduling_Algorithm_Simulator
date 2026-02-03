import { useState } from "react";
import AlgorithmSelector from "./components/AlgorithmSelector";

function App() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-10 px-4">
      {/* Main Page Heading */}
      <h1 className="text-3xl font-extrabold text-slate-800 mb-8 text-center">
        CPU Scheduling Algorithm Simulator
      </h1>

      {/* Main Content Card */}
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-xl">
        <AlgorithmSelector
          selected={selectedAlgorithm}
          onSelect={setSelectedAlgorithm}
        />
      </div>
    </div>
  );
}

export default App;
