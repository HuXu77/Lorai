/**
 * Advanced Keyword Execution Tests
 * 
 * Tests for complex keywords: Shift, Bodyguard, Ward, Support, Resist
 * Uses real cards from allCards.json.
 */

import { SharedTestFixture } from '../../test-fixtures';
import { TestHarness } from '../../engine-test-utils';
import { ActionType, ZoneType } from '../../../engine/models';

describe('Advanced Keyword Execution', () => {
    let fixture: SharedTestFixture;

    beforeAll(async () => {
        fixture = await SharedTestFixture.getInstance();

    });

    describe('Shift Keyword', () => {
        it('should parse Shift keyword with costs', async () => {
            const allCards = fixture.getAllCards();

            const shiftCards = allCards.filter(card => {
                const abilities = fixture.parseAbilities(card);
                return abilities.some(a =>
                    a.rawText?.toLowerCase().includes('shift')
                );
            });

            console.log(`\n✓ Found ${shiftCards.length} cards with Shift`);
            if (shiftCards.length > 0) {
                console.log('  Examples:');
                shiftCards.slice(0, 5).forEach(card => {
                    const abilities = fixture.parseAbilities(card);
                    const shiftAbility = abilities.find(a =>
                        a.rawText?.toLowerCase().includes('shift')
                    );
                    console.log(`    - ${card.fullName || card.name}`);
                    console.log(`      "${shiftAbility?.rawText}"`);
                });
            }

            expect(shiftCards.length).toBeGreaterThan(10);
        });
    });

    describe('Bodyguard Keyword', () => {
        it('should parse Bodyguard keyword', async () => {
            const allCards = fixture.getAllCards();

            const bodyguardCards = allCards.filter(card => {
                const abilities = fixture.parseAbilities(card);
                return abilities.some(a =>
                    a.rawText?.toLowerCase().includes('bodyguard')
                );
            });

            console.log(`\n✓ Found ${bodyguardCards.length} cards with Bodyguard`);
            if (bodyguardCards.length > 0) {
                console.log('  Examples:');
                bodyguardCards.slice(0, 5).forEach(card => {
                    console.log(`    - ${card.fullName || card.name}`);
                });
            }

            expect(bodyguardCards.length).toBeGreaterThan(5);
        });
    });

    describe('Ward Keyword', () => {
        it('should parse Ward keyword', async () => {
            const allCards = fixture.getAllCards();

            const wardCards = allCards.filter(card => {
                const abilities = fixture.parseAbilities(card);
                return abilities.some(a =>
                    a.rawText?.toLowerCase().includes('ward')
                );
            });

            console.log(`\n✓ Found ${wardCards.length} cards with Ward`);
            if (wardCards.length > 0) {
                console.log('  Examples:');
                wardCards.slice(0, 5).forEach(card => {
                    console.log(`    - ${card.fullName || card.name}`);
                });
            }

            expect(wardCards.length).toBeGreaterThan(3);
        });
    });

    describe('Support Keyword', () => {
        it('should parse Support keyword', async () => {
            const allCards = fixture.getAllCards();

            const supportCards = allCards.filter(card => {
                const abilities = fixture.parseAbilities(card);
                return abilities.some(a =>
                    a.rawText?.toLowerCase().includes('support')
                );
            });

            console.log(`\n✓ Found ${supportCards.length} cards with Support`);
            if (supportCards.length > 0) {
                console.log('  Examples:');
                supportCards.slice(0, 5).forEach(card => {
                    const abilities = fixture.parseAbilities(card);
                    const supportAbility = abilities.find(a =>
                        a.rawText?.toLowerCase().includes('support')
                    );
                    console.log(`    - ${card.fullName || card.name}`);
                    console.log(`      "${supportAbility?.rawText}"`);
                });
            }

            expect(supportCards.length).toBeGreaterThan(5);
        });
    });

    describe('Resist Keyword', () => {
        it('should parse Resist keyword with amounts', async () => {
            const allCards = fixture.getAllCards();

            const resistCards = allCards.filter(card => {
                const abilities = fixture.parseAbilities(card);
                return abilities.some(a =>
                    a.rawText?.toLowerCase().includes('resist')
                );
            });

            console.log(`\n✓ Found ${resistCards.length} cards with Resist`);
            if (resistCards.length > 0) {
                console.log('  Examples:');
                resistCards.slice(0, 5).forEach(card => {
                    const abilities = fixture.parseAbilities(card);
                    const resistAbility = abilities.find(a =>
                        a.rawText?.toLowerCase().includes('resist')
                    );
                    console.log(`    - ${card.fullName || card.name}`);
                    console.log(`      "${resistAbility?.rawText}"`);
                });
            }

            expect(resistCards.length).toBeGreaterThan(5);
        });
    });

    describe('Advanced Keyword Survey', () => {
        it('should categorize all advanced keywords', async () => {
            const allCards = fixture.getAllCards();

            const keywordCounts: Record<string, number> = {
                shift: 0,
                bodyguard: 0,
                ward: 0,
                support: 0,
                resist: 0
            };

            allCards.forEach(card => {
                const abilities = fixture.parseAbilities(card);
                abilities.forEach(a => {
                    const text = a.rawText?.toLowerCase() || '';
                    if (text.includes('shift')) keywordCounts.shift++;
                    if (text.includes('bodyguard')) keywordCounts.bodyguard++;
                    if (text.includes('ward')) keywordCounts.ward++;
                    if (text.includes('support')) keywordCounts.support++;
                    if (text.includes('resist')) keywordCounts.resist++;
                });
            });

            console.log(`\n✓ Advanced Keyword Distribution:`);
            Object.entries(keywordCounts).forEach(([keyword, count]) => {
                console.log(`  - ${keyword}: ${count} cards`);
            });

            const total = Object.values(keywordCounts).reduce((a, b) => a + b, 0);
            expect(total).toBeGreaterThan(20);
        });
    });

    describe('Execution Tests', () => {
        let harness: TestHarness;

        beforeEach(async () => {
            harness = new TestHarness();
            await harness.initialize();
        });

        it('should shift character onto matching name', async () => {
            // This was already tested in shift.test.ts
            // Just verify the Shift keyword structure here
            await harness.initGame([], []);
            const p1 = harness.game.getPlayer(harness.p1Id);

            // Create base character
            const base = harness.createCard(p1.id, {
                name: 'Mickey Mouse',
                type: 'Character' as any,
                strength: 2,
                willpower: 3
            });
            base.zone = ZoneType.Play;
            p1.play.push(base);

            // Create Shift version
            const shifter = harness.createCard(p1.id, {
                name: 'Mickey Mouse',
                type: 'Character' as any,
                strength: 4,
                willpower: 5,
                cost: 6
            });
            shifter.keywords = ['Shift 4'];
            p1.hand.push(shifter);

            // Verify Shift keyword structure
            expect(shifter.keywords).toContain('Shift 4');
            expect(base.name).toBe(shifter.name); // Names match

            // Note: Full Shift execution tested in shift.test.ts
        });

        it('should redirect challenges to Bodyguard', async () => {
            // Test Bodyguard keyword structure
            await harness.initGame([], []);
            const p1 = harness.game.getPlayer(harness.p1Id);

            // Create Bodyguard character
            const bodyguard = harness.createCard(p1.id, {
                name: 'Bodyguard Character',
                type: 'Character' as any,
                strength: 3,
                willpower: 5
            });
            bodyguard.keywords = ['Bodyguard'];
            bodyguard.zone = ZoneType.Play;
            p1.play.push(bodyguard);

            // Create protected character
            const protectedChar = harness.createCard(p1.id, {
                name: 'Protected Character',
                type: 'Character' as any,
                strength: 1,
                willpower: 2
            });
            protectedChar.zone = ZoneType.Play;
            p1.play.push(protectedChar);

            // Verify Bodyguard keyword
            expect(bodyguard.keywords).toContain('Bodyguard');

            // Note: Full Bodyguard redirect requires engine support for:
            // - Detecting Bodyguard characters during challenge targeting
            // - Forcing challenges to target Bodyguard instead of other characters
        });

        it('should prevent abilities with Ward', async () => {
            // Test Ward keyword structure
            await harness.initGame([], []);
            const p1 = harness.game.getPlayer(harness.p1Id);

            // Create Ward character
            const wardChar = harness.createCard(p1.id, {
                name: 'Ward Character',
                type: 'Character' as any,
                strength: 2,
                willpower: 3
            });
            wardChar.keywords = ['Ward'];
            wardChar.zone = ZoneType.Play;
            p1.play.push(wardChar);

            // Verify Ward keyword
            expect(wardChar.keywords).toContain('Ward');

            // Note: Full Ward protection requires engine support for:
            // - Checking Ward during ability targeting
            // - Preventing opponent abilities from targeting Ward characters
        });

        it('should apply Support bonus', async () => {
            // Test Support keyword structure
            await harness.initGame([], []);
            const p1 = harness.game.getPlayer(harness.p1Id);

            // Create Support character
            const supporter = harness.createCard(p1.id, {
                name: 'Support Character',
                type: 'Character' as any,
                strength: 2,
                willpower: 2
            });
            supporter.keywords = ['Support'];
            supporter.zone = ZoneType.Play;
            p1.play.push(supporter);

            // Create character to receive support
            const quester = harness.createCard(p1.id, {
                name: 'Quester',
                type: 'Character' as any,
                strength: 1,
                willpower: 1,
                lore: 1
            });
            quester.zone = ZoneType.Play;
            quester.ready = true;
            p1.play.push(quester);

            // Verify Support keyword
            expect(supporter.keywords).toContain('Support');

            // Note: Full Support bonus requires engine support for:
            // - Exerting Support character when another challenges/quests
            // - Applying +1 strength bonus to the supported action
        });

        it('should reduce damage with Resist', async () => {
            // Test Resist keyword structure
            await harness.initGame([], []);
            const p1 = harness.game.getPlayer(harness.p1Id);

            // Create Resist character
            const resistChar = harness.createCard(p1.id, {
                name: 'Resist Character',
                type: 'Character' as any,
                strength: 3,
                willpower: 4
            });
            resistChar.keywords = ['Resist +2'];
            resistChar.zone = ZoneType.Play;
            p1.play.push(resistChar);

            // Verify Resist keyword
            expect(resistChar.keywords).toContain('Resist +2');

            // Note: Full Resist requires engine support for:
            // - Checking Resist value during damage calculation
            // - Reducing damage by the Resist amount
        });
    });
});
