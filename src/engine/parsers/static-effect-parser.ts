import { parseDuration, parseStat, parseStatModification, parseTargetFilter, parseCardType, parseTarget } from './pattern-matchers';
import { StaticAbility } from './parser-utils';

export function parseStaticEffects(text: string): any[] {
    const effects: any[] = [];

    // Lilo - Causing an Uproar: "During your turn, if you've played 3 or more actions this turn, you may play this character for free."
    const playFreeActionCountMatch = text.match(/^during your turn, if you've played (\d+) or more actions this turn, you may play this character for free/i);
    if (playFreeActionCountMatch) {
        return [{
            type: 'cost_set', // Use cost_set or cost_reduction 'free'
            amount: 0, // Free = 0 cost
            condition: {
                type: 'played_actions_count',
                amount: parseInt(playFreeActionCountMatch[1]), // 3
                operator: 'gte'
            }
        }];
    }

    // Generic "While this character is exerted, [Effect]" (Genie - Of the Lamp)
    const whileExertedGenericMatch = text.match(/^while this character is exerted, (.+)/i);
    if (whileExertedGenericMatch) {
        let innerText = whileExertedGenericMatch[1];
        // Normalize "your other characters get +2 ¤" is fine.
        const innerEffects = parseStaticEffects(innerText);
        if (innerEffects.length > 0) {
            effects.push(...innerEffects.map(e => ({
                ...e,
                condition: { type: 'self_exerted' }
            })));
            return effects;
        }
    }

    // Galactic Council Chamber: "While you have an Alien or Robot character here, this location can't be challenged."
    const cantBeChallengedHereMatch = text.match(/^while you have an? (.+) character here, this location can't be challenged/i);

    if (cantBeChallengedHereMatch) {
        const types = cantBeChallengedHereMatch[1].split(' or ').map(t => t.trim());
        effects.push({
            type: 'restriction',
            restriction: 'cant_be_challenged',
            condition: {
                type: 'characters_at_location',
                subtypes: types,
                count: 1,
                comparison: 'gte'
            },
            target: { type: 'self' }
        });
        return effects;
    }

    // PHASE 4: Classification Grant (Chief Bogo - Deputize)
    // "Your other characters gain the Detective classification."
    // Relaxed regex: specific enough but simple - priority over generic keyword parsing
    const gainClassificationMatch = text.match(/gain (?:the )?(.+) classification/i);
    if (gainClassificationMatch) {
        const subtype = gainClassificationMatch[1].trim();
        effects.push({
            type: 'grant_classification',
            classification: subtype,
            target: { type: 'all_characters', filter: { mine: true, other: true } }
        });
        return effects;
    }

    if (!text) return effects;

    // DEBUG: Trace text for Phase 4 debugging
    if (text.includes('Dragon characters') || text.includes('Support') || text.includes('next item')) {
    }

    // Atlantica - Concert Hall: "Characters count as having +2 cost to sing songs while here."
    if (text.match(/^characters count as having ([+\-]\d+) cost to sing songs while here/i)) {
        const match = text.match(/([+\-]\d+)/);
        const costMod = parseInt(match![1]);
        effects.push({
            type: 'cost_modification',
            amount: costMod,
            target: { type: 'characters_at_location' },
            condition: { type: 'singing_song' }
        });
        return effects;
    }

    // Ursula's Plan: "Each opponent chooses and exerts one of their characters. Those characters can't ready at the start of their next turn."
    if (text.match(/^each opponent chooses and exerts one of their characters\. those characters can't ready at the start of their next turn/i)) {
        effects.push(
            {
                type: 'opponent_chooses_and_exerts',
                target: { type: 'each_opponent' }
            },
            {
                type: 'cant_ready',
                target: { type: 'exerted_characters' },
                duration: 'next_turn_start'
            }
        );
        return effects;
    }

    // Ursula's Contract: "Opposing players can't use battleground abilities."
    if (text.match(/^opposing players can't use battleground abilities/i)) {
        effects.push({
            type: 'cant_use_battleground_abilities',
            target: { type: 'opposing_players' }
        });
        return effects;
    }

    // Koda: "During opponents' turns, you can't lose lore."
    if (text.match(/^during opponents'? turns?, you can't lose lore/i)) {
        effects.push({
            type: 'cant_lose_lore',
            condition: { type: 'during_opponents_turns' }
        });
        return effects;
    }

    // Fix-It Felix Jr: "Your locations get +2 ⛉."
    const locationBuffMatch = text.match(/^your locations get ([+\-]\d+) (⛉|willpower)/i);
    if (locationBuffMatch) {
        const amount = parseInt(locationBuffMatch[1]);
        effects.push({
            type: 'stat_modification',
            stat: 'willpower',
            amount,
            target: { type: 'your_locations' }
        });
        return effects;
    }

    // Pride Lands: "While you have 3 or more characters here, you may banish this location to play a character from your discard for free."
    const prideLandsMatch = text.match(/^while you have (\d+) or more characters here, you may banish this location to play a character from your discard for free/i);
    if (prideLandsMatch) {
        const threshold = parseInt(prideLandsMatch[1]);
        effects.push({
            type: 'conditional_activated_ability',
            condition: { type: 'characters_at_location', count: threshold, comparison: 'gte' },
            activation: {
                cost: { type: 'banish_self' },
                effect: {
                    type: 'play_from_discard',
                    target: { type: 'character' },
                    free: true
                }
            }
        });
        return effects;
    }

    // Seeking the Half Crown: "For each Sorcerer character you have in play, you pay 1 ⬡ less to play this action."
    // Tramp: "For each character you have in play, you pay 1 ⬡ less to play this character."
    // Sheriff: "For each item you have in play, you pay 1 ⬡ less to play this character."
    const forEachCostReductionMatch = text.match(/^for each (.+?) (?:character )?you have in play, you pay (\d+) [⬡\u2b21] less to play this (?:card|action|character)/i);
    // Kristoff - Reindeer Keeper: "For each song card in your discard, you pay 1 ⬡ less to play this character."
    const forEachDiscardCostReductionMatch = text.match(/^for each (.+?) card in your discard, you pay (\d+) [⬡\u2b21] less to play this (?:card|action|character)/i);

    if (forEachCostReductionMatch) {
        const classification = forEachCostReductionMatch[1];
        const reduction = parseInt(forEachCostReductionMatch[2]);
        effects.push({
            type: 'cost_reduction_per_character',
            reductionPerCharacter: reduction,
            filter: { classification },
            appliesTo: 'self'
        });
        return effects;
    }

    if (forEachDiscardCostReductionMatch) {
        const classification = forEachDiscardCostReductionMatch[1];
        const reduction = parseInt(forEachDiscardCostReductionMatch[2]);
        effects.push({
            type: 'cost_reduction_per_card', // New type
            reductionPerCard: reduction,
            filter: { classification },
            location: 'discard',
            appliesTo: 'self'
        });
        return effects;
    }

    // Aladdin: "While this character is exerted, your Ally characters get +1 ¤."
    const whileExertedBuffMatch = text.match(/^while this character is exerted, your (.+?) characters get ([+\-]\d+) ([¤◊⛉])/i);
    if (whileExertedBuffMatch) {
        const classification = whileExertedBuffMatch[1];
        const amount = parseInt(whileExertedBuffMatch[2]);
        const statSymbol = whileExertedBuffMatch[3];
        const stat = statSymbol === '¤' ? 'strength' : statSymbol === '◊' ? 'lore' : 'willpower';
        effects.push({
            type: 'conditional_stat_modification',
            condition: { type: 'self_exerted' },
            stat,
            amount,
            target: { type: 'your_characters', filter: { classification } }
        });
        return effects;
    }

    // Gantu: "Each player pays 2 ⬡ more to play actions or items. (This doesn't apply to singing songs.)"
    const costIncreaseMatch = text.match(/^each player pays (\d+) [\u2b21\u2b21] more to play (.+?)(?:\. \(this (?:doesn't|does not) apply to singing songs\.\))?[.]?$/i);
    if (costIncreaseMatch) {
        const increase = parseInt(costIncreaseMatch[1]);
        const cardTypes = costIncreaseMatch[2].split(/ or | and /).map(t => t.trim());
        effects.push({
            type: 'cost_increase',
            amount: increase,
            cardTypes,
            target: { type: 'all_players' },
            excludes: ['singing']
        });
        return effects;
    }

    // Jiminy Cricket: "While this character is exerted, opposing characters with Rush enter play exerted."
    if (text.match(/^while this character is exerted, opposing characters with rush enter play exerted/i)) {
        effects.push({
            type: 'enter_play_exerted',
            target: {
                type: 'opposing_characters',
                filter: { keyword: 'Rush' }
            },
            condition: { type: 'self_exerted' }
        });
        return effects;
    }


    // Glass Slipper: "You may only have 2 copies of The Glass Slipper in your deck."
    const deckLimitMatch = text.match(/^you may only have (\d+) copies of (.+?) in your deck/i);
    if (deckLimitMatch) {
        const limit = parseInt(deckLimitMatch[1]);
        const cardName = deckLimitMatch[2];
        effects.push({
            type: 'deck_limit',
            limit,
            cardName
        });
        return effects;
    }

    // Louie: "While this character is being challenged, the challenging character gets -1 ¤."
    const whileBeingChallengedMatch = text.match(/^while this character is being challenged, the challenging character gets ([+\-]\d+) ([¤◊⛉])/i);
    if (whileBeingChallengedMatch) {
        const amount = parseInt(whileBeingChallengedMatch[1]);
        const statSymbol = whileBeingChallengedMatch[2];
        const stat = statSymbol === '¤' ? 'strength' : statSymbol === '◊' ? 'lore' : 'willpower';
        effects.push({
            type: 'conditional_stat_modification',
            condition: { type: 'self_being_challenged' },
            stat,
            amount,
            target: { type: 'challenging_character' }
        });
        return effects;
    }

    // Hidden Inkcaster: "All cards in your hand count as having ◉."
    if (text.match(/^all cards in your hand count as having [◉⬡◊]/i)) {
        effects.push({
            type: 'grant_inkwell',
            target: { type: 'cards_in_hand', filter: { mine: true } }
        });
        return effects;
    }

    // Li Shang: "Your characters with 4 ¤ or more get +1 ◊."
    const statBuffMatch = text.match(/^your characters with (\d+) ([¤🛡️⛉◊]) or more get ([+\-]\d+) ([¤🛡️⛉◊])/i);
    if (statBuffMatch) {
        const minStat = parseInt(statBuffMatch[1]);
        const conditionStat = statBuffMatch[2];
        const buffAmount = parseInt(statBuffMatch[3]);
        const buffStat = statBuffMatch[4];

        effects.push({
            type: 'stat_modification',
            stat: buffStat === '◊' ? 'lore' : buffStat === '¤' ? 'strength' : 'willpower',
            amount: buffAmount,
            target: {
                type: 'your_characters',
                filter: { minStat, stat: conditionStat === '¤' ? 'strength' : conditionStat === '◊' ? 'lore' : 'willpower' }
            }
        });
        return effects;
    }

    // Baloo - Carefree Bear: "Each player draws a card."
    if (text.match(/^each player draws a card/i)) {
        effects.push({
            type: 'draw',
            amount: 1,
            target: { type: 'all_players' }
        });
        return effects;
    }

    // Baloo - Carefree Bear: "Each player chooses and discards a card."
    if (text.match(/^each player chooses and discards a card/i)) {
        effects.push({
            type: 'discard',
            amount: 1,
            target: { type: 'all_players' }
        });
        return effects;
    }


    // Triton - Young Prince: "Characters named Ursula get -2 ☼."
    const namedCharStatBuffMatch = text.match(/^characters named (.+) get ([+\-]\d+) ([^\s.]+)/i);
    if (namedCharStatBuffMatch) {
        const name = namedCharStatBuffMatch[1];
        const amount = parseInt(namedCharStatBuffMatch[2]);
        const statSymbol = namedCharStatBuffMatch[3];
        // ☼ seems to be used for Strength in this specific batch/card text
        const stat = (statSymbol === '¤' || statSymbol === '☼') ? 'strength'
            : (statSymbol === '◊') ? 'lore'
                : 'willpower';

        effects.push({
            type: 'stat_modification',
            stat,
            amount,
            target: {
                type: 'all_characters',
                filter: { name }
            }
        });
        return effects;
    }

    // King's Sensor Core: "Your Prince and King characters gain Resist +1."
    const yourCharactersGainMatch = text.match(/^your (.+?) characters gain (.+?)(?: \(.+\))?\.?$/i);
    if (yourCharactersGainMatch) {
        const filterText = yourCharactersGainMatch[1];
        const effectText = yourCharactersGainMatch[2];

        let subtypes: string[] = [];
        const filter: any = {};

        if (filterText.includes(' and ')) {
            subtypes = filterText.split(' and ').map(s => s.trim());
        } else {
            subtypes = [filterText.trim()];
        }

        // Handle "other" special keyword
        const lowerSubtypes = subtypes.map(s => s.toLowerCase());
        if (lowerSubtypes.includes('other')) {
            filter.other = true;
            // Remove 'other' from subtypes (case insensitive)
            subtypes = subtypes.filter(s => s.toLowerCase() !== 'other');
        }

        if (subtypes.length > 0) {
            filter.subtypes = subtypes;
        }

        // Parse keyword/amount
        // "Resist +1" -> keyword: Resist, amount: 1
        let keyword = effectText;
        let amount = 1;

        const amountMatch = effectText.match(/(.+) ([+-]\d+)/);
        if (amountMatch) {
            keyword = amountMatch[1].trim();
            amount = parseInt(amountMatch[2]);
        }

        effects.push({
            type: 'grant_keyword',
            keyword,
            amount,
            target: {
                type: 'your_characters',
                filter
            }
        });
        return effects;
    }

    // Early exit for special cases
    // 0. Split compound effects (e.g. "Effect 1. Effect 2.")by periods and parse each separately
    // "ready this character. this character can't quest for the rest of this turn" -> ["ready this character", "this character can't quest for the rest of this turn"]
    // Remove terminal period first, then split
    const cleanText = text.replace(/\.\s*$/, ''); // Remove trailing period
    const sentences = cleanText.split(/\.\s+/).filter(s => s.trim().length > 0);
    if (sentences.length > 1) {
        // Multiple sentences - parse each recursively
        for (const sentence of sentences) {
            const sentenceEffects = parseStaticEffects(sentence.trim());
            effects.push(...sentenceEffects);
        }
        if (effects.length > 0) {
            return effects;
        }

        // Choose and discard
        if (/choose\s+(?:and\s+)?discard\s+(?:a\s+)?card/i.test(text)) {
            return [{
                type: 'choose_and_discard',
                amount: 1
            }];
        }

        // If splitting didn't help, continue with original text
    }

    // SPLIT: Handle "Then" and "If you do" sequences
    const splitRegex = /(,?\s+then\s+|\.\s+if you do, |^if you do, )/i;
    const parts = text.split(splitRegex);

    if (parts.length > 1) {
        let nextCondition: string | undefined = undefined;

        for (const part of parts) {
            // Check if part is a delimiter
            if (part.match(splitRegex)) {
                if (part.match(/if you do/i)) {
                    nextCondition = 'if_you_do';
                } else {
                    nextCondition = undefined; // Reset for generic "then"
                }
                continue;
            }

            if (!part.trim()) continue;

            const subEffects = parseStaticEffects(part.trim());
            if (nextCondition) {
                subEffects.forEach(e => e.condition = nextCondition);
            }
            subEffects.forEach(e => effects.push(e));
        }
        return effects;
    }
    if (text.match(/^this (?:item|character) enters play exerted/i)) {
        effects.push({
            type: 'enters_play_exerted',
            target: { type: 'self' }
        });
        return effects;
    }

    // Figaro: Opposing items enter play exerted
    // "Opposing items enter play exerted."
    if (text.match(/^opposing items enter play exerted/i)) {
        effects.push({
            type: 'enters_play_exerted',
            target: { type: 'all_opposing_items' }
        });
        return effects;
    }

    // BATCH 12: Time/State-based Effects
    // "you may put an additional card from your hand into your inkwell facedown"
    if (text.match(/you may put an additional card from your hand into your inkwell facedown/i)) {
        effects.push({
            type: 'additional_ink'
        });
        return effects;
    }

    // BATCH 17: Put top card of deck into inkwell (Anna, Go Go Tomago)
    // "you may put the top card of your deck into your inkwell facedown and exerted"
    if (text.match(/you may put the top card of your deck into your inkwell facedown and exerted/i)) {
        effects.push({
            type: 'mill_to_inkwell',
            amount: 1,
            facedown: true,
            exerted: true,
            optional: true
        });
        return effects;
    }
    // During Your Turn (Global Condition)
    // "During your turn, this character gets +2 strength."
    // "During your turn, this character has Evasive."
    if (text.match(/^during your turn, (.+)/i)) {
        const innerText = text.match(/^during your turn, (.+)/i)![1];
        const innerEffects = parseStaticEffects(innerText);

        return innerEffects.map(effect => ({
            ...effect,
            condition: { type: 'during_your_turn' }
        }));
    }



    // BATCH 45: Opponent choice banish (Tamatoa - Pick One!)
    // "the opposing players together choose an item or location of theirs and banish it"
    const opponentChoiceBanishMatch = text.match(/(?:the )?opposing players together choose (?:and banish )?(?:an|one of) (.+?) (?:of theirs|and banish it|items)/i);
    if (opponentChoiceBanishMatch) {
        const target: any = { type: 'opponent_chosen', mine: false };

        // Parse card types
        const typeText = opponentChoiceBanishMatch[1];
        if (typeText.match(/item or location/i)) {
            target.cardType = ['item', 'location'];
        } else if (typeText.match(/item/i)) {
            target.cardType = 'item';
        } else if (typeText.match(/location/i)) {
            target.cardType = 'location';
        }

        effects.push({
            type: 'opponents_choose_action',
            action: 'banish',
            target,
            chooser: 'opponents_together'
        });
        return effects; // Return early since we've parsed this
    }

    // Handle compound effects: split on "then" and parse each part
    // Special case: "Name a card, then reveal" should be treated as one unit
    // Conditional Scaling (Hades - King of Olympus)
    // "This character gets +1 ◊ for each other Villain character you have in play."
    const conditionalScalingMatch = text.match(/^this character gets \+(\d+) ([◊¤]) for each other (.+?) character(?:s)? you have in play/i);
    if (conditionalScalingMatch) {
        const bonus = parseInt(conditionalScalingMatch[1]);
        const stat = conditionalScalingMatch[2] === '◊' ? 'lore' : 'strength';
        const subtype = conditionalScalingMatch[3];

        effects.push({
            type: 'modify_stats',
            stat,
            amount: { type: 'per_character', subtype: subtype.toLowerCase(), yours: true, other: true },
            multiplier: bonus,
            target: { type: 'self' }
        });
        return effects;
    }

    // White Agony Plains: Location scaling per character here
    // "This location gets +1 ◊ for each character here."
    const locationScalingHereMatch = text.match(/^this location gets \+(\d+) ([◊¤]) for each character here/i);
    if (locationScalingHereMatch) {
        const bonus = parseInt(locationScalingHereMatch[1]);
        const stat = locationScalingHereMatch[2] === '◊' ? 'lore' : 'strength';

        effects.push({
            type: 'modify_stats',
            stat,
            amount: { type: 'per_character_at_location', target: 'self' },
            multiplier: bonus,
            target: { type: 'self' }
        });
        return effects;
    }

    // Can't Sing (Ariel - On Human Legs)
    // "This character can't ⟳ to sing songs."
    if (text.match(/^this character can't ⟳ to sing songs/i)) {
        effects.push({
            type: 'restriction',
            restriction: 'cant_sing'
        });
        return effects;
    }

    // Into the Unknown: "A character with cost 3 or more can ⟳ to sing this song for free."
    const singCostMatch = text.match(/a character with cost (\d+) or more can ⟳ to sing this song for free/i);
    if (singCostMatch) {
        const minCost = parseInt(singCostMatch[1]);
        effects.push({
            type: 'alternate_sing_cost',
            cost: { type: 'exert_character_min_cost', amount: minCost }
        });
        return effects;
    }

    // Pronoun gets (triggered context) - "it gets +2 strength this turn"
    // Must come before the "while" conditional pattern
    const pronounGetsMatch = text.match(/^(?:it|he|she|they) gets? ([+-])(\d+) (strength|willpower|lore|¤|※|🛡️|⛉|⛨|◊|⬡)(?: this turn)?\.?$/i);
    if (pronounGetsMatch) {
        const sign = pronounGetsMatch[1];
        const value = parseInt(pronounGetsMatch[2]);
        const statRaw = pronounGetsMatch[3];
        const amount = sign === '-' ? -value : value;
        const stat = parseStat(statRaw);

        effects.push({
            type: 'modify_stats',
            stat,
            amount,
            target: { type: 'self' },
            duration: text.match(/this turn/i) ? 'this_turn' : undefined
        });
        return effects;
    }

    // Choose and discard
    // "While this character is damaged, it gets +2 strength"
    if (/while (?:this character|he|she) is (damaged|exerted), (?:it|he|she) gets ([+-]\d+) (strength|willpower|lore|¤|◊|⛉)/i.test(text)) {
        const match = text.match(/while (?:this character|he|she) is (damaged|exerted), (?:it|he|she) gets ([+-]\d+) (strength|willpower|lore|¤|◊|⛉)/i);
        if (match) {
            const condition = match[1].toLowerCase();
            const modifier = parseInt(match[2]);
            const statRaw = match[3].toLowerCase();

            const statMap: Record<string, string> = {
                'strength': 'strength', '¤': 'strength',
                'willpower': 'willpower', '◊': 'willpower',
                'lore': 'lore', '⛉': 'lore'
            };

            const stat = statMap[statRaw] || statRaw;

            effects.push({
                type: 'conditional_stat_modifier',
                condition: { type: condition, target: 'self' },
                stat,
                amount: modifier

            });
        }
    }

    // Discard hand (A Whole New World, Shere Khan - Infamous Tiger test data)
    if (text.match(/^discard (?:your )?hand/i)) {
        effects.push({
            type: 'discard_hand',
            target: { type: 'self' }
        });
        return effects;
    }

    // BATCH 17: Hamster Ball - "Chosen character with no damage gains Resist +2 until the start of your next turn."
    // Removed anchor ^ to be safe
    const chosenNoDamageMatch = text.match(/chosen character with no damage gains (.+)(?: until the start of your next turn)?/i);
    if (chosenNoDamageMatch) {
        const keywordText = chosenNoDamageMatch[1];
        const duration = text.match(/until the start of your next turn/i) ? 'until_start_of_next_turn' : 'turn';

        effects.push({
            type: 'grant_keyword',
            keyword: keywordText,
            target: {
                type: 'chosen_character',
                filter: { damaged: false }
            },
            duration
        });
        return effects;
    }

    // BATCH 17: Destructive Misstep - "Banish chosen character with cost 2 or less."
    const banishCostMatch = text.match(/banish chosen character with cost (\d+) or less/i);
    if (banishCostMatch) {
        const maxCost = parseInt(banishCostMatch[1]);
        effects.push({
            type: 'banish',
            target: {
                type: 'chosen_character',
                filter: { costMax: maxCost }
            },
            optional: text.includes('you may')
        });
        return effects;
    }
    if (/choose\s+(?:and\s+)?discard\s+(?:a\s+)?card/i.test(text)) {
        return [{
            type: 'choose_and_discard',
            amount: 1
        }];
    }


    // CAMPAIGN: Jafar Gains Lore
    const jafarLoreMatch = text.match(/Jafar gains (\d+) lore/i);
    if (jafarLoreMatch) {
        effects.push({
            type: 'lore_gain',
            amount: parseInt(jafarLoreMatch[1]),
            target: { type: 'self' }
        });
    }

    // CAMPAIGN: Steal Reforged Crown
    if (text.match(/he steals The Reforged Crown/i)) {
        effects.push({
            type: 'steal_item',
            cardName: 'The Reforged Crown'
        });
    }

    // CAMPAIGN: At the start of Jafar's turn (Banish self to deal damage)
    if (text.match(/At the start of Jafar's turn, he banishes this item to have each Illumineer choose one of their characters and deal 4 damage to them/i)) {
        effects.push({
            type: 'banish_self_for_effect',
            effect: {
                type: 'mixed_damage',
                amount: 4,
                target: { type: 'each_opponent_chooses_own_character' }
            }
        });
    }

    // CAMPAIGN: Jafar's locations can't be challenged
    if (text.match(/Jafar's locations can't be challenged/i)) {
        effects.push({
            type: 'restriction',
            restriction: 'jafars_locations_cant_be_challenged',
            target: { type: 'all_cards', filter: { zone: 'location', owner: 'opponent' } }
        });
    }

    // CAMPAIGN: Illumineers can't use battleground abilities
    if (text.match(/Illumineers can't use battleground abilities/i)) {
        effects.push({
            type: 'restriction',
            restriction: 'cant_use_battleground_abilities'
        });
    }

    // CAMPAIGN: Sand Wave - Bounce exerted
    // "Return all opposing exerted characters to their Illumineers' hands."
    const sandWaveMatch = text.match(/Return all opposing exerted characters to their Illumineers' hands/i);
    // Also "Return this character to your hand" (Kind of Bashful)
    const returnHandMatch = text.match(/return this character to your hand/i);
    if (sandWaveMatch) {
        effects.push({
            type: 'bounce',
            target: { type: 'all_characters', filter: { exerted: true, owner: 'opponent' } }
        });
    } else if (returnHandMatch) {
        effects.push({
            type: 'bounce',
            target: { type: 'self' },
            optional: text.includes('you may')
        });
        return effects;
    }


    // CAMPAIGN: Jafar Actions (Arcane Quake, Sand Wave, Sudden Power)
    // "Jafar exerts all opposing characters. They can't ready at the start of their next turn."
    if (/exerts all opposing characters/i.test(text) && /can't ready/i.test(text)) {
        return [
            { type: 'exert', target: { type: 'all_characters', filter: { opponent: true } } },
            { type: 'cant_ready', target: { type: 'all_characters', filter: { opponent: true } }, duration: 'next_start_turn' }
        ];
    }
    // "Jafar returns all opposing exerted characters to their Illumineers' hands"
    if (/returns all opposing exerted characters/i.test(text)) {
        return [{
            type: 'return_to_hand',
            target: { type: 'all_characters', filter: { opponent: true, status: 'exerted' } }
        }];
    }
    // "Jafar gains X lore"


    // Generic "If X, Y. Otherwise, Z." (Desperate Plan)
    // "If you have no cards in your hand, draw until you have 3 cards in your hand. Otherwise, choose and discard any number of cards, then draw that many cards."
    const ifOtherwiseMatch = text.match(/^if (.+?),\s*(.+?)\.\s*otherwise,\s*(.+)/i);
    if (ifOtherwiseMatch) {
        // This is complex. We need to parse the condition and both branches.
        const conditionText = ifOtherwiseMatch[1];
        const trueBranchText = ifOtherwiseMatch[2];
        const falseBranchText = ifOtherwiseMatch[3];

        // Approximate condition parsing for Desperate Plan
        let condition: any = { type: 'unknown', text: conditionText };
        if (conditionText.match(/you have no cards in your hand/i)) {
            condition = { type: 'hand_size_exact', amount: 0 };
        }

        return [{
            type: 'conditional_else',
            condition,
            trueEffects: parseStaticEffects(trueBranchText),
            falseEffects: parseStaticEffects(falseBranchText)
        }];
    }

    // CAMPAIGN: Disastrous Sandstorm - "Each Illumineer chooses and banishes one of their items or locations."
    const sandstormMatch = text.match(/Each Illumineer chooses and banishes one of their (.+?)(?:$|\.)/i);
    if (sandstormMatch) {
        let cardType = ['item', 'location']; // Default for Sandstorm
        if (sandstormMatch[1].includes('characters')) cardType = ['character']; // Just in case

        effects.push({
            type: 'opponents_choose_action',
            action: 'banish',
            target: { type: 'opponent_chosen', cardType },
            amount: 1
        });
    }


    // CAMPAIGN: Sultan - "each Illumineer chooses and discards a card"
    if (text.match(/each Illumineer chooses and discards a card/i)) {
        effects.push({
            type: 'opponents_choose_action',
            action: 'discard',
            amount: 1
        });
    }

    // CAMPAIGN: Genie - "each Illumineer exerts a character"
    if (text.match(/each Illumineer exerts a character/i)) {
        effects.push({
            type: 'exert',
            target: { type: 'each_opponent_chooses_own_character' }
        });
    }

    // CAMPAIGN: Iago - "put the top card of each Illumineer's deck into their discard"
    if (text.match(/put the top card of each Illumineer's deck into their discard/i)) {
        effects.push({
            type: 'mill',
            amount: 1,
            target: { type: 'all_opponents' }
        });
    }

    // CAMPAIGN: Jafar Spectral Sorcerer - "Jafar's other characters have Evasive"
    const jafarGrantMatch = text.match(/Jafar's other characters have (.+)/i);
    if (jafarGrantMatch) {
        effects.push({
            type: 'grant_keyword',
            keyword: jafarGrantMatch[1],
            target: { type: 'all_characters', filter: { owner: 'self', other: true } } // Jafar is self
        });
    }

    // CAMPAIGN: Monumental Scarab - "they may pay 3 ⬡ each to banish this character"
    const payBanishMatch = text.match(/they may pay (\d+) ⬡ each to banish this character/i);
    if (payBanishMatch) {
        effects.push({
            type: 'ability_grant', // Grant ability to opponents? Or just static effect?
            // "During their turn they may pay..." = Static permission/ability.
            // Let's model it as a static effect that grants an action/ability to opponents.
            ability: 'pay_ink_to_banish',
            cost: parseInt(payBanishMatch[1])
        });
    }

    // CAMPAIGN: Cataclysmic Cyclone
    if (text.match(/Each Illumineer chooses one of their characters, items, or locations/i)) {
        effects.push({
            type: 'global_banish_except_chosen',
            target: { type: 'each_opponent_chooses_one_card_to_keep' }
        });
    }

    // CAMPAIGN: Sand Wave
    if (text.match(/Return all opposing exerted characters to their Illumineers' hands/i)) {
        effects.push({
            type: 'bounce',
            target: { type: 'all_characters', filter: { exerted: true, owner: 'opponent' } }
        });
    }

    // Mushu - Conditional Effect (Top Priority)
    // "if you have 2 or more other Dragon characters in play, gain 2 lore."
    const conditionalEffectMatch = text.match(/^if you have (\d+) or more (?:other )?(.+) characters in play, (.+)/i);
    if (conditionalEffectMatch) {
        // console.log("DEBUG: Mushu matched");
        const count = parseInt(conditionalEffectMatch[1]);
        const subtype = conditionalEffectMatch[2].trim();
        const effectText = conditionalEffectMatch[3];

        const subEffects = parseStaticEffects(effectText);

        subEffects.forEach(effect => {
            effect.condition = {
                type: 'card_count_in_play',
                subtype: subtype.toLowerCase(),
                amount: count,
                operator: '>=',
                other: true
            };
            if (text.includes('other')) effect.condition.other = true;
        });
        effects.push(...subEffects);
        return effects;
    }

    // Cost Reduction - Simple form: "Your {cardType} cost X less"
    // Only matches bare card types without subtypes (Broom, Dragon, etc.)
    // Must come BEFORE complex pattern to match simpler cases first
    const simpleCostReductionMatch = text.match(/^your (characters?|items?|locations?|actions?) cost (\d+) less\.?$/i);
    if (simpleCostReductionMatch) {
        const cardTypeText = simpleCostReductionMatch[1].toLowerCase();
        const amount = parseInt(simpleCostReductionMatch[2]);

        const filter: any = { mine: true };

        if (cardTypeText.includes('character')) {
            filter.cardType = 'character';
        } else if (cardTypeText.includes('location')) {
            filter.cardType = 'location';
        } else if (cardTypeText.includes('item')) {
            filter.cardType = 'item';
        } else if (cardTypeText.includes('action')) {
            filter.cardType = 'action';
        }

        effects.push({
            type: 'cost_reduction',
            amount,
            filter
        });
        return effects;
    }

    // Cost Reduction - Complex form: "You pay X ⬡ less to play {subtype} characters"
    // Handles subtypes (Broom, Dragon, etc.) and "next card" modifiers
    const costReductionMatch = text.match(/^(?:your (.+?) cost|(?:you )?pay) (\d+) ⬡ less (?:to play|for) (.+)/i);
    if (costReductionMatch) {
        const amount = parseInt(costReductionMatch[2]);
        const targetText = costReductionMatch[3].toLowerCase();

        const filter: any = {};
        if (targetText.includes('next')) {
            filter.target = 'next_card';
        }

        if (targetText.includes('character')) {
            filter.cardType = 'character';
            const subtypeMatch = targetText.match(/(.+?) character/i);
            if (subtypeMatch) {
                const subtype = subtypeMatch[1].trim();
                if (subtype !== 'next' && subtype !== 'your') {
                    filter.subtype = subtype;
                }
            }
        } else if (targetText.includes('location')) {
            filter.cardType = 'location';
        } else if (targetText.includes('item')) {
            filter.cardType = 'item';
        } else if (targetText.includes('action')) {
            filter.cardType = 'action';
        }

        effects.push({
            type: 'cost_reduction',
            amount,
            filter
        });
        return effects;
    }

    // Clarabelle - Keyword Synergy Buff
    // "Your other characters with Support get +1 ¤."
    // "Your other characters with Bodyguard get +1 ◊ this turn."
    const keywordSynergyMatch = text.match(/your (?:other )?characters with (.+?) (?:get|gain) ([+-]\d+) (strength|willpower|lore|¤|🛡️|⛉|◊|⬡)(?: this turn)?/i);
    if (keywordSynergyMatch) {
        const keyword = keywordSynergyMatch[1];
        const amount = parseInt(keywordSynergyMatch[2]);
        const symbol = keywordSynergyMatch[3].toLowerCase();
        let stat = 'strength';
        if (['willpower', '🛡️', '⛉'].includes(symbol)) stat = 'willpower';
        if (['lore', '◊', '⬡'].includes(symbol)) stat = 'lore';
        if (['¤'].includes(symbol)) stat = 'strength';

        effects.push({
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
        });
        return effects;
    }

    // Maurice - Return with Cost Filter
    // "you may return an item card with cost 2 or less from your discard to your hand."
    const returnCostMatch = text.match(/you may return (?:a|an) (.+?) card with cost (\d+) or less from your discard to your hand/i);
    if (returnCostMatch) {
        const cardType = returnCostMatch[1].toLowerCase();
        const maxCost = parseInt(returnCostMatch[2]);

        effects.push({
            type: 'move_card',
            source: 'discard',
            destination: 'hand',
            amount: 1,
            optional: true,
            filter: {
                cardType: cardType,
                costMax: maxCost
            }
        });
        return effects;
    }

    // Can't Quest Unless (Bashful, Treasure Guardian)

    // Can't Quest Unless (Bashful, Treasure Guardian)
    // "This character can't quest unless you have another Seven Dwarfs character in play."
    const cantQuestMatch = text.match(/^this character can't quest unless (.+)/i);
    if (cantQuestMatch) {
        const conditionText = cantQuestMatch[1];
        effects.push({
            type: 'restriction',
            restriction: 'cant_quest',
            unless: conditionText
        });
        return effects;
    }

    // PHASE 7C: Dual character name (Flotsam & Jetsam)
    // "This character counts as being named both Flotsam and Jetsam"
    const dualNameMatch = text.match(/^this character counts as being named both (.+?) and (.+)/i);
    if (dualNameMatch) {
        const name1 = dualNameMatch[1].trim();
        const name2 = dualNameMatch[2].trim().replace(/\.$/, '');
        effects.push({
            type: 'dual_name',
            names: [name1, name2],
            target: { type: 'self' }
        });
        return effects;
    }

    // Named Character Buffs (Flotsam/Jetsam)
    // "Your characters named Jetsam gain Rush."
    const namedBuffMatch = text.match(/^your characters? named (.+?) (?:gain|have) (.+)/i);
    if (namedBuffMatch) {
        const name = namedBuffMatch[1];
        const keywordText = namedBuffMatch[2].toLowerCase().replace(/\.$/, '');

        effects.push({
            type: 'grant_keyword',
            keyword: keywordText,
            target: { type: 'named_character', name, mine: true }
        });
        return effects;
    }

    if (text.match(/Name a card, then reveal/i)) {
        text = text.replace(/Name a card, then reveal/i, "Name a card and reveal");
    }

    // Merge "Look at top card. Put it..." to prevent splitting
    if (text.match(/look at the top (?:card )?of your deck\. put it on either the top or the bottom of your deck/i)) {
        text = text.replace(/look at the top (?:card )?of your deck\. put it on either the top or the bottom of your deck/i, "look at the top card of your deck and put it on either the top or the bottom of your deck");
    }

    // Merge "Look at top X cards. Put one on top..." (Handle "in any order" and "1/one")
    if (text.match(/look at the top (\d+) cards of your deck\. put (?:one|1) on the top of your deck and the rest on the bottom(?: in any order)?/i)) {
        text = text.replace(/look at the top (\d+) cards of your deck\. put (?:one|1) on the top of your deck and the rest on the bottom(?: in any order)?/i, "look at the top $1 cards of your deck and put one on the top of your deck and the rest on the bottom");
    }
    // Dr. Facilier - Remarkable Gentleman
    if (text.match(/look at the top (\d+) cards of your deck\. put (?:one|1) on the top of your deck and the other on the bottom(?: in any order)?/i)) {
        text = text.replace(/look at the top (\d+) cards of your deck\. put (?:one|1) on the top of your deck and the other on the bottom(?: in any order)?/i, "look at the top $1 cards of your deck and put one on the top of your deck and the other on the bottom");
    }

    // Merge "Look at top X cards. Put one into your hand..."
    if (text.match(/look at the top (\d+) cards of your deck\. put one into your hand and the rest on the bottom/i)) {
        text = text.replace(/look at the top (\d+) cards of your deck\. put one into your hand and the rest on the bottom/i, "look at the top $1 cards of your deck and put one into your hand and the rest on the bottom");
    }

    // Ursula's Cauldron: Look at top 2, put them back in any order
    if (text.match(/look at the top (\d+) cards of your deck\. put them back on the top of your deck in any order/i)) {
        text = text.replace(/look at the top (\d+) cards of your deck\. put them back on the top of your deck in any order/i, "look at the top $1 cards of your deck and put them back on the top of your deck in any order");
    }

    // BATCH 17: Television Set - Look, Reveal, Hand/Bottom
    // "Look at the top card of your deck. If it's a Puppy character card, you may reveal it and put it into your hand. Otherwise, put it on the bottom of your deck."
    const televisionSetMatch = text.match(/look at the top (?:card|(\d+) cards?) of your deck\. if (.+?), you may reveal (?:it|them) and put (?:it|them) into your hand\. otherwise, put (?:it|them) on the bottom of your deck/i);
    if (televisionSetMatch) {
        const count = televisionSetMatch[1] ? parseInt(televisionSetMatch[1]) : 1;
        const conditionText = televisionSetMatch[2]; // "it's a Puppy character card"

        // Extract subtype from condition text
        let subtype: string | undefined;
        const typeMatch = conditionText.match(/it's a (.+?) character card/i);
        if (typeMatch) {
            subtype = typeMatch[1];
        }

        effects.push({
            type: 'look_reveal_hand_bottom',
            amount: count,
            destination: 'hand',
            restDestination: 'bottom_deck',
            reveal: true,
            optional: true,
            filter: {
                subtype: subtype?.toLowerCase()
            }
        });
        return effects;
    }

    // Merge "Exert... Can't ready..."
    if (text.match(/exert (?:up to )?(\d+) chosen (?:opposing )?characters\. they can't ready at the start of their next turn/i)) {
        text = text.replace(/exert (?:up to )?(\d+) chosen (opposing )?characters\. they can't ready at the start of their next turn/i, "exert up to $1 chosen $2characters and they can't ready at the start of their next turn");
    }



    // Pay Ink to Do Effect (Merryweather)
    // "you may pay 1 ⬡ to give chosen character +2 ¤ this turn"
    const payInkMatch = text.match(/you may pay (\d+) (?:ink|⬡) to (.+)/i);
    if (payInkMatch) {
        const costInk = parseInt(payInkMatch[1]);
        const subEffectText = payInkMatch[2];

        const subEffects = parseStaticEffects(subEffectText);
        if (subEffects.length > 0) {
            effects.push({
                type: 'pay_to_resolve',
                cost: costInk,
                effect: subEffects[0], // Assuming single effect for now
                optional: true
            });
            return effects;
        }
    }

    // While Challenging Location (Olympus Would Be That Way)
    // "Your characters get +3 ¤ while challenging a location this turn."
    const whileChallengingLocation = text.match(/^your characters get \+(\d+) ([◊¤]) while challenging a location(?: this turn)?/i);
    if (whileChallengingLocation) {
        const amount = parseInt(whileChallengingLocation[1]);
        const stat = whileChallengingLocation[2] === '◊' ? 'lore' : 'strength';
        effects.push({
            type: 'modify_stats',
            stat,
            amount,
            target: { type: 'all_characters', filter: { mine: true } },
            condition: { type: 'while_challenging_location' }
        });
        return effects;
    }

    // Donald Duck Ruby: Stat-conditional global buff
    // "Your other Ruby characters with 7 ¤ or more get +1 ◊."
    const statConditionalBuffMatch = text.match(/^your(?: other)? (.+?) characters with (\d+) ([◊¤🛡️⛉]) or more get \+(\d+) ([◊¤🛡️⛉])/i);
    if (statConditionalBuffMatch) {
        const subtypeText = statConditionalBuffMatch[1].trim();
        const minStatValue = parseInt(statConditionalBuffMatch[2]);
        const minStatSymbol = statConditionalBuffMatch[3];
        const buffAmount = parseInt(statConditionalBuffMatch[4]);
        const buffStatSymbol = statConditionalBuffMatch[5];

        // Parse min stat
        let minStat = 'strength';
        if (['🛡️', '⛉'].includes(minStatSymbol)) minStat = 'willpower';
        if (['◊'].includes(minStatSymbol)) minStat = 'lore';
        if (['¤'].includes(minStatSymbol)) minStat = 'strength';

        // Parse buff stat
        let buffStat = 'strength';
        if (['🛡️', '⛉'].includes(buffStatSymbol)) buffStat = 'willpower';
        if (['◊'].includes(buffStatSymbol)) buffStat = 'lore';
        if (['¤'].includes(buffStatSymbol)) buffStat = 'strength';

        const isOther = text.toLowerCase().includes('other');
        const target: any = {
            type: isOther ? 'other_characters' : 'all_characters',
            filter: {
                mine: true,
                subtypes: [subtypeText],
                stat_min: { stat: minStat, value: minStatValue }
            }
        };

        effects.push({
            type: 'modify_stats',
            stat: buffStat,
            amount: buffAmount,
            target
        });
        return effects;
    }

    // Global Character Buffs (Grand Duke, Smee, etc.)
    // "Your characters get +1 ◊."
    // "Your Seven Dwarfs characters get +1 ¤."
    // "Your other Prince, Princess, King, and Queen characters get +1 ¤."
    const globalBuffMatch = text.match(/^your(?: (.+?))? characters get \+(\d+) ([◊¤🛡️⛉])/i);
    if (globalBuffMatch) {
        let subtypeText = globalBuffMatch[1];
        const amount = parseInt(globalBuffMatch[2]);
        const symbol = globalBuffMatch[3].toLowerCase();
        let stat = 'strength';
        if (['🛡️', '⛉'].includes(symbol)) stat = 'willpower';
        if (['lore', '◊'].includes(symbol)) stat = 'lore';
        if (['¤'].includes(symbol)) stat = 'strength';

        let target: any = {
            type: 'all_characters',
            filter: { mine: true }
        };

        if (subtypeText) {
            if (subtypeText.toLowerCase().startsWith('other ')) {
                target.type = 'other_characters';
                subtypeText = subtypeText.substring(6); // Remove "other "
            } else if (subtypeText.toLowerCase() === 'other') {
                target.type = 'other_characters';
                subtypeText = '';
            }

            if (subtypeText) {
                // Split by comma and "and"
                const subtypes = subtypeText.split(/,?\s+(?:and\s+)?/).map(s => s.trim()).filter(s => s);
                if (subtypes.length > 0) {
                    target.filter.subtypes = subtypes;
                }
            }
        }

        effects.push({
            type: 'modify_stats',
            stat,
            amount,
            target
        });
        return effects;
    }

    // Global Keyword Grants (Maurice, Daisy)
    // "Your characters have Evasive."
    // "Your Princess characters have Resist +1."
    const globalKeywordMatch = text.match(/^your(?: (.+?))? characters (?:have|gain) (.+?)(?: this turn)?\.?$/i);
    if (globalKeywordMatch) {
        const subtype = globalKeywordMatch[1]?.trim();
        const keyword = globalKeywordMatch[2].toLowerCase().replace(/\.$/, '');
        const duration = text.match(/this turn/i) ? 'turn' : undefined;

        effects.push({
            type: 'grant_keyword',
            keyword,
            target: {
                type: 'all_characters',
                filter: subtype ? (() => {
                    // Parse multi-subtype: "Prince and King" → ["Prince", "King"]
                    if (subtype.includes(' and ')) {
                        const subtypes = subtype.split(/ and /i).map(s => s.trim());
                        return { subtypes, mine: true };
                    }
                    return { subtype: subtype.toLowerCase(), mine: true };
                })() : { mine: true }
            },
            duration
        });
        return effects;
    }

    // PHASE 7C: Conditional character group keyword grant (Hiro Hamada)
    // "Your Floodborn characters that have a card under them gain Evasive and Ward"
    const conditionalGroupKeywordMatch = text.match(/^your (.+?) characters that have a card under them gain (.+)/i);
    if (conditionalGroupKeywordMatch) {
        const subtype = conditionalGroupKeywordMatch[1].trim();
        const keywordText = conditionalGroupKeywordMatch[2].trim();

        // Parse multiple keywords (e.g., "Evasive and Ward")
        const keywords = keywordText.split(/ and /i).map(k => k.trim().replace(/\.$/, ''));

        keywords.forEach(keyword => {
            effects.push({
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
            });
        });
        return effects;
    }

    // Cost-Based Restrictions (Gantu)
    // Cost Reduction (Lantern, LeFou)
    // "You pay 1 ⬡ less to play your next character this turn."
    // "You pay 1 ⬡ less to play this character."
    const specificCostReductionMatch = text.match(/you pay (\d+) ⬡ less to play (your next character|this character)(?: this turn)?/i);
    if (specificCostReductionMatch) {
        const amount = parseInt(specificCostReductionMatch[1]);
        const targetStr = specificCostReductionMatch[2].toLowerCase();
        const targetType = targetStr === 'this character' ? 'self' : 'next_character';

        effects.push({
            type: 'cost_reduction',
            amount,
            target: { type: targetType },
            duration: text.match(/this turn/i) ? 'turn' : undefined
        });
        return effects;
    }

    // PHASE 7C: Conditional cost reduction for subtype (Gadget Hackwrench)
    // "While you have 3 or more items in play, you pay 1 ⬡ less to play Inventor characters"
    const conditionalSubtypeCostMatch = text.match(/^while you have (\d+) or more (.+?) in play, you pay (\d+) ⬡ less to play (.+?) characters/i);
    if (conditionalSubtypeCostMatch) {
        const conditionAmount = parseInt(conditionalSubtypeCostMatch[1]);
        const conditionCardType = conditionalSubtypeCostMatch[2].toLowerCase();
        const reductionAmount = parseInt(conditionalSubtypeCostMatch[3]);
        const targetSubtype = conditionalSubtypeCostMatch[4].trim();

        effects.push({
            type: 'cost_reduction',
            amount: reductionAmount,
            filter: {
                cardType: 'character',
                subtype: targetSubtype.toLowerCase()
            },
            condition: {
                type: 'card_count_in_play',
                cardType: conditionCardType,
                amount: conditionAmount,
                operator: '>='
            }
        });
        return effects;
    }

    // Characters named X lose Y and can't gain Y (Captain Hook)
    const loseAbilityMatch = text.match(/^characters named (.+) lose (.+) and can't gain \2/i);
    if (loseAbilityMatch) {
        const name = loseAbilityMatch[1];
        const ability = loseAbilityMatch[2];

        effects.push({
            type: 'ability_loss',
            ability: ability.toLowerCase(),
            target: { type: 'all_characters', filter: { name } },
            prevention: true
        });
        return effects;
    }

    // Your other characters named X gain Y (Stabbington Brother)
    const otherNamedGainMatch = text.match(/^your other characters named (.+?) gain (.+)/i);
    if (otherNamedGainMatch) {
        const name = otherNamedGainMatch[1].trim();
        const keywordOrEffect = otherNamedGainMatch[2].trim();

        // Check if it's a keyword
        const keywordMatch = keywordOrEffect.match(/^(rush|evasive|ward|bodyguard|support|reckless|challenger|resist|singer|shift|vanish)/i);
        if (keywordMatch) {
            const keyword = keywordMatch[1];
            const keywordCap = keyword.charAt(0).toUpperCase() + keyword.slice(1);

            effects.push({
                type: 'grant_keyword',
                keyword: keywordCap,
                target: {
                    type: 'all_characters',
                    filter: { name, mine: true, exclude_self: true }
                }
            });
        } else {
            // Complex effect - parse as static effect
            const subEffects = parseStaticEffects(keywordOrEffect);
            subEffects.forEach(effect => {
                effects.push({
                    ...effect,
                    target: {
                        type: 'all_characters',
                        filter: { name, mine: true, exclude_self: true }
                    }
                });
            });
        }
        return effects;
    }

    // "Opposing characters with cost 2 or less can't quest."
    const costRestrictionMatch = text.match(/^opposing characters with cost (\d+) or less can't quest/i);
    if (costRestrictionMatch) {
        const maxCost = parseInt(costRestrictionMatch[1]);
        effects.push({
            type: 'restriction',
            restriction: 'cant_quest',
            target: {
                type: 'all_characters',
                filter: { opponent: true, maxCost }
            }
        });
        return effects;
    }

    // While Challenged (Duke of Weselton)
    // "While challenging, this character gets +2 ¤."
    const whileChallenging = text.match(/^while challenging, this character gets \+(\d+) ([◊¤])/i);
    if (whileChallenging) {
        const amount = parseInt(whileChallenging[1]);
        const stat = whileChallenging[2] === '◊' ? 'lore' : 'strength';
        effects.push({
            type: 'modify_stats',
            stat,
            amount,
            target: { type: 'self' },
            condition: { type: 'while_challenging' }
        });
        return effects;
    }

    // PHASE 7C: While being challenged, grant keyword (Captain Amelia)
    // "While being challenged, your other characters gain Resist +1"
    const whileBeingChallengedGrantMatch = text.match(/^while being challenged, your other characters gain (.+)/i);
    if (whileBeingChallengedGrantMatch) {
        const keyword = whileBeingChallengedGrantMatch[1].trim().replace(/\.$/, '');
        effects.push({
            type: 'grant_keyword',
            keyword,
            target: {
                type: 'other_characters',
                filter: { mine: true }
            },
            condition: { type: 'while_being_challenged' }
        });
        return effects;
    }

    // While Challenging Location (Olympus Would Be That Way)
    // "Your characters get +3 ¤ while challenging a location this turn."






    // While you have a character named X in play (Chief Bogo)
    // "While you have a character named Gazelle in play, this character gains Singer 6."
    const whileNamedMatch = text.match(/^(?:while|if) you have a character named (.+) in play, (.+)/i);
    if (whileNamedMatch) {
        const name = whileNamedMatch[1];
        const effectText = whileNamedMatch[2].replace(/\.$/, ''); // Strip trailing period
        const subEffects = parseStaticEffects(effectText);

        if (subEffects.length > 0) {
            subEffects.forEach(e => {
                e.condition = { type: 'presence', filter: { name } };
            });
            effects.push(...subEffects);
            return effects;
        }
    }

    // While you have an item/location in play (Noi - Orphaned Thief)
    // "While you have an item in play, this character gains Resist +1 and Ward."
    const whileHaveCardMatch = text.match(/^while you have an? (item|location|character) in play, (.+)/i);
    if (whileHaveCardMatch) {
        const cardType = whileHaveCardMatch[1].toLowerCase();
        const effectText = whileHaveCardMatch[2];
        const subEffects = parseStaticEffects(effectText);

        if (subEffects.length > 0) {
            subEffects.forEach(e => {
                e.condition = { type: 'control_card', cardType };
            });
            effects.push(...subEffects);
            return effects;
        }
    }

    // While this character is at a location (Shenzi, Zazu, etc.)
    // "While this character is at a location, she gets +3 ¤."
    const whileAtLocationMatch = text.match(/^while this character is at a location, (?:he|she|they|it) (gets?|gains?) (.+)/i);
    if (whileAtLocationMatch) {
        const effectText = (whileAtLocationMatch[1].startsWith('get') ? 'gets ' : 'gains ') + whileAtLocationMatch[2];
        // We need to construct a valid sentence for the recursive parser
        // "gets +3 ¤" -> "this character gets +3 ¤"
        // "gains Ward" -> "this character gains Ward"
        const fullEffectText = `this character ${effectText} `;
        const subEffects = parseStaticEffects(fullEffectText);

        if (subEffects.length > 0) {
            subEffects.forEach(e => {
                e.condition = { type: 'at_location' };
            });
            effects.push(...subEffects);
            return effects;
        }
    }

    // Location Stat Buffs (Pride Lands, Institute of Technology)
    // "Characters get +2 ⛉ while here."
    // "Inventor characters get +1 ⛉ while here."
    const locationStatBuffMatch = text.match(/^((?:.+?) )?characters get \+(\d+) ([◊¤🛡️⛉]) while here/i);
    if (locationStatBuffMatch) {
        const subtype = locationStatBuffMatch[1] ? locationStatBuffMatch[1].trim() : undefined;
        const amount = parseInt(locationStatBuffMatch[2]);
        const symbol = locationStatBuffMatch[3];
        let stat = 'strength';
        if (['🛡️', '⛉'].includes(symbol)) stat = 'willpower';
        if (['◊'].includes(symbol)) stat = 'lore';
        if (['¤'].includes(symbol)) stat = 'strength';

        const filter: any = { at_this_location: true };
        if (subtype) filter.subtype = subtype;

        effects.push({
            type: 'modify_stats',
            stat,
            amount,
            target: { type: 'all_characters', filter },
            condition: { type: 'while_at_this_location' }
        });
        return effects;
    }

    // PHASE 3: Characters with Keyword get stats (The Great Illuminary)
    // "Characters with Support get +1 ◊ and +2 ⛉ while here."
    const charactersWithKeywordStatsMatch = text.match(/^characters with (.+?) get ([+-]\d+) ([◊¤🛡️⛉])(?: and ([+-]\d+) ([◊¤🛡️⛉]))? while here/i);
    if (charactersWithKeywordStatsMatch) {
        const keyword = charactersWithKeywordStatsMatch[1].trim();
        const amount1 = parseInt(charactersWithKeywordStatsMatch[2]);
        const symbol1 = charactersWithKeywordStatsMatch[3];

        const effectsToPush: any[] = [];

        // Helper to parse symbol to stat
        const getStat = (sym: string) => {
            if (['🛡️', '⛉'].includes(sym)) return 'willpower';
            if (['◊'].includes(sym)) return 'lore';
            if (['¤'].includes(sym)) return 'strength';
            return 'strength';
        };

        effectsToPush.push({
            type: 'modify_stats',
            stat: getStat(symbol1),
            amount: amount1,
            target: {
                type: 'all_characters',
                filter: {
                    at_this_location: true,
                    keywords: [keyword.toLowerCase()]
                }
            },
            condition: { type: 'while_at_this_location' }
        });

        // Handle second stat if present
        if (charactersWithKeywordStatsMatch[4] && charactersWithKeywordStatsMatch[5]) {
            const amount2 = parseInt(charactersWithKeywordStatsMatch[4]);
            const symbol2 = charactersWithKeywordStatsMatch[5];
            effectsToPush.push({
                type: 'modify_stats',
                stat: getStat(symbol2),
                amount: amount2,
                target: {
                    type: 'all_characters',
                    filter: {
                        at_this_location: true,
                        keywords: [keyword.toLowerCase()]
                    }
                },
                condition: { type: 'while_at_this_location' }
            });
        }

        effects.push(...effectsToPush);
        return effects;
    }

    // PHASE 3: Opposing characters with cost X or less can't challenge (Jafar)
    // "Opposing characters with cost 4 or less can't challenge."
    const opposingCostRestrictionMatch = text.match(/^opposing characters with cost (\d+) or less can't challenge/i);
    if (opposingCostRestrictionMatch) {
        const costThreshold = parseInt(opposingCostRestrictionMatch[1]);
        effects.push({
            type: 'restriction',
            restriction: 'cant_challenge',
            target: {
                type: 'all_opposing_characters',
                filter: { cost: costThreshold, costComparison: 'less_or_equal' }
            }
        });
        return effects;
    }

    // Location Keyword Grants (Maui's Place of Exile, etc.)
    // "Characters gain Resist +1 while here."
    // "Characters gain Ward while here."
    const locationKeywordGrantMatch = text.match(/^characters gain (.+?) while here/i);
    if (locationKeywordGrantMatch) {
        const keyword = locationKeywordGrantMatch[1].trim();

        effects.push({
            type: 'grant_keyword',
            keyword,
            target: { type: 'all_characters', filter: { at_this_location: true } },
            condition: { type: 'while_at_this_location' }
        });
        return effects;
    }

    // PHASE 7D: Location keyword grant with reminder (RLS Legacy - Solar Galleon)
    // "Characters gain Evasive while here. (Only characters with Evasive can challenge them.)"
    const locationKeywordWithReminderMatch = text.match(/^characters gain (.+?) while here\.\s*\([^)]+\)/i);
    if (locationKeywordWithReminderMatch) {
        const keyword = locationKeywordWithReminderMatch[1].trim();
        effects.push({
            type: 'grant_keyword',
            keyword,
            target: { type: 'all_characters', filter: { at_this_location: true } },
            condition: { type: 'while_at_this_location' }
        });
        return effects;
    }

    // PHASE 7D: During your turn gains keyword with reminder (Scrooge, Grumpy)
    // "During your turn, this character gains Evasive. (They can challenge characters with Evasive.)"
    const duringTurnGainsReminderMatch = text.match(/^during your turn, this character gains (.+?)\. \([^)]+\)$/i);
    if (duringTurnGainsReminderMatch) {
        const keyword = duringTurnGainsReminderMatch[1].trim();
        effects.push({
            type: 'grant_keyword',
            keyword,
            target: { type: 'self' },
            condition: { type: 'during_your_turn' }
        });
        return effects;
    }

    // PHASE 2B: Your characters named X may move here for free
    // "Your characters named Robin Hood may move here for free."
    // "Your Pirate characters may move here for free." (Jolly Roger)
    const moveHereFreeMatch = text.match(/^your (?:characters named )?(.+?)(?: characters)? may move here for free/i);
    if (moveHereFreeMatch) {
        const filterStr = moveHereFreeMatch[1];
        let filter: any = {};

        // Check if it looks like a subtype (capitalized word, not a full name usually, but "Pirate" vs "Robin Hood")
        // "Pirate" -> Subtype. "Robin Hood" -> Name.
        // Actually, "characters named X" vs "X characters".
        // Regex adjustment:
        // Case 1: "characters named X" matched by first part? No, regex is `your (characters named )?(.+?)( characters)?`.
        // If "characters named " matches, then group 2 is name.
        // If " characters" matches, then group 2 is subtype.

        const isName = text.toLowerCase().includes('characters named');

        if (isName) {
            filter = { name: filterStr };
        } else {
            // Assume subtype if not "named"
            filter = { subtype: filterStr };
        }

        effects.push({
            type: 'move_cost_modifier',
            amount: 'free',
            target: {
                type: 'player_move_cost',
                filter
            }
        });
        return effects;
    }

    // RLS Legacy - Solar Galleon
    // "If you have a character here, you pay 2 ⬡ less to move a character of yours here."
    const conditionalMoveCostMatch = text.match(/^if you have a character here, you pay (\d+) [⬡] less to move a character of yours here/i);
    if (conditionalMoveCostMatch) {
        effects.push({
            type: 'conditional',
            condition: { type: 'has_character_here' },
            effect: {
                type: 'move_cost_modifier',
                amount: -parseInt(conditionalMoveCostMatch[1]),
                target: {
                    type: 'player_move_cost',
                    destination: 'self'
                }
            }
        });
        return effects;
    }

    // PHASE 4: Conditional Cost Reduction (Next Stop, Olympus)
    // "If you have a character with 5 ¤ or more in play, you pay 2 ⬡ less to play this action."
    if (text.match(/if you have a character with \d+ (?:¤|strength) or more in play, you pay \d+ (?:⬡|ink) less to play this action/i)) {
        const match = text.match(/if you have a character with (\d+) (¤|strength) or more in play, you pay (\d+) (?:⬡|ink) less to play this action/i)!;
        const statAmount = parseInt(match[1]);
        const reduction = parseInt(match[3]);

        effects.push({
            type: 'cost_reduction',
            amount: reduction,
            condition: {
                type: 'has_character_with_stat',
                stat: 'strength',
                amount: statAmount,
                operator: 'gte'
            }
        });
        return effects;
    }
    // Moana - Self-Taught Sailor: Challenge Restriction
    // "This character can't challenge unless you have a Captain character in play."
    const challengeRestrictionMatch = text.match(/^this character can't challenge unless you have a (.+?) (?:character )?in play/i);
    if (challengeRestrictionMatch) {
        const subtype = challengeRestrictionMatch[1];
        effects.push({
            type: 'restriction',
            restrictionType: 'cant_challenge',
            condition: {
                type: 'unless_have_card',
                filter: { subtype }
            }
        });
        return effects;
    }

    // Peter Pan - Never Land Prankster: Enters Play Exerted
    if (text.match(/^this character enters play exerted/i)) {
        effects.push({
            type: 'enters_play_exerted',
            value: true
        });
        return effects;
    }

    // Peter Pan - Never Land Prankster: Lore Restriction
    // "While this character is exerted, each opposing player can't gain lore unless one of their characters has challenged this turn."
    if (text.match(/^while this character is exerted, each opposing player can't gain lore unless one of their characters has challenged this turn/i)) {
        effects.push({
            type: 'restriction',
            restrictionType: 'cant_gain_lore',
            target: { type: 'all_opponents' },
            condition: {
                type: 'and',
                conditions: [
                    { type: 'while_exerted' },
                    { type: 'unless_opponent_challenged_this_turn' }
                ]
            }
        });
        return effects;
    }

    // Owl Island: Static Evasive while here
    // "Characters with 6 ⬡ or more gain Evasive while here."
    // Generic pattern: "Characters with [CONDITION] gain [KEYWORD] while here."
    const locationGrantKeywordMatch = text.match(/^characters with (\d+) (?:strength|¤|willpower|⛉) or more gain (.+?) while here/i);
    if (locationGrantKeywordMatch) {
        const amount = parseInt(locationGrantKeywordMatch[1]);
        const keyword = locationGrantKeywordMatch[2];
        effects.push({
            type: 'grant_keyword',
            keyword,
            target: {
                type: 'all_characters',
                filter: {
                    at_this_location: true,
                    minStrength: amount // assuming strength/¤
                }
            },
            condition: { type: 'while_at_this_location' }
        });
        return effects;
    }

    // PHASE 2B: Characters gain compound abilities while here (Sherwood Forest)
    // "Characters gain Ward and "⟳, 1 ⬡ — Deal 2 damage to chosen damaged character" while here."
    const compoundWhileHereMatch = text.match(/^characters gain (.+) and "?(.+?)"? while here/i);
    if (compoundWhileHereMatch) {
        const firstGrant = compoundWhileHereMatch[1].trim();
        const secondGrant = compoundWhileHereMatch[2].trim().replace(/^[""]|[""]$/g, '');

        // First grant - likely a keyword
        if (firstGrant.match(/^(ward|evasive|support|bodyguard)/i)) {
            effects.push({
                type: 'grant_keyword',
                keyword: firstGrant.toLowerCase(),
                target: { type: 'all_characters', filter: { at_this_location: true } },
                condition: { type: 'while_at_this_location' }
            });
        }

        // Second grant - likely an activated ability
        effects.push({
            type: 'grant_activated_ability_while_here',
            abilityText: secondGrant,
            target: { type: 'all_characters', filter: { at_this_location: true } },
            condition: { type: 'while_at_this_location' }
        });

        return effects;
    }

    // Location Restrictions (Tiana's Palace)
    // "Characters can't be challenged while here."
    const locationRestrictionMatch = text.match(/^characters can't be (.+?) while here/i);
    if (locationRestrictionMatch) {
        const restriction = locationRestrictionMatch[1].trim();
        let restrictionType = 'unknown';

        if (restriction.match(/challenged/i)) {
            restrictionType = 'cant_be_challenged';
        } else if (restriction.match(/quest/i)) {
            restrictionType = 'cant_quest';
        }

        effects.push({
            type: 'restriction',
            restriction: restrictionType,
            target: { type: 'all_characters', filter: { at_this_location: true } },
            condition: { type: 'while_at_this_location' }
        });
        return effects;
    }


    // Panic: "Your Villain characters can't be challenged."
    const panicMatch = text.match(/your (?:(.+?) )?characters can't be challenged/i);
    if (panicMatch) {
        const subtype = panicMatch[1];
        const target: any = { type: 'all_characters', filter: { mine: true } };

        if (subtype) {
            target.filter.subtypes = [subtype.trim()];
        }

        effects.push({
            type: 'restriction',
            restriction: 'cant_be_challenged',
            target
        });
        return effects;
    }

    // PHASE 4: Static Conditionals (Lexington)
    // "If you have 3 or more cards in your hand, this character can't ready."
    const cardsInHandRestrictionMatch = text.match(/^if you have (\d+) or more cards in your hand, this character can't ready/i);
    if (cardsInHandRestrictionMatch) {
        effects.push({
            type: 'restriction',
            restriction: 'cant_ready',
            target: { type: 'self' },
            condition: {
                type: 'hand_size',
                min: parseInt(cardsInHandRestrictionMatch[1])
            }
        });
        return effects;
    }

    // PHASE 4: Turn-based Static Conditionals (Chief Bogo - My Jurisdiction)
    // "During your turn, this character can't be dealt damage."
    // Relaxed regex: handle optional prefix (due to STATIC_PATTERNS stripping) and apostrophe
    const duringTurnCantBeDealtDamageMatch = text.match(/(?:during your turn, )?this character can.?t be dealt damage/i);
    if (duringTurnCantBeDealtDamageMatch) {
        const ret = [{
            type: 'restriction',
            restriction: 'cant_be_dealt_damage',
            target: { type: 'self' },
            condition: { type: 'during_your_turn' }
        }];
        effects.push(...ret);
        return effects;
    }

    // Phase 7C: While you have exerted character...
    // "While you have another exerted character in play, this character can't be challenged"
    const whileExertedCantBeChallengedMatch = text.match(/^while you have another exerted character in play, this character can'?t be challenged/i);
    if (whileExertedCantBeChallengedMatch) {
        effects.push({
            type: 'restriction',
            restriction: 'cant_be_challenged',
            target: { type: 'self' },
            condition: {
                type: 'has_other_exerted_character'
            }
        });
        return effects;
    }

    // Nick Wilde: While you have item in play...
    // "While you have an item in play, this character can't be challenged."
    const whileHaveItemCantBeChallengedMatch = text.match(/^while you have an? (.+?) in play, this character can'?t be challenged/i);
    if (whileHaveItemCantBeChallengedMatch) {
        const cardType = whileHaveItemCantBeChallengedMatch[1].toLowerCase();
        effects.push({
            type: 'restriction',
            restriction: 'cant_be_challenged',
            target: { type: 'self' },
            condition: {
                type: 'has_card_in_play',
                cardType
            }
        });
        return effects;
    }

    // PHASE 7C: While you have exerted character at location (The Wall)
    // "While you have an exerted character here, your other locations can't be challenged"
    const whileExertedHereLocationProtectMatch = text.match(/^while you have an? exerted character here, your other locations can'?t be challenged/i);
    if (whileExertedHereLocationProtectMatch) {
        effects.push({
            type: 'restriction',
            restriction: 'cant_be_challenged',
            target: {
                type: 'other_locations',
                filter: { mine: true }
            },
            condition: {
                type: 'has_exerted_character_at_this_location'
            }
        });
        return effects;
    }

    // Conditional Cost Reduction with Location (Pride Lands - Lion Home)
    // "If you have a Prince or King character here, you pay 1 ⬡ less to play characters."
    const locationCostReductionMatch = text.match(/^if you have (?:a|an) (.+?) character here, you pay (\d+) ⬡ less to play (.+)/i);
    if (locationCostReductionMatch) {
        const subtypeText = locationCostReductionMatch[1].trim();
        const amount = parseInt(locationCostReductionMatch[2]);
        const targetText = locationCostReductionMatch[3].trim();

        // Parse subtypes (e.g., "Prince or King" -> ["Prince", "King"])
        const subtypes = subtypeText.split(/ or /i).map(s => s.trim());

        let filter: any = {};
        if (targetText.match(/characters/i)) {
            filter.cardType = 'character';
        } else if (targetText.match(/locations/i)) {
            filter.cardType = 'location';
        }

        effects.push({
            type: 'cost_reduction',
            amount,
            filter,
            condition: {
                type: 'control_character_at_location',
                subtypes
            }
        });
        return effects;
    }

    // While this character has X stat or more (Alice, Pain, Pete)
    // "While this character has 10 ¤ or more, she gets +4 ◊."
    const whileStatMatch = text.match(/^while this character has (\d+) (strength|willpower|lore|¤|※|🛡️|⛉|◊|⬡) or more, (?:he|she|they|it) (gets?|gains?) (.+)/i);
    if (whileStatMatch) {
        const value = parseInt(whileStatMatch[1]);
        let stat = 'strength';
        const symbol = whileStatMatch[2].toLowerCase();
        if (['willpower', '🛡️', '⛉'].includes(symbol)) stat = 'willpower';
        if (['lore', '◊', '⬡'].includes(symbol)) stat = 'lore';

        const effectText = (whileStatMatch[3].startsWith('get') ? 'gets ' : 'gains ') + whileStatMatch[4];
        const fullEffectText = `this character ${effectText} `;
        const subEffects = parseStaticEffects(fullEffectText);

        if (subEffects.length > 0) {
            subEffects.forEach(e => {
                e.condition = { type: 'self_stat_check', stat, value, operator: 'gte' };
            });
            effects.push(...subEffects);
            return effects;
        }
    }

    // While this character has no damage (Lawrence, Razoul)
    // "While this character has no damage, he gets +4 ¤."
    const whileNoDamageMatch = text.match(/^while this character has no damage, (?:he|she|they|it) (gets?|gains?) (.+)/i);
    if (whileNoDamageMatch) {
        const effectText = (whileNoDamageMatch[1].startsWith('get') ? 'gets ' : 'gains ') + whileNoDamageMatch[2];
        const fullEffectText = `this character ${effectText} `;
        const subEffects = parseStaticEffects(fullEffectText);

        if (subEffects.length > 0) {
            subEffects.forEach(e => {
                e.condition = { type: 'self_no_damage' };
            });
            effects.push(...subEffects);
            return effects;
        }
    }

    // While this character has damage (Scroop, Ratigan)
    // "While this character has damage, he gets +3 ¤."
    const whileHasDamageMatch = text.match(/^while this character has damage, (?:he|she|they|it) (gets?|gains?) (.+)/i);
    if (whileHasDamageMatch) {
        const effectText = (whileHasDamageMatch[1].startsWith('get') ? 'gets ' : 'gains ') + whileHasDamageMatch[2];
        const fullEffectText = `this character ${effectText} `;
        const subEffects = parseStaticEffects(fullEffectText);

        if (subEffects.length > 0) {
            subEffects.forEach(e => {
                e.condition = { type: 'self_has_damage' };
            });
            effects.push(...subEffects);
            return effects;
        }
    }

    // PHASE 7B: While card under character (Flynn Rider, Zeus)
    // PHASE 7B: While card under character (Flynn Rider, Zeus, Mickey Mouse)
    // "While there's a card under this character, he gets +2 ¤ and +1 ◊"
    // "While this character has a card under him, he gets +3 ¤, +3 ⛉, and +3 ◊."
    // Megara: "While there's a card under this character, she gets +1 ◊ and gains "Whenever...""
    const whileHasCardUnderGeneric = text.match(/^while (?:this character has|there'?s) a card under (?:this character|him|her|them|it), (.+)/i);
    if (whileHasCardUnderGeneric) {
        let innerText = whileHasCardUnderGeneric[1];

        // Normalize subject for inner parser
        if (innerText.match(/^(?:he|she|they|it) (?:gets|gains|has)/i)) {
            innerText = innerText.replace(/^(?:he|she|they|it)/i, 'this character');
        }

        // MEGARA-STYLE: Handle compound "gets +X stat and gains <triggered ability>"
        // Split at " and gains " to separate stat buff from triggered ability
        const compoundMatch = innerText.match(/^this character gets ([+-]\d+) (strength|willpower|lore|¤|※|🛡️|⛉|◊|⬡)(?: and ([+-]\d+) (strength|willpower|lore|¤|※|🛡️|⛉|◊|⬡))? and gains "(.+)"/i);
        if (compoundMatch) {
            // Parse stat(s)
            const stat1Str = compoundMatch[2];
            const amount1 = parseInt(compoundMatch[1]);
            let stat1 = parseStat(stat1Str);

            effects.push({
                type: 'modify_stats',
                stat: stat1,
                amount: amount1,
                target: { type: 'self' },
                condition: { type: 'has_card_under' }
            });

            // Optional second stat
            if (compoundMatch[3] && compoundMatch[4]) {
                const stat2Str = compoundMatch[4];
                const amount2 = parseInt(compoundMatch[3]);
                let stat2 = parseStat(stat2Str);

                effects.push({
                    type: 'modify_stats',
                    stat: stat2,
                    amount: amount2,
                    target: { type: 'self' },
                    condition: { type: 'has_card_under' }
                });
            }

            // Gained triggered ability (stored as grant)
            const gainedAbilityText = compoundMatch[5];
            effects.push({
                type: 'grant_triggered_ability',
                abilityText: gainedAbilityText,
                target: { type: 'self' },
                condition: { type: 'has_card_under' }
            });

            return effects;
        }

        const innerEffects = parseStaticEffects(innerText);
        if (innerEffects.length > 0) {
            effects.push(...innerEffects.map(effect => ({
                ...effect,
                condition: { type: 'has_card_under' }
            })));
            return effects;
        }
    }

    // PHASE 7B: While character exerted (Daisy Duck - Paranormal Investigator)
    // "While this character is exerted, cards enter opponents' inkwells exerted"
    const whileExertedRestrictionMatch = text.match(/^while this character is exerted, cards enter opponents?'? inkwells exerted/i);
    if (whileExertedRestrictionMatch) {
        effects.push({
            type: 'inkwell_restriction',
            restriction: 'enter_exerted',
            target: { type: 'opponents' },
            condition: { type: 'self_exerted' }
        });
        return effects;
    }

    // PHASE 7C: While exerted, conditional multi-effect grant (Little John)
    // "While this character is exerted, your characters with Bodyguard gain Resist +1 and get +1 ◊"
    const whileExertedMultiGrantMatch = text.match(/^while this character is exerted, your characters with (.+?) (gain|get) (.+? and .+)/i);
    if (whileExertedMultiGrantMatch) {
        const subtype = whileExertedMultiGrantMatch[1].trim();
        const effectsText = whileExertedMultiGrantMatch[3];

        // Try to parse effects recursively
        const tempText = `your ${subtype} characters ${whileExertedMultiGrantMatch[2]} ${effectsText} `;
        const subEffects = parseStaticEffects(tempText);

        if (subEffects.length > 0) {
            subEffects.forEach(e => {
                e.condition = { type: 'self_exerted' };
            });
            effects.push(...subEffects);
            return effects;
        }
    }

    // Opposing can't sing (Pete - Space Pirate)
    // "opposing characters can't exert to sing songs"
    if (text.match(/^opposing characters can't exert to sing songs?/i)) {
        effects.push({
            type: 'restriction',
            restriction: 'cant_sing',
            target: { type: 'opposing_characters' }
        });
        return effects;
    }

    // Subtype keyword conditional grant (Pete - Space Pirate)
    // "your Pirate characters gain Resist +1"
    const subtypeKeywordGrantMatch = text.match(/^your ([A-Za-z]+) characters gain (resist|challenger) \\+(\\d+)/i);
    if (subtypeKeywordGrantMatch) {
        const subtype = subtypeKeywordGrantMatch[1].toLowerCase();
        const keyword = subtypeKeywordGrantMatch[2].toLowerCase();
        const amount = parseInt(subtypeKeywordGrantMatch[3]);

        effects.push({
            type: 'grant_keyword',
            keyword,
            amount,
            target: {
                type: 'all_characters',
                filter: { mine: true, subtype }
            }
        });
        return effects;
    }

    // "deals X damage to each opposing damaged character"
    // "deals X damage to each opposing exerted character"
    const massFilteredDamageMatch = text.match(/deals? (\d+) damage to each opposing (damaged|exerted) characters?/i);
    if (massFilteredDamageMatch) {
        const amount = parseInt(massFilteredDamageMatch[1]);
        const condition = massFilteredDamageMatch[2].toLowerCase();

        effects.push({
            type: 'damage',
            amount,
            target: {
                type: 'all_characters',
                filter: {
                    opponent: true,
                    [condition]: true
                }
            }
        });
        return effects;
    }

    // "steals The Reforged Crown" / "steals [named card]"
    const stealMatch = text.match(/steals? (.+)/i);
    if (stealMatch) {
        const cardName = stealMatch[1].trim();
        effects.push({
            type: 'steal_card',
            cardName
        });
        return effects;
    }

    // "each Illumineer chooses and discards a card"
    const massDiscardMatch = text.match(/each illumineer chooses and discards (?:a )?(.+?)(?:\.|$)/i);
    if (massDiscardMatch) {
        const targetText = massDiscardMatch[1];
        const amount = targetText.match(/(\d+)/) ? parseInt(targetText.match(/(\d+)/)![1]) : 1;

        effects.push({
            type: 'mass_discard',
            amount,
            target: {
                type: 'all_players',
                chooses: true
            }
        });
        return effects;
    }

    // "each Illumineer chooses and banishes one of their characters/items/locations"
    const massBanishMatch = text.match(/each illumineer chooses and banishes one of their (.+?)(?:,|\.|\band\b)/i);
    if (massBanishMatch) {
        const targetText = massBanishMatch[1].toLowerCase();
        const targets = [];

        if (targetText.includes('character')) targets.push('character');
        if (targetText.includes('item')) targets.push('item');
        if (targetText.includes('location')) targets.push('location');

        effects.push({
            type: 'mass_banish_choice',
            targets,
            amount: 1,
            eachPlayer: true
        });
        return effects;
    }

    // "banish all opposing damaged characters" / "banish all opposing exerted characters"
    const banishAllFilteredMatch = text.match(/^banish all opposing (.+?) characters/i);
    if (banishAllFilteredMatch) {
        const filterType = banishAllFilteredMatch[1].toLowerCase();

        effects.push({
            type: 'banish',
            target: {
                type: 'all_characters',
                filter: {
                    opponent: true,
                    [filterType]: true
                }
            }
        });
        return effects;
    }

    // Action Card: Banish Chosen (Just in Time, etc.)
    // "Banish chosen character."
    // "Banish chosen opposing character."
    const banishChosenMatch = text.match(/^banish chosen(?: opposing)? character/i);
    if (banishChosenMatch) {
        effects.push({
            type: 'banish',
            target: { type: 'chosen_character', filter: text.includes('opposing') ? { opponent: true } : {} }
        });
        return effects;
    }


    // Action Card: Variable Damage
    // "Deal damage to chosen character equal to the number of cards in your hand."
    const variableDamageMatch = text.match(/^(?:you may )?deal damage to chosen(?: opposing| damaged)? character equal to the number of (.+)/i);
    if (variableDamageMatch) {
        const variableText = variableDamageMatch[1].toLowerCase();
        let amount: any = { type: 'count', source: 'unknown' };

        if (variableText.includes('cards in your hand')) {
            amount = { type: 'count', source: 'hand', owner: 'self' };
        } else if (variableText.includes('cards in their hand') || variableText.includes("opponent's hand")) {
            amount = { type: 'count', source: 'hand', owner: 'opponent' };
        }

        effects.push({
            type: 'damage',
            amount,
            target: { type: 'chosen_character', filter: parseTargetFilter(text) },
            optional: text.match(/you may/i) ? true : false
        });
        return effects;
    }

    // Deal damage to multiple chosen characters (Robin Hood - Ephemeral Archer)
    // "Deal 1 damage to up to 2 chosen characters."
    const multiDamageMatch = text.match(/^(?:you may )?deal (\d+) damage to (?:up to )?(\d+) chosen characters/i);
    if (multiDamageMatch) {
        const amount = parseInt(multiDamageMatch[1]);
        const count = parseInt(multiDamageMatch[2]);
        effects.push({
            type: 'damage',
            amount,
            target: { type: 'chosen_character', count, filter: parseTargetFilter(text) },
            optional: text.match(/you may/i) ? true : false
        });
        return effects;
    }

    // Action Card: Deal Damage
    // "Deal 2 damage to chosen character."
    // "Deal 3 damage to chosen opposing character."
    // "Deal 2 damage to chosen damaged character."
    const dealDamageMatch = text.match(/^(?:you may )?deal (\d+) damage to chosen(?: opposing| damaged)? character/i);
    if (dealDamageMatch) {
        const amount = parseInt(dealDamageMatch[1]);
        effects.push({
            type: 'damage',
            amount,
            target: { type: 'chosen_character', filter: parseTargetFilter(text) },
            optional: text.match(/you may/i) ? true : false
        });
        return effects;
    }

    // Ready/Exert Chosen
    // "Ready chosen character."
    // "Exert chosen character."
    // "Exert chosen damaged character."
    if (text.match(/^ready chosen character/i)) {
        effects.push({
            type: 'ready',
            target: { type: 'chosen_character' }
        });
        return effects;
    }

    // Ready chosen item
    if (text.match(/^(?:you may )?ready chosen item/i)) {
        effects.push({
            type: 'ready',
            target: { type: 'chosen_item' },
            optional: text.match(/you may/i) ? true : false
        });
        return effects;
    }
    const exertChosenMatch = text.match(/^(?:you may )?exert chosen (?:opposing |damaged )?character/i);
    if (exertChosenMatch) {
        effects.push({
            type: 'exert',
            target: { type: 'chosen_character', filter: parseTargetFilter(text) },
            optional: text.match(/you may/i) ? true : false
        });
        return effects;
    }

    // Draw Cards
    // "Draw a card." / "Draw 2 cards."
    // "You may draw a card."
    const drawMatch = text.match(/(?:you may )?draw (?:a card|(\d+) cards?)/i);
    if (drawMatch) {
        const amount = drawMatch[1] ? parseInt(drawMatch[1]) : 1;
        effects.push({
            type: 'draw',
            amount,
            optional: text.match(/you may/i) ? true : false
        });
        return effects;
    }

    // Doesn't Ready (Anna - Heir to Arendelle)
    // "chosen opposing character doesn't ready at the start of their next turn"
    const doesntReadyMatch = text.match(/(?:chosen|this) (?:opposing )?character doesn't ready at the start of their next turn/i);
    if (doesntReadyMatch) {
        const isOpposing = text.match(/opposing/i);
        effects.push({
            type: 'restriction',
            restriction: 'cant_ready',
            target: { type: isOpposing ? 'chosen_opposing_character' : 'chosen_character' },
            duration: 'next_turn_start'
        });
        return effects;
    }

    // Cost Reduction (LeFou - inside conditional)
    // "you pay 1 ⬡ less to play this character"
    const costRedMatch = text.match(/^(?:you )?pay (\d+) (?:ink|⬡) less (?:to play|for) (.+?)(?: this turn)?\.?$/i);
    if (costRedMatch) {
        const amount = parseInt(costRedMatch[1]);
        const targetText = costRedMatch[2].toLowerCase();

        let filter: any = {};
        let duration: string | undefined = undefined;

        if (targetText.includes('next character')) {
            filter = { cardType: 'character' };
            duration = 'next_card';
        } else if (targetText.includes('this character')) {
            filter = { name: 'self' }; // Use 'self' marker, caller should resolve or use card name if available. 
            // But parseStaticEffects doesn't have access to 'card'.
            // We'll use a special marker 'self_by_name' or just 'self' and let the system handle it.
            // Actually, for LeFou, it's "play this character".
        } else {
            const subtypeMatch = targetText.match(/(.+) characters/i);
            if (subtypeMatch) {
                filter = { subtype: subtypeMatch[1] };
            }
        }

        effects.push({
            type: 'cost_reduction',
            amount,
            target: {
                type: 'cards_in_hand',
                filter
            },
            duration
        });
        return effects;
    }

    // Combined Stat Buff and Keyword (Donald Duck - Musketeer)
    // "this character gets +1 ◊ and Evasive"
    const combinedBuffMatch = text.match(/(?:this character|chosen character) gets ([+-]\d+) (strength|willpower|lore|¤|※|🛡️|⛉|◊|⬡) and (?:gains |has )?([a-zA-Z\s]+)/i);
    if (combinedBuffMatch) {
        let stat = 'strength';
        const symbol = combinedBuffMatch[2].toLowerCase();
        if (['willpower', '🛡️', '⛉'].includes(symbol)) stat = 'willpower';
        if (['lore', '◊', '⬡'].includes(symbol)) stat = 'lore';
        if (['¤'].includes(symbol)) stat = 'strength';

        const amount = parseInt(combinedBuffMatch[1]);
        const keyword = combinedBuffMatch[3].replace(/ this turn$/i, '').trim();

        let targetType = 'chosen_character';
        if (text.match(/this character/i)) {
            targetType = 'self';
        }

        effects.push({
            type: 'modify_stats',
            stat,
            amount,
            target: { type: targetType },
            duration: text.match(/this turn/i) ? 'turn' : undefined
        });

        effects.push({
            type: 'grant_keyword',
            keyword,
            target: { type: targetType },
            duration: text.match(/this turn/i) ? 'turn' : undefined
        });

        return effects;
    }

    // This character gains Resist +X and [keyword(s)] (Noi, etc.)
    // "this character gains Resist +1 and Ward"
    const resistMultiKeywordMatch = text.match(/this character gains resist \+(\d+) and (.+)/i);
    if (resistMultiKeywordMatch) {
        const resistValue = parseInt(resistMultiKeywordMatch[1]);
        const additionalKeywords = resistMultiKeywordMatch[2]; // e.g., "Ward" or "Ward and Evasive"

        effects.push({
            type: 'grant_keyword',
            keyword: `Resist + ${resistValue} `,
            target: { type: 'self' }
        });

        // Parse additional keywords
        const keywords = additionalKeywords.split(/ and /i).map(k => k.trim());
        keywords.forEach(keyword => {
            effects.push({
                type: 'grant_keyword',
                keyword,
                target: { type: 'self' }
            });
        });

        return effects;
    }

    // This character gains Resist +X (Noi, etc.)
    // "this character gains Resist +1"
    const resistGrantMatch = text.match(/this character gains resist \+(\d+)/i);
    if (resistGrantMatch) {
        const resistValue = parseInt(resistGrantMatch[1]);
        effects.push({
            type: 'grant_keyword',
            keyword: `Resist + ${resistValue} `,
            target: { type: 'self' }
        });
        return effects;
    }

    // Generic Stat Modification (Strength / Willpower / Lore) with SCALING ("for each ...")
    // "chosen character gets -1 strength this turn for each item named Microbots you have in play"
    const scaledStatRegex = /((?:chosen|all|this) (?:opposing )?characters?|it) gets? ([+-]\d+) (strength|willpower|lore|¤|🛡️|⛉|◊|⬡)(?: this turn)? for each item named (.+?) you have in play\.?/i;
    const scaledStatModMatch = text.match(scaledStatRegex);
    if (scaledStatModMatch) {
        const targetStr = scaledStatModMatch[1];
        const amountStr = scaledStatModMatch[2];
        const statStr = parseStat(scaledStatModMatch[3]);
        const cardName = scaledStatModMatch[4];

        return [{
            type: 'modify_stats_by_count',
            stat: statStr,
            amountMultiplier: parseInt(amountStr),
            target: parseTarget(targetStr),
            countTarget: {
                type: 'my_items',
                filter: { name: cardName }
            },
            duration: 'turn'
        }];
    }

    // Targeted Stat Buff (Merryweather, Mulan)
    // "give chosen character +2 ¤ this turn"
    // Targeted Stat Buffs (Chosen/This character)
    // "chosen character gets +2 ¤ this turn"
    // "chosen opposing character gets -3 ¤ this turn"
    // "this character gets +2 strength"
    // "this character gets +1 ¤ and +1 🛡️"
    // Capture groups:
    // 1: Prefix ("chosen character gets ")
    // 2: opposing modifier (optional)
    // 3: Sign
    // 4: Amount
    // 5: Stat
    // Pattern handles these variations:
    // "you may give chosen character of yours +2 ¤ this turn"
    // "give chosen character +2 ¤ this turn"
    // "chosen character gets +2 ¤ this turn"
    // "this character gets +2 strength"
    // "other characters get +1 ¤"
    const targetedBuffMatch = text.match(/(?:you may )?(?:give (?:(?:another )?chosen (opposing )?character(?: of yours)?)|(?:(?:another )?chosen (opposing )?character(?: of yours)?) gets|this character gets|(?:your )?other characters get) ([+-])(\d+) (strength|willpower|lore|¤|※|🛡️|⛉|⛨|◊|⬡)(?: and ([+-]\d+ [^.]+))?(?: this turn)?/i);

    if (targetedBuffMatch) {
        // Capture groups changed:
        // 1 & 2: opposing flags (may be in either position)
        // 3: sign
        // 4: value
        // 5: stat
        // 6: second effect part
        const isOpposing = !!targetedBuffMatch[1] || !!targetedBuffMatch[2];
        const sign = targetedBuffMatch[3];
        const value = parseInt(targetedBuffMatch[4]);
        const statRaw = targetedBuffMatch[5];
        const secondPart = targetedBuffMatch[6];

        // Handle second stat modification in same effect (e.g. "+1 ¤ and +1 🛡️")
        if (secondPart) {
            // Parse the second part as a separate modifier
            // For now, we'll skip this complex case and just handle the first stat
            // TODO: Implement proper multi-stat handling
        }

        const amount = sign === '-' ? -value : value;
        const stat = parseStat(statRaw);

        let target: any = { type: 'chosen_character' };
        if (isOpposing) {
            target = { type: 'chosen_opposing_character' };
        } else if (text.match(/this character gets/i)) {
            target = { type: 'self' };
        } else if (text.match(/other characters get/i)) {
            target = { type: 'other_characters', filter: { mine: true } };
        }

        const duration = text.match(/this turn/i) ? 'turn' : undefined;

        effects.push({
            type: 'modify_stats',
            stat,
            amount,
            target,
            duration
        });

        // Handle second stat modification in same effect (e.g. "+1 ¤ and +1 🛡️")
        if (secondPart) {
            const secondMatch = secondPart.match(/([+-])(\d+) (strength|willpower|lore|¤|※|🛡️|⛉|⛨|◊|⬡)/i);
            if (secondMatch) {
                const secondSign = secondMatch[1];
                const secondValue = parseInt(secondMatch[2]);
                const secondStatRaw = secondMatch[3];
                const secondAmount = secondSign === '-' ? -secondValue : secondValue;
                const secondStat = parseStat(secondStatRaw);

                effects.push({
                    type: 'modify_stats',
                    stat: secondStat,
                    amount: secondAmount,
                    target,
                    duration
                });
            }
        }

        return effects;
    }

    // Multiple Keywords (White Rabbit's Pocket Watch)
    // "Chosen character gains Rush and Evasive this turn."
    const multipleKeywordsMatch = text.match(/chosen character gains (.+?) and (.+?) this turn/i);
    if (multipleKeywordsMatch) {
        const keyword1 = multipleKeywordsMatch[1];
        const keyword2 = multipleKeywordsMatch[2];

        effects.push({
            type: 'grant_keyword',
            keyword: keyword1,
            target: { type: 'chosen_character' },
            duration: 'turn'
        });

        effects.push({
            type: 'grant_keyword',
            keyword: keyword2,
            target: { type: 'chosen_character' },
            duration: 'turn'
        });
        return effects;
    }

    // Pronoun gains (Mushu - "they gain Resist +2")
    const pronounGainMatch = text.match(/^(?:they|it|he|she) gains? (.+?)(?: during |$)/i);
    if (pronounGainMatch) {
        const keywordRaw = pronounGainMatch[1];
        let duration = 'turn'; // Default
        if (text.includes('during that challenge')) duration = 'challenge';

        effects.push({
            type: 'grant_keyword',
            keyword: keywordRaw,
            target: { type: 'trigger_source' },
            duration
        });
        return effects;
    }

    // Generic gain keyword (Chosen character gains Challenger +2)
    const gainKeywordMatch = text.match(/^(?:chosen character(?:\sof yours)?|this character) gains (.+?)(?: unless |$)/i);
    // Handle "gains Rush and Resist +1"
    if (gainKeywordMatch && !text.includes("with no damage")) { // Avoid conflict w/ Hamster Ball
        const keywordRaw = gainKeywordMatch[1].replace(/\.$/, ''); // Strip trailing period

        // Check for multiple keywords (e.g. "Rush and Resist +1")
        const keywords = keywordRaw.split(' and ');

        keywords.forEach(k => {
            k = k.trim();
            let amount: number | undefined;
            let keyword = k;

            // Handle Singer/Challenger keywords specially
            if (k.match(/^singer\s+(\d+)/i)) {
                keyword = 'Singer';
                amount = parseInt(k.match(/^singer\s+(\d+)/i)![1]);
            } else if (k.match(/^challenger\s+\+(\d+)/i)) {
                keyword = 'Challenger';
                amount = parseInt(k.match(/^challenger\s+\+(\d+)/i)![1]);
            } else if (k.match(/[+]\d+/)) {
                // Parse "Resist +1" style
                const parts = k.split(' +');
                keyword = parts[0];
                amount = parseInt(parts[1]);
            }

            effects.push({
                type: 'grant_keyword',
                keyword,
                amount,
                target: { type: 'chosen_character' }, // Default, might need specific target check -> Fixed below
                duration: text.includes('this turn') ? 'turn' : undefined
            });
        });

        // Fix target if "this character"
        if (text.match(/^this character/i)) {
            effects.forEach(e => e.target = { type: 'self' });
        }

        return effects;
    }

    // Simple "can't be challenged" - Snow White, Captain Amelia
    // "This character can't be challenged."
    // "This character can't be challenged by Pirate characters."
    // "This location can't be challenged."
    const simpleCantBeChallengedMatch = text.match(/^this (character|location) can't be challenged(?:\s+by\s+(.+?)\s+characters)?\.?$/i);
    if (simpleCantBeChallengedMatch) {
        const cardType = simpleCantBeChallengedMatch[1].toLowerCase();
        const challengerSubtype = simpleCantBeChallengedMatch[2]?.trim().toLowerCase();

        const effect: any = {
            type: 'restriction',
            restriction: challengerSubtype ? 'cant_be_challenged_by_subtype' : 'cant_be_challenged',
            target: { type: 'self' }
        };

        if (challengerSubtype) {
            effect.params = { challengerSubtype };
        }

        effects.push(effect);
        return effects;
    }

    // Isabela Madrigal: "this character can't be challenged until the start of your next turn"
    if (text.match(/^this character can't be challenged until the start of your next turn/i)) {
        effects.push({
            type: 'restriction',
            restriction: 'cant_be_challenged',
            target: { type: 'self' },
            duration: 'until_next_turn_start'
        });
        return effects;
    }

    // CAMPAIGN: Tiger Behemoth - "This character can't be challenged by damaged characters."
    if (text.match(/this character can't be challenged by damaged characters/i)) {
        effects.push({
            type: 'restriction',
            restriction: 'cant_be_challenged_by_damaged',
            target: { type: 'self' }
        });
        return effects;
    }

    // Generic Restriction: "This character can't be challenged by characters with 2 ¤ or greater." (Mr. Big)
    const cantBeChallengedByStatMatch = text.match(/this character can't be challenged by characters with (\d+) (strength|willpower|lore|¤|🛡️|⛉|◊|⬡) or (?:greater|more)/i);
    if (cantBeChallengedByStatMatch) {
        const amount = parseInt(cantBeChallengedByStatMatch[1]);
        const stat = parseStat(cantBeChallengedByStatMatch[2]);

        effects.push({
            type: 'restriction',
            restriction: 'cant_be_challenged_by',
            target: { type: 'self' },
            params: { minStat: amount, stat }
        });
        return effects;
    }

    // CAMPAIGN: Sandblast/Cobra Pit/Endless Staircase - "Jafar/he deals X damage to Y."
    const jafarDamageMatch = text.match(/(?:Jafar|he) deals (\d+) damage to (.+?)(?:$|\.|\s\(| and)/i);
    if (jafarDamageMatch) {
        const amount = parseInt(jafarDamageMatch[1]);
        const targetText = jafarDamageMatch[2].toLowerCase();
        let target: any = { type: 'all_opponents_characters' }; // Default

        if (targetText.includes('character with the highest cost')) {
            target = { type: 'highest_cost_character', owner: 'opponent' };
        } else if (targetText.includes('each opposing exerted character')) {
            target = { type: 'all_characters', filter: { exerted: true, owner: 'opponent' } };
        }

        effects.push({
            type: 'deal_damage',
            amount,
            target
        });
    }

    // CAMPAIGN: Sandblast - "put this card into his inkwell facedown"
    // Also: "you may put this card into your inkwell facedown and exerted"
    if (text.match(/put this card into (?:his|your) inkwell facedown/i)) {
        effects.push({
            type: 'move_to_inkwell',
            target: { type: 'self' },
            facedown: true,
            exerted: text.match(/and exerted/i) ? true : undefined,
            optional: text.match(/you may/i) ? true : undefined
        });
        return effects;
    }

    // CAMPAIGN: Destructive Misstep - "Jafar's locations lose Ward"
    const loseWardMatch = text.match(/Jafar's locations lose (.+?) until/i);
    if (loseWardMatch) {
        effects.push({
            type: 'remove_keyword',
            keyword: loseWardMatch[1],
            target: { type: 'all_cards', filter: { zone: 'location', owner: 'opponent' } }
        });
    }

    // CAMPAIGN: Destructive Misstep - "The Illumineers may choose and banish up to one of Jafar's locations"
    if (text.match(/The Illumineers may choose and banish up to one of Jafar's locations/i)) {
        effects.push({
            type: 'banish',
            target: { type: 'chosen_location', count: 1, filter: { owner: 'opponent' } }
        });
    }

    // Exert + Can't Ready (Elsa - Spirit of Winter)
    // "exert up to 2 chosen opposing characters and they can't ready at the start of their next turn"
    const exertCantReadyMatch = text.match(/exert (?:up to )?(\d+) chosen (?:opposing )?characters and they can't ready at the start of their next turn/i);
    if (exertCantReadyMatch) {
        const amount = parseInt(exertCantReadyMatch[1]);
        const isOpposing = text.match(/opposing/i);

        effects.push({
            type: 'exert',
            amount,
            target: { type: isOpposing ? 'chosen_opposing_character' : 'chosen_character' }
        });

        effects.push({
            type: 'cant_ready',
            target: { type: isOpposing ? 'chosen_opposing_character' : 'chosen_character' },
            duration: 'next_turn_start'
        });
        return effects;
    }

    // Grant Multiple Keywords (Imperial Bow)
    // "Chosen Hero character gains Challenger +2 and Evasive this turn."
    const multiKeywordMatch = text.match(/chosen (?:hero )?character gains (.+?) and (.+?) this turn/i);
    if (multiKeywordMatch) {
        const keyword1Text = multiKeywordMatch[1];
        const keyword2Text = multiKeywordMatch[2];
        const keywords = [keyword1Text, keyword2Text];

        keywords.forEach(kRaw => {
            let k = kRaw.trim().toLowerCase();
            let amount: number | undefined;
            let keyword = k.charAt(0).toUpperCase() + k.slice(1);

            if (k.startsWith('challenger ')) {
                amount = parseInt(k.split('+')[1]);
                keyword = 'Challenger';
            } else if (k.startsWith('singer ')) {
                amount = parseInt(k.split(' ')[1]);
                keyword = 'Singer';
            } else if (k === 'evasive') {
                keyword = 'Evasive';
            }

            effects.push({
                type: 'grant_keyword',
                target: { type: 'chosen_character' }, // Simplify to chosen_character (Hero filter handled by usage restriction or assumed valid)
                keyword: keyword,
                amount: amount,
                duration: 'this_turn'
            });
        });
        return effects;
    }

    // Grant Keyword (Croquet Mallet, Flotsam/Jetsam, Tinker Bell)
    // "Chosen character gains Rush this turn."
    // "Your characters gain Evasive this turn."
    // "Your characters named Flotsam gain Evasive."
    // "Your characters named Peter Pan gain Challenger +1."
    // "Opposing characters with Evasive gain Reckless."
    // "Your other characters with Rush gain Evasive."
    const keywordRegex = /(?:chosen\s+(?:opposing\s+)?character|your\s+(?:other\s+)?characters(?: named (.+?))?(?: with (.+?))?|opposing\s+(?:damaged\s+)?characters(?: with (.+?))?|this\s+character)\s+(?:gains?|has|have)\s+(rush|evasive|support|ward|reckless|bodyguard|singer\s+\d+|challenger\s+\+\d+)(?:\s+(?:this\s+turn|during their next turn))?/i;
    const keywordMatch = text.match(keywordRegex);
    if (keywordMatch) {
        const nameFilter = keywordMatch[1] ? keywordMatch[1].trim() : undefined;
        const yourKeywordFilter = keywordMatch[2] ? keywordMatch[2].trim().toLowerCase() : undefined;
        const opposingKeywordFilter = keywordMatch[3] ? keywordMatch[3].trim().toLowerCase() : undefined;
        // Group 4 is the keyword gained
        let keywordRaw = keywordMatch[4].toLowerCase().replace(/\.$/, '');
        let keyword = keywordRaw;
        let amount: number | undefined;

        if (keywordRaw.startsWith('singer ')) {
            amount = parseInt(keywordRaw.split(' ')[1]);
            keyword = 'Singer';
        } else if (keywordRaw.startsWith('challenger ')) {
            amount = parseInt(keywordRaw.split('+')[1]);
            keyword = 'Challenger';
        } else {
            // Capitalize first letter for standard keywords
            keyword = keywordRaw.charAt(0).toUpperCase() + keywordRaw.slice(1);
        }

        let targetType = 'chosen_character';
        let filter: any = undefined;

        if (text.match(/your (?:other )?characters/i)) {
            targetType = 'all_characters';
            filter = { mine: true };

            if (text.match(/your other characters/i)) {
                filter.other = true;
            }

            if (nameFilter) {
                filter.name = nameFilter;
            }
            if (yourKeywordFilter) {
                // Determine if it's a keyword filter or something else
                // For now assuming keyword if parsed in "with X"
                filter.keyword = yourKeywordFilter.charAt(0).toUpperCase() + yourKeywordFilter.slice(1);
            }
        } else if (text.match(/opposing (?:damaged )?characters/i)) {
            targetType = 'all_opposing_characters';
            if (text.match(/opposing damaged characters/i)) {
                filter = { status: 'damaged' };
            }
            if (opposingKeywordFilter) {
                filter = filter || {};
                filter.keyword = opposingKeywordFilter;
            }
        } else if (text.match(/this character/i)) {
            targetType = 'self';
        } else if (text.match(/chosen opposing character/i)) {
            targetType = 'chosen_opposing_character';
            targetType = 'chosen_opposing_character';
        }

        effects.push({
            type: 'grant_keyword',
            keyword,
            amount,
            target: { type: targetType, filter },
            duration: text.match(/this turn/i) ? 'turn' : undefined
        });
        return effects;
    }

    // Opposing Characters Get (Ursula's Garden)
    // "opposing characters get -1 ◊"
    const opposingGetMatch = text.match(/opposing characters get ([+-])(\d+) (strength|willpower|lore|¤|※|🛡️|⛉|◊|⬡)/i);
    if (opposingGetMatch) {
        let stat = 'strength';
        const symbol = opposingGetMatch[3].toLowerCase();
        if (['willpower', '🛡️', '⛉'].includes(symbol)) stat = 'willpower';
        if (['lore', '◊', '⬡'].includes(symbol)) stat = 'lore';
        if (['¤'].includes(symbol)) stat = 'strength';

        const amount = parseInt(opposingGetMatch[2]) * (opposingGetMatch[1] === '-' ? -1 : 1);

        effects.push({
            type: 'modify_stats',
            stat,
            amount,
            target: { type: 'all_opposing_characters' }
        });
        return effects;
    }

    // Play for free (Fan the Flames)
    // "play this character for free"
    if (text.match(/play this character for free/i)) {
        effects.push({
            type: 'play_for_free'
        });
        return effects;
    }

    // BATCH 45: Banish chosen (Dragon Fire, etc.)
    // "banish chosen character"
    // "banish chosen item"
    // "banish chosen character or item"
    const banishMatch = text.match(/banish chosen (.+)/i);
    if (banishMatch) {
        const targetText = banishMatch[1];
        const target = parseTargetFilter(targetText);
        target.type = 'chosen_character'; // Default type, filter handles specifics

        // If it's just "chosen character", target type is enough
        // If it's "chosen item", we need to set cardType in filter
        if (targetText.includes('item')) {
            target.type = 'chosen_item'; // Or generic 'chosen_permanent' with filter
            // For now, let's stick to existing patterns if possible, or generalize
        }

        // Actually, let's use a more generic target parser if available, or manual mapping
        if (targetText.match(/character or item|item or character/i)) {
            target.type = 'chosen_permanent';
            target.cardType = ['character', 'item'];
        } else if (targetText.includes('item')) {
            target.type = 'chosen_item';
        } else if (targetText.includes('location')) {
            target.type = 'chosen_location';
        }

        effects.push({
            type: 'banish',
            target
        });
        return effects;
    }

    // Banish Challenging Character (Cheshire Cat, Kuzco)
    // "banish the challenging character"
    // "you may banish the challenging character"
    const banishChallengerMatch = text.match(/(?:you may )?banish the challenging character/i);
    if (banishChallengerMatch) {
        effects.push({
            type: 'banish',
            target: { type: 'challenging_character' },
            optional: text.match(/you may/i) ? true : false
        });
        return effects;
    }

    // Challenging Player Discards (Flynn Rider)
    // "the challenging player chooses and discards a card"
    if (text.match(/the challenging player chooses and discards a card/i)) {
        effects.push({
            type: 'opponent_discard_choice',
            amount: 1,
            target: { type: 'challenging_player' }
        });
        return effects;
    }

    // Play named item/character for free (Yokai)
    // "You may play items named Microbots for free."
    const playNamedFreeMatch = text.match(/you may play (items?|characters?) named (.+?) for free/i);
    if (playNamedFreeMatch) {
        const cardType = playNamedFreeMatch[1].toLowerCase().replace(/s$/, ''); // Remove plural
        const cardName = playNamedFreeMatch[2].trim();

        effects.push({
            type: 'play_for_free',
            filter: { cardType, name: cardName },
            optional: true
        });
        return effects;
    }

    // Play character/item for free
    // "you may play a character with cost 5 or less for free"
    // "play an item for free"
    const playFreeMatch = text.match(/(?:you may )?play (?:a|an) (character|item|action)(?: with cost (\d+) or less)? for free/i);
    if (playFreeMatch) {
        const cardType = playFreeMatch[1].toLowerCase();
        const costLimit = playFreeMatch[2] ? parseInt(playFreeMatch[2]) : undefined;

        const filter: any = { cardType };
        if (costLimit) filter.maxCost = costLimit;

        effects.push({
            type: 'play_for_free',
            filter,
            optional: text.includes('may')
        });
        return effects;
    }

    // Opponent Discard Choice (You Have Forgotten Me)
    // "Each opponent chooses and discards 2 cards"
    const opponentDiscardMatch = text.match(/each opponent chooses and discards (\d+) cards?/i);
    if (opponentDiscardMatch) {
        const amount = parseInt(opponentDiscardMatch[1]);
        effects.push({
            type: 'opponent_discard_choice',
            amount,
            target: { type: 'all_opponents' }
        });
        return effects;
    }

    // Unique: Opponent loses lore (Basil, Fidget)
    // "each opponent loses 1 lore"
    // "chosen opponent loses 1 lore"
    const opponentLosesLoreMatch = text.match(/(?:each|chosen) opponent loses (\d+) lore/i);
    if (opponentLosesLoreMatch) {
        const isEach = text.match(/each opponent/i);
        const amount = parseInt(opponentLosesLoreMatch[1]);
        effects.push({
            type: 'lore_loss',
            amount,
            target: { type: isEach ? 'all_opponents' : 'chosen_opponent' }
        });
        return effects;
    }


    // REMOVED DUPLICATE - put chosen into inkwell pattern is handled later in file at line 1158
    // This was causing Hades to get move_card instead of put_into_inkwell

    // BATCH 11: Prevention Effects
    // "chosen opposing character can't quest during their next turn"
    if (text.match(/chosen opposing character can't quest during their next turn/i)) {
        effects.push({
            type: 'cant_quest',
            target: { type: 'chosen_opposing_character' },
            duration: 'next_turn'
        });
        return effects;
    }



    // BATCH 45: Remove damage (Repair)
    // Remove Damage (Rapunzel, Baymax)
    // "remove up to 3 damage from one of your locations or characters"
    // "remove all damage from him"
    const removeDamageMatch = text.match(/remove (?:up to )?((?:\d+|all)) damage from (.+)/i);
    if (removeDamageMatch) {
        const amountStr = removeDamageMatch[1];
        const amount = amountStr.toLowerCase() === 'all' ? 99 : parseInt(amountStr);
        const targetText = removeDamageMatch[2];

        let target: any = { type: 'chosen_character' }; // Default

        if (targetText.includes('one of your locations or characters')) {
            target = {
                type: 'chosen_permanent',
                filter: {
                    mine: true,
                    cardType: ['character', 'location']
                }
            };
        } else if (targetText.includes('chosen character')) {
            target = { type: 'chosen_character' };
        } else if (targetText.includes('each of your characters')) {
            target = {
                type: 'all_characters',
                owner: 'self',
                filter: { mine: true }
            };
        } else if (targetText.includes('one of your characters')) {
            target = {
                type: 'chosen_character',
                filter: { mine: true }
            };
        }

        effects.push({
            type: 'heal',
            amount,
            target
        });
        return effects;
    }

    // Maui's Fish Hook: "you may use this item's Shapeshift ability for free"
    const useAbilityFreeMatch = text.match(/use this item's (.+) ability for free/i);
    if (useAbilityFreeMatch) {
        effects.push({
            type: 'ability_cost_reduction',
            abilityName: useAbilityFreeMatch[1],
            amount: 'free'
        });
        return effects;
    }

    // BATCH 45: Ready/Exert effects
    // "ready chosen character"
    // "exert chosen character"
    if (text.match(/ready chosen character/i)) {
        effects.push({
            type: 'ready',
            target: { type: 'chosen_character' }
        });
        return effects;
    }
    if (text.match(/exert chosen character/i)) {
        effects.push({
            type: 'exert',
            target: { type: 'chosen_character' }
        });
        return effects;
    }

    // Ready Subtype (Moana)
    // "ready your other Princess characters"
    // "you may ready your other Princess characters"
    const readySubtypeMatch = text.match(/(?:you may )?ready your (other )?(.+?) characters/i);
    if (readySubtypeMatch) {
        const isOther = !!readySubtypeMatch[1];
        const subtype = readySubtypeMatch[2];

        effects.push({
            type: 'ready',
            target: {
                type: 'all_characters',
                filter: {
                    mine: true,
                    subtype,
                    other: isOther
                }
            },
            optional: text.match(/you may/i) ? true : false
        });
        return effects;
    }

    // Can't Quest
    // "this character can't quest for the rest of this turn"
    if (text.match(/this character can't quest/i)) {
        effects.push({
            type: 'restriction',
            restriction: 'cant_quest',
            target: { type: 'self' },
            duration: 'turn'
        });
        return effects;
    }

    // Captain Hook: While exerted, opposing subtype can't quest
    // "While this character is exerted, opposing Pirate characters can't quest."
    const whileExertedOppSubtypeCantQuestMatch = text.match(/^while this character is exerted, opposing (.+?) characters can't quest/i);
    if (whileExertedOppSubtypeCantQuestMatch) {
        const subtype = whileExertedOppSubtypeCantQuestMatch[1].toLowerCase();
        effects.push({
            type: 'restriction',
            restriction: 'cant_quest',
            target: { type: 'all_opposing_characters', filter: { subtype } },
            condition: { type: 'while_self_exerted' }
        });
        return effects;
    }

    // Hans: Multi-subtype quest restriction
    // "King and Queen characters can't quest."
    // "Prince and Princess characters can't quest."
    const multiSubtypeCantQuestMatch = text.match(/^(.+?)\s+and\s+(.+?)\s+characters can't quest/i);
    if (multiSubtypeCantQuestMatch) {
        const subtype1 = multiSubtypeCantQuestMatch[1].trim();
        const subtype2 = multiSubtypeCantQuestMatch[2].trim();

        effects.push({
            type: 'restriction',
            restriction: 'cant_quest',
            target: {
                type: 'all_characters',
                filter: { subtypes: [subtype1, subtype2] }
            }
        });
        return effects;
    }

    // "This character can't move to locations."
    if (text.match(/this character can't move to locations/i)) {
        effects.push({
            type: 'restriction',
            restriction: 'cant_move_to_locations',
            target: { type: 'self' }
        });
        return effects;
    }

    // Opposing characters can't quest
    // "opposing characters can't quest"
    if (text.match(/opposing characters can't quest/i)) {
        effects.push({
            type: 'restriction',
            restriction: 'cant_quest',
            target: { type: 'all_opposing_characters' }
        });
        return effects;
    }

    // Can't Quest (Moana - follow up)
    // "They can't quest for the rest of this turn"
    if (text.match(/they can't quest/i)) {
        effects.push({
            type: 'restriction',
            restriction: 'cant_quest',
            target: { type: 'same_target' }, // Refers to the target of the previous effect
            duration: 'turn'
        });
        return effects;
    }

    // Can't Challenge & Must Quest (Gaston - Frightful Bully)
    // "chosen opposing character can't challenge and must quest if able during their next turn"
    const cantChallengeAndMustQuestMatch = text.match(/chosen (opposing )?character can't challenge and must quest if able during their next turn/i);
    if (cantChallengeAndMustQuestMatch) {
        effects.push({
            type: 'restriction',
            restriction: 'cant_challenge',
            duration: 'next_turn',
            target: { type: 'chosen_character', filter: { opponent: true } }
        });
        effects.push({
            type: 'force_quest',
            duration: 'next_turn',
            target: { type: 'chosen_character', filter: { opponent: true } }
        });
        return effects;
    }

    // Can't Challenge
    // "chosen opposing character can't challenge during their next turn"
    const cantChallengeMatch = text.match(/chosen (opposing )?character can't challenge during their next turn/i);
    if (cantChallengeMatch) {
        effects.push({
            type: 'restriction',
            restriction: 'cant_challenge',
            duration: 'next_turn',
            target: { type: 'chosen_character', filter: { opponent: true } }
        });
        return effects;
    }

    // Characters with cost N or less can't challenge this character/your characters
    const cantChallengeThisMatch = text.match(/characters with cost (\d+) or less can't challenge (this character|your characters)/i);
    if (cantChallengeThisMatch) {
        const cost = parseInt(cantChallengeThisMatch[1]);
        const targetType = cantChallengeThisMatch[2].toLowerCase() === 'this character' ? 'self' : 'all_characters';
        const filter = targetType === 'all_characters' ? { mine: true } : undefined;
        const restriction = targetType === 'all_characters' ? 'cant_challenge_yours' : 'cant_challenge_target';

        effects.push({
            type: 'restriction',
            restriction,
            target: { type: targetType, filter },
            sourceFilter: { cost: { max: cost } }
        });
        return effects;
    }

    // Damaged characters can't challenge (Batch 48)
    if (text.match(/damaged characters can't challenge/i)) {
        effects.push({
            type: 'restriction',
            restriction: 'cant_challenge',
            target: { type: 'all_characters', filter: { status: 'damaged' } }
        });
        return effects;
    }

    // Opponents can't choose to discard (Batch 47)
    // "opponents can't choose to discard cards from your hand during their turn"
    if (text.match(/opponents can't choose to discard cards from your hand/i)) {
        effects.push({
            type: 'prevention',
            preventionType: 'discard_choice',
            target: { type: 'self_player' } // You can't be chosen to discard
        });
        return effects;
    }

    // Aurora - Lore Guardian: "Opponents can't choose your items for abilities or effects."
    if (text.match(/opponents can't choose your items for abilities or effects/i)) {
        effects.push({
            type: 'prevention',
            preventionType: 'choose_for_abilities',
            target: { type: 'all_items', mine: true }
        });
        return effects;
    }

    // Each player chooses and banishes (Batch 40)
    // "Each player chooses a location or item and banishes it."
    // "Each player chooses and banishes one of their locations or items."
    // MUST contain "banish" to avoid capturing "deals damage" or "returns" effects
    const eachPlayerBanishMatch = text.match(/each (player|opponent) chooses (?:and banishes )?(?:a|an|one of their) (.+?)(?: (?:of theirs|and banishes it))?\.?$/i);
    if (eachPlayerBanishMatch && text.match(/banish/i)) {
        const targetEntity = eachPlayerBanishMatch[1].toLowerCase();
        const cardTypeRaw = eachPlayerBanishMatch[2];

        // Handle "locations or items" / "location or item"
        let cardType: any = parseCardType(cardTypeRaw);
        if (cardTypeRaw.match(/locations? or items?/i)) {
            cardType = ['location', 'item'];
        }

        const isOpponent = targetEntity === 'opponent';
        const type = isOpponent ? 'opponent_choice_action' : 'each_player_chooses_action';

        effects.push({
            type,
            action: 'banish',
            target: { type: 'chosen_card', filter: { cardType, mine: true } }
        });
        return effects;
    }

    // Can't Play Unless (Not Without My Family)
    // "you can't play this character unless you have 5 or more characters in play"
    const cantPlayUnlessMatch = text.match(/you can't play this character unless you have (\d+) or more characters in play/i);
    if (cantPlayUnlessMatch) {
        const amount = parseInt(cantPlayUnlessMatch[1]);
        effects.push({
            type: 'restriction',
            restriction: 'cant_play_unless',
            condition: {
                type: 'presence',
                amount,
                filter: { type: 'character', mine: true }
            }
        });
        return effects;
    }

    // "You can't play this character unless an opposing character was damaged this turn" (Nathaniel Flint)
    if (text.match(/you can't play this character unless an opposing character was damaged this turn/i)) {
        effects.push({
            type: 'restriction',
            restriction: 'cant_play_unless',
            condition: {
                type: 'opposing_character_damaged_this_turn'
            }
        });
        return effects;
    }

    // Opponents can't play actions (Pete)
    // "Opponents can't play actions until the start of your next turn."
    if (text.match(/opponents can't play actions/i)) {
        effects.push({
            type: 'restriction',
            restriction: 'cant_play_actions',
            target: { type: 'all_opponents' },
            duration: text.match(/until the start of your next turn/i) ? 'next_turn_start' : undefined
        });
        return effects;
    }

    // Morph - Play with Shift
    // "You may play any character with Shift on this character."
    if (text.match(/you may play any character with shift on this character/i)) {
        effects.push({
            type: 'allow_shift_on_self'
        });
        return effects;
    }

    // Your characters named X can't be challenged
    const cantBeChallengedMatch = text.match(/named\s+(.+?)\s+can't be challenged/i);
    if (cantBeChallengedMatch) {
        effects.push({
            type: 'restriction',
            restriction: 'cant_be_challenged',
            target: { type: 'my_characters', filter: { name: cantBeChallengedMatch[1].toLowerCase() } }
        });
        return effects;
    }

    // BATCH 45: Can't ready (self at start of turn) - must be before generic "can't ready"
    // "this character can't ready at the start of your turn"
    // "this character enters play exerted and can't ready at the start of your turn"
    if (text.match(/this character (?:enters play exerted and )?can't ready at the start of your turn/i)) {
        // Extract compound effect if present
        if (text.match(/this character enters play exerted and can't ready/i)) {
            // Two effects: enters play exerted + can't ready
            effects.push({
                type: 'enters_play_exerted',
                target: { type: 'self' }
            });
        }

        effects.push({
            type: 'cant_ready',
            target: { type: 'self' },
            timing: 'turn_start'
        });

        return effects;
    }

    // BATCH 45: Can't ready (I'm Stuck!)
    // "chosen exerted character can't ready at the start of their next turn"
    if (text.match(/chosen (?:exerted )?character can't ready/i)) {
        effects.push({
            type: 'cant_ready',
            target: { type: 'chosen_character', filter: { exerted: true } },
            duration: 'next_turn_start'
        });



        return effects;
    }

    // Opposing characters can't ready (Genie - Phenomenal Showman)
    // "opposing characters can't ready at the start of their turn"
    if (text.match(/opposing characters can't ready/i)) {
        effects.push({
            type: 'cant_ready',
            target: {
                type: 'all_characters',
                filter: { opponent: true }
            }
        });
        return effects;
    }

    // Mulan - Standing Her Ground: "If you've put a card under one of your characters or locations this turn, this character takes no damage from challenges."
    const putCardUnderMatch = text.match(/^if you've put a card under (?:one of )?your characters? (?:or locations? )?this turn, (.+)/i);
    if (putCardUnderMatch) {
        const subEffectText = putCardUnderMatch[1];
        const thenEffects = parseStaticEffects(subEffectText);
        if (thenEffects.length > 0) {
            return thenEffects.map(effect => ({
                ...effect,
                condition: { type: 'card_put_under_this_turn' }
            }));
        } else {
        }
    }

    // PHASE 7A: Conditional Can't Ready (Demona, Bronx)
    // "If you have 3 or more cards in your hand, this character can't ready"
    const conditionalCantReadyMatch = text.match(/if you have (\d+) or more cards in your hand, this character can'?t ready/i);
    if (conditionalCantReadyMatch) {
        const amount = parseInt(conditionalCantReadyMatch[1]);
        effects.push({
            type: 'conditional_cant_ready',
            condition: {
                type: 'hand_size',
                operator: '>=',
                amount
            },
            restriction: 'cant_ready',
            target: { type: 'self' }
        });
        return effects;
    }

    // PHASE 7A: During Turn Gains Keyword (Scrooge McDuck, Grumpy)
    // "During your turn, this character gains Evasive" (already handled by lines 34-42)
    // Note: This pattern is already covered by the global "During your turn" handler at line 34
    // which wraps the inner effect with condition: { type: 'during_your_turn' }
    // No additional pattern needed here!

    // Return to hand (Genie, etc.)
    // "return this card to your hand"
    if (text.match(/(?:you may )?return this card to your hand/i)) {
        effects.push({
            type: 'return_to_hand',
            target: { type: 'self' },
            optional: text.match(/you may/i) ? true : false
        });
    }

    // Return Named Card from Discard (Captain Hook, Nick Wilde) - MUST be before generic return
    // "return an action card named fire the cannons! from your discard to your hand"
    // "return an item card named pawpsicle from your discard to your hand"
    const returnNamedMatch = text.match(/return (?:a|an) (.+?) card named (.+?) from your discard to your hand/i);
    if (returnNamedMatch) {
        const cardTypeRaw = returnNamedMatch[1];
        const cardName = returnNamedMatch[2];
        const cardType = parseCardType(cardTypeRaw);

        effects.push({
            type: 'return_from_discard',
            target: {
                type: 'card_in_discard',
                filter: { cardType, name: cardName }
            },
            destination: 'hand',
            optional: text.match(/you may/i) ? true : false
        });
        return effects;
    }

    // Return from Discard (Generic) - fallback if named version didn't match
    // "return a character card from your discard to your hand"
    // "return a Pirate character card from your discard to your hand"
    const returnDiscardMatch = text.match(/return an? (.+?) card from (?:your )?discard(?: pile)? to (?:your )?hand/i);
    if (returnDiscardMatch) {
        const fullType = returnDiscardMatch[1].toLowerCase();
        let cardType = fullType;
        let subtype: string | undefined = undefined;

        if (fullType.includes('character')) {
            cardType = 'character';
            const parts = fullType.split(' character');
            if (parts[0].trim().length > 0) {
                subtype = parts[0].trim();
            }
        } else if (fullType.includes('item')) {
            cardType = 'item';
        } else if (fullType.includes('action')) {
            cardType = 'action';
        }

        effects.push({
            type: 'return_from_discard',
            target: {
                type: 'card_in_discard',
                filter: {
                    cardType,
                    subtype
                }
            },
            destination: 'hand',
            optional: text.match(/you may/i) ? true : false
        });
        return effects;
    }

    // Gain Lore For Each (Pack Tactics) - MUST be before simple "Gain Lore"
    // "Gain 1 lore for each damaged character opponents have in play."
    const gainLorePerMatch = text.match(/gain (\d+) lore for each damaged character(?:s)? opponents have in play/i);
    if (gainLorePerMatch) {
        effects.push({
            type: 'gain_lore',
            amount: parseInt(gainLorePerMatch[1]),
            per: 'damaged_opponent_character'
        });
        return effects;
    }

    // Simple Gain Lore - MUST be AFTER complex variants (specific before general!)
    // "gain 1 lore" or "you gain 2 lore"
    const simpleGainLoreMatch = text.match(/(?:you )?gain (\d+) lore/i);
    if (simpleGainLoreMatch) {
        effects.push({
            type: 'gain_lore',
            amount: parseInt(simpleGainLoreMatch[1])
        });
        return effects;
    }

    // Can Challenge Ready (Pick a Fight, Gizmoduck)  
    // "Chosen character can challenge ready characters this turn."
    // "This character can challenge ready damaged characters."
    const challengeReadyMatch = text.match(/(?:chosen )?character(?:s)? can challenge ready (damaged )?characters?(?: this turn)?/i);
    if (challengeReadyMatch) {
        const isDamaged = !!challengeReadyMatch[1];
        effects.push({
            type: 'grant_ability',
            ability: isDamaged ? 'can_challenge_ready_damaged' : 'can_challenge_ready',
            target: { type: text.match(/chosen/i) ? 'chosen_character' : 'self' },
            duration: text.match(/this turn/i) ? 'turn' : undefined
        });
        return effects;
    }

    // Put Chosen into Inkwell (Pleakley - Scientific Expert, Hades - King of Olympus)
    // "put chosen character of yours into your inkwell facedown and exerted"
    // "put chosen opposing character into their player's inkwell facedown"
    // Sudden Scare: "Put chosen opposing character into their player's inkwell facedown. That player puts the top card of their deck into their inkwell facedown."
    const putChosenInkwellMatch2 = text.match(/put ((?:chosen|another) (?:[a-z]+ )?(?:character|item)(?: of yours)?) into (?:your|their player'?s?) inkwell/i);
    if (putChosenInkwellMatch2) {
        const targetText = putChosenInkwellMatch2[1];
        let target: any = parseTarget(targetText);

        effects.push({
            type: 'put_into_inkwell',
            target,
            facedown: text.match(/facedown/i) ? true : false,
            exerted: text.match(/exerted/i) ? true : false,
            optional: text.match(/you may/i) ? true : false
        });

        // Check for chained effect: "That player puts the top card of their deck into their inkwell"
        // This occurs in Sudden Scare where the opponent also adds a card from their deck
        if (text.match(/that player puts the top card of their deck into their inkwell/i)) {
            effects.push({
                type: 'opponent_deck_to_inkwell',
                target: { type: 'target_owner' }, // The owner of the character that was moved
                amount: 1,
                facedown: true
            });
        }

        return effects;
    }

    // Ink from Hand (Winnie the Pooh) - "put a card from your hand into your inkwell"
    const inkFromHandMatch = text.match(/put (?:a|an) card from your hand into your inkwell/i);
    if (inkFromHandMatch) {
        effects.push({
            type: 'ink_from_hand',
            amount: 1,
            facedown: text.match(/facedown/i) ? true : false,
            optional: text.match(/you may/i) ? true : false
        });
        return effects;
    }

    // Put into Inkwell (Tinker Bell - Peter Pan's Ally, Heart of Te Fiti)
    // "put that card into your inkwell facedown and exerted"
    // "Put the top card of your deck into your inkwell facedown and exerted"
    const putInkwellMatch = text.match(/put (?:that card|it|the top card of your deck) into your inkwell/i);
    if (putInkwellMatch) {
        let targetType = 'trigger_card';
        if (text.match(/top card of your deck/i)) {
            targetType = 'top_card_of_deck';
        }

        effects.push({
            type: 'put_into_inkwell',
            target: { type: targetType },
            exerted: true
        });
        return effects;
    }

    // Put top card under target (Scrooge - Uncle Moneybags / The Prophecy)
    // "Put the top card of your deck facedown under one of your characters or locations with Boost."
    const putUnderMatch = text.match(/put the top card of your deck facedown under one of your (characters or locations|characters|locations)(?: with (.+))?/i);
    if (putUnderMatch) {
        const keywordFilter = putUnderMatch[2] ? putUnderMatch[2].replace(/\.$/, '').trim() : undefined;
        const targetTypeRaw = putUnderMatch[1];
        let typeFilter: string[] | string = 'character';

        if (targetTypeRaw.includes('characters') && targetTypeRaw.includes('locations')) {
            typeFilter = ['character', 'location'];
        } else if (targetTypeRaw.includes('locations')) {
            typeFilter = 'location';
        }

        effects.push({
            type: 'put_card_under',
            source: 'top_of_deck',
            target: {
                type: 'chosen_permanent', // Generalize to permanent for char/loc
                filter: {
                    mine: true,
                    type: typeFilter,
                    keyword: keywordFilter
                }
            },
            facedown: true
        });
        return effects;
    }

    // Vault Door: "Your locations and characters at locations gain Resist +1."
    const vaultDoorMatch = text.match(/^your locations and characters at locations gain resist \+(\d+)/i);
    if (vaultDoorMatch) {
        const resistValue = parseInt(vaultDoorMatch[1]);
        // Grant to locations
        effects.push({
            type: 'grant_keyword',
            keyword: `Resist + ${resistValue} `,
            target: { type: 'all_locations', filter: { mine: true } }
        });
        // Grant to characters at locations
        effects.push({
            type: 'grant_keyword',
            keyword: `Resist + ${resistValue} `,
            target: { type: 'all_characters', filter: { mine: true, location: 'at_location' } } // Approximate filter
        });
        return effects;
    }

    // Hercules: Conditional damage prevention (unless being challenged)
    // "This character can't be dealt damage unless he's being challenged."
    // "Your other Hero characters can't be dealt damage unless they're being challenged."
    const conditionalDamagePreventMatch = text.match(/^(this character|your other (.+?) characters) can't be dealt damage unless (?:he's|she's|they're) being challenged/i);
    if (conditionalDamagePreventMatch) {
        const targetText = conditionalDamagePreventMatch[1].toLowerCase();
        const subtype = conditionalDamagePreventMatch[2]?.toLowerCase();

        let target: any;
        if (targetText === 'this character') {
            target = { type: 'self' };
        } else {
            target = {
                type: 'other_characters',
                filter: { mine: true }
            };
            if (subtype) {
                target.filter.subtype = subtype;
            }
        }

        effects.push({
            type: 'prevent_damage',
            source: 'any',
            target,
            condition: { unless: 'being_challenged' }
        });
        return effects;
    }

    // Baloo - "Your characters with 7 ¤ or more can't be dealt damage."
    const balooMatch = text.match(/your characters with (\d+) (strength|willpower|lore|¤) or more can't be dealt damage/i);
    if (balooMatch) {
        effects.push({
            type: 'prevent_damage',
            source: 'any',
            target: {
                type: 'all_characters',
                filter: {
                    mine: true,
                    stat_min: {
                        stat: balooMatch[2].toLowerCase(),
                        value: parseInt(balooMatch[1])
                    }
                }
            }
        });
        return effects;
    }

    // Generic For Each Loop (Damage Spreader)

    // Owl Island: For each character here, cost reduction for first card per turn
    // "For each character you have here, you pay 1 ⬡ less for the first action you play each turn."
    const forEachCharacterHereCostRedMatch = text.match(/^for each character you have here, you pay (\d+) ⬡ less for the first (.+?) you play each turn/i);
    if (forEachCharacterHereCostRedMatch) {
        const amount = parseInt(forEachCharacterHereCostRedMatch[1]);
        const cardType = forEachCharacterHereCostRedMatch[2].toLowerCase();

        effects.push({
            type: 'cost_reduction',
            amount: { type: 'per_character_at_location', multiplier: amount },
            filter: { cardType },
            condition: { type: 'first_per_turn' }
        });
        return effects;
    }

    // Location: While you have a character here (Illuminary Tunnels)
    // "While you have a character here, you pay 1 ⬡ less to play locations."
    const locationCharacterHereMatch = text.match(/^while you have a character here, (.+)/i);
    if (locationCharacterHereMatch) {
        const subEffectText = locationCharacterHereMatch[1];
        const thenEffects = parseStaticEffects(subEffectText);
        if (thenEffects.length > 0) {
            // Apply condition to all parsed effects
            return thenEffects.map(effect => ({
                ...effect,
                condition: { type: 'character_at_location', target: 'self' }
            }));
        }
    }

    // Global Restriction: Only one character can challenge (Prince Charming)
    // "Each turn, only one character can challenge."
    if (text.match(/each turn, only one character can challenge/i)) {
        effects.push({
            type: 'restriction',
            restriction: 'max_challenges_per_turn',
            value: 1,
            target: { type: 'all_players' }
        });
        return effects;
    }

    // Takes no damage from challenges (Mulan, Mickey Mouse)
    const takesNoDamageMatch = text.match(/this character takes no damage from challenges/i);
    if (takesNoDamageMatch) {
        effects.push({
            type: 'invulnerable',
            preventionType: 'challenges',
            target: { type: 'self' }
        });
        return effects;
    }

    // Generic For Each Loop (Damage Spreader)
    // "For each other character you have in play, deal 1 damage to it."
    const forEachLoopMatch = text.match(/^for each (.+) you have in play, (.+)/i);
    if (forEachLoopMatch) {
        const targetText = forEachLoopMatch[1].toLowerCase();
        const effectText = forEachLoopMatch[2].toLowerCase();

        // 1. Determine Source
        let source: any = { type: 'all_characters' }; // Base type expected by test
        const filter: any = {};

        if (targetText.includes('you have in play')) {
            filter.mine = true;
        }
        if (targetText.includes('other')) {
            filter.excludeSelf = true;
        }

        if (Object.keys(filter).length > 0) {
            source.filter = filter;
        }

        // 2. Parse Effect
        let subEffect: any = {};
        const damageMatch = effectText.match(/deal (\d+) damage to (?:it|them)/i);
        if (damageMatch) {
            subEffect = {
                type: 'damage',
                amount: parseInt(damageMatch[1]),
                target: { type: 'variable', name: 'target' }
            };
        }

        if (subEffect.type) {
            effects.push({
                type: 'for_each',
                variable: 'target',
                source,
                effect: subEffect
            });
            return effects;
        }
    }

    // Stat Buff per Source (Illuminary Tunnels)
    // "this location gets +1 ◊ for each other location you have in play"
    const buffPerSourceMatch = text.match(/^this (location|character) gets ([+-]\d+) (strength|willpower|lore|¤|◊|⛉) for each (.+)/i);
    if (buffPerSourceMatch) {
        const targetTypeRaw = buffPerSourceMatch[1]; // location or character
        const amount = parseInt(buffPerSourceMatch[2]);
        const statSymbol = buffPerSourceMatch[3];
        const sourceText = buffPerSourceMatch[4].toLowerCase();

        const stat = (statSymbol === '◊' || statSymbol === '⛉') ? 'lore'
            : (statSymbol === '¤' || statSymbol === 'strength') ? 'strength'
                : 'willpower';

        const target = { type: targetTypeRaw === 'location' ? 'self' : 'self' };

        const perCount: any = {};
        if (sourceText.includes('other location') && sourceText.includes('you have in play')) {
            perCount.type = 'locations_in_play';
            perCount.filter = { mine: true, other: true };
        } else if (sourceText.includes('character') && sourceText.includes('you have in play')) {
            perCount.type = 'characters_in_play';
            perCount.filter = { mine: true };
            if (sourceText.includes('other')) perCount.filter.other = true;
        }

        if (perCount.type) {
            effects.push({
                type: 'modify_stats',
                stat,
                amount,
                target,
                per_count: perCount
            });
            return effects;
        }
    }

    // John Silver: "For each location you have in play, this character gains Resist +1 and gets +1 ◊."
    const silverMatch = text.match(/^for each location you have in play, this character gains resist \+(\d+) and gets \+(\d+) ([◊¤])/i);
    if (silverMatch) {
        const resistValue = parseInt(silverMatch[1]);
        const statValue = parseInt(silverMatch[2]);
        const statSymbol = silverMatch[3];
        const stat = statSymbol === '◊' ? 'lore' : 'strength';

        effects.push({
            type: 'grant_keyword',
            keyword: `Resist + ${resistValue} `,
            target: { type: 'self' },
            per_count: {
                type: 'locations_in_play',
                mine: true
            }
        });
        effects.push({
            type: 'modify_stats',
            stat,
            amount: statValue,
            target: { type: 'self' },
            per_count: {
                type: 'locations_in_play',
                mine: true
            }
        });
        return effects;
    }

    // Fallback: Unknown pattern is already handled earlier at line 273, so this duplicate is removed

    // Deal Damage
    // "deal 1 damage to chosen character"
    // "deal 2 damage to chosen opposing character"
    const damageMatch = text.match(/(?:you may )?deal (\d+) damage to chosen (damaged )?(opposing )?character/i);
    if (damageMatch) {
        const amount = parseInt(damageMatch[1]);
        const isDamaged = !!damageMatch[2];
        const isOpposing = !!damageMatch[3];

        let targetType = 'chosen_character';
        if (isOpposing) {
            targetType = 'chosen_opposing_character';
        }

        effects.push({
            type: 'damage',
            amount,
            target: {
                type: targetType,
                filter: isDamaged ? { damaged: true } : undefined
            },
            optional: text.match(/you may/i) ? true : false
        });
        return effects;
    }

    // Look at top X, put one in hand, rest on bottom (Develop Your Brain, Tinker Bell)
    // Also handles "put 2 of them" or "put up to 2 of them"
    const lookTopMoveHandMatch = text.match(/look at the top (\d+) cards of your deck\.? (?:and |you may )?(?:reveal .+? and )?put (?:it|one|(?:up to )?(\d+)(?: of them)?) into your hand\.? (?:and |put )?(?:the rest|the other) on the (?:bottom|bottom of your deck)/i);
    if (lookTopMoveHandMatch) {
        console.error("DEBUG: MATCHED LOOK AND MOVE:", text);
        const lookAmount = parseInt(lookTopMoveHandMatch[1]);
        const moveAmountStr = lookTopMoveHandMatch[2];
        const moveAmount = moveAmountStr ? parseInt(moveAmountStr) : 1;

        effects.push({
            type: 'look_and_move',
            amount: lookAmount,
            moveAmount,
            destination: 'hand',
            restDestination: 'bottom',
            optional: text.match(/you may/i) ? true : false
        });
        return effects;
    }

    // Look at top card and put on top or bottom (Yzma - Alchemist)
    // "look at the top card of your deck. Put it on either the top or the bottom of your deck."
    if (text.match(/look at the top (?:card )?of your deck(?:.| and) put it on either the top or the bottom of your deck/i)) {
        effects.push({
            type: 'look_at_top_deck',
            amount: 1,
            destination: 'top_or_bottom'
        });
        return effects;
    }

    // Look at top X, put one on top, rest on bottom (Dr. Facilier - Remarkable Gentleman)
    // "look at the top 2 cards of your deck and put one on the top of your deck and the rest on the bottom"
    // "look at the top 2 cards of your deck and put one on the top of your deck and the other on the bottom"
    const lookTopMoveTopMatch = text.match(/look at the top (\d+) cards of your deck and put one on the top of your deck and the (?:rest|other) on the bottom/i);
    if (lookTopMoveTopMatch) {
        const amount = parseInt(lookTopMoveTopMatch[1]);
        effects.push({
            type: 'scry',
            amount,
            mode: 'one_top_rest_bottom'
        });
        return effects;
    }

    // Look at top X cards and put them back in any order (Ursula's Cauldron)
    const lookRearrangeMatch = text.match(/look at the top (\d+) cards of your deck and put them back on the top of your deck in any order/i);
    if (lookRearrangeMatch) {
        const amount = parseInt(lookRearrangeMatch[1]);
        effects.push({
            type: 'look_and_rearrange',
            amount,
            destination: 'top_deck'
        });
        return effects;
    }
    // Shuffle from discard to deck (Magic Broom)
    if (text.match(/shuffle a card from any discard into its player's deck/i)) {
        effects.push({
            type: 'shuffle_from_discard_to_deck',
            optional: text.match(/you may/i) ? true : false
        });
        return effects;
    }

    // Return trigger card to hand (Dr. Facilier - Agent Provocateur)
    // Ursula's Lair: "you may return them to your hand"
    const returnThemMatch = text.match(/you may return them to (?:their player's|your) hand/i);
    if (returnThemMatch) {
        effects.push({
            type: 'return_to_hand',
            target: { type: 'trigger_target' }, // The "them" refers to the banished character from the trigger
            optional: true
        });
        return effects;
    }

    // "You may return that card to your hand"
    if (text.match(/return (?:that card|it) to your hand/i)) {
        effects.push({
            type: 'return_to_hand',
            target: { type: 'trigger_card' },
            optional: text.match(/you may/i) ? true : false
        });
        return effects;
    }

    // Move damage (Mama Odie)
    // "move up to 2 damage counters from chosen character to chosen opposing character"
    const moveDamageMatch = text.match(/move (?:up to )?(\d+) damage (?:counters? )?from (.+?) to (.+)/i);
    if (moveDamageMatch) {
        const amount = parseInt(moveDamageMatch[1]);
        const fromText = moveDamageMatch[2];
        const toText = moveDamageMatch[3];

        let fromTarget = { type: 'chosen_character' };
        if (fromText.includes('chosen character')) fromTarget = { type: 'chosen_character' };

        let toTarget = { type: 'chosen_opposing_character' };
        if (toText.includes('chosen opposing character')) toTarget = { type: 'chosen_opposing_character' };

        effects.push({
            type: 'move_damage',
            amount,
            from: fromTarget,
            to: toTarget,
            optional: text.match(/you may/i) ? true : false
        });
        return effects;
    }

    // Discard Prevention (Magica De Spell)
    // "during opponents' turns, if an effect would cause you to discard one or more cards from your hand, you don't discard."
    if (text.match(/if an effect would cause you to discard one or more cards from your hand, you don't discard/i)) {
        effects.push({
            type: 'prevention',
            preventionType: 'discard',
            condition: { type: 'during_opponents_turn' }
        });
        return effects;
    }

    // Prevent damage (Healing Glow)
    // "Prevent the next 2 damage that would be dealt to chosen character this turn."
    const preventDamageMatch = text.match(/prevent the next (\d+) damage that would be dealt to (.+?) this turn/i);
    if (preventDamageMatch) {
        const amount = parseInt(preventDamageMatch[1]);
        const targetText = preventDamageMatch[2];

        let target = { type: 'chosen_character' };
        if (targetText.includes('chosen character')) target = { type: 'chosen_character' };

        effects.push({
            type: 'prevent_damage',
            amount,
            target,
            duration: 'turn'
        });
        return effects;
    }




    // Deal damage to self
    // "deal 1 damage to this character"
    const damageSelfMatch = text.match(/deal (\d+) damage to this character/i);
    if (damageSelfMatch) {
        effects.push({
            type: 'damage',
            amount: parseInt(damageSelfMatch[1]),
            target: { type: 'self' }
        });
    }

    // Rescue Rangers Away!
    // "Chosen character loses ¤ equal to that number until the start of your next turn."
    const losesEqualMatch = text.match(/chosen character loses (strength|willpower|lore|¤|※|🛡️|⛉|◊|⬡) equal to that number/i);
    if (losesEqualMatch) {
        let stat = 'strength';
        const symbol = losesEqualMatch[1].toLowerCase();
        if (['willpower', '🛡️', '⛉'].includes(symbol)) stat = 'willpower';
        if (['lore', '◊', '⬡'].includes(symbol)) stat = 'lore';
        if (['¤'].includes(symbol)) stat = 'strength';

        effects.push({
            type: 'modify_stats_by_count',
            stat,
            amountMultiplier: -1,
            target: { type: 'chosen_character' },
            countTarget: { type: 'all_characters', filter: { mine: true } },
            duration: 'until_start_of_next_turn'
        });
        return effects;
    }

    // Ready this character
    if (text.match(/^ready this character\.?$/i)) {
        effects.push({
            type: 'ready',
            target: { type: 'self' }
        });
        return effects;
    }


    // Ready chosen [Subtype] character (Mr. Smee)
    // "you may ready chosen Pirate character"
    // "ready chosen Pirate character"
    const readySubtypeMatch2 = text.match(/^(?:you may )?ready chosen ([A-Za-z]+) character/i);
    if (readySubtypeMatch2) {
        const subtype = readySubtypeMatch2[1].toLowerCase();
        effects.push({
            type: 'ready',
            target: {
                type: 'chosen_character',
                filter: { subtype }
            }
        });
        return effects;
    }

    // CAMPAIGN: Stabbington Brother - "deal 2 damage to each character in play" (Generalized)
    const globalDamageMatch = text.match(/deal (\d+) damage to each character in play/i);
    if (globalDamageMatch) {
        effects.push({
            type: 'deal_damage',
            amount: parseInt(globalDamageMatch[1]),
            target: { type: 'all_characters' }
        });
    }

    // CAMPAIGN: Moana - "ready other chosen Princess characters"
    if (text.match(/ready other chosen Princess characters/i)) {
        effects.push({
            type: 'ready',
            target: {
                type: 'chosen_character',
                filter: {
                    subtype: 'princess',
                    other: true
                }
            }
        });
    }

    // CAMPAIGN: HeiHei - "put all cards from your hand into your inkwell facedown and exerted"
    if (text.match(/put all cards from your hand into your inkwell facedown and exerted/i)) {
        effects.push({
            type: 'ink_from_hand', // Special campaign handling, or generalize
            target: { type: 'all_cards', filter: { zone: 'hand' } },
            facedown: true,
            exerted: true
        });
    }

    // Perdita - Determined Mother - "put all Puppy character cards from your discard into your inkwell facedown and exerted"
    const perditaMatch = text.match(/put all (.+?) cards from your discard into your inkwell facedown and exerted/i);
    if (perditaMatch) {
        const filterText = perditaMatch[1];
        effects.push({
            type: 'put_into_inkwell',
            target: {
                type: 'all_cards',
                filter: {
                    zone: 'discard',
                    ...parseTargetFilter(filterText)
                }
            },
            facedown: true,
            exerted: true,
            optional: text.includes('you may')
        });
    }

    // CAMPAIGN: Tamatoa - "return up to 2 item cards from your discard to your hand"
    const returnItemsMatch = text.match(/return up to (\d+) item cards from your discard to your hand/i);
    if (returnItemsMatch) {
        effects.push({
            type: 'return_from_discard',
            amount: parseInt(returnItemsMatch[1]),
            target: {
                type: 'chosen_item_from_discard',
                count: parseInt(returnItemsMatch[1])
            }
        });
    }

    // CAMPAIGN: Jafar - "Jafar deals 1 damage to each opposing character."
    const damageEachOpposingMatch = text.match(/deal (\d+) damage to each opposing character/i);
    if (damageEachOpposingMatch) {
        effects.push({
            type: 'damage',
            amount: parseInt(damageEachOpposingMatch[1]),
            target: { type: 'each_opposing_character' }
        });
        return effects;
    }


    // Cruella: Cost-filtered mass opposing stat modifier
    // "Each opposing character with cost 2 or less gets -1 ¤."
    const filteredOpposingStatMatch = text.match(/each opposing character with cost (\d+) or less gets ([+-])(\d+) (strength|willpower|lore|¤|🛡️|⛉|◊|⬡)/i);
    if (filteredOpposingStatMatch) {
        const maxCost = parseInt(filteredOpposingStatMatch[1]);
        const sign = filteredOpposingStatMatch[2];
        const amount = parseInt(filteredOpposingStatMatch[3]) * (sign === '-' ? -1 : 1);
        const statSymbol = filteredOpposingStatMatch[4];

        let stat = 'strength';
        if (['◊'].includes(statSymbol)) stat = 'lore';
        if (['🛡️', '⛉'].includes(statSymbol)) stat = 'willpower';
        if (['¤'].includes(statSymbol)) stat = 'strength';

        effects.push({
            type: 'modify_stats',
            stat,
            amount,
            target: {
                type: 'all_opposing_characters',
                filter: { maxCost }
            }
        });
        return effects;
    }

    // Mass Stat Change (Goofy - Galumphing Gumshoe)
    // "Each opposing character gets -1 ¤ until the start of your next turn."
    const massStatMatch = text.match(/each opposing character gets ([+-]\d+ (?:strength|willpower|lore|¤|🛡️|⛉|◊|⬡))/i);
    if (massStatMatch) {
        const modification = parseStatModification(massStatMatch[1]);
        if (modification) {
            const effect: any = {
                type: 'modify_stats',
                stat: modification.stat,
                amount: modification.amount,
                target: { type: 'each_opposing_character' }
            };

            if (text.match(/until the start of your next turn/i)) {
                effect.duration = 'next_turn_start';
            } else if (text.match(/this turn/i)) {
                effect.duration = 'turn';
            }

            effects.push(effect);
            return effects;
        }
    }

    // "Each of your characters gets +1 ¤ this turn." (Headless Horseman)
    const eachOfYourCharactersGetsMatch = text.match(/each of your characters gets ([+-]\d+ (?:strength|willpower|lore|¤|🛡️|⛉|◊|⬡))/i);
    if (eachOfYourCharactersGetsMatch) {
        const modification = parseStatModification(eachOfYourCharactersGetsMatch[1]);
        if (modification) {
            const effect: any = {
                type: 'modify_stats',
                stat: modification.stat,
                amount: modification.amount,
                target: {
                    type: 'all_characters',
                    filter: { mine: true }
                }
            };
            if (text.match(/until the start of your next turn/i)) {
                effect.duration = 'next_turn_start';
            } else if (text.match(/this turn/i)) {
                effect.duration = 'turn';
            }
            effects.push(effect);
            return effects;
        }
    }


    // Opponent Choice Damage (Triton's Decree)
    // "Each opponent chooses one of their characters and deals 2 damage to them."
    const opponentChoiceDamageMatch = text.match(/each opponent chooses .+? and deals (\d+) damage/i);
    if (opponentChoiceDamageMatch) {
        effects.push({
            type: 'opponent_choice_action',
            action: 'damage',
            amount: parseInt(opponentChoiceDamageMatch[1])
        });
        return effects;
    }

    // Dawson - Look at top card and put on top or bottom
    if (text.match(/look at the top card of your deck\. You may put it on either the top or the bottom of your deck/i)) {
        effects.push({
            type: 'look_and_move_to_top_or_bottom',
            amount: 1,
            source: 'deck',
            optional: true
        });
    }

    // Opponent Choice Return (Gunther)
    // "each opponent chooses one of their characters and returns that card to their hand"
    const opponentChoiceReturnMatch = text.match(/each opponent chooses .+? and returns .+? to their hand/i);
    if (opponentChoiceReturnMatch) {
        effects.push({
            type: 'opponent_choice_action',
            action: 'return_to_hand'
        });
        return effects;
    }

    // Opponent Choice Banish (Lash Out)
    // "Each opposing player chooses and banishes one of their characters."
    if (text.match(/each opposing player chooses and banishes one of their characters/i)) {
        console.error("DEBUG: MATCHED BANISH BLOCK");
        effects.push({
            type: 'opponent_choice_action',
            action: 'banish',
            target: { type: 'chosen_character', filter: { mine: true } } // Target relative to the opponent
        });
        return effects;
    }

    // Opponent choice discard (Lucifer/Flynn Rider)
    // "each opponent chooses and discards a card"
    if (text.match(/each opponent chooses and discards a card/i)) {
        effects.push({
            type: 'opponent_discard_choice',
            amount: 1,
            target: { type: 'each_opponent' }
        });
        return effects;
    }

    // Each opponent chooses and exerts (Anna - Eager Acolyte)
    // "Each opponent chooses and exerts one of their ready characters."
    if (text.match(/each opponent chooses and exerts one of their ready characters/i)) {
        effects.push({
            type: 'opponent_choice_action',
            action: 'exert',
            target: { type: 'chosen_character', filter: { mine: true, status: 'ready' } }
        });
        return effects;
    }

    // Each opponent draws a card (Earth Giant - Living Mountain)
    if (text.match(/each opponent draws a card/i)) {
        effects.push({
            type: 'draw',
            amount: 1,
            target: { type: 'each_opponent' }
        });
        return effects;
    }

    // Look at top card of each opponent's deck (The Fates - Only One Eye)
    if (text.match(/look at the top card of each opponent's deck/i)) {
        effects.push({
            type: 'look_at_top_deck',
            amount: 1,
            target: { type: 'each_opponent' }
        });
        return effects;
    }

    // Each player chooses and banishes (Rise of the Titans)
    // "Each player chooses and banishes one of their characters, items, or locations."
    if (text.match(/^each player chooses and banishes one of their characters, items, or locations/i)) {
        effects.push({
            type: 'each_player_chooses_action',
            action: 'banish',
            target: {
                type: 'chosen_card',
                filter: {
                    cardType: ['character', 'item', 'location'],
                    mine: true
                }
            }
        });
        return effects;
    }

    // Ready this character
    // "ready this character" or "you may ready this character"
    if (text.match(/(?:you may )?ready this character\.?$/i)) {
        effects.push({
            type: 'ready',
            target: { type: 'self' },
            optional: true // Usually in "you may" context
        });
        return effects;
    }

    // Ready chosen character
    // "you may ready another chosen character of yours"
    const readyChosenMatch = text.match(/(?:you may )?ready (another )?chosen character( of yours)?/i);
    if (readyChosenMatch) {
        const isOptional = text.match(/you may/i);
        const isAnother = !!readyChosenMatch[1];
        const isMine = !!readyChosenMatch[2];

        effects.push({
            type: 'ready',
            target: {
                type: 'chosen_character',
                filter: {
                    mine: isMine ? true : undefined,
                    other: isAnother ? true : undefined
                }
            },
            optional: !!isOptional
        });
        return effects;
    }



    // Enters Play With Damage (Mother Gothel)
    // "This character enters play with 3 damage counters on her."
    const entersWithDamageMatch = text.match(/this character enters play with (\d+) damage(?: counters)?(?: on (?:her|him|it|them))?/i);
    if (entersWithDamageMatch) {
        effects.push({
            type: 'enters_with_damage',
            amount: parseInt(entersWithDamageMatch[1])
        });
        return effects;
    }

    // Move Characters to Location (Voyage)
    // "Move up to 2 characters of yours to the same location for free."
    const moveCharactersMatch = text.match(/move up to (\d+) characters of yours to the same location for free/i);
    if (moveCharactersMatch) {
        effects.push({
            type: 'move_to_location',
            amount: parseInt(moveCharactersMatch[1]),
            target: { type: 'chosen_characters', filter: { mine: true } },
            destination: 'same_location',
            free: true
        });
        return effects;
    }

    // Skip Draw Step (Arthur - Determined Squire)
    // Skip your turn's Draw step (Arthur - Trained Swordsman)
    if (text.match(/skip your turn's draw step/i)) {
        effects.push({
            type: 'rule_modification',
            modification: 'skip_draw_step',
            duration: 'turn'
        });
        return effects;
    }

    // Deck Building Rule (Dalmatian Puppy)
    // "You may have up to 99 copies of Dalmatian Puppy - Tail Wagger in your deck."
    const deckBuildingRuleMatch = text.match(/^you may have up to (\d+) copies of (.+?) in your deck/i);
    if (deckBuildingRuleMatch) {
        const limit = parseInt(deckBuildingRuleMatch[1]);
        const cardName = deckBuildingRuleMatch[2];
        effects.push({
            type: 'deck_building_rule',
            rule: 'max_copies',
            value: limit,
            cardName
        });
        return effects;
    }

    // Damage counters can't be removed (Vision Slab)
    if (text.match(/damage counters can't be removed/i)) {
        effects.push({
            type: 'rule_modification',
            modification: 'cant_remove_damage'
        });
        return effects;
    }

    // Draw until you have the same number (Clarabelle)
    if (text.match(/draw cards until you have the same number/i)) {
        effects.push({
            type: 'draw_until_equal_hand_size',
            reference: 'chosen_opponent'
        });
        return effects;
    }

    // Enters play exerted (Sleepy - Nodding Off)
    if (text.match(/this character enters play exerted/i)) {
        effects.push({
            type: 'enters_play_exerted'
        });
        return effects;
    }

    // ... (existing parsers)



    // PHASE 2: Put/Return from Discard (Gazelle, etc.)
    // "put a song card from your discard on the top of your deck"
    // "put a card from your discard into your hand"
    const putFromDiscardMatch = text.match(/put (?:a|an) (song|character|item|action|card) (?:card )?from (?:your )?discard (?:on (?:the )?top of (?:your )?deck|on (?:the )?bottom of (?:your )?deck|into (?:your )?hand)/i);
    if (putFromDiscardMatch) {
        const typeStr = putFromDiscardMatch[1].toLowerCase();
        let destination = 'hand';
        if (text.match(/top of (?:your )?deck/i)) destination = 'top_deck';
        if (text.match(/bottom of (?:your )?deck/i)) destination = 'bottom_deck';

        const effect: any = {
            type: 'put_from_discard',
            destination,
            optional: text.includes('may put')
        };

        if (typeStr !== 'card') {
            effect.filter = { cardType: typeStr };
        }

        effects.push(effect);
        return effects;
    }

    // BATCH 42: Restriction "can't quest"
    // "they can't quest during their next turn"
    // BATCH 42: Restriction "can't quest"
    // "they can't quest during their next turn"
    // "opposing characters can't quest"
    const cantQuestRestrictionMatch = text.match(/(?:they|that character|opposing characters) can't quest/i);
    if (cantQuestRestrictionMatch) {
        let target: any = { type: 'chosen_character' };
        if (text.match(/opposing (?:characters|players)/i)) {
            target = { type: 'all_opposing_characters' };
        }

        effects.push({
            type: 'restriction',
            restriction: 'cant_quest',
            target,
            duration: text.match(/next turn/i) ? 'next_turn' : undefined
        });
        return effects;
    }

    // Grant Keyword to chosen character (Philo, Fidget)
    // "chosen character gains Challenger +3"
    // "another chosen character of yours gains Evasive"
    const grantKeywordMatch2 = text.match(/(?:another )?chosen (?:character|ally)(?: of yours)? gains (.*?)(?: until the start of your next turn)?\.?$/i);
    if (grantKeywordMatch2) {
        const keywordsStr = grantKeywordMatch2[1];
        // Clean up keywords string (remove "+X" if present for parsing)
        const keyword = keywordsStr.replace(/\+\d+/, '').trim();
        const amountMatch = keywordsStr.match(/\+(\d+)/);
        const amount = amountMatch ? parseInt(amountMatch[1]) : 1;

        effects.push({
            type: 'grant_keyword',
            keyword,
            amount,
            target: { type: 'chosen_character' },
            duration: text.includes('until the start of your next turn') ? 'next_turn' : undefined
        });
        return effects;
    }

    // Reveal Hand (Dolores Madrigal)
    // "chosen opponent reveals their hand"
    // BUT NOT when followed by "and discards" (that's opponent_reveal_and_discard in triggered patterns)
    if (text.match(/(?:chosen )?opponents? reveals? (?:their|his|her) hand(?! and discards)/i)) {
        effects.push({
            type: 'reveal_hand',
            target: { type: 'chosen_opponent' }
        });
        return effects;
    }

    // Generic Stat Modification (Strength / Willpower / Lore)
    // "chosen character gets -2 willpower this turn"
    // "this character gets +2 strength"
    // "opposing characters get -1 lore"
    // "chosen Inventor character gets +1 ◊ this turn"
    const statModMatch = text.match(/((?:chosen|all|this) (?:opposing )?(?:[A-Z][a-z]+ )?characters?|it) gets? ([+-]\d+) (strength|willpower|lore|¤|🛡️|⛉|◊|⬡)(?: this turn)?/i);
    if (statModMatch) {
        const targetText = statModMatch[1];
        const val = parseInt(statModMatch[2]);
        const stat = parseStat(statModMatch[3]);

        const modifiers: any = {};
        modifiers[stat] = val;

        const target = parseTarget(targetText);

        effects.push({
            type: 'modify_stats',
            target,
            modifiers,
            duration: text.includes('this turn') ? 'turn' : 'continuous'
        });
        return effects;
    }

    // Win Condition Modification (Donald Duck - Flustered Sorcerer)
    // "Opponents need 25 lore to win the game"
    const winConditionMatch = text.match(/opponents? needs? (\d+) lore to win (?:the game)?/i);
    if (winConditionMatch) {
        const amount = parseInt(winConditionMatch[1]);
        effects.push({
            type: 'modify_win_condition',
            loreRequired: amount,
            target: { type: 'opponents' }
        });
        return effects;
    }

    // Return card to player's hand (Yzma)
    // "return that card to its player's hand"
    if (text.match(/return that card to (?:its|their) player'?s? hand/i)) {
        effects.push({
            type: 'return_to_hand',
            target: { type: 'triggered_card' }  // The card that triggered this effect
        });
        return effects;
    }

    // Return chosen damaged character to hand (Tweedle Dee & Dum)
    // "return chosen damaged character to their player's hand"
    if (text.match(/return chosen damaged character to (?:their|its) player'?s? hand/i)) {
        effects.push({
            type: 'return_to_hand',
            target: {
                type: 'chosen_character',
                filter: { damaged: true }
            }
        });
        return effects;
    }

    // Discard at random (Yzma, etc.)
    // "that player discards a card at random"
    // "discard a card at random"
    const discardRandomMatch = text.match(/(that player|you) discards? (?:a|an|(\d+)) cards? at random/i);
    if (discardRandomMatch) {
        const who = discardRandomMatch[1].toLowerCase();
        const amount = discardRandomMatch[2] ? parseInt(discardRandomMatch[2]) : 1;

        effects.push({
            type: 'discard_random',
            amount,
            target: who === 'you' ? { type: 'self' } : { type: 'opponent' }
        });
        return effects;
    }

    // Maui - Soaring Demigod: "Loses Reckless this turn"
    // "loses Reckless this turn"
    const losesKeywordMatch = text.match(/loses (?:the )?(.+?)(?: keyword)?(?: this turn)?$/i);
    if (losesKeywordMatch) {
        const keyword = losesKeywordMatch[1];
        effects.push({
            type: 'remove_keyword',
            keyword,
            target: { type: 'self' }, // Usually "this character loses..."
            duration: text.includes('this turn') ? 'turn' : 'continuous'
        });
        return effects;
    }

    // Philoctetes - No-Nonsense Instructor: "Your Hero characters gain Challenger +1"
    // "Your [Filter] characters gain [Keyword]"
    const filteredGrantMatch = text.match(/^your (.+) characters gain (.+)/i);
    if (filteredGrantMatch) {
        const subtype = filteredGrantMatch[1];
        const keywordText = filteredGrantMatch[2];

        let keyword = keywordText;
        let amount = 1;

        // Handle "Challenger +1" style
        const amountMatch = keywordText.match(/^(.+) \+(\d+)/);
        if (amountMatch) {
            keyword = amountMatch[1];
            amount = parseInt(amountMatch[2]);
        }

        // Clean up reminder text from keyword if present (though usually stripped before this function)
        keyword = keyword.split('(')[0].trim();

        effects.push({
            type: 'grant_keyword',
            keyword,
            amount,
            target: {
                type: 'my_characters',
                filter: { subtype }
            }
        });
        return effects;
    }

    // Fa Zhou: "This character can't challenge."
    if (text.match(/^this character can't challenge/i)) {
        effects.push({
            type: 'cant_challenge',
            target: { type: 'self' }
        });
        return effects;
    }

    // Discard Prevention (Kronk - Laid Back)
    // "If an effect would cause you to discard one or more cards, you don't discard"
    if (text.match(/if an effect would cause you to discard (?:one or more )?cards?, you don't discard/i)) {
        effects.push({
            type: 'protection',
            protectionType: 'prevent_discard',
            target: { type: 'self' }
        });
        return effects;
    }

    // Choose one modal (Kuzco - Panicked Llama)
    // "choose one: • Each player draws a card. • Each player chooses and discards a card."
    const chooseOneMatch = text.match(/^choose one:\s*•\s*(.+?)\.\s*•\s*(.+)/i);
    // OR Semicolon style (Desperate Plan): "Choose one: Effect A; or Effect B."
    const chooseOneSemiMatch = text.match(/^choose one:\s*(.+?);\s*or\s*(.+)/i);

    if (chooseOneMatch || chooseOneSemiMatch) {
        const match = chooseOneMatch || chooseOneSemiMatch!;
        const option1 = match[1];
        const option2 = match[2];

        effects.push({
            type: 'choose_one',
            options: [
                { text: option1.trim(), effects: parseStaticEffects(option1) },
                { text: option2.trim(), effects: parseStaticEffects(option2) }
            ]
        });
        return effects;
    }

    // Opponent choice return (Daisy Duck)
    // "chosen opponent chooses one of their characters and returns that card to their hand"
    if (text.match(/^chosen opponents? chooses? one of their characters and returns? that card to their hand/i)) {
        effects.push({
            type: 'opponent_choice_return',
            target: { type: 'opponent_character' }
        });
        return effects;
    }

    if (effects.length > 0) {
        // console.log("DEBUG: parseStaticEffects returning:", JSON.stringify(effects));
    }
    // Raksha - Fearless Mother: Move Cost Reduction
    // "Once during your turn, you may pay 1 ⬡ less to move this character to a location."
    const rakshaMatch = text.match(/(?:once during your turn, )?you may pay (\d+) (?:⬡|ink) less to move this character to a location/i);
    if (rakshaMatch) {
        effects.push({
            type: 'cost_reduction',
            reduction: parseInt(rakshaMatch[1]),
            target: { type: 'move_to_location', target: { type: 'self' } },
            condition: { type: 'once_per_turn' }
        });
        return effects;
    }

    // Map of Treasure Planet: Move Cost Reduction (Global)
    // "You pay 1 ⬡ less to move your characters to a location."
    const mapMoveMatch = text.match(/you pay (\d+) (?:⬡|ink) less to move your characters to a location/i);
    if (mapMoveMatch) {
        effects.push({
            type: 'cost_reduction',
            reduction: parseInt(mapMoveMatch[1]),
            target: { type: 'move_to_location', target: { type: 'all_characters', mine: true } }
        });
        return effects;
    }

    // Map of Treasure Planet: Next Location Cost Reduction
    // "You pay 1 ⬡ less for the next location you play this turn."
    const mapNextLocMatch = text.match(/you pay (\d+) (?:⬡|ink) less for the next location you play this turn/i);
    if (mapNextLocMatch) {
        effects.push({
            type: 'cost_reduction',
            reduction: parseInt(mapNextLocMatch[1]),
            target: { type: 'play', cardType: 'location', count: 1 },
            duration: 'turn'
        });
        return effects;
    }

    // Belle's House: Conditional Item Cost Reduction
    // "If you have a character here, you pay 1 ⬡ less to play items."
    const belleHouseMatch = text.match(/if you have a character here, you pay (\d+) (?:⬡|ink) less to play items/i);
    if (belleHouseMatch) {
        effects.push({
            type: 'cost_reduction',
            reduction: parseInt(belleHouseMatch[1]),
            target: { type: 'play', cardType: 'item' },
            condition: { type: 'location_has_character', count: 1 }
        });
        return effects;
    }

    // The Wall: Border Fortress protection
    // "While you have an exerted character here, your other locations can't be challenged."
    if (text.match(/while you have an exerted character here, your other locations can't be challenged/i)) {
        effects.push({
            type: 'prevention', // or protection
            preventionType: 'challenge', // can't be challenged
            target: { type: 'all_locations', other: true, mine: true },
            condition: { type: 'location_has_character', status: 'exerted' }
        });
        return effects;
    }

    // "This item enters play exerted." (Great Stone Dragon, etc.)
    if (text.match(/this (?:item|character|card) enters play exerted/i)) {
        effects.push({
            type: 'enters_play_exerted',
            target: { type: 'self' }
        });
        return effects;
    }

    // "Other characters can't exert to sing songs." (Ursula - Sea Witch Queen)
    if (text.match(/(?:other )?characters can't exert to sing songs/i)) {
        effects.push({
            type: 'restriction', // or rule_modification
            restriction: 'cant_exert_to_sing',
            target: { type: 'all_characters', other: text.includes('Other') }
        });
        return effects;
    }

    // Hercules - Manipulated Hero: "During the opposing players' turn, they may together pay 3 lore to banish this character."
    if (text.match(/during the opposing players' turn, they may together pay (\d+) lore to banish this character/i)) {
        const loreCost = parseInt(text.match(/pay (\d+) lore/i)![1]);
        effects.push({
            type: 'granted_ability_to_opponent',
            ability: {
                type: 'activated',
                costs: [{ type: 'lore', amount: loreCost }],
                effects: [{ type: 'banish', target: { type: 'this_character' } }],
                condition: { type: 'opponents_turn' }
            }
        });
        return effects;
    }

    // Ariel's Grotto: "While you have 3 or more items in play, this location gets +2 ◊."
    if (text.match(/while you have (\d+) or more items in play, this location gets ([+-]\d+) (lore|◊)/i)) {
        const itemThreshold = parseInt(text.match(/have (\d+) or more/i)![1]);
        const loreBonusMatch = text.match(/gets ([+-]\d+)/i);
        const loreBonus = parseInt(loreBonusMatch![1]);

        effects.push({
            type: 'modify_stats',
            stat: 'lore',
            amount: loreBonus,
            target: { type: 'self' },
            condition: {
                type: 'items_in_play',
                threshold: itemThreshold,
                mine: true
            }
        });
        return effects;
    }

    // Ratigan's Party: "While you have a damaged character here, this location gets +2 ◊."
    if (text.match(/while you have a damaged character here, this location gets ([+-]\d+) (lore|◊)/i)) {
        const loreBonusMatch = text.match(/gets ([+-]\d+)/i);
        const loreBonus = parseInt(loreBonusMatch![1]);

        effects.push({
            type: 'modify_stats',
            stat: 'lore',
            amount: loreBonus,
            target: { type: 'self' },
            condition: {
                type: 'has_character_here',
                status: 'damaged',
                mine: true
            }
        });
        return effects;
    }

    // Turbo - Royal Hack: "This character also counts as being named King Candy for Shift."
    if (text.match(/this character also counts as being named (.+?) for shift/i)) {
        const altNameMatch = text.match(/named (.+?) for shift/i);
        const altName = altNameMatch![1];

        effects.push({
            type: 'alternative_name',
            name: altName,
            purpose: 'shift'
        });
        return effects;
    }

    // Merlin's Cottage: "Each player plays with the top card of their deck face up."
    if (text.match(/each player plays with the top card of their deck face up/i)) {
        effects.push({
            type: 'rule_modification',
            rule: 'top_deck_face_up',
            target: { type: 'all_players' }
        });
        return effects;
    }

    // Grumpy / Happy: "During your turn, this character gains Evasive."
    if (text.match(/during your turn, this character gains (\w+)/i)) {
        const keywordMatch = text.match(/gains (\w+)/i);
        const keyword = keywordMatch![1];

        effects.push({
            type: 'grant_keyword',
            keyword: keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase(),
            target: { type: 'self' },
            condition: { type: 'during_my_turn' }
        });
        return effects;
    }

    // Grumpy - Skeptical Knight: "While one of your Knight characters is at a location, that character gains Resist +2."
    if (text.match(/while one of your (.+?) characters is at a location, that character gains (.+)/i)) {
        const subtypeMatch = text.match(/your (.+?) characters/i);
        const keywordMatch = text.match(/gains (.+)/i);
        const subtype = subtypeMatch![1];
        const keywordText = keywordMatch![1];

        // Parse keyword (e.g., "Resist +2")
        let keyword = 'Resist';
        let amount: number | undefined;
        if (keywordText.match(/resist \+(\d+)/i)) {
            amount = parseInt(keywordText.match(/\+(\d+)/i)![1]);
        }

        effects.push({
            type: 'grant_keyword',
            keyword,
            amount,
            target: {
                type: 'my_characters',
                filter: {
                    subtype,
                    at_location: true
                }
            }
        });
        return effects;
    }

    // Bad-Anon - Villain Support Center: "Villain characters gain "⟳, 3 ⬡ — Play a character with the same name as this character for free" while here."
    // Note: Card text uses smart quotes ("") instead of straight quotes ("")
    if (text.match(/(.+?) characters gain [“”"](.+?)[“”"] while here/i)) {
        const subtypeMatch = text.match(/(.+?) characters gain/i);
        const abilityTextMatch = text.match(/gain [“”"](.+?)[“”"] while/i);
        const subtype = subtypeMatch![1];
        const abilityText = abilityTextMatch![1];

        // Parse the granted ability (simplified - assumes it's an activated ability with costs)
        // "⟳, 3 ⬡ — Play a character with the same name as this character for free"
        effects.push({
            type: 'grant_activated_ability',
            target: {
                type: 'characters_here',
                filter: { subtype }
            },
            grantedAbility: {
                type: 'activated',
                costs: [{ type: 'exert' }, { type: 'ink', amount: 3 }],
                effects: [{
                    type: 'play_for_free',
                    target: {
                        type: 'card_from_hand',
                        filter: { name: 'same_name_as_self' }
                    }
                }],
                rawText: abilityText
            }
        });
        return effects;
    }

    return effects;
}
