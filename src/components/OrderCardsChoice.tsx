'use client';

import { ChoiceRequest, ChoiceResponse, ChoiceOption } from '../engine/models';
import { useState, useEffect } from 'react';
import ZoomableCard from './ZoomableCard';
import ChoiceContainer from './ChoiceContainer';

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

    const instructionText = (
        <div className="text-center text-gray-300">
            Arrange cards from Top to Bottom
        </div>
    );

    return (
        <ChoiceContainer
            data-testid="choice-modal"
            title="Card Ordering"
            prompt={choice.prompt || "Order Cards"}
            sourceCard={choice.source?.card}
            sourceAbilityName={choice.source?.abilityName}
            sourceAbilityText={choice.source?.abilityText}
            onConfirm={handleConfirm}
            canConfirm={true}
            confirmLabel="Confirm Order"
            instructionText={instructionText}
        >
            <div className="flex flex-col items-center gap-4 py-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">↑ Top of Zone ↑</div>

                {orderedCards.map((option, index) => (
                    <div key={option.id} className={`relative flex flex-row items-center p-4 bg-slate-800/50 rounded-lg border border-slate-700 ${!option.valid ? 'opacity-50' : ''} w-full max-w-lg`}>
                        {/* Position number badge */}
                        <div className="absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center font-bold text-sm shadow-lg">
                            {index + 1}
                        </div>

                        {/* Card image */}
                        <div className="rounded-lg overflow-hidden border-2 border-slate-600 hover:border-yellow-400 transition-colors flex-shrink-0">
                            {option.card ? (
                                <ZoomableCard
                                    card={option.card}
                                    size="w-24 h-32" // Slightly specific size override if needed, or stick to sm
                                // Custom sizing might need tailored ZoomableCard usage or container classes
                                />
                            ) : (
                                <div className="w-24 h-32 bg-slate-700 flex items-center justify-center text-slate-400 text-xs p-2 text-center">
                                    {option.display}
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 px-4">
                            <div className="font-bold text-lg text-white">{option.display}</div>
                            {option.card && <div className="text-xs text-gray-400">{option.card.type}</div>}
                        </div>

                        {/* Move controls */}
                        <div className="flex flex-col justify-center gap-2">
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

                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center mt-2">↓ Bottom of Zone ↓</div>
            </div>
        </ChoiceContainer>
    );
}
