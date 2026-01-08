/**
 * Custom Jest matchers for card game testing
 */

import { Card } from '../../engine/models';
import { PlayerState } from '../../engine/state';

declare global {
    namespace jest {
        interface Matchers<R> {
            toHaveDrawnCards(count: number): R;
            toHaveDamagedCharacter(character: Card, amount: number): R;
            toHaveInPlay(card: Card): R;
            toHaveInHand(card: Card): R;
        }
    }
}

expect.extend({
    /**
     * Check if player drew the expected number of cards
     */
    toHaveDrawnCards(player: PlayerState, expectedCount: number) {
        const actualCount = player.hand.length;
        const pass = actualCount >= expectedCount;

        return {
            pass,
            message: () =>
                pass
                    ? `Expected player not to have drawn ${expectedCount} cards, but hand size is ${actualCount}`
                    : `Expected player to have ${expectedCount} cards in hand, but has ${actualCount}`
        };
    },

    /**
     * Check if a character has taken specific damage
     */
    toHaveDamagedCharacter(character: Card, expectedDamage: number) {
        const actualDamage = (character as any).damage || 0;
        const pass = actualDamage === expectedDamage;

        return {
            pass,
            message: () =>
                pass
                    ? `Expected ${character.name} not to have ${expectedDamage} damage, but it does`
                    : `Expected ${character.name} to have ${expectedDamage} damage, but has ${actualDamage}`
        };
    },

    /**
     * Check if player has a card in play
     */
    toHaveInPlay(player: PlayerState, expectedCard: Card) {
        const inPlay = player.play.some(c => c.id === expectedCard.id);

        return {
            pass: inPlay,
            message: () =>
                inPlay
                    ? `Expected ${expectedCard.name} not to be in play, but it is`
                    : `Expected ${expectedCard.name} to be in play, but it's not`
        };
    },

    /**
     * Check if player has a card in hand
     */
    toHaveInHand(player: PlayerState, expectedCard: Card) {
        const inHand = player.hand.some(c => c.id === expectedCard.id);

        return {
            pass: inHand,
            message: () =>
                inHand
                    ? `Expected ${expectedCard.name} not to be in hand, but it is`
                    : `Expected ${expectedCard.name} to be in hand, but it's not`
        };
    }
});

export { };
