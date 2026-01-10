'use client';

import React, { useState } from 'react';
import { CardInstance } from '../engine/models';
import ZoomableCard from './ZoomableCard';
import { getBoostCost, getActivatedAbilities, hasAbilityKeyword } from '../utils/ability-helpers';

interface PlayAreaActionMenuProps {
    card: CardInstance;
    /** Whether it's the player's turn */
    isYourTurn: boolean;
    /** Card was just played and can't act (drying) */
    isDrying?: boolean;
    /** Opponent's exerted characters that can be challenged */
    challengeTargets: CardInstance[];
    /** Available ink (ready inkwell cards) for Boost */
    availableInk?: number;
    /** Current turn number for tracking Boost usage */
    currentTurn?: number;
    /** Callbacks */
    onQuest: () => void;
    onChallenge: (targetId: string) => void;
    onBoost?: () => void;
    onUseAbility?: (abilityIndex: number) => void;
    onMove?: (locationId: string) => void;
    moveTargets?: Array<{ card: CardInstance, cost: number }>;
    onCancel: () => void;
}

export default function PlayAreaActionMenu({
    card,
    isYourTurn,
    isDrying = false,
    challengeTargets,
    availableInk = 0,
    currentTurn = 0,
    onQuest,
    onChallenge,
    onBoost,
    onUseAbility,
    onMove,
    moveTargets = [],
    onCancel,
}: PlayAreaActionMenuProps) {
    const [showTargetSelection, setShowTargetSelection] = useState(false);
    const [showMoveSelection, setShowMoveSelection] = useState(false);

    const isCharacter = card.type === 'Character';
    const isReady = card.ready;

    // Check keywords
    const hasRush = hasAbilityKeyword(card, 'rush');
    const hasReckless = hasAbilityKeyword(card, 'reckless');

    // Card cannot act if it's drying (just played this turn), unless it has Rush (for challenging only)
    const canQuest = isCharacter && isReady && isYourTurn && !isDrying && (card.lore || 0) > 0 && !hasReckless;

    // Challenge logic: Ready + Turn + (Not Drying OR Rush) + Targets + Strength > 0
    // Note: Reckless "must challenge if able" doesn't force the click, but enables it.
    const canChallenge = isCharacter && isReady && isYourTurn && (!isDrying || hasRush) && challengeTargets.length > 0 && (card.strength || 0) > 0;

    const boostCost = getBoostCost(card);
    const hasBoostUsedThisTurn = card.meta?.usedAbilities?.boost === currentTurn;
    const canBoost = boostCost !== null && isYourTurn && availableInk >= boostCost && !hasBoostUsedThisTurn && onBoost;

    if (showMoveSelection) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                onClick={() => setShowMoveSelection(false)}
            >
                <div
                    className="bg-slate-900 border border-slate-600 rounded-xl p-6 shadow-2xl max-w-2xl w-full animate-in fade-in zoom-in duration-150"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h3 className="text-xl font-bold text-white mb-4">
                        Move {card.name} to...
                    </h3>

                    <div className="flex flex-wrap gap-8 justify-center mb-4">
                        {moveTargets.map(({ card: location, cost }) => {
                            const canAfford = availableInk >= cost;
                            return (
                                <div
                                    key={location.instanceId}
                                    className={`
                                    cursor-pointer transition-transform hover:scale-105 flex flex-col items-center p-2
                                    ${canAfford ? '' : 'opacity-50 grayscale'}
                                `}
                                    onClick={() => {
                                        if (canAfford) {
                                            onMove && onMove(location.instanceId);
                                            setShowMoveSelection(false);
                                        }
                                    }}
                                >
                                    {/* Wrapper for rotated location card - rotate 90deg for horizontal display */}
                                    <div className={`rotate-90 origin-center my-8 rounded-lg ${canAfford ? 'hover:ring-2 hover:ring-cyan-500' : ''}`}>
                                        <ZoomableCard
                                            card={location}
                                            size="md"
                                            zoomTrigger="hover"
                                        />
                                    </div>
                                    <div className={`text-center text-sm font-bold ${canAfford ? 'text-cyan-400' : 'text-red-500'}`}>
                                        Move Cost: {cost}⬡
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <button
                        onClick={() => setShowMoveSelection(false)}
                        className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    // Challenge Target Selection Modal
    if (showTargetSelection) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                onClick={() => setShowTargetSelection(false)}
            >
                <div
                    className="bg-slate-900 border border-slate-600 rounded-xl p-6 shadow-2xl max-w-2xl w-full animate-in fade-in zoom-in duration-150"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h3 className="text-xl font-bold text-white mb-4">
                        Challenge with {card.name}...
                    </h3>

                    <div className="flex flex-wrap gap-4 justify-center mb-4">
                        {challengeTargets.map((target) => (
                            <div
                                key={target.instanceId}
                                className="cursor-pointer transition-transform hover:scale-105 rounded-lg hover:ring-2 hover:ring-red-500"
                                onClick={() => {
                                    onChallenge(target.instanceId);
                                    setShowTargetSelection(false);
                                }}
                            >
                                <ZoomableCard
                                    card={target}
                                    size="md"
                                    zoomTrigger="none"
                                />
                                <div className="text-center text-sm mt-1 text-red-400 font-bold">
                                    {target.strength}⚔️ / {target.willpower}❤️
                                    {target.damage > 0 && <span className="ml-1 text-orange-400">({target.damage} dmg)</span>}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => setShowTargetSelection(false)}
                        className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
        >
            <div
                className="bg-slate-900 border border-slate-600 rounded-xl p-6 shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Card Preview */}
                <div className="flex gap-6">
                    <div className="flex-shrink-0">
                        <ZoomableCard
                            card={card}
                            size="lg"
                            zoomTrigger="none"
                        />
                    </div>

                    {/* Card Info & Actions */}
                    <div className="flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-white mb-1">{card.fullName || card.name}</h3>
                        <div className="text-sm text-gray-400 mb-2">
                            {isCharacter && (
                                <>
                                    <span className="text-orange-400">{card.strength}⚔️</span>
                                    <span className="mx-1">/</span>
                                    <span className="text-red-400">{card.willpower}❤️</span>
                                    <span className="mx-1">|</span>
                                    <span className="text-yellow-400">{card.lore}◆ Lore</span>
                                </>
                            )}
                        </div>
                        <div className="text-xs text-gray-500 mb-4">
                            Status: {isReady ? (
                                <span className="text-green-400">Ready</span>
                            ) : (
                                <span className="text-orange-400">Exerted</span>
                            )}
                            {card.damage > 0 && (
                                <span className="ml-2 text-red-400">{card.damage} damage</span>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2 mt-auto">
                            {/* Quest Action */}
                            {isCharacter && (
                                canQuest ? (
                                    <button
                                        onClick={onQuest}
                                        className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span className="text-xl">◆</span>
                                        Quest for {card.lore} Lore
                                    </button>
                                ) : (
                                    <button
                                        disabled
                                        className="w-full px-4 py-3 bg-gray-700 text-gray-400 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <span className="text-xl">◆</span>
                                        {isDrying
                                            ? '💧 Drying - Cannot Act'
                                            : hasReckless
                                                ? '🚫 Reckless - Cannot Quest'
                                                : !isReady
                                                    ? 'Must be Ready to Quest'
                                                    : !isYourTurn
                                                        ? 'Not Your Turn'
                                                        : 'Cannot Quest'}
                                    </button>
                                )
                            )}

                            {/* Challenge Action */}
                            {isCharacter && (
                                canChallenge ? (
                                    <button
                                        onClick={() => setShowTargetSelection(true)}
                                        className="w-full px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span className="text-xl">⚔️</span>
                                        Challenge ({challengeTargets.length} targets)
                                    </button>
                                ) : (
                                    <button
                                        disabled
                                        className="w-full px-4 py-3 bg-gray-700 text-gray-400 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <span className="text-xl">⚔️</span>
                                        {(!isDrying || hasRush)
                                            ? (!isReady ? 'Must be Ready' : challengeTargets.length === 0 ? 'No Targets' : 'Cannot Challenge')
                                            : '💧 Drying - Cannot Act'}
                                    </button>
                                )
                            )}

                            {/* Boost Action - for characters with Boost keyword */}
                            {boostCost !== null && (
                                canBoost ? (
                                    <button
                                        onClick={() => onBoost && onBoost()}
                                        className="w-full px-4 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span className="text-xl">📚</span>
                                        Boost ({boostCost}◆) - Place card under
                                    </button>
                                ) : (
                                    <button
                                        disabled
                                        className="w-full px-4 py-3 bg-gray-700 text-gray-400 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <span className="text-xl">📚</span>
                                        {hasBoostUsedThisTurn
                                            ? 'Boost already used this turn'
                                            : availableInk < boostCost
                                                ? `Need ${boostCost - availableInk} more ◆ to Boost`
                                                : 'Cannot Boost'}
                                    </button>
                                )
                            )}

                            {/* Generic Activated Abilities */}
                            {getActivatedAbilities(card).map((ability, index) => {
                                // Skip if it's a Boost ability (handled above)
                                if (ability.type === 'keyword' && (ability.keyword === 'Boost' || ability.keyword === 'boost')) return null;

                                const abilityCost = ability.inkCost || 0;
                                const exertCost = ability.exertCost;

                                const canAfford = availableInk >= abilityCost;
                                const canExert = !exertCost || (isReady && !isDrying);
                                // Simple check - actual check done in engine
                                const isUsable = isYourTurn && canAfford && canExert;

                                return (
                                    <button
                                        key={`ability-${index}`}
                                        onClick={() => onUseAbility && onUseAbility(index)}
                                        disabled={!isUsable}
                                        className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${isUsable
                                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        <span className="text-xl">✨</span>
                                        {ability.name || 'Ability'}
                                        {abilityCost > 0 && ` (${abilityCost}◆)`}
                                        {exertCost && ` (Exert)`}
                                    </button>
                                );
                            })}

                            {/* Move Action */}
                            {isCharacter && moveTargets.length > 0 && (
                                <button
                                    onClick={() => setShowMoveSelection(true)}
                                    className="w-full px-4 py-3 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="text-xl">🏰</span>
                                    Move to Location
                                </button>
                            )}

                            {/* Cancel */}
                            <button
                                onClick={onCancel}
                                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>

                {/* Not Your Turn Warning */}
                {!isYourTurn && (
                    <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded-lg text-yellow-300 text-sm text-center">
                        ⚠️ Wait for your turn
                    </div>
                )}

                {/* Exerted Warning */}
                {isYourTurn && !isReady && (
                    <div className="mt-4 p-3 bg-orange-900/30 border border-orange-600 rounded-lg text-orange-300 text-sm text-center">
                        This character is exerted and cannot act until your next turn
                    </div>
                )}

                {/* Drying Warning */}
                {isYourTurn && isReady && isDrying && (
                    <div className="mt-4 p-3 bg-blue-900/30 border border-blue-600 rounded-lg text-blue-300 text-sm text-center">
                        💧 Just played - drying! Cannot act until your next turn
                    </div>
                )}
            </div>
        </div>
    );
}
