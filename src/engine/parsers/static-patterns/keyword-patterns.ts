/**
 * Keyword Grant Patterns Module
 * 
 * Handles patterns related to:
 * - Granting keywords to characters (Evasive, Rush, Ward, etc.)
 * - Classification grants (Detective, etc.)
 * - Conditional keyword grants
 */

import { PatternHandler } from './types';

export const keywordGrantPatterns: PatternHandler[] = [
    // "Your other characters gain the Detective classification."
    {
        name: 'grant_classification',
        pattern: /gain (?:the )?(.+) classification/i,
        handle: (text, match) => [{
            type: 'grant_classification',
            classification: match[1].trim(),
            target: { type: 'all_characters', filter: { mine: true, other: true } }
        }],
        priority: 100
    },

    // "Your Prince and King characters gain Resist +1."
    {
        name: 'your_characters_gain_keyword',
        pattern: /^your (.+?) characters gain (.+?)(?: \(.+\))?\.?$/i,
        handle: (text, match) => {
            const filterText = match[1];
            const effectText = match[2];

            let subtypes: string[] = [];
            const filter: any = {};

            if (filterText.includes(' and ')) {
                subtypes = filterText.split(' and ').map(s => s.trim());
            } else {
                subtypes = [filterText.trim()];
            }

            const lowerSubtypes = subtypes.map(s => s.toLowerCase());
            if (lowerSubtypes.includes('other')) {
                filter.other = true;
                subtypes = subtypes.filter(s => s.toLowerCase() !== 'other');
            }

            if (subtypes.length > 0) {
                filter.subtypes = subtypes;
            }

            let keyword = effectText;
            let amount = 1;

            const amountMatch = effectText.match(/(.+) ([+-]\d+)/);
            if (amountMatch) {
                keyword = amountMatch[1].trim();
                amount = parseInt(amountMatch[2]);
            }

            return [{
                type: 'grant_keyword',
                keyword,
                amount,
                target: {
                    type: 'your_characters',
                    filter
                }
            }];
        },
        priority: 95
    },

    // "All cards in your hand count as having ◉."
    {
        name: 'grant_inkwell_to_hand',
        pattern: /^all cards in your hand count as having [◉⬡◊]/i,
        handle: () => [{
            type: 'grant_inkwell',
            target: { type: 'cards_in_hand', filter: { mine: true } }
        }],
        priority: 90
    },

    // "Chosen character with no damage gains Resist +2 until the start of your next turn."
    {
        name: 'chosen_undamaged_gains_keyword',
        pattern: /chosen character with no damage gains (.+)(?: until the start of your next turn)?/i,
        handle: (text, match) => [{
            type: 'grant_keyword',
            keyword: match[1],
            target: {
                type: 'chosen_character',
                filter: { damaged: false }
            },
            duration: text.match(/until the start of your next turn/i) ? 'until_start_of_next_turn' : 'turn'
        }],
        priority: 85
    },

    // "Your characters named Jetsam gain Rush."
    {
        name: 'named_characters_gain_keyword',
        pattern: /^your characters? named (.+?) (?:gain|have) (.+)/i,
        handle: (text, match) => [{
            type: 'grant_keyword',
            keyword: match[2].toLowerCase().replace(/\.$/, ''),
            target: { type: 'named_character', name: match[1], mine: true }
        }],
        priority: 80
    },

    // "Your characters have Evasive." / "Your Princess characters have Resist +1."
    {
        name: 'global_keyword_grant',
        pattern: /^your(?: (.+?))? characters (?:have|gain) (.+?)(?: this turn)?\.?$/i,
        handle: (text, match) => {
            const subtype = match[1]?.trim();
            const keyword = match[2].toLowerCase().replace(/\.$/, '');
            const duration = text.match(/this turn/i) ? 'turn' : undefined;

            return [{
                type: 'grant_keyword',
                keyword,
                target: {
                    type: 'all_characters',
                    filter: subtype ? (() => {
                        if (subtype.includes(' and ')) {
                            const subtypes = subtype.split(/ and /i).map(s => s.trim());
                            return { subtypes, mine: true };
                        }
                        return { subtype: subtype.toLowerCase(), mine: true };
                    })() : { mine: true }
                },
                duration
            }];
        },
        priority: 75
    },

    // "Your Floodborn characters that have a card under them gain Evasive and Ward"
    {
        name: 'conditional_card_under_keyword',
        pattern: /^your (.+?) characters that have a card under them gain (.+)/i,
        handle: (text, match) => {
            const subtype = match[1].trim();
            const keywordText = match[2].trim();
            const keywords = keywordText.split(/ and /i).map(k => k.trim().replace(/\.$/, ''));

            return keywords.map(keyword => ({
                type: 'grant_keyword',
                keyword,
                target: {
                    type: 'all_characters',
                    filter: {
                        subtype: subtype.toLowerCase(),
                        mine: true,
                        has_card_under: true
                    }
                }
            }));
        },
        priority: 70
    },

    // "A character with cost 3 or more can ⟳ to sing this song for free."
    {
        name: 'alternate_sing_cost',
        pattern: /a character with cost (\d+) or more can ⟳ to sing this song for free/i,
        handle: (text, match) => [{
            type: 'alternate_sing_cost',
            cost: { type: 'exert_character_min_cost', amount: parseInt(match[1]) }
        }],
        priority: 65
    }
];
