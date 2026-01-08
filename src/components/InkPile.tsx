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
            <div className="flex flex-wrap justify-center gap-1 max-w-[100px] mx-auto">
                {/* Available ink (bright) */}
                {Array.from({ length: availableInk }).map((_, i) => (
                    <div
                        key={`available-${i}`}
                        className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30 border border-blue-300"
                        title="Available ink"
                    />
                ))}
                {/* Used ink (dimmed) */}
                {Array.from({ length: usedInk }).map((_, i) => (
                    <div
                        key={`used-${i}`}
                        className="w-3 h-3 rounded-full bg-gray-600 opacity-50 border border-gray-500"
                        title="Used ink"
                    />
                ))}
            </div>

            {/* Card Stack Visual (smaller) */}
            {totalInk > 0 && (
                <div className="relative w-16 h-20 mx-auto mt-3">
                    <div className="absolute top-0 left-0 w-full h-full rounded transform translate-x-0.5 translate-y-0.5 bg-purple-900 opacity-40"></div>
                    <div className="absolute top-0 left-0 w-full h-full rounded-lg overflow-hidden border-2 border-purple-500 shadow-lg">
                        <img
                            src="/images/card-back.png"
                            alt="Ink pile"
                            className="w-full h-full object-cover opacity-80"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
