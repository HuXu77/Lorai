/**
 * Helper functions for building triggered ability definitions
 * Reduces boilerplate in triggered-parser.ts
 */

import { AbilityDefinition, Card, GameEvent, generateAbilityId } from './parser-utils';
import { parseStaticEffects } from './static-effect-parser';

/**
 * Parse an effect string that might contain a condition
 */
export function parseConditionalEffect(text: string): any[] {
    // 1. If you have X ink
    // console.error("DEBUG: generic conditional parse input:", text);
    const inkMatch = text.match(/if you have (\d+)(?: or more)?(?: available)? ink, (.+)/i);
    if (inkMatch) {
        const min = parseInt(inkMatch[1]);
        const subEffectText = inkMatch[2];
        const thenEffects = parseStaticEffects(subEffectText);
        if (thenEffects.length > 0) {
            return [{
                type: 'conditional',
                condition: { type: 'min_ink', amount: min }, // Changed from 'ink_available' to match test expectation 'min_ink'
                effect: thenEffects[0] // Changed from 'then' to 'effect' to match AST
            }];
        }
    }

    // 1b. If you have no cards in your hand
    const emptyHandMatch = text.match(/if you have no cards in your hand, (.+)/i);
    if (emptyHandMatch) {
        const subEffectText = emptyHandMatch[1];
        const thenEffects = parseStaticEffects(subEffectText);
        if (thenEffects.length > 0) {
            return [{
                type: 'conditional',
                condition: { type: 'empty_hand' },
                effect: thenEffects[0]
            }];
        }
    }

    // 2. If you have a [Type] character in play
    const charMatch = text.match(/if you have a (.+?) character in play, (.+)/i);
    if (charMatch) {
        const subtype = charMatch[1];
        const subEffectText = charMatch[2];
        const thenEffects = parseStaticEffects(subEffectText);
        if (thenEffects.length > 0) {
            return [{
                type: 'conditional',
                condition: { type: 'has_character_in_play', subtype },
                effect: thenEffects[0]
            }];
        }
    }

    // 3. If this character is damaged
    const damagedMatch = text.match(/if this character is damaged, (.+)/i);
    if (damagedMatch) {
        const subEffectText = damagedMatch[1];
        const thenEffects = parseStaticEffects(subEffectText);
        if (thenEffects.length > 0) {
            return [{
                type: 'conditional',
                condition: { type: 'is_damaged', target: 'self' },
                effect: thenEffects[0]
            }];
        }
    }


    // 4. If you've put a card under this turn (Lady Tremaine)
    const underMatch = text.match(/if you've put a card under (?:her|this character|him|them) this turn, (.+)/i);
    if (underMatch) {
        const subEffectText = underMatch[1];
        const thenEffects = parseStaticEffects(subEffectText);
        if (thenEffects.length > 0) {
            return [{
                type: 'conditional',
                condition: { type: 'card_put_under_this_turn' },
                effect: thenEffects[0]
            }];
        }
    }

    // 4b. If there's a card under form (Robin Hood - Ephemeral Archer)
    const cardUnderMatch = text.match(/if there's a card under (?:her|this character|him|them), (.+)/i);
    if (cardUnderMatch) {
        const subEffectText = cardUnderMatch[1];
        const thenEffects = parseStaticEffects(subEffectText);
        if (thenEffects.length > 0) {
            return [{
                type: 'conditional',
                condition: { type: 'has_card_under' },
                effect: thenEffects[0]
            }];
        }
    }

    // 5. If you have fewer/more than X cards in your hand
    const handSizeMatch = text.match(/if you have (fewer than|more than|exactly) (\d+) cards in your hand, (.+)/i);
    if (handSizeMatch) {
        const comparisonText = handSizeMatch[1].toLowerCase();
        const amount = parseInt(handSizeMatch[2]);
        const subEffectText = handSizeMatch[3];

        let comparison = 'equal';
        if (comparisonText === 'fewer than') comparison = 'less_than';
        if (comparisonText === 'more than') comparison = 'more_than';

        const thenEffects = parseStaticEffects(subEffectText);
        if (thenEffects.length > 0) {
            return [{
                type: 'conditional',
                condition: {
                    type: 'hand_size',
                    amount,
                    comparison
                },
                effect: thenEffects[0]
            }];
        }
    }

    // 6. If you have a character named X in play
    const namedCharMatch = text.match(/if you have a character named (.+?) in play, (.+)/i);
    if (namedCharMatch) {
        const name = namedCharMatch[1];
        const subEffectText = namedCharMatch[2];
        const thenEffects = parseStaticEffects(subEffectText);
        if (thenEffects.length > 0) {
            return [{
                type: 'conditional',
                condition: {
                    type: 'presence',
                    filter: { name }
                },
                effect: thenEffects[0]
            }];
        }
    }

    // 7. If you have fewer cards in hand than an opponent
    const relativeHandMatch = text.match(/if you have fewer cards in hand than an opponent, (.+)/i);
    if (relativeHandMatch) {
        const subEffectText = relativeHandMatch[1];
        const thenEffects = parseStaticEffects(subEffectText);
        if (thenEffects.length > 0) {
            return [{
                type: 'conditional',
                condition: {
                    type: 'relative_hand_size',
                    comparison: 'fewer',
                    opponent: 'any'
                },
                effect: thenEffects[0]
            }];
        }
    }

    // 8. If you have X or more other characters in play (Stitch)
    const otherCharsMatch = text.match(/if you have (\d+) or more other characters in play, (.+)/i);
    if (otherCharsMatch) {
        console.error("DEBUG: Matched min_other_characters");
        const amount = parseInt(otherCharsMatch[1]);
        const subEffectText = otherCharsMatch[2];
        const thenEffects = parseStaticEffects(subEffectText);
        if (thenEffects.length > 0) {
            return [{
                type: 'conditional',
                condition: { type: 'min_other_characters', amount },
                effect: thenEffects[0]
            }];
        }
    }

    // Fallback: Parse as standard static effects
    return parseStaticEffects(text);
}

/**
 * Create a "when you play this character" triggered ability
 */
export function createPlayTriggeredAbility(
    card: Card,
    effects: any[],
    text: string,
    condition?: any
): AbilityDefinition {
    return {
        id: generateAbilityId(),
        cardId: card.id.toString(),
        type: 'triggered',
        event: GameEvent.CARD_PLAYED,
        // CRITICAL: Only trigger when THIS card is played (not any card)
        triggerFilter: { target: 'self' },
        ...(condition && { condition }),
        effects,
        rawText: text
    } as any;
}

/**
 * Parse a "Choose one" effect string
 */
export function parseChooseOne(text: string): any[] {
    // "Choose one: • Option 1. • Option 2."
    const chooseOneMatch = text.match(/choose one:? (.+)/i);
    if (!chooseOneMatch) return [];

    const optionsText = chooseOneMatch[1];

    // Split by bullet point (•) or " OR " ? Baloo uses •.
    // Normalized text converts newlines to spaces, so "• Option 1. • Option 2."
    // Support multiple bullet types just in case
    const parts = optionsText.split(/[•\-*]/).map(p => p.trim()).filter(p => p.length > 0);

    const options: any[] = [];

    parts.forEach(part => {
        // Parse the effect of this option
        const effects = parseStaticEffects(part);
        if (effects.length > 0) {
            options.push({
                description: part, // Provide raw text description for UI
                effects
            });
        }
    });

    if (options.length > 0) {
        return [{
            type: 'choose_one',
            options
        }];
    }
    return [];
}

/**
 * Create a "whenever this character quests" triggered ability
 */
export function createQuestTriggeredAbility(
    card: Card,
    effects: any[],
    text: string
): AbilityDefinition {
    return {
        id: generateAbilityId(),
        cardId: card.id.toString(),
        type: 'triggered',
        event: GameEvent.CARD_QUESTED,
        // CRITICAL: Only trigger when THIS character quests (not any character)
        triggerFilter: { target: 'self' },
        effects,
        rawText: text
    } as any;
}

/**
 * Create a "when this character is banished" triggered ability
 */
export function createBanishedTriggerAbility(
    card: Card,
    effects: any[],
    text: string
): AbilityDefinition {
    return {
        id: generateAbilityId(),
        cardId: card.id.toString(),
        type: 'triggered',
        event: GameEvent.CARD_BANISHED,
        // CRITICAL: Only trigger when THIS character is banished (not any character)
        triggerFilter: { target: 'self' },
        effects,
        rawText: text
    } as any;
}

/**
 * Create an "at the start of your turn" triggered ability
 */
export function createStartOfTurnAbility(
    card: Card,
    effects: any[],
    text: string,
    condition?: any
): AbilityDefinition {
    return {
        id: generateAbilityId(),
        cardId: card.id.toString(),
        type: 'triggered',
        event: GameEvent.TURN_START,
        ...(condition && { condition }),
        effects,
        rawText: text
    } as any;
}

/**
 * Create an "at the end of your turn" triggered ability
 */
export function createEndOfTurnAbility(
    card: Card,
    effects: any[],
    text: string,
    condition?: any
): AbilityDefinition {
    return {
        id: generateAbilityId(),
        cardId: card.id.toString(),
        type: 'triggered',
        event: GameEvent.END_OF_TURN,
        trigger: {
            type: 'end_of_turn',
            ...(condition && { conditions: Array.isArray(condition) ? condition : [condition] })
        },
        effects,
        rawText: text
    } as any;
}

/**
 * Build a simple damage effect
 */
export function buildDamageEffect(
    amount: number | { type: string;[key: string]: any },
    target: any
): any {
    return {
        type: 'damage',
        amount,
        target
    };
}

/**
 * Build a simple banish effect
 */
export function buildBanishEffect(target: any): any {
    return {
        type: 'banish',
        target
    };
}

/**
 * Build a simple draw effect
 */
export function buildDrawEffect(amount: number | { type: string }, target?: any): any {
    return {
        type: 'draw',
        amount,
        ...(target && { target })
    };
}

/**
 * Build a lore modification effect
 */
export function buildLoreEffect(amount: number, target: any, isGain: boolean = true): any {
    return {
        type: isGain ? 'gain_lore' : 'lose_lore',
        amount,
        target
    };
}

/**
 * Build a stat modification effect
 */
export function buildStatModEffect(
    stat: string,
    amount: number,
    target: any,
    duration?: string
): any {
    return {
        type: 'modify_stats',
        stat,
        amount,
        target,
        ...(duration && { duration })
    };
}

/**
 * Build an exert effect
 */
export function buildExertEffect(target: any): any {
    return {
        type: 'exert',
        target
    };
}

/**
 * Build a ready effect
 */
export function buildReadyEffect(target: any): any {
    return {
        type: 'ready',
        target
    };
}

/**
 * Build a return to hand effect
 */
export function buildReturnEffect(target: any): any {
    return {
        type: 'return_to_hand',
        target
    };
}

/**
 * Build a chosen character target with filters
 */
export function buildChosenCharacterTarget(filters: {
    mine?: boolean;
    opposing?: boolean;
    damaged?: boolean;
    exerted?: boolean;
    costMax?: number;
    other?: boolean;
    at_location?: boolean | string;
    [key: string]: any;
}): any {
    const target: any = { type: 'chosen_character' };

    if (Object.keys(filters).length > 0) {
        target.filter = {};

        if (filters.mine !== undefined) target.filter.mine = filters.mine;
        if (filters.opposing) target.filter.mine = false;
        if (filters.damaged) target.filter.damaged = true;
        if (filters.exerted) target.filter.exerted = true;
        if (filters.costMax !== undefined) target.filter.costMax = filters.costMax;
        if (filters.other) target.filter.other = true;
        if (filters.at_location !== undefined) {
            if (filters.at_location === true) {
                target.filter.at_location = true;
            } else if (typeof filters.at_location === 'string') {
                target.filter.at_location = filters.at_location;
            }
        }

        // Add any other custom filters
        Object.keys(filters).forEach(key => {
            if (!['mine', 'opposing', 'damaged', 'exerted', 'costMax', 'other', 'at_location'].includes(key)) {
                target.filter[key] = filters[key];
            }
        });
    }

    return target;
}
