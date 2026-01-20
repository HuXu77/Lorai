'use client';

import { TurnPhase } from '../types/turn';

interface TurnFlowProps {
    currentTurn: number;
    currentPhase: TurnPhase;
    activePlayer: 'player' | 'opponent';
    availableInk: number;
    onEndTurn: () => void;
    children?: React.ReactNode;
}

export default function TurnFlow({
    currentTurn,
    currentPhase,
    activePlayer,
    onEndTurn,
    children
}: TurnFlowProps) {
    const isYourTurn = activePlayer === 'player';
    const canEndTurn = isYourTurn && currentPhase === TurnPhase.MAIN;

    return (
        <div className="flex items-center justify-between px-2 pb-2">
            {/* Left Container: Turn Info */}
            <div className="flex items-center gap-2 px-4 py-2 text-sm bg-black bg-opacity-20 rounded-xl border border-white/10 backdrop-blur-sm shadow-sm">
                <span className={isYourTurn ? 'text-green-400' : 'text-red-400'}>
                    {isYourTurn ? '🟢' : '🔴'}
                </span>
                <span className="text-gray-300 text-xs font-medium">
                    {isYourTurn ? 'Your Turn' : "Opponent's Turn"}
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-400 text-xs">Turn {currentTurn}</span>
            </div>

            {/* Middle: Opponent Hand Info */}
            <div className="flex-1 flex justify-center">
                {children}
            </div>

            {/* Right Container: End Turn Only */}
            <div className="bg-black bg-opacity-20 rounded-xl p-1.5 border border-white/10 backdrop-blur-sm shadow-sm">
                <button
                    onClick={onEndTurn}
                    disabled={!canEndTurn}
                    className={`px-6 py-1.5 rounded-lg font-bold text-sm transition-all shadow-md ${canEndTurn
                        ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white cursor-pointer border border-green-400 hover:shadow-green-500/20'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50 border border-gray-600'
                        }`}
                >
                    End Turn ▶
                </button>
            </div>
        </div>
    );
}
