'use client';

import { TurnPhase } from '../types/turn';

interface TurnFlowProps {
    currentTurn: number;
    currentPhase: TurnPhase;
    activePlayer: 'player' | 'opponent';
    availableInk: number;
    onEndTurn: () => void;
}

export default function TurnFlow({
    currentTurn,
    currentPhase,
    activePlayer,
    onEndTurn
}: TurnFlowProps) {
    const isYourTurn = activePlayer === 'player';
    const canEndTurn = isYourTurn && currentPhase === TurnPhase.MAIN;

    return (
        <div className="flex items-center justify-between px-2 pb-2">
            {/* Left Container: Turn Info */}
            <div className="flex items-center gap-2 bg-black bg-opacity-40 px-3 py-1.5 rounded-lg border border-gray-700 text-sm">
                <span className={isYourTurn ? 'text-green-400' : 'text-red-400'}>
                    {isYourTurn ? '🟢' : '🔴'}
                </span>
                <span className="text-gray-300 text-xs">
                    {isYourTurn ? 'Your Turn' : "Opponent's Turn"}
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-400 text-xs">Turn {currentTurn}</span>
            </div>

            {/* Middle: Empty space for play area visibility */}
            <div className="flex-1" />

            {/* Right Container: End Turn Only */}
            <button
                onClick={onEndTurn}
                disabled={!canEndTurn}
                className={`px-4 py-1.5 rounded-lg font-semibold text-sm transition-all ${canEndTurn
                    ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer border border-green-500'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50 border border-gray-600'
                    }`}
            >
                End Turn ▶
            </button>
        </div>
    );
}
