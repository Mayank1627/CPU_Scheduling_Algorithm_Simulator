/**
 * useRealtimeSimulation — custom React hook bridging the engine and UI.
 *
 * Owns the RealtimeScheduler instance, manages the playback loop
 * (play/pause/step/reset/speed), and exposes the latest SystemSnapshot
 * as React state so components re-render on every tick.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { RealtimeScheduler } from '../core/realtime/RealtimeScheduler.js';

// Speed presets: ms between ticks (slower, human-readable pacing)
const SPEED_INTERVALS = {
  '0.25x': 2400, // 2.4s per tick (ultra-slow detailed inspection)
  '0.5x': 1400,  // 1.4s per tick (relaxed pace)
  '1x': 800,     // 0.8s per tick (standard pace)
};

export function useRealtimeSimulation(processDefinitions) {
  const engineRef = useRef(null);
  const intervalRef = useRef(null);
  const algorithmRef = useRef('FCFS');

  const [snapshot, setSnapshot] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [speed, setSpeed] = useState('1x');
  const [isInitialized, setIsInitialized] = useState(false);

  /** Initialize (or re-initialize) the engine from process definitions. */
  const initialize = useCallback((definitions, algorithm = 'FCFS') => {
    algorithmRef.current = algorithm;

    // Stop any running playback
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const engine = new RealtimeScheduler(definitions, algorithm);
    engineRef.current = engine;

    setSnapshot(engine.getInitialSnapshot());
    setIsRunning(false);
    setIsComplete(false);
    setIsInitialized(true);
  }, []);

  /** Execute a single tick and update state. */
  const doTick = useCallback(() => {
    if (!engineRef.current) return;

    const newSnapshot = engineRef.current.tick();
    setSnapshot(newSnapshot);

    if (newSnapshot.isComplete) {
      setIsComplete(true);
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, []);

  /** Start automatic playback. */
  const play = useCallback(() => {
    if (!engineRef.current || isComplete) return;

    setIsRunning(true);

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const ms = SPEED_INTERVALS[speed] || 500;
    intervalRef.current = setInterval(() => {
      doTick();
    }, ms);
  }, [speed, isComplete, doTick]);

  /** Pause playback. */
  const pause = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /** Advance by exactly one tick (manual step). */
  const step = useCallback(() => {
    if (!engineRef.current || isComplete) return;
    pause();
    doTick();
  }, [isComplete, pause, doTick]);

  /** Step back by one tick (reverse step). */
  const stepBack = useCallback(() => {
    if (!engineRef.current || !snapshot || snapshot.currentTime === 0) return;
    pause();
    
    const targetTime = snapshot.currentTime - 1;
    
    // Fast-forward a fresh engine from 0 to targetTime
    const freshEngine = new RealtimeScheduler(processDefinitions, algorithmRef.current);
    engineRef.current = freshEngine;
    
    let freshSnapshot = freshEngine.getInitialSnapshot();
    for (let i = 0; i < targetTime; i++) {
      freshSnapshot = freshEngine.tick();
    }
    
    setSnapshot(freshSnapshot);
    setIsComplete(freshSnapshot.isComplete);
    setIsRunning(false);
  }, [snapshot, processDefinitions, pause]);

  /** Reset the simulation back to t=0. */
  const reset = useCallback(() => {
    if (!processDefinitions || processDefinitions.length === 0) return;
    initialize(processDefinitions);
  }, [processDefinitions, initialize]);

  /** Update speed while running — restart the interval with new timing. */
  const changeSpeed = useCallback(
    (newSpeed) => {
      setSpeed(newSpeed);

      // If currently playing, restart interval with new speed
      if (isRunning && intervalRef.current) {
        clearInterval(intervalRef.current);
        const ms = SPEED_INTERVALS[newSpeed] || 500;
        intervalRef.current = setInterval(() => {
          doTick();
        }, ms);
      }
    },
    [isRunning, doTick]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    snapshot,
    isRunning,
    isComplete,
    isInitialized,
    speed,
    initialize,
    play,
    pause,
    step,
    stepBack,
    reset,
    setSpeed: changeSpeed,
  };
}
