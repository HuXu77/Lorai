'use client';

import React, { useState } from 'react';
import { CardInstance } from '../engine/models';
import ZoomableCard from './ZoomableCard';
import CardSelectionChoice from './CardSelectionChoice';

import { getShiftCost, isSong } from '../utils/ability-helpers';

interface CardActionMenuProps {
    card: CardInstance;
    /** Whether the player has already inked this turn */
    hasInkedThisTurn: boolean;
    /** Available ink (ready inkwell cards) */
    availableInk: number;
    /** Whether it's the player's turn */
    isYourTurn: boolean;
    /** Modified cost after applying cost reductions (defaults to card.cost) */
    modifiedCost?: number;
    /** Characters that can be shifted onto (same name, in play) */
    shiftTargets?: CardInstance[];
    /** Characters that can sing this song (ready, not drying, cost >= song cost) */
    eligibleSingers?: CardInstance[];
    /** Original base cost (before modifications) */
    originalCost?: number;
    /** Callbacks */
    onInk: () => void;
    onPlay: () => void;
    onShift?: (targetId: string) => void;
    onSing?: (singerId: string) => void;
    onCancel: () => void;
    /** Whether playing this card is blocked by game rules/effects */
    isBlocked?: { reason: string } | null;
}

export default function CardActionMenu({
    card,
    hasInkedThisTurn,
    availableInk,
    isYourTurn,
    modifiedCost,
    originalCost,
    shiftTargets = [],
    eligibleSingers = [],
    onInk,
    onPlay,
    onShift,
    onSing,
    onCancel,
    isBlocked,
}: CardActionMenuProps) {
    // Use modifiedCost if provided, otherwise fall back to card.cost
    const effectiveCost = modifiedCost ?? card.cost;
    // Use originalCost if provided, otherwise fall back to card.cost
    const comparativeCost = originalCost ?? card.cost;
    const hasReduction = effectiveCost < comparativeCost;
    const [showShiftTargets, setShowShiftTargets] = useState(false);
    const [showSingerSelection, setShowSingerSelection] = useState(false);

    const shiftCost = getShiftCost(card);
    const canShift = shiftCost !== null && shiftTargets.length > 0 && availableInk >= shiftCost && isYourTurn && !isBlocked;
    const canInk = card.inkwell && !hasInkedThisTurn && isYourTurn;
    const canPlay = availableInk >= effectiveCost && isYourTurn && !isBlocked;
    const inkNeeded = Math.max(0, effectiveCost - availableInk);

    // Song-specific checks
    const isSongCard = isSong(card);
    const canSing = isSongCard && eligibleSingers.length > 0 && isYourTurn && onSing && !isBlocked;

    // Show shift target selection
    if (showShiftTargets && onShift) {
        // Construct a mock ChoiceRequest for the unified component
        const shiftChoiceRequest: import('../engine/models').ChoiceRequest = {
            id: 'shift-selection',
            type: 'target_character' as any, // Cast to any to satisfy strict enum matching if needed
            playerId: card.ownerId,
            prompt: `Shift ${card.name} (${shiftCost}◆) onto one of these characters:`,
            options: shiftTargets.map(target => ({
                id: target.instanceId,
                display: target.fullName || target.name,
                label: target.fullName || target.name,
                value: target.instanceId,
                card: target,
                valid: true
            })),
            min: 1,
            max: 1,
            optional: true, // Can cancel
            source: {
                card: card,
                abilityName: 'Shift',
                player: { id: card.ownerId } as any // Minimal player object
            },
            timestamp: Date.now()
        };

        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                onClick={() => setShowShiftTargets(false)}
            >
                {/* Use the shared CardSelectionChoice component */}
                <div onClick={(e) => e.stopPropagation()}>
                    <CardSelectionChoice
                        choice={shiftChoiceRequest}
                        onResponse={(response) => {
                            if (response.declined || response.selectedIds.length === 0) {
                                setShowShiftTargets(false);
                            } else {
                                onShift(response.selectedIds[0]);
                                setShowShiftTargets(false);
                            }
                        }}
                    />
                </div>
            </div>
        );
    }

    // Show singer selection for songs
    if (showSingerSelection && onSing) {
        // Construct a mock ChoiceRequest for the unified component
        const singerChoiceRequest: import('../engine/models').ChoiceRequest = {
            id: 'singer-selection',
            type: 'target_character' as any,
            playerId: card.ownerId,
            prompt: `🎵 Choose a character to sing "${card.name}"`,
            options: eligibleSingers.map(singer => ({
                id: singer.instanceId,
                display: `${singer.fullName || singer.name} (${singer.cost}⬡)`,
                label: singer.fullName || singer.name,
                value: singer.instanceId,
                card: singer,
                valid: true
            })),
            min: 1,
            max: 1,
            optional: true, // Can cancel
            source: {
                card: card,
                abilityName: 'Sing',
                player: { id: card.ownerId } as any
            },
            timestamp: Date.now()
        };

        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                onClick={() => setShowSingerSelection(false)}
            >
                {/* Use the shared CardSelectionChoice component */}
                <div onClick={(e) => e.stopPropagation()}>
                    <CardSelectionChoice
                        choice={singerChoiceRequest}
                        onResponse={(response) => {
                            if (response.declined || response.selectedIds.length === 0) {
                                setShowSingerSelection(false);
                            } else {
                                onSing(response.selectedIds[0]);
                                setShowSingerSelection(false);
                            }
                        }}
                    />
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
                            Cost: <span className="text-blue-400 font-bold">
                                {hasReduction ? (
                                    <><s className="text-gray-500">{card.cost}</s> → <span className="text-green-400">{effectiveCost}◆</span></>
                                ) : (
                                    <>{card.cost}◆</>
                                )}
                            </span>
                            {card.inkwell && (
                                <span className="ml-2 text-purple-400">• Inkable</span>
                            )}
                            {shiftCost !== null && (
                                <span className="ml-2 text-cyan-400">• Shift {shiftCost}◆</span>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2 mt-auto">
                            {/* Shift Action - shown first if available */}
                            {shiftCost !== null && (
                                canShift ? (
                                    <button
                                        onClick={() => setShowShiftTargets(true)}
                                        className="w-full px-4 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span className="text-xl">⬆️</span>
                                        Shift ({shiftCost}◆) - {shiftTargets.length} target{shiftTargets.length !== 1 ? 's' : ''}
                                    </button>
                                ) : (
                                    <button
                                        disabled
                                        className="w-full px-4 py-3 bg-gray-700 text-gray-400 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <span className="text-xl">⬆️</span>
                                        {isBlocked
                                            ? `Blocked: ${isBlocked.reason}`
                                            : shiftTargets.length === 0
                                                ? `No ${card.name} in play to shift onto`
                                                : `Need ${shiftCost - availableInk} more ◆ to shift`
                                        }
                                    </button>
                                )
                            )}

                            {/* Sing Action - shown for songs */}
                            {isSongCard && (
                                canSing ? (
                                    <button
                                        onClick={() => setShowSingerSelection(true)}
                                        className="w-full px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span className="text-xl">🎵</span>
                                        Sing with Character ({eligibleSingers.length} available)
                                    </button>
                                ) : (
                                    <button
                                        disabled
                                        className="w-full px-4 py-3 bg-gray-700 text-gray-400 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <span className="text-xl">🎵</span>
                                        {isBlocked
                                            ? `Blocked: ${isBlocked.reason}`
                                            : eligibleSingers.length === 0
                                                ? `No characters can sing this`
                                                : `Not your turn`
                                        }
                                    </button>
                                )
                            )}

                            {/* Ink Action */}
                            {canInk ? (
                                <button
                                    onClick={onInk}
                                    className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="text-xl">🔵</span>
                                    Ink This Card
                                </button>
                            ) : card.inkwell && hasInkedThisTurn ? (
                                <button
                                    disabled
                                    className="w-full px-4 py-3 bg-gray-700 text-gray-400 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <span className="text-xl">🔵</span>
                                    Already Inked This Turn
                                </button>
                            ) : null}

                            {/* Play Action */}
                            {canPlay ? (
                                <button
                                    onClick={onPlay}
                                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="text-xl">▶️</span>
                                    Play Card ({effectiveCost}◆){hasReduction && ' (reduced!)'}
                                </button>
                            ) : (
                                <button
                                    disabled
                                    className="w-full px-4 py-3 bg-gray-700 text-gray-400 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <span className="text-xl">▶️</span>
                                    {isBlocked
                                        ? `Blocked: ${isBlocked.reason}`
                                        : `Need ${inkNeeded} More ◆`}
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
            </div>
        </div>
    );
}
