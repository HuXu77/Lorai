'use client';

import { LogEntry as LogEntryType, LogCategory } from '../types/log';
import LogEntry from './LogEntry';
import { useState, useEffect, useRef } from 'react';

interface GameLogProps {
    entries: LogEntryType[];
    onClear?: () => void;
    maxEntries?: number;
    isOpen?: boolean;
    onToggle?: () => void;
}

export default function GameLog({
    entries,
    onClear,
    maxEntries = 100,
    isOpen = false,
    onToggle
}: GameLogProps) {
    const [debugMode, setDebugMode] = useState(false);
    const [filterCategories, setFilterCategories] = useState<LogCategory[]>(Object.values(LogCategory));
    const [autoScroll, setAutoScroll] = useState(true);
    const [lastReadCount, setLastReadCount] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const prevEntriesLength = useRef(entries.length);

    // Track unread count
    const unreadCount = isOpen ? 0 : Math.min(entries.length - lastReadCount, 99);

    // Mark as read when opened
    useEffect(() => {
        if (isOpen) {
            setLastReadCount(entries.length);
        }
    }, [isOpen, entries.length]);

    // Auto-scroll to bottom when new entries are added
    useEffect(() => {
        if (autoScroll && scrollRef.current && entries.length > prevEntriesLength.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
        prevEntriesLength.current = entries.length;
    }, [entries, autoScroll]);

    // Handle manual scroll
    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
            setAutoScroll(isAtBottom);
        }
    };

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            setAutoScroll(true);
        }
    };

    const toggleCategory = (category: LogCategory) => {
        setFilterCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const filteredEntries = entries
        .filter(entry => filterCategories.includes(entry.category))
        .slice(-maxEntries);

    // Floating button when closed
    if (!isOpen) {
        return (
            <button
                onClick={onToggle}
                className="fixed bottom-6 left-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-2xl transition-all z-50 hover:scale-110"
                title="Open Game Log"
            >
                <div className="flex items-center gap-2">
                    <span className="text-2xl">📜</span>
                    {unreadCount > 0 && (
                        <div className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold border-2 border-white">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </div>
                    )}
                </div>
            </button>
        );
    }

    // Modal mode when open
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[90] flex items-center justify-center p-4">
            {/* Modal Panel */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col border-2 border-blue-600">
                {/* Header */}
                <div className="p-4 bg-black bg-opacity-40 border-b border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-bold text-xl flex items-center gap-2">
                            📜 Game Log
                            <span className="text-sm text-gray-400">({filteredEntries.length})</span>
                        </h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setDebugMode(!debugMode)}
                                className={`px-3 py-1 text-sm rounded ${debugMode
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                title="Toggle Debug Mode"
                            >
                                🐛 Debug
                            </button>
                            <button
                                onClick={onClear}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                                title="Clear Log"
                            >
                                🗑️ Clear
                            </button>
                            <button
                                onClick={onToggle}
                                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded"
                                title="Close Log"
                            >
                                ✕ Close
                            </button>
                        </div>
                    </div>

                    {/* Category Filters */}
                    <div className="flex flex-wrap gap-2">
                        {Object.values(LogCategory).map(category => {
                            const isActive = filterCategories.includes(category);
                            return (
                                <button
                                    key={category}
                                    onClick={() => toggleCategory(category)}
                                    className={`px-3 py-1 text-sm rounded transition-all ${isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-700 text-gray-400 opacity-50 hover:opacity-100'
                                        }`}
                                    title={`Toggle ${category} events`}
                                >
                                    {category}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Log Entries */}
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto p-4"
                >
                    {filteredEntries.length === 0 ? (
                        <div className="text-gray-500 text-center py-12">
                            No log entries
                        </div>
                    ) : (
                        filteredEntries.map(entry => (
                            <LogEntry
                                key={entry.id}
                                entry={entry}
                                debugMode={debugMode}
                            />
                        ))
                    )}
                </div>

                {/* Scroll to Bottom Button */}
                {!autoScroll && (
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                        <button
                            onClick={scrollToBottom}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full shadow-lg"
                        >
                            ↓ Jump to Latest
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
