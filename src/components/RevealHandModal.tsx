'use client';

import { ChoiceRequest, ChoiceResponse } from '../engine/models';
import Card from './Card';

interface RevealHandModalProps {
    choice: ChoiceRequest | null;
    onResponse: (response: ChoiceResponse) => void;
}

export default function RevealHandModal({ choice, onResponse }: RevealHandModalProps) {
    if (!choice || !choice.context?.revealedCards) return null;

    const revealedCards = choice.context.revealedCards;
    const validTargets = choice.context.validTargets || [];
    const noValidTargets = choice.context.noValidTargets || false;
    const isAcknowledgement = choice.options.some(opt => opt.id === 'acknowledge');

    const handleConfirm = () => {
        onResponse({
            requestId: choice.id,
            playerId: choice.playerId,
            selectedIds: ['acknowledge'],
            declined: false,
            timestamp: Date.now()
        });
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex flex-col items-center justify-center p-4 overflow-y-auto">

            {/* Header / Prompt */}
            <div className="text-center mb-6 animate-fade-in-down">
                <div className="text-purple-400 font-bold uppercase tracking-widest text-sm mb-2">
                    👁️ Hand Revealed
                </div>
                <h1 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500 drop-shadow-sm">
                    {choice.prompt || 'Opponent\'s Hand'}
                </h1>
            </div>

            {/* Status indicator for no valid targets */}
            {noValidTargets && (
                <div className="mb-6 px-6 py-3 rounded-xl bg-amber-900/60 border border-amber-500/50 text-amber-200 font-bold text-lg shadow-lg animate-pulse">
                    ⚠️ No non-character cards to discard!
                </div>
            )}

            {/* Cards Grid */}
            <div className="relative mb-8">
                {revealedCards.length === 0 ? (
                    <div className="text-gray-400 text-lg italic">Hand is empty</div>
                ) : (
                    <div className="flex flex-wrap gap-4 justify-center max-w-5xl">
                        {revealedCards.map((card: any, index: number) => {
                            const isValidTarget = validTargets.some((t: any) => t.instanceId === card.instanceId);
                            const isCharacter = card.type === 'Character';

                            return (
                                <div
                                    key={card.instanceId || index}
                                    className={`
                                        relative transform transition-all duration-300 hover:scale-105 hover:-translate-y-2
                                        ${isValidTarget ? 'ring-2 ring-red-500/70' : ''}
                                    `}
                                >
                                    {/* Card Type Badge */}
                                    <div className={`
                                        absolute -top-3 left-1/2 transform -translate-x-1/2 z-20
                                        px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                        ${isCharacter
                                            ? 'bg-blue-900/80 text-blue-300 border border-blue-500/50'
                                            : 'bg-red-900/80 text-red-300 border border-red-500/50'
                                        }
                                    `}>
                                        {card.type}
                                    </div>

                                    {/* Valid target indicator */}
                                    {isValidTarget && (
                                        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-20
                                            px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-lg">
                                            Must Discard
                                        </div>
                                    )}

                                    {/* The Card */}
                                    <div className="w-[160px] md:w-[200px] shadow-2xl rounded-lg overflow-hidden border border-white/10">
                                        <Card card={card} disableHoverZoom={true} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Action Button */}
            <div className="flex justify-center animate-fade-in-up">
                <button
                    onClick={handleConfirm}
                    className="
                        relative overflow-hidden group px-12 py-4 rounded-xl font-black text-lg
                        bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500
                        text-white transform hover:-translate-y-1 transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)]
                    "
                >
                    OK
                </button>
            </div>

            {/* Context Info */}
            <div className="mt-6 text-gray-500 text-sm max-w-md text-center">
                {noValidTargets
                    ? 'All cards in hand are Characters - no discard required.'
                    : `${validTargets.length} non-character card(s) available for discard.`
                }
            </div>

        </div>
    );
}
