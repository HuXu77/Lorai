import { AbilityDefinition, Card, generateAbilityId } from './parser-utils';

import { parseStaticEffects } from './static-effect-parser';
import { parseStat } from './pattern-matchers';

export interface StaticAbilityPattern {
    pattern: RegExp;
    createAbility: (match: RegExpMatchArray, card: Card, text: string) => AbilityDefinition | null;
}

export const STATIC_PATTERNS: StaticAbilityPattern[] = [
    // 1. Keyword Abilitiesr Buffs (Flotsam, Trigger)
    // "Your characters named Jetsam get +3 ¤."
    // "Your characters named Nutsy get +1 ◊."
    {
        pattern: /your characters named (.+) get \+(\d+) (strength|willpower|lore|¤|🛡️|⛉|◊|⬡)/i,
        createAbility: (match, card, text) => {
            const name = match[1];
            const amount = parseInt(match[2]);
            let stat = 'strength';
            const symbol = match[3].toLowerCase();
            if (['willpower', '🛡️', '⛉'].includes(symbol)) stat = 'willpower';
            if (['lore', '◊', '⬡'].includes(symbol)) stat = 'lore';

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'static',
                effects: [{
                    type: 'modify_stats',
                    stat,
                    amount,
                    target: {
                        type: 'all_characters',
                        filter: { name, mine: true }
                    }
                }],
                rawText: text
            } as any;
        }
    },
    // 1b. Keyword Abilities (Flotsam/Jetsam, Tinker Bell)
    // "Your characters named Flotsam gain Evasive."
    // "Your characters named Peter Pan gain Challenger +1."
    {
        pattern: /your characters named (.+) gain (.+)/i,
        createAbility: (match, card, text) => {
            const name = match[1];
            let keywordRaw = match[2].toLowerCase().replace('.', '').trim(); // Remove trailing period
            let keyword = keywordRaw;
            let amount: number | undefined;

            if (keywordRaw.startsWith('challenger ')) {
                amount = parseInt(keywordRaw.split('+')[1]);
                keyword = 'Challenger';
            } else {
                // Capitalize first letter
                keyword = keywordRaw.charAt(0).toUpperCase() + keywordRaw.slice(1);
            }

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'static',
                effects: [{
                    type: 'grant_keyword',
                    keyword,
                    amount,
                    target: {
                        type: 'all_characters',
                        filter: { name, mine: true }
                    }
                }],
                rawText: text
            } as any;
        }
    },
    // Play for free if (LeFou)
    {
        pattern: /during your turn, you may play this character for free if (.+) this turn/i,
        createAbility: (match, card, text) => {
            const conditionText = match[1];
            let event = '';
            if (conditionText.includes('banished in a challenge')) event = 'character_banished_in_challenge';

            if (event) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'static',
                    effects: [{ type: 'play_for_free' }],
                    condition: {
                        type: 'event_occurred',
                        event,
                        turn: 'this_turn'
                    },
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // CAMPAIGN: During the Illumineers' turn (Static)
    {
        pattern: /^during the illumineers' turn, (.+)/i,
        createAbility: (match, card, text) => {
            const effects = parseStaticEffects(match[1]);
            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'static',
                    condition: { type: 'during_illumineers_turn' },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },

    // During your turn (Static)
    {
        pattern: /^during your turn, (.+)/i,
        createAbility: (match, card, text) => {
            const effects = parseStaticEffects(match[1]);
            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'static',
                    condition: { type: 'during_your_turn' },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // While you have no cards in hand (Static)
    {
        pattern: /^while you have no cards in (?:your )?hand, (.+)/i,
        createAbility: (match, card, text) => {
            const effects = parseStaticEffects(match[1]);
            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'static',
                    condition: { type: 'hand_empty' },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // While this character is challenging (or simple "While challenging")
    {
        pattern: /^while (?:this character is )?challenging, (.+)/i,
        createAbility: (match, card, text) => {
            let effectText = match[1];
            // Prepend subject if missing (e.g. "gets +X" -> "this character gets +X")
            if (effectText.match(/^(gets|gains|has|is)/i)) {
                effectText = `this character ${effectText}`;
            }

            const effects = parseStaticEffects(effectText);
            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'static',
                    condition: { type: 'while_challenging' },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // While damaging (Static)
    {
        pattern: /^while damaging, (.+)/i,
        createAbility: (match, card, text) => {
            let effectText = match[1];
            // Prepend subject if missing
            if (effectText.match(/^(gets|gains|has|is)/i)) {
                effectText = `this character ${effectText}`;
            }

            const effects = parseStaticEffects(effectText);
            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'static',
                    condition: { type: 'while_damaging' },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // While this character is at a location (or simple "While at a location")
    {
        pattern: /^while (?:this character is )?at a location, (.+)/i,
        createAbility: (match, card, text) => {
            let effectText = match[1];
            // Prepend subject if missing
            if (effectText.match(/^(gets|gains|has|is)/i)) {
                effectText = `this character ${effectText}`;
            }

            const effects = parseStaticEffects(effectText);
            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'static',
                    condition: { type: 'at_any_location' }, // Align with test expectation
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // Location: Characters can't be challenged while here (Tiana's Palace)
    {
        pattern: /characters can't be challenged while here/i,
        createAbility: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'static',
                condition: { type: 'while_here' },
                effects: [{
                    type: 'restriction',
                    restriction: 'cant_be_challenged'
                }],
                rawText: text
            } as any;
        }
    },

    // While you have X or more cards in hand (Static)
    {
        pattern: /^while you have (\d+) or more cards in (?:your )?hand, (.+)/i,
        createAbility: (match, card, text) => {
            const count = parseInt(match[1]);
            let effectText = match[2];
            // Prepend subject if missing
            if (effectText.match(/^(gets|gains|has|is)/i)) {
                effectText = `this character ${effectText}`;
            }

            const effects = parseStaticEffects(effectText);
            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'static',
                    condition: {
                        type: 'while_hand_size',
                        amount: count,
                        operator: 'gte'
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // While you have a character named X in play (Static)
    {
        pattern: /^while you have a character named (.+) in play, (.+)/i,
        createAbility: (match, card, text) => {
            const name = match[1];
            const effectText = match[2];
            const effects = parseStaticEffects(effectText);
            if (effects.length > 0) {
                // Attach condition to effects to match test expectations (and LeFou pattern)
                effects.forEach(eff => {
                    eff.condition = {
                        type: 'presence',
                        filter: { name }
                    };
                });

                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'static',
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // BATCH 26: "Unless" conditions (Bashful)
    // "This character can't quest unless you have another Seven Dwarfs character in play."
    {
        pattern: /this character can't quest unless you have another (.+) character in play/i,
        createAbility: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'static',
                condition: {
                    type: 'unless_presence',
                    filter: { subtype: match[1].toLowerCase() }
                },
                effects: [{
                    type: 'restriction',
                    restriction: 'cant_quest'
                }],
                rawText: text
            } as any;
        }
    },
    // BATCH 26: "Unless" conditions (Treasure Guardian)
    // "This character can't challenge or quest unless it is at a location."
    {
        pattern: /this character can't challenge or quest unless it is at a location/i,
        createAbility: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'static',
                condition: { type: 'unless_location' }, // New condition type
                effects: [{
                    type: 'restriction',
                    restriction: 'cant_challenge_or_quest'
                }],
                rawText: text
            } as any;
        }
    },
    // If you have a character named X in play, reduce cost (LeFou)
    {
        pattern: /if you have a character named (.+) in play, (.+)/i,
        createAbility: (match, card, text) => {
            const name = match[1];
            const effectText = match[2];
            const effects = parseStaticEffects(effectText);

            if (effects.length > 0) {
                // Attach condition to the effect
                effects[0].condition = {
                    type: 'presence',
                    filter: { name }
                };
            }

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'static',
                effects,
                rawText: text
            } as any;
        }
    },

    // While exerted + If you have character named X (Panic)
    {
        pattern: /while (?:this character is )?exerted, if you have a character named (.+) in play, (.+)/i,
        createAbility: (match, card, text) => {
            const name = match[1];
            const effectText = match[2];
            const effects = parseStaticEffects(effectText);

            if (effects.length > 0) {
                // Attach 'presence' condition to the effects
                effects.forEach(eff => {
                    eff.condition = {
                        type: 'presence',
                        filter: { name }
                    };
                });

                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'static',
                    condition: { type: 'self_exerted' },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // While this character is exerted (Static)
    {
        pattern: /while this character is exerted, (.+)/i, // Relaxed regex for robustness
        createAbility: (match, card, text) => {
            const effects = parseStaticEffects(match[1]);
            // DEBUG: If effects are found
            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'static',
                    condition: {
                        type: 'self_exerted'
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    {
        pattern: /your characters named (.+?) count as having ([+\-]\d+) cost to sing songs/i,
        createAbility: (match, card) => {
            const name = match[1];
            const amount = parseInt(match[2]);
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'static',
                effects: [{
                    type: 'modify_stats', // Using modify_stats for 'singer_cost' ideally, or a new effect type
                    // But usually singer is implemented as "can sing songs cost X".
                    // If they count as having +1 cost, effectively they get +1 Singer capacity.
                    // Let's use 'singer_buff' if supported, or 'modify_stats' with a special stat 'singer_cost'.
                    stat: 'singer_cost',
                    amount,
                    target: { type: 'all_characters', filter: { name, mine: true } }
                }],
                rawText: match[0]
            } as any;
        }
    },
    // Can challenge ready characters (Static)
    {
        pattern: /^this character can challenge ready characters/i,
        createAbility: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'static',
                effects: [{
                    type: 'ability_grant',
                    ability: 'challenge_ready_characters'
                }],
                rawText: text
            } as any;
        }
    },
    // Location: Characters here get +X stats (Hidden Cove, Ursula's Lair)
    // "Characters here get +1 🛡️."
    // "Characters named Ursula get +1 ◊ while here."
    {
        pattern: /^characters (?:named (.+?) )?get ([+\-]\d+) (.+?)(?: and ([+\-]\d+) (.+?))? while here/i,
        createAbility: (match, card) => {
            const nameFilter = match[1];
            const amount1 = parseInt(match[2]);
            const stat1 = parseStat(match[3]);

            const effects: any[] = [{
                type: 'modify_stats',
                target: { type: 'all_characters', filter: { zone: 'location' } },
                modifiers: { [stat1]: amount1 }
            }];

            if (nameFilter) {
                effects[0].target.filter.name = nameFilter;
            }

            if (match[4] && match[5]) {
                const amount2 = parseInt(match[4]);
                const stat2 = parseStat(match[5]);
                effects[0].modifiers[stat2] = amount2;
            }

            // "while here" condition
            effects[0].condition = { type: 'at_location', locationId: card.id.toString() };

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'static',
                effects,
                rawText: match[0]
            } as any;
        }
    },
    // Location: Characters here gain keyword
    // "Characters here have Evasive."
    {
        pattern: /^characters here have (.+)/i,
        createAbility: (match, card) => {
            const keyword = match[1];
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'static',
                effects: [{
                    type: 'grant_keyword',
                    target: { type: 'all_characters', filter: { zone: 'location' } },
                    keyword,
                    condition: { type: 'at_location', locationId: card.id.toString() }
                }],
                rawText: match[0]
            } as any;
        }
    },
    // BATCH 42: "While you have an exerted character here" (Ursula's Garden)
    {
        pattern: /^while you have an exerted character here, (.+)/i,
        createAbility: (match, card, text) => {
            const effects = parseStaticEffects(match[1]);
            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'static',
                    condition: { type: 'while_here_exerted' },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },

    // BATCH 42: "While this character has no damage" (Razoul)
    {
        pattern: /^while this character has no damage, (.+)/i,
        createAbility: (match, card, text) => {
            let effectText = match[1];

            // Normalize pronouns
            if (effectText.match(/^(?:he|she|it|they) /i)) {
                effectText = effectText.replace(/^(?:he|she|it|they) /i, 'this character ');
            }

            // Prepend subject if implicit
            if (effectText.match(/^(gets|gains|has|is)/i)) {
                effectText = `this character ${effectText}`;
            }

            const effects = parseStaticEffects(effectText);
            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'static',
                    condition: { type: 'has_no_damage', target: 'self' },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },

    // BATCH 42: "You may play this character for free if..." (LeFou)
    {
        pattern: /(?:during your turn, )?you may play this character for free if (.+)/i,
        createAbility: (match, card, text) => {
            const conditionText = match[1];
            let condition: any = {};

            // "an opposing character was banished in a challenge this turn"
            if (conditionText.match(/an opposing character was banished in a challenge this turn/i)) {
                condition = {
                    type: 'event_occurred',
                    event: 'character_banished_in_challenge',
                    turn: 'this_turn'
                };
            }

            if (Object.keys(condition).length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'static',
                    condition,
                    effects: [{
                        type: 'play_for_free'
                    }],
                    rawText: text
                } as any;
            }
            return null;
        }
    },

    // Deck Rule: "You may have any number of cards named Microbots in your deck."
    {
        pattern: /you may have any number of cards named (.+) in your deck/i,
        createAbility: (match, card, text) => {
            const cardName = match[1];
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'static',
                effects: [{
                    type: 'deck_rule',
                    rule: 'unlimited_copies',
                    name: cardName
                }],
                rawText: text
            } as any;
        }
    },

    // Catch-all: try parseStaticEffects for any unmatched static ability
    {
        pattern: /.+/,
        createAbility: (match, card, text) => {
            const effects = parseStaticEffects(text);
            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'static',
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    }
];
