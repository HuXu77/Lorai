'use client';

import { LogEntry as LogEntryType, getCategoryInfo, formatRelativeTime } from '../types/log';
import { useState } from 'react';

interface LogEntryProps {
    entry: LogEntryType;
    debugMode?: boolean;
}

export default function LogEntry({ entry, debugMode = false }: LogEntryProps) {
    const [expanded, setExpanded] = useState(false);
    const categoryInfo = getCategoryInfo(entry.category);
    const hasDetails = entry.details && Object.keys(entry.details).length > 0;

    return (
        <div
            className={`
                p-2 mb-2 rounded border-l-4 ${categoryInfo.borderClass} ${categoryInfo.bgClass} bg-opacity-50
                transition-all duration-200 hover:bg-opacity-70
            `}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                    <span className="text-lg flex-shrink-0">{categoryInfo.icon}</span>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm text-white font-medium break-words">
                            {entry.message}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                            {formatRelativeTime(entry.timestamp)}
                        </div>
                    </div>
                </div>

                {/* Expand button */}
                {(hasDetails || debugMode) && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-gray-400 hover:text-white text-xs flex-shrink-0"
                    >
                        {expanded ? '▼' : '▶'}
                    </button>
                )}
            </div>

            {/* Expanded Details */}
            {expanded && hasDetails && (
                <div className={`mt-2 pl-7 text-xs ${categoryInfo.textClass} space-y-1`}>
                    {entry.details?.card && (
                        <div>
                            <span className="text-gray-400">Card:</span> {entry.details.card.fullName || entry.details.card.name}
                        </div>
                    )}
                    {entry.details?.player && (
                        <div>
                            <span className="text-gray-400">Player:</span> {entry.details.player}
                        </div>
                    )}
                    {entry.details?.amount !== undefined && (
                        <div>
                            <span className="text-gray-400">Amount:</span> {entry.details.amount}
                        </div>
                    )}
                    {entry.details?.from && (
                        <div>
                            <span className="text-gray-400">From:</span> {entry.details.from}
                        </div>
                    )}
                    {entry.details?.to && (
                        <div>
                            <span className="text-gray-400">To:</span> {entry.details.to}
                        </div>
                    )}
                    {entry.details?.ability && (
                        <div>
                            <span className="text-gray-400">Ability:</span> {entry.details.ability}
                        </div>
                    )}
                </div>
            )}

            {/* Debug Info */}
            {expanded && debugMode && entry.debugInfo && (
                <div className="mt-2 pl-7 text-xs text-gray-500 font-mono bg-black bg-opacity-30 p-2 rounded">
                    <pre className="whitespace-pre-wrap break-all">
                        {JSON.stringify(entry.debugInfo, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
