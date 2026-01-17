'use client';

import { ChoiceRequest, ChoiceResponse } from '../engine/models';
import Card from './Card'; // Assuming standardized Card component
import { useState } from 'react';

interface RevealModalProps {
    choice: ChoiceRequest | null;
    onResponse: (response: ChoiceResponse) => void;
}

export default function RevealModal({ choice, onResponse }: RevealModalProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    if (!choice || !choice.context?.revealedCard) return null;

    const revealedCard = choice.context.revealedCard;
    const canPutInHand = choice.options.some(opt => opt.id === 'hand' && opt.valid);
    const isAcknowledgement = choice.options.some(opt => opt.id === 'acknowledge');

    const handleConfirm = (optionId: string) => {
        onResponse({
            requestId: choice.id,
            playerId: choice.playerId,
            selectedIds: [optionId],
            declined: false,
            timestamp: Date.now()
        });
    };

    return (
        <div
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex flex-col items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            data-testid="choice-modal"
        >

            {/* Header / Prompt */}
            <div className="text-center mb-8 animate-fade-in-down">
                <div className="text-purple-400 font-bold uppercase tracking-widest text-sm mb-2">
                    {choice.source.abilityName || choice.source.card?.name || 'Card'} reveals
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500 drop-shadow-sm">
                    {choice.prompt || 'Top of Deck'}
                </h1>
                {choice.source.abilityText && (
                    <div className="mt-3 text-gray-400 font-serif italic max-w-lg mx-auto border-t border-white/10 pt-2">
                        "{choice.source.abilityText}"
                    </div>
                )}
            </div>

            {/* CARD REVEAL - "Front and Center" */}
            <div className="relative mb-10 group perspective-1000">
                <div className="relative transform transition-all duration-500 hover:scale-105 hover:rotate-1">
                    {/* Glow effect */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>

                    {/* The Card */}
                    <div className="w-[280px] md:w-[340px] shadow-2xl rounded-xl overflow-hidden border-2 border-white/10 relative z-10">
                        <Card card={revealedCard} disableHoverZoom={false} />
                    </div>
                </div>

                {/* Status Indicator (Only for decisions) */}
                {!isAcknowledgement && (
                    <div className={`
                        absolute -bottom-16 left-1/2 transform -translate-x-1/2 
                        px-4 py-2 rounded-full font-bold text-sm tracking-wide shadow-lg border
                        ${canPutInHand
                            ? 'bg-green-900/80 text-green-300 border-green-500/50'
                            : 'bg-slate-800/80 text-gray-400 border-slate-600/50'
                        }
                    `}>
                        {canPutInHand ? '✨ Match Found!' : '⚠️ No Match'}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-lg mt-4 animate-fade-in-up">

                {/* Acknowledgement Only */}
                {isAcknowledgement && (
                    <button
                        onClick={() => handleConfirm('acknowledge')}
                        className="
                            relative overflow-hidden group w-full sm:w-auto px-12 py-4 rounded-xl font-black text-lg
                            bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500
                            text-white transform hover:-translate-y-1 transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)]
                        "
                    >
                        OK
                    </button>
                )}

                {/* Decision Options (Hide if acknowledgement) */}
                {!isAcknowledgement && (
                    <>
                        {/* Option: Put in Hand (Primary) */}
                        {canPutInHand && (
                            <button
                                onClick={() => handleConfirm('hand')}
                                className="
                                    relative overflow-hidden group w-full sm:w-auto px-8 py-4 rounded-xl font-black text-lg
                                    bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400
                                    text-black transform hover:-translate-y-1 transition-all shadow-[0_0_20px_rgba(251,191,36,0.4)]
                                "
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    <span>✋ Put in Hand</span>
                                </span>
                            </button>
                        )}

                        {/* Option: Bottom of Deck (Secondary / Default) */}
                        <button
                            onClick={() => handleConfirm('bottom')}
                            className={`
                                w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg
                                border-2 transition-all transform hover:-translate-y-1
                                flex items-center justify-center gap-2
                                ${!canPutInHand
                                    ? 'bg-blue-600/20 border-blue-500/50 hover:bg-blue-600/40 text-blue-100 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                                    : 'bg-slate-800/50 border-slate-600/50 hover:bg-slate-700/50 text-gray-300'
                                }
                            `}
                        >
                            ⬇️ Bottom of Deck
                        </button>
                    </>
                )}
            </div>

            {/* Context Info */}
            <div className="mt-8 text-gray-500 text-sm max-w-md text-center">
                Revealed by <span className="text-gray-400 font-semibold">{choice.source.card?.fullName || 'ability'}</span> ability.
            </div>

        </div>
    );
}
