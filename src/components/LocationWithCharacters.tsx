import React from 'react';
import { motion } from 'framer-motion';
import { CardInstance } from '../engine/models';
import ZoomableCard from './ZoomableCard';
import { useCardAnimations } from '../hooks/useCardAnimations';

interface LocationWithCharactersProps {
    location: CardInstance;
    characters: CardInstance[];
    duplicateIndex?: number;
    currentTurn?: number;
    onCardClick?: (card: CardInstance, position: { x: number; y: number }) => void;
}

export default function LocationWithCharacters({
    location,
    characters,
    duplicateIndex,
    currentTurn,
    onCardClick
}: LocationWithCharactersProps) {
    const { banishingCards } = useCardAnimations(characters);

    const handleCardClick = (card: CardInstance, event: React.MouseEvent) => {
        if (onCardClick) {
            const rect = event.currentTarget.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            onCardClick(card, { x: centerX, y: centerY });
        }
    };

    const renderCard = (card: CardInstance, isBanishing: boolean = false) => {
        // Card is drying if it was played this turn (can't act unless Rush)
        // Only characters dry.
        const isDrying = !isBanishing &&
            card.type === 'Character' &&
            currentTurn !== undefined &&
            card.turnPlayed === currentTurn;

        const isLocation = card.type === 'Location';

        // Rotation Logic:
        // Locations: Ready = Horizontal (rotated 90), Exerted = Vertical (no rotation)
        // Characters: Ready = Vertical (no rotation), Exerted = Horizontal (rotated 90)

        // shouldRotate means "Apply 90deg rotation to the vertical card frame"
        const shouldRotate = (!card.ready && !isLocation) || (card.ready && isLocation);

        const MotionDiv = motion.div as any;

        return (
            <MotionDiv
                layoutId={card.instanceId}
                layout
                key={card.instanceId}
                className={`
                    relative flex-shrink-0
                    ${shouldRotate && !isBanishing ? 'rotate-90 origin-center mx-8' : ''}
                    ${isBanishing
                        ? 'animate-banish z-50 pointer-events-none filter sepia saturate-200 hue-rotate-[-50deg] opacity-0 scale-125'
                        : 'opacity-100 scale-100'}
                `}
                onClick={(e: React.MouseEvent) => !isBanishing && handleCardClick(card, e)}
            >
                <ZoomableCard
                    card={card}
                    size="md"
                    showAbilities={true}
                    isDrying={isDrying}
                />

                {/* Duplicate Number Badge for Location */}
                {isLocation && duplicateIndex && (
                    <div
                        className={`absolute -top-1 -right-1 bg-amber-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg z-30
                        ${shouldRotate ? '-rotate-90' : ''} /* Counter-rotate badge if card is rotated */
                        `}
                        title={`${card.name} #${duplicateIndex}`}
                    >
                        #{duplicateIndex}
                    </div>
                )}
            </MotionDiv>
        );
    };

    return (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-black/20 border border-slate-700/50">
            {/* The Location Itself */}
            <div className="relative">
                {renderCard(location)}
            </div>

            {/* Arrow/Separator indicating characters are 'at' this location */}
            {characters.length > 0 && (
                <div className="text-slate-500 mx-2">
                    ➔
                </div>
            )}

            {/* Characters at this location */}
            <div className="flex flex-wrap gap-1">
                {characters.map(char => renderCard(char, false))}
                {banishingCards.map(char => renderCard(char, true))}
            </div>
        </div>
    );
}
