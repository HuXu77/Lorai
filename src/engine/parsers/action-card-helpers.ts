import { AbilityDefinition, Card, generateAbilityId } from './parser-utils';
import { log } from '../ability-parser';

// BATCH 44: Helper functions for simple action cards

export function parseSimpleBanishAction(text: string, card: Card, abilities: AbilityDefinition[]): boolean {
    const effects: any[] = [];
    let target: any = { type: 'chosen' };

    // Determine card type
    if (text.includes('character')) target.cardType = 'character';
    else if (text.includes('item')) target.cardType = 'item';
    else if (text.includes('location')) target.cardType = 'location';

    // Handle "location or item"
    if (text.match(/location or item/i)) {
        target.cardType = ['location', 'item'];
    }

    // Parse filters
    const costMatch = text.match(/with (\d+) [¤⬡◊] or less/i);
    if (costMatch) {
        target.costMax = parseInt(costMatch[1]);
    }

    const challengedMatch = text.match(/who was challenged this turn/i);
    if (challengedMatch) {
        target.wasChallenged = true;
    }

    effects.push({
        type: 'banish',
        target
    });

    // Handle additional effect: "its player gains 2 lore"
    if (text.match(/its player gains (\d+) lore/i)) {
        const loreMatch = text.match(/its player gains (\d+) lore/i);
        if (loreMatch) {
            effects.push({
                type: 'gain_lore',
                amount: parseInt(loreMatch[1]),
                target: { type: 'controller_of_banished' }
            });
        }
    }

    abilities.push({
        id: generateAbilityId(),
        cardId: card.id.toString(),
        type: 'activated',
        costs: [],
        effects,
        rawText: text
    } as any);

    return true;
}

export function parseRevealTopCardAction(text: string, card: Card, abilities: AbilityDefinition[]): boolean {
    // "Reveal the top card of your deck. Put it into your hand."
    if (text.match(/^reveal the top card of your deck\. put it into your hand/i)) {
        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            costs: [],
            effects: [{
                type: 'reveal_and_draw',
                amount: 1
            }],
            rawText: text
        } as any);
        return true;
    }
    return false;
}

export function parseOpponentDiscardAction(text: string, card: Card, abilities: AbilityDefinition[]): boolean {
    // "Each opposing player discards a card."
    if (text.match(/^each opposing player discards a card/i)) {
        const effects: any[] = [{
            type: 'discard',
            amount: 1,
            target: { type: 'all_opponents' }
        }];

        // Handle "Then, put this card into your inkwell facedown."
        if (text.match(/then, put this card into your inkwell/i)) {
            effects.push({
                type: 'put_into_inkwell',
                target: { type: 'self' }
            });
        }

        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            costs: [],
            effects,
            rawText: text
        } as any);
        return true;
    }
    return false;
}

export function parsePlayFromDiscardAction(text: string, card: Card, abilities: AbilityDefinition[]): boolean {
    log(`        [HELPER] parsePlayFromDiscardAction called for: "${text.substring(0, 80)}..."`);

    // "Play a character card with cost 5 or less from your discard for free."
    // "Play an item from your hand or discard with cost 5 or less for free, exerted."
    const match = text.match(/play (?:a|an) (character|item|action) (?:card )?(?:from your hand or discard|with cost \d+ or less from your (?:hand or )?discard) ?(with cost (\d+) or less)? for free/i);

    if (!match) {
        log(`        [HELPER] Pattern did NOT match`);
        return false;
    }

    log(`        [HELPER] Pattern MATCHED! Groups:`, match);

    const cardType = match[1].toLowerCase();
    let cost = match[3] ? parseInt(match[3]) : undefined;

    // Try to extract cost if not in first match group
    if (!cost) {
        const costMatch = text.match(/with cost (\d+) or less/i);
        if (costMatch) {
            cost = parseInt(costMatch[1]);
            log(`        [HELPER] Extracted cost from secondary match: ${cost}`);
        }
    }

    const sources = [];
    if (text.includes('hand')) sources.push('hand');
    if (text.includes('discard')) sources.push('discard');

    log(`        [HELPER] cardType: ${cardType}, cost: ${cost}, sources: ${sources.join(', ')}`);

    // Handle "exerted" modifier
    const exerted = text.includes('exerted');

    abilities.push({
        id: generateAbilityId(),
        cardId: card.id.toString(),
        type: 'activated',
        costs: [],
        effects: [{
            type: 'play_from_zone',
            free: true,
            exerted,
            sources: sources.length > 0 ? sources : ['discard'],
            target: {
                type: 'chosen_card',
                filter: {
                    cardType,
                    ...(cost && { cost, costComparison: 'less_or_equal' })
                }
            }
        }],
        rawText: text
    } as any);

    log(`        [HELPER] Successfully created ability!`);
    return true;
}

export function parseSimpleHealAction(text: string, card: Card, abilities: AbilityDefinition[]): boolean {
    // "Remove up to X damage from chosen character."
    // "Remove up to X damage from each of your characters."
    const amountMatch = text.match(/^remove up to (\d+) damage/i);
    if (amountMatch) {
        const amount = parseInt(amountMatch[1]);
        const target: any = { type: 'chosen' }; // Default to chosen

        if (text.match(/from each of your characters/i)) {
            target.type = 'all_characters';
            target.owner = 'self';
            target.mine = true;
        } else if (text.match(/from chosen character/i)) {
            target.type = 'chosen_character';
        } else if (text.match(/from chosen location/i)) {
            target.type = 'chosen_location';
        }

        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated', // Simple actions are treated as activated with 0 cost
            activationCost: [],
            effects: [{
                type: 'heal',
                amount,
                target
            }],
            rawText: text
        } as any);
        return true;
    }

    return false;
}

export function parseReadyAllAction(text: string, card: Card, abilities: AbilityDefinition[]): boolean {
    const effects: any[] = [];

    // Ready effect
    effects.push({
        type: 'ready',
        target: { type: 'all', cardType: 'character', mine: true }
    });

    // Damage effect
    const damageMatch = text.match(/deal (\d+) damage to each/i);
    if (damageMatch) {
        effects.push({
            type: 'damage',
            amount: parseInt(damageMatch[1]),
            target: { type: 'all', cardType: 'character', mine: true }
        });
    }

    // Can't quest restriction
    if (text.match(/can't quest/i)) {
        effects.push({
            type: 'prevent_quest',
            target: { type: 'all', cardType: 'character', mine: true },
            duration: 'turn'
        });
    }

    abilities.push({
        id: generateAbilityId(),
        cardId: card.id.toString(),
        type: 'activated',
        costs: [],
        effects,
        rawText: text
    } as any);

    return true;
}

export function parseCantReadyAction(text: string, card: Card, abilities: AbilityDefinition[]): boolean {
    const target: any = { type: 'chosen_character', filter: {} };

    // Check for "exerted" filter
    if (text.includes('exerted')) {
        target.filter.status = 'exerted';
    }

    abilities.push({
        id: generateAbilityId(),
        cardId: card.id.toString(),
        type: 'activated',
        costs: [],
        effects: [{
            type: 'restriction',
            restriction: 'cant_ready',
            target,
            duration: 'next_turn'
        }],
        rawText: text
    } as any);

    return true;
}

export function parseMassBanishAction(text: string, card: Card, abilities: AbilityDefinition[]): boolean {
    const target: any = { type: 'all_opposing_cards', filter: {} };

    // Determine card types
    const types: string[] = [];
    if (text.includes('characters')) types.push('character');
    if (text.includes('items')) types.push('item');
    if (text.includes('locations')) types.push('location');

    if (types.length === 1) {
        target.filter.cardType = types[0];
        if (types[0] === 'character') {
            target.type = 'all_opposing_characters';
            delete target.filter.cardType; // Redundant for this specific type
        }
    } else if (types.length > 1) {
        target.filter.cardType = types;
    }

    // Check for cost filter
    const costMatch = text.match(/with cost (\d+) or less/i);
    if (costMatch) {
        target.filter.cost = parseInt(costMatch[1]);
        target.filter.costComparison = 'less_or_equal';
    }

    abilities.push({
        id: generateAbilityId(),
        cardId: card.id.toString(),
        type: 'triggered',
        event: 'card_played',
        costs: [],
        effects: [{
            type: 'banish',
            target
        }],
        rawText: text
    } as any);

    return true;
}

// BATCH 45: Opponent Choice Effects
export function parseOpponentChoiceAction(text: string, card: Card, abilities: AbilityDefinition[]): boolean {
    const target: any = { type: 'opponent_chosen' };

    // Determine what they choose and who owns it
    if (text.match(/of theirs/i) || text.match(/one of their/i)) {
        target.mine = false; // opposing item/location/character
    } else if (text.match(/one of your/i)) {
        target.mine = true; // your item
    }

    // Determine card types
    if (text.match(/item or location/i)) {
        target.cardType = ['item', 'location'];
    } else if (text.match(/item/i)) {
        target.cardType = 'item';
    } else if (text.match(/character/i)) {
        target.cardType = 'character';
    }

    // Determine action
    let action = 'banish';
    let amount: number | undefined;

    if (text.match(/exerts/i)) {
        action = 'exert';
    } else if (text.match(/deals (\d+) damage/i)) {
        action = 'damage';
        const dmgMatch = text.match(/deals (\d+) damage/i);
        if (dmgMatch) amount = parseInt(dmgMatch[1]);
    } else if (text.match(/returns/i)) {
        action = 'return_to_hand';
    } else if (text.match(/discards/i)) {
        action = 'discard';
    }

    // Default target filter update if damage
    if (action === 'damage' && !target.type) {
        target.type = 'opponent_chosen_character';
    }

    // Determine if this is triggered (on play) or activated
    const hasOnPlay = text.match(/when you play this character/i);

    abilities.push({
        id: generateAbilityId(),
        cardId: card.id.toString(),
        type: hasOnPlay ? 'triggered' : 'activated',
        event: hasOnPlay ? 'card_played' : undefined,
        costs: [],
        effects: [{
            type: 'opponent_choice_action',
            action,
            amount,
            target,
            chooser: 'each_opponent'
        }],
        rawText: text
    } as any);

    return true;
}

export function parseHighestCostDamageAction(text: string, card: Card, abilities: AbilityDefinition[]): boolean {
    log(`        [HELPER] parseHighestCostDamageAction called with: "${text.substring(0, 80)}..."`);
    // "deal 2 damage to the highest cost character each opposing player has in play"
    const damageMatch = text.match(/deal (\d+) damage to the highest cost character (?:each opposing player|each\s+opposing player) has in play/i);
    if (!damageMatch) {
        log(`        [HELPER] Regex did NOT match`);
        return false;
    }

    log(`        [HELPER] Regex matched! Creating ability...`);

    abilities.push({
        id: generateAbilityId(),
        cardId: card.id.toString(),
        type: 'activated',
        costs: [],
        effects: [{
            type: 'damage',
            amount: parseInt(damageMatch[1]),
            target: { type: 'highest_cost', scope: 'each_opponent', cardType: 'character' }
        }],
        rawText: text
    } as any);

    log(`        [HELPER] Ability created and pushed!`);

    return true;
}

// BATCH 48: Conditional card draw (Remember Who You Are)
export function parseConditionalDrawAction(text: string, card: Card, abilities: AbilityDefinition[]): boolean {
    // "if chosen opponent has more cards in their hand than you, draw cards until you have the same number"
    if (!text.match(/if chosen opponent has more cards in their hand than you, draw cards until you have the same number/i)) {
        return false;
    }

    abilities.push({
        id: generateAbilityId(),
        cardId: card.id.toString(),
        type: 'activated',
        costs: [],
        effects: [{
            type: 'conditional_draw',
            condition: { type: 'opponent_has_more_cards' },
            amount: { type: 'match_opponent_hand' },
            target: { type: 'chosen_opponent' }
        }],
        rawText: text
    } as any);

    return true;
}

export function parseMoveDamageAction(text: string, card: Card, abilities: AbilityDefinition[]): boolean {
    // "Move 1 damage counter from chosen character to chosen opposing character."
    const moveMatch = text.match(/move (\d+) damage counter from chosen character to chosen opposing character/i);
    if (!moveMatch) return false;

    const amount = parseInt(moveMatch[1]);

    abilities.push({
        id: generateAbilityId(),
        cardId: card.id.toString(),
        type: 'activated',
        costs: [],
        effects: [{
            type: 'move_damage',
            amount,
            source: { type: 'chosen_character' },
            destination: { type: 'chosen_opposing_character' }
        }],
        rawText: text
    } as any);

    return true;
}

export function parsePutIntoInkwellAction(text: string, card: Card, abilities: AbilityDefinition[]): boolean {
    // "Put chosen item or location into its player's inkwell facedown and exerted."
    if (!text.match(/put chosen (?:opposing )?(item|location|character|card).*into.*inkwell/i)) return false;

    const target: any = { type: 'chosen_card', filter: {} };

    if (text.match(/item or location/i)) {
        target.filter.type = ['item', 'location'];
    } else if (text.includes('item')) {
        target.filter.type = 'item';
    } else if (text.includes('location')) {
        target.filter.type = 'location';
    } else if (text.includes('character')) {
        target.filter.type = 'character';
    }

    abilities.push({
        id: generateAbilityId(),
        cardId: card.id.toString(),
        type: 'activated',
        costs: [],
        effects: [{
            type: 'put_into_inkwell',
            target
        }],
        rawText: text
    } as any);

    return true;
}

export function parseRevealAndPutIntoHandAction(text: string, card: Card, abilities: AbilityDefinition[]): boolean {
    // "Reveal the top 2 cards of your deck. Put revealed character cards into your hand. Put the rest on the bottom of your deck in any order."
    const match = text.match(/^reveal the top (\d+) cards of your deck\. put revealed (.+?) cards into your hand/i);
    if (match) {
        const amount = parseInt(match[1]);
        const typeString = match[2].toLowerCase();
        let filter: any = {};

        if (typeString.includes('character')) filter.type = 'character';
        else if (typeString.includes('item')) filter.type = 'item';
        else if (typeString.includes('action')) filter.type = 'action';
        else if (typeString.includes('location')) filter.type = 'location';

        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            costs: [],
            effects: [{
                type: 'reveal_and_draw',
                amount,
                filter
            }],
            rawText: text
        } as any);
        return true;
    }
    return false;
}

export function parseConditionalInkAction(text: string, card: Card, abilities: AbilityDefinition[]): boolean {
    // "If you have 6 ⬡ or less, put the top 3 cards of your deck into your inkwell facedown."
    const match = text.match(/if you have (\d+) (?:[⬡]|ink) or less, (.+)/i);
    if (match) {
        const amount = parseInt(match[1]);
        const effectText = match[2];
        let effect: any = {};

        if (effectText.match(/put the top (\d+) cards of your deck into your inkwell/i)) {
            const cards = parseInt(effectText.match(/put the top (\d+) cards/i)![1]);
            effect = {
                type: 'put_into_inkwell',
                target: 'top_of_deck',
                amount: cards
            };
        }

        if (effect.type) {
            abilities.push({
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'static', // As expected by test for conditional actions
                condition: {
                    type: 'ink_count',
                    amount,
                    comparison: 'less_or_equal'
                },
                effects: [effect],
                rawText: text
            } as any);
            return true;
        }
    }
    return false;
}

export function parsePutDamageCounterAction(text: string, card: Card, abilities: AbilityDefinition[]): boolean {
    // "Put 1 damage counter on chosen character." (Mosquito Bite)
    const chosenMatch = text.match(/^put (\d+) damage counter(?:s)? on chosen (character|location)/i);
    if (chosenMatch) {
        const targetType = chosenMatch[2] === 'location' ? 'chosen_location' : 'chosen_character';
        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            costs: [],
            effects: [{
                type: 'damage',
                amount: parseInt(chosenMatch[1]),
                target: { type: targetType }
            }],
            rawText: text
        } as any);
        return true;
    }

    // "Put 1 damage counter on each opposing character."
    const match = text.match(/^put (\d+) damage counter on each opposing character/i);
    if (match) {
        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            costs: [],
            effects: [{
                type: 'damage',
                amount: parseInt(match[1]),
                target: { type: 'all_opponents', cardType: 'character' }
            }],
            rawText: text
        } as any);
        return true;
    }
    return false;
}

export function parseMoveCharactersAction(text: string, card: Card, abilities: AbilityDefinition[]): boolean {
    // "Move up to 2 of your characters to the same location for free."
    // "That location gains Resist +2 until the start of your next turn."
    const moveMatch = text.match(/^move up to (\d+) of your characters to the same location for free/i);
    if (moveMatch) {
        const amount = parseInt(moveMatch[1]);
        const effects: any[] = [{
            type: 'move_characters',
            amount,
            destination: 'same_location',
            cost: 'free',
            target: { type: 'your_characters', count: amount }
        }];

        // Handle secondary effect: "That location gains..."
        if (text.match(/that location gains (.+) until the start of your next turn/i)) {
            const buffMatch = text.match(/that location gains (.+) until the start of your next turn/i)!;
            // e.g. "Resist +2"
            effects.push({
                type: 'grant_ability_to_location',
                abilityText: buffMatch[1],
                duration: 'next_turn'
            });
        }

        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            costs: [],
            effects,
            rawText: text
        } as any);
        return true;
    }
    return false;
}

export function parsePutUnderItemAction(text: string, card: Card, abilities: AbilityDefinition[]): boolean {
    // "Put a character card from your discard under this item faceup."
    const match = text.match(/^put a (?:(\w+) )?card from your discard under this (item|character|location)(?: faceup)?/i);
    if (match) {
        const cardType = match[1] || 'card';
        const targetType = match[2].toLowerCase();

        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            costs: [],
            effects: [{
                type: 'put_under_card',
                source: 'discard',
                destination: 'self',
                filter: { type: cardType },
                faceup: true
            }],
            rawText: text
        } as any);
        return true;
    }
    return false;
}

export function parsePlayFromUnderItemAction(text: string, card: Card, abilities: AbilityDefinition[]): boolean {
    // "This turn, you may play characters from under this item."
    const match = text.match(/^this turn, you may play (\w+)s? from under this (item|character|location)/i);
    if (match) {
        const cardType = match[1]; // e.g. "character"

        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            costs: [],
            effects: [{
                type: 'play_from_under_card',
                filter: { type: cardType },
                duration: 'turn'
            }],
            rawText: text
        } as any);
        return true;
    }
    return false;
}

export function parseMassInkwellAction(text: string, card: Card, abilities: AbilityDefinition[]): boolean {
    // "Put all characters with cost 3 or less into their players' inkwells facedown and exerted."
    const match = text.match(/^put all characters (?:with cost (\d+) or less )?into their players'? inkwells/i);
    if (match) {
        const costLimit = match[1] ? parseInt(match[1]) : undefined;
        const filter: any = {};
        if (costLimit !== undefined) {
            filter.cost = costLimit;
            filter.costComparison = 'less_or_equal';
        }

        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            costs: [],
            effects: [{
                type: 'put_into_inkwell',
                target: { type: 'all_characters', filter },
                facedown: true,
                exerted: true
            }],
            rawText: text
        } as any);
        return true;
    }
    return false;
}
