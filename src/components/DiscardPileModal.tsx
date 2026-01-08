'use client';

import ZoomableCard from './ZoomableCard';
import { CardInstance } from '../engine/models';

interface DiscardPileModalProps {
    cards: CardInstance[];
    label: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function DiscardPileModal({ cards, label, isOpen, onClose }: DiscardPileModalProps) {
    if (!isOpen) return null;

    // Reverse to show most recent first
    const displayCards = [...cards].reverse();

    return (
        <>
            {/* Backdrop overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                {/* Modal panel */}
                <div
                    className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border-2 border-orange-600"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-black bg-opacity-30">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="text-orange-500">🗑️</span>
                            {label}
                            <span className="text-sm font-normal text-gray-400">({cards.length} cards)</span>
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white text-2xl font-bold w-8 h-8 flex items-center justify-center rounded hover:bg-gray-700 transition-colors"
                            aria-label="Close"
                        >
                            ×
                        </button>
                    </div>

                    {/* Card grid */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                        {displayCards.length === 0 ? (
                            <div className="text-center text-gray-500 py-12">
                                <div className="text-4xl mb-2">📭</div>
                                <div>No cards in discard pile</div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {displayCards.map((card, index) => (
                                    <div
                                        key={card.instanceId || index}
                                        className="relative"
                                    >
                                        <ZoomableCard
                                            card={card}
                                            size="md"
                                        />
                                        {/* Most recent indicator */}
                                        {index === 0 && (
                                            <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg z-20">
                                                TOP
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer with close button */}
                    <div className="p-4 border-t border-gray-700 bg-black bg-opacity-30 flex justify-center">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
