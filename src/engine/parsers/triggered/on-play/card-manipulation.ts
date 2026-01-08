import { TriggerPattern } from '../types';
import { generateAbilityId, GameEvent } from '../../parser-utils';
import { parseStaticEffects } from '../../static-effect-parser';

export const CARD_MANIPULATION_PATTERNS: TriggerPattern[] = [
    // Draw for each Character (Tramp)
    {
        pattern: /^(?:.+?\s+)?when you play this character, you may draw a card for each (.+?) you have in play, then choose and discard that many cards/i,
        handler: (match, card, text) => {
            const filterText = match[1].toLowerCase();
            const filter: any = { mine: true };
            if (filterText.includes('other')) filter.other = true;
            if (filterText.includes('character')) filter.cardTypes = ['character'];

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'draw_and_discard_by_count',
                    countSource: {
                        type: 'cards_in_play',
                        filter
                    },
                    optional: true
                }],
                rawText: text
            } as any;
        }
    },
    // Reveal Hand (Diablo)
    {
        pattern: /^when you play this character, you may look at each opponent's hand/i,
        handler: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'reveal_hand',
                    target: {
                        type: 'player',
                        value: 'opponent'
                    },
                    duration: 'turn',
                    optional: true
                }],
                rawText: text
            } as any;
        }
    },
    // Return from Discard to Hand (Lady)
    {
        pattern: /^when you play this (?:character|item), you may return up to (\d+) (.+?) cards? with cost (\d+) or less(?: each)? from your discard to your hand/i,
        handler: (match, card, text) => {
            const amount = parseInt(match[1]);
            const cardType = match[2].toLowerCase().replace(/\s+/g, '_');
            const maxCost = parseInt(match[3]);

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'return_from_discard',
                    amount,
                    target: {
                        zone: 'discard',
                        destination: 'hand',
                        filter: {
                            cardType,
                            maxCost
                        }
                    },
                    optional: true
                }],
                rawText: text
            } as any;
        }
    },
    // Max Goof - Rebellious Teen: Pay to return song
    {
        pattern: /^when you play this character, you may pay (\d+) (?:⬡|ink) to return a (.+?) card with cost (\d+) or less from your discard to your hand/i,
        handler: (match, card, text) => {
            const cost = parseInt(match[1]);
            const cardSubtype = match[2].toLowerCase();
            const maxCost = parseInt(match[3]);

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                cost: { ink: cost },
                effects: [{
                    type: 'return_from_discard',
                    amount: 1,
                    target: {
                        zone: 'discard',
                        destination: 'hand',
                        filter: {
                            subtype: cardSubtype,
                            maxCost
                        }
                    },
                    optional: true
                }],
                rawText: text
            } as any;
        }
    },
    // Tutor Card (Played via Shift - Merlin)
    {
        pattern: /^when you play this character, if you used shift to play (?:her|him|it|them|this character), you may search your deck for any card, put that card into your hand, then shuffle your deck/i,
        handler: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                condition: { type: 'played_via_shift' },
                effects: [{
                    type: 'tutor_card',
                    filters: [{ type: 'card' }], // any card
                    amount: 1,
                    destination: 'hand',
                    shuffle: true,
                    reveal: false,
                    optional: true
                }],
                rawText: text
            } as any;
        }
    },
    // Search Deck (Generic)
    {
        pattern: /^when you play this character, (?:you may )?search your deck for a (.+?) (character|item|card) (?:card )?and reveal that card/i,
        handler: (match, card, text) => {
            const subtype = match[1];
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'search_deck',
                    filter: { subtype: subtype.toLowerCase() },
                    destination: 'top_of_deck',
                    shuffle: true,
                    reveal: true
                }],
                rawText: text
            } as any;
        }
    },
    // Put into Inkwell (Kuzco)
    {
        pattern: /when you play this character, you may put chosen (item or location|item|location|character) into its player's inkwell/i,
        handler: (match, card, text) => {
            const target: any = { type: 'chosen_card', filter: {} };
            if (match[1].includes('item or location')) {
                target.filter.type = ['item', 'location'];
            } else if (match[1].includes('item')) {
                target.filter.type = 'item';
            } else if (match[1].includes('location')) {
                target.filter.type = 'location';
            } else if (match[1].includes('character')) {
                target.filter.type = 'character';
            }

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'put_into_inkwell',
                    target,
                    optional: true
                }],
                rawText: text
            } as any;
        }
    },
    // Mufasa - Ruler of Pride Rock: Exert all cards in inkwell
    {
        pattern: /when you play this character, exert all cards in your inkwell/i,
        handler: (match, card, text) => {
            const effects: any[] = [{
                type: 'exert',
                target: { type: 'all_ink' }
            }];

            if (text.includes('then return')) {
                const returnMatch = text.match(/return (\d+) cards at random from your inkwell to your hand/i);
                if (returnMatch) {
                    effects.push({
                        type: 'return_from_inkwell',
                        amount: parseInt(returnMatch[1]),
                        random: true,
                        destination: 'hand'
                    });
                }
            }

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects,
                rawText: text
            } as any;
        }
    },
    // HeiHei - Bumbling Rooster: Ramp if opponent has more ink
    {
        pattern: /^when you play this character, if an opponent has more cards in their inkwell than you, you may put the top card of your deck into your inkwell facedown and exerted/i,
        handler: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                conditions: [{ type: 'opponent_has_more_ink' }],
                effects: [{
                    type: 'ramp',
                    amount: 1,
                    source: 'deck_top',
                    facedown: true,
                    exerted: true,
                    optional: true
                }],
                rawText: text
            } as any;
        }
    },
    // Play for Free (Naveen / Jim Hawkins)
    {
        pattern: /when you play this character, you may play a (song|card|location) with cost (\d+) or less for free/i,
        handler: (match, card, text) => {
            const targetType = match[1].toLowerCase();
            const cost = parseInt(match[2]);
            const filter: any = { maxCost: cost };
            if (targetType === 'song') {
                filter.subtype = 'Song';
                filter.cardType = 'action';
            } else if (targetType === 'location') {
                filter.cardType = 'location';
            }
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'play_for_free',
                    filter: filter,
                    optional: true
                }],
                rawText: text,
                duration: 'permanent'
            } as any;
        }
    },
    // Jafar - Spectral Sorcerer (Mechanical Snake)
    {
        pattern: /when jafar plays this character, he plays all items named (.+?) from his discard for free/i,
        handler: (match, card, text) => {
            const cardName = match[1];
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'play_from_discard',
                    target: {
                        type: 'all_cards',
                        filter: {
                            name: cardName,
                            cardType: 'item',
                            zone: 'discard'
                        }
                    },
                    free: true
                }],
                rawText: text
            } as any;
        }
    },
    // Opponent Choice Discard (Daisy Duck, Lucifer)
    {
        pattern: /^(?:when you play this character, )?each opponent chooses and discards (?:a|either 2 cards or 1 action) card/i,
        handler: (match, card, text) => {
            // Handle Lucifer specific logic inside handler if matched via regex
            if (text.match(/either 2 cards or 1 action card/i)) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_PLAYED,
                    effects: [{
                        type: 'opponent_discard_choice',
                        choices: [
                            { amount: 2, type: 'card' },
                            { amount: 1, type: 'action' }
                        ]
                    }],
                    rawText: text
                } as any;
            }

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'opponent_choice_discard',
                    target: { type: 'all_opponents' },
                    amount: 1
                }],
                rawText: text
            } as any;
        }
    },
    // Chosen Opponent Discard (Chip)
    {
        pattern: /^when you play this character, chosen opponent chooses and discards a card/i,
        handler: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'opponent_choice_discard',
                    target: { type: 'chosen_opponent' },
                    amount: 1
                }],
                rawText: text
            } as any;
        }
    },
    // Opponent Reveal & Discard (Ursula/Mowgli)
    {
        pattern: /^When you play this (?:character|card), chosen opponent reveals their hand and discards (?:a |an )?(non-character|song|action|item|character|location)(?: card)?(?: of (your|their) choice)?/i,
        handler: (match, card, text) => {
            const cardTypeFilter = match[1].toLowerCase();
            const chooser = match[2]?.toLowerCase() === 'their' ? 'opponent' : 'you';
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                triggerFilter: { target: 'self' },
                effects: [{
                    type: 'opponent_reveal_and_discard',
                    target: { type: 'chosen_opponent' },
                    filter: cardTypeFilter === 'non-character'
                        ? { excludeCardType: 'character' }
                        : { cardType: cardTypeFilter },
                    chooser
                }],
                rawText: text
            } as any;
        }
    },
    // Mill (Bruno)
    {
        pattern: /each opposing player puts the top (\d+) cards of their deck into their discard/i,
        handler: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'mill',
                    amount: parseInt(match[1]),
                    target: { type: 'all_opponents' }
                }],
                rawText: text
            } as any;
        }
    },
    // Stitch - Experiment 626: Mill to Inkwell
    {
        pattern: /when you play this character, each opponent puts the top card of their deck into their inkwell facedown(?: and exerted)?/i,
        handler: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'mill_to_inkwell',
                    target: { type: 'all_opponents' },
                    amount: 1,
                    facedown: true,
                    exerted: true
                }],
                rawText: text
            } as any;
        }
    },
    // Merlin - Self-Appointed Mentor: Reveal top card
    {
        pattern: /you may reveal the top card of your deck\. if it's a (.+) card, put it into your hand\. otherwise, put it on the bottom of your deck/i,
        handler: (match, card, text) => {
            const cardType = match[1].toLowerCase();
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'reveal_and_draw',
                    amount: 1,
                    filter: { cardType }
                }],
                rawText: text
            } as any;
        }
    },
    // The Queen - Crown of the Council: Look top X, reveal named Y
    {
        pattern: /when you play this character, look at the top (\d+) cards of your deck\. you may reveal any number of character cards named (.+?) and put them into your hand\. put the rest on the bottom of your deck(?: in any order)?/i,
        handler: (match, card, text) => {
            const amount = parseInt(match[1]);
            const name = match[2];
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'look_and_move',
                    amount,
                    destination: 'hand',
                    restDestination: 'bottom',
                    optional: true,
                    reveal: true,
                    filter: {
                        name,
                        type: 'character'
                    }
                }],
                rawText: text
            } as any;
        }
    },
    // Jim Hawkins / Recovered Page - Reveal MULTIPLE
    {
        pattern: /look at the top (\d+) cards of your deck\. you may reveal any number of (.+?) cards and put them into your hand\. put the rest on the bottom of your deck(?: in any order)?/i,
        handler: (match, card, text) => {
            const amount = parseInt(match[1]);
            const filterText = match[2].toLowerCase(); // "pirate character"

            // Parse filter
            const filter: any = {};
            if (filterText.includes('character')) filter.type = 'character';
            const parts = filterText.replace('character', '').trim().split(' ');
            if (parts.length > 0 && parts[0]) {
                filter.subtype = parts[0];
            }

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'look_and_move',
                    amount,
                    destination: 'hand',
                    restDestination: 'bottom',
                    optional: true,
                    reveal: true,
                    filter
                }],
                rawText: text
            } as any;
        }
    },
    // Recovered Page: Look top 4 (Singleton)
    {
        pattern: /when you play this (?:item|character), look at the top (\d+) cards of your deck\. you may reveal (a|an) (.+?) card and put it (?:in|into) your hand\. put the rest on the bottom of your deck(?: in any order)?/i,
        handler: (match, card, text) => {
            const amount = parseInt(match[1]);
            const cardTypeStr = match[3].toLowerCase();

            let filter: any = {};
            if (cardTypeStr.includes('song')) {
                filter.type = 'action';
                filter.subtype = 'song';
            }
            else if (cardTypeStr.includes('character')) filter.type = 'character';
            else if (cardTypeStr.includes('action')) filter.type = 'action';
            else if (cardTypeStr.includes('item')) filter.type = 'item';

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'look_and_move',
                    amount: amount,
                    moveAmount: 1,
                    destination: 'hand',
                    restDestination: 'bottom',
                    optional: true,
                    filter
                }],
                rawText: text
            } as any;
        }
    },
    // Nick Wilde / Yokai: Return/Take card from discard
    {
        pattern: /^when you play this character, (?:you may )?(?:return|take) (?:a|an) (.+?)(?: card)? from (?:your )?discard (?:to|and put it into) (?:your )?hand/i,
        handler: (match, card, text) => {
            const filterStr = match[1].toLowerCase();
            let filter: any = {};

            if (filterStr === 'card' || filterStr === 'item' || filterStr === 'character' || filterStr === 'action') {
                if (filterStr !== 'card') filter.cardType = filterStr;
            } else {
                filter.name = filterStr;
            }

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'return_from_discard',
                    target: { type: 'card_in_discard', filter },
                    destination: 'hand',
                    optional: text.includes('you may')
                }],
                rawText: text
            } as any;
        }
    },
    // Shuffle All From Discard (Chernabog)
    {
        pattern: /shuffle all (.+) cards from your discard into your deck/i,
        handler: (match, card, text) => {
            const typeOrSubtype = match[1].toLowerCase();
            const filter: any = {};

            if (['character', 'item', 'action', 'song'].includes(typeOrSubtype)) {
                filter.cardType = typeOrSubtype;
            } else {
                filter.subtype = typeOrSubtype;
            }

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'shuffle_from_discard',
                    destination: 'deck',
                    filter
                }],
                rawText: text
            } as any;
        }
    },
    // Vinz Santorini: Shuffle card from discard into deck
    {
        pattern: /when you play this character, you may shuffle a card from chosen player's discard into their deck/i,
        handler: (match, card, text) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'shuffle_into_deck',
                    target: {
                        type: 'chosen_card_in_discard',
                        filter: { owner: 'chosen_player' }
                    },
                    optional: true
                }],
                rawText: text
            } as any;
        }
    },
    // Shift -> Play for free (Stitch - Rock Star)
    {
        pattern: /when you play this character, if you used shift to play (?:her|him|it|them|this character), you may play a character with cost (\d+) or less for free/i,
        handler: (match, card, text) => {
            const cost = parseInt(match[1]);
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                condition: { type: 'played_via_shift' },
                effects: [{
                    type: 'play_for_free',
                    filter: { type: 'character', maxCost: cost },
                    optional: true
                }],
                rawText: text
            } as any;
        }
    },
    // Tutor to Top of Deck (Minnie Mouse - Drum Major)
    {
        pattern: /when you play this character, if you used shift to play (?:her|him|it|them|this character), you may search your deck for a (.+?) and reveal that card to all players\. Shuffle your deck and put that card on top of it/i,
        handler: (match, card, text) => {
            const filterText = match[1];
            const filters: any[] = [];
            if (filterText.includes('character')) filters.push({ type: 'character' });

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                condition: { type: 'played_via_shift' },
                effects: [{
                    type: 'tutor_card',
                    filters,
                    destination: 'deck_top',
                    reveal: true,
                    shuffle: true,
                    optional: true
                }],
                rawText: text
            } as any;
        }
    },
    // Yzma - On Edge (Pull the Lever)
    {
        pattern: /when you play this character, if you have a card named (.+) in your discard, (.+)/i,
        handler: (match, card, text) => {
            const cardName = match[1];
            // Hardcoded effect for Yzma - On Edge
            const effects = [{
                type: 'tutor_card',
                filters: [{ name: 'Wrong Lever!' }],
                destination: 'hand',
                reveal: true,
                shuffle: true,
                optional: true
            }];

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                condition: {
                    type: 'card_in_discard',
                    name: cardName
                },
                effects,
                rawText: text
            } as any;
        }
    },
    // Stitch - Rock Star (Adoring Fans)
    {
        pattern: /whenever you play a character with cost (\d+) or less, you may exert (?:it|them) to draw a card/i,
        handler: (match, card, text) => {
            const cost = parseInt(match[1]);
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                triggerFilter: {
                    type: 'character',
                    maxCost: cost,
                    mine: true
                },
                effects: [{
                    type: 'cost_to_effect',
                    cost: { type: 'exert_trigger_target' },
                    effect: { type: 'draw_card', amount: 1 },
                    optional: true
                }],
                rawText: text
            } as any;
        }
    },
    // Yzma - Scary Beyond All Reason: Shuffle char into deck, draw 2
    {
        pattern: /when you play this character, shuffle another chosen character card into their player's deck\. that player draws (\d+) cards/i,
        handler: (match, card, text) => {
            const drawAmount = parseInt(match[1]);
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'shuffle_into_deck',
                    target: {
                        type: 'chosen_other_character'
                    },
                    draw: drawAmount
                }],
                rawText: text
            } as any;
        }
    },
    // Pascal - Inquisitive Pet / Yzma (Look at top X, put back in any order)
    {
        pattern: /when you play this character, look at the top (\d+) cards of your deck and put them back in any order/i,
        handler: (match, card, text) => {
            const amount = parseInt(match[1]);
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'scry',
                    amount: amount,
                    shouldLog: true,
                    reorder: true // Implied by 'put them back in any order'
                }],
                rawText: text
            } as any;
        }
    },
    // The Headless Horseman - Cursed Rider: "When you play this character, each player draws 3 cards, then discards 3 cards at random. Choose an opposing character and deal 2 damage to them for each action card discarded this way."
    {
        pattern: /when you play this character, each player draws (\d+) cards?, then discards (\d+) cards? at random\. choose an opposing character and deal (\d+) damage to them for each action card discarded this way/i,
        handler: (match, card, text) => {
            const drawAmount = parseInt(match[1]);
            const discardAmount = parseInt(match[2]);
            const damagePerAction = parseInt(match[3]);

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [
                    {
                        type: 'all_players_draw',
                        amount: drawAmount
                    },
                    {
                        type: 'all_players_discard_random',
                        amount: discardAmount,
                        trackDiscarded: 'action' // Track how many action cards were discarded
                    },
                    {
                        type: 'damage',
                        amount: {
                            type: 'variable',
                            source: 'tracked_discarded_actions',
                            multiplier: damagePerAction
                        },
                        target: {
                            type: 'chosen_character',
                            filter: { opponent: true }
                        }
                    }
                ],
                rawText: text
            } as any;
        }
    },
    // Judy Hopps - On the Case: "When you play this character, if you have another Detective character in play, you may put chosen item into its player's inkwell facedown and exerted."
    {
        pattern: /when you play this character, if you have another (.+?) character in play, you may put chosen item into its player's inkwell facedown and exerted/i,
        handler: (match, card, text) => {
            const requiredSubtype = match[1];
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                condition: {
                    type: 'have_character_in_play',
                    filter: { subtype: requiredSubtype, other: true }
                },
                effects: [{
                    type: 'put_into_inkwell',
                    target: {
                        type: 'chosen_item'
                    },
                    facedown: true,
                    exerted: true,
                    optional: true
                }],
                rawText: text
            } as any;
        }
    },
];
