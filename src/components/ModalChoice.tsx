'use client';

import { ChoiceRequest, ChoiceResponse } from '../engine/models';
import Card from './Card';
import { useState } from 'react';

interface ModalChoiceProps {
    choice: ChoiceRequest | null;
    onResponse: (response: ChoiceResponse) => void;
}

export default function ModalChoice({ choice, onResponse }: ModalChoiceProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    if (!choice) return null;

    const min = choice.min ?? 1;
    const max = choice.max ?? 1;
    const isMultiSelect = max > 1;
    const isOptional = choice.optional === true;

    const handleSelect = (optionId: string) => {
        // Single select mode - auto confirm
        if (!isMultiSelect) {
            onResponse({
                requestId: choice.id,
                playerId: choice.playerId,
                selectedIds: [optionId],
                declined: false,
                timestamp: Date.now()
            });
            return;
        }

        // Multi select mode - toggle
        setSelectedIds(prev => {
            if (prev.includes(optionId)) {
                return prev.filter(id => id !== optionId);
            } else {
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

    return (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            {/* Modal Container */}
            <div className="bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 rounded-xl shadow-2xl max-w-2xl w-full border border-yellow-500/50 overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 p-4 border-b border-yellow-500/30">
                    <div className="flex items-center gap-4">
                        {/* Source Card Mini Preview */}
                        {choice.source.card && (
                            <div className="w-16 h-22 flex-shrink-0 hidden sm:block">
                                <Card
                                    card={choice.source.card}
                                    disableHoverZoom={false}
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
                            {/* Ability Text */}
                            {choice.source.abilityText && (
                                <div className="text-gray-300 italic text-sm mt-2 border-l-2 border-purple-500/50 pl-3">
                                    "{choice.source.abilityText}"
                                </div>
                            )}
                            {/* Source Card Name */}
                            {choice.source.card && (
                                <div className="text-sm text-gray-400 mt-1">
                                    from <span className="text-blue-400">{choice.source.card.fullName || choice.source.card.name}</span>
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

                {/* Selection Info (Multi-select only) */}
                {isMultiSelect && (
                    <div className="bg-slate-900/50 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
                        <div className="text-gray-300 text-sm">
                            {`Select ${min === max ? max : `${min} to ${max}`} options`}
                        </div>
                        {selectedIds.length > 0 && (
                            <div className="text-yellow-400 text-sm font-semibold">
                                {selectedIds.length} selected
                            </div>
                        )}
                    </div>
                )}

                {/* Options List */}
                <div className={`p-4 max-h-[60vh] overflow-y-auto custom-scrollbar ${choice.options.some(o => o.card) ? 'grid grid-cols-2 gap-4' : 'space-y-2'}`}>
                    {choice.options.map((option, index) => {
                        const isSelected = selectedIds.includes(option.id);

                        return (
                            <button
                                key={option.id}
                                onClick={() => handleSelect(option.id)}
                                disabled={!option.valid}
                                className={`
                                    rounded-lg text-left transition-all border relative overflow-hidden group
                                    ${option.card ? 'p-0 aspect-[2.5/3.5]' : 'w-full p-4'}
                                    ${option.valid && !isMultiSelect
                                        ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/40 hover:to-purple-600/40 border-blue-500/30 hover:border-blue-500/60 text-white cursor-pointer'
                                        : ''
                                    }
                                    ${isMultiSelect && isSelected
                                        ? 'bg-yellow-600/20 border-yellow-500 ring-2 ring-yellow-400 text-white'
                                        : ''
                                    }
                                    ${isMultiSelect && !isSelected && option.valid
                                        ? 'bg-slate-700/50 border-slate-600 text-gray-300 hover:bg-slate-700 cursor-pointer'
                                        : ''
                                    }
                                    ${!option.valid ? 'bg-slate-800/50 border-slate-700 opacity-50 cursor-not-allowed text-gray-500' : ''}
                                `}
                            >
                                {option.card ? (
                                    <div className="w-full h-full p-2 flex flex-col items-center justify-center">
                                        <div className="w-full relative z-10">
                                            <Card card={option.card} disableHoverZoom={false} />
                                        </div>
                                        {/* Selection indicator overlay */}
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-yellow-500/20 z-0 flex items-center justify-center pointer-events-none">
                                                <div className="bg-yellow-400 rounded-full p-2 shadow-lg">
                                                    <span className="text-black font-bold text-xl">✓</span>
                                                </div>
                                            </div>
                                        )}
                                        {!option.valid && option.invalidReason && (
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-red-300 text-xs p-1 text-center truncate z-20">
                                                {option.invalidReason}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 text-sm
                                            ${isMultiSelect && isSelected
                                                ? 'bg-yellow-400 text-black'
                                                : 'bg-white/10 text-white/70'
                                            }
                                        `}>
                                            {isMultiSelect && isSelected
                                                ? (selectedIds.indexOf(option.id) + 1)
                                                : (index + 1)
                                            }
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold">{option.display}</div>
                                            {!option.valid && option.invalidReason && (
                                                <div className="text-xs text-red-400 mt-1">
                                                    ⚠️ {option.invalidReason}
                                                </div>
                                            )}
                                        </div>
                                        {isMultiSelect && isSelected && (
                                            <div className="text-yellow-400 text-xl">✓</div>
                                        )}
                                        {!isMultiSelect && option.valid && (
                                            <div className="text-blue-400 text-sm">→</div>
                                        )}
                                    </div>
                                )}
                            </button>
                        );
                    })}
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

                    {/* Confirm Button (Multi-select only) */}
                    {isMultiSelect && (
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
                            Confirm ({selectedIds.length}/{max})
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
