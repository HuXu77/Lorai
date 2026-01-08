import { TriggerPattern } from '../types';
import { generateAbilityId, GameEvent } from '../../parser-utils';

export const CONTROL_PATTERNS: TriggerPattern[] = [
    // Opponents can't play actions (Pete - Games Referee)
    {
        pattern: /^when you play this character, opponents (?:can't|cannot) play actions until the start of your next turn/i,
        handler: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'restriction',
                    restriction: 'cant_play_actions',
                    target: { type: 'all_opponents' },
                    duration: 'until_source_next_start',
                }],
                rawText: text
            } as any;
        }
    },
    // Return chosen to hand (Basil)
    {
        pattern: /^when you play this (?:character|action|item|song), (?:you may )?return chosen (character|item) to (?:its|their|owner's) (?:player's )?hand/i,
        handler: (match, card, text) => {
            const targetType = match[1].toLowerCase();
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'return_to_hand',
                    target: {
                        type: `chosen_${targetType}`
                    },
                    optional: text.includes('you may')
                }],
                rawText: text
            } as any;
        }
    },
    // Return Self to Hand (Genie)
    {
        pattern: /return this character to your hand/i,
        handler: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'return_self',
                    target: { type: 'self' },
                    destination: 'hand',
                    optional: text.includes('you may')
                }],
                rawText: text
            } as any;
        }
    },
    // Bounce Opposing with Stats
    {
        pattern: /return chosen opposing character with (\d+) (strength|willpower|lore|¤|🛡️|⛉|◊|⬡) or less to their player's hand/i,
        handler: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'return_to_hand',
                    target: {
                        type: 'chosen_character',
                        filter: {
                            opponent: true,
                            maxStrength: parseInt(match[1])
                        }
                    }
                }],
                rawText: text
            } as any;
        }
    },
    // Return all other characters (Milo Thatch)
    {
        pattern: /when you play this character, return all other characters to their players' hands/i,
        handler: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'return_to_hand',
                    target: { type: 'all_other_characters' }
                }],
                rawText: text
            } as any;
        }
    },
    // Return all other exerted (Jasmine - Shift)
    {
        pattern: /^when you play this character, if you used shift to play (?:her|she|it|them), return all other exerted characters to their players' hands/i,
        handler: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                conditions: [{ type: 'played_via_shift' }],
                effects: [{
                    type: 'return_to_hand',
                    target: {
                        type: 'all_other_characters',
                        filter: { exerted: true }
                    }
                }],
                rawText: text
            } as any;
        }
    },
    // Exert All Opposing
    {
        pattern: /^(?:when you play this character, )?exert all opposing characters/i,
        handler: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'exert',
                    target: { type: 'all_opposing_characters' }
                }, {
                    type: 'restriction',
                    restriction: 'cant_ready',
                    target: { type: 'all_opposing_characters' },
                    duration: 'next_turn'
                }],
                rawText: text
            } as any;
        }
    },
    // Exert All Opposing Damaged Characters (Beast - Wolfsbane)
    {
        pattern: /^(?:when you play this character, )?exert all opposing damaged characters/i,
        handler: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'exert',
                    target: {
                        type: 'all_opposing_characters',
                        filter: { damaged: true }
                    }
                }],
                rawText: text
            } as any;
        }
    },
    // Exert Chosen Opposing & Freeze
    {
        pattern: /^when you play this character, exert chosen opposing (item|character|location)\. it can't ready at the start of its next turn/i,
        handler: (match, card, text) => {
            const cardType = match[1].toLowerCase();
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [
                    {
                        type: 'exert',
                        target: { type: `chosen_opposing_${cardType}` }
                    },
                    {
                        type: 'restriction',
                        restriction: 'cant_ready',
                        target: { type: 'same_target' },
                        duration: 'next_turn_start'
                    }
                ],
                rawText: text
            } as any;
        }
    },
    // BATCH 48: Location-based character restriction (Elsa's Ice Palace)
    {
        pattern: /when you play this location, choose an exerted character\. while this location is in play, that character can't ready at the start of their turn/i,
        handler: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'choose_and_lock',
                    target: { type: 'chosen_character', filter: { exerted: true } },
                    restriction: 'cant_ready',
                    duration: 'while_in_play',
                    timing: 'start_of_turn'
                }],
                rawText: text
            } as any;
        }
    },
    // Conditional Freeze (Anna - Heir to Arendelle)
    {
        pattern: /^when you play this character, if you have a character named (.+?) in play, (.+)/i,
        handler: (match, card, text) => {
            const requiredName = match[1];
            const effectText = match[2];

            if (effectText.match(/choose an opposing character\. that character doesn't ready at the start of their next turn/i)) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_PLAYED,
                    effects: [{
                        type: 'conditional',
                        condition: {
                            type: 'presence',
                            filter: { name: requiredName }
                        },
                        effect: {
                            type: 'restriction',
                            restriction: 'cant_ready',
                            target: { type: 'chosen_opposing_character' },
                            duration: 'next_turn_start'
                        }
                    }],
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // Freeze Chosen (Doesn't Ready) - Generic
    {
        pattern: /when you play this character, (?:chosen|exerted) (?:opposing )?character (?:doesn't|can't) ready at the start of their next turn/i,
        handler: (match, card, text) => {
            const isOpposing = text.includes('opposing');
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'restriction',
                    restriction: 'cant_ready',
                    target: {
                        type: isOpposing ? 'chosen_opposing_character' : 'chosen_character',
                        filter: text.match(/exerted/i) ? { status: 'exerted' } : undefined
                    },
                    duration: 'next_turn'
                }],
                rawText: text
            } as any;
        }
    },
    // Ready Chosen Character at Location
    {
        pattern: /ready chosen character of yours at a location\. they can't quest for the rest of this turn/i,
        handler: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'ready',
                    target: { type: 'chosen_character', filter: { mine: true, at_location: true } }
                }, {
                    type: 'restriction',
                    restriction: 'cant_quest',
                    target: { type: 'same_target' },
                    duration: 'this_turn'
                }],
                rawText: text
            } as any;
        }
    },
    // For Each X, Return Y (Maleficent - Formidable Queen)
    {
        pattern: /when you play this character, for each (?:of your )?characters named (.+?) in play, return a chosen (.+?) with cost (\d+) or less to their player's hand/i,
        handler: (match, card, text) => {
            const nameFilter = match[1];
            const targetType = match[2].toLowerCase(); // "opposing character, item, or location"
            const maxCost = parseInt(match[3]);

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'for_each',
                    variable: 'target',
                    in: {
                        type: 'count',
                        what: 'characters',
                        filter: {
                            controller: 'self',
                            name: nameFilter,
                            zone: 'play'
                        }
                    },
                    effect: {
                        type: 'return_to_hand',
                        target: {
                            type: 'chosen_card',
                            filter: {
                                opponent: true,
                                maxCost: maxCost,
                                type: targetType.includes('character') ? 'character' : undefined // Simplified
                            }
                        }
                    }
                }],
                rawText: text
            } as any;
        }
    },
    // Pay to Ready (Tuk Tuk)
    {
        pattern: /when you play this character, you may pay (\d+) (?:⬡|ink) to ready another chosen character/i,
        handler: (match, card, text) => {
            const cost = parseInt(match[1]);
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                cost: { ink: cost },
                effects: [{
                    type: 'ready',
                    target: { type: 'chosen_character', filter: { another: true } },
                    optional: true
                }],
                rawText: text
            } as any;
        }
    },
    // Goofy - Swordsman: Ready Self
    {
        pattern: /whenever you play a character with (bodyguard|evasive|ward|rush|support), (?:ready this character|you may ready this character)(?:\. (?:he|she|they|it) can't quest for the rest of this turn)?/i,
        handler: (match, card, text) => {
            const keyword = match[1];
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                triggerFilter: {
                    mine: true,
                    type: 'character',
                    keyword: keyword
                },
                effects: [
                    {
                        type: 'ready',
                        target: { type: 'self' }
                    },
                    {
                        type: 'cant_quest',
                        target: { type: 'self' },
                        duration: 'turn'
                    }
                ],
                rawText: text
            } as any;
        }
    },
    // Exert chosen [subtype] character
    {
        pattern: /exert chosen (.+?) character/i,
        handler: (match, card, text) => {
            const subtype = match[1];
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'exert',
                    target: {
                        type: 'chosen_character',
                        filter: { subtype }
                    },
                    optional: text.includes('you may')
                }],
                rawText: text
            } as any;
        }
    },
    // Move Self and Other to Location (Tuk Tuk)
    {
        pattern: /when you play this character, you may move (?:him|her|it) and one of your other characters to the same location for free\. (?:If you do, )?The other character (?:gets|gains) ([+-]\d+) ([◊¤⛉]) this turn/i,
        handler: (match, card, text) => {
            const amount = parseInt(match[1]);
            const statSymbol = match[2];
            const stat = (statSymbol === '◊' || statSymbol === '¤') ? 'lore' : (statSymbol === '⛉' ? 'willpower' : 'strength');

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [
                    {
                        type: 'move_to_location',
                        target: {
                            type: 'self_and_chosen_other',
                            filter: { mine: true }
                        },
                        cost_adjustment: 'free',
                        optional: true
                    },
                    {
                        type: 'modify_stats',
                        stat,
                        amount,
                        target: { type: 'chosen_other_character' },
                        duration: 'this_turn'
                    }
                ],
                rawText: text
            } as any;
        }
    },
    // Metal Scorpion: Each Illumineer chooses and banishes 1 char, 1 item, 1 location
    {
        pattern: /when (?:jafar|you) plays? this (?:character|location), each illumineer chooses and banishes one of their characters, one of their items, and one of their locations/i,
        handler: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'banish',
                    target: {
                        type: 'each_player_chooses',
                        filter: {
                            characters: 1,
                            items: 1,
                            locations: 1
                        }
                    }
                }],
                rawText: text
            } as any;
        }
    },
    // The Sultan - Spectral Ruler: Each Illumineer chooses and discards a card
    {
        pattern: /when (?:jafar|you) plays? this (?:character|location), each illumineer chooses and discards a card/i,
        handler: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'discard',
                    amount: 1,
                    target: { type: 'all_players' },
                    method: 'choose'
                }],
                rawText: text
            } as any;
        }
    },
    // Friar Tuck: Player with most cards discards
    {
        pattern: /the player or players with the most cards in their hand chooses and discards a card/i,
        handler: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'discard',
                    amount: 1,
                    target: {
                        type: 'players_with_most_cards'
                    },
                    method: 'choose'
                }],
                rawText: text
            } as any;
        }
    }
];
