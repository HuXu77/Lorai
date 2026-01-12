'use client';

import React from 'react';
import { CardInstance } from '../engine/models';
import { GameStatePanel } from './GameStatePanel';
import InkPile from './InkPile';
import DiscardPile from './DiscardPile';

interface GameSidebarProps {
    /** Player name to display */
    playerName: string;
    /** Current lore count */
    lore: number;
    /** Lore goal for victory */
    loreGoal: number;
    /** Number of cards in deck */
    deckSize: number;
    /** Number of cards in hand */
    handSize: number;
    /** Whether this player is the active player */
    isActive: boolean;
    /** Cards in the inkwell */
    inkwellCards: CardInstance[];
    /** Label for the ink pile */
    inkLabel: string;
    /** Cards in the discard pile */
    discardCards: CardInstance[];
    /** Label for the discard pile */
    discardLabel: string;
    /** Callback when discard pile is clicked */
    onDiscardClick?: () => void;
    /** Test ID for lore panel */
    testId?: string;
}

/**
 * Game Sidebar Component
 * 
 * Displays player stats, inkwell, and discard pile in a vertical sidebar.
 * Uses game-sidebar class from game-layout.css.
 */
export default function GameSidebar({
    playerName,
    lore,
    loreGoal,
    deckSize,
    handSize,
    isActive,
    inkwellCards,
    inkLabel,
    discardCards,
    discardLabel,
    onDiscardClick,
    testId
}: GameSidebarProps) {
    return (
        <div className="game-sidebar w-64 p-4 bg-black bg-opacity-20 flex flex-col gap-4 overflow-y-auto">
            <GameStatePanel
                playerName={playerName}
                lore={lore}
                loreGoal={loreGoal}
                deckSize={deckSize}
                handSize={handSize}
                isActive={isActive}
                hasPriority={false}
                testId={testId}
            />
            <InkPile cards={inkwellCards} label={inkLabel} />
            <DiscardPile
                cards={discardCards}
                label={discardLabel}
                onClick={onDiscardClick}
            />
        </div>
    );
}
