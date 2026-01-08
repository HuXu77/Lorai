import { parseToAbilityDefinition } from "../../../engine/ability-parser";
import { GameEvent } from "../../../engine/abilities/events";

describe('Batch 3 Characters Group 7 Repro', () => {

    describe('Shenzi - Head Hyena', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1047,
                name: 'Shenzi',
                fullName: 'Shenzi - Head Hyena',
                abilities: [
                    {
                        "effect": "This character gets +1 ¤ for each other Hyena character you have in play.",
                        "fullText": "STICK AROUND FOR DINNER This character gets +1 ¤\\nfor each other Hyena character you have in play.",
                        "name": "STICK AROUND FOR DINNER",
                        "type": "static"
                    },
                    {
                        "effect": "Whenever one of your Hyena characters challenges a damaged character, gain 2 lore.",
                        "fullText": "WHAT HAVE WE GOT HERE? Whenever one of your\\nHyena characters challenges a damaged character,\\ngain 2 lore.",
                        "name": "WHAT HAVE WE GOT HERE?",
                        "type": "triggered"
                    }
                ],
                // ... fields
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(2);

            // 1. Static: This character gets +1 ¤ for each other Hyena character you have in play
            const staticAbility = abilities.find((a: any) => a.type === 'static' && a.effects?.[0]?.stat === 'strength');
            expect(staticAbility).toBeDefined();
            // TODO: Verify filter details if possible

            // 2. Triggered: Whenever one of your Hyena characters challenges a damaged character, gain 2 lore
            const triggered = abilities.find((a: any) => a.type === 'triggered');
            expect(triggered).toBeDefined();
            expect(triggered?.event).toBe(GameEvent.CARD_CHALLENGES);
        });
    });

    describe('Triton - Young Prince', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 851,
                name: 'Triton',
                fullName: 'Triton - Young Prince',
                abilities: [
                    {
                        "effect": "During your turn, this character gains Evasive. (They can challenge characters with Evasive.)",
                        "fullText": "SUPERIOR SWIMMER During your turn, this\\ncharacter gains Evasive. (They can challenge\\ncharacters with Evasive.)",
                        "name": "SUPERIOR SWIMMER",
                        "type": "static"
                    },
                    {
                        "effect": "Whenever one of your locations is banished, you may put that card into your inkwell facedown and exerted.",
                        "fullText": "KEEPER OF ATLANTICA Whenever one of your\\nlocations is banished, you may put that card into\\nyour inkwell facedown and exerted.",
                        "name": "KEEPER OF ATLANTICA",
                        "type": "triggered"
                    }
                ]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(2);

            // 1. Static: During your turn, this character gains Evasive
            const staticAbility = abilities.find((a: any) => a.type === 'static');
            expect(staticAbility).toBeDefined();
            expect((staticAbility?.effects[0] as any).type).toBe('grant_keyword');
            expect((staticAbility?.effects[0] as any).keyword).toBe('Evasive');

            // 2. Triggered: Whenever one of your locations is banished
            const triggered = abilities.find((a: any) => a.type === 'triggered');
            expect(triggered).toBeDefined();
            expect(triggered?.event).toBe(GameEvent.CARD_BANISHED);
        });
    });

    describe('Genie - Wonderful Trickster', () => {
        it('should parse 3 abilities', () => {
            const card = {
                id: 1260,
                name: 'Genie',
                fullName: 'Genie - Wonderful Trickster',
                abilities: [
                    {
                        "keyword": "Shift",
                        "keywordValue": "5",
                        "fullText": "Shift 5 (You may pay 5 ⬡ to play this on top of one of your characters named Genie.)",
                        "type": "keyword"
                    },
                    {
                        "effect": "Whenever you play a card, draw a card.",
                        "fullText": "YOUR REWARD AWAITS Whenever you play a card, draw a card.",
                        "name": "YOUR REWARD AWAITS",
                        "type": "triggered"
                    },
                    {
                        "effect": "At the end of your turn, put all the cards in your hand on the bottom of your deck in any order.",
                        "fullText": "FORBIDDEN TREASURE At the end of your turn, put all the\\ncards in your hand on the bottom of your deck in any order.",
                        "name": "FORBIDDEN TREASURE",
                        "type": "triggered"
                    }
                ]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(3);

            // Trigger 1: Whenever you play a card...
            const playTrigger = abilities.find((a: any) => a.event === GameEvent.CARD_PLAYED && a.rawText.includes('Whenever you play a card'));
            expect(playTrigger).toBeDefined();

            // Trigger 2: At the end of your turn...
            const endTurnTrigger = abilities.find((a: any) => a.event === GameEvent.TURN_END);
            expect(endTurnTrigger).toBeDefined();
        });
    });

    describe('Mickey Mouse - Wayward Sorcerer', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 208,
                name: 'Mickey Mouse',
                fullName: 'Mickey Mouse - Wayward Sorcerer',
                abilities: [
                    {
                        "effect": "You pay 1 ⬡ less to play Broom characters.",
                        "fullText": "ANIMATE BROOM You pay 1 ⬡ less to play Broom\\ncharacters.",
                        "name": "ANIMATE BROOM",
                        "type": "static"
                    },
                    {
                        "effect": "Whenever one of your Broom characters is banished in a challenge, you may return that card to your hand.",
                        "fullText": "CEASELESS WORKER Whenever one of your Broom\\ncharacters is banished in a challenge, you may return\\nthat card to your hand.",
                        "name": "CEASELESS WORKER",
                        "type": "triggered"
                    }
                ]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(2);

            // Static: You pay 1 ⬡ less to play Broom characters
            const staticAbility = abilities.find((a: any) => a.type === 'static');
            expect(staticAbility).toBeDefined();

            // Triggered: Whenever one of your Broom characters is banished in a challenge
            const trigger = abilities.find((a: any) => a.type === 'triggered');
            expect(trigger).toBeDefined();
            // TODO: expect(trigger.event).toBe(GameEvent.CHARACTER_BANISHED_CHALLENGE);
        });
    });

    describe('Merlin - Shapeshifter', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 269,
                name: 'Merlin',
                fullName: 'Merlin - Shapeshifter',
                abilities: [
                    {
                        "effect": "Whenever one of your other characters is returned to your hand from play, this character gets +1 ◊ this turn.",
                        "fullText": "BATTLE OF WITS Whenever one of your other\\ncharacters is returned to your hand from play,\\nthis character gets +1 ◊ this turn.",
                        "name": "BATTLE OF WITS",
                        "type": "triggered"
                    }
                ]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);

            const trigger = abilities[0];
            expect(trigger.type).toBe('triggered');
            expect(trigger.event).toBe(GameEvent.CARD_RETURNED_TO_HAND);
            // expect(trigger.triggerFilter.destination).toBe('hand');
        });
    });

    describe('Prince John - Greediest of All', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 305,
                name: 'Prince John',
                fullName: 'Prince John - Greediest of All',
                abilities: [
                    {
                        "keyword": "Ward",
                        "fullText": "Ward (Opponents can't choose this character except to challenge.)",
                        "type": "keyword"
                    },
                    {
                        "effect": "Whenever your opponent discards 1 or more cards, you may draw a card for each card discarded.",
                        "fullText": "I SENTENCE YOU Whenever your opponent discards\\n1 or more cards, you may draw a card for each card\\ndiscarded.",
                        "name": "I SENTENCE YOU",
                        "type": "triggered"
                    }
                ]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(2);

            const trigger = abilities.find((a: any) => a.type === 'triggered');
            expect(trigger).toBeDefined();
            // expect(trigger.event).toBe(GameEvent.PLAYER_DISCARDS);
        });
    });

});
