'use client';

import { ChoiceRequest, ChoiceResponse, ChoiceOption } from '../engine/models';
import ZoomableCard from './ZoomableCard';
import ChoiceContainer from './ChoiceContainer';
import { useState } from 'react';

interface CardSelectionChoiceProps {
    choice: ChoiceRequest | null;
    onResponse: (response: ChoiceResponse) => void;
}

export default function CardSelectionChoice({ choice, onResponse }: CardSelectionChoiceProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    if (!choice) return null;

    const min = choice.min ?? 1;
    const max = choice.max ?? 1;
    const isOptional = choice.optional === true;

    // Group options by ownership
    const opponentOptions = choice.options.filter(o => o.card && o.card.ownerId !== choice.playerId);
    const myOptions = choice.options.filter(o => o.card && o.card.ownerId === choice.playerId);
    const otherOptions = choice.options.filter(o => !o.card);

    const handleCardClick = (optionId: string, valid: boolean) => {
        if (!valid) return;

        setSelectedIds(prev => {
            // If strictly single select, just replace
            if (max === 1) {
                return [optionId];
            }

            // Toggle
            if (prev.includes(optionId)) {
                return prev.filter(id => id !== optionId);
            } else {
                // Add if limit not reached
                if (prev.length < max) {
                    return [...prev, optionId];
                }
                return prev;
            }
        });
    };

    const handleConfirm = () => {
        if (selectedIds.length < min) return;

        onResponse({
            requestId: choice.id,
            playerId: choice.playerId,
            selectedIds: selectedIds,
            declined: false,
            timestamp: Date.now()
        });
        setSelectedIds([]);
    };

    const handleDecline = () => {
        onResponse({
            requestId: choice.id,
            playerId: choice.playerId,
            selectedIds: [],
            declined: true,
            timestamp: Date.now()
        });
        setSelectedIds([]);
    };

    const canConfirm = selectedIds.length >= min;

    const renderCardGrid = (options: typeof choice.options, title: string, titleColor: string) => {
        if (options.length === 0) return null;
        return (
            <div className="mb-4">
                <h3 className={`text-sm font-bold mb-2 px-2 ${titleColor} uppercase tracking-wide`}>
                    {title}
                </h3>
                <div className="flex flex-wrap justify-center gap-3 p-2">
                    {options.map((option) => {
                        const isSelected = selectedIds.includes(option.id);
                        const selectionIndex = selectedIds.indexOf(option.id) + 1;

                        return (
                            <div
                                key={option.id}
                                data-testid="choice-option"
                                className={`
                                    relative transition-all duration-200 cursor-pointer w-fit
                                    ${isSelected ? 'transform scale-105 z-10' : 'z-0 hover:scale-102'}
                                    ${!option.valid ? 'cursor-not-allowed' : ''}
                                `}
                                onClick={() => handleCardClick(option.id, option.valid)}
                                aria-label={option.card!.fullName || option.card!.name}
                                role="button"
                            >
                                <span className="sr-only">{option.card!.fullName || option.card!.name}</span>
                                <div className={`
                                    rounded-lg overflow-hidden
                                    ${isSelected ? 'ring-4 ring-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)]' : ''}
                                    ${option.valid && !isSelected ? 'ring-2 ring-white/20 hover:ring-white/40' : ''}
                                    ${!option.valid ? 'opacity-40 grayscale' : ''}
                                `}>
                                    <ZoomableCard
                                        card={option.card!}
                                        size="sm"
                                        zoomTrigger="hover"
                                    />
                                </div>

                                {/* Overlays */}
                                <div className="absolute inset-0 pointer-events-none">
                                    {/* Selected Indicator */}
                                    {isSelected && (
                                        <div className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-400 to-yellow-500 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg border-2 border-white z-20">
                                            {max > 1 ? selectionIndex : '✓'}
                                        </div>
                                    )}

                                    {/* Valid Indicator (pulsing border for playable cards) */}
                                    {option.valid && !isSelected && (
                                        <div className="absolute inset-0 rounded-lg border-2 border-green-400/50 animate-pulse" />
                                    )}

                                    {/* Invalid Overlay */}
                                    {!option.valid && (
                                        <div className="absolute inset-0 flex items-end justify-center pb-4">
                                            {option.invalidReason && (
                                                <div className="bg-red-900/95 text-white text-xs font-bold px-2 py-1 rounded shadow-lg border border-red-500 text-center mx-2 max-w-full">
                                                    {option.invalidReason}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const instructionText = (
        <div className="flex items-center justify-between w-full text-gray-300 text-sm">
            <div>
                {max > 1
                    ? `Select ${min === max ? max : `${min} to ${max}`} cards`
                    : 'Select a target'
                }
            </div>
            {selectedIds.length > 0 && (
                <div className="text-yellow-400 font-semibold">
                    {selectedIds.length} selected
                </div>
            )}
        </div>
    );

    return (
        <ChoiceContainer
            data-testid="choice-modal"
            prompt={choice.prompt}
            sourceCard={choice.source.card}
            sourceAbilityName={choice.source.abilityName}
            sourceAbilityText={choice.source.abilityText}
            isOptional={isOptional}
            onCancel={isOptional ? handleDecline : undefined}
            onConfirm={handleConfirm}
            canConfirm={canConfirm}
            confirmLabel={canConfirm
                ? `Confirm${selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}`
                : 'Select a target'
            }
            instructionText={instructionText}
        >
            {renderCardGrid(opponentOptions, "Opponent's Cards", "text-red-400")}
            {renderCardGrid(myOptions, "Your Cards", "text-cyan-400")}

            {/* Fallback for non-card options */}
            {otherOptions.length > 0 && (
                <div className="grid grid-cols-1 gap-2 mt-4">
                    {otherOptions.map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => handleCardClick(opt.id, opt.valid)}
                            disabled={!opt.valid}
                            className={`
                                p-4 rounded-lg text-left transition-all border
                                ${selectedIds.includes(opt.id)
                                    ? 'bg-yellow-600/20 border-yellow-500 text-white ring-2 ring-yellow-400'
                                    : 'bg-slate-700/50 border-slate-600 text-gray-300 hover:bg-slate-700'
                                }
                                ${!opt.valid ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                {selectedIds.includes(opt.id) && (
                                    <span className="text-yellow-400 text-xl">✓</span>
                                )}
                                <span className="font-semibold">{opt.display}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </ChoiceContainer>
    );
}
