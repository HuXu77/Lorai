import { CardInstance } from '../engine/models';

/**
 * Image variant types available for each card
 */
export type ImageVariant = 'full' | 'thumbnail' | 'foilMask';

/**
 * Get the local path to a card's image
 * 
 * @param card - The card instance or card data with id and set info
 * @param variant - Which image variant to use (default: 'full')
 * @returns Local path to the card image, or null if card data is incomplete
 * 
 * @example
 * const imagePath = getCardImagePath(card, 'full');
 * // Returns: "/images/cards/1/42_full.jpg"
 */
export function getCardImagePath(
    card: { id?: number; setCode?: string; number?: number } | CardInstance,
    variant: ImageVariant = 'full'
): string | null {
    // Extract card number and set code from either Card or CardInstance
    const cardNumber = 'number' in card ? card.number : undefined;
    const setCode = 'setCode' in card ? card.setCode : undefined;

    // If we don't have the required data, return null
    if (!cardNumber || !setCode) {
        console.warn('Card missing required data for image path:', { cardNumber, setCode });
        return null;
    }

    return `/images/cards/${setCode}/${cardNumber}_${variant}.jpg`;
}

/**
 * Get the fallback remote URL for a card image
 * This can be used as a fallback if local images aren't available
 * 
 * @param card - The card instance
 * @param variant - Which image variant to use
 * @returns Remote URL or null if not available
 */
export function getCardImageRemoteUrl(
    card: any,
    variant: ImageVariant = 'full'
): string | null {
    // This would need the images object from allCards.json
    // For now, we'll return null since CardInstance doesn't have this data
    // In the future, you could load this from allCards.json or embed it in the card data
    return null;
}

/**
 * Preload card images to improve UI performance
 * 
 * @param cards - Array of cards to preload
 * @param variant - Which variant to preload (default: 'thumbnail')
 */
export function preloadCardImages(
    cards: Array<{ id?: number; setCode?: string; number?: number }>,
    variant: ImageVariant = 'thumbnail'
): void {
    cards.forEach(card => {
        const path = getCardImagePath(card, variant);
        if (path) {
            const img = new Image();
            img.src = path;
        }
    });
}

/**
 * Check if a card has a variant available locally
 * 
 * @param card - The card to check
 * @param variant - Which variant to check for
 * @returns Promise that resolves to true if image exists
 */
export async function cardImageExists(
    card: { id?: number; setCode?: string; number?: number },
    variant: ImageVariant = 'full'
): Promise<boolean> {
    const path = getCardImagePath(card, variant);
    if (!path) return false;

    try {
        const response = await fetch(path, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
}
