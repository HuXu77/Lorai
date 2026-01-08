import { TriggerPattern } from '../types';
import { generateAbilityId, GameEvent } from '../../parser-utils';

export const STATS_PATTERNS: TriggerPattern[] = [
    // Gain X lore for each character you have in play
    {
        pattern: /gain (\d+) lore for each (.+) you have in play/i,
        handler: (match, card, text) => {
            const amountPer = parseInt(match[1]);
            const filterText = match[2].toLowerCase();

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'for_each',
                    variable: 'character',
                    in: {
                        type: 'count',
                        what: 'characters',
                        filter: { controller: 'self', zone: 'play' }
                    },
                    effect: {
                        type: 'gain_lore',
                        amount: amountPer
                    }
                }],
                rawText: text
            } as any;
        }
    },
    // Goldie O'Gilt - Cunning Prospector: "When you play this character, for each opponent with more lore than you, gain 1 lore."
    {
        pattern: /when you play this character, for each opponent with more lore than you, gain (\d+) lore/i,
        handler: (match, card, text) => {
            const amountPer = parseInt(match[1]);
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'for_each',
                    variable: 'opponent',
                    in: {
                        type: 'opponents',
                        filter: { moreLoreThanYou: true }
                    },
                    effect: {
                        type: 'gain_lore',
                        amount: amountPer
                    }
                }],
                rawText: text
            } as any;
        }
    },
    // Gain lore equal to discarded character's stats
    {
        pattern: /gain lore equal to the discarded character's (lore|◊|⬡)/i,
        handler: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'gain_lore',
                    amount: { type: 'variable', source: 'discarded_card_lore' }
                }],
                rawText: text
            } as any;
        }
    },
    // Go Go Tomago - Darting Dynamo: Pay to gain lore equal to damage
    {
        pattern: /when you play this character, you may pay (\d+) (?:⬡|ink) to gain lore equal to the damage on chosen opposing character/i,
        handler: (match, card, text) => {
            const cost = parseInt(match[1]);
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                cost: { ink: cost },
                effects: [{
                    type: 'gain_lore',
                    amount: {
                        type: 'variable',
                        source: 'damage_on_target',
                        target: 'chosen_opposing_character'
                    },
                    optional: true
                }],
                rawText: text
            } as any;
        }
    },
    // Shift -> Self Stat Boost (Mulan - Elite Archer)
    {
        pattern: /when you play this character, if you used shift to play (?:her|him|it|them|this character), (?:she|he|it|they|this character) (?:gets|gains) ([+-]\d+) ([◊¤⛉]) this turn/i,
        handler: (match, card, text) => {
            const amount = parseInt(match[1]);
            const statSymbol = match[2];
            const stat = (statSymbol === '◊' || statSymbol === '¤') ? 'lore' : (statSymbol === '⛉' ? 'willpower' : 'strength');

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                condition: { type: 'played_via_shift' },
                effects: [{
                    type: 'modify_stats',
                    stat,
                    amount,
                    target: { type: 'self' },
                    duration: 'this_turn'
                }],
                rawText: text
            } as any;
        }
    },
    // Chosen [subtype] character gains [keyword] this turn
    {
        pattern: /chosen (.+?) character gains (alert|evasive|ward|resist|challenger|support|bodyguard|singer|reckless|rush) this turn/i,
        handler: (match, card, text) => {
            const subtype = match[1];
            const keyword = match[2].charAt(0).toUpperCase() + match[2].slice(1).toLowerCase();

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'grant_keyword',
                    keyword,
                    target: {
                        type: 'chosen_character',
                        filter: { subtype }
                    },
                    duration: 'turn'
                }],
                rawText: text
            } as any;
        }
    },
    // Chosen [subtype] character gains [keyword] until [duration]
    {
        pattern: /chosen (.+?) character gains (evasive|ward|resist|challenger|support|bodyguard|singer|reckless|rush) until (?:the start of your next turn|end of turn)/i,
        handler: (match, card, text) => {
            const subtype = match[1];
            const keyword = match[2].charAt(0).toUpperCase() + match[2].slice(1).toLowerCase();
            const duration = text.match(/until the start of your next turn/i) ? 'until_next_turn' : 'until_end_of_turn';

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'grant_keyword',
                    keyword,
                    target: {
                        type: 'chosen_character',
                        filter: { subtype }
                    },
                    duration
                }],
                rawText: text
            } as any;
        }
    },
    // Give chosen [subtype] character [keyword] +[value] until [duration]
    {
        pattern: /give chosen (.+?) character (resist|ward) (\+\d+) until (?:the start of your next turn|end of turn)/i,
        handler: (match, card, text) => {
            const subtype = match[1];
            const keyword = match[2].charAt(0).toUpperCase() + match[2].slice(1).toLowerCase();
            const value = parseInt(match[3].substring(1)); // Remove '+'
            const duration = text.match(/until the start of your next turn/i) ? 'until_next_turn' : 'until_end_of_turn';

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'grant_keyword',
                    keyword,
                    value,
                    target: {
                        type: 'chosen_character',
                        filter: { subtype }
                    },
                    duration
                }],
                rawText: text
            } as any;
        }
    },
    // Fergus McDuck: Grant keyword to chosen character (Generic with subtype optional)
    {
        pattern: /when you play this character, chosen (?:(?:([a-z]+) )?character(?: of yours)?)? gains (ward|evasive|support|rush|challenger \+\d+|resist \+\d+) (?:(this turn)|(until the start of your next turn))/i,
        handler: (match, card, text) => {
            const subtype = match[1]?.toLowerCase();
            const keyword = match[2];
            const thisT = match[3];
            const duration = thisT ? 'this_turn' : 'until_start_of_next_turn';

            const target: any = { type: 'chosen_character' };
            if (subtype) {
                target.filter = { subtype };
            } else if (text.includes('of yours')) {
                target.filter = { mine: true };
            }

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'grant_keyword',
                    keyword,
                    target,
                    duration
                }],
                rawText: text
            } as any;
        }
    },
    // Give another chosen character [keyword] +[value] until [duration]
    {
        pattern: /give another chosen character (resist|ward) (\+\d+) until (?:the start of your next turn|end of turn)/i,
        handler: (match, card, text) => {
            const keyword = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
            const value = parseInt(match[2].substring(1));
            const duration = text.match(/until the start of your next turn/i) ? 'until_next_turn' : 'until_end_of_turn';

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'grant_keyword',
                    keyword,
                    value,
                    target: {
                        type: 'chosen_character',
                        filter: { another: true }
                    },
                    duration,
                    optional: text.includes('you may')
                }],
                rawText: text
            } as any;
        }
    },
    // Modify Stats: Kida - Protector of Atlantis
    {
        pattern: /when you play this character, all characters get ([+-]\d+) ([◊¤⛉]) until the start of your next turn/i,
        handler: (match, card, text) => {
            const statChange = parseInt(match[1]);
            const statSymbol = match[2];
            const stat = statSymbol === '◊' ? 'lore' : (statSymbol === '⛉' ? 'willpower' : 'strength');

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'modify_stats',
                    stat,
                    amount: statChange,
                    target: { type: 'all_characters' },
                    duration: 'until_start_of_next_turn'
                }],
                rawText: text
            } as any;
        }
    },
    // Modify Stats: Aladdin
    {
        pattern: /^when you play this character, your characters get ([+-]\d+) (?:strength|¤|willpower|⛉) this turn/i,
        handler: (match, card, text) => {
            const amount = parseInt(match[1]);
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'modify_stats',
                    stat: 'strength',
                    amount,
                    target: { type: 'all_characters', filter: { mine: true } },
                    duration: 'this_turn'
                }],
                rawText: text
            } as any;
        }
    },
    // Modify Stats: Chosen Character
    {
        pattern: /when you play this character, chosen (?:opposing )?character (?:gets|gains) ([+-]\d+) (strength|willpower|lore|¤|◊|⛉) (?:this turn|until the start of your next turn)/i,
        handler: (match, card, text) => {
            const modifier = parseInt(match[1]);
            const statRaw = match[2].toLowerCase();
            const statMap: Record<string, string> = {
                'strength': 'strength', '¤': 'strength',
                'willpower': 'willpower', '◊': 'willpower',
                'lore': 'lore', '⛉': 'lore'
            };
            const stat = statMap[statRaw] || statRaw;
            const duration = text.includes('until the start of your next turn') ? 'until_start_of_next_turn' : 'this_turn';

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                triggerFilter: { target: 'self' },
                effects: [{
                    type: 'modify_stats',
                    target: {
                        type: 'chosen_character',
                        opposing: text.toLowerCase().includes('opposing')
                    },
                    stat,
                    amount: modifier,
                    duration
                }],
                rawText: text
            } as any;
        }
    },
    // Gain N lore (Generic)
    {
        pattern: /^when you play this (?:character|item|action|song), gain (\d+) lore/i,
        handler: (match, card, text) => {
            const amount = parseInt(match[1]);
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'gain_lore',
                    amount
                }],
                rawText: text
            } as any;
        }
    },
    // Pattern: Scout/Scrooge McDuck (Based on card under)
    {
        pattern: /when you play this character, chosen character with a card under them gets ([+-]\d+) ([◊¤🛡️⛉]) this turn/i,
        handler: (match, card, text) => {
            const amount = parseInt(match[1]);
            const statSymbol = match[2];
            const stat = (statSymbol === '◊') ? 'lore' : 'strength';

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'modify_stats',
                    stat,
                    amount,
                    target: {
                        type: 'chosen_character',
                        filter: { hasCardUnder: true }
                    },
                    duration: 'turn'
                }],
                rawText: text
            } as any;
        }
    },
    // Grant Keyword (Tinker Bell)
    {
        pattern: /^when you play this character, chosen character gains (.+?) this turn/i,
        handler: (match, card, text) => {
            const keyword = match[1];
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'add_keyword',
                    keyword,
                    target: { type: 'chosen_character' },
                    duration: 'turn'
                }],
                rawText: text
            } as any;
        }
    },
    // Sneezy - Very Allergic (Play this or another Seven Dwarfs -> Stat Mod)
    {
        pattern: /whenever you play this character or another (.+?) character, you may give chosen character ([+-]\d+) (strength|willpower|lore|¤|◊|⛉) (?:this turn|until the start of your next turn)/i,
        handler: (match, card, text) => {
            const subtype = match[1];
            const modifier = parseInt(match[2]);
            const statRaw = match[3].toLowerCase();
            const statMap: Record<string, string> = {
                'strength': 'strength', '¤': 'strength',
                'willpower': 'willpower', '◊': 'willpower',
                'lore': 'lore', '⛉': 'lore'
            };
            const stat = statMap[statRaw] || 'strength';
            const duration = text.includes('until the start of your next turn') ? 'until_start_of_next_turn' : 'this_turn';

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                triggerFilter: {
                    type: 'play_card',
                    any: [
                        { target: 'self' },
                        { subtype: subtype, mine: true, other: true }
                    ]
                },
                effects: [{
                    type: 'modify_stats',
                    target: { type: 'chosen_character' },
                    stat,
                    amount: modifier,
                    duration,
                    optional: true
                }],
                rawText: text
            } as any;
        }
    },
    // Genie - Towering Phantasm: Gain Lore if Jafar/All Opponents have exerted character
    {
        pattern: /when (?:jafar|you) plays? this character, if each illumineer has an exerted character in play, he gains (\d+) lore/i,
        handler: (match, card, text) => {
            const amount = parseInt(match[1]);
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                conditions: [{
                    type: 'each_opponent_has',
                    filter: { type: 'character', status: 'exerted', zone: 'play' }
                }],
                effects: [{
                    type: 'gain_lore',
                    amount
                }],
                rawText: text
            } as any;
        }
    }
];
