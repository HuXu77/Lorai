
import { parseToAbilityDefinition } from '../../../engine/ability-parser';

describe('Batch 3 - Characters Group 6 (Repro)', () => {

    describe('Aurora - Waking Beauty', () => {
        it('should parse damage removal trigger', () => {
            const card = {
                id: 1447,
                name: 'Aurora',
                fullName: 'Aurora - Waking Beauty',
                abilities: [
                    {
                        "effect": "Whenever you remove 1 or more damage from a character, ready this character. She can't quest or challenge for the rest of this turn.",
                        "fullText": "SWEET DREAMS Whenever you remove 1 or more\\ndamage from a character, ready this character. She\\ncan't quest or challenge for the rest of this turn.",
                        "name": "SWEET DREAMS",
                        "type": "triggered"
                    }
                ]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect(abilities[0].type).toBe('triggered');
            // TODO: Add more specific expectations
        });
    });

    describe('Maui - Soaring Demigod', () => {
        it('should parse named character quest trigger and loses keyword effect', () => {
            const card = {
                id: 549,
                name: 'Maui',
                fullName: 'Maui - Soaring Demigod',
                abilities: [
                    {
                        "effect": "Whenever a character of yours named HeiHei quests, this character gets +1 ◊ and loses Reckless this turn.",
                        "fullText": "IN MA BELLY Whenever a character of yours named\\nHeiHei quests, this character gets +1 ◊ and loses\\nReckless this turn.",
                        "name": "IN MA BELLY",
                        "type": "triggered"
                    }
                ]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect(abilities[0].type).toBe('triggered');
        });
    });

    describe('Moana - Born Leader', () => {
        it('should parse quest while at location trigger', () => {
            const card = {
                id: 552,
                name: 'Moana',
                fullName: 'Moana - Born Leader',
                abilities: [
                    {
                        "effect": "Whenever this character quests while at a location, ready all other characters here. They can't quest for the rest of this turn.",
                        "fullText": "WELCOME TO MY BOAT Whenever this character\\nquests while at a location, ready all other characters\\nhere. They can't quest for the rest of this turn.",
                        "name": "WELCOME TO MY BOAT",
                        "type": "triggered"
                    }
                ]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
        });
    });

    describe('Minnie Mouse - Dazzling Dancer', () => {
        it('should parse composite challenge trigger', () => {
            const card = {
                id: 1082,
                name: 'Minnie Mouse',
                fullName: 'Minnie Mouse - Dazzling Dancer',
                abilities: [
                    {
                        "effect": "Whenever this character or one of your characters named Mickey Mouse challenges another character, gain 1 lore.",
                        "fullText": "DANCE-OFF Whenever this character or one of\\nyour characters named Mickey Mouse challenges\\nanother character, gain 1 lore.",
                        "name": "DANCE-OFF",
                        "type": "triggered"
                    }
                ]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
        });
    });

    describe('Philoctetes - No-Nonsense Instructor', () => {
        it('should parse static keyword grant and hero play trigger', () => {
            const card = {
                id: 881,
                name: 'Philoctetes',
                fullName: 'Philoctetes - No-Nonsense Instructor',
                abilities: [
                    {
                        "effect": "Your Hero characters gain Challenger +1. (They get +1 ¤ while challenging.)",
                        "fullText": "YOU GOTTA STAY FOCUSED Your Hero characters\\ngain Challenger +1. (They get +1 ¤ while\\nchallenging.)",
                        "name": "YOU GOTTA STAY FOCUSED",
                        "type": "static"
                    },
                    {
                        "effect": "Whenever you play a Hero character, gain 1 lore.",
                        "fullText": "SHAMELESS PROMOTER Whenever you play a\\nHero character, gain 1 lore.",
                        "name": "SHAMELESS PROMOTER",
                        "type": "triggered"
                    }
                ]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            if (abilities.length !== 2) {
                console.log('Parsed Philoctetes abilities:', JSON.stringify(abilities, null, 2));
            }
            expect(abilities.length).toBe(2);
        });
    });

    describe('Vanellope von Schweetz - Sugar Rush Princess', () => {
        it('should parse princess play trigger', () => {
            const card = {
                id: 975,
                name: 'Vanellope von Schweetz',
                fullName: 'Vanellope von Schweetz - Sugar Rush Princess',
                abilities: [
                    {
                        "effect": "Whenever you play another Princess character, all opposing characters get -1 ¤ until the start of your next turn.",
                        "fullText": "I HEREBY DECREE Whenever you play another\\nPrincess character, all opposing characters get -1 ¤\\nuntil the start of your next turn.",
                        "name": "I HEREBY DECREE",
                        "type": "triggered"
                    }
                ]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
        });
    });

});
