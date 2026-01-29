import React, { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ZoomableCard from './ZoomableCard'
import { CardInstance } from '../engine/models'
import { useCardAnimations } from '../hooks/useCardAnimations'

interface PlayAreaProps {
    cards: CardInstance[]
    /** Callback with card and its screen position (for animations) */
    onCardClick?: (card: CardInstance, position: { x: number; y: number }) => void
    label?: string
    /** Current turn number for calculating drying status */
    currentTurn?: number
}

/**
 * PlayArea - Displays characters in play
 * Updated: Removed memoization to handle deep state mutations in card objects
 */
function PlayArea({ cards, onCardClick, label, currentTurn }: PlayAreaProps) {
    const { hadCardsRecently } = useCardAnimations(cards);

    // Show empty state only when truly empty AND not recently had cards
    const showEmptyState = cards.length === 0 && !hadCardsRecently;

    const handleCardClick = useCallback((card: CardInstance, event: React.MouseEvent) => {
        if (onCardClick) {
            // Get the card element's center position for animations
            const rect = event.currentTarget.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            onCardClick(card, { x: centerX, y: centerY });
        }
    }, [onCardClick]);

    const renderCard = (card: CardInstance) => {
        // Card is drying if it was played this turn (can't act unless Rush)
        const isDrying = currentTurn !== undefined && card.turnPlayed === currentTurn;

        const isLocation = card.type === 'Location';
        // Rotate if: 
        // 1. Character/Item is exerted (!ready)
        // 2. Location is ready (Locations are horizontal by default)
        const shouldRotate = (!card.ready && !isLocation) || (card.ready && isLocation);

        const MotionDiv = motion.div as any;

        return (
            <MotionDiv
                layoutId={card.instanceId}
                layout
                key={card.instanceId}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                    opacity: 0,
                    scale: 0.5,
                    y: -20,
                    filter: 'grayscale(100%)', // Optional: turn grey/ghostly instead of gold
                    transition: { duration: 0.5 }
                }}
                className={`relative ${shouldRotate ? 'mx-8' : ''}`}
                onClick={(e: React.MouseEvent) => handleCardClick(card, e)}
            >
                <div className={`${shouldRotate ? 'rotate-90 origin-center' : ''}`}>
                    <ZoomableCard
                        card={card}
                        size="md"
                        showAbilities={true}
                        isDrying={isDrying}
                    />
                </div>
            </MotionDiv>
        );
    };

    // Compact empty state - just a small indicator
    if (showEmptyState) {
        return (
            <div className="border border-dashed border-gray-700 rounded-lg p-2 bg-black bg-opacity-10">
                <div className="text-xs text-gray-500 italic">
                    {label}: <span className="text-gray-600">No characters in play</span>
                </div>
            </div>
        );
    }

    return (
        <div
            data-testid="play-area"
            className="border-2 border-dashed border-gray-700 rounded-lg p-2 min-h-[80px] bg-black bg-opacity-20 relative"
        >
            {label && (
                <div className="text-xs text-gray-400 mb-1 font-semibold">{label}</div>
            )}

            <div className="flex flex-wrap gap-1 relative z-10">
                <AnimatePresence mode='popLayout'>
                    {cards.map(card => renderCard(card))}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default PlayArea;

