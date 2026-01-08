'use client';

import Card from './Card';
import { CardInstance } from '../engine/models';

interface DiscardPileProps {
    cards: CardInstance[];
    label?: string;
    onClick?: () => void;
}

export default function DiscardPile({ cards, label = 'Discard', onClick }: DiscardPileProps) {
    const topCard = cards.length > 0 ? cards[cards.length - 1] : null;

    return (
        <div
            className="p-3 bg-black bg-opacity-30 rounded-lg cursor-pointer hover:bg-opacity-40 transition-all"
            onClick={onClick}
        >
            <div className="text-xs text-gray-400 mb-2 text-center">{label}</div>
            <div className="relative w-24 h-32">
                {cards.length > 0 && topCard ? (
                    <>
                        {/* Stack effect - show multiple cards */}
                        <div className="absolute top-0 left-0 w-full h-full rounded transform translate-x-1 translate-y-1 bg-orange-900 opacity-40"></div>
                        <div className="absolute top-0 left-0 w-full h-full rounded transform translate-x-0.5 translate-y-0.5 bg-orange-800 opacity-60"></div>
                        {/* Top card - scaled to fit container */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-lg">
                            <Card
                                card={topCard}
                                disableHoverZoom={true}
                            />
                        </div>
                    </>
                ) : (
                    /* Empty pile indicator */
                    <div className="absolute top-0 left-0 w-full h-full rounded-lg border-2 border-dashed border-gray-600 bg-gray-800 bg-opacity-30 flex items-center justify-center">
                        <div className="text-gray-500 text-xs text-center">Empty</div>
                    </div>
                )}
                {/* Card count badge */}
                <div className="absolute -top-2 -right-2 bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg border-2 border-white z-10">
                    {cards.length}
                </div>
            </div>
        </div>
    );
}
