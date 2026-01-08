'use client';

import { ChoiceRequest, ChoiceResponse, ChoiceOption } from '../engine/models';
import ZoomableCard from './ZoomableCard';
import Card from './Card';
import { useState } from 'react';

interface CardSelectionChoiceProps {
    choice: ChoiceRequest | null;
    onResponse: (response: ChoiceResponse) => void;
}

export default function CardSelectionChoice({ choice, onResponse }: CardSelectionChoiceProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    console.log('[CardSelectionChoice] Rendering for choice:', choice?.type);

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
                                className={`
                                    relative transition-all duration-200 cursor-pointer w-fit
                                    ${isSelected ? 'transform scale-105 z-10' : 'z-0 hover:scale-102'}
                                    ${!option.valid ? 'cursor-not-allowed' : ''}
                                `}
                                onClick={() => handleCardClick(option.id, option.valid)}
                            >
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

    return (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            {/* Modal Container */}
            <div className="bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 rounded-xl shadow-2xl max-w-5xl w-full border border-yellow-500/50 overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 p-4 border-b border-yellow-500/30">
                    <div className="flex items-center gap-4">
                        {/* Source Card Mini Preview */}
                        {choice.source.card && (
                            <div className="w-16 h-22 flex-shrink-0 hidden sm:block">
                                <Card
                                    card={choice.source.card}
                                    disableHoverZoom={true}
                                />
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            {/* Ability Name */}
                            <div className="text-purple-400 text-sm font-semibold mb-1 flex items-center gap-2">
                                <span className="text-lg">✨</span>
                                {choice.source.abilityName || 'Ability'}
                            </div>
                            {/* Prompt */}
                            <h2 className="text-xl font-bold text-yellow-300 leading-tight">
                                {choice.prompt}
                            </h2>
                            {/* Source Card Name */}
                            {choice.source.card && (
                                <div className="text-sm text-gray-400 mt-1">
                                    from <span className="text-blue-400">{choice.source.card.fullName || choice.source.card.name}</span>
                                </div>
                            )}
                            {/* Ability Text */}
                            {choice.source.abilityText && (
                                <div className="mt-2 text-sm text-gray-300 bg-slate-900/50 rounded px-3 py-2 border-l-2 border-purple-500 italic">
                                    "{choice.source.abilityText}"
                                </div>
                            )}
                        </div>

                        {/* Optional/Required Badge */}
                        <div className={`
                            px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide flex-shrink-0
                            ${isOptional
                                ? 'bg-gray-700 text-gray-300 border border-gray-600'
                                : 'bg-red-900/50 text-red-300 border border-red-700'
                            }
                        `}>
                            {isOptional ? 'Optional' : 'Required'}
                        </div>
                    </div>
                </div>

                {/* Selection Info */}
                <div className="bg-slate-900/50 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
                    <div className="text-gray-300 text-sm">
                        {max > 1
                            ? `Select ${min === max ? max : `${min} to ${max}`} cards`
                            : 'Select a target'
                        }
                    </div>
                    {selectedIds.length > 0 && (
                        <div className="text-yellow-400 text-sm font-semibold">
                            {selectedIds.length} selected
                        </div>
                    )}
                </div>

                {/* Scrollable Card Grid */}
                <div className="p-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
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
                </div>

                {/* Footer Actions */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 border-t border-slate-700 flex items-center justify-center gap-4">
                    {/* Cancel Button - ONLY for optional effects */}
                    {isOptional && (
                        <button
                            onClick={handleDecline}
                            className="
                                px-6 py-3 rounded-lg font-bold text-base transition-all
                                bg-slate-700 hover:bg-slate-600 text-gray-300 hover:text-white
                                border border-slate-600 hover:border-slate-500
                            "
                        >
                            Cancel
                        </button>
                    )}

                    {/* Confirm Button */}
                    <button
                        onClick={handleConfirm}
                        disabled={!canConfirm}
                        className={`
                            px-8 py-3 rounded-lg font-bold text-base transition-all shadow-lg min-w-[180px]
                            ${canConfirm
                                ? 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white transform hover:scale-105 border border-green-400/50'
                                : 'bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600'
                            }
                        `}
                    >
                        {canConfirm
                            ? `Confirm${selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}`
                            : 'Select a target'
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}
