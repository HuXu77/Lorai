import { parseToAbilityDefinition } from '../../../engine/ability-parser';
import { CardType } from '../../../engine/models';

describe('Batch 3: Characters Group 3 Reproduction Tests', () => {

    describe('Sheriff of Nottingham - Corrupt Official', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 627,
                name: 'Sheriff of Nottingham',
                fullName: 'Sheriff of Nottingham - Corrupt Official',
                abilities: [
                    {
                        "effect": "Whenever you discard a card, you may deal 1 damage to chosen opposing character.",
                        "fullText": "TAXES SHOULD HURT Whenever you discard a\\ncard, you may deal 1 damage to chosen opposing\\ncharacter.",
                        "name": "TAXES SHOULD HURT",
                        "type": "triggered"
                    }
                ],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: false,
                color: 'Steel'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
        });
    });

    describe('Thaddeus E. Klang - Metallic Leader', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 630,
                name: 'Thaddeus E. Klang',
                fullName: 'Thaddeus E. Klang - Metallic Leader',
                abilities: [
                    {
                        "effect": "Whenever this character quests while at a location, you may deal 1 damage to chosen character.",
                        "fullText": "MY TEETH ARE SHARPER Whenever this character\\nquests while at a location, you may deal 1 damage\\nto chosen character.",
                        "name": "MY TEETH ARE SHARPER",
                        "type": "triggered"
                    }
                ],
                cost: 5,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Steel'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
        });
    });

    describe('Stitch - Rock Star', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 660,
                name: 'Stitch',
                fullName: 'Stitch - Rock Star',
                abilities: [
                    {
                        "fullText": "Shift 4 (You may pay 4 ⬡ to play this on top of one of your Stitch\\ncharacters.)",
                        "keyword": "Shift",
                        "keywordValue": "4",
                        "keywordValueNumber": 4,
                        "reminderText": "You may pay 4 ⬡ to play this on top of one of your Stitch characters.",
                        "type": "keyword"
                    },
                    {
                        "effect": "Whenever you play a character with cost 2 or less, you may exert it to draw a card.",
                        "fullText": "ADORING FANS Whenever you play a character with cost 2 or less,\\nyou may exert it to draw a card.",
                        "name": "ADORING FANS",
                        "type": "triggered"
                    }
                ],
                cost: 6,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amber'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(2);
        });
    });

    describe('Minnie Mouse - Wide-Eyed Diver', () => {
        it('should parse 3 abilities', () => {
            const card = {
                id: 674,
                name: 'Minnie Mouse',
                fullName: 'Minnie Mouse - Wide-Eyed Diver',
                abilities: [
                    {
                        "fullText": "Shift 2 (You may pay 2 ⬡ to play this on top of one of\\nyour characters named Minnie Mouse.)",
                        "keyword": "Shift",
                        "keywordValue": "2",
                        "keywordValueNumber": 2,
                        "reminderText": "You may pay 2 ⬡ to play this on top of one of your characters named Minnie Mouse.",
                        "type": "keyword"
                    },
                    {
                        "fullText": "Evasive (Only characters with Evasive can challenge this\\ncharacter.)",
                        "keyword": "Evasive",
                        "reminderText": "Only characters with Evasive can challenge this character.",
                        "type": "keyword"
                    },
                    {
                        "effect": "Whenever you play a second action in a turn, this character gets +2 ◊ this turn.",
                        "fullText": "UNDERSEA ADVENTURE Whenever you play a second\\naction in a turn, this character gets +2 ◊ this turn.",
                        "name": "UNDERSEA ADVENTURE",
                        "type": "triggered"
                    }
                ],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(3);
        });
    });

    describe('Rapunzel - Gifted Artist', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 689,
                name: 'Rapunzel',
                fullName: 'Rapunzel - Gifted Artist',
                abilities: [
                    {
                        "fullText": "Shift 3 (You may pay 3 ⬡ to play this on top of\\none of your characters named Rapunzel.)",
                        "keyword": "Shift",
                        "keywordValue": "3",
                        "keywordValueNumber": 3,
                        "reminderText": "You may pay 3 ⬡ to play this on top of one of your characters named Rapunzel.",
                        "type": "keyword"
                    },
                    {
                        "effect": "Whenever you remove 1 or more damage from one of your characters, you may draw a card.",
                        "fullText": "LET YOUR POWER SHINE Whenever you remove 1 or\\nmore damage from one of your characters, you\\nmay draw a card.",
                        "name": "LET YOUR POWER SHINE",
                        "type": "triggered"
                    }
                ],
                cost: 5,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amber'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(2);
        });
    });

    describe('Prince John - Fraidy-Cat', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1810,
                name: 'Prince John',
                fullName: 'Prince John - Fraidy-Cat',
                abilities: [
                    {
                        "effect": "Whenever an opponent plays a character, deal 1 damage to this character.",
                        "fullText": "HELP! HELP! Whenever an opponent plays a\\ncharacter, deal 1 damage to this character.",
                        "name": "HELP! HELP!",
                        "type": "triggered"
                    }
                ],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: false,
                color: 'Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
        });
    });

});
