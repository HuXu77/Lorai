import { parseToAbilityDefinition } from '../../../engine/ability-parser';
import { CardType } from '../../../engine/models';

describe('Batch 3 Characters - Group 5 Repro', () => {

    describe('Hiro Hamada - Future Champion', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1523,
                name: 'Hiro Hamada',
                fullName: 'Hiro Hamada - Future Champion',
                abilities: [
                    {
                        "effect": "When you play a Floodborn character on this card, draw a card.",
                        "fullText": "ORIGIN STORY When you play a Floodborn\\ncharacter on this card, draw a card.",
                        "name": "ORIGIN STORY",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "ORIGIN STORY When you play a Floodborn\\ncharacter on this card, draw a card."
                ],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Emerald'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Mad Hatter - Unruly Eccentric', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1527,
                name: 'Mad Hatter',
                fullName: 'Mad Hatter - Unruly Eccentric',
                abilities: [
                    {
                        "effect": "Whenever a damaged character challenges another character, you may draw a card.",
                        "fullText": "UNBIRTHDAY PRESENT Whenever a damaged\\ncharacter challenges another character, you may\\ndraw a card.",
                        "name": "UNBIRTHDAY PRESENT",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "UNBIRTHDAY PRESENT Whenever a damaged\\ncharacter challenges another character, you may\\ndraw a card."
                ],
                cost: 6,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Emerald-Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Ratigan - Nefarious Criminal', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1576,
                name: 'Ratigan',
                fullName: 'Ratigan - Nefarious Criminal',
                abilities: [
                    {
                        "effect": "Whenever you play an action while this character is exerted, gain 1 lore.",
                        "fullText": "A MARVELOUS PERFORMANCE Whenever you play\\nan action while this character is exerted, gain 1 lore.",
                        "name": "A MARVELOUS PERFORMANCE",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "A MARVELOUS PERFORMANCE Whenever you play\\nan action while this character is exerted, gain 1 lore."
                ],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Pepper - Quick-Thinking Puppy', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1600,
                name: 'Pepper',
                fullName: 'Pepper - Quick-Thinking Puppy',
                abilities: [
                    {
                        "effect": "Whenever one of your Puppy characters is banished, you may put that card into your inkwell facedown and exerted.",
                        "fullText": "IN THE NICK OF TIME Whenever one of your Puppy\\ncharacters is banished, you may put that card into\\nyour inkwell facedown and exerted.",
                        "name": "IN THE NICK OF TIME",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "IN THE NICK OF TIME Whenever one of your Puppy\\ncharacters is banished, you may put that card into\\nyour inkwell facedown and exerted."
                ],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Sapphire'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Daisy Duck - Pirate Captain', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1280,
                name: 'Daisy Duck',
                fullName: 'Daisy Duck - Pirate Captain',
                abilities: [
                    {
                        "effect": "Whenever one of your Pirate characters quests while at a location, draw a card.",
                        "fullText": "DISTANT SHORES Whenever one of your Pirate\\ncharacters quests while at a location, draw a card.",
                        "name": "DISTANT SHORES",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "DISTANT SHORES Whenever one of your Pirate\\ncharacters quests while at a location, draw a card."
                ],
                cost: 4,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Emerald'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Mickey Mouse - True Friend', () => {
        it('should NOT parse any abilities (Vanilla)', () => {
            const card = {
                id: 2432,
                name: 'Mickey Mouse',
                fullName: 'Mickey Mouse - True Friend',
                abilities: [],
                fullTextSections: [
                    "As long as he's around, newcomers to the Great\\nIlluminary will always get a warm welcome."
                ],
                cost: 3,
                type: 'Character' as CardType,
                inkwell: true,
                color: 'Amber'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(0);
        });
    });

});
