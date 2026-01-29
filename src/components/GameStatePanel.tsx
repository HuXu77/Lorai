import React, { useRef } from 'react';
import InkPile from './InkPile';
import DiscardPile from './DiscardPile';
import { CardInstance } from '../engine/models';

interface GameStatePanelProps {
    playerName: string;
    lore: number;
    loreGoal: number;
    deckSize: number;
    handSize: number;
    isActive: boolean;
    hasPriority: boolean;
    testId?: string;
    // Optional props for Opponent View (passed from game page for opponent panel)
    inkwellCards?: CardInstance[];
    inkLabel?: string;
    discardCards?: CardInstance[];
    discardLabel?: string;
    onDiscardClick?: () => void;
}

export const GameStatePanel: React.FC<GameStatePanelProps> = ({
    playerName,
    lore,
    loreGoal,
    deckSize,
    handSize,
    isActive,
    hasPriority,
    testId,
    inkwellCards,
    inkLabel,
    discardCards,
    discardLabel,
    onDiscardClick
}) => {
    const deckRef = useRef<HTMLDivElement>(null);

    return (
        <div className={`
            rounded-xl p-4 transition-all duration-300 backdrop-blur-md border border-white/10 relative overflow-hidden group
            ${isActive
                ? 'bg-gradient-to-br from-indigo-900/90 to-purple-900/90 shadow-[0_0_25px_rgba(99,102,241,0.3)] border-indigo-400/30'
                : 'bg-black/60 hover:bg-black/70'
            }
        `}>
            {/* Player Name */}
            <div className="flex items-center justify-between mb-3">
                <h3 className={`font-bold text-lg ${isActive ? 'text-yellow-300' : 'text-white'}`}>
                    {playerName}
                    {isActive && <span className="ml-2 text-sm">(Active)</span>}
                </h3>
            </div>

            {/* Lore Progress */}
            <div className="mb-4">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-gray-400 text-sm uppercase tracking-wider font-semibold">Lore</span>
                    <span data-testid={testId} className="text-yellow-400 font-extrabold text-4xl drop-shadow-md">{lore} <span className="text-lg text-yellow-600 font-normal">/ {loreGoal}</span></span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700 shadow-inner">
                    <div
                        className="h-full bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-200 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                        style={{ width: `${Math.min((lore / loreGoal) * 100, 100)}%` }}
                    />
                </div>
            </div>

            {/* Stats Row (Deck & Hand) */}
            <div className="flex justify-end gap-4 mb-2">
                {/* Hand Size */}
                <div className="flex items-center gap-2 text-gray-300 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="text-xs uppercase tracking-wide">Hand</div>
                    <div className="font-mono font-bold text-sm">{handSize}</div>
                </div>

                {/* Deck Size */}
                <div
                    ref={deckRef}
                    className="flex items-center gap-2 text-gray-300 opacity-80 hover:opacity-100 transition-opacity"
                >
                    <div className="text-xs uppercase tracking-wide">Deck</div>
                    <div className="font-mono font-bold text-sm">{deckSize}</div>
                </div>
            </div>

            {/* Optional: Inkwell & Discard (For Opponent View) */}
            {(inkwellCards || discardCards) && (
                <div className="mt-4 pt-4 border-t border-white/10 flex gap-4">
                    {inkwellCards && (
                        <div className="flex-1">
                            <InkPile cards={inkwellCards} label={inkLabel || "Ink"} />
                        </div>
                    )}
                    {discardCards && (
                        <div className="flex-1">
                            <DiscardPile
                                cards={discardCards}
                                label={discardLabel || "Discard"}
                                onClick={onDiscardClick}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

