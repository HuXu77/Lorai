'use client';

import { ChoiceRequest, ChoiceResponse, ChoiceOption } from '../engine/models';
import { useState, useEffect } from 'react';
import ZoomableCard from './ZoomableCard';

interface OrderCardsChoiceProps {
    choice: ChoiceRequest;
    onResponse: (response: ChoiceResponse) => void;
}

export default function OrderCardsChoice({ choice, onResponse }: OrderCardsChoiceProps) {
    const [orderedCards, setOrderedCards] = useState<ChoiceOption[]>([]);

    useEffect(() => {
        if (choice && choice.options) {
            setOrderedCards([...choice.options]);
        }
    }, [choice]);

    const moveUp = (index: number) => {
        if (index <= 0) return;
        setOrderedCards(prev => {
            const newList = [...prev];
            [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
            return newList;
        });
    };

    const moveDown = (index: number) => {
        setOrderedCards(prev => {
            if (index >= prev.length - 1) return prev;
            const newList = [...prev];
            [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
            return newList;
        });
    };

    const handleConfirm = () => {
        const selectedIds = orderedCards.map(o => o.id);

        onResponse({
            requestId: choice.id,
            playerId: choice.playerId,
            selectedIds: selectedIds,
            declined: false,
            timestamp: Date.now()
        });
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 rounded-xl shadow-2xl max-w-2xl w-full border border-yellow-500/50 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-yellow-500/30 flex justify-between items-center bg-slate-900/50">
                    <div>
                        <div className="text-yellow-400 font-bold uppercase tracking-wider text-sm mb-1">
                            Card Ordering
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-1">
                            {choice.prompt || "Order Cards"}
                        </h2>
                        <div className="text-slate-400 text-sm">
                            Arranged list usually determines bottom-to-top order.
                        </div>
                    </div>
                </div>

                {/* Body - Card Grid */}
                <div className="flex-1 p-6 bg-slate-900/30 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center mb-4">↑ Top of Deck ↑</div>
                    <div className="flex flex-col items-center gap-4">
                        {orderedCards.map((option, index) => (
                            <div key={option.id} className={`relative flex flex-row items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700 ${!option.valid ? 'opacity-50' : ''}`}>
                                {/* Position number badge */}
                                <div className="absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center font-bold text-sm shadow-lg">
                                    {index + 1}
                                </div>

                                {/* Card image */}
                                <div className="rounded-lg overflow-hidden border-2 border-slate-600 hover:border-yellow-400 transition-colors">
                                    {option.card ? (
                                        <ZoomableCard
                                            card={option.card}
                                            size="w-28 h-40"
                                        />
                                    ) : (
                                        <div className="w-28 h-40 bg-slate-700 flex items-center justify-center text-slate-400 text-xs p-2 text-center">
                                            {option.display}
                                        </div>
                                    )}
                                </div>

                                {/* Move controls */}
                                <div className="flex flex-col justify-center gap-2 ml-4">
                                    <button
                                        onClick={() => moveUp(index)}
                                        disabled={index === 0}
                                        className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-700 text-sm font-medium transition-colors"
                                        title="Move Up"
                                    >
                                        ▲
                                    </button>
                                    <button
                                        onClick={() => moveDown(index)}
                                        disabled={index === orderedCards.length - 1}
                                        className="px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-700 text-sm font-medium transition-colors"
                                        title="Move Down"
                                    >
                                        ▼
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center mt-4">↓ Bottom of Deck ↓</div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-700 bg-slate-900/80 flex justify-end">
                    <button
                        onClick={handleConfirm}
                        className="px-8 py-3 rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold text-lg shadow-lg hover:shadow-yellow-500/20 hover:scale-105 transition-all transform"
                    >
                        Confirm Order
                    </button>
                </div>
            </div>
        </div>
    );
}
