/**
 * Heal Effect Execution Tests
 * 
 * Tests that heal/remove damage effects parse correctly.
 * Uses real cards from allCards.json.
 */

import { SharedTestFixture } from '../../test-fixtures';

describe('Heal Effect Execution', () => {
    let fixture: SharedTestFixture;

    beforeAll(async () => {
        fixture = await SharedTestFixture.getInstance();
    });

    describe('Remove Damage Effects', () => {
        it('should parse "remove X damage" abilities', async () => {
            const allCards = fixture.getAllCards();

            const healCards = allCards.filter(card => {
                const abilities = fixture.parseAbilities(card);
                return abilities.some(a => {
                    const text = a.rawText?.toLowerCase() || '';
                    return text.includes('remove') && text.includes('damage');
                });
            });

            console.log(`\n✓ Found ${healCards.length} cards with remove damage effects`);
            if (healCards.length > 0) {
                console.log('  Examples:');
                healCards.slice(0, 5).forEach(card => {
                    const abilities = fixture.parseAbilities(card);
                    const healAbility = abilities.find(a =>
                        a.rawText?.toLowerCase().includes('remove') &&
                        a.rawText?.toLowerCase().includes('damage')
                    );
                    console.log(`    - ${card.fullName || card.name} (${card.type})`);
                    console.log(`      "${healAbility?.rawText}"`);
                });
            }

            expect(healCards.length).toBeGreaterThan(5);
        });
    });

    describe('Targeted Healing', () => {
        it('should parse healing with different targets', async () => {
            const allCards = fixture.getAllCards();

            const targetedHeal = allCards.filter(card => {
                const abilities = fixture.parseAbilities(card);
                return abilities.some(a => {
                    const text = a.rawText?.toLowerCase() || '';
                    return (text.includes('remove') && text.includes('damage')) &&
                        (text.includes('chosen') ||
                            text.includes('character') ||
                            text.includes('all'));
                });
            });

            console.log(`\n✓ Found ${targetedHeal.length} cards with targeted healing`);
            if (targetedHeal.length > 0) {
                console.log('  Examples:');
                targetedHeal.slice(0, 5).forEach(card => {
                    const abilities = fixture.parseAbilities(card);
                    const healAbility = abilities.find(a => {
                        const text = a.rawText?.toLowerCase() || '';
                        return text.includes('remove') && text.includes('damage');
                    });
                    console.log(`    - ${card.fullName || card.name}`);
                    console.log(`      Target: ${healAbility?.rawText}`);
                });
            }

            expect(targetedHeal.length).toBeGreaterThan(3);
        });
    });

    describe('Heal Amount Variations', () => {
        it('should parse different heal amounts', async () => {
            const allCards = fixture.getAllCards();

            const healAmounts: Record<string, number> = {
                '1 damage': 0,
                '2 damage': 0,
                '3+ damage': 0,
                'all damage': 0
            };

            allCards.forEach(card => {
                const abilities = fixture.parseAbilities(card);
                abilities.forEach(a => {
                    const text = a.rawText?.toLowerCase() || '';
                    if (text.includes('remove') && text.includes('damage')) {
                        if (text.includes('remove 1 damage')) healAmounts['1 damage']++;
                        else if (text.includes('remove 2 damage')) healAmounts['2 damage']++;
                        else if (text.match(/remove \d+/)) healAmounts['3+ damage']++;
                        else if (text.includes('remove all damage')) healAmounts['all damage']++;
                    }
                });
            });

            console.log(`\n✓ Heal Amount Distribution:`);
            Object.entries(healAmounts).forEach(([amount, count]) => {
                console.log(`  - Remove ${amount}: ${count} cards`);
            });

            const total = Object.values(healAmounts).reduce((a, b) => a + b, 0);
            expect(total).toBeGreaterThan(5);
        });
    });

    describe('Heal by Card Type', () => {
        it('should categorize heal effects by card type', async () => {
            const allCards = fixture.getAllCards();

            const healCards = allCards.filter(card => {
                const abilities = fixture.parseAbilities(card);
                return abilities.some(a => {
                    const text = a.rawText?.toLowerCase() || '';
                    return text.includes('remove') && text.includes('damage');
                });
            });

            const actions = healCards.filter(c => c.type === 'Action');
            const characters = healCards.filter(c => c.type === 'Character');
            const songs = healCards.filter(c => c.type && c.type.toString().toLowerCase() === 'song');
            const items = healCards.filter(c => c.type && c.type.toString().toLowerCase() === 'item');

            console.log(`\n✓ Heal Effect Categories:`);
            console.log(`  - Total: ${healCards.length}`);
            console.log(`  - Actions: ${actions.length}`);
            console.log(`  - Characters: ${characters.length}`);
            console.log(`  - Songs: ${songs.length}`);
            console.log(`  - Items: ${items.length}`);

            expect(healCards.length).toBeGreaterThan(5);
        });
    });

    describe('Execution Tests', () => {
        let harness: any;

        beforeEach(async () => {
            const { TestHarness } = await import('../../engine-test-utils');
            harness = new TestHarness();
            await harness.initialize();
        });

        it('should remove damage from character', async () => {
            await harness.initGame(['Healing Glow'], []);
            const p1 = harness.game.getPlayer(harness.p1Id);

            // Setup: Character with damage
            harness.setPlay(harness.p1Id, ['Mickey Mouse - Brave Little Tailor'], true); // exerted
            const character = p1.play[0];
            character.damage = 3;

            harness.setInk(harness.p1Id, 2);

            // Play Healing Glow targeting Mickey
            // "Remove up to 2 damage from chosen character."
            const healingGlow = p1.hand[0];
            await harness.playCard(p1, healingGlow, character);

            // Verify: Damage reduced by 2
            expect(character.damage).toBe(1);
        });

        it('should not remove more damage than exists', async () => {
            await harness.initGame(['Healing Glow'], []);
            const p1 = harness.game.getPlayer(harness.p1Id);

            // Setup: Character with 1 damage
            harness.setPlay(harness.p1Id, ['Stitch - New Dog'], true);
            const character = p1.play[0];
            character.damage = 1;

            harness.setInk(harness.p1Id, 2);

            // Play Healing Glow (removes up to 2)
            const healingGlow = p1.hand[0];
            await harness.playCard(p1, healingGlow, character);

            // Verify: Damage is 0, not negative
            expect(character.damage).toBe(0);
        });

        it('should heal multiple characters with "each of your characters"', async () => {
            await harness.initGame(['Hakuna Matata'], []);
            const p1 = harness.game.getPlayer(harness.p1Id);

            // Setup: Multiple characters with damage
            harness.setPlay(harness.p1Id, ['Mickey Mouse - Brave Little Tailor', 'Stitch - Rock Star'], true);
            const mickey = p1.play[0];
            const stitch = p1.play[1];

            mickey.damage = 5;
            stitch.damage = 2;

            harness.setInk(harness.p1Id, 5);

            // Play Hakuna Matata
            // "Remove up to 3 damage from each of your characters."
            const hakunaMatata = p1.hand[0];
            await harness.playCard(p1, hakunaMatata);

            // Verify
            // Mickey: 5 - 3 = 2
            expect(mickey.damage).toBe(2);
            // Stitch: 2 - 3 => 0
            expect(stitch.damage).toBe(0);
        });
    });
});
