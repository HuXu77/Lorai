import { AbilityDefinition, generateAbilityId } from './parser-utils';
import { parseStaticEffects } from './static-effect-parser';
import { parseSimpleBanishAction, parseSimpleHealAction, parseReadyAllAction, parseCantReadyAction, parseMassBanishAction, parseOpponentChoiceAction, parseHighestCostDamageAction, parseConditionalDrawAction, parseMoveDamageAction, parsePutIntoInkwellAction, parseRevealTopCardAction, parsePlayFromDiscardAction, parseOpponentDiscardAction, parseRevealAndPutIntoHandAction, parseConditionalInkAction, parseMoveCharactersAction, parsePutDamageCounterAction, parsePutUnderItemAction, parsePlayFromUnderItemAction, parseMassInkwellAction, parseDrawThenPutOnDeckAction } from './action-card-helpers';
import { parseStat, parseStatModification, PATTERNS } from './pattern-matchers';
import { Card } from '../models';
import { ActivatedAbility } from '../abilities/types';
import { log } from '../ability-parser';

/**
 * Parse activated abilities from text
 * Examples:
 * - "Banish this item — Deal 2 damage to chosen character"
 * - "⟳, 1 ⬡ — Draw a card"
 */
export function parseActivated(text: string, card: Card, abilities: AbilityDefinition[]): boolean {
    // DEBUG: Queen's Sensor Core
    if (card.name?.includes("Sensor") || text.toLowerCase().includes('princess') || text.toLowerCase().includes('reveal the top')) {
        // console.log(`[DEBUG-ACTIVATED-QUEEN] Card: ${card.name} Text: \"${text}\"`);', JSON.stringify(text));
    }

    // Normalize newlines to spaces for pattern matching
    // Action card text often has newlines that break regex patterns
    // Use aggressive replacement for real newlines and literal \n sequences
    const normalizedText = text.replace(/\\n/g, ' ').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();

    log(`      [ACTIVATED] Entry - Card: ${card.name}, Raw text: "${text.substring(0, 100)}..."`);
    log(`      [ACTIVATED] Normalized: "${normalizedText.substring(0, 100)}..."`);

    log(`      [ACTIVATED] Checking: "${normalizedText.substring(0, 70)}..."`);

    if (normalizedText.toLowerCase().includes('hypnotic') || normalizedText.toLowerCase().includes('draw 3 cards')) {
        console.log(`[DEBUG-HYPNOTIC-TEXT] Normalized Text: "${normalizedText}"`);
    }

    // Use normalizedText for all pattern matching below
    text = normalizedText;

    // PRIORITY: Hypnotic Deduction (Draw then put on deck)
    // Needs to be checked before partial matches
    if (text.match(/draw \d+ cards?.*put \d+ cards?/i)) {
        if (parseDrawThenPutOnDeckAction(text, card, abilities)) {
            return true;
        }
    }

    // A Whole New World: "Each player discards their hand and draws 7 cards."
    const wholeNewWorldMatch = text.match(/^each player discards their hand and draws (\d+) cards/i);
    if (wholeNewWorldMatch) {
        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            costs: [],
            effects: [{
                type: 'discard_hand_draw',
                amount: parseInt(wholeNewWorldMatch[1]),
                target: { type: 'all_players' }
            }],
            rawText: text
        } as any);
        return true;
    }

    // "Each opponent discards all cards in their hand" (Bend to My Will)
    // "Each opponent discards their hand"
    if (text.match(/^each opponent discards (?:all cards in )?their hand/i)) {
        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            costs: [],
            effects: [{
                type: 'discard_hand',
                target: { type: 'all_opponents' }
            }],
            rawText: text
        } as any);
        return true;
    }

    // Performance Review: "⟳ chosen ready character of yours to draw cards equal to that character's ◊."
    if (text.match(/^⟳ chosen ready character of yours to draw cards equal to that character's [◊]/i)) {
        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            costs: [],
            effects: [{
                type: 'exert_character_to_draw_lore',
                target: { type: 'chosen_character', filter: { mine: true, ready: true } }
            }],
            rawText: text
        } as any);
        return true;
    }

    // Magic Feather: "3 ⬡ — Return this item to your hand."
    const returnItemMatch = text.match(/^(\d+)\s*[⬡ink]+\s*[—\-–]\s*return this item to your hand\.?$/i);
    if (returnItemMatch) {
        const inkCost = parseInt(returnItemMatch[1]);
        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            cost: { ink: inkCost },
            effects: [{
                type: 'return_to_hand',
                target: { type: 'self' }
            }],
            rawText: text
        } as any);
        return true;
    }

    // Generic "Ready chosen character..."
    // Fa Zhou: "Ready chosen character named Mulan. She can't quest for the rest of this turn."
    const readyNamedMatch = text.match(/^ready chosen character named (.+)\. (?:she|he|they) can't quest for the rest of this turn/i);
    if (readyNamedMatch) {
        const characterName = readyNamedMatch[1].trim();
        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            effects: [
                {
                    type: 'ready_character',
                    target: { type: 'chosen_character', filter: { name: characterName } }
                },
                {
                    type: 'cant_quest',
                    target: { type: 'that_character' },
                    duration: 'rest_of_turn'
                }
            ],
            rawText: text
        } as any);
        return true;
    }

    // Ursula's Cauldron / Peer Into The Depths
    // "Peer Into The Depths — ⟳ Look at the top 2 cards of your deck. Put one on the top of your deck and the other on the bottom."
    if (text.match(/peer into the depths.*[—\-–].*[⟳\u27f3].*look at the top 2 cards of your deck.*put one on the top.*and the other on the bottom/i) ||
        text.match(/[—\-–].*[⟳\u27f3].*look at the top 2 cards of your deck/i)) {

        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            cost: { exert: true },
            effects: [{
                type: 'scry',
                amount: 2,
                mode: 'one_top_one_bottom',
                target: { type: 'self_deck_top' }
            }],
            rawText: text
        } as any);
        return true;
    }

    // Queen's Sensor Core: "⟳, 2 ⬡ — Reveal the top card of your deck. If it's a Princess or Queen character card, you may put it into your hand. Otherwise, put it on the top of your deck."
    const royalSearchMatch = text.match(/^[⟳\u27f3],? (\d+) [⬡\u2b21] [—\-–] reveal the top card of your deck\. if it[''']s a (.+?)(?: or (.+?))? character card, you may put (?:it|that card) into your hand\. otherwise.*/i);
    if (royalSearchMatch) {
        const inkCost = parseInt(royalSearchMatch[1]);
        const classif1 = royalSearchMatch[2];
        const classif2 = royalSearchMatch[3];
        const classifications = classif2 ? [classif1, classif2] : [classif1];
        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            cost: { ink: inkCost, exert: true },
            effects: [
                {
                    type: 'reveal_top_of_deck'
                },
                {
                    type: 'conditional_put_in_hand',
                    condition: {
                        type: 'card_type_match',
                        cardType: 'character',
                        classifications
                    },
                    ifTrue: {
                        type: 'put_in_hand',
                        target: { type: 'revealed_card' },
                        optional: true
                    },
                    ifFalse: {
                        type: 'put_on_top_of_deck',
                        target: { type: 'revealed_card' }
                    }
                }
            ],
            rawText: text
        } as any);
        return true;
    }

    // Naveen's Ukulele: "1 ⬡, Banish this item — Chosen character counts as having +3 cost to sing songs this turn."
    const ukuleleMatch = text.match(/^(\d+) [⬡\u2b21],? banish this item [—\-–] chosen character counts as having ([+\-]\d+) cost to sing songs this turn/i);
    if (ukuleleMatch) {
        const inkCost = parseInt(ukuleleMatch[1]);
        const costMod = parseInt(ukuleleMatch[2]);
        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            cost: { ink: inkCost, banishSelf: true },
            effects: [{
                type: 'modify_sing_cost',
                amount: costMod,
                target: { type: 'chosen_character' },
                duration: 'turn'
            }],
            rawText: text
        } as any);
        return true;
    }

    // Yzma: "⟳ — If you have fewer than 3 cards in your hand, draw until you have 3 cards in your hand."
    const yzmaMatch = text.match(/^[⟳\u27f3] [—\-–] if you have fewer than (\d+) cards in your hand, draw until you have (\d+) cards in your hand/i);
    if (yzmaMatch) {
        const threshold = parseInt(yzmaMatch[1]);
        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            cost: { exert: true },
            condition: {
                type: 'hand_size_less_than',
                count: threshold
            },
            effects: [{
                type: 'draw_until',
                targetHandSize: threshold
            }],
            rawText: text
        } as any);
        return true;
    }

    // Mad Hatter's Teapot: "⟳, 1 ⬡ — Each opponent puts the top card of their deck into their discard."
    const teapotMatch = text.match(/^[⟳\u27f3],? (\d+) [⬡\u2b21] [—\-–] each opponent puts the top card of their deck into their discard/i);
    if (teapotMatch) {
        const inkCost = parseInt(teapotMatch[1]);
        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            cost: { ink: inkCost, exert: true },
            effects: [{
                type: 'mill',
                amount: 1,
                target: { type: 'each_opponent' }
            }],
            rawText: text
        } as any);
        return true;
    }

    // Glass Slipper: "Banish this item, ⟳ one of your Prince characters — Search your deck for a Princess character card and reveal it to all players. Put that card into your hand and shuffle your deck."
    const glassSlipperMatch = text.match(/^banish this item,? [⟳\u27f3] one of your (.+?) characters [—\-–] search your deck for an? (.+?) character card and reveal it to all players\. put that card into your hand and shuffle your deck/i);
    if (glassSlipperMatch) {
        const exertClassification = glassSlipperMatch[1];
        const searchClassification = glassSlipperMatch[2];
        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            cost: {
                banishSelf: true,
                exertCharacter: { classification: exertClassification, mine: true }
            },
            effects: [{
                type: 'search_deck',
                filter: { type: 'character', classification: searchClassification },
                reveal: true,
                destination: 'hand',
                shuffle: true
            }],
            rawText: text
        } as any);
        return true;
    }

    // The Nephews' Piggy Bank: "{Exert} - Chosen character gets -1 ¤ until the start of your next turn."
    const piggyBankMatch = text.match(/^(?:[⟳\u27f3] — )?chosen character gets ([+\-]\d+) [¤◊⛉] until the start of your next turn/i);
    if (piggyBankMatch) {
        const amount = parseInt(piggyBankMatch[1]);
        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            cost: { exert: true },
            effects: [{
                type: 'modify_stats',
                stat: 'strength',
                amount,
                target: { type: 'chosen_character' },
                duration: 'until_next_turn_start'
            }],
            rawText: text
        });
        return true;
    }

    // Ice Spikes: "{Exert} - Exert chosen opposing item. It can't ready at the start of its next turn."
    const iceSpikesMatch = text.match(/^.*exert chosen opposing item\. it can't ready at the start of its next turn/i);
    if (iceSpikesMatch) {
        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            cost: { exert: true, ink: 1 },
            effects: [
                {
                    type: 'exert',
                    target: { type: 'chosen_item_or_location', filter: { type: 'item', controller: 'opponent' } }
                },
                {
                    type: 'cant_ready',
                    target: { type: 'chosen_item_or_location', filter: { type: 'item', controller: 'opponent' } },
                    duration: 'until_next_turn_start'
                }
            ],
            rawText: text
        });
        return true;
    }

    // "Chosen character gets -X strength this turn. Draw a card." (Mosquito Bite)
    // "Chosen character gets -X strength this turn. Draw a card." (Mosquito Bite)
    // "Chosen character gets +2 ¤ this turn. Draw a card."
    const statDrawMatch = text.match(/^chosen character gets ([+-]?\d+) (strength|willpower|lore|¤|🛡️|⛉|◊|⬡) this turn\. draw a card/i);
    if (statDrawMatch) {
        const amount = parseInt(statDrawMatch[1]);
        const statSymbol = statDrawMatch[2].toLowerCase();
        let stat = 'strength';
        if (['willpower', '🛡️', '⛉'].includes(statSymbol)) stat = 'willpower';
        if (['lore', '◊'].includes(statSymbol)) stat = 'lore';

        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            costs: [],
            effects: [
                {
                    type: 'modify_stats',
                    stat,
                    amount,
                    target: { type: 'chosen_character' },
                    duration: 'turn'
                },
                {
                    type: 'draw',
                    amount: 1,
                    target: { type: 'self' }
                }
            ],
            rawText: text
        } as any);
        return true;
    }


    // BATCH 14: Each player effects (Action cards)
    // "Each player draws 3 cards" (Show Me More!)
    // "Each player may draw a card" (Amethyst Chromicon)
    const eachPlayerMayDrawMatch = text.match(/^each player may draw (?:a|(\d+)) cards?\.?$/i);
    if (eachPlayerMayDrawMatch) {
        const amount = eachPlayerMayDrawMatch[1] ? parseInt(eachPlayerMayDrawMatch[1]) : 1;
        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            costs: [],
            effects: [{
                type: 'draw',
                amount,
                target: { type: 'all_players' },
                optional: true  // "may" means each player chooses
            }],
            rawText: text
        } as any);
        return true;
    }

    const eachPlayerDrawsMatch = text.match(/^each player draws (?:a|(\d+)) cards?\.?$/i);
    if (eachPlayerDrawsMatch) {
        const amount = eachPlayerDrawsMatch[1] ? parseInt(eachPlayerDrawsMatch[1]) : 1;
        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            costs: [],
            effects: [{
                type: 'draw',
                amount,
                target: { type: 'all_players' }
            }],
            rawText: text
        } as any);
        return true;
    }

    // "Each player may reveal a character card from their hand and play it for free" (The Return of Hercules)
    if (text.match(/^each player may reveal a character card from their hand and play it for free\.?$/i)) {
        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            costs: [],
            effects: [{
                type: 'each_player_reveal_and_play',
                cardType: 'character',
                free: true
            }],
            rawText: text
        } as any);
        return true;
    }

    // "Each player exerts all the cards in their inkwell. Then..." (Ink Geyser)
    // This is a complex compound effect with conditional return
    if (text.match(/^each player exerts all the cards? in their inkwells?/i)) {
        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            costs: [],
            effects: [{
                type: 'each_player_exert_inkwell_with_return',
                threshold: 3  // From text: "more than 3 cards"
            }],
            rawText: text
        } as any);
        return true;
    }

    // BATCH 44: Simple action cards without cost separator
    // These are "play card → effect" patterns (no exert/ink cost)

    // NEW GAP: Draw then put on deck (Hypnotic Deduction)
    if (text.match(/^draw \d+ cards?\. then, put \d+ cards?/i)) {
        return parseDrawThenPutOnDeckAction(text, card, abilities);
    }

    // "Mass Inkwell" patterns (Spooky Sight)
    if (text.match(/^put all characters .*into their players'? inkwells/i)) {
        return parseMassInkwellAction(text, card, abilities);
    }

    // "Move characters" patterns (The Game's Afoot!)
    if (text.match(/^move up to \d+ of your characters/i)) {
        return parseMoveCharactersAction(text, card, abilities);
    }

    // "Put 1 damage counter" patterns (Malicious, Mean, and Scary)
    if (text.match(/^put \d+ damage counter/i)) {
        return parsePutDamageCounterAction(text, card, abilities);
    }

    // "Banish chosen X" patterns
    if (text.match(/^banish chosen (character|item|location)/i)) {
        return parseSimpleBanishAction(text, card, abilities);
    }

    // "Reveal top X" patterns
    if (text.match(/^reveal the top \d+ cards/i)) {
        return parseRevealAndPutIntoHandAction(text, card, abilities);
    }

    // "Remove damage" patterns  
    if (text.match(/^remove up to \d+ damage/i)) {
        return parseSimpleHealAction(text, card, abilities);
    }

    // "Move damage" patterns
    if (text.match(/^move \d+ damage counter/i)) {
        return parseMoveDamageAction(text, card, abilities);
    }

    // "Put into inkwell" patterns
    if (text.match(/^put chosen (?:opposing )?(item|location|character|card).*into.*inkwell/i)) {
        return parsePutIntoInkwellAction(text, card, abilities);
    }

    // "Reveal top card" patterns
    if (text.match(/^reveal the top card/i)) {
        return parseRevealTopCardAction(text, card, abilities);
    }

    // "Play from discard" patterns
    if (text.match(/^play a (character|item|action).*from your discard/i)) {
        return parsePlayFromDiscardAction(text, card, abilities);
    }

    // "Each opposing player discards" patterns
    if (text.match(/^each opposing player discards/i)) {
        return parseOpponentDiscardAction(text, card, abilities);
    }

    // "Ready all" patterns (compound effects)
    if (text.match(/^ready all your characters/i)) {
        return parseReadyAllAction(text, card, abilities);
    }

    // "Chosen character can't ready" patterns
    if (text.match(/^(?:chosen|exerted) .*(?:can't|doesn't) ready/i)) {
        return parseCantReadyAction(text, card, abilities);
    }

    // "Banish all opposing" patterns (mass banish)
    if (text.match(/^banish all opposing/i)) {
        return parseMassBanishAction(text, card, abilities);
    }

    // "Opposing players together choose" patterns - can appear at start
    if (text.match(/^(the )?opposing players together choose/i)) {
        return parseOpponentChoiceAction(text, card, abilities);
    }

    // "Chosen [condition] character gets" patterns (What Did You Call Me?)
    // "Chosen damaged character gets +3 ¤ this turn."
    // "Chosen exerted character gets +2 🛡️ this turn."
    const chosenCondStatMatch = text.match(/^chosen (damaged|exerted) character gets ([+-]\d+) (strength|willpower|lore|¤|🛡️|⛉|◊|⬡) this turn/i);
    if (chosenCondStatMatch) {
        const condition = chosenCondStatMatch[1].toLowerCase();
        const modification = parseStatModification(chosenCondStatMatch[2] + ' ' + chosenCondStatMatch[3]);
        if (modification) {
            abilities.push({
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'activated',
                costs: [],
                effects: [{
                    type: 'modify_stats',
                    stat: modification.stat,
                    amount: modification.amount,
                    target: {
                        type: 'chosen_character',
                        filter: { status: condition }
                    },
                    duration: 'turn'
                }],
                rawText: text
            } as any);
            return true;
        }
    }

    // \"Look at top X cards... put one into hand\" (Develop Your Brain)
    if (text.match(/^look at the top (\d+) cards of your deck.*put one into your hand/i)) {
        const match = text.match(/^look at the top (\d+) cards of your deck/i);
        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated', // Action card effect
            effects: [{
                type: 'one_to_hand_rest_bottom',
                amount: parseInt(match![1])
            }],
            rawText: text
        });
        return true;
    }


    // normalizes newlines

    // "Ambush!" pattern (Exert cost for damage)
    // "⟳ one of your characters to deal damage equal to their ¤ to chosen character."
    if (text.match(/one\s+of\s+your\s+characters\s+to\s+deal\s+damage\s+equal\s+to\s+their/i)) {
        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            effects: [{
                type: 'exert_ally_for_damage',
                target: { type: 'chosen_character' }
            }],
            rawText: text
        });
        return true;
    }



    // "Unfortunate Situation" pattern (Opponent choice self-damage)
    // "Each opponent chooses one of their characters and deals 4 damage to them."
    const oppChoiceDamageMatch = text.match(/each opponent chooses one of their characters and deals? (\d+) damage/i);
    if (oppChoiceDamageMatch) {
        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            effects: [{
                type: 'opponent_choice_damage',
                amount: parseInt(oppChoiceDamageMatch[1])
            }],
            rawText: text
        });
        return true;
    }

    // "If you have X ink" patterns
    if (text.match(/^if you have \d+ [⬡ink] or less/i)) {
        return parseConditionalInkAction(text, card, abilities);
    }

    // "Play character for free" (Just in Time)
    // "You may play a character with cost 5 or less for free."
    if (text.match(/^you may play a character with cost (\d+) or less for free/i)) {
        const match = text.match(/^you may play a character with cost (\d+) or less for free/i);
        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            costs: [],
            effects: [{
                type: 'play_for_free',
                target: {
                    type: 'card_from_hand',
                    filter: {
                        cardType: 'character',
                        costLimit: parseInt(match![1])
                    }
                }
            }],
            rawText: text
        } as any);
        return true;
    }

    // "Highest cost character" damage patterns
    if (text.match(/deal \d+ damage to the highest cost character/i)) {
        log(`      [ACTIVATED] Matched highest cost damage pattern, calling helper`);
        return parseHighestCostDamageAction(text, card, abilities);
    } else if (text.match(/deal \d+ damage to the highest/i)) {
        log(`      [ACTIVATED] Partial match on 'deal damage to highest' but not full pattern`);
    }

    // "Strength of a Raging Fire" pattern
    // "Deal damage to chosen character equal to the number of characters you have in play."
    if (text.match(/deal damage to chosen character equal to the number of characters you have in play/i)) {
        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            costs: [],
            effects: [{
                type: 'damage',
                target: { type: 'chosen_character' },
                amount: {
                    type: 'count',
                    source: 'play',
                    owner: 'self',
                    filter: { type: 'character' }
                }
            }],
            rawText: text
        } as any);
        return true;
    }

    // BATCH 48: Once per turn exert-move-damage (Sugar Rush Speedway)
    // Handle with or without "marks!" prefix
    const oncePerTurnMatch = text.match(/(?:marks! )?once per turn, you may ⟳ chosen character here and deal them (\d+) damage to move them to another location for free/i);
    if (oncePerTurnMatch) {
        const damage = parseInt(oncePerTurnMatch[1]);

        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            costs: [],
            effects: [
                { type: 'exert', target: { type: 'chosen_character', filter: { at_location: 'self' } } },
                { type: 'damage', amount: damage, target: { type: 'same_target' } },
                { type: 'move_to_location', target: { type: 'same_target' }, free: true }
            ],
            limitation: 'once_per_turn',
            rawText: text
        } as any);
        return true;
    }

    // "Conditional card draw" patterns - MUST BE BEFORE cost separator
    if (text.match(/^if chosen opponent has more cards in their hand than you, draw cards until/i)) {
        return parseConditionalDrawAction(text, card, abilities);
    }

    // 1. Parse Costs
    // Look for "Cost: Effect" structure
    // EXCEPTION: "Choose one: ..." is NOT a cost/effect pair, it's a modal choice handled by static/triggered parsers
    const costMatch = text.match(/^((?!Choose one)[^:]+): (.+)/i);
    let costText = '';
    let effectText = text;

    if (costMatch) {
        costText = costMatch[1].trim();
        effectText = costMatch[2].trim();
    } else {
        // Fallback: Split cost and effect by dash
        // Pattern: Cost — Effect
        const parts = text.split(/\s*[—–]\s*|\s+-\s+/);
        if (parts.length >= 2) {
            costText = parts[0];
            effectText = parts.slice(1).join(' — ');
        }
    }

    const costs: any[] = [];
    // Legacy cost object for compatibility
    const cost: any = {};

    if (costText) {
        // Parse costs
        const costParts = costText.split(/,\s*/);
        for (const part of costParts) {
            if (part.match(/exert/i) || part.includes('\u27F3')) {
                costs.push({ type: 'exert' });
                cost.exert = true;
            } else if (part.match(/(\d+) (ink|⬡)/i)) {
                const inkMatch = part.match(/(\d+) (ink|⬡)/i);
                const amount = parseInt(inkMatch![1]);
                costs.push({ type: 'ink', amount });
                cost.ink = amount;
            } else if (part.match(/banish this item/i)) {
                costs.push({ type: 'banish', target: 'self' });
                cost.banish_self = true;
            } else if (part.match(/banish one of your (other )?characters/i)) {
                costs.push({ type: 'banish', target: 'other_character' });
                cost.banish_other_character = true;
            } else if (part.match(/(?:exert|⟳) one of your items/i)) {
                costs.push({ type: 'exert_item', target: 'my_item' });
                cost.exert_item = true;
            }
        }
    }

    // Parse Effect
    const effects: any[] = [];

    // Stratos: Gain lore equal to the number of X characters you have in play
    // "Gain lore equal to the number of Titan characters you have in play."
    const stratosMatch = effectText.match(/^gain lore equal to the number of (.+) characters you have in play/i);
    if (stratosMatch) {
        const subtype = stratosMatch[1];
        effects.push({
            type: 'gain_lore_for_each',
            target: { type: 'self' },
            source: {
                type: 'count_characters',
                filter: {
                    subtype: subtype,
                    mine: true
                }
            }
        });
    }

    // Magic Carpet: Move a character of yours to a location for free
    // "Move a character of yours to a location for free."
    if (effectText.match(/^move a character of yours to a location for free/i)) {
        effects.push({
            type: 'move_to_location',
            target: {
                type: 'chosen_character',
                filter: { mine: true }
            },
            free: true
        });
    }

    // 1. Name a card (Sorcerer's Hat)
    if (effectText.match(/name a card, then reveal/i) || effectText.match(/name a card and reveal/i)) {
        effects.push({
            type: 'name_and_reveal'
        });
    }

    // 2. Play Character Free (Mickey Mouse - Trumpeter)
    if (effectText.match(/play a character for free/i)) {
        effects.push({
            type: 'play_from_hand',
            filter: { cardType: 'character' },
            free: true
        });
    }

    // 3. Scry Effect (Aurora - Lore Guardian)
    // "Look at the top card of your deck and put it on either the top or the bottom of your deck."
    if (effectText.match(/look at the top card of your deck and put it on either the top or the bottom of your deck/i)) {
        effects.push({
            type: 'look_and_move_to_top_or_bottom',
            amount: 1,
            source: 'deck'
        });
    }

    // CAMPAIGN: Kida - "Look at the top 2 cards of your deck. Put one into your inkwell facedown and exerted and the other on the top of your deck."
    // Uses effectText because cost is stripped
    if (effectText.match(/^look at the top (\d+) cards of your deck.*put one into your inkwell facedown and exerted and the other on the top of your deck/i)) {
        const match = effectText.match(/^look at the top (\d+) cards of your deck/i);
        effects.push({
            type: 'look_and_distribute',
            amount: parseInt(match![1]),
            distribution: {
                inkwell: { count: 1, facedown: true, exerted: true },
                top_deck: { count: 1 }
            }
        });
    }

    // Play character with same name (Hades - Double Deal)
    // "play a character with the same name as the banished character for free"
    if (effectText.match(/play a character with the same name as the banished character for free/i)) {
        effects.push({
            type: 'play_card',
            target: {
                type: 'card_from_hand',
                filter: {
                    name: 'same_as_banished'
                }
            },
            free: true
        });
    }

    // Great Stone Dragon: "Put a character card from your discard into your inkwell facedown and exerted."
    if (effectText.match(/put a character card from your discard into your inkwell facedown and exerted/i)) {
        effects.push({
            type: 'move_card_to_zone',
            source: 'discard',
            destination: 'inkwell',
            target: {
                type: 'chosen_card_in_discard',
                filter: { cardType: 'character', mine: true }
            },
            facedown: true,
            exerted: true
        });
    }

    // 16. Location Buff (Training Grounds)
    // "Chosen character here gets +1 ¤ this turn."
    const buffMatch = effectText.match(/chosen character here gets ([+-]\d+ (?:strength|willpower|lore|¤|🛡️|⛉|◊|⬡)) this turn/i);
    if (buffMatch) {
        const modification = parseStatModification(buffMatch[1]);
        if (modification) {
            effects.push({
                type: 'modify_stats',
                stat: modification.stat,
                amount: modification.amount,
                target: { type: 'chosen_character_at_location' },
                duration: 'turn'
            });
        }
    }

    // The Queen - Diviner: Look top 4, reveal item, hand OR play free (cond), rest bottom
    // "Look at the top 4 cards of your deck. You may reveal an item card and put it into your hand. If that item costs 3 or less, you may play it for free instead and it enters play exerted. Put the rest on the bottom of your deck in any order."
    const queenMatch = effectText.match(/^look at the top (\d+) cards of your deck\. you may reveal an item card and put it into your hand\. if that item costs (\d+) or less, you may play it for free instead and it enters play exerted/i);
    if (queenMatch) {
        const lookAmount = parseInt(queenMatch[1]);
        const costLimit = parseInt(queenMatch[2]);

        effects.push({
            type: 'look_reveal_put_hand_or_play',
            amount: lookAmount,
            filter: { cardType: 'item' },
            play_condition: { costLimit },
            play_exerted: true,
            rest_destination: 'bottom'
        });
    }

    // Hiro Hamada: Search for X or Y, reveal, shuffle, put on top
    // "Search your deck for an item card or a Robot character card and reveal it to all players. Shuffle your deck and put that card on top of it."
    const hiroMatch = effectText.match(/^search your deck for (?:an? (.+?)(?: card)?) or (?:an? (.+?)(?: card)?) and reveal it to all players\. shuffle your deck and put that card on top of it/i);
    if (hiroMatch) {
        const typeA = hiroMatch[1].trim().toLowerCase();
        const typeB = hiroMatch[2].trim().toLowerCase();

        effects.push({
            type: 'tutor_reveal_shuffle_on_top',
            filter: { types: [typeA, typeB] },
            reveal: true,
            shuffle: true,
            destination: 'top_of_deck'
        });
    }

    // Pete - Wrestling Champ: "Reveal the top card of your deck. If it's a character card named Pete, you may play it for free."
    if (effectText.match(/^reveal the top card of your deck\. if it[''']s a character card named (.+?), you may play it for free/i)) {
        const nameMatch = effectText.match(/named (.+?), you may/i);
        const characterName = nameMatch![1];

        effects.push({
            type: 'reveal_top_and_play_if_name',
            cardType: 'character',
            name: characterName,
            free: true
        });
    }

    // Kuzco - Selfish Emperor activated: "Your other characters gain Resist +1 until the start of your next turn."
    if (effectText.match(/^your other characters gain (.+?) until the start of your next turn/i)) {
        const keywordMatch = effectText.match(/gain (.+?) until/i);
        const keywordText = keywordMatch![1];

        // Parse keyword (e.g., "Resist +1")
        let keyword = 'Resist';
        let amount: number | undefined;
        if (keywordText.match(/resist \+(\d+)/i)) {
            amount = parseInt(keywordText.match(/\+(\d+)/i)![1]);
        }

        effects.push({
            type: 'grant_keyword',
            keyword,
            amount,
            target: { type: 'all_my_characters', other: true },
            duration: 'next_turn_start'
        });
    }

    // Pongo - Determined Father: "Once during your turn" OR "Once per turn, you may pay 2 ⬡ to reveal..."
    // Handles both variants
    if (effectText.match(/^once (?:per turn|during your turn), you may pay (\d+) ⬡ to reveal the top card of your deck\. if it[''']s a character card, put it into your hand\. otherwise, put it on the bottom of your deck/i)) {
        const costMatch = effectText.match(/pay (\d+) ⬡/i);
        const inkCost = parseInt(costMatch![1]);

        effects.push({
            type: 'reveal_top_card_conditional',
            filter: { cardType: 'character' },
            ifTrue: { destination: 'hand' },
            ifFalse: { destination: 'bottom_of_deck' },
            once_per_turn: true
        });
    }

    // Lucky - The 15th Puppy: "Reveal the top 3 cards of your deck. You may put each character card with cost 2 or less into your hand. Put the rest on the bottom of your deck in any order."
    if (effectText.match(/^reveal the top (\d+) cards of your deck\. you may put each character card with cost (\d+) or less into your hand\. put the rest on the bottom of your deck in any order/i)) {
        const numMatch = effectText.match(/top (\d+) cards/i);
        const costMatch = effectText.match(/cost (\d+) or less/i);
        const numCards = parseInt(numMatch![1]);
        const maxCost = parseInt(costMatch![1]);

        effects.push({
            type: 'reveal_and_put_filtered',
            amount: numCards,
            filter: { cardType: 'character', maxCost },
            destination: 'hand',
            rest_destination: 'bottom_of_deck'
        });
    }

    // 4. Draw Cards (Magic Mirror, The Queen)
    // "Draw a card" or "Draw 2 cards"
    const drawMatch = effectText.match(/^draw (?:a|(\d+)) cards?\.?$/i);
    if (drawMatch) {
        const amount = drawMatch[1] ? parseInt(drawMatch[1]) : 1;
        effects.push({
            type: 'draw',
            amount,
            target: { type: 'self_player' }
        });
    }

    // BATCH 46: Draw equal to damage (Dinner Bell)
    // "draw cards equal to the damage on chosen character of yours, then banish them"
    const drawEqualDamageMatch = effectText.match(/^draw cards equal to the damage on chosen character of yours, then banish them/i);
    if (drawEqualDamageMatch) {
        effects.push({
            type: 'draw_equal_to_damage',
            target: { type: 'chosen_character', filter: { mine: true } }
        });
        effects.push({
            type: 'banish',
            target: { type: 'same_target' }
        });
    }

    // BATCH 34: Heal Chosen Character (Dinglehopper)
    // "Remove up to X damage from chosen character."
    // Also supports "chosen location" (Wildcat's Wrench)
    const healChosenMatch = effectText.match(/remove up to (\d+) damage from chosen (character|location)/i);
    if (healChosenMatch) {
        const targetType = healChosenMatch[2].toLowerCase() === 'location' ? 'chosen_location' : 'chosen_character';
        effects.push({
            type: 'heal',
            amount: parseInt(healChosenMatch[1]),
            target: { type: targetType }
        });
    }
    // BATCH 46: Gain lore equal to stat (Lucky Dime)
    // "choose a character of yours and gain lore equal to their ◊"
    const gainLoreEqualStatMatch = effectText.match(/^choose a character of yours and gain lore equal to their (◊|lore|¤|strength|⛉|willpower)/i);
    if (gainLoreEqualStatMatch) {
        let stat = 'lore';
        const symbol = gainLoreEqualStatMatch[1].toLowerCase();
        if (['¤', 'strength'].includes(symbol)) stat = 'strength';
        if (['⛉', 'willpower'].includes(symbol)) stat = 'willpower';

        effects.push({
            type: 'gain_lore',
            amount: { type: 'stat_of_target', stat },
            target: { type: 'chosen_character', filter: { mine: true } }
        });
    }

    // Potion of Malice: Put damage counter on chosen character
    // "Put 1 damage counter on chosen character."
    const putDamageMatch = effectText.match(/^put (\d+) damage counters? on chosen (character|location)/i);
    if (putDamageMatch) {
        const amount = parseInt(putDamageMatch[1]);
        const targetType = putDamageMatch[2].toLowerCase() === 'location' ? 'chosen_location' : 'chosen_character';
        effects.push({
            type: 'put_damage_counter',
            amount,
            target: { type: targetType }
        });
    }

    // Potion of Malice #2: Grant keyword to all opposing damaged characters
    // "Each opposing damaged character gains Reckless until the start of your next turn."
    const massGrantKeywordMatch = effectText.match(/^each opposing (damaged|exerted)? ?characters? gains? (rush|evasive|support|ward|reckless) until the start of your next turn/i);
    if (massGrantKeywordMatch) {
        const condition = massGrantKeywordMatch[1]?.toLowerCase();
        const keyword = massGrantKeywordMatch[2].toLowerCase();

        const target: any = { type: 'all_opposing_characters' };
        if (condition) {
            target.filter = { status: condition };
        }

        effects.push({
            type: 'grant_keyword',
            keyword,
            target,
            duration: 'next_turn_start'
        });
    }

    // Grant Keyword (Croquet Mallet)
    // "Chosen character gains Rush this turn."
    const keywordMatch = effectText.match(/chosen character gains (rush|evasive|support|ward) this turn/i);
    if (keywordMatch) {
        effects.push({
            type: 'grant_keyword',
            keyword: keywordMatch[1].toLowerCase(),
            target: { type: 'chosen_character' },
            duration: 'turn'
        });
    }

    // Return to Hand (Perplexing Signposts)
    // "Return chosen character of yours to your hand."
    if (effectText.match(/return chosen character of yours to your hand/i)) {
        effects.push({
            type: 'return_to_hand',
            target: { type: 'chosen_character', filter: { mine: true } }
        });
    }

    // 6. Deal Damage (Skirmish)
    // "Deal 1 damage to chosen character"
    const damageMatch = effectText.match(/^deal (\d+) damage to chosen (opposing )?character\.?$/i);
    if (damageMatch) {
        effects.push({
            type: 'damage',
            amount: parseInt(damageMatch[1]),
            target: {
                type: damageMatch[2] ? 'chosen_opposing_character' : 'chosen_character'
            }
        });
    }

    // 7. Exert (Elsa, Freeze)
    // "Exert chosen opposing character"
    const exertMatch = effectText.match(/^exert chosen (opposing )?character\.?$/i);
    if (exertMatch) {
        effects.push({
            type: 'exert',
            target: {
                type: exertMatch[1] ? 'chosen_opposing_character' : 'chosen_character'
            }
        });
    }

    // 8. Banish Character (Sword of Truth - BATCH 12)
    // "Banish chosen villain character"
    // "Banish chosen opposing character"
    // "Banish chosen character" (Hades)
    const banishMatch = effectText.match(/^banish chosen (villain |opposing )?character\.?/i);
    if (banishMatch) {
        const filter: any = {};
        if (banishMatch[1] && banishMatch[1].toLowerCase().includes('villain')) filter.subtype = 'Villain';

        effects.push({
            type: 'banish',
            target: {
                type: banishMatch[1] && banishMatch[1].toLowerCase().includes('opposing') ? 'chosen_opposing_character' : 'chosen_character',
                filter: Object.keys(filter).length > 0 ? filter : undefined
            }
        });
    }

    // 8. Return to Hand (Genie)
    // "Return chosen character to their player's hand"
    const returnMatch = effectText.match(/^return chosen character to their player's hand\.?$/i);
    if (returnMatch) {
        effects.push({
            type: 'return_to_hand',
            target: { type: 'chosen_character' }
        });
    }

    // 14. Ready Subtype (Hades - King of Olympus)
    // "Ready your Titan characters"
    if (effectText.match(/^ready your (.+) characters/i)) {
        const match = effectText.match(/^ready your (.+) characters/i);
        const subtype = match![1].toLowerCase();

        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            cost,
            effects: [{
                type: 'ready',
                target: {
                    type: 'all_characters',
                    filter: { mine: true, subtype }
                }
            }],
            rawText: text
        } as any);
        return true;
    }


    // "Put under item" patterns (The Black Cauldron)
    const putUnderMatch = effectText.match(/^put a (?:(\w+) )?card from your discard under this (item|character|location)(?: faceup)?/i);
    if (putUnderMatch) {
        const cardType = putUnderMatch[1] || 'card';
        effects.push({
            type: 'put_under_card',
            source: 'discard',
            destination: 'self',
            filter: { type: cardType },
            faceup: true
        });
    }

    // "Play from under item" patterns (The Black Cauldron)
    const playFromUnderMatch = effectText.match(/^this turn, you may play (\w+)s? from under this (item|character|location)/i);
    if (playFromUnderMatch) {
        const cardType = playFromUnderMatch[1]; // e.g. "character"
        effects.push({
            type: 'play_from_under_card',
            filter: { type: cardType },
            duration: 'turn'
        });
    }

    // BATCH 48: Once per turn exert-move-damage (Sugar Rush Speedway)
    // "once per turn, you may ⟳ chosen character here and deal them 1 damage to move them to another location for free"
    const oncePerTurnMoveMatch = effectText.match(/^once per turn, you may ⟳ chosen character here and deal them (\d+) damage to move them to another location for free/i);
    if (oncePerTurnMoveMatch) {
        const damage = parseInt(oncePerTurnMoveMatch[1]);

        const compoundEffects: any[] = [];
        compoundEffects.push({
            type: 'exert',
            target: { type: 'chosen_character', filter: { at_location: 'self' } }
        });
        compoundEffects.push({
            type: 'damage',
            amount: damage,
            target: { type: 'same_target' }
        });
        compoundEffects.push({
            type: 'move_to_location',
            target: { type: 'same_target' },
            free: true
        });

        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            cost: {}, // No explicit cost mentioned in the text, implied by "may"
            effects: compoundEffects,
            limitation: 'once_per_turn',
            rawText: text
        } as any);
        return true;
    }

    // 15. Once Per Turn Pay Ink (Madam Mim - Snake)
    // "Once during your turn, you may pay 2 ink to return this character to your hand."
    if (text.match(/once during your turn, you may pay (\d+) ink to return this character to your hand/i)) {
        const match = text.match(/once during your turn, you may pay (\d+) ink to return this character to your hand/i);
        const inkCost = parseInt(match![1]);

        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated', // Treated as activated for now, though technically triggered by player choice
            cost: { ink: inkCost },
            effects: [{
                type: 'return_to_hand',
                target: { type: 'self' }
            }],
            limitation: 'once_per_turn',
            rawText: text
        } as any);
        return true;
    }

    // =================================================================
    // BATCH 13: Conditional Effects & Special Triggers
    // =================================================================

    // Put card from hand into inkwell
    // "⟳ — put any card from your hand into your inkwell facedown"
    if (effectText.match(/^put any card from your hand into your inkwell facedown/i)) {
        effects.push({
            type: 'ink_from_hand',
            amount: 1,
            chooser: 'self'
        });
    }

    // Look at top X, rearrange (put one on top, other on bottom)
    // "⟳ — look at the top 2 cards of your deck. put one on the top of your deck and the other on the bottom"
    const lookRearrangeMatch = effectText.match(/^look at the top (\d+) cards? (?:of your deck)?\.? put one on the top(?: of your deck)? and the other on the bottom/i);
    if (lookRearrangeMatch) {
        effects.push({
            type: 'scry',
            count: parseInt(lookRearrangeMatch[1]),
            action: 'one_top_one_bottom'
        });
    }

    // Ready + can't quest combo (activated version)
    // "⟳, 3 ⬡ — ready chosen character. they can't quest for the rest of this turn"
    if (effectText.match(/^ready chosen character\. they can't quest for the rest of this turn/i)) {
        effects.push({
            type: 'ready',
            target: { type: 'chosen_character' }
        });
        effects.push({
            type: 'restriction',
            restriction: 'cant_quest',
            target: { type: 'affected_characters' },
            duration: 'this_turn'
        });
    }

    // Can't challenge restriction
    // "banish this item — chosen character can't challenge during their next turn"
    if (effectText.match(/^chosen character can't challenge during their next turn/i)) {
        effects.push({
            type: 'restriction',
            restriction: 'cant_challenge',
            target: { type: 'chosen_character' },
            duration: 'next_turn'
        });
    }

    // =================================================================
    // BATCH 11: Temporary effects and cost reduction
    // =================================================================

    // Temporary Keyword Grant
    // "⟳ — chosen character gains rush this turn."
    // "⟳, 1 ⬡ — chosen character gains rush this turn."
    const tempKeywordMatch = text.match(/⟳(?:,\s*(\d+)\s*⬡)?\s*—\s*chosen character gains (rush|reckless|support|challenger \+(\d+)|resist \+(\d+)) (?:this turn|during their next turn)/i);
    if (tempKeywordMatch) {
        const inkCost = tempKeywordMatch[1] ? parseInt(tempKeywordMatch[1]) : undefined;
        const keyword = tempKeywordMatch[2].toLowerCase();
        const duration = text.includes('next turn') ? 'next_turn' : 'this_turn';

        const effect: any = {
            type: 'grant_keyword',
            keyword: keyword.includes('+') ? keyword.split(' ')[0] : keyword,
            target: { type: 'chosen_character' },
            duration
        };

        // Extract bonus if present
        if (tempKeywordMatch[3]) effect.amount = parseInt(tempKeywordMatch[3]);
        if (tempKeywordMatch[4]) effect.amount = parseInt(tempKeywordMatch[4]);

        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            cost: { exert: true, ink: inkCost },
            effects: [effect],
            rawText: text
        } as any);
        return true;
    }

    // Temporary Stat Buff
    // "⟳ — chosen character gets +1 ◊ this turn."
    const tempStatMatch = text.match(/⟳(?:,\s*(\d+)\s*⬡)?\s*—\s*chosen character gets ([+-])(\d+) (strength|willpower|lore|¤|🛡️|⛉|◊|⬡) this turn/i);
    if (tempStatMatch) {
        const inkCost = tempStatMatch[1] ? parseInt(tempStatMatch[1]) : undefined;
        const sign = tempStatMatch[2];
        const amount = parseInt(tempStatMatch[3]) * (sign === '-' ? -1 : 1);
        let stat = 'strength';
        const symbol = tempStatMatch[4].toLowerCase();
        if (['willpower', '🛡️', '⛉'].includes(symbol)) stat = 'willpower';
        if (['lore', '◊', '⬡'].includes(symbol)) stat = 'lore';

        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            cost: { exert: true, ink: inkCost },
            effects: [{
                type: 'modify_stats',
                stat,
                amount,
                target: { type: 'chosen_character' },
                duration: '  this_turn'
            }],
            rawText: text
        } as any);
        return true;
    }

    // Cost Reduction
    // "⟳ — you pay 1 ⬡ less for the next character you play this turn."
    const costRedMatch = text.match(/⟳\s*—\s*you pay (\d+) ⬡ less for the next (character|action|item) you play this turn/i);
    if (costRedMatch) {
        const amount = parseInt(costRedMatch[1]);
        const cardType = costRedMatch[2].toLowerCase();

        abilities.push({
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            cost: { exert: true },
            effects: [{
                type: 'cost_reduction',
                amount,
                target: {
                    type: 'next_card_played',
                    filter: { cardType }
                },
                duration: 'next_card'
            }],
            rawText: text
        } as any);
        return true;
    }

    // BATCH 16-17: More Common Patterns

    // Gain lore (simple)
    // "⟳, 1 ⬡ — gain 1 lore"
    const gainLoreMatch = effectText.match(/^gain (\d+) lore\.?$/i);
    if (gainLoreMatch) {
        effects.push({
            type: 'gain_lore',
            amount: parseInt(gainLoreMatch[1]),
            target: { type: 'self_player' }
        });
    }

    // Remove all damage
    // "whenever you play a floodborn character, you may remove all damage from chosen character"
    if (effectText.match(/^(?:you may )?remove all damage from chosen character/i)) {
        effects.push({
            type: 'heal',
            amount: 99, // All damage
            target: { type: 'chosen_character' },
            optional: effectText.includes('may')
        });
    }

    // Return card with filter from discard
    // "⟳, 3 ⬡ — return a character card with support from your discard to your hand"
    const returnFilterMatch = effectText.match(/^return (?:a|an) (character|action|item) card with (.+?) from your discard to your hand/i);
    if (returnFilterMatch) {
        effects.push({
            type: 'return_from_discard',
            target: {
                type: 'card_from_discard',
                cardType: returnFilterMatch[1],
                keyword: returnFilterMatch[2]
            }
        });
    }

    // Choose and discard with effect
    // "⟳, choose and discard a character card — gain lore equal to the discarded character's ◊"
    if (effectText.match(/^choose and discard a character card — gain lore equal to/i)) {
        effects.push({
            type: 'discard_for_lore',
            target: { type: 'character_from_hand' }
        });
    }

    // Remove damage from up to X characters
    // "⟳ — remove 1 damage each from up to 2 chosen characters"
    const removeMultiMatch = effectText.match(/^remove (\d+) damage each from up to (\d+) chosen characters/i);
    if (removeMultiMatch) {
        effects.push({
            type: 'heal',
            amount: parseInt(removeMultiMatch[1]),
            count: parseInt(removeMultiMatch[2]),
            target: { type: 'chosen_characters' }
        });
    }

    // 20. Conditional Gain Lore (Sleepy's Flute)
    // "If you played a song this turn, gain 1 lore."
    if (effectText.match(/^if you played a song this turn, gain (\d+) lore/i)) {
        const match = effectText.match(/^if you played a song this turn, gain (\d+) lore/i);
        effects.push({
            type: 'gain_lore',
            amount: parseInt(match![1]),
            target: { type: 'self_player' }
        });
        // Add condition to the ability itself, not the effect, or handle it in the effect?
        // The parser structure puts conditions on the ability usually for static/triggered.
        // For activated, we might need a 'condition' field on the ability definition.
        // Let's modify the return structure in a moment if needed, but for now let's attach it to the ability if possible.
        // Actually, parseActivated returns boolean and modifies 'abilities' array.
        // We need to find the ability we are building.
        // Wait, 'effects' is an array we are building.
        // We can add a special property to the effect or handle it at the end.
    }

    // Pongo - Old Rascal: Conditional Damage Replacement
    // "deal 2 damage to chosen character. If you have a character named Perdita in play, you may deal 4 damage instead."
    const pongoMatch = effectText.match(/^deal (\d+) damage to chosen (?:opposing )?character\. if you have a character named (.+) in play, (?:you may )?deal (\d+) damage instead/i);
    if (pongoMatch) {
        const baseDamage = parseInt(pongoMatch[1]);
        const requiredName = pongoMatch[2];
        const replacementDamage = parseInt(pongoMatch[3]);

        effects.push({
            type: 'conditional_action',
            base_action: {
                type: 'damage',
                amount: baseDamage,
                target: { type: 'chosen_character' }
            },
            condition: {
                type: 'presence',
                filter: { name: requiredName }
            },
            replacement_action: {
                type: 'damage',
                amount: replacementDamage,
                target: { type: 'chosen_character' } // Re-targets same chosen
            }
        });
    }

    // 21. Conditional Replacement (Poisoned Apple)
    // "Exert chosen character. If a Princess character is chosen, banish her instead."
    if (effectText.match(/exert chosen character\. if a (.+) character is chosen, banish (?:her|him|them|it) instead/i)) {
        const match = effectText.match(/exert chosen character\. if a (.+) character is chosen, banish (?:her|him|them|it) instead/i);
        effects.push({
            type: 'conditional_action',
            base_action: {
                type: 'exert',
                target: { type: 'chosen_character' }
            },
            condition: {
                type: 'target_has_subtype',
                subtype: match![1]
            },
            replacement_action: {
                type: 'banish',
                target: { type: 'chosen_character' } // Re-targets the same chosen character
            }
        });
    }

    // Fallback to static effects parser
    // ONLY if we have costs (explicit activated ability) OR it's an Action card (implicit activated/triggered)
    // Otherwise, let the Static Parser handle it (e.g. "Your characters have Ward")
    if (effects.length === 0 && (costs.length > 0 || card.type === 'Action')) {
        // Guard against Triggered abilities being parsed
        if (text.match(/^(When|Whenever|At the)/i)) {
            return false;
        }

        // 5. Parse Effects
        // const effectText = parts[1].trim(); // effectText is already defined earlier
        // const effects: any[] = []; // effects is already defined earlier

        // Check for conditional effects (Batch 13: Beast's Mirror)
        // "if you have no cards in your hand, draw a card"
        const ifNoCardsMatch = effectText.match(/^if you have no cards in your hand, (.+)/i);
        if (ifNoCardsMatch) {
            const subEffectText = ifNoCardsMatch[1];
            const subEffects = parseStaticEffects(subEffectText);

            if (subEffects.length > 0) {
                effects.push({
                    type: 'conditional',
                    condition: { type: 'hand_empty' },
                    then: subEffects[0] // Assuming single effect for now
                });
            }
        } else {
            // console.log(`[ACTIVATED] Fallback for: "${text}"`);
            const staticEffects = parseStaticEffects(effectText);
            // console.log(`[ACTIVATED] Static Effects found: ${staticEffects.length}`);

            // FILTER: If all parsed effects are purely static (cost reduction, keyword granting),
            // return false so the main loop can continue to parseStatic.
            const isPurelyStatic = staticEffects.every(e =>
                ['cost_reduction', 'move_cost_reduction', 'grant_classification', 'grant_keyword', 'restrict_movement'].includes(e.type)
            );

            if (staticEffects.length > 0 && isPurelyStatic) {
                // console.log(`[ACTIVATED] Rejected fallback - Purely static effects detected.`);
                return false;
            }

            staticEffects.forEach(e => effects.push(e));
        }
        // Remove damage (Cleansing Rainwater)
        const removeMatch = effectText.match(/^remove up to (\d+) damage/i);
        if (removeMatch) {
            const amount = parseInt(removeMatch[1]);
            const target: any = { type: 'chosen' };
            if (effectText.match(/from each of your characters/i)) {
                target.type = 'all_characters';
                target.owner = 'self';
            } else if (effectText.match(/from chosen character/i)) {
                target.type = 'chosen_character';
            } else if (effectText.match(/from chosen location/i)) {
                target.type = 'chosen_location';
            }
            effects.push({
                type: 'heal',
                amount,
                target
            });
        }

        // Return chosen character to hand, then that player discards (Bruno)
        // "Return chosen character to their player's hand, then that player discards a card at random."
        // Using flexible regex for "player's hand"
        const brunoMatch = effectText.match(/return chosen character to (?:their )?player's hand, then that player discards a card at random/i);
        if (brunoMatch) {
            effects.push({
                type: 'return_to_hand',
                target: { type: 'chosen_character' }
            });
            effects.push({
                type: 'opponent_discard_random', // Need to ensure this effect type exists or map it
                amount: 1,
                target: { type: 'player', filter: { owner_of_target: true } } // Special target: 'owner of previous target'
            });
            // For now, mapping to 'discard' with special property might be better if effect type is strict
            // But let's assume 'discard' effect with specific target logic
            // Actually, simplest is:
            // 1. return_to_hand
            // 2. discard
            // But target logic is tricky ("that player").
            // We'll leave it as is and see if test passes.
        }
        const returnAllMatch = effectText.match(/return all opposing (.+?) characters to their players' hands/i);
        if (returnAllMatch) {
            const filterText = returnAllMatch[1];
            const target: any = { type: 'all_opposing_characters' };
            if (filterText.includes('exerted')) target.filter = { exerted: true };

            effects.push({
                type: 'return_to_hand',
                target
            });
        }

        // Banish all opposing characters (Tsunami)
        if (effectText.match(/banish all opposing characters/i)) {
            effects.push({
                type: 'banish',
                target: { type: 'all_opposing_characters' }
            });
        }

        // Banish all opposing items/locations (Riptide)
        const banishAllMatch = effectText.match(/banish all opposing (.+)/i);
        if (banishAllMatch) {
            const what = banishAllMatch[1];
            if (what.includes('characters, items, and locations')) {
                effects.push({
                    type: 'banish',
                    target: { type: 'all_opponents_cards', filter: { cost: 2, operator: 'lte' } } // Hardcoded for Riptide for now or parse cost from "with cost 2 or less"
                });
                // Actually, let's parse the cost constraint properly
                const costMatch = what.match(/with cost (\d+) or less/i);
                if (costMatch) {
                    effects[effects.length - 1].target.filter = { cost: parseInt(costMatch[1]), operator: 'lte' };
                    if (what.includes('characters')) effects[effects.length - 1].target.includeCharacters = true;
                    if (what.includes('items')) effects[effects.length - 1].target.includeItems = true;
                    if (what.includes('locations')) effects[effects.length - 1].target.includeLocations = true;
                }
            }
        }

        // Be King Undisputed: "Each opponent chooses and banishes one of their characters."
        if (effectText.match(/each opponent chooses and banishes one of their characters/i)) {
            effects.push({
                type: 'banish',
                target: { type: 'opponent_chosen_character', count: 1 }
            });
        }

        // Lost in the Woods: "All opposing characters get -2 strength until the start of your next turn."
        const massDebuffMatch = effectText.match(/all opposing characters get ([+\-]\d+) (strength|willpower|lore|¤|🛡️|⛉|◊|⬡) until the start of your (?:next )?turn/i);
        if (massDebuffMatch) {
            const amount = parseInt(massDebuffMatch[1]);
            const stat = parseStat(massDebuffMatch[2]);
            effects.push({
                type: 'modify_stats',
                target: { type: 'all_opposing_characters' },
                modifiers: { [stat]: amount },
                duration: 'start_of_turn' // Simplified mapping
            });
        }

        // Look for move damage
        const moveDamageMatch = effectText.match(/^move (\d+) damage from (.+) to (.+)/i);
        if (moveDamageMatch) {
            const amount = parseInt(moveDamageMatch[1]);
            const source = moveDamageMatch[2];
            const destination = moveDamageMatch[3];

            effects.push({
                type: 'move_damage',
                amount,
                from: { type: 'chosen_character' }, // simplistic; would need parsing
                to: { type: 'chosen_opposing_character' } // simplistic
            });
        }

        // PHASE 1: Play from hand or discard (Prince John - Gold Lover)
        if (effectText.match(/play (?:a|an) (?:character|item|action).*from your (?:hand or discard|discard)/i)) {
            log(`      [ACTIVATED] Matched play from hand/discard pattern, calling helper with effectText: "${effectText}"`);
            return parsePlayFromDiscardAction(effectText, card, abilities);
        }

        // Return from Discard (Pooh Pirate Ship)
        // "Return a Pirate character card from your discard to your hand."

        // Banish chosen character who challenged this turn (Be King Undisputed)
        const banishChallengerMatch = effectText.match(/banish chosen character who challenged this turn/i);
        if (banishChallengerMatch) {
            effects.push({
                type: 'banish',
                target: {
                    type: 'chosen_character',
                    filter: { challenged_this_turn: true }
                }
            });
        }

        // Place all opposing characters into inkwell (Under the Sea)
        const inkwellMatch = effectText.match(/place all opposing characters into their player's inkwell facedown and exerted/i);
        if (inkwellMatch) {
            effects.push({
                type: 'put_into_inkwell',
                target: { type: 'all_opposing_characters' },
                facedown: true,
                exerted: true
            });
        }
        const returnDiscardMatch = effectText.match(/return (?:an? )?(?:(.+) )?(character|item|action|song) card (?:named (.+?) )?from your discard to your hand/i);
        if (returnDiscardMatch) {
            const cardType = returnDiscardMatch[2].toLowerCase();
            let subtype: string | undefined = undefined;

            if (returnDiscardMatch[1]) {
                subtype = returnDiscardMatch[1].trim().toLowerCase();
            }

            effects.push({
                type: 'return_from_discard',
                target: {
                    type: 'specific_card',
                    cardType: cardType,
                    subtype
                }
            });
        }


    }

    if (effects.length > 0) {
        // Legacy cost object conversion removed to avoid duplication


        const ability: any = {
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'activated',
            costs,
            effects,
            rawText: text
        };

        // Handle Sleepy's Flute condition
        if (effectText.match(/^if you played a song this turn/i)) {
            ability.condition = { type: 'played_song_this_turn' };
        }

        abilities.push(ability);
        return true;
    }

    return false;
}
