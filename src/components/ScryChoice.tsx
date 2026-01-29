'use client';

import { ChoiceRequest, ChoiceResponse, ChoiceOption } from '../engine/models';
import Card from './Card';
import { useState, useEffect } from 'react';

interface ScryChoiceProps {
    choice: ChoiceRequest;
    onResponse: (response: ChoiceResponse) => void;
}

export default function ScryChoice({ choice, onResponse }: ScryChoiceProps) {
    // Initial state: all cards from options are in "Top"
    // We assume choice.options contains the cards in their current order (Top to Bottom)
    const [topCards, setTopCards] = useState<ChoiceOption[]>([]);
    const [bottomCards, setBottomCards] = useState<ChoiceOption[]>([]);

    useEffect(() => {
        if (choice && choice.options) {
            setTopCards([...choice.options]);
            setBottomCards([]);
        }
    }, [choice]);

    const moveToBottom = (option: ChoiceOption) => {
        setTopCards(prev => prev.filter(o => o.id !== option.id));
        setBottomCards(prev => [option, ...prev]); // Add to top of bottom stack? Or bottom?
        // Usually "put on bottom" means it goes to the bottom-most position available or top of bottom pile?
        // Let's assume user builds the bottom stack.
        // We'll add to the "start" of bottom cards list (which represents the top-most of the bottom cards)
    };

    const moveToTop = (option: ChoiceOption) => {
        setBottomCards(prev => prev.filter(o => o.id !== option.id));
        setTopCards(prev => [...prev, option]); // Add to end (bottom of top stack)? 
        // Or add to top? Let's add to end for now, user can reorder.
    };

    const moveUp = (index: number, listSetter: React.Dispatch<React.SetStateAction<ChoiceOption[]>>) => {
        if (index <= 0) return;
        listSetter(prev => {
            const newList = [...prev];
            [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
            return newList;
        });
    };

    const moveDown = (index: number, listSetter: React.Dispatch<React.SetStateAction<ChoiceOption[]>>) => {
        listSetter(prev => {
            if (index >= prev.length - 1) return prev;
            const newList = [...prev];
            [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
            return newList;
        });
    };

    const handleConfirm = () => {
        // Construct response
        // We need to return the ordered lists
        const topIds = topCards.map(o => o.id);
        const bottomIds = bottomCards.map(o => o.id);

        onResponse({
            requestId: choice.id,
            playerId: choice.playerId,
            selectedIds: topIds, // For legacy support or just primary selection
            payload: {
                top: topIds,
                bottom: bottomIds
            },
            declined: false,
            timestamp: Date.now()
        });
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
            <div data-testid="choice-modal" className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 rounded-xl shadow-2xl max-w-5xl w-full border border-purple-500/50 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-purple-500/30 flex justify-between items-center bg-purple-900/20">
                    <div>
                        <div className="text-purple-400 font-bold uppercase tracking-wider text-sm mb-1">
                            Deck Manipulation
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-1">
                            {choice.prompt || "Rearrange Cards"}
                        </h2>
                        <div className="text-slate-400 text-sm">
                            Organize cards between Top and Bottom of deck.
                        </div>
                    </div>
                </div>

                {/* Body - Two Columns */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-purple-500/30">

                    {/* Top Deck Zone */}
                    <div className="flex-1 p-4 bg-blue-900/10 flex flex-col min-h-0">
                        <h3 className="text-xl font-bold text-blue-300 mb-4 flex items-center gap-2">
                            <span>⬆️</span> Top of Deck ({topCards.length})
                            <span className="text-xs font-normal text-slate-400 ml-auto block">(First card is top-most)</span>
                        </h3>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                            {topCards.length === 0 && (
                                <div className="text-center text-slate-500 py-10 italic border-2 border-dashed border-slate-700/50 rounded-lg">
                                    No cards on top
                                </div>
                            )}
                            {topCards.map((option, index) => (
                                <div key={option.id} className="bg-slate-800 border border-slate-600 rounded-lg p-3 flex items-center gap-3 hover:border-blue-400 transition-colors group">
                                    <div className="w-8 h-8 rounded-full bg-blue-900/50 text-blue-200 flex items-center justify-center font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 font-medium text-slate-200">
                                        {option.display}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => moveUp(index, setTopCards)}
                                            disabled={index === 0}
                                            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30"
                                            title="Move Up"
                                        >
                                            ▲
                                        </button>
                                        <button
                                            onClick={() => moveDown(index, setTopCards)}
                                            disabled={index === topCards.length - 1}
                                            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30"
                                            title="Move Down"
                                        >
                                            ▼
                                        </button>
                                        <div className="w-px h-6 bg-slate-700 mx-1"></div>
                                        <button
                                            onClick={() => moveToBottom(option)}
                                            className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-sm font-medium transition-colors"
                                        >
                                            To Bottom ⬇
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom Deck Zone */}
                    <div className="flex-1 p-4 bg-orange-900/10 flex flex-col min-h-0">
                        <h3 className="text-xl font-bold text-orange-300 mb-4 flex items-center gap-2">
                            <span>⬇️</span> Bottom of Deck ({bottomCards.length})
                            <span className="text-xs font-normal text-slate-400 ml-auto block">(Ordered list)</span>
                        </h3>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                            {bottomCards.length === 0 && (
                                <div className="text-center text-slate-500 py-10 italic border-2 border-dashed border-slate-700/50 rounded-lg">
                                    No cards on bottom
                                </div>
                            )}
                            {bottomCards.map((option, index) => (
                                <div key={option.id} className="bg-slate-800 border border-slate-600 rounded-lg p-3 flex items-center gap-3 hover:border-orange-400 transition-colors group">
                                    <div className="w-8 h-8 rounded-full bg-orange-900/50 text-orange-200 flex items-center justify-center font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 font-medium text-slate-200">
                                        {option.display}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => moveToTop(option)}
                                            className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-sm font-medium transition-colors"
                                        >
                                            To Top ⬆
                                        </button>
                                        <div className="w-px h-6 bg-slate-700 mx-1"></div>
                                        <button
                                            onClick={() => moveUp(index, setBottomCards)}
                                            disabled={index === 0}
                                            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30"
                                            title="Move Up"
                                        >
                                            ▲
                                        </button>
                                        <button
                                            onClick={() => moveDown(index, setBottomCards)}
                                            disabled={index === bottomCards.length - 1}
                                            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30"
                                            title="Move Down"
                                        >
                                            ▼
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-purple-500/30 bg-slate-900/80 flex justify-end">
                    <button
                        onClick={handleConfirm}
                        className="px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-lg shadow-lg hover:shadow-purple-500/20 hover:scale-105 transition-all transform"
                    >
                        Confirm Order
                    </button>
                </div>
            </div>
        </div>
    );
}
