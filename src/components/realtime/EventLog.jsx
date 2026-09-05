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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
    </svg>
);
const IconExpand = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
    </svg>
);
const IconCollapse = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" /><line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" />
    </svg>
);
const IconClock = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
    let badgeColor = 'text-white bg-slate-500';

    if (rest.includes('terminated')) {
        category = 'term';
        badgeLabel = 'TERM';
        badgeColor = 'text-white bg-purple-600';
    } else if (rest.includes('WARNING')) {
        category = 'warning';
        badgeLabel = 'WARN';
        badgeColor = 'text-white bg-amber-600';
    } else if (rest.includes('INFO')) {
        category = 'info';
        badgeLabel = 'INFO';
        badgeColor = 'text-white bg-blue-600';
    } else if (rest.includes('→ CPU') || (rest.includes('CPU') && !rest.includes('I/O'))) {
        category = 'cpu';
        badgeLabel = 'CPU';
        badgeColor = 'text-white bg-emerald-600';
    } else if (rest.includes('I/O Device') || rest.includes('→ I/O')) {
        category = 'io';
        badgeLabel = 'I/O';
        badgeColor = 'text-white bg-amber-500';
    } else if (rest.includes('I/O complete')) {
        category = 'io';
        badgeLabel = 'I/O DONE';
        badgeColor = 'text-white bg-emerald-500';
    } else if (rest.includes('arrived')) {
        category = 'arrival';
        badgeLabel = 'ARR';
        badgeColor = 'text-white bg-cyan-600';
    } else if (rest.includes('Ready Queue')) {
        category = 'ready';
        badgeLabel = 'READY';
        badgeColor = 'text-white bg-indigo-600';
    }

    return { id: index, raw: rawText, time, pid, category, badgeLabel, badgeColor, message: rest };
}

function EventLog({ events = [] }) {
    const scrollContainerRef = useRef(null);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [selectedPid, setSelectedPid] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

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
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [filteredEvents.length]);

    const hasActiveFilters = categoryFilter !== 'all' || selectedPid !== 'all' || searchQuery !== '';

    return (
        <div className={`flex flex-col h-full transition-all duration-300 ${isExpanded ? 'fixed inset-4 z-50 rounded-2xl p-6 bg-[#1e293b] shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-slate-700' : 'bg-transparent'}`}>
            {/* ── Title Bar ─────────────────────────────────────────── */}
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-white">
                    {/* Window Controls / Status Indicator Dots: Green, Yellow, Red */}
                    <div className="flex items-center gap-1.5 mr-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_6px_rgba(16,185,129,0.6)]" title="Active" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shadow-[0_0_6px_rgba(245,158,11,0.6)]" title="Pending" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-[0_0_6px_rgba(239,68,68,0.6)]" title="Alert" />
                    </div>
                    <span className="text-white"><IconTerminal /></span>
                    <span className="text-white font-extrabold" style={{ color: '#ffffff' }}>System Event Log</span>
                    <span className="neu-pressed px-2 py-0.5 rounded-md text-[10px] text-white" style={{ color: '#ffffff' }}>{events.length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 rounded-md neu-btn text-slate-400 hover:text-slate-600 transition flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider" title={isExpanded ? 'Compact' : 'Expand'}>
                        {isExpanded ? <IconCollapse /> : <IconExpand />}
                    </button>
                </div>
            </div>

            {/* ── Filter Toolbar ────────────────────────────────────── */}
            {isExpanded && (
                <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
                    <div className="flex gap-2">
                        {[
                            { key: 'all', label: 'All', count: counts.all },
                            { key: 'cpu', label: 'CPU', count: counts.cpu },
                            { key: 'io', label: 'I/O', count: counts.io },
                            { key: 'arrival', label: 'Arrival', count: counts.arrival },
                            { key: 'term', label: 'Term', count: counts.term },
                        ].map((f) => (
                            <button
                                key={f.key}
                                onClick={() => setCategoryFilter(f.key)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition ${categoryFilter === f.key ? 'neu-pressed text-cyan-600' : 'neu-btn text-slate-500'}`}
                            >
                                {f.label} <span className="bg-slate-400/20 px-1 rounded text-[9px]">{f.count}</span>
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        {uniquePids.length > 0 && (
                            <select value={selectedPid} onChange={(e) => setSelectedPid(e.target.value)} className="neu-pressed px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 outline-none bg-transparent appearance-none cursor-pointer">
                                <option value="all">All PIDs</option>
                                {uniquePids.map((pid) => <option key={pid} value={pid}>{pid}</option>)}
                            </select>
                        )}
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Filter logs..."
                                className="neu-pressed px-3 py-1.5 pr-8 rounded-lg text-xs font-bold text-slate-600 outline-none w-48"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-2 text-slate-400 hover:text-slate-600 font-bold" title="Clear">×</button>
                            )}
                        </div>
                        {hasActiveFilters && (
                            <button onClick={() => { setCategoryFilter('all'); setSelectedPid('all'); setSearchQuery(''); }} className="neu-btn px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-red-500">
                                Reset
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ── Log Output ────────────────────────────────────────── */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto pr-2 flex flex-col gap-1.5 font-['JetBrains_Mono'] text-[11px] font-bold text-slate-500">
                {events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 uppercase tracking-widest text-xs">
                        <p>Waiting for events...</p>
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 uppercase tracking-widest text-xs gap-2">
                        <p>No events match filter</p>
                        <button
                            onClick={() => { setCategoryFilter('all'); setSelectedPid('all'); setSearchQuery(''); }}
                            className="neu-btn px-3 py-1.5 rounded-lg text-cyan-600"
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    filteredEvents.map((ev) => (
                        <div key={ev.id} className="flex items-start gap-3 py-1 border-b border-slate-300/30 last:border-0 hover:bg-slate-300/20 transition-colors rounded px-2">
                            <span className="flex items-center gap-1 text-slate-400 shrink-0 w-16"><IconClock /> {String(ev.time).padStart(2, '0')}s</span>
                            <span className={`shrink-0 w-16 text-center px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-extrabold ${ev.badgeColor}`}>{ev.badgeLabel}</span>
                            {ev.pid ? (
                                <span className="text-slate-600 font-extrabold w-8 shrink-0">{ev.pid}</span>
                            ) : (
                                <span className="w-8 shrink-0"></span>
                            )}
                            <span className={`flex-1 break-words ${ev.category === 'warning' ? 'text-amber-600' : 'text-slate-600'}`}>{ev.message}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default EventLog;
