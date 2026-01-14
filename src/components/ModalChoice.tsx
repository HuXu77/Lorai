'use client';

import { ChoiceRequest, ChoiceResponse } from '../engine/models';
import Card from './Card';
import { useState } from 'react';
import ChoiceContainer from './ChoiceContainer';

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

    const instructionText = (
        <div className="flex items-center justify-between w-full text-gray-300 text-sm">
            <div>
                {isMultiSelect
                    ? `Select ${min === max ? max : `${min} to ${max}`} options`
                    : 'Select an option'
                }
            </div>
            {isMultiSelect && selectedIds.length > 0 && (
                <div className="text-yellow-400 font-semibold">
                    {selectedIds.length} selected
                </div>
            )}
        </div>
    );

    return (
        <ChoiceContainer
            prompt={choice.prompt}
            sourceCard={choice.source?.card}
            sourceAbilityName={choice.source?.abilityName}
            sourceAbilityText={choice.source?.abilityText}
            isOptional={isOptional}
            onCancel={isOptional ? handleDecline : undefined}
            onConfirm={isMultiSelect ? handleConfirm : undefined}
            canConfirm={canConfirm}
            confirmLabel={`Confirm (${selectedIds.length}/${max})`}
            instructionText={isMultiSelect ? instructionText : undefined}
        >
            {/* Options List */}
            <div className={`${choice.options.some(o => o.card) ? 'grid grid-cols-2 gap-4' : 'space-y-2'}`}>
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
        </ChoiceContainer>
    );
}
