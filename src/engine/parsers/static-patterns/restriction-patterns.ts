/**
 * Restriction Patterns Module
 * 
 * Handles patterns related to:
 * - Can't quest/challenge/sing restrictions
 * - Can't ready effects
 * - Can't lose lore
 * - Deck limits
 */

import { PatternHandler } from './types';

export const restrictionPatterns: PatternHandler[] = [
    // "While you have an Alien or Robot character here, this location can't be challenged."
    {
        name: 'cant_be_challenged_here',
        pattern: /^while you have an? (.+) character here, this location can't be challenged/i,
        handle: (text, match) => {
            const types = match[1].split(' or ').map(t => t.trim());
            return [{
                type: 'restriction',
                restriction: 'cant_be_challenged',
                condition: {
                    type: 'characters_at_location',
                    subtypes: types,
                    count: 1,
                    comparison: 'gte'
                },
                target: { type: 'self' }
            }];
        },
        priority: 100
    },

    // "Each opponent chooses and exerts one of their characters. Those characters can't ready at the start of their next turn."
    {
        name: 'opponent_exert_cant_ready',
        pattern: /^each opponent chooses and exerts one of their characters\. those characters can't ready at the start of their next turn/i,
        handle: () => [
            {
                type: 'opponent_chooses_and_exerts',
                target: { type: 'each_opponent' }
            },
            {
                type: 'cant_ready',
                target: { type: 'exerted_characters' },
                duration: 'next_turn_start'
            }
        ],
        priority: 95
    },

    // "Opposing players can't use battleground abilities."
    {
        name: 'cant_use_battleground',
        pattern: /^opposing players can't use battleground abilities/i,
        handle: () => [{
            type: 'cant_use_battleground_abilities',
            target: { type: 'opposing_players' }
        }],
        priority: 90
    },

    // "During opponents' turns, you can't lose lore."
    {
        name: 'cant_lose_lore_opponents_turn',
        pattern: /^during opponents'? turns?, you can't lose lore/i,
        handle: () => [{
            type: 'cant_lose_lore',
            condition: { type: 'during_opponents_turns' }
        }],
        priority: 85
    },

    // "This character can't ⟳ to sing songs."
    {
        name: 'cant_sing',
        pattern: /^this character can't ⟳ to sing songs/i,
        handle: () => [{
            type: 'restriction',
            restriction: 'cant_sing'
        }],
        priority: 80
    },

    // "You may only have 2 copies of The Glass Slipper in your deck."
    {
        name: 'deck_limit',
        pattern: /^you may only have (\d+) copies of (.+?) in your deck/i,
        handle: (text, match) => [{
            type: 'deck_limit',
            limit: parseInt(match[1]),
            cardName: match[2]
        }],
        priority: 75
    },

    // "This character can't quest unless..."
    {
        name: 'cant_quest_unless',
        pattern: /^this character can't quest unless (.+)/i,
        handle: (text, match) => [{
            type: 'restriction',
            restriction: 'cant_quest',
            unless: match[1]
        }],
        priority: 70
    },

    // Items/characters enter play exerted
    {
        name: 'self_enters_exerted',
        pattern: /^this (?:item|character) enters play exerted/i,
        handle: () => [{
            type: 'enters_play_exerted',
            target: { type: 'self' }
        }],
        priority: 65
    },

    // "Opposing items enter play exerted."
    {
        name: 'opposing_items_exerted',
        pattern: /^opposing items enter play exerted/i,
        handle: () => [{
            type: 'enters_play_exerted',
            target: { type: 'all_opposing_items' }
        }],
        priority: 60
    },

    // "While this character is exerted, opposing characters with Rush enter play exerted."
    {
        name: 'rush_enters_exerted',
        pattern: /^while this character is exerted, opposing characters with rush enter play exerted/i,
        handle: () => [{
            type: 'enter_play_exerted',
            target: {
                type: 'opposing_characters',
                filter: { keyword: 'Rush' }
            },
            condition: { type: 'self_exerted' }
        }],
        priority: 55
    }
];
