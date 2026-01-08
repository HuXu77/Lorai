import { parseToAbilityDefinition } from '../../../engine/ability-parser';
import { CardType } from '../../../engine/models';

describe('Batch 3 Characters - Group 4 Repro', () => {

    describe('Grand Pabbie - Oldest and Wisest', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 364,
                name: 'Grand Pabbie',
                fullName: 'Grand Pabbie - Oldest and Wisest',
                abilities: [
                    {
                        "effect": "Whenever you remove 1 or more damage from one of your characters, gain 2 lore.",
                        "fullText": "ANCIENT INSIGHT Whenever you remove 1 or\\nmore damage from one of your characters, gain\\n2 lore.",
                        "name": "ANCIENT INSIGHT",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "ANCIENT INSIGHT Whenever you remove 1 or\\nmore damage from one of your characters, gain\\n2 lore."
                ],
                cost: 7,
                type: 'Character' as CardType,
                inkwell: false,
                color: 'Sapphire'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Archimedes - Exceptional Owl', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1509,
                name: 'Archimedes',
                fullName: 'Archimedes - Exceptional Owl',
                abilities: [
                    {
                        "effect": "Whenever an opponent chooses this character for an action or ability, you may draw a card.",
                        "fullText": "MORE TO LEARN Whenever an opponent chooses\\nthis character for an action or ability, you may\\ndraw a card.",
                        "name": "MORE TO LEARN",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "MORE TO LEARN Whenever an opponent chooses\\nthis character for an action or ability, you may\\ndraw a card."
                ],
                cost: 2,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amethyst'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Webby\'s Diary', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 2220,
                name: 'Webby\'s Diary',
                fullName: 'Webby\'s Diary',
                abilities: [
                    {
                        "effect": "Whenever you put a card under one of your characters or locations, you may pay 1 ⬡ to draw a card.",
                        "fullText": "LATEST ENTRY Whenever you put a card under one\\nof your characters or locations, you may pay 1 ⬡ to\\ndraw a card.",
                        "name": "LATEST ENTRY",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "LATEST ENTRY Whenever you put a card under one\\nof your characters or locations, you may pay 1 ⬡ to\\ndraw a card."
                ],
                cost: 3,
                type: 'Item' as CardType,
                inkwell: true,
                color: 'Amber'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Minnie Mouse - Amethyst Champion', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 2224,
                name: 'Minnie Mouse',
                fullName: 'Minnie Mouse - Amethyst Champion',
                abilities: [
                    {
                        "effect": "Whenever one of your other Amethyst characters is banished in a challenge, you may draw a card.",
                        "fullText": "MYSTICAL BALANCE Whenever one of your other\\nAmethyst characters is banished in a challenge,\\nyou may draw a card.",
                        "name": "MYSTICAL BALANCE",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "MYSTICAL BALANCE Whenever one of your other\\nAmethyst characters is banished in a challenge,\\nyou may draw a card."
                ],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amethyst'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Magica De Spell - Spiteful Sorceress', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 2241,
                name: 'Magica De Spell',
                fullName: 'Magica De Spell - Spiteful Sorceress',
                abilities: [
                    {
                        "effect": "Whenever you put a card under one of your characters or locations, you may move 1 damage counter from chosen character to chosen opposing character.",
                        "fullText": "MYSTICAL MANIPULATION Whenever you put a\\ncard under one of your characters or locations,\\nyou may move 1 damage counter from chosen\\ncharacter to chosen opposing character.",
                        "name": "MYSTICAL MANIPULATION",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "MYSTICAL MANIPULATION Whenever you put a\\ncard under one of your characters or locations,\\nyou may move 1 damage counter from chosen\\ncharacter to chosen opposing character."
                ],
                cost: 5,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amethyst'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Cheshire Cat - Inexplicable', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 2249,
                name: 'Cheshire Cat',
                fullName: 'Cheshire Cat - Inexplicable',
                abilities: [
                    {
                        "fullText": "Boost 2 ⬡ (Once during your turn, you may pay 2 ⬡\\nto put the top card of your deck facedown under this\\ncharacter.)",
                        "keyword": "Boost",
                        "keywordValue": "2",
                        "keywordValueNumber": 2,
                        "reminderText": "Once during your turn, you may pay 2 ⬡ to put the top card of your deck facedown under this character.",
                        "type": "keyword"
                    },
                    {
                        "effect": "Whenever you put a card under this character, you may move up to 2 damage counters from chosen character to chosen opposing character.",
                        "fullText": "IT'S LOADS OF FUN Whenever you put a card under this\\ncharacter, you may move up to 2 damage counters from\\nchosen character to chosen opposing character.",
                        "name": "IT'S LOADS OF FUN",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "Boost 2 ⬡ (Once during your turn, you may pay 2 ⬡\\nto put the top card of your deck facedown under this\\ncharacter.)",
                    "IT'S LOADS OF FUN Whenever you put a card under this\\ncharacter, you may move up to 2 damage counters from\\nchosen character to chosen opposing character."
                ],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amethyst'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBeGreaterThanOrEqual(2);
        });
    });

});
