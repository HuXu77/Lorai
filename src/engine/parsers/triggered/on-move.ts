import { TriggerPattern } from './types';
import { AbilityDefinition, Card, generateAbilityId, GameEvent } from '../parser-utils';
import { parseStaticEffects } from '../static-effect-parser';

export const ON_MOVE_PATTERNS: TriggerPattern[] = [
    // Compound: When play AND when leaves play (Merlin)
    // "When you play this character and when he leaves play, gain 1 lore."
    // MUST be first to match compound version before individual patterns
    {
        pattern: /^when you play this character and when (?:he|she|they|this character) leaves play,? (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const effectText = match[1];
            const effects = parseStaticEffects(effectText);

            if (effects.length > 0) {
                // Return array of TWO abilities - parser will flatten
                return [
                    {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CARD_PLAYED,
                        effects: JSON.parse(JSON.stringify(effects)), // Deep copy
                        rawText: text
                    },
                    {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CARD_LEAVES_PLAY,
                        effects: JSON.parse(JSON.stringify(effects)), // Deep copy
                        rawText: text
                    }
                ] as any;
            }
            return null;
        }
    },

    // 12. Location Lore Gain (Peter Pan)
    // "When this character moves to a location, gain lore equal to that location's ◊."
    {
        pattern: /when this character moves to a location, gain lore equal to that location's (lore|◊|⬡)/i,
        handler: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_MOVED_TO_LOCATION,
                effects: [{
                    type: 'gain_lore',
                    amount: { type: 'variable', source: 'destination_lore' }
                }],
                rawText: text
            } as any;
        }
    },

    // 8. Move Trigger (Cubby)
    // "Whenever this character moves to a location, he gets +3 ¤ this turn."
    {
        pattern: /whenever this character moves to a location, (.+)/i,
        handler: (match, card, text) => {
            const effectText = match[1];
            const effects = parseStaticEffects(effectText);

            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_MOVED_TO_LOCATION,
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },

    // When this character leaves play (Merlin)
    // "When you play this character and when he leaves play, gain 1 lore."
    {
        pattern: /when (?:he|she|they|this character) leaves play,? (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const effectText = match[1];
            const effects = parseStaticEffects(effectText);

            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_LEAVES_PLAY,
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // Sugar Rush Speedway: Move here from a location
    // "When you move a character here from a location, you may banish this location to gain 3 lore and draw 3 cards."
    {
        pattern: /^when you move a character here from a location, (.+)/i,
        handler: (match, card, text) => {
            const effectText = match[1];
            const effects = parseStaticEffects(effectText);

            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_MOVED_TO_LOCATION,
                    triggerFilter: {
                        destination: 'self',
                        sourceType: 'location'
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
];
