'use client';

import ZoomableCard from './ZoomableCard';
import { CardInstance } from '../engine/models';

interface GameZoneProps {
    cards: CardInstance[];
    label: string;
    onCardClick?: (card: CardInstance) => void;
}

export default function GameZone({ cards, label, onCardClick }: GameZoneProps) {
    return (
        <div className="p-2 bg-black bg-opacity-20 rounded-lg min-h-[100px]">
            <div className="text-xs text-gray-300 mb-2 font-semibold">{label}</div>
            <div className="flex flex-wrap gap-2">
                {cards.length === 0 ? (
                    <div className="text-gray-500 text-xs italic p-2">Empty</div>
                ) : (
                    cards.map((card) => (
                        <div key={card.instanceId}>
                            <ZoomableCard
                                card={card}
                                size="sm"
                                showAbilities={true}
                                onClick={() => onCardClick?.(card)}
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
