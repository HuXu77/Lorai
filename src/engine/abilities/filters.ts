/**
 * Filter utilities for card matching
 */
export function matchesCardFilter(card: any, filter: { cardType?: string; subtype?: string }): boolean {
    if (!filter) return true;

    // Check card type
    if (filter.cardType) {
        if (filter.cardType === 'song') {
            // Songs are Action cards with Song subtype
            if (card.type !== 'Action' || !card.subtypes?.includes('Song')) {
                return false;
            }
        } else if (card.type?.toLowerCase() !== filter.cardType.toLowerCase()) {
            return false;
        }
    }

    // Check subtype
    if (filter.subtype) {
        if (!card.subtypes || !card.subtypes.includes(filter.subtype)) {
            return false;
        }
    }

    return true;
}
