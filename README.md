# CPU Allocation & Process State Analysis Engine
*An interactive OS Process Execution & Telemetry Workbench.*

This project is a frontend-based Operating System process simulator designed to visualize scheduling algorithms, process lifecycles (PCBs), hardware interrupts, and context switching in real-time. It bridges the gap between theoretical algorithm math and practical kernel-level process management.

## Core Architecture & Engineering

- **Decoupled Engine**: The OS kernel logic (Scheduler, Dispatcher, Device queues) runs entirely independent of the React UI layer, outputting immutable state snapshots at every millisecond tick.
- **Headless Invariant Testing**: The core scheduling math is fortified by a standalone Node.js test suite (`run-tests.js`) that bypasses the UI to test randomized process inputs against strict OS invariants (e.g., Turnaround Time = Completion Time - Arrival Time).
- **Strict Neumorphic UI**: The frontend utilizes a tactile, "Soft UI" design system (`#e0e5ec` base) with a 100vh unified workspace that prevents main-body scrolling.

## Dual Execution Modes

The application operates in two primary modes:

- **Execution Timeline View (Batch Analysis)**: A deterministic trace mode that calculates all scheduling metrics upfront, generating static Gantt charts and standard OS metrics tables (Turnaround Time, Waiting Time, CPU Utilization).
- **Process State View (Live Execution)**: A decoupled, event-driven tick simulation with playback controls (Play, Pause, Step, Speed) that brings the OS scheduler to life.

## Advanced Simulation Features

- **Interleaved CPU & I/O Bursts**: Processes are modeled as complex arrays of alternating CPU and I/O requests.
- **Live Process Lifecycle Swimlanes**: Processes physically transition across a spatial CSS grid mapping the 5 core OS states (New, Ready Queue, CPU/Running, I/O/Blocked, Terminated).
- **Process Control Block (PCB) Inspector**: A clickable, real-time side-panel drawer exposing the internal state of any process (Priority, Remaining Times, Live Wait Time, Burst Sequence Trace).
- **Dynamic Starvation Detection**: Processes in the Ready Queue feature active wait-timers. If a process is ignored by the CPU for too long, the UI dynamically escalates visual warnings (Yellow to Red) to indicate CPU starvation.
- **Global Progress Tracking**: A continuous progress bar that tracks the overall completion percentage of the total execution time (CPU + I/O combined) across all state transitions.
- **System Event Telemetry**: An integrated, IDE-style terminal at the bottom of the workspace logging timestamped state transitions and dispatch resolutions.

## Getting Started

### Prerequisites
- Node.js

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Mayank1627/CPU_Scheduling_Algorithm_Simulator.git
   cd CPU_Scheduling_Algorithm_Simulator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Run the headless engine tests:
   ```bash
   node run-tests.js
   ```
