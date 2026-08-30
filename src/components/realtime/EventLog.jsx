/**
 * EventLog — Professional system console / dmesg-style telemetry terminal.
 *
 * Features:
 * - Internal container scrolling only (NO window-level auto-scroll).
 * - Real-time category filtering (CPU, I/O, Arrivals, Terminated).
 * - Per-Process (PID) filtering & keyword search.
 * - Auto-scroll toggle (ON / OFF).
 * - One-click Copy Logs to clipboard.
 * - Expandable / Compact height toggle.
 * - Zero emojis. Terminal-style monospace text. Color-coded event types.
 */

import { useState, useEffect, useRef, useMemo } from 'react';

/* ── SVG Icons ────────────────────────────────────────────────── */
const IconTerminal = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
    </svg>
);
const IconCopy = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);
const IconExpand = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
    </svg>
);
const IconCollapse = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" /><line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" />
    </svg>
);
const IconScrollDown = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
);
const IconCheck = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const IconClock = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);

// Helper to parse raw string events into structured telemetry objects
function parseEvent(rawText, index) {
    const match = rawText.match(/^t=(\d+):\s*(.*)$/);
    const time = match ? match[1] : '?';
    const rest = match ? match[2] : rawText;

    const pidMatch = rest.match(/\b(P[0-9a-zA-Z_-]+)\b/);
    const pid = pidMatch ? pidMatch[1] : null;

    let category = 'system';
    let badgeLabel = 'SYS';
    let badgeClass = 'rt-badge-system';

    if (rest.includes('terminated')) {
        category = 'term';
        badgeLabel = 'TERM';
        badgeClass = 'rt-badge-term';
    } else if (rest.includes('WARNING')) {
        category = 'warning';
        badgeLabel = 'WARNING';
        badgeClass = 'rt-badge-warning';
    } else if (rest.includes('INFO')) {
        category = 'info';
        badgeLabel = 'INFO';
        badgeClass = 'rt-badge-info';
    } else if (rest.includes('→ CPU') || (rest.includes('CPU') && !rest.includes('I/O'))) {
        category = 'cpu';
        badgeLabel = 'DISPATCH';
        badgeClass = 'rt-badge-cpu';
    } else if (rest.includes('I/O Device') || rest.includes('→ I/O')) {
        category = 'io';
        badgeLabel = 'I/O BLOCK';
        badgeClass = 'rt-badge-io';
    } else if (rest.includes('I/O complete')) {
        category = 'io';
        badgeLabel = 'I/O DONE';
        badgeClass = 'rt-badge-io-complete';
    } else if (rest.includes('arrived')) {
        category = 'arrival';
        badgeLabel = 'ARRIVAL';
        badgeClass = 'rt-badge-arrival';
    } else if (rest.includes('Ready Queue')) {
        category = 'ready';
        badgeLabel = 'READY';
        badgeClass = 'rt-badge-ready';
    }

    return { id: index, raw: rawText, time, pid, category, badgeLabel, badgeClass, message: rest };
}

function EventLog({ events = [] }) {
    const scrollContainerRef = useRef(null);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [selectedPid, setSelectedPid] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [autoScroll, setAutoScroll] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const [copied, setCopied] = useState(false);

    const parsedEvents = useMemo(() => events.map((ev, i) => parseEvent(ev, i)), [events]);

    const uniquePids = useMemo(() => {
        const pids = new Set();
        parsedEvents.forEach((ev) => { if (ev.pid) pids.add(ev.pid); });
        return Array.from(pids);
    }, [parsedEvents]);

    const filteredEvents = useMemo(() => {
        return parsedEvents.filter((ev) => {
            if (categoryFilter !== 'all' && ev.category !== categoryFilter) return false;
            if (selectedPid !== 'all' && ev.pid !== selectedPid) return false;
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                if (!ev.message.toLowerCase().includes(q) && !`t=${ev.time}`.includes(q) && !(ev.pid && ev.pid.toLowerCase().includes(q))) return false;
            }
            return true;
        });
    }, [parsedEvents, categoryFilter, selectedPid, searchQuery]);

    const counts = useMemo(() => {
        const c = { all: parsedEvents.length, cpu: 0, io: 0, arrival: 0, term: 0 };
        parsedEvents.forEach((ev) => {
            if (ev.category === 'cpu') c.cpu++;
            else if (ev.category === 'io') c.io++;
            else if (ev.category === 'arrival') c.arrival++;
            else if (ev.category === 'term') c.term++;
        });
        return c;
    }, [parsedEvents]);

    useEffect(() => {
        if (autoScroll && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [filteredEvents.length, autoScroll]);

    const handleCopyLogs = async () => {
        try {
            await navigator.clipboard.writeText(events.join('\n'));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) { console.error('Failed to copy logs:', err); }
    };

    const hasActiveFilters = categoryFilter !== 'all' || selectedPid !== 'all' || searchQuery !== '';

    return (
        <div className={`rt-terminal ${isExpanded ? 'rt-terminal-expanded' : ''}`}>
            {/* ── Title Bar ─────────────────────────────────────────── */}
            <div className="rt-terminal-titlebar">
                <div className="rt-terminal-titlebar-left">
                    <span className="rt-terminal-dot rt-dot-red" />
                    <span className="rt-terminal-dot rt-dot-yellow" />
                    <span className="rt-terminal-dot rt-dot-green" />
                    <span className="rt-terminal-title">
                        <IconTerminal /> System Event Log
                    </span>
                    <span className="rt-terminal-count">{events.length}</span>
                </div>
                <div className="rt-terminal-titlebar-actions">
                    <button
                        onClick={() => setAutoScroll(!autoScroll)}
                        className={`rt-terminal-action ${autoScroll ? 'rt-terminal-action-active' : ''}`}
                        title={autoScroll ? 'Auto-scroll ON' : 'Auto-scroll OFF'}
                    >
                        <IconScrollDown /> {autoScroll ? 'Scroll ON' : 'Scroll OFF'}
                    </button>
                    <button onClick={handleCopyLogs} disabled={events.length === 0} className="rt-terminal-action" title="Copy logs">
                        {copied ? <><IconCheck /> Copied</> : <><IconCopy /> Copy</>}
                    </button>
                    <button onClick={() => setIsExpanded(!isExpanded)} className="rt-terminal-action" title={isExpanded ? 'Compact' : 'Expand'}>
                        {isExpanded ? <><IconCollapse /> Compact</> : <><IconExpand /> Expand</>}
                    </button>
                </div>
            </div>

            {/* ── Filter Toolbar ────────────────────────────────────── */}
            <div className="rt-terminal-toolbar">
                <div className="rt-terminal-filters">
                    {[
                        { key: 'all', label: 'All', count: counts.all },
                        { key: 'cpu', label: 'CPU', count: counts.cpu },
                        { key: 'io', label: 'I/O', count: counts.io },
                        { key: 'arrival', label: 'Arrival', count: counts.arrival },
                        { key: 'term', label: 'Terminated', count: counts.term },
                    ].map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setCategoryFilter(f.key)}
                            className={`rt-terminal-chip ${categoryFilter === f.key ? `rt-terminal-chip-active rt-terminal-chip-${f.key}` : ''}`}
                        >
                            {f.label} <span className="rt-terminal-chip-count">{f.count}</span>
                        </button>
                    ))}
                </div>
                <div className="rt-terminal-search-area">
                    {uniquePids.length > 0 && (
                        <select value={selectedPid} onChange={(e) => setSelectedPid(e.target.value)} className="rt-terminal-select">
                            <option value="all">All PIDs</option>
                            {uniquePids.map((pid) => <option key={pid} value={pid}>{pid}</option>)}
                        </select>
                    )}
                    <div className="rt-terminal-search-wrap">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter logs..."
                            className="rt-terminal-search"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="rt-terminal-search-x" title="Clear">x</button>
                        )}
                    </div>
                    {hasActiveFilters && (
                        <button onClick={() => { setCategoryFilter('all'); setSelectedPid('all'); setSearchQuery(''); }} className="rt-terminal-reset">
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* ── Log Output ────────────────────────────────────────── */}
            <div ref={scrollContainerRef} className={`rt-terminal-output ${isExpanded ? 'rt-terminal-output-expanded' : ''}`}>
                {events.length === 0 ? (
                    <div className="rt-terminal-empty">
                        <p className="rt-terminal-empty-main">Waiting for events...</p>
                        <p className="rt-terminal-empty-sub">Press Play or Step to begin.</p>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="rt-terminal-empty">
                        <p className="rt-terminal-empty-main">No events match filter</p>
                        <button
                            onClick={() => { setCategoryFilter('all'); setSelectedPid('all'); setSearchQuery(''); }}
                            className="rt-terminal-empty-link"
                        >
                            Clear filters ({events.length} total)
                        </button>
                    </div>
                ) : (
                    <div className="rt-terminal-lines">
                        {filteredEvents.map((ev) => (
                            <div key={ev.id} className={`rt-terminal-line ${ev.category === 'warning' ? 'rt-terminal-line-warning' : ''} ${ev.category === 'info' ? 'rt-terminal-line-info' : ''}`}>
                                <span className="rt-terminal-ts"><IconClock /> {String(ev.time).padStart(2, '0')}s</span>
                                <span className={`rt-terminal-badge ${ev.badgeClass}`}>{ev.badgeLabel}</span>
                                {ev.pid && <span className="rt-terminal-pid">{ev.pid}</span>}
                                <span className="rt-terminal-msg">{ev.message}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default EventLog;
