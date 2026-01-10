'use client';

import ZoomableCard from './ZoomableCard';
import { CardInstance } from '../engine/models';

interface GameZoneProps {
    cards: CardInstance[];
    label: string;
    onCardClick?: (card: CardInstance) => void;
}

export default function GameZone({ cards, label, onCardClick }: GameZoneProps) {
    // Compact mode when empty
    if (cards.length === 0) {
        return (
            <div className="p-1.5 bg-black bg-opacity-20 rounded text-xs text-gray-500 italic">
                {label}: Empty
            </div>
        );
    }

    return (
        <div className="p-2 bg-black bg-opacity-20 rounded-lg">
            <div className="text-xs text-gray-300 mb-1 font-semibold">{label}</div>
            <div className="flex flex-wrap gap-1">
                {cards.map((card, cardIndex) => {
                    const isLocation = card.type === 'Location';
                    // Rotate if: 
                    // 1. Item is exerted (!ready)
                    // 2. Location is ready (Locations are horizontal by default)
                    const shouldRotate = (!card.ready && !isLocation) || (card.ready && isLocation);

                    // Check for duplicate locations (same name)
                    const duplicateIndex = isLocation
                        ? (() => {
                            const sameNameCards = cards.filter(c => c.name === card.name);
                            if (sameNameCards.length > 1) {
                                return sameNameCards.findIndex(c => c.instanceId === card.instanceId) + 1;
                            }
                            return null;
                        })()
                        : null;

                    return (
                        <div
                            key={card.instanceId}
                            className={`
                                transition-all duration-500 relative
                                ${shouldRotate ? 'rotate-90 origin-center mx-2' : ''}
                            `}
                        >
                            <ZoomableCard
                                card={card}
                                size="xs"
                                showAbilities={true}
                                onClick={() => onCardClick?.(card)}
                            />
                            {/* Duplicate Number Badge for Locations */}
                            {duplicateIndex && (
                                <div
                                    className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg z-30"
                                    title={`${card.name} #${duplicateIndex}`}
                                >
                                    #{duplicateIndex}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
