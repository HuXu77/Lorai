'use client';

import { ChoiceRequest, ChoiceResponse, ChoiceType } from '../engine/models';
import Card from './Card';

interface MayChoiceModalProps {
    choice: ChoiceRequest | null;
    onResponse: (response: ChoiceResponse) => void;
}

/**
 * MayChoiceModal - Unified modal for all "you may" optional abilities
 * 
 * Features:
 * - Clear Yes/No button pair with consistent styling
 * - Source card display with ability name
 * - Works for simple "may draw" and compound "may X, then Y" abilities
 * - Skips to "No" if declined
 */
export default function MayChoiceModal({ choice, onResponse }: MayChoiceModalProps) {
    if (!choice) return null;

    // Determine if this is a simple Yes/No or has specific options
    const isSimpleYesNo = choice.options.length === 2 &&
        choice.options.some(o => o.id === 'yes' || o.id === 'accept') &&
        choice.options.some(o => o.id === 'no' || o.id === 'decline');

    const handleYes = () => {
        const yesOption = choice.options.find(o => o.id === 'yes' || o.id === 'accept' || o.valid);
        onResponse({
            requestId: choice.id,
            playerId: choice.playerId,
            selectedIds: [yesOption?.id || 'yes'],
            declined: false,
            timestamp: Date.now()
        });
    };

    const handleNo = () => {
        onResponse({
            requestId: choice.id,
            playerId: choice.playerId,
            selectedIds: [],
            declined: true,
            timestamp: Date.now()
        });
    };

    const handleOptionSelect = (optionId: string) => {
        onResponse({
            requestId: choice.id,
            playerId: choice.playerId,
            selectedIds: [optionId],
            declined: false,
            timestamp: Date.now()
        });
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[10000] flex items-center justify-center p-4">
            <div data-testid="choice-modal" className="bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border border-amber-500/40 overflow-hidden">

                {/* Header with Source Card */}
                <div className="bg-gradient-to-r from-amber-900/30 to-slate-800/80 p-5 border-b border-amber-500/20">
                    <div className="flex items-start gap-4">
                        {/* Source Card Preview */}
                        {choice.source?.card && (
                            <div className="w-20 flex-shrink-0 hidden sm:block">
                                <Card
                                    card={choice.source.card}
                                    disableHoverZoom={true}
                                />
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            {/* "MAY" Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 mb-3">
                                <span className="text-amber-400 text-lg">✨</span>
                                <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">Optional Effect</span>
                            </div>

                            {/* Ability Name */}
                            {choice.source?.abilityName && (
                                <div className="text-purple-400 text-sm font-semibold mb-1">
                                    {choice.source.abilityName}
                                </div>
                            )}

                            {/* Main Prompt */}
                            <h2 className="text-xl font-bold text-white leading-tight">
                                {choice.prompt}
                            </h2>

                            {/* Source Card Name */}
                            {choice.source?.card && (
                                <div className="text-sm text-gray-400 mt-2">
                                    from <span className="text-blue-400 font-medium">{choice.source.card.fullName || choice.source.card.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="p-6">
                    {isSimpleYesNo ? (
                        /* Simple Yes/No Layout */
                        <div className="flex gap-4">
                            <button
                                onClick={handleNo}
                                className="
                                    flex-1 py-4 px-6 rounded-xl font-bold text-lg
                                    bg-slate-700/80 hover:bg-slate-600 
                                    text-gray-300 hover:text-white
                                    border border-slate-600 hover:border-slate-500
                                    transition-all transform hover:-translate-y-0.5
                                "
                            >
                                No, Skip
                            </button>
                            <button
                                onClick={handleYes}
                                className="
                                    flex-1 py-4 px-6 rounded-xl font-bold text-lg
                                    bg-gradient-to-r from-amber-500 to-yellow-500 
                                    hover:from-amber-400 hover:to-yellow-400
                                    text-black shadow-lg shadow-amber-500/30
                                    transition-all transform hover:-translate-y-0.5 hover:scale-[1.02]
                                "
                            >
                                Yes!
                            </button>
                        </div>
                    ) : (
                        /* Multiple Options Layout */
                        <div className="space-y-3">
                            {choice.options.filter(o => o.valid).map((option, idx) => (
                                <button
                                    key={option.id}
                                    onClick={() => handleOptionSelect(option.id)}
                                    className="
                                        w-full py-4 px-6 rounded-xl font-semibold text-left
                                        bg-gradient-to-r from-blue-600/20 to-purple-600/20 
                                        hover:from-blue-600/40 hover:to-purple-600/40
                                        border border-blue-500/30 hover:border-blue-500/60
                                        text-white transition-all
                                        flex items-center gap-3
                                    "
                                >
                                    <span className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center text-blue-300 font-bold">
                                        {idx + 1}
                                    </span>
                                    <span className="flex-1">{option.display}</span>
                                    <span className="text-blue-400">→</span>
                                </button>
                            ))}

                            {/* Skip Button for multi-option */}
                            <button
                                onClick={handleNo}
                                className="
                                    w-full py-3 px-6 rounded-xl font-medium
                                    bg-slate-700/50 hover:bg-slate-600/50
                                    text-gray-400 hover:text-gray-200
                                    border border-slate-600/50
                                    transition-all mt-2
                                "
                            >
                                Skip this effect
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer hint */}
                <div className="px-6 pb-4 text-center">
                    <p className="text-xs text-gray-500">
                        This is an optional "may" ability. You can choose to skip it.
                    </p>
                </div>
            </div>
        </div>
    );
}
