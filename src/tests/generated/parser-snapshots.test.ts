/**
 * Parser Snapshot Tests
 * 
 * Generates snapshots of parsed abilities for every card.
 * If parsing changes unexpectedly, tests fail.
 */

import { CardLoader } from '../../engine/card-loader';
import { parseToAbilityDefinition } from '../../engine/ability-parser';

describe('Parser Coverage Summary', () => {
    let cardLoader: CardLoader;
    let allCards: any[];

    beforeAll(async () => {
        cardLoader = new CardLoader();
        await cardLoader.loadCards();
        allCards = cardLoader.getAllCards();
    });

    it('should list all cards that fail to parse', () => {
        const failures: { name: string; abilities: string[] }[] = [];
        const successes: { name: string; count: number }[] = [];

        allCards.forEach(card => {
            if (!card.abilities || card.abilities.length === 0) return;

            const parsed = parseToAbilityDefinition(card);

            if (parsed.length === 0) {
                failures.push({
                    name: card.fullName || card.name,
                    abilities: card.abilities.map((a: any) => a.fullText || a.effect || '')
                });
            } else {
                successes.push({
                    name: card.fullName || card.name,
                    count: parsed.length
                });
            }
        });

        // Report
        const total = successes.length + failures.length;
        const rate = ((successes.length / total) * 100).toFixed(1);

        console.log('\n===========================================');
        console.log('PARSER COVERAGE SUMMARY');
        console.log('===========================================\n');
        console.log(`Total cards with abilities: ${total}`);
        console.log(`Successfully parsed: ${successes.length} (${rate}%)`);
        console.log(`Failed to parse: ${failures.length}\n`);

        if (failures.length > 0) {
            console.log('FAILED CARDS:');
            failures.slice(0, 20).forEach(f => {
                console.log(`  ✗ ${f.name}`);
                f.abilities.slice(0, 2).forEach(a => {
                    console.log(`      "${a.substring(0, 60)}..."`);
                });
            });
            if (failures.length > 20) {
                console.log(`  ... and ${failures.length - 20} more`);
            }
        }

        console.log('\n===========================================\n');

        // Export failures to JSON for tracking
        const fs = require('fs');
        fs.writeFileSync(
            'parser-failures.json',
            JSON.stringify(failures, null, 2)
        );
        console.log('Full failure list written to parser-failures.json');

        // Assertions
        expect(parseFloat(rate)).toBeGreaterThan(70);
    });

    it('should generate parser snapshots for sample cards', () => {
        // Get 10 cards of each type with abilities
        const sampleCards: any[] = [];
        const types = ['Character', 'Action', 'Item', 'Location'];

        types.forEach(type => {
            const cardsOfType = allCards
                .filter(c => c.type === type && c.abilities && c.abilities.length > 0)
                .slice(0, 10);
            sampleCards.push(...cardsOfType);
        });

        const snapshots: Record<string, any> = {};

        sampleCards.forEach(card => {
            const key = `${card.fullName || card.name} [${card.type}]`;
            const parsed = parseToAbilityDefinition(card);
            snapshots[key] = {
                abilityCount: parsed.length,
                types: parsed.map((p: any) => p.type),
                firstEffect: parsed[0]?.effects?.[0]?.type || parsed[0]?.action || 'N/A'
            };
        });

        expect(snapshots).toMatchSnapshot();
    });
});

describe('Card Smoke Tests', () => {
    let cardLoader: CardLoader;
    let allCards: any[];

    beforeAll(async () => {
        cardLoader = new CardLoader();
        await cardLoader.loadCards();
        allCards = cardLoader.getAllCards();
    });

    it('should successfully parse all Character cards without throwing', () => {
        const characters = allCards.filter(c => c.type === 'Character');
        const errors: string[] = [];

        characters.forEach(card => {
            try {
                parseToAbilityDefinition(card);
            } catch (e: any) {
                errors.push(`${card.fullName}: ${e.message}`);
            }
        });

        if (errors.length > 0) {
            console.log('Parse Errors:');
            errors.forEach(e => console.log(`  ✗ ${e}`));
        }

        expect(errors.length).toBe(0);
    });

    it('should successfully parse all Action cards without throwing', () => {
        const actions = allCards.filter(c => c.type === 'Action');
        const errors: string[] = [];

        actions.forEach(card => {
            try {
                parseToAbilityDefinition(card);
            } catch (e: any) {
                errors.push(`${card.fullName}: ${e.message}`);
            }
        });

        expect(errors.length).toBe(0);
    });

    it('should successfully parse all Item cards without throwing', () => {
        const items = allCards.filter(c => c.type === 'Item');
        const errors: string[] = [];

        items.forEach(card => {
            try {
                parseToAbilityDefinition(card);
            } catch (e: any) {
                errors.push(`${card.fullName}: ${e.message}`);
            }
        });

        expect(errors.length).toBe(0);
    });

    it('should successfully parse all Location cards without throwing', () => {
        const locations = allCards.filter(c => c.type === 'Location');
        const errors: string[] = [];

        locations.forEach(card => {
            try {
                parseToAbilityDefinition(card);
            } catch (e: any) {
                errors.push(`${card.fullName}: ${e.message}`);
            }
        });

        expect(errors.length).toBe(0);
    });
});
