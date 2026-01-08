/**
 * Conditional Wrapper Patterns Module
 * 
 * Handles patterns that wrap other effects with conditions:
 * - "While this character is exerted, [Effect]"
 * - "During your turn, [Effect]"
 * - "While at a location, [Effect]"
 * - "If you have X in play, [Effect]"
 */

import { PatternHandler } from './types';

// Note: These patterns are recursive - they parse inner text and add conditions
// They need special handling that works with the main parseStaticEffects function
// For now, we define them as patterns that can be matched but delegate to the main parser

export const conditionalPatterns: PatternHandler[] = [
    // "While this character is exerted, [Effect]" - Generic wrapper
    {
        name: 'while_exerted_wrapper',
        pattern: /^while this character is exerted, (.+)/i,
        handle: (text, match) => {
            // Returns null to signal "match but needs recursive parsing"
            // The main parser will handle this specially
            return null;
        },
        priority: 100,
        // Mark as recursive pattern
    },

    // "During your turn, [Effect]"
    {
        name: 'during_your_turn_wrapper',
        pattern: /^during your turn, (.+)/i,
        handle: () => null, // Recursive
        priority: 95
    },

    // "While at a location, [Effect]"
    {
        name: 'while_at_location_wrapper',
        pattern: /^while this character is at a location, (?:he|she|they|it) (gets?|gains?) (.+)/i,
        handle: () => null, // Recursive
        priority: 90
    },

    // "While you have a character named X in play, [Effect]"
    {
        name: 'while_named_character_wrapper',
        pattern: /^(?:while|if) you have a character named (.+) in play, (.+)/i,
        handle: () => null, // Recursive
        priority: 85
    },

    // "While you have an item/location in play, [Effect]"
    {
        name: 'while_have_card_wrapper',
        pattern: /^while you have an? (item|location|character) in play, (.+)/i,
        handle: () => null, // Recursive
        priority: 80
    },

    // "While there's a card under this character, [Effect]"
    {
        name: 'while_card_under_wrapper',
        pattern: /^while (?:this character has|there'?s) a card under (?:this character|him|her|them|it), (.+)/i,
        handle: () => null, // Recursive
        priority: 75
    },

    // "While this character has X stat or more, [Effect]"
    {
        name: 'while_stat_threshold_wrapper',
        pattern: /^while this character has (\d+) (strength|willpower|lore|¤|※|🛡️|⛉|◊|⬡) or more, (?:he|she|they|it) (gets?|gains?) (.+)/i,
        handle: () => null, // Recursive
        priority: 70
    },

    // "While this character has no damage, [Effect]"
    {
        name: 'while_no_damage_wrapper',
        pattern: /^while this character has no damage, (?:he|she|they|it) (gets?|gains?) (.+)/i,
        handle: () => null, // Recursive
        priority: 65
    },

    // "While this character has damage, [Effect]"
    {
        name: 'while_has_damage_wrapper',
        pattern: /^while this character has damage, (?:he|she|they|it) (gets?|gains?) (.+)/i,
        handle: () => null, // Recursive
        priority: 60
    },

    // "If you have X or more [type] in play, [Effect]"
    {
        name: 'if_count_in_play_wrapper',
        pattern: /^if you have (\d+) or more (?:other )?(.+) characters in play, (.+)/i,
        handle: () => null, // Recursive
        priority: 55
    }
];

// Export pattern names for reference
export const conditionalPatternNames = conditionalPatterns.map(p => p.name);
