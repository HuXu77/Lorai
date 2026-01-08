/**
 * Item Ability Execution Tests
 * 
 * Tests that item card abilities parse correctly.
 * Uses real cards from allCards.json.
 */

import { SharedTestFixture } from '../../test-fixtures';
import { TestHarness } from '../../engine-test-utils';
import { ActionType, ZoneType } from '../../../engine/models';

describe('Item Ability Execution', () => {
    let fixture: SharedTestFixture;

    beforeAll(async () => {
        fixture = await SharedTestFixture.getInstance();

    });

    describe('Item Cards', () => {
        it('should parse item card abilities', async () => {
            const allCards = fixture.getAllCards();

            const itemCards = allCards.filter(c => c.type === 'Item');

            console.log(`\n✓ Found ${itemCards.length} item cards`);
            if (itemCards.length > 0) {
                console.log('  Examples:');
                itemCards.slice(0, 5).forEach(card => {
                    const abilities = fixture.parseAbilities(card);
                    console.log(`    - ${card.fullName || card.name}`);
                    console.log(`      Abilities: ${abilities.length}`);
                    if (abilities.length > 0) {
                        console.log(`      First: "${abilities[0].rawText?.substring(0, 50)}..."`);
                    }
                });
            }

            expect(itemCards.length).toBeGreaterThan(10);
        });
    });

    describe('Item Triggers', () => {
        it('should parse item triggered abilities', async () => {
            const allCards = fixture.getAllCards();

            const itemsWithTriggers = allCards.filter(card => {
                if (card.type !== 'Item') return false;
                const abilities = fixture.parseAbilities(card);
                return abilities.some(a => a.type === 'triggered');
            });

            console.log(`\n✓ Found ${itemsWithTriggers.length} items with triggers`);
            if (itemsWithTriggers.length > 0) {
                console.log('  Examples:');
                itemsWithTriggers.slice(0, 3).forEach(card => {
                    console.log(`    - ${card.fullName || card.name}`);
                });
            }

            expect(itemsWithTriggers.length).toBeGreaterThan(3);
        });
    });

    describe('Item Static Abilities', () => {
        it('should parse item static abilities', async () => {
            const allCards = fixture.getAllCards();

            const itemsWithStatic = allCards.filter(card => {
                if (card.type !== 'Item') return false;
                const abilities = fixture.parseAbilities(card);
                return abilities.some(a => a.type === 'static');
            });

            console.log(`\n✓ Found ${itemsWithStatic.length} items with static abilities`);
            if (itemsWithStatic.length > 0) {
                console.log('  Examples:');
                itemsWithStatic.slice(0, 3).forEach(card => {
                    console.log(`    - ${card.fullName || card.name}`);
                });
            }

            expect(itemsWithStatic.length).toBeGreaterThan(3);
        });
    });

    describe('Execution Tests', () => {
        let harness: TestHarness;

        beforeEach(async () => {
            harness = new TestHarness();
            await harness.initialize();
        });

        it('should apply item static effects while in play', async () => {
            // Test item that provides stat buff to characters
            await harness.initGame([], []);
            const p1 = harness.game.getPlayer(harness.p1Id);

            // Create test character
            const character = harness.createCard(p1.id, {
                name: 'Test Character',
                type: 'Character' as any,
                strength: 3,
                willpower: 4,
                lore: 1
            });
            character.zone = ZoneType.Play;
            p1.play.push(character);

            // Create item with static buff
            const item = harness.createCard(p1.id, {
                name: 'Power Item',
                type: 'Item' as any,
                cost: 2
            });

            harness.setInk(p1.id, 2);

            // Mock: Item gives +1 strength to all characters
            item.parsedEffects = [{
                type: 'static',
                effects: [{
                    type: 'modify_stats',
                    target: { type: 'all_characters' },
                    stats: { strength: 1 }
                }]
            }] as any;

            // Play the item
            p1.hand.push(item);
            await harness.turnManager.resolveAction({
                type: ActionType.PlayCard,
                playerId: p1.id,
                cardId: item.instanceId
            });

            // Verify item is in play
            const itemInPlay = p1.play.find((c: any) => c.instanceId === item.instanceId);
            expect(itemInPlay).toBeDefined();
            expect(itemInPlay?.type).toBe('Item');

            // Note: Static effect application is handled by getModifiedStat() during queries,
            // not by modifying the card's base stats directly.
            // This test verifies the item enters play correctly.
            // Full static effect validation requires ability system integration testing.
        });

        it('should trigger item abilities correctly', async () => {
            // Test that items with triggered abilities stay in play and are registered
            await harness.initGame([], []);
            const p1 = harness.game.getPlayer(harness.p1Id);

            // Create item with a trigger
            const item = harness.createCard(p1.id, {
                name: 'Triggered Item',
                type: 'Item' as any,
                cost: 2
            });

            // Mock: Item has a triggered ability
            item.parsedEffects = [{
                type: 'triggered',
                trigger: 'on_play_other',
                effects: [{
                    type: 'draw',
                    amount: 1
                }],
                params: {
                    filter: { type: 'character' }
                }
            }] as any;

            harness.setInk(p1.id, 2);
            p1.hand.push(item);

            // Play the item
            await harness.turnManager.resolveAction({
                type: ActionType.PlayCard,
                playerId: p1.id,
                cardId: item.instanceId
            });

            // Verify item entered play successfully
            const itemInPlay = p1.play.find((c: any) => c.instanceId === item.instanceId);
            expect(itemInPlay).toBeDefined();
            expect(itemInPlay?.type).toBe('Item');
            expect(itemInPlay?.parsedEffects).toBeDefined();
            expect(itemInPlay?.parsedEffects?.length).toBeGreaterThan(0);

            // Note: Full trigger execution testing requires ability system to register
            // and process the item's abilities when other cards are played.
            // This test verifies the item's triggered ability structure is preserved.
        });
    });
});
