'use client';

import React from 'react';

interface GameHeaderProps {
    /** Debug button handlers - only used in development */
    debugActions?: {
        onTestCardPlayed?: () => void;
        onTestAbility?: () => void;
        onTestCombat?: () => void;
        onTestLore?: () => void;
        onTestTurn?: () => void;
        onTestModal?: () => void;
        onTestTargeting?: () => void;
        onToggleOpponentHand?: () => void;
        onShowAnimations?: () => void;
    };
    /** Whether opponent hand is currently revealed */
    opponentHandRevealed?: boolean;
}

/**
 * Game Header Component
 * 
 * Displays the game title and debug buttons (development only).
 * Uses transparent background by default.
 */
export default function GameHeader({
    debugActions,
    opponentHandRevealed = false
}: GameHeaderProps) {
    const isDev = process.env.NODE_ENV !== 'production';

    return (
        <div className="game-header flex items-center justify-between p-4">
            <h1 className="text-2xl font-bold text-white">🎮 Lorai • Lorcana</h1>

            {isDev && debugActions && (
                <div className="flex gap-2">
                    {/* Test buttons for log system */}
                    {debugActions.onTestCardPlayed && (
                        <button onClick={debugActions.onTestCardPlayed} className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">🎴</button>
                    )}
                    {debugActions.onTestAbility && (
                        <button onClick={debugActions.onTestAbility} className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs">⚡</button>
                    )}
                    {debugActions.onTestCombat && (
                        <button onClick={debugActions.onTestCombat} className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">⚔️</button>
                    )}
                    {debugActions.onTestLore && (
                        <button onClick={debugActions.onTestLore} className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs">◆</button>
                    )}
                    {debugActions.onTestTurn && (
                        <button onClick={debugActions.onTestTurn} className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs">🔄</button>
                    )}

                    <div className="border-l border-gray-600 mx-2"></div>

                    {/* Test buttons for choice system */}
                    {debugActions.onTestModal && (
                        <button onClick={debugActions.onTestModal} className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">
                            🎴 Test Modal
                        </button>
                    )}
                    {debugActions.onTestTargeting && (
                        <button onClick={debugActions.onTestTargeting} className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm">
                            🎯 Test Targeting
                        </button>
                    )}
                    {debugActions.onToggleOpponentHand && (
                        <button onClick={debugActions.onToggleOpponentHand} className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm">
                            {opponentHandRevealed ? '🔒 Hide' : '🔍 Reveal'} Opp Hand
                        </button>
                    )}
                    {debugActions.onShowAnimations && (
                        <button onClick={debugActions.onShowAnimations} className="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded text-sm font-medium">
                            🎬 Animations
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
