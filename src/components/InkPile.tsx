'use client';

import { CardInstance } from '../engine/models';

interface InkPileProps {
    cards: CardInstance[];
    label?: string;
}

export default function InkPile({ cards, label = 'Ink' }: InkPileProps) {
    const totalInk = cards.length;
    const availableInk = cards.filter(c => c.ready).length;
    const usedInk = totalInk - availableInk;

    return (
        <div className="p-3 bg-black bg-opacity-30 rounded-lg">
            <div className="text-xs text-gray-400 mb-2 text-center">{label}</div>

            {/* Ink Counter Display */}
            <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl font-bold text-blue-400">{availableInk}</span>
                <span className="text-gray-500">/</span>
                <span className="text-lg text-gray-400">{totalInk}</span>
                <span className="text-blue-400">◆</span>
            </div>

            {/* Visual Ink Dots */}
            <div className="flex flex-wrap justify-center gap-1.5 px-2">
                {/* Available ink (glowing) */}
                {Array.from({ length: availableInk }).map((_, i) => (
                    <div
                        key={`available-${i}`}
                        className="w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_8px_rgba(56,189,248,0.6)] border border-cyan-300 transform hover:scale-110 transition-transform"
                        title="Available ink"
                    />
                ))}
                {/* Used ink (dimmed) */}
                {Array.from({ length: usedInk }).map((_, i) => (
                    <div
                        key={`used-${i}`}
                        className="w-4 h-4 rounded-full bg-slate-800 border border-slate-600 shadow-inner"
                        title="Used ink"
                    />
                ))}
            </div>
        </div>
    );
}
