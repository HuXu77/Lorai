import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { GameEvent } from '../../engine/abilities/events';

describe('Fix Batch Locations 2', () => {

    describe('Deepwell Labyrinth - Mystifying Halls', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1927,
                name: 'Deepwell Labyrinth',
                fullName: 'Deepwell Labyrinth - Mystifying Halls',
                abilities: [
                    {
                        "effect": "Whenever a character challenges this location, each Illumineer chooses and discards a card.",
                        "fullText": "MAP THE MAZE Whenever a character challenges this location, each\\nIllumineer chooses and discards a card.",
                        "name": "MAP THE MAZE",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "MAP THE MAZE Whenever a character challenges this location, each\\nIllumineer chooses and discards a card."
                ],
                cost: 3,
                type: 'Location',
                inkwell: true,
                color: ''
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Clockwork Sawblades - Treacherous Trap', () => {
        it('should parse 2 abilities', () => {
            const card = {
                id: 1929,
                name: 'Clockwork Sawblades',
                fullName: 'Clockwork Sawblades - Treacherous Trap',
                abilities: [
                    {
                        "fullText": "Ward (Illumineers can't choose this location except to challenge.)",
                        "keyword": "Ward",
                        "reminderText": "Illumineers can't choose this location except to challenge.",
                        "type": "keyword"
                    },
                    {
                        "effect": "When Jafar plays this location, he deals 2 damage to each opposing character.",
                        "fullText": "NO ESCAPE When Jafar plays this location, he deals 2 damage to each\\nopposing character.",
                        "name": "NO ESCAPE",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "Ward (Illumineers can't choose this location except to challenge.)",
                    "NO ESCAPE When Jafar plays this location, he deals 2 damage to each\\nopposing character."
                ],
                cost: 6,
                type: 'Location',
                inkwell: true,
                color: ''
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('Snuggly Duckling - Disreputable Pub', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 826,
                name: 'Snuggly Duckling',
                fullName: 'Snuggly Duckling - Disreputable Pub',
                abilities: [
                    {
                        "effect": "Whenever a character with 3 ¤ or more challenges another character while here, gain 1 lore. If the challenging character has 6 ¤ or more, gain 3 lore instead.",
                        "fullText": "ROUTINE RUCKUS Whenever a character with 3 ¤ or more challenges\\nanother character while here, gain 1 lore. If the challenging character\\nhas 6 ¤ or more, gain 3 lore instead.",
                        "name": "ROUTINE RUCKUS",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "ROUTINE RUCKUS Whenever a character with 3 ¤ or more challenges\\nanother character while here, gain 1 lore. If the challenging character\\nhas 6 ¤ or more, gain 3 lore instead."
                ],
                cost: 2,
                type: 'Location',
                inkwell: true,
                color: 'Ruby'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Galactic Council Chamber - Courtroom', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1403,
                name: 'Galactic Council Chamber',
                fullName: 'Galactic Council Chamber - Courtroom',
                abilities: [
                    {
                        "effect": "While you have an Alien or Robot character here, this location can't be challenged.",
                        "fullText": "FEDERATION DECREE While you have an Alien or Robot character here,\\nthis location can't be challenged.",
                        "name": "FEDERATION DECREE",
                        "type": "static"
                    }
                ],
                fullTextSections: [
                    "FEDERATION DECREE While you have an Alien or Robot character here,\\nthis location can't be challenged."
                ],
                cost: 3,
                type: 'Location',
                inkwell: true,
                color: 'Steel'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Sugar Rush Speedway - Finish Line', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1234,
                name: 'Sugar Rush Speedway',
                fullName: 'Sugar Rush Speedway - Finish Line',
                abilities: [
                    {
                        "effect": "When you move a character here from a location, you may banish this location to gain 3 lore and draw 3 cards.",
                        "fullText": "BRING IT HOME, KID! When you move a character here from a location,\\nyou may banish this location to gain 3 lore and draw 3 cards.",
                        "name": "BRING IT HOME, KID!",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "BRING IT HOME, KID! When you move a character here from a location,\\nyou may banish this location to gain 3 lore and draw 3 cards."
                ],
                cost: 2,
                type: 'Location',
                inkwell: false,
                color: 'Amber'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Perilous Maze - Watery Labyrinth', () => {
        it('should parse 1 abilities', () => {
            const card = {
                id: 1300,
                name: 'Perilous Maze',
                fullName: 'Perilous Maze - Watery Labyrinth',
                abilities: [
                    {
                        "effect": "Whenever a character is challenged while here, each opponent chooses and discards a card.",
                        "fullText": "LOST IN THE WAVES Whenever a character is challenged while here, each\\nopponent chooses and discards a card.",
                        "name": "LOST IN THE WAVES",
                        "type": "triggered"
                    }
                ],
                fullTextSections: [
                    "LOST IN THE WAVES Whenever a character is challenged while here, each\\nopponent chooses and discards a card."
                ],
                cost: 3,
                type: 'Location',
                inkwell: true,
                color: 'Emerald'
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBeGreaterThanOrEqual(1);
        });
    });
});
