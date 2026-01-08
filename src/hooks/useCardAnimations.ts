import { useState, useLayoutEffect, useRef } from 'react';
import { CardInstance } from '../engine/models';

export function useCardAnimations(cards: CardInstance[]) {
    const [banishingCards, setBanishingCards] = useState<CardInstance[]>([]);
    const prevCardsRef = useRef<CardInstance[]>(cards);

    // Track if we recently had cards to prevent flashing "No characters" message during banish animation
    const [hadCardsRecently, setHadCardsRecently] = useState(false);
    const emptyDebounceRef = useRef<NodeJS.Timeout | null>(null);

    // Track cards leaving play to animate them
    useLayoutEffect(() => {
        const currentIds = new Set(cards.map(c => c.instanceId));
        const newlyRemoved = prevCardsRef.current.filter(c => !currentIds.has(c.instanceId));

        setBanishingCards(prev => {
            // 1. Remove any cards that have returned to play (Resurrection fix)
            // If a card is in 'cards' (currentIds), it MUST NOT be in banishingCards
            const remaining = prev.filter(c => !currentIds.has(c.instanceId));

            // 2. Add newly removed cards
            const combined = [...remaining];
            newlyRemoved.forEach(c => {
                if (!combined.some(existing => existing.instanceId === c.instanceId)) {
                    combined.push(c);
                }
            });
            return combined;
        });

        prevCardsRef.current = cards;
    }, [cards]);

    // Dedicated effect to clean up banishing cards
    useLayoutEffect(() => {
        if (banishingCards.length > 0) {
            const timer = setTimeout(() => {
                setBanishingCards([]);
            }, 700);
            return () => clearTimeout(timer);
        }
    }, [banishingCards]);

    // Manage "had cards recently" state to prevent flashing
    useLayoutEffect(() => {
        const hasAnyCards = cards.length > 0 || banishingCards.length > 0;

        if (hasAnyCards) {
            setHadCardsRecently(true);
            // Clear any pending "show empty" timer
            if (emptyDebounceRef.current) {
                clearTimeout(emptyDebounceRef.current);
                emptyDebounceRef.current = null;
            }
        } else if (hadCardsRecently) {
            // Wait for animation to complete before showing empty state
            emptyDebounceRef.current = setTimeout(() => {
                setHadCardsRecently(false);
            }, 800); // Slightly longer than banish animation
        }

        return () => {
            if (emptyDebounceRef.current) {
                clearTimeout(emptyDebounceRef.current);
            }
        };
    }, [cards.length, banishingCards.length, hadCardsRecently]);

    return { banishingCards, hadCardsRecently };
}
