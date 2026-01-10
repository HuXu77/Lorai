import ZoomableCard from './ZoomableCard'
import { CardInstance } from '../engine/models'

interface PlayerHandProps {
    cards: CardInstance[]
    onCardClick?: (card: CardInstance) => void
    isOpponent?: boolean
    /** Backend-controlled state: whether opponent's hand is revealed (e.g., from ability effects) */
    revealed?: boolean
    /** Function to check if a card can be played */
    canPlayCard?: (card: CardInstance) => { canPlay: boolean; reason?: string }
    /** Callback when play button is clicked */
    /** Callback when play button is clicked */
    onPlayCard?: (card: CardInstance) => void
    /** Ref for animation targeting */
    handRef?: React.RefObject<HTMLDivElement>
}

export default function PlayerHand({
    cards,
    onCardClick,
    isOpponent = false,
    revealed = false,
    canPlayCard,
    onPlayCard,
    handRef
}: PlayerHandProps) {
    if (isOpponent) {
        // Opponent hand - compact by default, expands when revealed
        if (!revealed) {
            // Compact mode - just show count badge
            return (
                <div className="flex justify-center items-center py-2 px-4">
                    <div className="flex items-center gap-2 bg-black bg-opacity-40 rounded-full px-4 py-2 border border-gray-600">
                        <div className="w-8 h-10 rounded overflow-hidden border border-gray-500">
                            <img
                                src="/images/card-back.png"
                                alt="Card back"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-white text-sm font-semibold">
                            Opponent Hand: <span className="text-blue-400">{cards.length}</span>
                        </span>
                    </div>
                </div>
            )
        }

        // Revealed mode - show actual cards (when ability requires it)
        return (
            <div className="p-3 bg-yellow-900 bg-opacity-20 border-t border-b border-yellow-600">
                <div className="text-center text-yellow-300 text-xs mb-2 font-semibold">
                    🔍 Opponent Hand (Revealed)
                </div>
                <div className="flex justify-center gap-2 overflow-x-auto pb-2">
                    {cards.length === 0 ? (
                        <div className="text-gray-500 text-sm italic">
                            No cards in hand
                        </div>
                    ) : (
                        cards.map((card, index) => (
                            <div
                                key={card.instanceId || index}
                                style={{ zIndex: index }}
                            >
                                <ZoomableCard
                                    card={card}
                                    size="sm"
                                    onClick={() => onCardClick?.(card)}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>
        )
    }

    // Player's hand - use ZoomableCard for proper portal-based zoom
    return (
        <div
            ref={handRef}
            className="flex justify-center items-end gap-0 px-4 py-1 h-28 overflow-visible"
        >
            {cards.length === 0 ? (
                <div className="text-gray-500 text-xs italic py-2">
                    No cards in hand
                </div>
            ) : (
                cards.map((card, index) => {
                    const playability = canPlayCard?.(card);
                    const canPlay = playability?.canPlay ?? false;
                    const reason = playability?.reason;

                    return (
                        <div
                            key={card.instanceId || index}
                            className="relative transition-transform duration-200 hover:-translate-y-3 hover:!z-50"
                            style={{
                                marginLeft: index > 0 ? '-30px' : '0',
                                zIndex: index,
                            }}
                        >
                            <ZoomableCard
                                card={card}
                                size="sm"
                                onClick={() => onCardClick?.(card)}
                            />

                            {/* Playability Overlay */}
                            {canPlayCard && (
                                <>
                                    {canPlay && onPlayCard && (
                                        <div className="absolute inset-0 border-2 border-green-400 border-opacity-40 rounded-lg pointer-events-none transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] z-10">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onPlayCard(card);
                                                }}
                                                className="absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-green-600 hover:bg-green-700 text-white px-2 py-0.5 rounded text-xs font-bold pointer-events-auto shadow-lg transition-all"
                                            >
                                                ▶ PLAY ({card.cost}◆)
                                            </button>
                                        </div>
                                    )}

                                    {!canPlay && reason && (
                                        <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg pointer-events-none z-10" />
                                    )}
                                </>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    )
}
