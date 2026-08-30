/**
 * Creates a plain SystemSnapshot object.
 *
 * This is the data contract between the engine and the UI.
 * The engine produces these; the UI consumes them.
 * No methods, no classes — just a serializable object.
 */

export function createSystemSnapshot({
  currentTime,
  arriving,
  readyQueue,
  running,
  blocked,
  terminated,
  isComplete,
  events,
}) {
  return {
    currentTime,
    arriving: arriving || [],
    readyQueue: readyQueue || [],
    running: running || null,
    blocked: blocked || [],
    terminated: terminated || [],
    isComplete: isComplete || false,
    events: events || [],
  };
}
