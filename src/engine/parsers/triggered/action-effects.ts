import { TriggerPattern } from './types';
import { generateAbilityId, GameEvent } from '../parser-utils';

export const ACTION_EFFECT_PATTERNS: TriggerPattern[] = [
    // Lightning Storm: "Each opposing player loses 3 lore."
    {
        pattern: /^each opposing player loses (\d+) lore/i,
        handler: (match, card, text) => {
            const amount = parseInt(match[1]);
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'lose_lore',
                    amount,
                    target: { type: 'each_opponent' }
                }],
                rawText: text
            } as any;
        }
    },

    // Safe and Sound: \"Chosen character of yours can't be challenged until the start of your next turn.\"\
    {
        pattern: /^chosen character of yours can't be challenged until the start of your next turn/i,
        handler: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'cant_be_challenged',
                    target: { type: 'chosen_character', filter: { mine: true } },
                    duration: 'until_next_turn_start'
                }],
                rawText: text
            } as any;
        }
    },

    // Water Has Memory: "Look at the top 4 cards of chosen player's deck. Put one on the top of their deck and the rest on the bottom of their deck in any order."
    {
        pattern: /^look at the top (\d+) cards of chosen player[''']s deck\. put one on the top of their deck and the rest on the bottom of their deck in any order/i,
        handler: (match, card, text) => {
            const amount = parseInt(match[1]);
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'look_at_top_and_arrange',
                    amount,
                    target: { type: 'chosen_player' },
                    keepOnTop: 1,
                    restToBottom: true
                }],
                rawText: text
            } as any;
        }
    },

    // Strength of a Raging Fire: "Deal damage to chosen character equal to the number of characters you have in play."
    {
        pattern: /^deal damage to chosen character equal to the number of characters you have in play/i,
        handler: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'damage_equal_to_count',
                    target: { type: 'chosen_character' },
                    count: { count: 'your_characters' }
                }],
                rawText: text
            } as any;
        }
    },

    // Double Trouble: "Deal 1 damage each to up to 2 chosen characters."
    {
        pattern: /^deal (\d+) damage each to up to (\d+) chosen characters/i,
        handler: (match, card, text) => {
            const damagePerTarget = parseInt(match[1]);
            const maxTargets = parseInt(match[2]);
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'deal_damage_multi',
                    amount: damagePerTarget,
                    targets: { type: 'chosen_characters', max: maxTargets }
                }],
                rawText: text
            } as any;
        }
    },

    // Most Everyone's Mad Here: "Gain lore equal to the damage on chosen character, then banish them."
    {
        pattern: /^gain lore equal to the damage on chosen character, then banish them/i,
        handler: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [
                    {
                        type: 'gain_lore',
                        amount: {
                            type: 'attribute_of_target',
                            attribute: 'damage',
                            target: { type: 'chosen_character' }
                        }
                    },
                    {
                        type: 'banish',
                        target: { type: 'chosen_character' }
                    }
                ],
                rawText: text
            } as any;
        }
    },

    // Lash Out: Conditional Damage
    // "Deal 2 damage to chosen character. If they have damage, deal 4 damage instead."
    {
        pattern: /^deal (\d+) damage to chosen (?:opposing )?character\. if they have damage, deal (\d+) damage instead/i,
        handler: (match, card, text) => {
            const baseAmount = parseInt(match[1]);
            const boostAmount = parseInt(match[2]);

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'deal_damage',
                    amount: baseAmount,
                    target: {
                        type: 'chosen_character',
                        conditions: [{ type: 'damaged', amount: boostAmount }]
                    },
                    // We model this as a single effect with 'conditions' handling the 'instead' logic
                    // OR we can model it as conditional effect logic if the engine supports it.
                    // For now, assuming the executor handles 'conditions' in target or separate field.
                    // REVISION: Better to use the conditional structure found in on-play.ts if available,
                    // but on-play supports 'if X then Y'.
                    // This is 'Effect A. If Condition, Effect B instead.'
                    // Let's use a custom effect type or metadata if needed.
                    // For now, mapping to a generic deal_damage with 'conditionalMultiplier' or similar?
                    // Actually, let's look at how other 'instead' effects are handled.
                    // If not found, we'll assume a standard deal_damage with condition: damaged -> override amount.
                    condition: {
                        type: 'target_is_damaged',
                        replacementAmount: boostAmount
                    }
                }],
                rawText: text
            } as any;
        }
    },

    // Splash (or similar): Simple Deal Damage
    // "Deal 3 damage to chosen character."
    {
        pattern: /^deal (\d+) damage to chosen (?:opposing )?character$/i,
        handler: (match, card, text) => {
            const amount = parseInt(match[1]);
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'deal_damage',
                    amount,
                    target: { type: 'chosen_character' }
                }],
                rawText: text
            } as any;
        }
    },

    // Triton's Decree: Opponent choice damage
    // "Each opponent chooses one of their characters and deals 2 damage to them."
    {
        pattern: /^each opponent chooses one of their characters and deals (\d+) damage to them/i,
        handler: (match, card, text) => {
            const amount = parseInt(match[1]);
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'opponent_choice_damage',
                    amount,
                    target: { type: 'opponent_character' }
                }],
                rawText: text
            } as any;
        }
    },

    // Falling Down the Rabbit Hole: Each player puts character into inkwell
    // "Each player chooses one of their characters and puts them into their inkwell facedown and exerted."
    {
        pattern: /^each player chooses one of their characters and puts them into their inkwell facedown and exerted/i,
        handler: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'each_player_puts_into_inkwell',
                    target: { type: 'chosen_own_character', count: 1 },
                    facedown: true,
                    exerted: true
                }],
                rawText: text
            } as any;
        }
    },

    // The Bare Necessities: "Chosen opponent reveals their hand and discards a non-character card of your choice."
    {
        pattern: /^chosen opponent reveals their hand and discards a (.*) card of your choice/i,
        handler: (match, card, text) => {
            const filterText = match[1].toLowerCase();
            let filter: any = {};

            if (filterText.includes('non-character')) {
                filter = { type: 'not', filter: { type: 'character' } };
            } else if (filterText.includes('character')) {
                filter = { type: 'character' };
            } else if (filterText.includes('action')) {
                filter = { type: 'action' };
            } else if (filterText.includes('item')) {
                filter = { type: 'item' };
            }

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered', // Action effects are often treated as triggered on play
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'opponent_play_reveal_and_discard',
                    target: { type: 'chosen_opponent' },
                    filter: filter
                }],
                rawText: text
            } as any;
        }
    }
];
