'use client';

import { TurnPhase, PHASE_INFO } from '../types/turn';

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
    availableInk,
    onEndTurn
}: TurnFlowProps) {
    const isYourTurn = activePlayer === 'player';
    const canEndTurn = isYourTurn && currentPhase === TurnPhase.MAIN;
    const phaseInfo = PHASE_INFO[currentPhase];

    return (
        <div className="flex items-center justify-between px-2">
            {/* Left Container: Turn Info */}
            <div className="flex items-center gap-2 bg-black bg-opacity-40 px-3 py-1.5 rounded-lg border border-gray-700 text-sm">
                {/* Turn indicator */}
                <span className={isYourTurn ? 'text-green-400' : 'text-red-400'}>
                    {isYourTurn ? '🟢' : '🔴'}
                </span>
                <span className="text-gray-400 text-xs">{isYourTurn ? 'Your Turn' : 'Opponent'}</span>
                <span className="text-gray-600">•</span>
                {/* Turn number */}
                <span className="text-gray-500 text-xs">T{currentTurn}</span>
                <span className="text-gray-600">•</span>
                {/* Phase */}
                <span className={`text-xs ${phaseInfo.textClass}`}>
                    {phaseInfo.icon} {phaseInfo.label}
                </span>
            </div>

            {/* Middle: Empty space for play area visibility */}
            <div className="flex-1" />

            {/* Right Container: Ink + End Turn */}
            <div className="flex items-center gap-3">
                {/* Available Ink */}
                <div className="flex items-center gap-1.5 bg-blue-900 bg-opacity-50 px-3 py-1.5 rounded-lg border border-blue-800">
                    <span className="text-blue-300 font-bold">◆</span>
                    <span className="text-white font-bold">{availableInk}</span>
                    <span className="text-blue-400 text-xs">ink</span>
                </div>

                {/* End Turn Button */}
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
        </div>
    );
}
