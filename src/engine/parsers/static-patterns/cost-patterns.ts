/**
 * Cost Patterns Module
 * 
 * Handles patterns related to:
 * - Cost reductions ("You pay X less to play...")
 * - Cost increases ("Each player pays X more...")
 * - Free play conditions ("...you may play for free")
 * - Cost modifications per character type
 */

import { PatternHandler } from './types';

export const costPatterns: PatternHandler[] = [
    // Lilo - Causing an Uproar: "During your turn, if you've played 3 or more actions this turn, you may play this character for free."
    {
        name: 'play_free_action_count',
        pattern: /^during your turn, if you've played (\d+) or more actions this turn, you may play this character for free/i,
        handle: (text, match) => [{
            type: 'cost_set',
            amount: 0,
            condition: {
                type: 'played_actions_count',
                amount: parseInt(match[1]),
                operator: 'gte'
            }
        }],
        priority: 100
    },

    // Atlantica - Concert Hall: "Characters count as having +2 cost to sing songs while here."
    {
        name: 'sing_cost_modification',
        pattern: /^characters count as having ([+\-]\d+) cost to sing songs while here/i,
        handle: (text, match) => [{
            type: 'cost_modification',
            amount: parseInt(match[1]),
            target: { type: 'characters_at_location' },
            condition: { type: 'singing_song' }
        }],
        priority: 90
    },

    // Seeking the Half Crown: "For each Sorcerer character you have in play, you pay 1 ⬡ less to play this action."
    // Tramp - Street-Smart Dog: "For each character you have in play, you pay 1 ⬡ less to play this character."
    {
        name: 'cost_reduction_per_character',
        pattern: /^for each (.+?) (?:character )?you have in play, you pay (\d+) [⬡\u2b21] less to play this (?:card|action|character)/i,
        handle: (text, match) => [{
            type: 'cost_reduction_per_character',
            reductionPerCharacter: parseInt(match[2]),
            filter: { classification: match[1] },
            appliesTo: 'self'
        }],
        priority: 85
    },

    // Gantu: "Each player pays 2 ⬡ more to play actions or items."
    {
        name: 'cost_increase_all_players',
        pattern: /^each player pays (\d+) [\u2b21\u2b21] more to play (.+?)(?:\. \(this (?:doesn't|does not) apply to singing songs\.\))?[.]?$/i,
        handle: (text, match) => [{
            type: 'cost_increase',
            amount: parseInt(match[1]),
            cardTypes: match[2].split(/ or | and /).map(t => t.trim()),
            target: { type: 'all_players' },
            excludes: ['singing']
        }],
        priority: 80
    },

    // Simple form: "Your characters cost X less"
    {
        name: 'simple_cost_reduction',
        pattern: /^your (characters?|items?|locations?|actions?) cost (\d+) less\.?$/i,
        handle: (text, match) => {
            const cardTypeText = match[1].toLowerCase();
            const amount = parseInt(match[2]);
            const filter: any = { mine: true };

            if (cardTypeText.includes('character')) filter.cardType = 'character';
            else if (cardTypeText.includes('location')) filter.cardType = 'location';
            else if (cardTypeText.includes('item')) filter.cardType = 'item';
            else if (cardTypeText.includes('action')) filter.cardType = 'action';

            return [{
                type: 'cost_reduction',
                amount,
                filter
            }];
        },
        priority: 70
    },

    // Complex form: "You pay X ⬡ less to play {subtype} characters"
    {
        name: 'complex_cost_reduction',
        pattern: /^(?:your (.+?) cost|(?:you )?pay) (\d+) ⬡ less (?:to play|for) (.+)/i,
        handle: (text, match) => {
            const amount = parseInt(match[2]);
            const targetText = match[3].toLowerCase();
            const filter: any = {};

            if (targetText.includes('next')) filter.target = 'next_card';
            if (targetText.includes('character')) {
                filter.cardType = 'character';
                const subtypeMatch = targetText.match(/(.+?) character/i);
                if (subtypeMatch) {
                    const subtype = subtypeMatch[1].trim();
                    if (subtype !== 'next' && subtype !== 'your') {
                        filter.subtype = subtype;
                    }
                }
            } else if (targetText.includes('location')) filter.cardType = 'location';
            else if (targetText.includes('item')) filter.cardType = 'item';
            else if (targetText.includes('action')) filter.cardType = 'action';

            return [{
                type: 'cost_reduction',
                amount,
                filter
            }];
        },
        priority: 60
    },

    // "You pay 1 ⬡ less to play this character" / "your next character this turn"
    {
        name: 'specific_cost_reduction',
        pattern: /you pay (\d+) ⬡ less to play (your next character|this character)(?: this turn)?/i,
        handle: (text, match) => {
            const amount = parseInt(match[1]);
            const targetStr = match[2].toLowerCase();
            const targetType = targetStr === 'this character' ? 'self' : 'next_character';

            return [{
                type: 'cost_reduction',
                amount,
                target: { type: targetType },
                duration: text.match(/this turn/i) ? 'turn' : undefined
            }];
        },
        priority: 55
    },

    // Conditional cost reduction for subtype (Gadget Hackwrench)
    // "While you have 3 or more items in play, you pay 1 ⬡ less to play Inventor characters"
    {
        name: 'conditional_subtype_cost_reduction',
        pattern: /^while you have (\d+) or more (.+?) in play, you pay (\d+) ⬡ less to play (.+?) characters/i,
        handle: (text, match) => [{
            type: 'cost_reduction',
            amount: parseInt(match[3]),
            filter: {
                cardType: 'character',
                subtype: match[4].toLowerCase()
            },
            condition: {
                type: 'card_count_in_play',
                cardType: match[2].toLowerCase(),
                amount: parseInt(match[1]),
                operator: 'gte'
            }
        }],
        priority: 50
    }
];
