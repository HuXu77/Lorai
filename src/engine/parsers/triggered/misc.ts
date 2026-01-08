import { TriggerPattern } from './types';
import { AbilityDefinition, Card, generateAbilityId, GameEvent } from '../parser-utils';
import { parseStaticEffects } from '../static-effect-parser';

export const MISC_PATTERNS: TriggerPattern[] = [
    // Stitch - Rock Star: "Whenever you play a character with cost 2 or less, you may exert them to draw a card."
    {
        pattern: /^whenever you play a character with cost (\d+) or less, you may exert them to draw a card/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const cost = parseInt(match[1]);
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                triggerFilter: {
                    mine: true,
                    type: 'character',
                    cost: { max: cost }
                },
                effects: [{
                    type: 'draw',
                    amount: 1,
                    cost: { exert_target: true },
                    optional: true
                }],
                rawText: text
            } as any;
        }
    },

    // Tinker Bell - Insistent Fairy: "Whenever you play a character with 5 ¤ or more, you may exert them to gain 2 lore."
    {
        pattern: /^whenever you play a character with (\d+) ¤ or more, you may exert them to gain (\d+) lore/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const strength = parseInt(match[1]);
            const loreGain = parseInt(match[2]);
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                triggerFilter: {
                    mine: true,
                    type: 'character',
                    strength: { min: strength }
                },
                effects: [{
                    type: 'lore',
                    amount: loreGain,
                    cost: { exert_target: true },
                    optional: true
                }],
                rawText: text
            } as any;
        }
    },

    // Deepwell Labyrinth: "Whenever a character challenges this location, each illumineer chooses and discards a card"
    {
        pattern: /^whenever a character challenges this location, each illumineer chooses and discards a card/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_CHALLENGED,
                triggerFilter: { target: 'self' },
                effects: [{
                    type: 'discard',
                    amount: 1,
                    target: { type: 'all_players' },
                    method: 'choice'
                }],
                rawText: text
            } as any;
        }
    },

    // Gunther: "When this character is challenged and banished..."
    {
        pattern: /^when this character is challenged and banished, each opponent chooses one of their characters and returns that card to their hand/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CHARACTER_CHALLENGED_AND_BANISHED,
                triggerFilter: { target: 'self' },
                effects: [{
                    type: 'return_to_hand',
                    amount: 1,
                    target: {
                        type: 'character',
                        filter: { owner: 'opponent', zone: 'play' }, // Imperfect but better than pounce
                        chooser: 'opponent' // Hypothetical field
                    }
                }],
                rawText: text
            } as any;
        }
    },

    // Archimedes - Exceptional Owl: "Whenever an opponent chooses this character for an action or ability, you may draw a card."
    {
        pattern: /^whenever an opponent chooses this character for an action or ability, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
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
                    event: GameEvent.CARD_CHOSEN,
                    triggerFilter: {
                        target: 'self',
                        opponent: true
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // Webby's Diary / Magica De Spell: "Whenever you put a card under one of your characters or locations, ..."
    {
        pattern: /^whenever you put a card under one of your characters or locations, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
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
                    event: GameEvent.CARD_PUT_UNDER,
                    triggerFilter: {
                        mine: true,
                        destinationType: ['Character', 'Location']
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // Cheshire Cat: "Whenever you put a card under this character, ..."
    {
        pattern: /^whenever you put a card under this character, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
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
                    event: GameEvent.CARD_PUT_UNDER,
                    triggerFilter: {
                        mine: true,
                        destination: 'self'
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // Minnie Mouse - Amethyst Champion: "Whenever one of your other Amethyst characters is banished in a challenge, you may draw a card."
    {
        pattern: /^whenever one of your other (.+) characters is banished in a challenge, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const subtype = match[1];
            const effectText = match[2];
            const effects = parseStaticEffects(effectText);
            if (effects.length > 0) {
                if (match[2].match(/^you may/i)) {
                    effects.forEach(e => e.optional = true);
                }
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CHARACTER_BANISHED_IN_CHALLENGE,
                    triggerFilter: {
                        mine: true,
                        subtype,
                        excludeSelf: true
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },

    // Mulan - Elite Archer FIX: Pre-processor might strip "During your turn"
    // "During your turn, whenever this character deals damage..."
    {
        pattern: /whenever this character deals damage/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            console.log("DEBUG-MULAN: Matched BROAD pattern for card:", card.name);
            console.log("DEBUG-MULAN: Full Text:", text);

            // Re-verify specific match inside handler to be safe
            // "deal the same amount of damage to up to 2 other chosen characters"
            if (text.match(/deal the same amount of damage/i)) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_DEALS_DAMAGE,
                    // Condition: During your turn. 
                    // Assuming pre-processor added it if "During your turn" was present.
                    // If "TRIPLE SHOT" prevented pre-processor, we might need to add condition manually?
                    // But 'triggered' usually assumes turn-based via event? 
                    // No, "During your turn" is a restriction.
                    condition: text.match(/during your turn/i) ? { type: 'during_your_turn' } : undefined,
                    effects: [{
                        type: 'damage_reflection',
                        target: {
                            type: 'chosen_character',
                            count: 2,
                            upTo: true,
                            filter: { other: true }
                        }
                    }],
                    rawText: text
                } as any;
            }
            return null;
        }
    },

    // Perdita - Devoted Mother (Compound Trigger)
    // "When you play this character and whenever she quests, you may play a character with cost 2 or less from your discard for free."
    {
        pattern: /when you play this character and whenever (?:she|he|it|they) quests?, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const effectText = match[1];
            const effects = parseStaticEffects(effectText);

            // Should be "play_card" effect with "from_discard" and "free"
            // If parseStaticEffects fails (likely for "play a character..."), do manual
            let finalEffects = effects;
            if (effects.length === 0 && effectText.match(/play a character with cost (\d+) or less from your discard for free/i)) {
                const cost = parseInt(effectText.match(/cost (\d+)/)![1]);
                finalEffects = [{
                    type: 'play_card',
                    target: {
                        type: 'card_in_discard', // Custom types needed? Or generic 'card' with 'zone: discard'?
                        filter: { type: 'character', cost: { max: cost }, zone: 'discard' }
                    },
                    free: true,
                    optional: true // "you may"
                }];
            } else if (match[1].match(/^you may/i)) {
                finalEffects.forEach(e => e.optional = true);
            }

            if (finalEffects.length > 0) {
                const abilityPlay = {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_PLAYED,
                    effects: finalEffects,
                    rawText: text
                };
                const abilityQuest = {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_QUESTED, // or ON_QUEST
                    effects: finalEffects,
                    rawText: text
                };
                // Return array
                return [abilityPlay, abilityQuest] as any;
            }
            return null;
        }
    },

    // Weight Set / Rama / Tinker Bell: "Whenever you play a character with X strength or more"
    // "Whenever you play a character with 4 \u00a4 or more..."
    {
        pattern: /whenever you play (?:a|another) character with (\d+) (?:strength|\u00a4) or more, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const strength = parseInt(match[1]);
            const effectText = match[2];
            const effects = parseStaticEffects(effectText);

            // Handle "this character gains Resist +1" (Basil) or "ready this character" (Rama)
            // or "pay 1 ink to draw" (Weight Set)

            if (effects.length > 0 || effectText.includes("pay")) {
                if (match[2].match(/^you may/i)) {
                    effects.forEach(e => e.optional = true);
                }

                // Manual handling for "pay 1 to draw" if not parsed
                if (effects.length === 0 && effectText.match(/pay 1 \u2b21 to draw a card/i)) {
                    effects.push({
                        type: 'draw',
                        amount: 1,
                        cost: { ink: 1 },
                        optional: true
                    });
                }

                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_PLAYED,
                    triggerFilter: {
                        mine: true,
                        type: 'character',
                        strength: { min: strength },
                        excludeSelf: text.includes("another")
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },

    // Basil / Vanellope: "Whenever you play another [Subtype] character"
    {
        pattern: /whenever you play another (.+) character, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const subtype = match[1];
            const effectText = match[2];
            const effects = parseStaticEffects(effectText);
            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_PLAYED,
                    triggerFilter: {
                        mine: true,
                        subtype: subtype,
                        excludeSelf: true
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },


    // Dormouse: "Whenever an opponent plays a character"
    {
        pattern: /whenever an opponent plays a character, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const effectText = match[1];
            const effects = parseStaticEffects(effectText);
            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_PLAYED,
                    triggerFilter: {
                        opponent: true,
                        type: 'character'
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },

    // Diablo: "Whenever an opponent draws a card" (simplified)
    // "Whenever an opponent draws a card while this character is exerted" (Diablo - Maleficent's Spy)
    {
        pattern: /whenever an opponent draws a card(?: while this character is exerted)?, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const effectText = match[1];
            const effects = parseStaticEffects(effectText);
            const condition = text.includes("while this character is exerted") ? { source_exerted: true } : undefined;

            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_DRAWN,
                    triggerFilter: { opponent: true },
                    condition,
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },

    // Signed Contract: "Whenever an opponent plays a song"
    {
        pattern: /whenever an opponent plays a song, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const effectText = match[1];
            const effects = parseStaticEffects(effectText);
            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_SINGS_SONG, // Or CARD_PLAYED with type='song'?
                    // Usually singing is distinct, but "plays a song" covers both?
                    // Let's assume CARD_PLAYED filtered by song.
                    triggerFilter: { opponent: true, type: 'song' },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // Hiro Hamada - Future Champion: "When you play a Floodborn character on this card, draw a card."
    {
        pattern: /^when you play a (.+) character on this card, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const subtype = match[1];
            const effectText = match[2];
            const effects = parseStaticEffects(effectText);
            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_PLAYED,
                    triggerFilter: {
                        mine: true,
                        subtype: subtype,
                        playedOn: 'self'
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // Mad Hatter - Unruly Eccentric: "Whenever a damaged character challenges another character, you may draw a card."
    {
        pattern: /^whenever a damaged character challenges(?: another character)?, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
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
                    event: GameEvent.CARD_CHALLENGES,
                    triggerFilter: {
                        source: {
                            damaged: true
                        }
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // Ratigan - Nefarious Criminal: "Whenever you play an action while this character is exerted, gain 1 lore."
    {
        pattern: /^whenever you play an action while this character is exerted, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const effectText = match[1];
            const effects = parseStaticEffects(effectText);
            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_PLAYED,
                    triggerFilter: {
                        mine: true,
                        type: 'Action',
                        condition: {
                            type: 'self_status',
                            status: 'exerted'
                        }
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // Pepper - Quick-Thinking Puppy: "Whenever one of your Puppy characters is banished, you may put that card into your inkwell facedown and exerted."
    {
        pattern: /^whenever one of your (.+) characters is banished, you may put that card into your inkwell facedown and exerted/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const subtype = match[1];
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_BANISHED,
                triggerFilter: {
                    mine: true,
                    subtype: subtype
                },
                effects: [{
                    type: 'move_card_to_inkwell',
                    target: 'trigger_source',
                    exerted: true,
                    facedown: true,
                    optional: true
                }],
                rawText: text
            } as any;
        }
    },
    // Daisy Duck - Pirate Captain: "Whenever one of your Pirate characters quests while at a location, draw a card."
    {
        pattern: /^whenever one of your (.+) characters quests while at a location, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const subtype = match[1];
            const effectText = match[2];
            const effects = parseStaticEffects(effectText);
            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.ON_QUEST, // using ON_QUEST alias
                    triggerFilter: {
                        mine: true,
                        subtype: subtype,
                        condition: {
                            type: 'at_location'
                        }
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // Sheriff of Nottingham - Corrupt Official: "Whenever you discard a card, you may deal 1 damage to chosen opposing character."
    {
        pattern: /^whenever you discard a card, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
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
                    event: GameEvent.CARD_DISCARDED,
                    triggerFilter: {
                        player: 'self'
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // Rapunzel - Gifted Artist: "Whenever you remove 1 or more damage from one of your characters, you may draw a card."
    {
        pattern: /^whenever you remove 1 or more damage from one of your characters, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
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
                    event: GameEvent.CARD_HEALED,
                    triggerFilter: {
                        mine: true
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // Royal Guard: "Whenever you draw a card, this character gains Challenger +1 this turn."
    {
        pattern: /^whenever you draw a card, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            let effectText = match[1];
            // Strip reminder text in parens
            effectText = effectText.replace(/\([^)]+\)/g, '').trim();
            const effects = parseStaticEffects(effectText);

            if (effects.length > 0) {
                if (match[1].match(/^you may/i)) {
                    effects.forEach(e => e.optional = true);
                }

                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_DRAWN,
                    triggerFilter: {
                        player: 'self'
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // Namaari: "When you play this character and at the start of your turn, you may draw a card, then choose and discard a card."
    {
        pattern: /^when you play this character and at the start of your turn, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
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
                    events: [GameEvent.CARD_PLAYED, GameEvent.TURN_START], // Dual trigger
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },

    // Goofy - Emerald Champion: "Whenever one of your other Emerald characters is challenged and banished, banish the challenging character."
    {
        pattern: /^whenever one of your (other )?(.+?) characters is challenged and banished, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const isOther = !!match[1];
            const filterText = match[2];
            const effectText = match[3];

            const effects = parseStaticEffects(effectText);

            const filter: any = { mine: true };
            if (isOther) filter.other = true;
            if (filterText) filter.subtype = filterText; // e.g. "Emerald" - technically a color, engine usually fuzzy matches

            if (effects.length > 0) {
                if (match[3].match(/^you may/i)) {
                    effects.forEach(e => e.optional = true);
                }

                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CHARACTER_CHALLENGED_AND_BANISHED,
                    triggerFilter: filter,
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // Maleficent's Staff: "Whenever one of your opponents' characters, items, or locations is returned to their hand from play, gain 1 lore."
    {
        pattern: /^whenever one of your opponents' (characters|items|locations|characters, items, or locations) is returned to their hand from play, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const types = match[1].split(/, | or /).map(t => t.trim().replace(/s$/, '')); // "characters" -> "character"
            const effectText = match[2];
            const effects = parseStaticEffects(effectText);

            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_RETURNED_TO_HAND,
                    triggerFilter: {
                        type: types, // e.g. ['character', 'item', 'location']
                        opponent: true
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },

    // Ink Amplifier: "Whenever an opponent draws a card during their turn, if it's the second card they've drawn this turn, you may put the top card of your deck into your inkwell facedown and exerted."
    {
        pattern: /^whenever an opponent draws a card during their turn, if it[''']s the (\w+) card they(?:'ve| have) drawn this turn, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const ordinal = match[1].toLowerCase(); // "second"
            const effectText = match[2];

            let count = 1;
            if (ordinal === 'second') count = 2;
            if (ordinal === 'third') count = 3;

            const effects = parseStaticEffects(effectText);

            if (effects.length > 0) {
                if (match[2].match(/^you may/i)) {
                    effects.forEach(e => e.optional = true);
                }

                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_DRAWN,
                    condition: {
                        type: 'drawn_cards_count_check',
                        count
                    },
                    triggerFilter: { opponent: true, active_turn: true },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },

    // Owl Island & Minnie: Play second action trigger
    // "Whenever you play a second action in a turn, gain X lore"
    // "Whenever you play a second action in a turn, this character gets +X stat this turn"
    {
        pattern: /^whenever you play a second action in a turn, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const effectText = match[1];
            const effects = parseStaticEffects(effectText);

            if (effects.length === 0) return null;

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                triggerFilter: { cardType: 'action', count: 2 },
                effects,
                rawText: text
            } as any;
        }
    },

    // Whenever you ready this character (Christopher Robin)

    // "Whenever you ready this character, if you have 2 or more other characters in play, gain 2 lore."
    {
        pattern: /^whenever you ready this character,? (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const effectText = match[1].trim();
            const effects = parseStaticEffects(effectText);

            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_READIED,
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },

    // Whenever you remove damage (Rapunzel)
    // "Whenever you remove damage from a character, draw a card."
    {
        pattern: /^whenever you remove damage from (?:a|an|this) character,? (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const effectText = match[1];
            const effects = parseStaticEffects(effectText);

            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_HEALED,
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },


    // Mickey Mouse - Brave Little Prince: Sing and play song from deck
    // "MASH-UP Once during your turn, whenever this character sings a song, look at the top 4 cards of your deck. You may reveal a song card with cost 9 or less and play it for free. Put the rest on the bottom of your deck in any order."
    {
        pattern: /(?:once during your turn, )?whenever this character sings a song, look at the top (\d+) cards of your deck\. you may reveal a song card with cost (\d+) or less and play it for free\. put the rest on the bottom of your deck in any order/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_SINGS_SONG,
                effects: [{
                    type: 'look_and_play',
                    amount: parseInt(match[1]),
                    filter: {
                        cardType: 'action',
                        subtype: 'song',
                        maxCost: parseInt(match[2])
                    },
                    free: true,
                    restDestination: 'bottom'
                }],
                rawText: text
            } as any;
        }
    },

    // 13. Sing Trigger & Replay (Ursula - DoA)
    // "Whenever this character sings a song, you may play that song again from your discard for free."
    {
        pattern: /whenever this character sings a song, you may play that song again from your discard for free/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_SINGS_SONG,
                effects: [{
                    type: 'play_from_discard',
                    target: 'trigger_card',
                    free: true
                }],
                rawText: text
            } as any;
        }
    },

    // 23. Sing Trigger Buff (Cinderella - Melody Weaver)
    // "Whenever this character sings a song, your other Princess characters get +1 ◊ this turn."
    // "Whenever this character sings a song, gain 2 lore." (Generalized)
    {
        pattern: /^whenever this character sings a song,? (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const effectText = match[1];

            // Specific check for Cinderella's effect which might be complex
            const cinderellaMatch = effectText.match(/your other (.+) characters get ([+-])(\d+) (strength|willpower|lore|¤|🛡️|⛉|◊|⬡) this turn/i);
            if (cinderellaMatch) {
                let stat = 'strength';
                const symbol = cinderellaMatch[4].toLowerCase();
                if (['willpower', '🛡️', '⛉'].includes(symbol)) stat = 'willpower';
                if (['lore', '◊', '⬡'].includes(symbol)) stat = 'lore';

                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_SINGS_SONG,
                    effects: [{
                        type: 'modify_stats',
                        stat,
                        amount: parseInt(cinderellaMatch[3]) * (cinderellaMatch[2] === '-' ? -1 : 1),
                        target: {
                            type: 'all_characters',
                            filter: {
                                subtype: cinderellaMatch[1].toLowerCase(),
                                other: true,
                                mine: true
                            }
                        },
                        duration: 'turn'
                    }],
                    rawText: text
                } as any;
            }

            // Fallback for other effects (e.g. gain lore, draw cards)
            const effects = parseStaticEffects(effectText);
            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_SINGS_SONG,
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },

    // Global Sing Trigger (Dolores Madrigal - Within Earshot)
    // "Whenever one of your characters sings a song, chosen opponent reveals their hand"
    {
        pattern: /^whenever one of your characters sings a song, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const effectText = match[1];
            const effects = parseStaticEffects(effectText);

            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_SINGS_SONG,
                    triggerFilter: { mine: true, source: 'any' },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },

    // Rapunzel - Ready for Adventure: Support trigger -> Prevent damage
    // "Whenever one of your characters is chosen for Support, until the start of your next turn, the next time they would be dealt damage they take no damage instead."
    {
        pattern: /whenever one of your characters is chosen for support, until the start of your next turn, the next time they would be dealt damage they take no damage instead/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CHARACTER_CHOSEN_FOR_SUPPORT,
                triggerFilter: { mine: true },
                effects: [{
                    type: 'apply_effect',
                    effect: {
                        type: 'prevent_damage',
                        amount: -1 // All damage
                    },
                    target: 'trigger_target', // The character chosen (receiver)
                    duration: 'next_turn_start',
                    count: 1 // Next time only
                }],
                rawText: text
            } as any;
        }
    },

    // Prince Phillip - Gallant Defender: Support trigger -> Gain Resist
    // "Whenever one of your characters is chosen for Support, they gain Resist +1 this turn."
    {
        pattern: /whenever one of your characters is chosen for support, they gain (.+) this turn/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const effectText = match[1];
            // Expect "Resist +1" or similar
            if (effectText.match(/resist \+\d+/i)) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CHARACTER_CHOSEN_FOR_SUPPORT,
                    triggerFilter: { mine: true },
                    effects: [{
                        type: 'grant_keyword',
                        keyword: 'Resist',
                        amount: parseInt(effectText.split('+')[1]),
                        target: { type: 'trigger_target' }, // The character chosen
                        duration: 'turn'
                    }],
                    rawText: text
                } as any;
            }
            return null;
        }
    },

    // Little John: Put card under then ready (simple version)
    // "Whenever you put a card under this character, ready him."
    {
        pattern: /^whenever you put a card under this character, ready (?:him|her|them)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PUT_UNDER,
                triggerFilter: { target: 'self' },
                effects: [{
                    type: 'ready',
                    target: { type: 'self' }
                }],
                rawText: text
            } as any;
        }
    },

    // 24. Put Card Under Trigger (Simba - King in the Making, Mulan - Standing Her Ground)
    {
        pattern: /whenever you put a card under this character, you may reveal the top card of your deck\. if it's a character card, you may play that character for free and they enter play exerted\. otherwise, put it on the bottom of your deck/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PUT_UNDER,
                effects: [{
                    type: 'reveal_top_deck',
                    amount: 1,
                    on_reveal: {
                        condition: { type: 'character' },
                        match_effect: [
                            { type: 'play_for_free', target: 'revealed', exerted: true }
                        ],
                        no_match_effect: [
                            { type: 'move_to_bottom_deck', target: 'revealed' }
                        ]
                    }
                }],
                rawText: text
            } as any;
        }
    },

    // 37. Damage Redirection (Beast - Selfless Protector)
    // "Whenever one of your other characters would be dealt damage, put that many damage counters on this character instead."
    {
        pattern: /whenever one of your other characters would be dealt damage, put that many damage counters on this character instead/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered', // Should be replacement, but using triggered structure for now
                event: GameEvent.CARD_DAMAGED, // Needs special handling for 'would be'
                triggerFilter: {
                    target: {
                        mine: true,
                        other: true
                    }
                },
                effects: [{
                    type: 'redirect_damage',
                    target: { type: 'self' }
                }],
                rawText: text
            } as any;
        }
    },

    // 40. Conditional Triggered Effects (General)
    // "When [trigger], if [condition], [effect]"
    {
        pattern: /^(When|Whenever|At) (.+?), if (.+?), (.+)$/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const triggerText = match[1] + ' ' + match[2];
            const conditionText = match[3];
            const effectText = match[4];

            // 1. Parse Trigger
            let event = GameEvent.CARD_PLAYED;
            if (triggerText.match(/quests/i)) event = GameEvent.CARD_QUESTED;
            if (triggerText.match(/challenges/i)) event = GameEvent.CARD_CHALLENGES;
            if (triggerText.match(/start of your turn/i)) event = GameEvent.TURN_START;

            // 2. Parse Condition
            let condition: any = {};
            if (conditionText.match(/have (\d+) or more (?:available )?ink/i)) {
                const cMatch = conditionText.match(/have (\d+) or more (?:available )?ink/i);
                condition = { type: 'ink_available', min: parseInt(cMatch![1]) };
            } else if (conditionText.match(/put a card under (her|him|this character) this turn/i)) {
                condition = { type: 'card_put_under_this_turn' };
            } else if (conditionText.match(/have a (.+) character in play/i)) {
                const cMatch = conditionText.match(/have a (.+) character in play/i);
                condition = { type: 'has_character_in_play', subtype: cMatch![1] };
            } else if (conditionText.match(/have a character named (.+) in play/i)) {
                const cMatch = conditionText.match(/have a character named (.+) in play/i);
                condition = { type: 'control_character', name: cMatch![1] };
            } else if (conditionText.match(/have no cards in hand/i)) {
                condition = { type: 'empty_hand' };
            } else if (conditionText.match(/is damaged/i)) {
                condition = { type: 'is_damaged', target: 'self' };
            }

            // 3. Parse Effect (Simple)
            let thenEffect: any = {};

            // Draw
            const drawMatch = effectText.match(/draw (\d+) cards?/i);
            if (drawMatch) {
                thenEffect = { type: 'draw', amount: parseInt(drawMatch[1]) };
            } else if (effectText.match(/draw a card/i)) {
                thenEffect = { type: 'draw', amount: 1 };
            }

            // Gain Lore
            const loreMatch = effectText.match(/gain (\d+) lore/i);
            if (loreMatch) {
                thenEffect = { type: 'gain_lore', amount: parseInt(loreMatch[1]) };
            }

            if (Object.keys(condition).length > 0 && Object.keys(thenEffect).length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event,
                    effects: [{
                        type: 'conditional',
                        condition,
                        effect: thenEffect
                    }],
                    rawText: text
                } as any;
            }
            return null;
        }
    },

    // 40b. Conditional Triggered Effects (While)
    // "Whenever this character quests while he has 5 ¤ or more, ..."
    {
        pattern: /^(When|Whenever|At) (.+?) while (.+?), (.+)$/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const triggerText = match[1] + ' ' + match[2];
            const conditionText = match[3];
            const effectText = match[4];

            // 1. Parse Trigger
            let event = GameEvent.CARD_PLAYED;
            if (triggerText.match(/quests/i)) event = GameEvent.CARD_QUESTED;
            if (triggerText.match(/challenges/i)) event = GameEvent.CARD_CHALLENGES;

            // 2. Parse Condition
            let condition: any = {};
            const statMatch = conditionText.match(/he has (\d+) (strength|willpower|lore|¤|🛡️|⛉|◊|⬡|※|⛨) or more/i);
            if (statMatch) {
                let stat = 'strength';
                const symbol = statMatch[2].toLowerCase();
                if (['willpower', '🛡️', '⛉', '⛨'].includes(symbol)) stat = 'willpower';
                if (['lore', '◊', '⬡'].includes(symbol)) stat = 'lore';

                condition = {
                    type: 'self_stat_check',
                    stat,
                    value: parseInt(statMatch[1]),
                    operator: 'gte'
                };
            }

            // 3. Parse Effect (Simple)
            const effects = parseStaticEffects(effectText);

            // Special case for return to hand with filter (Pete)
            // "return chosen character with 2 ¤ or less to their player's hand"
            const returnMatch = effectText.match(/return chosen character with (\d+) (strength|willpower|lore|¤|🛡️|⛉|◊|⬡|※|⛨) or less to their player's hand/i);
            if (returnMatch) {
                let stat = 'strength';
                const symbol = returnMatch[2].toLowerCase();
                if (['willpower', '🛡️', '⛉', '⛨'].includes(symbol)) stat = 'willpower';
                if (['lore', '◊', '⬡'].includes(symbol)) stat = 'lore';

                effects.push({
                    type: 'return_to_hand',
                    target: {
                        type: 'chosen_character',
                        filter: {
                            stat,
                            maxValue: parseInt(returnMatch[1])
                        }
                    }
                });
            }

            if (Object.keys(condition).length > 0 && effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event,
                    condition,
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },

    // 39. Generic Return Chosen Character (Perplexing Signposts, Genie)
    // "Return chosen character of yours to your hand."
    // "Return chosen character to their player's hand."
    {
        pattern: /return chosen (character|item)(?: of yours)?(?: to (?:your|their player's) hand)?/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const cardType = match[1].toLowerCase();
            const isMine = text.match(/of yours/i);

            const filter: any = {};
            if (isMine) filter.mine = true;

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'return_to_hand',
                    target: {
                        type: `chosen_${cardType} `,
                        filter
                    }
                }],
                rawText: text
            } as any;
        }
    },

    // 41. Generic Chosen Character Buff/Debuff (Phase 1)
    // "Chosen character gets +2 ¤ this turn."
    // "Chosen opposing character gets -3 ¤ this turn."
    // "Chosen character gets +1 ¤ and +1 🛡️ this turn."
    // 
    // NOTE: This pattern should NOT match if it's part of "When you play this character"
    // because Pattern 26 in on-play.ts handles that
    {
        pattern: /chosen (opposing )?character gets ([^.]+)(?: this turn)?/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            // Skip if this is part of a "When you play this character" ability
            // Pattern 26 in on-play.ts should handle those
            if (text.match(/^when you play this character,/i)) {
                return null;
            }

            const isOpposing = !!match[1];
            const buffsText = match[2];

            const effects: any[] = [];

            // Split by "and" to handle multiple buffs
            const buffParts = buffsText.split(/ and /i);

            for (const part of buffParts) {
                const statMatch = part.match(/([+-])(\d+) (strength|willpower|lore|¤|🛡️|⛉|◊|⬡|※|⛨)/i);
                if (statMatch) {
                    let stat = 'strength';
                    const symbol = statMatch[3].toLowerCase();
                    if (['willpower', '🛡️', '⛉', '⛨'].includes(symbol)) stat = 'willpower';
                    if (['lore', '◊', '⬡'].includes(symbol)) stat = 'lore';

                    effects.push({
                        type: 'modify_stats',
                        stat,
                        amount: parseInt(statMatch[2]) * (statMatch[1] === '-' ? -1 : 1),
                        target: {
                            type: isOpposing ? 'chosen_opposing_character' : 'chosen_character'
                        },
                        duration: text.match(/this turn/i) ? 'turn' : 'permanent'
                    });
                }
            }

            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_PLAYED, // Default to on play if not specified
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },

    // 14. Named Character Trigger (Robin's Bow)
    // "Whenever a character of yours named Robin Hood quests, you may ready this item."
    {
        pattern: /whenever a character of yours named (.+) quests, you may ready this item/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const name = match[1];
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_QUESTED,
                triggerFilter: {
                    type: 'character',
                    name: name,
                    mine: true
                },
                effects: [{
                    type: 'ready',
                    target: { type: 'self' }
                }],
                rawText: text
            } as any;
        }
    },

    // Whenever one of your characters with [Keyword] is banished (Musketeer Tabard)
    // "Whenever one of your characters with Bodyguard is banished, you may draw a card."
    {
        pattern: /whenever one of your characters with (.+) is banished, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const keyword = match[1].toLowerCase();
            const effectText = match[2].replace(/^you may /i, '');
            const effects = parseStaticEffects(effectText);

            if (effects.length > 0) {
                // If "you may" was stripped, mark effects as optional
                if (match[2].match(/^you may/i)) {
                    effects.forEach(e => e.optional = true);
                }

                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_BANISHED,
                    condition: {
                        type: 'character_with_keyword_banished',
                        keyword
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // When this item is banished (Unconventional Tool, Maurice's Machine)
    // "When this item is banished, you may put this card into your inkwell facedown and exerted."
    {
        pattern: /^when(?:ever)? this item is banished,? (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const effectText = match[1].trim();
            const effects = parseStaticEffects(effectText);

            if (effects.length > 0) {
                if (match[1].match(/^you may/i)) {
                    effects.forEach(e => e.optional = true);
                }
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_BANISHED,
                    triggerFilter: {
                        type: 'item',
                        mine: true
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // Whenever another character is played (Queen of Hearts - Unpredictable Bully)
    // "Whenever another character is played, put a damage counter on them."
    {
        pattern: /^whenever another character is played, put a damage counter on them/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                triggerFilter: {
                    another: true,
                    type: 'character'
                },
                effects: [{
                    type: 'damage',
                    amount: 1,
                    target: { type: 'trigger_card' }
                }],
                rawText: text
            } as any;
        }
    },
    // When this character is banished, put into inkwell (Gramma Tala - Storyteller, James - Role Model)
    // "When this character is banished, you may put this card into your inkwell facedown and exerted."
    {
        pattern: /^when this character is banished, you may put this card into your inkwell facedown and exerted/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_BANISHED,
                triggerFilter: { target: 'self' },
                effects: [{
                    type: 'put_into_inkwell',
                    target: { type: 'self' },
                    exerted: true,
                    optional: true
                }],
                rawText: text
            } as any;
        }
    },
    // King Candy: "When this character is banished, you may return another Racer character card from your discard to your hand."
    {
        pattern: /^when this character is banished, you may return another (.+?) character card from your discard to your hand/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const classification = match[1];
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_BANISHED,
                effects: [{
                    type: 'return_from_discard',
                    filter: { type: 'character', classification, exclude: 'self' },
                    destination: 'hand'
                }],
                optional: true,
                rawText: text
            } as any;
        }
    },

    // Pua - Potbellied Buddy: "When this character is banished, you may shuffle this card into your deck."
    {
        pattern: /^when this character is banished, you may shuffle this card into your deck/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_BANISHED,
                effects: [{
                    type: 'shuffle_into_deck',
                    target: { type: 'self' },
                    optional: true
                }],
                rawText: text
            } as any;
        }
    },
    // Zeus - King of the Gods: Banish trigger -> Put card under
    // "During your turn, when this character is banished, you may put the top card of your deck facedown under one of your characters or locations with Boost."
    {
        pattern: /^during your turn, when this character is banished, you may put the top card of your deck facedown under one of your (characters|locations|characters or locations)(?: with (.+))?/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const targetTypeRaw = match[1];
            const keywordFilter = match[2];
            let typeFilter: string[] | string = 'character';

            if (targetTypeRaw.includes('characters') && targetTypeRaw.includes('locations')) {
                typeFilter = ['character', 'location'];
            } else if (targetTypeRaw.includes('locations')) {
                typeFilter = 'location';
            }

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_BANISHED,
                condition: { type: 'my_turn' },
                effects: [{
                    type: 'put_card_under',
                    source: 'top_of_deck',
                    target: {
                        type: 'chosen_permanent',
                        filter: {
                            mine: true,
                            type: typeFilter,
                            keyword: keywordFilter
                        }
                    },
                    facedown: true,
                    optional: true
                }],
                rawText: text
            } as any;
        }
    },

    // Fairy Godmother's Wand: Inkwell Trigger (Only Till Midnight)
    // "During your turn, whenever you put a card into your inkwell, chosen Princess character of yours gains Ward until the start of your next turn."
    {
        pattern: /^(?:during your turn, )?whenever you put a card into your inkwell, chosen princess character.*?gains ward.*?next turn/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_INKED,
                effects: [{
                    type: 'grant_keyword',
                    keyword: 'ward',
                    target: {
                        type: 'chosen_character',
                        filter: { trait: 'Princess', mine: true }
                    },
                    duration: 'next_turn_start'
                }],
                rawText: text
            } as any;
        }
    },

    // Inkrunner: Play Item Trigger
    // "When you play this item, draw a card."
    {
        pattern: /^when you play this item, draw a card/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{
                    type: 'draw',
                    amount: 1
                }],
                rawText: text
            } as any;
        }
    },

    // Milo Thatch - King of Atlantis: "When this character is banished, return all opposing characters to their players' hands."
    {
        pattern: /^when this character is banished, return all opposing characters to their players' hands/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_BANISHED,
                effects: [{
                    type: 'return_to_hand',
                    target: { type: 'all_opposing_characters' }
                }],
                rawText: text
            } as any;
        }
    },
    // Whenever you play a song, challenge ready characters (Cinderella - Stouthearted)
    // "Whenever you play a song, this character may challenge ready characters this turn."
    {
        pattern: /^whenever you play a song, this character (?:may|can) challenge ready characters this turn/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                triggerFilter: { type: 'song', mine: true },
                effects: [{
                    type: 'rule_modification',
                    modification: 'can_challenge_ready_characters',
                    duration: 'turn'
                }],
                rawText: text
            } as any;
        }
    },
    // Mufasa - Betrayed Leader
    // "When this character is banished, you may reveal the top card of your deck. If it's a character card, you may play that character for free and they enter play exerted. Otherwise, put it on the top of your deck."
    {
        pattern: /^when this character is banished, you may reveal the top card of your deck\. if it's a (.+?) card, you may play (?:that character|it) for free(?: and they enter play exerted)?\. otherwise, put it on the (top|bottom) of your deck/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const cardType = match[1].toLowerCase();
            const entersExerted = text.includes('enter play exerted');
            const fallbackLocation = match[2].toLowerCase() === 'top' ? 'top_of_deck' : 'bottom_of_deck';

            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_BANISHED,
                triggerFilter: { target: 'self' },
                effects: [{
                    type: 'reveal_top_deck',
                    amount: 1,
                    on_reveal: {
                        condition: { type: 'card_type', cardType },
                        match_effect: [
                            { type: 'play_free', optional: true, enters_exerted: entersExerted }
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
    // Nana - Darling Family Pet
    // "Whenever you play a Floodborn character, you may remove all damage from chosen character."
    {
        pattern: /^whenever you play a (.+?) character, you may remove all damage from chosen character/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const subtype = match[1];
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                triggerFilter: { type: 'character', subtype, mine: true },
                effects: [{
                    type: 'remove_all_damage',
                    target: { type: 'chosen_character' },
                    optional: true
                }],
                rawText: text
            } as any;
        }
    },

    // Scrooge McDuck: Play Char/Loc with Boost -> Put card under
    // "Whenever you play a character or location with Boost, you may put the top card of your deck facedown under them."
    {
        pattern: /whenever you play a (?:character|location|character or location) with boost, you may put the top card of your deck facedown under them/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                triggerFilter: {
                    mine: true,
                    keyword: 'Boost'
                },
                effects: [{
                    type: 'put_card_under',
                    source: 'top_of_deck',
                    target: 'trigger_card',
                    facedown: true,
                    optional: true
                }],
                rawText: text
            } as any;
        }
    },

    // Diablo - Devoted Herald
    // "During each opponent's turn, whenever they draw a card while this character is exerted, you may draw a card."
    {
        pattern: /^during each opponent's turn, whenever they draw a card while this character is exerted, you may draw a card/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_DRAWN,
                triggerFilter: {
                    player: 'opponent',
                    condition: { type: 'self_exerted' }
                },
                effects: [{
                    type: 'draw',
                    amount: 1,
                    optional: true
                }],
                rawText: text
            } as any;
        }
    },
    // Oswald - The Lucky Rabbit
    // "During your turn, whenever a card is put into your inkwell, you may reveal the top card of your deck. If it's an item card, you may play that item for free and it enters play exerted. Otherwise, put it on the bottom of your deck."
    {
        pattern: /(?:during your turn, )?whenever a card is put into your inkwell, you may reveal the top card of your deck\. if it's an item card, you may play that item for free and (?:it|they) (?:enters|enter) play exerted\. otherwise, put it on the bottom of your deck/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_INKED,
                condition: { type: 'my_turn' },
                effects: [{
                    type: 'reveal_top_deck',
                    amount: 1,
                    on_reveal: {
                        condition: { type: 'card_type', cardType: 'item' },
                        match_effect: [
                            { type: 'play_free', exerted: true, optional: true }
                        ],
                        no_match_effect: [
                            { type: 'move_to_bottom_deck' }
                        ]
                    }
                }],
                rawText: text
            } as any;
        }
    },
    // Whenever you put a card into your inkwell (Gramma Tala, One On The Way, Stabbington Brother, Dawson)
    // "Whenever you put a card into your inkwell, gain 1 lore."
    // "Whenever a card is put into your inkwell, deal 2 damage to each character in play."
    {
        pattern: /(?:whenever|when) (?:you put a card|a card is put) into your inkwell, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            let effectText = match[1];
            let condition: any = undefined;

            // Handle "if it's the second card..." condition
            if (effectText.match(/^if it's the second card you've put into your inkwell this turn, (.+)/i)) {
                const subMatch = effectText.match(/^if it's the second card you've put into your inkwell this turn, (.+)/i);
                effectText = subMatch![1];
                condition = { type: 'second_card_inkwell_this_turn' };
            }

            const effects = parseStaticEffects(effectText);

            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_INKED,
                    condition,
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // Whenever you play a location (Jim Hawkins - Space Traveler)
    // "Whenever you play a location, this character may move there for free."
    {
        pattern: /^whenever you play a location, this character may move there for free/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                triggerFilter: { type: 'location', mine: true },
                effects: [{
                    type: 'move_to_location',
                    target: { type: 'self' },
                    location: { type: 'trigger_card' },
                    free: true,
                    optional: true
                }],
                rawText: text
            } as any;
        }
    },

    // Chem Purse: "Whenever you play a character, if you used Shift to play them, they get +4 ¤ this turn."
    {
        pattern: /^whenever you play a character, if you used shift to play them, they get ([+\-]\d+) [¤◊⛉] this turn/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const amount = parseInt(match[1]);
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered', // "Whenever YOU play" is a global trigger listened to by this item
                event: GameEvent.CARD_PLAYED,
                triggerFilter: { type: 'character', mine: true }, // Listens for any of my characters being played
                effects: [{
                    type: 'conditional_stat_modification',
                    condition: { type: 'status', status: 'shifted', target: 'trigger_card' }, // Checks if the TRIGGERING card was shifted
                    stat: 'strength',
                    amount,
                    target: { type: 'trigger_card' }, // Grants bonus to the character that was played
                    duration: 'turn'
                }],
                rawText: text
            } as any;
        }
    },

    // Antonio Madrigal: "Once during your turn, whenever one of your characters sings a song, you may search your deck for a character card with cost 3 or less and reveal that card to all players. Put that card into your hand and shuffle your deck."
    // Note: "Once during your turn," is stripped by triggered-parser.ts before matching
    {
        pattern: /^whenever one of your characters sings a song, you may search your deck for a character card with cost (\d+) or less and reveal that card to all players\. put that card into your hand and shuffle your deck/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const maxCost = parseInt(match[1]);
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_SINGS_SONG,
                trigger: { oncePerTurn: true, duringMyTurn: true, mine: true },
                effects: [{
                    type: 'search_deck',
                    filter: { type: 'character', maxCost },
                    reveal: true,
                    destination: 'hand',
                    shuffle: true
                }],
                optional: true,
                rawText: text
            } as any;
        }
    },

    // Alma Madrigal: "Once during your turn, whenever one or more of your characters sings a song, you may ready those characters."
    // Note: "Once during your turn," is stripped by triggered-parser.ts before matching
    {
        pattern: /^whenever one or more of your characters sings a song, you may ready those characters/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_SINGS_SONG,
                trigger: { oncePerTurn: true, duringMyTurn: true, mine: true },
                effects: [{
                    type: 'ready',
                    target: { type: 'singing_characters' }
                }],
                optional: true,
                rawText: text
            } as any;
        }
    },

    // Chief Bogo: "During an opponent's turn, whenever one of your characters with Bodyguard is banished, you may reveal the top card of your deck. If it's a character card with cost 5 or less, you may play that character for free. Otherwise, put it on the top of your deck."
    {
        pattern: /^during an opponent[''']s turn, whenever one of your characters with (.+?) is banished, you may reveal the top card of your deck\. if it[''']s a character card with cost (\d+) or less, you may play that character for free\. otherwise, put it on the top of your deck/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const keyword = match[1];
            const maxCost = parseInt(match[2]);
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_BANISHED,
                trigger: { duringOpponentTurn: true, mine: true, filter: { keyword } },
                effects: [{
                    type: 'reveal_top_of_deck',
                    amount: 1
                }, {
                    type: 'conditional_play',
                    condition: { type: 'revealed_is_character', maxCost },
                    ifTrue: [{ type: 'play_for_free', target: { type: 'revealed_card' } }],
                    ifFalse: [{ type: 'put_on_top_of_deck', target: { type: 'revealed_card' } }]
                }],
                optional: true,
                rawText: text
            } as any;
        }
    },
    // Aurora - Waking Beauty: "Whenever you remove 1 or more damage from a character, ready this character."
    {
        pattern: /^whenever you remove 1 or more damage from a character, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const effectText = match[1];
            const effects = parseStaticEffects(effectText);
            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_HEALED,
                    triggerFilter: {
                        mine: true,
                        amount: 1,
                        comparison: 'gte'
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // Maui - Soaring Demigod: "Whenever a character of yours named HeiHei quests, this character gets +1 ◊ and loses Reckless this turn."
    {
        pattern: /^whenever a character of yours named (.+) quests, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const name = match[1];
            const effectText = match[2];
            const effects = parseStaticEffects(effectText);
            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.ON_QUEST,
                    triggerFilter: {
                        mine: true,
                        name: name
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // Philoctetes - No-Nonsense Instructor: "Whenever you play a Hero character, gain 1 lore."
    {
        pattern: /^whenever you play a (.+) character, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const subtype = match[1];
            const effectText = match[2];
            const effects = parseStaticEffects(effectText);
            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_PLAYED,
                    triggerFilter: {
                        mine: true,
                        type: 'Character', // Implicitly character
                        subtype: subtype
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // Minnie Mouse - Dazzling Dancer: "Whenever this character or one of your characters named Mickey Mouse challenges another character, gain 1 lore."
    {
        pattern: /^whenever this character or one of your characters named (.+) challenges(?: another character)?, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const name = match[1];
            const effectText = match[2];
            const effects = parseStaticEffects(effectText);
            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_CHALLENGES,
                    triggerFilter: {
                        or: [
                            { source: true },
                            {
                                mine: true,
                                name: name
                            }
                        ]
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // Shenzi - Head Hyena: "Whenever one of your Hyena characters challenges a damaged character, gain 2 lore."
    {
        pattern: /^whenever one of your (.+) characters challenges a damaged character, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const subtype = match[1];
            const effectText = match[2];
            const effects = parseStaticEffects(effectText);
            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_CHALLENGES,
                    triggerFilter: {
                        mine: true,
                        subtype: subtype,
                        target: {
                            damaged: true
                        }
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // Genie - Wonderful Trickster: "Whenever you play a card, draw a card."
    {
        pattern: /^whenever you play a card, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const effectText = match[1];
            const effects = parseStaticEffects(effectText);
            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_PLAYED,
                    triggerFilter: {
                        mine: true,
                        type: 'Card' // Implicitly any card
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },

    // Prince John - Greediest of All: "Whenever your opponent discards 1 or more cards, you may draw a card for each card discarded."
    {
        pattern: /^whenever your opponent discards 1 or more cards, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const effectText = match[1];
            let effects = parseStaticEffects(effectText);

            // Fallback for "draw a card for each card discarded" if parseStaticEffects fails
            if (effects.length === 0 && /draw a card for each card discarded/i.test(effectText)) {
                effects = [{
                    type: 'draw',
                    amount: { type: 'count_of_discarded_cards' }, // Custom amount type for engine to handle
                    target: { type: 'self' }
                }];
            } else if (effects.length > 0) {
                effects.forEach((e: any) => {
                    if (e.type === 'draw') {
                        e.amountStrategy = 'per_discarded_card';
                    }
                });
            }

            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_DISCARDED,
                    triggerFilter: {
                        opponent: true
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },

    // Triton - Young Prince: "Whenever one of your locations is banished, you may put that card into your inkwell facedown and exerted."
    {
        pattern: /^whenever one of your locations is banished, you may put that card into your inkwell facedown and exerted/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_BANISHED,
                triggerFilter: {
                    mine: true,
                    type: 'Location'
                },
                effects: [{
                    type: 'move_to_inkwell',
                    target: { type: 'event_target' }, // The banished location
                    facedown: true,
                    exerted: true,
                    optional: true
                }],
                rawText: text
            } as any;
        }
    },
    // Mickey Mouse - Wayward Sorcerer: "Whenever one of your Broom characters is banished in a challenge, you may return that card to your hand."
    {
        pattern: /^whenever one of your (.+) characters is banished in a challenge, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const subtype = match[1];
            const effectText = match[2];
            const effects = parseStaticEffects(effectText);
            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CHARACTER_BANISHED_IN_CHALLENGE,
                    triggerFilter: {
                        mine: true,
                        subtype: subtype
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },
    // Merlin - Shapeshifter: "Whenever one of your other characters is returned to your hand from play, this character gets +1 ◊ this turn."
    {
        pattern: /^whenever one of your other characters is returned to your hand from play, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const effectText = match[1];
            const effects = parseStaticEffects(effectText);
            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_RETURNED_TO_HAND,
                    triggerFilter: {
                        mine: true,
                        other: true,
                        type: 'Character',
                        fromZone: 'play',
                        toZone: 'hand'
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },

    // King Louie - Jungle VIP: "Whenever another character is banished, you may remove up to 2 damage from this character."
    {
        pattern: /^whenever another character is banished, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const effectText = match[1];
            const effects = parseStaticEffects(effectText);

            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_BANISHED,
                    triggerFilter: {
                        type: 'Character',
                        other: true
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },

    // Fix-It Felix Jr.: "Whenever you return a Racer character card from your discard to your hand..."
    {
        pattern: /^whenever you return (?:a )?(.+?) (?:character )?card(?:s)? from your discard to your hand, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const subtype = match[1];
            const effectText = match[2];
            const effects = parseStaticEffects(effectText);

            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_RETURNED_TO_HAND,
                    triggerFilter: {
                        subtype,
                        fromZone: 'discard',
                        mine: true
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },

    // Mittens: "Once during your turn, whenever a card is put into your inkwell..."
    {
        pattern: /^once during your turn, whenever a card is put into your inkwell, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const effectText = match[1];
            const effects = parseStaticEffects(effectText);

            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_INKED,
                    frequency: 'once_per_turn',
                    triggerFilter: {
                        mine: true
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },

    // Pepa Madrigal / Isabela Madrigal: "Whenever (one of/one or more) your character(s) sings a song..."
    {
        pattern: /^whenever (?:one (?:of |or more (?:of )?)|(?:your ))?your characters? sings? a song, (.+)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            const effectText = match[1];
            const effects = parseStaticEffects(effectText);

            if (effects.length > 0) {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_PLAYED,  // Using generic event; executor can filter for song cards
                    triggerFilter: {
                        mine: true,
                        isSong: true
                    },
                    effects,
                    rawText: text
                } as any;
            }
            return null;
        }
    },

    // Te Kā - Elemental Terror: "During your turn, whenever an opposing character is exerted, banish them."
    {
        pattern: /^(?:during your turn, )?whenever an opposing character is exerted, banish (them|it)/i,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            return {
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'triggered',
                event: GameEvent.CARD_EXERTED,
                triggerFilter: {
                    opponent: true,
                    cardType: 'character'
                },
                effects: [{
                    type: 'banish',
                    target: {
                        type: 'triggering_character' // The character that got exerted
                    }
                }],
                rawText: text
            } as any;
        }
    },
    {
        pattern: /.*/,
        handler: (match: RegExpMatchArray, card: any, text: string) => {
            if (text.includes('put all the cards') || text.includes('discards 1 or more')) {
                console.log('MISC CATCH ALL:', text);
            }
            return null;
        }
    }
];

export function getMiscPatterns(): TriggerPattern[] {
    return MISC_PATTERNS;
}
