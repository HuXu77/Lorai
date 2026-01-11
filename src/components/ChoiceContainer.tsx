
'use client';

import React from 'react';
import Card from './Card';
import { CardInstance } from '../engine/models';

interface ChoiceContainerProps {
    title?: string; // Top left specific title (e.g. "Card Ordering")
    prompt: string; // Main prompt (e.g. "Select a target")
    sourceCard?: CardInstance;
    sourceAbilityName?: string;
    sourceAbilityText?: string;

    isOptional?: boolean;
    onCancel?: () => void;

    onConfirm?: () => void;
    canConfirm?: boolean;
    confirmLabel?: string;

    instructionText?: React.ReactNode;
    children: React.ReactNode;
    'data-testid'?: string;
}

export default function ChoiceContainer({
    title,
    prompt,
    sourceCard,
    sourceAbilityName,
    sourceAbilityText,
    isOptional = false,
    onCancel,
    onConfirm,
    canConfirm = false,
    confirmLabel = 'Confirm',
    instructionText,
    'data-testid': testId,
    children
}: ChoiceContainerProps) {
    return (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            {/* Modal Container */}
            <div data-testid={testId} className="bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 rounded-xl shadow-2xl max-w-5xl w-full border border-yellow-500/50 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 p-4 border-b border-yellow-500/30 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        {/* Source Card Mini Preview */}
                        {sourceCard && (
                            <div className="w-16 h-22 flex-shrink-0 hidden sm:block">
                                <Card
                                    card={sourceCard}
                                    disableHoverZoom={false}
                                />
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            {/* Pre-title / Ability Name */}
                            {(title || sourceAbilityName) && (
                                <div className="text-purple-400 text-sm font-semibold mb-1 flex items-center gap-2">
                                    <span className="text-lg">✨</span>
                                    {title || sourceAbilityName || 'Ability'}
                                </div>
                            )}

                            {/* Main Prompt */}
                            <h2 className="text-xl font-bold text-yellow-300 leading-tight">
                                {prompt}
                            </h2>

                            {/* Source Context */}
                            {sourceCard && !title && (
                                <div className="text-sm text-gray-400 mt-1">
                                    from <span className="text-blue-400">{sourceCard.fullName || sourceCard.name}</span>
                                </div>
                            )}

                            {/* Ability Text Quote */}
                            {sourceAbilityText && (
                                <div className="mt-2 text-sm text-gray-300 bg-slate-900/50 rounded px-3 py-2 border-l-2 border-purple-500 italic max-h-20 overflow-y-auto custom-scrollbar">
                                    "{sourceAbilityText}"
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

                {/* Instruction Bar */}
                {instructionText && (
                    <div className="bg-slate-900/50 px-4 py-2 border-b border-slate-700 flex-shrink-0">
                        {instructionText}
                    </div>
                )}

                {/* Main Content (Scrollable) */}
                <div className="p-4 overflow-y-auto custom-scrollbar flex-1 min-h-0">
                    {children}
                </div>

                {/* Footer Actions */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 border-t border-slate-700 flex items-center justify-center gap-4 flex-shrink-0">
                    {/* Cancel Button - ONLY for optional effects or explicit cancel handler */}
                    {(isOptional || onCancel) && (
                        <button
                            onClick={onCancel}
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
                    {onConfirm && (
                        <button
                            onClick={onConfirm}
                            disabled={!canConfirm}
                            className={`
                                px-8 py-3 rounded-lg font-bold text-base transition-all shadow-lg min-w-[180px]
                                ${canConfirm
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white transform hover:scale-105 border border-green-400/50'
                                    : 'bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600'
                                }
                            `}
                        >
                            {confirmLabel}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
