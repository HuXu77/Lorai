import React from 'react'
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
    /** All locations in play (for showing location badges on characters) */
    allLocations?: CardInstance[]
}

/**
 * Get abbreviated location name for badge display
 * e.g., "Never Land" -> "NL", "The Queen's Castle" -> "QC"
 */
function getLocationAbbreviation(name: string): string {
    // Get first letter of each significant word
    const words = name.split(/[\s-]+/).filter(w =>
        !['the', 'a', 'an', 'of', 'in', 'at', 'to'].includes(w.toLowerCase())
    );
    if (words.length === 1) {
        // Single word - use first 2-3 chars
        return words[0].substring(0, 3);
    }
    // Multiple words - use initials
    return words.map(w => w[0]).join('').toUpperCase().substring(0, 3);
}

/**
 * Get location label with duplicate index if needed
 * Returns { abbr: "NL", index: 1 or undefined }
 */
function getLocationLabel(locationId: string, allLocations: CardInstance[]): { abbr: string; name: string; index?: number } | null {
    const location = allLocations.find(l => l.instanceId === locationId);
    if (!location) return null;

    // Check if there are duplicates (same name)
    const sameNameLocations = allLocations.filter(l => l.name === location.name);
    const hasDuplicates = sameNameLocations.length > 1;

    // Find index in duplicates (1-based)
    const index = hasDuplicates
        ? sameNameLocations.findIndex(l => l.instanceId === locationId) + 1
        : undefined;

    return {
        abbr: getLocationAbbreviation(location.name),
        name: location.fullName || location.name,
        index
    };
}

const PlayArea = function PlayArea({ cards, onCardClick, label, currentTurn, allLocations = [] }: PlayAreaProps) {
    const { banishingCards, hadCardsRecently } = useCardAnimations(cards);

    // Show empty state only when truly empty AND not recently had cards
    const showEmptyState = cards.length === 0 && banishingCards.length === 0 && !hadCardsRecently;

    const handleCardClick = (card: CardInstance, event: React.MouseEvent) => {
        if (onCardClick) {
            // Get the card element's center position for animations
            const rect = event.currentTarget.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            onCardClick(card, { x: centerX, y: centerY });
        }
    };

    const renderCard = (card: CardInstance, isBanishing: boolean = false) => {
        // Card is drying if it was played this turn (can't act unless Rush)
        const isDrying = !isBanishing && currentTurn !== undefined && card.turnPlayed === currentTurn;

        const isLocation = card.type === 'Location';
        // Rotate if: 
        // 1. Character/Item is exerted (!ready)
        // 2. Location is ready (Locations are horizontal by default)
        const shouldRotate = (!card.ready && !isLocation) || (card.ready && isLocation);

        // Get location label if character is at a location
        const locationLabel = card.locationId && allLocations.length > 0
            ? getLocationLabel(card.locationId, allLocations)
            : null;

        return (
            <div
                key={card.instanceId}
                className={`
                    transition-all duration-700 relative
                    ${shouldRotate && !isBanishing ? 'rotate-90 origin-center mx-8' : ''}
                    ${isBanishing
                        ? 'animate-banish z-50 pointer-events-none filter sepia saturate-200 hue-rotate-[-50deg] opacity-0 scale-125'
                        : 'opacity-100 scale-100'}
                `}
                onClick={(e) => !isBanishing && handleCardClick(card, e)}
            >
                <ZoomableCard
                    card={card}
                    size="md"
                    showAbilities={true}
                    isDrying={isDrying}
                />
                {/* Location Badge */}
                {locationLabel && (
                    <div
                        className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 bg-cyan-700 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-lg z-30 flex items-center gap-0.5"
                        title={`At: ${locationLabel.name}${locationLabel.index ? ` #${locationLabel.index}` : ''}`}
                    >
                        <span>🏰</span>
                        <span>{locationLabel.abbr}{locationLabel.index ? `#${locationLabel.index}` : ''}</span>
                    </div>
                )}
            </div>
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
        <div className="border-2 border-dashed border-gray-700 rounded-lg p-2 min-h-[80px] bg-black bg-opacity-20 relative overflow-hidden">
            {label && (
                <div className="text-xs text-gray-400 mb-1 font-semibold">{label}</div>
            )}

            <div className="flex flex-wrap gap-1 relative z-10">
                {/* Active Cards */}
                {cards.map(card => renderCard(card, false))}

                {/* Banishing Cards (ghosts) */}
                {banishingCards.map(card => renderCard(card, true))}
            </div>

            <style jsx>{`
                @keyframes banish {
                    0% { transform: scale(1) translateY(0); opacity: 1; filter: brightness(1); }
                    50% { transform: scale(1.1) translateY(-10px); opacity: 0.8; filter: brightness(1.5) sepia(1) saturate(5) hue-rotate(-50deg); }
                    100% { transform: scale(0.5) translateY(-20px); opacity: 0; filter: brightness(0); }
                }
                .animate-banish {
                    animation: banish 0.7s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default PlayArea;
