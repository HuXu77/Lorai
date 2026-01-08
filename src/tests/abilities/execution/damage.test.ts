// @skip-test: Deep issues - needs significant refactoring

/**
 * Damage Ability Execution Tests
 * 
 * Tests that damage effects actually work in gameplay.
 * Uses real cards from allCards.json and real game execution.
 */

import { SharedTestFixture } from '../../test-fixtures';
import { GameEvent } from '../../../engine/abilities/events';

describe('Damage Ability Execution', () => {
    let fixture: SharedTestFixture;

    beforeAll(async () => {
        fixture = await SharedTestFixture.getInstance();

    });

    describe('Direct Damage - Actions', () => {
        it('should parse Fire the Cannons damage ability', async () => {
            // Fire the Cannons - Action
            // "Deal 2 damage to chosen character."
            const fireTheCannons = fixture.getAllCards().find(c =>
                c.name === 'Fire the Cannons!'
            );

            expect(fireTheCannons).toBeDefined();
            console.log('CARD STRUCTURE:', JSON.stringify(fireTheCannons, null, 2));
            expect(fireTheCannons?.type).toBe('Action');

            const abilities = fixture.parseAbilities(fireTheCannons!);
            expect(abilities.length).toBeGreaterThan(0);

            // Find damage effect
            const damageEffect = abilities.find(a =>
                a.effects?.some((e: any) => e.type === 'damage')
            );

            expect(damageEffect).toBeDefined();

            // Verify damage amount
            const effect = damageEffect?.effects?.find((e: any) => e.type === 'damage');
            expect(effect).toBeDefined();
            expect((effect as any).amount).toBe(2);

            console.log('✓ Fire the Cannons parsed correctly');
            console.log(`  - Damage: ${(effect as any).amount}`);
        });

        it('should parse Cut to the Chase (grants Rush)', async () => {
            // Cut to the Chase - Action
            // "Chosen character gains Rush this turn."
            const cutToTheChase = fixture.getAllCards().find(c =>
                c.name === 'Cut to the Chase'
            );

            expect(cutToTheChase).toBeDefined();
            expect(cutToTheChase?.type).toBe('Action');

            const abilities = fixture.parseAbilities(cutToTheChase!);
            expect(abilities.length).toBeGreaterThan(0);

            // Should have grant_keyword effect for Rush
            const grantEffect = abilities.find(a =>
                a.effects?.some((e: any) =>
                    e.type === 'grant_keyword' && e.keyword?.toLowerCase() === 'rush'
                )
            );

            expect(grantEffect).toBeDefined();

            console.log('✓ Cut to the Chase parsed correctly');
            console.log(`  - Grants Rush to chosen character`);
        });
    });

    describe('Triggered Damage - Character Abilities', () => {
        it('should parse character damage triggers', async () => {
            // Find characters that deal damage when played or on trigger
            const allCards = fixture.getAllCards();

            const damageCharacters = allCards.filter(card => {
                if (card.type !== 'Character') return false;

                const abilities = fixture.parseAbilities(card);
                return abilities.some(a =>
                    a.type === 'triggered' &&
                    a.effects?.some((e: any) => e.type === 'damage')
                );
            });

            console.log(`\n✓ Found ${damageCharacters.length} characters with damage triggers`);
            if (damageCharacters.length > 0) {
                console.log('  Examples:');
                damageCharacters.slice(0, 3).forEach(card => {
                    console.log(`    - ${card.fullName || card.name}`);
                });
            }

            expect(damageCharacters.length).toBeGreaterThan(0);
        });
    });

    describe('Real Card Survey', () => {
        it('should find and categorize all damage cards', async () => {
            const allCards = fixture.getAllCards();

            const damageCards = allCards.filter(card => {
                const abilities = fixture.parseAbilities(card);
                return abilities.some(a =>
                    a.effects?.some((e: any) => e.type === 'damage')
                );
            });

            // Categorize by type
            const actions = damageCards.filter(c => c.type === 'Action');
            const characters = damageCards.filter(c => c.type === 'Character');
            const songs = damageCards.filter(c => c.type && c.type.toString().toLowerCase() === 'song');

            console.log(`\n✓ Damage Card Survey:`);
            console.log(`  - Total: ${damageCards.length}`);
            console.log(`  - Actions: ${actions.length}`);
            console.log(`  - Characters: ${characters.length}`);
            console.log(`  - Songs: ${songs.length}`);

            expect(damageCards.length).toBeGreaterThan(10);
        });
    });

    describe('Execution Tests', () => {
        let harness: any;

        beforeEach(async () => {
            const { TestHarness } = await import('../../engine-test-utils');
            harness = new TestHarness();
            await harness.initialize();
        });

        it('should deal 2 damage to character when Fire the Cannons played', async () => {
            await harness.initGame(['Fire the Cannons'], []);

            const p1 = harness.game.getPlayer(harness.p1Id);
            const p2 = harness.game.getPlayer(harness.p2Id);

            // Put weak target character in play for P2  
            harness.setPlay(harness.p2Id, ['Mickey Mouse - Brave Little Tailor'], false);
            const target = p2.play[0];
            const initialDamage = target.damage || 0;

            // Give P1 enough ink
            harness.setInk(harness.p1Id, 3);

            const fireTheCannons = p1.hand[0];
            await harness.playCard(p1, fireTheCannons, target);

            // Verify damage was dealt
            expect(target.damage).toBe(initialDamage + 2);
        });

        it('should banish character if damage >= willpower', async () => {
            await harness.initGame(['Fire the Cannons'], []);

            const p1 = harness.game.getPlayer(harness.p1Id);
            const p2 = harness.game.getPlayer(harness.p2Id);

            // Put weak character (2 willpower, Fire the Cannons deals 2)
            harness.setPlay(harness.p2Id, ['Stitch - New Dog'], false);
            const targetName = p2.play[0].name;

            harness.setInk(harness.p1Id, 3);

            const fireTheCannons = p1.hand[0];
            await harness.playCard(p1, fireTheCannons, p2.play[0]);

            // Character should be banished (moved to discard)
            expect(p2.play.length).toBe(0);
            expect(p2.discard.some((c: any) => c.name.includes('Stitch'))).toBe(true);
        });

        it('should accumulate damage across multiple effects', async () => {
            await harness.initGame(['Fire the Cannons', 'Fire the Cannons'], []);

            const p1 = harness.game.getPlayer(harness.p1Id);
            const p2 = harness.game.getPlayer(harness.p2Id);

            // Put strong character (4 willpower)
            harness.setPlay(harness.p2Id, ['Donald Duck - Boisterous Fowl'], false);
            const target = p2.play[0];

            harness.setInk(harness.p1Id, 6);

            // Deal 2 damage
            const firstCannons = p1.hand[0];
            await harness.playCard(p1, firstCannons, target);
            expect(target.damage).toBe(2);
            expect(p2.play.length).toBe(1); // Still alive

            // Deal another 2 damage (total 4)
            const secondCannons = p1.hand[0];
            await harness.playCard(p1, secondCannons, target);

            // Should be banished now
            expect(p2.play.length).toBe(0);
        });
    });
});
