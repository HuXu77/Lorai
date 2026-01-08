/**
 * Stat Modification Patterns Module
 * 
 * Handles patterns related to:
 * - Character stat buffs/debuffs (+X strength/willpower/lore)
 * - Location stat modifications
 * - Conditional stat modifications
 * - Per-character scaling
 */

import { PatternHandler } from './types';
import { parseStat } from '../pattern-matchers';

export const statModificationPatterns: PatternHandler[] = [
    // "Your locations get +2 ⛉."
    {
        name: 'location_stat_buff',
        pattern: /^your locations get ([+\-]\d+) (⛉|willpower)/i,
        handle: (text, match) => [{
            type: 'stat_modification',
            stat: 'willpower',
            amount: parseInt(match[1]),
            target: { type: 'your_locations' }
        }],
        priority: 100
    },

    // "Your characters with 4 ¤ or more get +1 ◊."
    {
        name: 'stat_conditional_buff',
        pattern: /^your characters with (\d+) ([¤🛡️⛉◊]) or more get ([+\-]\d+) ([¤🛡️⛉◊])/i,
        handle: (text, match) => {
            const minStat = parseInt(match[1]);
            const conditionStat = match[2];
            const buffAmount = parseInt(match[3]);
            const buffStat = match[4];

            return [{
                type: 'stat_modification',
                stat: buffStat === '◊' ? 'lore' : buffStat === '¤' ? 'strength' : 'willpower',
                amount: buffAmount,
                target: {
                    type: 'your_characters',
                    filter: {
                        minStat,
                        stat: conditionStat === '¤' ? 'strength' : conditionStat === '◊' ? 'lore' : 'willpower'
                    }
                }
            }];
        },
        priority: 95
    },

    // "Characters named Ursula get -2 ☼."
    {
        name: 'named_character_stat',
        pattern: /^characters named (.+) get ([+\-]\d+) ([^\s.]+)/i,
        handle: (text, match) => {
            const name = match[1];
            const amount = parseInt(match[2]);
            const statSymbol = match[3];
            const stat = (statSymbol === '¤' || statSymbol === '☼') ? 'strength'
                : (statSymbol === '◊') ? 'lore' : 'willpower';

            return [{
                type: 'stat_modification',
                stat,
                amount,
                target: {
                    type: 'all_characters',
                    filter: { name }
                }
            }];
        },
        priority: 90
    },

    // "This character gets +1 ◊ for each other Villain character you have in play."
    {
        name: 'per_character_scaling',
        pattern: /^this character gets \+(\d+) ([◊¤]) for each other (.+?) character(?:s)? you have in play/i,
        handle: (text, match) => [{
            type: 'modify_stats',
            stat: match[2] === '◊' ? 'lore' : 'strength',
            amount: { type: 'per_character', subtype: match[3].toLowerCase(), yours: true, other: true },
            multiplier: parseInt(match[1]),
            target: { type: 'self' }
        }],
        priority: 85
    },

    // "This location gets +1 ◊ for each character here."
    {
        name: 'location_per_character_scaling',
        pattern: /^this location gets \+(\d+) ([◊¤]) for each character here/i,
        handle: (text, match) => [{
            type: 'modify_stats',
            stat: match[2] === '◊' ? 'lore' : 'strength',
            amount: { type: 'per_character_at_location', target: 'self' },
            multiplier: parseInt(match[1]),
            target: { type: 'self' }
        }],
        priority: 80
    },

    // Pronoun gets: "it gets +2 strength this turn"
    {
        name: 'pronoun_stat_buff',
        pattern: /^(?:it|he|she|they) gets? ([+-])(\d+) (strength|willpower|lore|¤|※|🛡️|⛉|⛨|◊|⬡)(?: this turn)?\.?$/i,
        handle: (text, match) => {
            const sign = match[1];
            const value = parseInt(match[2]);
            const statRaw = match[3];
            const amount = sign === '-' ? -value : value;
            const stat = parseStat(statRaw);

            return [{
                type: 'modify_stats',
                stat,
                amount,
                target: { type: 'self' },
                duration: text.match(/this turn/i) ? 'this_turn' : undefined
            }];
        },
        priority: 75
    },

    // "While this character is exerted, your Ally characters get +1 ¤."
    {
        name: 'while_exerted_subtype_buff',
        pattern: /^while this character is exerted, your (.+?) characters get ([+\-]\d+) ([¤◊⛉])/i,
        handle: (text, match) => {
            const classification = match[1];
            const amount = parseInt(match[2]);
            const statSymbol = match[3];
            const stat = statSymbol === '¤' ? 'strength' : statSymbol === '◊' ? 'lore' : 'willpower';

            return [{
                type: 'conditional_stat_modification',
                condition: { type: 'self_exerted' },
                stat,
                amount,
                target: { type: 'your_characters', filter: { classification } }
            }];
        },
        priority: 70
    },

    // "While this character is being challenged, the challenging character gets -1 ¤."
    {
        name: 'while_being_challenged_buff',
        pattern: /^while this character is being challenged, the challenging character gets ([+\-]\d+) ([¤◊⛉])/i,
        handle: (text, match) => {
            const amount = parseInt(match[1]);
            const statSymbol = match[2];
            const stat = statSymbol === '¤' ? 'strength' : statSymbol === '◊' ? 'lore' : 'willpower';

            return [{
                type: 'conditional_stat_modification',
                condition: { type: 'self_being_challenged' },
                stat,
                amount,
                target: { type: 'challenging_character' }
            }];
        },
        priority: 65
    },

    // "Your other characters with Support get +1 ¤."
    {
        name: 'keyword_synergy_buff',
        pattern: /your (?:other )?characters with (.+?) (?:get|gain) ([+-]\d+) (strength|willpower|lore|¤|🛡️|⛉|◊|⬡)(?: this turn)?/i,
        handle: (text, match) => {
            const keyword = match[1];
            const amount = parseInt(match[2]);
            const symbol = match[3].toLowerCase();
            let stat = 'strength';
            if (['willpower', '🛡️', '⛉'].includes(symbol)) stat = 'willpower';
            if (['lore', '◊', '⬡'].includes(symbol)) stat = 'lore';

            return [{
                type: 'modify_stats',
                stat,
                amount,
                target: {
                    type: 'all_characters',
                    filter: {
                        mine: true,
                        other: true,
                        ability: keyword.toLowerCase()
                    }
                },
                duration: text.includes('this turn') ? 'turn' : undefined
            }];
        },
        priority: 60
    },

    // "Your characters get +3 ¤ while challenging a location this turn."
    {
        name: 'while_challenging_location',
        pattern: /^your characters get \+(\d+) ([◊¤]) while challenging a location(?: this turn)?/i,
        handle: (text, match) => [{
            type: 'modify_stats',
            stat: match[2] === '◊' ? 'lore' : 'strength',
            amount: parseInt(match[1]),
            target: { type: 'all_characters', filter: { mine: true } },
            condition: { type: 'while_challenging_location' }
        }],
        priority: 55
    },

    // Global buff: "Your characters get +1 ◊." / "Your Seven Dwarfs characters get +1 ¤."
    {
        name: 'global_character_buff',
        pattern: /^your(?: (.+?))? characters get \+(\d+) ([◊¤🛡️⛉])/i,
        handle: (text, match) => {
            let subtypeText = match[1];
            const amount = parseInt(match[2]);
            const symbol = match[3].toLowerCase();
            let stat = 'strength';
            if (['🛡️', '⛉'].includes(symbol)) stat = 'willpower';
            if (['◊'].includes(symbol)) stat = 'lore';

            let target: any = {
                type: 'all_characters',
                filter: { mine: true }
            };

            if (subtypeText) {
                if (subtypeText.toLowerCase().startsWith('other ')) {
                    target.type = 'other_characters';
                    subtypeText = subtypeText.substring(6);
                } else if (subtypeText.toLowerCase() === 'other') {
                    target.type = 'other_characters';
                    subtypeText = '';
                }

                if (subtypeText) {
                    const subtypes = subtypeText.split(/,?\s+(?:and\s+)?/).map(s => s.trim()).filter(s => s);
                    if (subtypes.length > 0) {
                        target.filter.subtypes = subtypes;
                    }
                }
            }

            return [{
                type: 'modify_stats',
                stat,
                amount,
                target
            }];
        },
        priority: 50
    },

    // While damaged/exerted conditional stat buff
    {
        name: 'while_condition_stat_buff',
        pattern: /while (?:this character|he|she) is (damaged|exerted), (?:it|he|she) gets ([+-]\d+) (strength|willpower|lore|¤|◊|⛉)/i,
        handle: (text, match) => {
            const condition = match[1].toLowerCase();
            const modifier = parseInt(match[2]);
            const statRaw = match[3].toLowerCase();

            const statMap: Record<string, string> = {
                'strength': 'strength', '¤': 'strength',
                'willpower': 'willpower', '◊': 'willpower',
                'lore': 'lore', '⛉': 'lore'
            };

            return [{
                type: 'conditional_stat_modifier',
                condition: { type: condition, target: 'self' },
                stat: statMap[statRaw] || statRaw,
                amount: modifier
            }];
        },
        priority: 45
    }
];
