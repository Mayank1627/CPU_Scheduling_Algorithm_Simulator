# CPU Allocation & Process State Tracing Engine

An interactive web-based engine for visualizing and analyzing **CPU scheduling algorithms and process state tracing**.  
This project helps understand how different scheduling strategies affect process execution, waiting time, turnaround time, and overall CPU performance.

---

## 🚀 Features

- **Supported Algorithms**
  - First Come First Serve (FCFS)
  - Shortest Job First (SJF) – Non-Preemptive
  - Shortest Remaining Time First (SRTF) – Preemptive
  - Round Robin (RR) with configurable time quantum
  - Priority Scheduling (Non-Preemptive)

- **Process Management**
  - Add and remove processes dynamically
  - Custom arrival time, burst time, priority, and color
  - Input validation (duplicate PIDs prevented)

- **Visualization**
  - SVG-based Gantt Chart with idle time handling
  - Clear execution timeline for each algorithm

- **Statistics & Metrics**
  - Per-process statistics:
    - Completion Time
    - Waiting Time
    - Turnaround Time
  - Global metrics:
    - Average Waiting Time
    - Average Turnaround Time
    - CPU Utilization
    - Throughput

- **Algorithm Comparison**
  - Compare all algorithms on the same set of processes
  - Side-by-side metric comparison table

- **UI/UX**
  - Responsive layout
  - Clean system-style design
  - Light grid background for better visual structure

---

## 🧠 Why this project?

CPU scheduling is a core concept in **Operating Systems**, but it’s often difficult to visualize.  
This simulator bridges that gap by combining **visual execution timelines** with **quantitative performance metrics**, making learning more intuitive.

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite)
- **Styling:** Tailwind CSS
- **Visualization:** SVG
- **Language:** JavaScript (ES6+)

---

## 📂 Project Structure

src/
├── components/
│ ├── AlgorithmSelector.jsx
│ ├── ProcessForm.jsx
│ ├── ProcessTable.jsx
│ ├── ProcessStatsTable.jsx
│ ├── GanttChart.jsx
│ └── ComparisonTable.jsx
│
├── core/
│ ├── processModel.js
│ ├── metrics.js
│ └── schedulers/
│ ├── fcfs.js
│ ├── sjf.js
│ ├── srtf.js
│ ├── roundRobin.js
│ └── priority.js
│
├── App.jsx
└── main.jsx


---

## ▶️ Running the Project Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mayank1627/CPU_Scheduling_Algorithm_Simulator.git
Install dependencies

npm install
Run the development server

npm run dev
Open the browser at:

http://localhost:5173
📊 How to Use
Select a scheduling algorithm

Add processes (arrival time, burst time, priority if applicable)

(For Round Robin) Set time quantum

Click Simulate Algorithm to view:

Gantt chart

Per-process statistics

Performance metrics

Click Compare All Algorithms to compare metrics across algorithms

⚠️ Notes
Priority Scheduling uses lower number = higher priority

All simulations are run on fresh process copies to avoid state leakage

Idle CPU time is explicitly visualized

📌 Future Improvements (Optional)
Preemptive Priority Scheduling

Context switch overhead simulation

Export results as CSV/PDF

Dark/Light mode toggle

👤 Author
Mayank
GitHub: Mayank1627

📄 License
This project is for academic and educational purposes.


---
