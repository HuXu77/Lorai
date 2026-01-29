import { TriggerPattern } from './types';
import { AbilityDefinition, Card, generateAbilityId, GameEvent } from '../parser-utils';
import { parseConditionalEffect } from '../triggered-helpers';
import { parseStaticEffects } from '../static-effect-parser';

export function getOnQuestPatterns(): TriggerPattern[] {
    return [
        // Thaddeus E. Klang - Metallic Leader: "Whenever this character quests while at a location, you may deal 1 damage to chosen character."
        {
            pattern: /^whenever (?:this character|he|she|it) quests while at a location, (.+)/i,
            handler: (match, card, text) => {
                const effectText = match[1];
                const effects = parseStaticEffects(effectText);
                if (effects.length > 0) {
                    if (match[1].match(/^you may/i)) {
                        effects.forEach(e => e.optional = true);
                    }
                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.ON_QUEST,
                        triggerFilter: {
                            condition: 'at_location'
                        },
                        effects,
                        rawText: text
                    } as any;
                }
                return null;
            }
        },
        // CAMPAIGN: Jafar - "Whenever this character quests, Jafar draws a card."
        {
            pattern: /^whenever this character quests, jafar (.+)/i,
            handler: (match, card, text) => {
                let effectText = match[1];
                // Normalize
                // "Jafar draws a card" -> match[1]="draws a card"
                // We want "draw a card" for parseStaticEffects.
                // "Jafar gains 2 lore" -> "gains 2 lore" -> "gain 2 lore"

                effectText = match[1]
                    .replace(/^draws/i, 'draw')
                    .replace(/^gains/i, 'gain')
                    .replace(/^deals/i, 'deal');

                const effects = parseStaticEffects(effectText);

                if (effects.length > 0) {
                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CARD_QUESTED,
                        effects,
                        rawText: text
                    } as any;
                }
                return null;
            }
        },
        // Aladdin - Vigilant Guard: "Whenever one of your Ally characters quests, you may remove up to 2 damage from this character."
        // Daisy Duck - Sapphire Champion: "Whenever one of your other Sapphire characters quests, ..."
        {
            pattern: /^whenever one of your (?:other )?(.+?) characters quests, (.+)/i,
            handler: (match, card, text) => {
                const filterText = match[1];
                const effectText = match[2];
                const effects = parseStaticEffects(effectText);

                let filter: any = { mine: true };

                // Parse filter text (e.g. "Ally", "Sapphire", "other Sapphire")
                if (text.toLowerCase().includes('other')) {
                    filter.other = true;
                }

                const subtypeMatch = filterText.match(/(Ally|Sapphire|Emerald|Ruby|Steel|Amethyst|Amber)/i);
                if (subtypeMatch) {
                    // If it's a color, we might need to handle it differently if the system distinguishes
                    // but 'subtype' often covers classifications. 
                    // Actually, colors are usually top-level properties.
                    const val = subtypeMatch[1];
                    if (['Sapphire', 'Emerald', 'Ruby', 'Steel', 'Amethyst', 'Amber'].includes(val)) {
                        filter.color = val;
                    } else {
                        filter.subtype = val; // e.g. "Ally"
                    }
                }

                if (effects.length > 0) {
                    if (match[2].match(/^you may/i)) {
                        effects.forEach(e => e.optional = true);
                    }

                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CARD_QUESTED,
                        triggerFilter: filter,
                        effects,
                        rawText: text
                    } as any;
                }
                return null;
            }
        },
        // Location: "Whenever a character quests while here, [effect]"
        {
            pattern: /^whenever a character quests while here, (.+)/i,
            handler: (match, card, text) => {
                const effectText = match[1];
                const effects = parseConditionalEffect(effectText);
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    triggerFilter: {
                        zone: 'location',
                        locationId: card.id.toString()
                    },
                    effects: effects.length > 0 ? effects : parseStaticEffects(effectText),
                    rawText: text
                } as any;
            }
        },
        // Kanga: "Whenever this character quests, another chosen character of yours can't be challenged until the start of your next turn."
        {
            pattern: /^whenever this character quests, another chosen character of yours can't be challenged until the start of your next turn/i,
            handler: (match, card, text) => {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [{
                        type: 'cant_be_challenged',
                        target: { type: 'chosen_character', filter: { mine: true, exclude: 'self' } },
                        duration: 'until_next_turn_start'
                    }],
                    rawText: text
                } as any;
            }
        },

        // Mad Hatter: "Whenever this character quests, you may look at the top card of chosen player's deck. Put it on top of their deck or into their discard."
        {
            pattern: /^whenever this character quests, you may look at the top card of chosen player[''']s deck\. put it on top of their deck or into their discard/i,
            handler: (match, card, text) => {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [
                        {
                            type: 'look_at_top_of_deck',
                            target: { type: 'chosen_player' }
                        },
                        {
                            type: 'choose_destination',
                            card: { type: 'looked_at_card' },
                            destinations: ['top_of_deck', 'discard']
                        }
                    ],
                    optional: true,
                    rawText: text
                } as any;
            }
        },

        // Aladdin: "Whenever this character quests, you may play an Ally character with cost 3 or less for free."
        {
            pattern: /^whenever this character quests, you may play an? (.+?) character with cost (\d+) or less for free/i,
            handler: (match, card, text) => {
                const classification = match[1];
                const maxCost = parseInt(match[2]);
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [{
                        type: 'play_for_free',
                        target: { type: 'character', filter: { classification, maxCost } }
                    }],
                    optional: true,
                    rawText: text
                } as any;
            }
        },

        // Basil: "Whenever this character quests, chosen opponent discards a card at random."
        {
            pattern: /^whenever this character quests, chosen opponent discards a card at random/i,
            handler: (match, card, text) => {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [{
                        type: 'discard',
                        amount: 1,
                        target: { type: 'chosen_opponent' },
                        random: true
                    }],
                    rawText: text
                } as any;
            }
        },

        // Fred: "Whenever this character quests, reveal cards from the top of your deck until you reveal a Floodborn character card. Put that card into your hand and shuffle the rest into your deck."
        {
            pattern: /^whenever this character quests, reveal cards from the top of your deck until you reveal a (.+?) character card\. put that card into your hand and shuffle the rest into your deck/i,
            handler: (match, card, text) => {
                const classification = match[1];
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [{
                        type: 'reveal_until',
                        filter: { type: 'character', classification },
                        destination: 'hand',
                        restDestination: 'deck_shuffle'
                    }],
                    rawText: text
                } as any;
            }
        },

        // Alice: "Whenever this character quests, put 1 damage counter on each other character."
        {
            pattern: /^whenever this character quests, put (\d+) damage counter on each other character/i,
            handler: (match, card, text) => {
                const amount = parseInt(match[1]);
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [{
                        type: 'add_damage_counter',
                        amount,
                        target: { type: 'all_characters', exclude: 'self' }
                    }],
                    rawText: text
                } as any;
            }
        },

        // Conditional effects: "Whenever this character quests, if X, Y"
        {
            pattern: /whenever this character quests, if (.+?), (.+)/i,
            handler: (match, card, text) => {
                const conditionText = match[1];
                const effectText = match[2];
                const fullConditionalText = `if ${conditionText}, ${effectText}`;
                const effects = parseConditionalEffect(fullConditionalText);

                if (effects && effects.length > 0) {
                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CARD_QUESTED,
                        effects,
                        rawText: text
                    } as any;
                }
                return null;
            }
        },

        // Yokai: Quest and draw for each opposing character with 0 strength
        // "Whenever this character quests, draw a card for each opposing character with 0 ¤."
        {
            pattern: /^whenever this character quests, draw a card for each opposing character with 0 (?:strength|¤)/i,
            handler: (match, card, text) => {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [{
                        type: 'draw_for_each',
                        filter: { opposing: true, strength: 0 }
                    }],
                    rawText: text
                } as any;
            }
        },

        // Whenever this character quests, chosen Pirate gets stats and ability (Mickey Mouse - Pirate Captain)
        // "Whenever this character quests, chosen Pirate character gets +2 ¤ and gains “This character takes no damage from challenges” this turn."
        {
            pattern: /whenever this character quests, chosen (.+?) character gets ([+-]\d+) ([◊¤⛉]) and gains [“"](.+?)[”"] this turn/i,
            handler: (match, card, text) => {
                const targetSubtype = match[1];
                const amount = parseInt(match[2]);
                const statSymbol = match[3];
                const gainedText = match[4];

                const stat = (statSymbol === '◊' || statSymbol === '⛉') ? 'lore'
                    : (statSymbol === '¤' || statSymbol === 'strength') ? 'strength'
                        : 'willpower';

                // Re-parse the gained ability text if needed, or construct manually 
                // BUT "This character takes no damage from challenges" is now supported by static-effect-parser (invulnerable).
                const grantedEffects = parseStaticEffects(gainedText);

                if (grantedEffects.length > 0) {
                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CARD_QUESTED,
                        effects: [
                            {
                                type: 'modify_stats',
                                stat,
                                amount,
                                target: { type: 'chosen_character', subtype: targetSubtype },
                                duration: 'turn'
                            },
                            {
                                type: 'grant_ability',
                                ability: { type: 'static', effects: grantedEffects },
                                target: { type: 'chosen_character', subtype: targetSubtype },
                                duration: 'turn'
                            }
                        ],
                        rawText: text
                    } as any;
                }
                return null;
            }
        },
        // Max Goof - Chart Topper: Quest and play song (with bottom replacement)
        // "Whenever this character quests, you may play a song card with cost 4 or less from your discard for free, then put it on the bottom of your deck instead of into your discard."
        {
            pattern: /whenever this character quests, you may play a song card with cost (\d+) or less from your discard for free, then put it on the bottom of your deck instead of into your discard/i,
            handler: (match, card, text) => {
                const maxCost = parseInt(match[1]);
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [{
                        type: 'play_from_discard',
                        filter: { cardType: 'action', subtype: 'song', maxCost },
                        free: true,
                        destination: 'bottom'
                    }],
                    rawText: text
                } as any;
            }
        },

        // BATCH 49: Sisu - Emboldened Warrior
        // "Whenever this character quests, reveal the top card of your deck..."
        {
            pattern: /whenever this character quests, reveal the top card of your deck\. if it's a dragon character card, put it into your hand and repeat this effect\. otherwise, put it on either the top or the bottom of your deck/i,
            handler: (match, card, text) => {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [{
                        type: 'reveal_top_deck',
                        amount: 1,
                        on_reveal: {
                            condition: { type: 'character', subtype: 'dragon' },
                            match_effect: [
                                { type: 'move_to_hand' },
                                { type: 'repeat_ability' }
                            ],
                            no_match_effect: [
                                { type: 'move_to_top_or_bottom' }
                            ]
                        }
                    }],
                    rawText: text
                } as any;
            }
        },

        // PHASE 2A: Ready all cards in inkwell (Mufasa - Ruler of Pride Rock)
        // "Whenever this character quests, ready all cards in your inkwell."
        {
            pattern: /whenever this character quests, ready all cards in your inkwell/i,
            handler: (match, card, text) => {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [{
                        type: 'ready_inkwell',
                        target: { type: 'all_inkwell_cards', mine: true }
                    }],
                    rawText: text
                } as any;
            }
        },

        // PHASE 2A: Exert all cards in inkwell
        // "Whenever this character quests, exert all cards in your inkwell."
        {
            pattern: /whenever this character quests, exert all cards in your inkwell/i,
            handler: (match, card, text) => {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [{
                        type: 'exert_inkwell',
                        target: { type: 'all_inkwell_cards', mine: true }
                    }],
                    rawText: text
                } as any;
            }
        },

        // The Queen - Mirror Seeker
        // "Whenever this character quests, you may look at the top 3 cards of your deck and put them back in any order."
        {
            pattern: /whenever this character quests, you may look at the top (\d+) cards of your deck and put them back in any order/i,
            handler: (match, card, text) => {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [{
                        type: 'scry',
                        amount: parseInt(match[1]),
                        target: { type: 'self' },
                        optional: true
                    }],
                    rawText: text
                } as any;
            }
        },

        // Magica De Spell - The Midas Touch
        // "Whenever this character quests, gain lore equal to the cost of one of your items in play."
        {
            pattern: /whenever this character quests, gain lore equal to the cost of one of your items in play/i,
            handler: (match, card, text) => {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [{
                        type: 'gain_lore',
                        amount: 'variable',
                        source: {
                            type: 'chosen_item',
                            stat: 'cost',
                            filter: { mine: true, zone: 'play' }
                        }
                    }],
                    rawText: text
                } as any;
            }
        },

        // Abu - Illusory Pachyderm: "Whenever this character quests, gain lore equal to the ◊ of chosen opposing character."
        {
            pattern: /whenever this character quests, gain lore equal to the ([◊¤]) of chosen opposing character/i,
            handler: (match, card, text) => {
                const statSymbol = match[1];
                const stat = statSymbol === '◊' ? 'lore' : 'strength';

                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [{
                        type: 'gain_lore',
                        amount: 'variable',
                        source: {
                            type: 'chosen_opposing_character',
                            stat
                        }
                    }],
                    rawText: text
                } as any;
            }
        },

        // BATCH 49: Restriction on other characters (Isabela)
        // "Whenever this character quests, your other characters can't quest..."
        {
            pattern: /whenever this character quests, your other characters can't quest/i,
            handler: (match, card, text) => {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [{
                        type: 'restriction',
                        restriction: 'cant_quest',
                        target: { type: 'all_characters', filter: { mine: true, other: true } },
                        duration: 'turn'
                    }],
                    rawText: text
                } as any;
            }
        },

        // When you play - Move damage (Mama Odie)  
        // "When/Whenever this character quests, you may move up to N damage..."
        {
            pattern: /(?:When|Whenever) this character quests, (?:you may )?move up to (\d+) damage/i,
            handler: (match, card, text) => {
                const moveMatch = text.match(/move up to (\d+) damage counters? from (.+?) to (.+)/i);
                if (moveMatch) {
                    const amount = parseInt(moveMatch[1]);
                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CARD_QUESTED,
                        effects: [{
                            type: 'move_damage',
                            amount,
                            from: { type: 'chosen_character' },
                            to: { type: 'chosen_opposing_character' }
                        }],
                        rawText: text
                    } as any;
                }
                return null;
            }
        },

        // 10. Opponent Reveal & Discard (Ursula - Deceiver / Eric's Bride)
        // "Whenever this character quests, chosen opponent reveals their hand and discards a non-character card."
        {
            pattern: /Whenever this character quests, chosen opponent reveals their hand and discards a (.+) card/i,
            handler: (match, card, text) => {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [{
                        type: 'opponent_reveal_and_discard',
                        target: { type: 'chosen_opponent' },
                        filter: match[1].toLowerCase() === 'non-character'
                            ? { excludeCardType: 'character' }
                            : { cardType: match[1].toLowerCase() },
                        chooser: 'you'
                    }],
                    rawText: text
                } as any;
            }
        },

        // Madame Medusa - Diamond Lover: quest with damage cost to mill
        {
            pattern: /^whenever this character quests, you may deal (\d+) damage to another chosen character of yours to put the top (\d+) cards of chosen player's deck into their discard/i,
            handler: (match, card, text) => {
                const damageAmount = parseInt(match[1]);
                const cardCount = parseInt(match[2]);

                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    triggerFilter: { self: true },
                    effects: [{
                        type: 'damage_to_mill',
                        cost: {
                            type: 'damage',
                            amount: damageAmount,
                            target: { type: 'chosen_character', filter: { mine: true, other: true } }
                        },
                        effect: {
                            type: 'mill',
                            amount: cardCount,
                            target: { type: 'chosen_player' }
                        },
                        optional: true
                    }],
                    rawText: text
                } as any;
            }
        },

        // Genie - Supportive Friend
        {
            pattern: /whenever this character quests, you may shuffle this card into your deck to draw (\d+) cards/i,
            handler: (match, card, text) => {
                const amount = parseInt(match[1]);
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [
                        { type: 'shuffle_self_into_deck' },
                        { type: 'draw', amount, target: { type: 'self' } }
                    ],
                    optional: true,
                    rawText: text
                } as any;
            }
        },


        // The Queen - Commanding Presence: "Whenever this character quests, chosen opposing character gets -4 ¤ and chosen character gets +4 ¤."
        {
            pattern: /whenever this character quests, (?:give )?chosen (opposing )?character (?:gets|gains) ([+-]\d+) (strength|willpower|lore|¤|◊|⛉)(?: this turn)? (?:and|to) (?:give )?chosen (opposing )?character (?:gets|gains) ([+-]\d+) (strength|willpower|lore|¤|◊|⛉)(?: this turn)?/i,
            handler: (match, card, text) => {
                const isOpposing1 = !!match[1];
                const amount1 = parseInt(match[2]);
                const statRaw1 = match[3].toLowerCase();
                const isOpposing2 = !!match[4];
                const amount2 = parseInt(match[5]);
                const statRaw2 = match[6].toLowerCase();

                const statMap: Record<string, string> = {
                    'strength': 'strength', '¤': 'strength',
                    'willpower': 'willpower', '◊': 'willpower',
                    'lore': 'lore', '⛉': 'lore'
                };

                const stat1 = statMap[statRaw1] || statRaw1;
                const stat2 = statMap[statRaw2] || statRaw2;

                const duration = text.match(/until the start of your next turn/i) ? 'until_start_of_next_turn' : 'turn';

                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [
                        {
                            type: 'modify_stats',
                            target: { type: isOpposing1 ? 'chosen_opposing_character' : 'chosen_character' },
                            stat: stat1,
                            amount: amount1,
                            duration
                        },
                        {
                            type: 'modify_stats',
                            target: { type: isOpposing2 ? 'chosen_opposing_character' : 'chosen_character' },
                            stat: stat2,
                            amount: amount2,
                            duration
                        }
                    ],
                    rawText: text
                } as any;
            }
        },

        // Generic "Whenever this character quests, [effect]"
        // Example: Yzma - Alchemist
        {
            pattern: /^(?:whenever|when) (?:this character|he|she) quests, (.+)/i,
            handler: (match, card, text) => {
                const effectText = match[1];

                // Check for conditional effects first
                const conditionalEffects = parseConditionalEffect(effectText);
                if (conditionalEffects.length > 0) {
                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CARD_QUESTED,
                        effects: conditionalEffects,
                        rawText: text
                    } as any;
                }

                // Parse standard effects
                const effects = parseStaticEffects(effectText);
                if (effects.length > 0) {
                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CARD_QUESTED,
                        effects,
                        rawText: text
                    } as any;
                }
                return null;
            }
        },

        // "Chosen opposing character can't ready at the start of their next turn." (Ursula)
        {
            pattern: /whenever this character quests, (?:chosen|exerted) (?:opposing )?character (?:doesn't|can't) ready at the start of their next turn/i,
            handler: (match, card, text) => {
                const isOpposing = text.includes('opposing');

                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    trigger: { type: 'on_quest' },
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

        // 18. Quest Trigger Ready Item (Audrey Ramirez)
        // "Whenever this character quests, ready one of your items."
        {
            pattern: /whenever this character quests, ready one of your items/i,
            handler: (match, card, text) => {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [{
                        type: 'ready',
                        target: {
                            type: 'chosen_item',
                            filter: { mine: true }
                        }
                    }],
                    rawText: text
                } as any;
            }
        },

        // 24. Quest Trigger Debuff (Cogsworth - Majordomo)
        // "Whenever this character quests, you may give chosen character -2 ¤ until the start of your next turn."
        {
            pattern: /whenever this character quests, you may give chosen character ([+-])(\d+) (strength|willpower|lore|¤|🛡️|⛉|◊|⬡) until the start of your next turn/i,
            handler: (match, card, text) => {
                let stat = 'strength';
                const symbol = match[3].toLowerCase();
                if (['willpower', '🛡️', '⛉'].includes(symbol)) stat = 'willpower';
                if (['lore', '◊', '⬡'].includes(symbol)) stat = 'lore';

                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [{
                        type: 'modify_stats',
                        stat,
                        amount: parseInt(match[2]) * (match[1] === '-' ? -1 : 1),
                        target: { type: 'chosen_character' },
                        duration: 'next_turn_start'
                    }],
                    rawText: text
                } as any;
            }
        },


        // Hen Wen - Prophetic Pig: Quest to Scry
        // "Whenever this character quests, look at the top card of your deck. Put it on either the top or the bottom of your deck."
        {
            pattern: /whenever this character quests, look at the top card of your deck\. put it on either the top or the bottom of your deck/i,
            handler: (match, card, text) => {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [{
                        type: 'scry',
                        amount: 1
                    }],
                    rawText: text
                } as any;
            }
        },

        // The Queen - Commanding Presence: "Whenever this character quests, chosen opposing character gets -4 ¤ and chosen character gets +4 ¤."
        {
            pattern: /whenever this character quests, chosen (opposing )?character (?:gets|gains) ([+-]\d+) (strength|willpower|lore|¤|◊|⛉)(?: this turn)? and chosen (opposing )?character (?:gets|gains) ([+-]\d+) (strength|willpower|lore|¤|◊|⛉)(?: this turn)?/i,
            handler: (match, card, text) => {
                const isOpposing1 = !!match[1];
                const amount1 = parseInt(match[2]);
                const statRaw1 = match[3].toLowerCase();
                const isOpposing2 = !!match[4];
                const amount2 = parseInt(match[5]);
                const statRaw2 = match[6].toLowerCase();

                const statMap: Record<string, string> = {
                    'strength': 'strength', '¤': 'strength',
                    'willpower': 'willpower', '◊': 'willpower',
                    'lore': 'lore', '⛉': 'lore'
                };

                const stat1 = statMap[statRaw1] || statRaw1;
                const stat2 = statMap[statRaw2] || statRaw2;

                const duration = text.match(/until the start of your next turn/i) ? 'until_start_of_next_turn' : 'turn';

                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [
                        {
                            type: 'modify_stats',
                            target: { type: isOpposing1 ? 'chosen_opposing_character' : 'chosen_character' },
                            stat: stat1,
                            amount: amount1,
                            duration
                        },
                        {
                            type: 'modify_stats',
                            target: { type: isOpposing2 ? 'chosen_opposing_character' : 'chosen_character' },
                            stat: stat2,
                            amount: amount2,
                            duration
                        }
                    ],
                    rawText: text
                } as any;
            }
        },

        // "Whenever this character quests, chosen character gains +2 strength this turn."
        {
            pattern: /whenever this character quests, chosen (?:opposing )?character (?:gets|gains) ([+-]\d+) (strength|willpower|lore|¤|◊|⛉) (?:this turn|until the start of your next turn)/i,
            handler: (match, card, text) => {
                const modifier = parseInt(match[1]);
                const statRaw = match[2].toLowerCase();

                const statMap: Record<string, string> = {
                    'strength': 'strength', '¤': 'strength',
                    'willpower': 'willpower', '◊': 'willpower',
                    'lore': 'lore', '⛉': 'lore'
                };

                const stat = statMap[statRaw] || statRaw;
                const duration = text.includes('until the start of your next turn')
                    ? 'until_start_of_next_turn' : 'this_turn';

                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [{
                        type: 'modify_stats',
                        target: {
                            type: 'chosen_character',
                            opposing: text.toLowerCase().includes('opposing')
                        },
                        stat, amount: modifier, duration
                    }],
                    rawText: text
                } as any;
            }
        },

        // BATCH 47: Opponent reveal with conditional (Daisy Duck)
        // "whenever this character quests, each opponent reveals the top card of their deck. if it's a character card, they may put it into their hand. otherwise, they put it on the bottom of their deck"
        {
            pattern: /whenever this character quests, each opponent reveals the top card of their deck\. if it's a character card, they may put it into their hand\. otherwise, they put it on the bottom of their deck/i,
            handler: (match, card, text) => {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    triggerFilter: { self: true }, // Only trigger when THIS character quests
                    effects: [{
                        type: 'opponent_reveal_top',
                        target: { type: 'all_opponents' },
                        conditional_put: {
                            if_type: 'character',
                            then: 'hand',
                            else: 'bottom_of_deck'
                        }
                    }],
                    rawText: text
                } as any;
            }
        },

        // BATCH 47: Quest lore gain + return (Camilo Madrigal)
        // "whenever this character quests, you may gain lore equal to the ◊ of chosen other character of yours. return that character to your hand"
        {
            pattern: /whenever this character quests, you may gain lore equal to the (◊|lore|¤|strength|⛉|willpower) of chosen other character of yours\. return that character to your hand/i,
            handler: (match, card, text) => {
                let stat = 'lore';
                const symbol = match[1].toLowerCase();
                if (['¤', 'strength'].includes(symbol)) stat = 'strength';
                if (['⛉', 'willpower'].includes(symbol)) stat = 'willpower';

                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [{
                        type: 'gain_lore',
                        amount: { type: 'stat_of_target', stat },
                        target: { type: 'chosen_character', filter: { mine: true, other: true } }
                    }, {
                        type: 'return_to_hand',
                        target: { type: 'same_target' }
                    }],
                    rawText: text
                } as any;
            }
        },

        // 29. Dynamic Buff Based on Self Stat (Olaf - Carrot Enthusiast)
        // "Whenever he quests, each of your other characters gets +¤ equal to this character's ¤ this turn."
        {
            pattern: /whenever he quests, each of your other characters gets \+([^\s]+) equal to this character's ([^\s]+) this turn/i,
            handler: (match, card, text) => {
                let stat = 'strength';
                const symbol = match[1].toLowerCase();
                if (['willpower', '🛡️', '⛉'].includes(symbol)) stat = 'willpower';
                if (['lore', '◊', '⬡'].includes(symbol)) stat = 'lore';

                let attribute = 'strength';
                const sourceSymbol = match[2].toLowerCase();
                if (['willpower', '🛡️', '⛉'].includes(sourceSymbol)) attribute = 'willpower';
                if (['lore', '◊', '⬡'].includes(sourceSymbol)) attribute = 'lore';

                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [{
                        type: 'modify_stats',
                        stat,
                        amount: {
                            type: 'attribute_of_self',
                            attribute
                        },
                        target: {
                            type: 'all_characters',
                            filter: {
                                mine: true,
                                other: true
                            }
                        },
                        duration: 'turn'
                    }],
                    rawText: text
                } as any;
            }
        },

        // 33. Lady Tremaine - Sinister Socialite
        // "Whenever this character quests, if you've put a card under her this turn, you may pay an action with cost 5 or less from your discard for free, then put that action card on the bottom of your deck instead of into your discard."
        {
            pattern: /whenever this character quests, if you've put a card under her this turn/i,
            handler: (match, card, text) => {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    condition: { type: 'card_put_under_this_turn' },
                    effects: [{
                        type: 'play_action_from_discard_then_bottom_deck',
                        costLimit: 5,
                        free: true
                    }],
                    rawText: text
                } as any;
            }
        },

        // Generic "Whenever this character quests"
        {
            pattern: /^whenever (?:this character|he|she) quests, (.+)/i,
            handler: (match, card, text) => {
                const effectText = match[1];

                // Avoid matching specific patterns that have their own handlers
                if (effectText.match(/reveal the top card of your deck/i)) return null;
                if (effectText.match(/your other characters can't quest/i)) return null;

                const effects = parseStaticEffects(effectText);
                if (effects.length > 0) {
                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CARD_QUESTED,
                        effects,
                        rawText: text
                    } as any;
                }
                return null;
            }
        },

        // Flash - Records Specialist: Give subtype character stats
        // "Whenever this character quests, you may give chosen Detective character +2 ¤ this turn."
        {
            pattern: /whenever this character quests, you may give chosen (.+) character ([+-]\d+) ([◊¤🛡️⛉]) this turn/i,
            handler: (match, card, text) => {
                const subtype = match[1];
                const amount = parseInt(match[2]);
                const statSymbol = match[3];
                const stat = (statSymbol === '◊' || statSymbol === '¤') ? 'lore' : 'strength';

                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [{
                        type: 'modify_stats',
                        stat,
                        amount,
                        target: {
                            type: 'chosen_character',
                            filter: { subtypes: [subtype] }
                        },
                        duration: 'turn',
                        optional: true
                    }],
                    rawText: text
                } as any;
            }
        },

        // Item: Whenever a character quests -> Look at top 2 (Hen Wen's Visions)
        // "Whenever a character quests, you may look at the top 2 cards of your deck. Put one into your hand and the other on the bottom of your deck."
        {
            pattern: /^whenever a character quests, you may look at the top 2 cards.*?put one into your (?:hand|deck)/i,
            handler: (match, card, text) => {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [{
                        type: 'look_and_draw', // or look_and_put_hand_bottom
                        amount: 2,
                        keep: 1,
                        destination: 'hand',
                        restDestination: 'bottom',
                        optional: true
                    }],
                    rawText: text
                } as any;
            }
        },

        // Location: Whenever a character quests while here -> Ready Item (Castle of the Horned King)
        // "Once during your turn, whenever a character quests while here, you may ready chosen item."
        {
            pattern: /^whenever a character quests while here, you may ready chosen item/i,
            handler: (match, card, text) => {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [{
                        type: 'ready',
                        target: { type: 'chosen_item' },
                        optional: true
                    }],
                    rawText: text
                } as any;
            }
        },

        // Location: Whenever a character quests while here (The Bayou)
        // "Whenever a character quests while here, you pay 2 ⬡ less for the next character you play this turn."
        {
            pattern: /^whenever a character quests while here, you pay (\d+) ⬡ less for the next character you play this turn/i,
            handler: (match, card, text) => {
                const amount = parseInt(match[1]);
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    triggerFilter: {
                        condition: { type: 'at_location', locationId: 'this_card' }
                    },
                    effects: [{
                        type: 'cost_reduction',
                        amount,
                        target: { type: 'character' }, // Reduced cost for character
                        usage: 'next',
                        duration: 'turn'
                    }],
                    rawText: text
                } as any;
            }
        },

        // Global Quest Trigger (Steal from the Rich)
        // "Whenever one of your characters quests this turn, each opponent loses 1 lore."
        {
            pattern: /whenever one of your characters quests(?: this turn)?, (.+)/i,
            handler: (match, card, text) => {
                const effectText = match[1];
                const effects = parseStaticEffects(effectText);

                if (effects.length > 0) {
                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CARD_QUESTED,
                        condition: { mine: true }, // Triggered by any of my characters
                        effects,
                        rawText: text
                    } as any;
                }
                return null;
            }
        },

        // Look at top X, reveal Y, put in hand (Robin Hood, Lucky, Jasmine)
        // "Whenever this character quests, look at the top 4 cards of your deck. You may reveal an action card and put it into your hand. Put the rest on the bottom of your deck in any order."
        // Also handles: "put them in your hand" (Lucky)
        {
            pattern: /whenever this character quests, look at the top (\d+) cards of your deck\. you may reveal (an?|any number of) (.+?) cards? and put (?:it|them) (?:in|into) your hand\. put the rest on the bottom of your deck/i,
            handler: (match, card, text) => {
                const amount = parseInt(match[1]);
                const quantityType = match[2].toLowerCase(); // "an", "a", "any number of"
                const cardTypeStr = match[3].toLowerCase(); // "action", "character", "ally character", "puppy"

                let filter: any = {};
                if (cardTypeStr.includes('action')) filter.type = 'action';
                else if (cardTypeStr.includes('character')) filter.type = 'character';
                else if (cardTypeStr.includes('item')) filter.type = 'item';

                // Subtypes
                if (cardTypeStr.includes('ally')) filter.subtype = 'ally';
                if (cardTypeStr.includes('puppy')) filter.subtype = 'puppy';

                const revealAmount = quantityType.includes('any number') ? 'any' : 1;

                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [{
                        type: 'look_at_top_deck',
                        amount,
                        reveal_and_draw: {
                            filter,
                            amount: revealAmount,
                            optional: true
                        },
                        rest_to_bottom: true
                    }],
                    rawText: text
                } as any;
            }
        },

        // Mulan - Reflecting
        // "Whenever this character quests, you may reveal the top card of your deck. If it's a song card, you may play it for free. Otherwise, put it on the top of your deck."
        {
            pattern: /whenever this character quests, you may reveal the top card of your deck\. if it's a (.+?) card, you may play it for free\. otherwise, put it on the (top|bottom) of your deck/i,
            handler: (match, card, text) => {
                const cardType = match[1].toLowerCase();
                const fallbackLocation = match[2].toLowerCase() === 'top' ? 'top_of_deck' : 'bottom_of_deck';

                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [{
                        type: 'reveal_top_deck',
                        amount: 1,
                        on_reveal: {
                            condition: { type: 'card_type', cardType },
                            match_effect: [
                                { type: 'play_free', optional: true }
                            ],
                            no_match_effect: [
                                { type: fallbackLocation === 'top_of_deck' ? 'move_to_top_deck' : 'move_to_bottom_deck' }
                            ]
                        }
                    }],
                    rawText: text
                } as any;
            }
        },

        // Sisu - Divine Water Dragon
        // "Whenever this character quests, look at the top 2 cards of your deck. You may put one into your hand. Put the rest on the bottom of your deck in any order."
        {
            pattern: /whenever this character quests, look at the top (\d+) cards of your deck\. you may put one into your hand\. put the rest on the bottom of your deck/i,
            handler: (match, card, text) => {
                const amount = parseInt(match[1]);

                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [{
                        type: 'look_at_top_deck',
                        amount,
                        choose_to_hand: {
                            amount: 1,
                            optional: true
                        },
                        rest_to_bottom: true
                    }],
                    rawText: text
                } as any;
            }
        },

        // Robin Hood - Sharpshooter
        // "Whenever this character quests, look at the top 4 cards of your deck. You may reveal an action card with cost 6 or less and play it for free. Put the rest in your discard."
        {
            pattern: /whenever this character quests, look at the top (\d+) cards of your deck\. you may reveal (an? .+?) card with cost (\d+) or less and play it for free\. put the rest in your discard/i,
            handler: (match, card, text) => {
                const amount = parseInt(match[1]);
                const cardType = match[2].replace(/^an? /, '').toLowerCase();
                const costLimit = parseInt(match[3]);

                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [{
                        type: 'look_at_top_deck',
                        amount,
                        reveal_and_play: {
                            filter: { type: cardType, cost: { lte: costLimit } },
                            optional: true,
                            free: true
                        },
                        rest_to_discard: true
                    }],
                    rawText: text
                } as any;
            }
        },

        // Roquefort - Lock Expert
        // "Whenever this character quests, you may put chosen item into its player's inkwell facedown and exerted."
        {
            pattern: /whenever this character quests, you may put chosen item into its player's inkwell facedown and exerted/i,
            handler: (match, card, text) => {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [{
                        type: 'put_into_inkwell',
                        target: {
                            type: 'chosen_card',
                            filter: { type: 'item' }
                        },
                        optional: true
                    }],
                    rawText: text
                } as any;
            }
        },

        // Pattern: Iago - Crown Seeker (Campaign)
        // "Whenever this character quests, Jafar steals The Reforged Crown."
        {
            pattern: /whenever this character quests, jafar steals (.+?)(?:$|\.)/i,
            handler: (match, card, text) => {
                const itemName = match[1];
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [{
                        type: 'gain_control',
                        target: {
                            type: 'specific_card',
                            filter: { name: itemName }
                        }
                    }],
                    rawText: text
                } as any;
            }
        },

        // Pay to resolve (The Queen - Commanding Presence)
        // "When this character quests, you may pay 2 ⬡ to give chosen character -4 Strength this turn."
        {
            pattern: /^wh(?:en|enever) this character quests, you may pay (\d+) (?:⬡|ink) to (.+)/i,
            handler: (match, card, text) => {
                const amount = parseInt(match[1]);
                const effectText = match[2];
                const effects = parseStaticEffects(effectText);

                if (effects.length > 0) {
                    // Wrap in pay_to_resolve
                    // Since "you may pay" implies optionality at the payment step
                    const wrappedEffect = {
                        type: 'pay_to_resolve',
                        cost: amount,
                        optional: true,
                        effect: effects.length === 1 ? effects[0] : { type: 'sequence', effects }
                    };

                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CARD_QUESTED,
                        effects: [wrappedEffect],
                        rawText: text
                    } as any;
                }
                return null;
            }
        },

        // Generic "Whenever this character quests, [effect]"
        {
            pattern: /^whenever this character quests, (.+)/i,
            handler: (match, card, text) => {
                const effectText = match[1].trim();
                const effects = parseStaticEffects(effectText);

                if (effects.length > 0) {
                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CARD_QUESTED,
                        effects,
                        rawText: text
                    } as any;
                }
                return null;
            }
        },
        // Yokai - Enigmatic Inventor
        // "Whenever this character quests, you may return one of your items to your hand to pay 2 ⬡ less for the next item you play this turn."
        {
            pattern: /whenever this character quests, you may return one of your items to your hand to pay (\d+) (?:⬡|ink) less for the next item you play this turn/i,
            handler: (match, card, text) => {
                const amount = parseInt(match[1]);
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [{
                        type: 'return_to_hand_to_reduce_cost',
                        target: {
                            type: 'chosen_item',
                            filter: { mine: true }
                        },
                        reduction: {
                            amount,
                            targetType: 'item',
                            duration: 'next_play'
                        },
                        optional: true
                    }],
                    rawText: text
                } as any;
            }
        },
        // Goldie O'Gilt - Cunning Prospector: Quest to move card and gain lore
        // "Whenever this character quests, you may put a location card from chosen player's discard on the bottom of their deck to gain 1 lore."
        {
            pattern: /whenever this character quests, you may put a (\w+) card from chosen player's discard on the bottom of their deck to gain (\d+) lore/i,
            handler: (match, card, text) => {
                const cardType = match[1].toLowerCase();
                const loreAmount = parseInt(match[2]);
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED,
                    effects: [{
                        type: 'cost_to_effect',
                        cost: {
                            type: 'move_card_from_discard',
                            target: {
                                type: 'chosen_card_in_discard',
                                filter: { cardType, owner: 'chosen_player' }
                            },
                            destination: 'bottom_of_deck'
                        },
                        effect: {
                            type: 'gain_lore',
                            amount: loreAmount
                        },
                        optional: true
                    }],
                    rawText: text
                } as any;
            }
        }
    ];
}
