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
                {cards.map((card) => {
                    const isLocation = card.type === 'Location';
                    // Rotate if: 
                    // 1. Item is exerted (!ready)
                    // 2. Location is ready (Locations are horizontal by default)
                    const shouldRotate = (!card.ready && !isLocation) || (card.ready && isLocation);

                    return (
                        <div
                            key={card.instanceId}
                            className={`
                                transition-all duration-500
                                ${shouldRotate ? 'rotate-90 origin-center mx-2' : ''}
                            `}
                        >
                            <ZoomableCard
                                card={card}
                                size="xs"
                                showAbilities={true}
                                onClick={() => onCardClick?.(card)}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
