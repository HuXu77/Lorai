import { TriggerPattern } from '../types';
import { generateAbilityId, GameEvent } from '../../parser-utils';
import { parseStaticEffects } from '../../static-effect-parser';
import { parseConditionalEffect } from '../../triggered-helpers';
import { parseCompoundEffect } from '../../parse-utils';

export const GENERAL_PATTERNS: TriggerPattern[] = [
    // Dual Trigger: "When you play this character and when he leaves play, [Effect]" (Merlin - Squirrel)
    {
        pattern: /^when you play this character and when (?:he|she|they|it) leaves play, (.+)/i,
        handler: (match, card, text) => {
            console.log(`[DEBUG-PARSER] MERLIN HANDLER HIT! Text: "${text.substring(0, 30)}..."`);
            const effectText = match[1];
            const effects = parseStaticEffects(effectText);

            if (effects.length > 0) {
                const ability1 = {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_PLAYED,
                    effects: effects, // Shared effects reference
                    rawText: text
                };

                const ability2 = {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_LEAVES_PLAY,
                    effects: effects, // Shared effects reference
                    rawText: text
                };

                return [ability1, ability2] as any;
            }
            return null;
        }
    },
    // Conditionals: "When you play this character, if X, Y"
    {
        pattern: /when you play this character, (if .+)/i,
        handler: (match, card, text) => {
            const fullConditionalText = match[1];
            const conditionalEffects = parseConditionalEffect(fullConditionalText);

            if (conditionalEffects && conditionalEffects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: (card.id || 'unknown').toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_PLAYED,
                    effects: conditionalEffects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // Jafar Quest Cards (Character)
    {
        pattern: /^when (?:jafar|[\w\s]+) plays this character, (?:he|she|they) (.+)/i,
        handler: (match, card, text) => {
            const effectText = match[1];
            const effects = parseStaticEffects(effectText);
            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_PLAYED,
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // Jafar Quest Cards (Item)
    {
        pattern: /^when (?:jafar|[\w\s]+) plays this item, (?:he|she|they) (.+)/i,
        handler: (match, card, text) => {
            const effectText = match[1];
            const effects = parseStaticEffects(effectText);
            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_PLAYED,
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // Whenever you play X, do Y (Generic Trigger)
    {
        pattern: /Whenever you play (?:an?|another) (character|action|item|song), (.+)$/i,
        handler: (match, card, text) => {
            const triggerType = match[1].toLowerCase();
            const effectText = match[2];
            const effects = parseStaticEffects(effectText);

            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_PLAYED,
                    triggerFilter: { type: triggerType },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // Whenever you play an action that isn't a song
    {
        pattern: /^whenever you play an action that isn't a song, (.+)/i,
        handler: (match, card, text) => {
            const effectText = match[1];
            const effects = parseStaticEffects(effectText);

            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_PLAYED,
                    triggerFilter: {
                        cardType: 'action',
                        notSong: true
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // Generic Name Trigger "Whenever you play a character named X"
    {
        pattern: /^whenever you play a character named (.+?), (.+)/i,
        handler: (match, card, text) => {
            const requiredName = match[1];
            const effectText = match[2];
            const effects = parseStaticEffects(effectText);

            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_PLAYED,
                    triggerFilter: {
                        type: 'character',
                        name: requiredName,
                        mine: true
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // Choose Then While (Complex)
    {
        pattern: /^when you play this item, choose (.+?)\. while (.+?), (.+)/i,
        handler: (match, card, text) => {
            const chooseTarget = match[1].trim();
            const whileCondition = match[2].trim();
            const whileEffect = match[3].trim();
            const effects = parseStaticEffects(whileEffect);

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'choose_then_grant',
                    chooseTarget,
                    whileCondition,
                    grants: effects
                }],
                rawText: text
            } as any;
        }
    },
    // Choose one (Modal) Trigger
    {
        pattern: /^when you play this (?:character|item|action),?\s+(choose one[\s:].+)/i,
        handler: (match, card, text) => {
            const effectText = match[1];
            const effects = parseStaticEffects(effectText);

            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_PLAYED,
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // Generic Fallback with Compound Effect Support
    {
        pattern: /^when you play this (?:character|item|action), (.+)/i,
        handler: (match, card, text) => {
            const effectText = match[1];
            if (effectText.match(/whenever/i)) return null;



            // Try compound effect parser first
            const compoundEffects = parseCompoundEffect(effectText);
            if (compoundEffects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_PLAYED,
                    effects: compoundEffects,
                    rawText: text
                } as any;
            }

            // Fall back to conditional parser
            const parsedEffects = parseConditionalEffect(effectText);
            if (parsedEffects.length > 0) {
                let condition = undefined;
                let finalEffects = parsedEffects;

                if (parsedEffects.length === 1 && parsedEffects[0].type === 'conditional') {
                    condition = parsedEffects[0].condition;
                    finalEffects = [parsedEffects[0].then];
                }

                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_PLAYED,
                    ...(condition && { condition }),
                    effects: finalEffects,
                    rawText: text
                } as any;
            }
            return null;
        }
    }
];
