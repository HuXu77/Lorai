import React, { useCallback } from 'react'
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
    onPlayCard?: (card: CardInstance) => void | Promise<void>
    /** Ref for animation targeting */
    handRef?: React.RefObject<HTMLDivElement>
}

/**
 * PlayerHand - Displays player or opponent hand
 * Memoized to prevent unnecessary re-renders when parent state changes
 */
// Removed React.memo to ensure UI updates are always reflected immediately
function PlayerHand({
    cards,
    onCardClick,
    isOpponent = false,
    revealed = false,
    canPlayCard,
    onPlayCard,
    handRef
}: PlayerHandProps) {
    const [processingId, setProcessingId] = React.useState<string | null>(null);
    const processingRef = React.useRef<boolean>(false);

    const handleCardClick = useCallback((card: CardInstance) => {
        onCardClick?.(card);
    }, [onCardClick]);

    const handlePlayCard = useCallback(async (card: CardInstance, e: React.MouseEvent) => {
        e.stopPropagation();
        if (processingRef.current) return; // Prevent double submission immediately

        processingRef.current = true;
        setProcessingId(card.instanceId); // Still use state for UI updates

        try {
            await onPlayCard?.(card);
        } finally {
            processingRef.current = false;
            setProcessingId(null);
        }
    }, [onPlayCard]); // Removed processingId dependency as we use ref

    if (isOpponent) {
        // Opponent hand - compact by default, expands when revealed
        if (!revealed) {
            // Compact mode - fanned cards
            return (
                <div data-testid="opponent-hand" className="flex justify-center items-center py-2 px-4">
                    <div className="flex flex-col items-center gap-1">
                        {/* Fanned Cards */}
                        <div className="flex justify-center items-center h-16 ml-8"> {/* ml-8 to offset the first negative margin if needed, or centering handles it */}
                            {Array.from({ length: cards.length }).map((_, index) => (
                                <div
                                    key={index}
                                    className="w-10 h-14 rounded overflow-hidden border border-gray-500 shadow-md transform hover:-translate-y-1 transition-transform duration-200"
                                    style={{
                                        marginLeft: index > 0 ? '-20px' : '0',
                                        zIndex: index,
                                        transform: `rotate(${(index - (cards.length - 1) / 2) * 5}deg)` // Subtle fan rotation
                                    }}
                                >
                                    <img
                                        src="/images/card-back.png"
                                        alt="Card back"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                        {/* Count Badge */}
                        <div className="bg-black bg-opacity-60 px-2 py-0.5 rounded-full border border-gray-700">
                            <span className="text-blue-200 text-xs font-semibold">
                                {cards.length} Cards
                            </span>
                        </div>
                    </div>
                </div>
            )
        }

        // Revealed mode - show actual cards (when ability requires it)
        return (
            <div data-testid="opponent-hand" className="p-3 bg-yellow-900 bg-opacity-20 border-t border-b border-yellow-600">
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
                                    onClick={() => handleCardClick(card)}
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
            data-testid="player-hand"
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
                    const isProcessing = processingId === card.instanceId;

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
                                size="hand"
                                onClick={() => handleCardClick(card)}
                            />

                            {/* Playability Overlay */}
                            {canPlayCard && (
                                <>
                                    {canPlay && onPlayCard && !isProcessing && (
                                        <div className="absolute inset-0 border-2 border-green-400 border-opacity-40 rounded-lg pointer-events-none transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] z-10">
                                            <button
                                                onClick={(e) => handlePlayCard(card, e)}
                                                disabled={isProcessing}
                                                className="absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-green-600 hover:bg-green-700 text-white px-2 py-0.5 rounded text-xs font-bold pointer-events-auto shadow-lg transition-all"
                                            >
                                                ▶ PLAY ({card.cost}◆)
                                            </button>
                                        </div>
                                    )}

                                    {isProcessing && (
                                        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center z-20 pointer-events-none">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                        </div>
                                    )}

                                    {!canPlay && reason && !isProcessing && (
                                        <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg pointer-events-none z-10" />
                                    )}
                                </>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}

export default PlayerHand;

