import { TriggerPattern } from './types';
import { AbilityDefinition, Card, generateAbilityId, GameEvent } from '../parser-utils';
import { parseStaticEffects } from '../static-effect-parser';

export function getCombatPatterns(): TriggerPattern[] {
    return [
        // Goliath - Guardian of Castle Wyvern: "Whenever one of your Gargoyle characters challenges another character, gain 1 lore."
        {
            pattern: /^whenever one of your (.+?) characters challenges (?:another character|a character), (.+)/i,
            handler: (match, card, text) => {
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
                            subtype: subtype
                        },
                        effects,
                        rawText: text
                    } as any;
                }
                return null;
            }
        },

        // Brom Bones - Burly Bully: "Whenever this character challenges a character with 2 ¤ or less, each opponent loses 1 lore."
        {
            pattern: /^whenever this character challenges a character with (\d+) ([¤◊⛉]) or less, (.+)/i,
            handler: (match, card, text) => {
                const amount = parseInt(match[1]);
                const statSym = match[2];
                let stat = 'strength';
                if (['◊'].includes(statSym)) stat = 'lore';
                if (['⛉'].includes(statSym)) stat = 'willpower';

                const effectText = match[3];
                const effects = parseStaticEffects(effectText);

                if (effects.length > 0) {
                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CARD_CHALLENGES,
                        triggerFilter: {
                            target: { // The target of the challenge
                                stat,
                                value: amount,
                                operator: 'lte'
                            }
                        },
                        effects,
                        rawText: text
                    } as any;
                }
                return null;
            }
        },
        // Jeweled Collar: "Whenever one of your characters is challenged, you may put the top card of your deck into your inkwell facedown and exerted."
        {
            pattern: /^whenever one of your (?:other )?characters is challenged, (.+)/i,
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
                        event: GameEvent.CARD_CHALLENGED,
                        triggerFilter: { mine: true }, // The target of the challenge must be mine
                        effects,
                        rawText: text
                    } as any;
                }
                return null;
            }
        },
        // DEEPWELL LABYRINTH: Challenges this location
        // "Whenever a character challenges this location, each Illumineer chooses and discards a card."
        {
            pattern: /^whenever a character challenges this location, (.+)/i,
            handler: (match, card, text) => {
                const effectText = match[1];
                const effects = parseStaticEffects(effectText);

                if (effects.length > 0) {
                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CARD_CHALLENGED,
                        triggerFilter: { target: 'self' }, // "this location" is self
                        effects,
                        rawText: text
                    } as any;
                }
                return null;
            }
        },

        // PERILOUS MAZE: Challenged while here
        // "Whenever a character is challenged while here, each opponent chooses and discards a card."
        {
            pattern: /^whenever a character is challenged while here, (.+)/i,
            handler: (match, card, text) => {
                const effectText = match[1];
                const effects = parseStaticEffects(effectText);

                if (effects.length > 0) {
                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CARD_CHALLENGED,
                        condition: { type: 'while_here' }, // Implies target is at this location
                        effects,
                        rawText: text
                    } as any;
                }
                return null;
            }
        },

        // SNUGGLY DUCKLING: Challenges another character while here
        // "Whenever a character with 3 ¤ or more challenges another character while here, gain 1 lore."
        {
            pattern: /^whenever a character (?:with (.+) )?challenges another character while here, (.+)/i,
            handler: (match, card, text) => {
                const conditionStr = match[1]; // e.g. "3 ¤ or more"
                const effectText = match[2];
                const effects = parseStaticEffects(effectText);

                if (effects.length > 0) {
                    const triggerFilter: any = {};
                    if (conditionStr) {
                        // Simplify parsing for "3 ¤ or more"
                        if (conditionStr.match(/(\d+) ([¤🛡️⛉◊]) or more/i)) {
                            const m = conditionStr.match(/(\d+) ([¤🛡️⛉◊]) or more/i);
                            triggerFilter.minStat = parseInt(m![1]);
                            triggerFilter.stat = m![2] === '¤' ? 'strength' : 'willpower';
                        }
                    }

                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CARD_CHALLENGES,
                        condition: { type: 'while_here' }, // Implies source is at this location
                        triggerFilter,
                        effects,
                        rawText: text
                    } as any;
                }
                return null;
            }
        },

        // Bellwether: When challenged and banished, damage all opposing characters
        // "When this character is challenged and banished, put 1 damage counter on each opposing character."
        {
            pattern: /^when this character is challenged and banished, put (\d+) damage counter(?:s)? on each opposing character/i,
            handler: (match, card, text) => {
                const amount = parseInt(match[1]);
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CHARACTER_CHALLENGED_AND_BANISHED,
                    effects: [{
                        type: 'put_damage_counter',
                        amount,
                        target: { type: 'all_opposing_characters' }
                    }],
                    rawText: text
                } as any;
            }
        },

        // When this character challenges and is banished (Prince Phillip - Dragonslayer)
        {
            pattern: /^when this character challenges and is banished, you may banish the challenged character/i,
            handler: (match, card, text) => {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CHARACTER_CHALLENGED_AND_BANISHED,
                    effects: [{
                        type: 'banish',
                        target: { type: 'challenged_character' },
                        optional: true
                    }],
                    rawText: text
                } as any;
            }
        },

        // Whenever one of your characters challenges (Shere Khan, Headless Horseman)
        // "Whenever one of your characters challenges another character, gain 1 lore."
        // "Whenever one of your characters exerts to challenge,"
        {
            pattern: /^whenever (?:one of )?your characters? (?:challenges?|exerts to challenge)(?: another character)?,? (.+)/i,
            handler: (match: RegExpMatchArray, card: any, text: string) => {
                console.log("DEBUG: Combat match!", text);
                const effectText = match[1];
                const effects = parseStaticEffects(effectText);
                console.log("DEBUG: Combat effects parsed:", effects.length);

                if (effects.length > 0) {
                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CARD_CHALLENGES,
                        triggerFilter: { source: 'your_characters' },
                        effects,
                        rawText: text
                    } as any;
                }
                return null;
            }
        },

        // Whenever one of your characters banishes another character in a challenge (Mushu, Scrooge, Nick Wilde)
        {
            pattern: /^whenever (?:one of )?your ((?:\w+ )*)characters? banishes another character in a challenge,? (.+)/i,
            handler: (match, card, text) => {
                const subtype = match[1] ? match[1].trim() : undefined;
                const effectText = match[2].trim();
                const effects = parseStaticEffects(effectText);

                if (effects.length > 0) {
                    const triggerFilter: any = { source: 'your_characters' };
                    if (subtype) {
                        triggerFilter.subtype = subtype;
                    }

                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CHALLENGE_BANISH,
                        triggerFilter,
                        effects,
                        rawText: text
                    } as any;
                }
                return null;
            }
        },

        // Whenever an opposing character is banished (Headless Horseman)
        // "Whenever an opposing character is banished, each of your characters gets +1 ¤ this turn."
        // Note: "During your turn" is handled by triggered-parser.ts prefix logic.
        {
            pattern: /banished/i,
            handler: (match, card, text) => {
                // console.log("DEBUG: Matched Opponent Banish Trigger Broad");
                // Verify prefix "whenever an opposing character is banished"
                // Allow optional "During your turn, " prefix
                if (!text.match(/^(?:during your turn, )?whenever an opposing character is banished/i)) return null;

                const effectText = text.replace(/^(?:during your turn, )?whenever an opposing character is banished,? /i, '');
                const effects = parseStaticEffects(effectText);

                if (effects.length > 0) {
                    // Assuming createCombatTriggeredAbility is defined elsewhere or will be added.
                    // For now, I'll replicate the original structure with the new triggerFilter.
                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CARD_BANISHED, // Generic banish event
                        triggerFilter: {
                            type: 'character',
                            opponent: true
                        },
                        effects,
                        rawText: text
                    } as any;
                }
                return null;
            }
        },

        // Whenever an opposing character is damaged (Captain Hook)
        {
            pattern: /^whenever an opposing character is damaged, (.+)/i,
            handler: (match, card, text) => {
                const effectText = match[1];
                const effects = parseStaticEffects(effectText);

                if (effects.length > 0) {
                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CHARACTER_DAMAGED,
                        triggerFilter: {
                            target: { opponent: true }
                        },
                        effects,
                        rawText: text
                    } as any;
                }
                return null;
            }
        },

        // Belle - Hidden Archer
        {
            pattern: /^whenever this character is challenged, the challenging character's player discards all cards in their hand/i,
            handler: (match, card, text) => {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_CHALLENGED,
                    triggerFilter: { target: 'self' },
                    effects: [{
                        type: 'discard_hand',
                        target: { type: 'opponent' }
                    }],
                    rawText: text
                } as any;
            }
        },

        // When this character is challenged (Flynn Rider)
        {
            pattern: /^whenever this character is challenged, (.+)/i,
            handler: (match, card, text) => {
                const effectText = match[1];
                const effects = parseStaticEffects(effectText);

                if (effects.length > 0) {
                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CARD_CHALLENGED,
                        triggerFilter: { target: 'self' },
                        effects,
                        rawText: text
                    } as any;
                }
                return null;
            }
        },

        // When this character is challenged and banished (Gunther)
        {
            pattern: /^when this character is challenged and banished, (.+)/i,
            handler: (match, card, text) => {
                const effectText = match[1];
                const effects = parseStaticEffects(effectText);

                if (effects.length > 0) {
                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CHARACTER_CHALLENGED_AND_BANISHED,
                        effects,
                        rawText: text
                    } as any;
                }
                return null;
            }
        },

        // When banished in a challenge
        {
            pattern: /^when(?:ever)? this character is banished in a challenge, (.+)/i,
            handler: (match, card, text) => {
                const effectText = match[1];
                const effects = parseStaticEffects(effectText);

                if (effects.length > 0) {
                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CHARACTER_BANISHED_IN_CHALLENGE,
                        effects,
                        rawText: text
                    } as any;
                }
                return null;
            }
        },

        // Jetsam - Opportunistic Eel: "When this character is banished in a challenge, you may return chosen character card with cost 4 or less from your discard to your hand."
        {
            pattern: /^when this character is banished in a challenge, you may return chosen character card with cost (\d+) or less from your discard to your hand/i,
            handler: (match, card, text) => {
                const maxCost = parseInt(match[1]);
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CHARACTER_BANISHED_IN_CHALLENGE,
                    effects: [{
                        type: 'return_from_discard',
                        amount: 1,
                        target: {
                            zone: 'discard',
                            destination: 'hand',
                            filter: {
                                cardType: 'character',
                                maxCost
                            }
                        },
                        optional: true
                    }],
                    rawText: text
                } as any;
            }
        },

        // Ursula's Lair: "Whenever a character is banished in a challenge while here"
        // More specific than the general "banished while here" pattern below
        {
            pattern: /^whenever a character is banished in a challenge while here, (.+)/i,
            handler: (match, card, text) => {
                const effectText = match[1];
                const effects = parseStaticEffects(effectText);

                if (effects.length > 0) {
                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CHALLENGE_BANISH,
                        condition: { type: 'while_here' },
                        triggerFilter: { location: card.id.toString() },
                        effects,
                        rawText: text
                    } as any;
                }
                return null;
            }
        },

        // Whenever a character is banished while here (Motunui)
        {
            pattern: /^whenever a character is banished while here, (.+)/i,
            handler: (match, card, text) => {
                const effectText = match[1];
                const effects = parseStaticEffects(effectText);

                if (effects.length > 0) {
                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CARD_BANISHED,
                        condition: { type: 'while_here' },
                        effects,
                        rawText: text
                    } as any;
                }
                return null;
            }
        },

        // Thebes: "Whenever a character banishes another character in a challenge while here"
        {
            pattern: /^whenever a character banishes another character in a challenge while here, (.+)/i,
            handler: (match, card, text) => {
                const effectText = match[1];
                const effects = parseStaticEffects(effectText);

                if (effects.length > 0) {
                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CHALLENGE_BANISH,
                        condition: { type: 'while_here' },
                        // triggerFilter: { location: 'self' }, // implied by condition type
                        effects,
                        rawText: text
                    } as any;
                }
                return null;
            }
        },

        // Whenever another character is banished in a challenge (Yzma - Above It All)
        // "return that card to its player's hand, then that player discards a card at random"
        {
            pattern: /^whenever another character is banished in a challenge, (.+)/i,
            handler: (match, card, text) => {
                const effectText = match[1];

                // Handle complex compound effects with "then"
                const parts = effectText.split(/,\s*then\s+/i);
                const effects: any[] = [];

                parts.forEach(part => {
                    const partEffects = parseStaticEffects(part);
                    effects.push(...partEffects);
                });

                if (effects.length > 0) {
                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CHALLENGE_BANISH,
                        triggerFilter: { source: 'any', notSelf: true },
                        effects,
                        rawText: text
                    } as any;
                }
                return null;
            }
        },

        // Whenever this character banishes another character in a challenge (Mulan)
        {
            pattern: /^whenever this character banishes another character in a challenge, (.+)/i,
            handler: (match, card, text) => {
                const effectText = match[1];
                const effects = parseStaticEffects(effectText);

                if (effects.length > 0) {
                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CHALLENGE_BANISH,
                        triggerFilter: { source: 'self' },
                        effects,
                        rawText: text
                    } as any;
                }
                return null;
            }
        },

        // Zeus - Mr. Lightning Bolts: "Whenever this character challenges another character, he gets +¤ equal to the ¤ of chosen character this turn."
        {
            pattern: /whenever this character challenges another character, (?:he|she|they) gets? \+([¤🛡️⛉◊]) equal to the ([¤🛡️⛉◊]) of chosen character this turn/i,
            handler: (match, card, text) => {
                const stat = match[1] === '¤' ? 'strength' : match[1] === '◊' ? 'lore' : 'willpower';
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_CHALLENGES,
                    effects: [{
                        type: 'gain_stat_equal_to_chosen',
                        stat,
                        source: { type: 'chosen_character' },
                        target: { type: 'self' },
                        duration: 'turn'
                    }],
                    rawText: text
                } as any;
            }
        },

        // Prince Phillip - Swordsman: "Whenever he challenges a damaged character, ready this character after the challenge."
        {
            pattern: /whenever (?:he|she|they) challenges? a damaged character, ready this character after the challenge/i,
            handler: (match, card, text) => {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_CHALLENGES,
                    triggerFilter: { targetDamaged: true },
                    effects: [{
                        type: 'ready_character',
                        target: { type: 'self' },
                        timing: 'after_challenge'
                    }],
                    rawText: text
                } as any;
            }
        },

        // Tiana: "Whenever a character of yours is challenged while this character is exerted, the challenging character gets -3 ¤ this turn unless their player pays 3 ⬡."
        {
            pattern: /whenever a character of yours is challenged while this character is exerted, the challenging character gets ([+\-]\d+) ([¤🛡️⛉◊]) this turn unless their player pays (\d+) [⬡\u2b21]/i,
            handler: (match, card, text) => {
                const statMod = parseInt(match[1]);
                const stat = match[2] === '¤' ? 'strength' : match[2] === '◊' ? 'lore' : 'willpower';
                const payCost = parseInt(match[3]);
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_CHALLENGED,
                    triggerFilter: {
                        targetIsMine: true,
                        selfExerted: true
                    },
                    effects: [{
                        type: 'stat_modification_unless_pay',
                        stat,
                        amount: statMod,
                        target: { type: 'challenging_character' },
                        duration: 'turn',
                        unlessPay: payCost
                    }],
                    rawText: text
                } as any;
            }
        },

        // 7. Challenge Damage Prevention (Raya)
        // "Whenever this character challenges a damaged character, she takes no damage from the challenge."
        {
            pattern: /whenever this character challenges a damaged character, she takes no damage from the challenge/i,
            handler: (match, card, text) => {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_CHALLENGES,
                    triggerFilter: { target: { damaged: true } },
                    effects: [{
                        type: 'prevent_damage',
                        source: 'challenge'
                    }],
                    rawText: text
                } as any;
            }
        },

        // 15. Location Banished Trigger (Kuzco's Palace)
        // "Whenever a character is challenged and banished while here, banish the challenging character."
        {
            pattern: /whenever a character is challenged and banished while here, banish the challenging character/i,
            handler: (match, card, text) => {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CHARACTER_BANISHED_IN_CHALLENGE,
                    triggerFilter: { location: 'self' },
                    effects: [{
                        type: 'banish',
                        target: 'challenger'
                    }],
                    rawText: text
                } as any;
            }
        },

        // Generic "When this character is banished"
        // Example: Cheshire Cat - Not All There
        {
            pattern: /^when this character is banished, (.+)/i,
            handler: (match, card, text) => {
                const effectText = match[1];
                const effects = parseStaticEffects(effectText);

                if (effects.length > 0) {
                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CARD_BANISHED,
                        effects,
                        rawText: text
                    } as any;
                }
                return null;
            }
        },

        // "Whenever one of your (other) characters is banished"
        // Example: Dr. Facilier - Agent Provocateur
        {
            pattern: /^whenever one of your (other )?characters is banished( in a challenge)?, (.+)/i,
            handler: (match, card, text) => {
                const isOther = !!match[1];
                const inChallenge = !!match[2];
                const effectText = match[3];

                const effects = parseStaticEffects(effectText);

                if (effects.length > 0) {
                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: inChallenge ? GameEvent.CHARACTER_BANISHED_IN_CHALLENGE : GameEvent.CARD_BANISHED,
                        condition: {
                            type: 'event_occurred',
                            event: inChallenge ? 'character_banished_in_challenge' : 'character_banished',
                            filter: {
                                mine: true,
                                other: isOther
                            }
                        },
                        effects,
                        rawText: text
                    } as any;
                }
                return null;
            }
        },

        // "Whenever one of your items is banished" (Tinker Bell - Giant Fairy)
        {
            pattern: /^whenever one of your items is banished, (.+)/i,
            handler: (match, card, text) => {
                const effectText = match[1];
                const effects = parseStaticEffects(effectText);

                // Mark effects as optional if "you may" prefix
                if (effectText.match(/^you may/i)) {
                    effects.forEach(e => e.optional = true);
                }

                if (effects.length > 0) {
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

        // 16. Damage Reflect (Hydra)
        // "Whenever this character is dealt damage, deal that much damage to chosen opposing character."
        {
            pattern: /whenever this character is dealt damage, deal that much damage to chosen opposing character/i,
            handler: (match, card, text) => {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CHARACTER_DAMAGED,
                    effects: [{
                        type: 'damage',
                        amount: { type: 'variable', name: 'damage_dealt' },
                        target: {
                            type: 'chosen_character',
                            filter: { opponent: true }
                        }
                    }],
                    rawText: text
                } as any;
            }
        },

        // 21. Specific Challenge Immunity (Rafiki)
        // "Whenever he challenges a Hyena character, this character takes no damage from the challenge."
        {
            pattern: /whenever he challenges a (.+) character, this character takes no damage from the challenge/i,
            handler: (match, card, text) => {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_CHALLENGES,
                    triggerFilter: {
                        target: { subtype: match[1].toLowerCase() }
                    },
                    effects: [{
                        type: 'prevent_damage',
                        source: 'challenge'
                    }],
                    rawText: text
                } as any;
            }
        },

        // 26. Damage Splash (Mulan - Elite Archer)
        // "During your turn, whenever this character deals damage to another character in a challenge, deal the same amount of damage to up to 2 other chosen characters."
        // COMMENTED OUT: Handled in misc.ts to support complex "deal same amount" logic and pre-processor handling
        /*
        {
            pattern: /whenever this character deals damage to another character in a challenge, deal the same amount of damage to up to 2 other chosen characters/i,
            handler: (match, card, text) => {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_DEALS_DAMAGE,
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
        },
        */

        // 30. Triggered Damage Reflection (Namaari - Heir of Fang)
        // "During your turn, whenever this character deals damage to another character in a challenge, you may deal the same amount of damage to another chosen character."
        {
            pattern: /whenever this character deals damage to another character in a challenge, you may deal the same amount of damage to another chosen character/i,
            handler: (match, card, text) => {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_DEALS_DAMAGE,
                    effects: [{
                        type: 'damage_reflection',
                        optional: true,
                        target: {
                            type: 'chosen_character',
                            filter: { other: true }
                        }
                    }],
                    rawText: text
                } as any;
            }
        },

        // 33. Play Same Name as Banished (Hades - Double Dealer)
        // "Whenever one of your other characters is banished in a challenge, you may play a character with the same name as the banished character from your discard for free."
        {
            pattern: /whenever one of your other characters is banished in a challenge, you may play a character with the same name as the banished character from your discard for free/i,
            handler: (match, card, text) => {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CHARACTER_BANISHED_IN_CHALLENGE,
                    effects: [{
                        type: 'play_same_name_as_banished',
                        free: true
                    }],
                    rawText: text
                } as any;
            }
        },

        // 35. Triggered Return on Banish (Emerald Chromicon)
        // "During opponents' turns, whenever one of your characters is banished, you may return chosen character to their player's hand."
        {
            pattern: /during opponents' turns, whenever one of your characters is banished, you may return chosen character to their player's hand/i,
            handler: (match, card, text) => {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_BANISHED,
                    condition: { type: 'opponent_turn' },
                    effects: [{
                        type: 'return_to_hand',
                        target: { type: 'chosen_character' }
                    }],
                    rawText: text
                } as any;
            }
        },

        // 38. Opposing Banish Trigger (Queen of Hearts)
        // "Whenever an opposing character is banished, you may ready this character."
        {
            pattern: /whenever an opposing character is banished, you may ready this character/i,
            handler: (match, card, text) => {
                return {
                    id: generateAbilityId(),
                    cardId: card.id.toString(),
                    type: 'triggered',
                    event: GameEvent.CARD_BANISHED,
                    triggerFilter: {
                        target: { opposing: true }
                    },
                    effects: [{
                        type: 'ready',
                        target: { type: 'self' }
                    }],
                    rawText: text
                } as any;
            }
        },

        // Generic "Whenever this character challenges, [effect]"
        // Must come before the more specific "when(ever) this character challenges" pattern
        {
            pattern: /(?:whenever|when) (?:this character|he|she|it) challenges(?: another character)?, (.+)/i,
            handler: (match, card, text) => {
                const effectText = match[1];
                const effects = parseStaticEffects(effectText);

                if (effects.length > 0) {
                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CARD_CHALLENGES,
                        triggerFilter: { source: 'self' },
                        effects,
                        rawText: text
                    } as any;
                }
                return null;
            }
        },

        // Whenever this character is challenged
        {
            pattern: /(?:whenever|when) (?:this character|he|she) is challenged, (.+)/i,
            handler: (match, card, text) => {
                const effectText = match[1];
                let effects: any[] = [];

                // Special case for "banish the challenging character" which isn't a standard static effect
                if (effectText.match(/banish the challenging character/i)) {
                    effects.push({
                        type: 'banish',
                        target: { type: 'challenging_character' }
                    });
                } else {
                    effects = parseStaticEffects(effectText);
                }

                if (effects.length > 0) {
                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CARD_CHALLENGED,
                        triggerFilter: {
                            target: 'self' // This ability triggers when THIS card is challenged
                        },
                        effects,
                        rawText: text
                    } as any;
                }
                return null;
            }
        },

        // Whenever this character banishes another character in a challenge (duplicate - consider removing)
        {
            pattern: /^when(?:ever)? this character banishes another character in a challenge, (.+)/i,
            handler: (match, card, text) => {
                const effectText = match[1];
                const effects = parseStaticEffects(effectText);

                if (effects.length > 0) {
                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CHALLENGE_BANISH,
                        triggerFilter: { source: 'self' },
                        effects,
                        rawText: text
                    } as any;
                }
                return null;
            }
        },

        // Blessed Bagpipes: When character/location with card under is challenged
        // "Whenever one of your characters or locations with a card under them is challenged, gain 1 lore."
        {
            pattern: /^whenever one of your (characters?|locations?|characters or locations) with (?:a )?card under them is challenged, (.+)/i,
            handler: (match, card, text) => {
                const targetType = match[1].toLowerCase();
                const effectText = match[2];
                const effects = parseStaticEffects(effectText);

                if (effects.length > 0) {
                    // Parse target type filter
                    let triggerFilter: any = { source: 'your_characters' };
                    if (targetType.includes('location')) {
                        triggerFilter.source = 'your_locations';
                    } else if (targetType.includes('or')) {
                        triggerFilter.source = 'your_cards';
                    }

                    // Add "has card under" filter
                    triggerFilter.hasCardsUnder = true;

                    return {
                        id: generateAbilityId(),
                        cardId: card.id.toString(),
                        type: 'triggered',
                        event: GameEvent.CARD_CHALLENGED,
                        triggerFilter,
                        effects,
                        rawText: text
                    } as any;
                }
                return null;
            }
        }
    ];
}
