import { TriggerPattern } from './types';
import { AbilityDefinition, Card, generateAbilityId, GameEvent } from '../parser-utils';
import { parseStaticEffects } from '../static-effect-parser';

export const TURN_BASED_PATTERNS: TriggerPattern[] = [
    // Transport Pod: At the start of your turn, you may move a character of yours to a location for free
    {
        pattern: /^at the start of your turn, you may move a character of yours to a location for free/i,
        handler: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.TURN_START,
                effects: [{
                    type: 'move_to_location',
                    target: {
                        type: 'chosen_character',
                        filter: { mine: true }
                    },
                    free: true,
                    optional: true
                }],
                rawText: text
            } as any;
        }
    },
    // Goliath - Clan Leader: "At the end of each player's turn, if they have more than 2 cards in their hand, they choose and discard cards until they have 2. If they have fewer than 2 cards in their hand, they draw until they have 2."
    {
        pattern: /^at the end of each player's turn, if they have more than (\d+) cards in their hand, they choose and discard cards until they have (\d+)\. if they have fewer than (\d+) cards in their hand, they draw until they have (\d+)/i,
        handler: (match, card, text) => {
            const count = parseInt(match[1]);
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.TURN_END,
                effects: [{
                    type: 'balance_hand',
                    count,
                    target: 'active_player'
                }],
                rawText: text
            } as any;
        }
    },
    // Ursula's Contract: "At the start of your turn, banish this item to gain 3 lore."
    {
        pattern: /^at the start of your turn, banish this item to gain (\d+) lore/i,
        handler: (match, card, text) => {
            const loreAmount = parseInt(match[1]);
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.TURN_START,
                effects: [
                    {
                        type: 'banish',
                        target: { type: 'self' }
                    },
                    {
                        type: 'gain_lore',
                        amount: loreAmount
                    }
                ],
                rawText: text
            } as any;
        }
    },

    // Queen's Sensor Core: "At the start of your turn, if you have a Princess or Queen character in play, gain 1 lore."
    {
        pattern: /^at the start of your turn, if you have a (.+?) (?:or (.+?) )?character in play, gain (\d+) lore/i,
        handler: (match, card, text) => {
            const classif1 = match[1];
            const classif2 = match[2];
            const loreAmount = parseInt(match[3]);
            const classifications = classif2 ? [classif1, classif2] : [classif1];
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.TURN_START,
                condition: {
                    type: 'has_character',
                    filter: { classifications }
                },
                effects: [{
                    type: 'gain_lore',
                    amount: loreAmount
                }],
                rawText: text
            } as any;
        }
    },

    // Pongo - Dear Old Dad: "At the start of your turn, look at the cards in your inkwell. You may play a Puppy character from there for free."
    {
        pattern: /^at the start of your turn, look at the cards in your inkwell\. you may play (?:a )?(.+?) character from there for free/i,
        handler: (match, card, text) => {
            const subtype = match[1]; // "Puppy"
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.TURN_START,
                effects: [{
                    type: 'play_from_inkwell',
                    filter: { type: 'Character', subtype },
                    free: true,
                    optional: true
                }],
                rawText: text
            } as any;
        }
    },

    // BATCH 46: Conditional end-of-turn banish (Golden Harp)
    // "at the end of your turn, if you didn't play a song this turn, banish this character"
    {
        pattern: /^at the end of your turn, if you didn't play a song this turn, banish this character/i,
        handler: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.END_OF_TURN,
                condition: { type: 'not_played_song_this_turn' },
                effects: [{
                    type: 'banish',
                    target: { type: 'self' }
                }],
                rawText: text
            } as any;
        }
    },

    // 34. Opponent Discard to Hand Limit (Prince John's Mirror)
    // "At the end of each opponent's turn, if they have more than 3 cards in their hand, they discard until they have 3 cards in their hand."
    {
        pattern: /at the end of each opponent's turn, if they have more than (\d+) cards in their hand, they discard until they have (\d+) cards in their hand/i,
        handler: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.TURN_END,
                effects: [{
                    type: 'opponent_discard_excess_hand',
                    limit: parseInt(match[2])
                }],
                rawText: text
            } as any;
        }
    },

    // CAMPAIGN: At the start of Jafar's turn
    {
        pattern: /^at the start of jafar's turn, (.+)/i,
        handler: (match, card, text) => {
            const effectText = match[1];

            // Fiery Basin: "he banishes this item to have each Illumineer choose one of their characters and deal 4 damage to them."
            if (effectText.match(/he banishes this item to have each illumineer choose one of their characters and deal (\d+) damage to them/i)) {
                const dmgMatch = effectText.match(/deal (\d+) damage/i);
                const amount = dmgMatch ? parseInt(dmgMatch[1]) : 0;
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.TURN_START,
                    trigger: { type: 'start_of_turn_jafar' },
                    effects: [
                        { type: 'banish', target: { type: 'self' } },
                        {
                            type: 'each_opponent_chooses_character_to_damage',
                            amount
                        }
                    ],
                    rawText: text
                } as any;
            }

            const effects = parseStaticEffects(effectText);
            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.TURN_START,
                    trigger: { type: 'start_of_turn_jafar' },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },

    // At the start of your turn
    {
        pattern: /^at the start of your turn, (.+)/i,
        handler: (match, card, text) => {
            const rest = match[1];
            let conditions: any[] = [];
            let effectText = rest;
            let zone = 'play'; // Default zone

            // Check for conditions
            if (rest.match(/^if (.+?), (.+)/i)) {
                const conditionMatch = rest.match(/^if (.+?), (.+)/i);
                const conditionStr = conditionMatch![1];
                effectText = conditionMatch![2];

                if (conditionStr.match(/an opposing character has damage/i)) {
                    conditions.push({ type: 'opposing_character_has_damage' });
                } else if (conditionStr.match(/this card is in your discard/i)) {
                    conditions.push({ type: 'in_discard' });
                    zone = 'discard';
                } else if (conditionStr.match(/you have a (.+?) character here/i)) {
                    const subtype = conditionStr.match(/you have a (.+?) character here/i)![1];
                    conditions.push({ type: 'control_character_at_location', subtype });
                } else if (conditionStr.match(/you have a character here/i)) {
                    conditions.push({ type: 'control_character_at_location' });
                }
            }

            const effects: any[] = [];

            // Lilo - Escape Artist
            // "you may play her and she enters play exerted"
            // Flotilla - Coconut Armada
            // "all opponents lose 1 lore and you gain lore equal to the lore lost this way"
            // Also handles: "all opponents lose 1 lore and you gain 1 lore"
            if (effectText.match(/all opponents lose (\d+) lore and you gain (?:(\d+) lore|lore equal to the lore lost this way)/i)) {
                const match = effectText.match(/all opponents lose (\d+) lore and you gain (?:(\d+) lore|lore equal to the lore lost this way)/i)!;
                const lostAmount = parseInt(match[1]);
                const gainedAmount = match[2] ? parseInt(match[2]) : lostAmount; // If not specified, gain equals lost
                effects.push({
                    type: 'lore_loss',
                    target: 'opponent',
                    amount: lostAmount,
                    all: true
                });
                effects.push({
                    type: 'gain_lore',
                    amount: gainedAmount
                });
            } else if (effectText.match(/you may play (?:her|this character) and (?:she|it) enters play exerted/i)) {
                effects.push({
                    type: 'play_from_discard',
                    enters_exerted: true,
                    optional: true
                });
            } else {
                effects.push(...parseStaticEffects(effectText));
            }

            if (effects.length > 0) {
                const ability: any = {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.TURN_START,
                    trigger: { type: 'start_of_turn' },
                    effects,
                    zone,
                    rawText: text
                };

                if (conditions.length === 1) {
                    ability.condition = conditions[0];
                } else if (conditions.length > 1) {
                    ability.conditions = conditions;
                }

                return ability;
            }
            return null;
        }
    },

    // John Silver - Stern Captain: "At the start of your turn, deal 1 damage to each opposing ready character."
    {
        pattern: /^at the start of your turn, deal (\d+) damage to (?:each|all) opposing ready characters?/i,
        handler: (match, card, text) => {
            const amount = parseInt(match[1]);
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.TURN_START,
                trigger: { type: 'start_of_turn' },
                effects: [{
                    type: 'damage',
                    amount,
                    target: {
                        type: 'all_characters',
                        filter: { opponent: true, ready: true }
                    }
                }],
                rawText: text
            } as any;
        }
    },

    // Treasure Mountain: "At the start of your turn, deal damage to chosen character or location equal to the number of characters you have at this location."
    {
        pattern: /^at the start of your turn, deal damage to chosen (character|item|location)(?: or (character|item|location))? equal to the number of (.+)/i,
        handler: (match, card, text) => {
            const sourceDescription = match[3]; // e.g., "characters you have at this location"

            // Parse what we're counting
            let source: any = {};
            if (sourceDescription.includes('characters you have at this location')) {
                source = {
                    type: 'character_count_at_location',
                    mine: true
                };
            }

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.TURN_START,
                trigger: { type: 'start_of_turn' },
                effects: [{
                    type: 'damage',
                    amount: 'variable',
                    source,
                    target: { type: 'chosen' }
                }],
                rawText: text
            } as any;
        }
    },

    // Genie - Wonderful Trickster: "At the end of your turn, put all the cards in your hand on the bottom of your deck in any order."
    {
        pattern: /^at the end of your turn, put all the cards in your hand on the bottom of your deck/i,
        handler: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.END_OF_TURN,
                trigger: { type: 'end_of_turn' },
                effects: [{
                    type: 'move_hand_to_bottom_deck',
                    all: true,
                    order: 'any'
                }],
                rawText: text
            } as any;
        }
    },

    // Scar - Finally King: Complex conditional draw with follow-up effects
    {
        pattern: /^at the end of your turn, if this character is exerted, you may draw cards equal to the ¤ of chosen (.+?) character(?: of yours)?\. if you do, (.+)/i,
        handler: (match, card, text) => {
            const characterType = match[1]; // e.g., "Ally"
            const followUpText = match[2]; // e.g., "choose and discard 2 cards and banish that character"

            const effects: any[] = [{
                type: 'draw',
                amount: 'variable',
                source: {
                    type: 'chosen_character',
                    stat: 'strength',
                    filter: { mine: true, subtype: characterType }
                },
                optional: true
            }];

            // Parse follow-up effects (what happens "if you do")
            const followUpEffects = parseStaticEffects(followUpText);
            followUpEffects.forEach(effect => {
                effects.push({ ...effect, conditional_on_previous: true });
            });

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.END_OF_TURN,
                trigger: { type: 'end_of_turn' },
                condition: { type: 'self_exerted' },
                effects,
                rawText: text
            } as any;
        }
    },

    // Generic "At the end of your turn" handler
    {
        pattern: /^at the end of your turn, (.+)/i,
        handler: (match, card, text) => {
            const rest = match[1];
            let conditions: any[] = [];
            let effectText = rest;

            // Check for conditions
            if (rest.match(/^if (.+?), (.+)/i)) {
                const conditionMatch = rest.match(/^if (.+?), (.+)/i);
                const conditionStr = conditionMatch![1];
                effectText = conditionMatch![2];

                // Parse multiple conditions separated by "and"
                const conditionParts = conditionStr.split(/ and /i);

                for (const part of conditionParts) {
                    if (part.match(/this character is exerted/i)) {
                        conditions.push({ type: 'self_exerted' });
                    } else if (part.match(/you don't have a (.+) character in play/i)) {
                        const subtype = part.match(/you don't have a (.+) character in play/i)![1];
                        conditions.push({
                            type: 'count_check',
                            amount: 0,
                            filter: { subtype },
                            operator: 'eq'
                        });
                    } else if (part.match(/you have no cards in hand/i)) {
                        conditions.push({ type: 'hand_empty' });
                    } else if (part.match(/chosen opponent has more cards in their hand than you/i)) {
                        conditions.push({ type: 'opponent_has_more_cards' });
                    } else if (part.match(/you didn't put any cards into your inkwell this turn/i)) {
                        conditions.push({ type: 'no_ink_this_turn' });
                    }
                }
            }

            const effects: any[] = [];

            // Check for specific effect patterns that parseStaticEffects doesn't handle
            if (effectText.match(/^banish this character/i)) {
                effects.push({
                    type: 'banish',
                    target: { type: 'self' }
                });
            } else {
                effects.push(...parseStaticEffects(effectText));
            }

            if (effects.length > 0) {
                const ability: any = {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.END_OF_TURN,
                    trigger: {
                        type: 'end_of_turn'
                    },
                    effects,
                    rawText: text
                };

                if (conditions.length === 1) {
                    ability.condition = conditions[0];
                } else if (conditions.length > 1) {
                    ability.conditions = conditions;
                }

                return ability;
            }
            return null;
        }
    },

    // At the start of your turn
    {
        pattern: /^at the start of your turn, (.+)/i,
        handler: (match, card, text) => {
            const effectText = match[1];
            const effects = parseStaticEffects(effectText);

            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.TURN_START,
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    }
];
