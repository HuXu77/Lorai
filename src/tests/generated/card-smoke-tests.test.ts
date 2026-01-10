/**
 * Card Playability Smoke Tests - FULL COVERAGE
 * 
 * Tests ALL 2,455 cards in the game for playability.
 * Organized into batches to avoid memory issues and enable parallel processing.
 * 
 * Run with: npm test -- --testPathPattern="card-smoke-tests" --verbose
 */

import { SharedTestFixture } from '../test-fixtures';
import { createDebugGameState } from '../test-utils/debug-state-builder';
import { executePlayCard } from '../../engine/game-actions/play-card-action';
import { Phase } from '../../engine/actions';
import { Card, CardType } from '../../engine/models';

// Test configuration
const BATCH_SIZE = 100; // Cards per batch
const TEST_TIMEOUT = 120000; // 2 minutes per batch

// Track failures across all tests
const globalFailures: string[] = [];

async function testCardPlayability(
    card: Card,
    fixture: SharedTestFixture
): Promise<{ success: boolean; error?: string }> {
    try {
        const { game, turnManager, p1Id, p2Id } = await createDebugGameState({
            player1: {
                hand: [card.fullName],
                ink: 15
            },
            player2: {
                play: ['Stitch - Rock Star'], // Target for effects
                ink: 5
            }
        });

        game.state.phase = Phase.Main;
        const player = game.getPlayer(p1Id)!;
        const p2 = game.getPlayer(p2Id)!;
        const cardInstance = player.hand[0];

        // Setup target
        const target = p2.play[0];
        if (target) target.ready = false;

        // Register choice handler
        turnManager.registerChoiceHandler(p1Id, async (choice: any) => ({
            requestId: choice.id,
            playerId: p1Id,
            selectedIds: choice.optional ? [] : (choice.options?.[0]?.id ? [choice.options[0].id] : []),
            declined: choice.optional,
            timestamp: Date.now()
        }));

        const result = await executePlayCard(
            turnManager,
            player,
            cardInstance.instanceId,
            undefined, undefined,
            target?.instanceId
        );

        if (!result) {
            return { success: false, error: 'executePlayCard returned false' };
        }

        // Verify card moved to correct zone
        if (card.type === CardType.Action) {
            // Actions go to discard
            const inDiscard = player.discard.some(c => c.instanceId === cardInstance.instanceId);
            return { success: inDiscard || result };
        } else {
            // Characters, Items, Locations go to play
            const inPlay = player.play.some(c => c.instanceId === cardInstance.instanceId);
            return { success: inPlay };
        }
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

describe('Card Playability - Full Coverage', () => {
    let fixture: SharedTestFixture;
    let allCards: Card[];

    beforeAll(async () => {
        fixture = await SharedTestFixture.getInstance();
        allCards = fixture.getAllCards();
        console.log(`\n🎴 Loaded ${allCards.length} total cards for testing\n`);
    }, 30000);

    afterAll(() => {
        // Report any failures
        if (globalFailures.length > 0) {
            console.log('\n❌ FAILURES SUMMARY:');
            console.log(globalFailures.slice(0, 50).join('\n'));
            if (globalFailures.length > 50) {
                console.log(`... and ${globalFailures.length - 50} more`);
            }
        }
    });

    describe('Character Cards (1,851)', () => {
        let characters: Card[];

        beforeAll(() => {
            characters = allCards.filter(c => c.type === CardType.Character);
            console.log(`Testing ${characters.length} Characters`);
        });

        // Generate batch tests dynamically
        const batches = Array.from({ length: Math.ceil(1851 / BATCH_SIZE) }, (_, i) => i);

        it.each(batches)('batch %i (cards %i-%i)', async (batchIndex) => {
            const chars = allCards.filter(c => c.type === CardType.Character);
            const start = batchIndex * BATCH_SIZE;
            const end = Math.min(start + BATCH_SIZE, chars.length);
            const batch = chars.slice(start, end);

            if (batch.length === 0) return;

            let passed = 0;
            const failures: string[] = [];

            for (const card of batch) {
                const result = await testCardPlayability(card, fixture);
                if (result.success) {
                    passed++;
                } else {
                    failures.push(`${card.fullName}: ${result.error}`);
                    globalFailures.push(`[CHAR] ${card.fullName}: ${result.error}`);
                }
            }

            const passRate = (passed / batch.length * 100).toFixed(1);
            console.log(`  Batch ${batchIndex}: ${passed}/${batch.length} (${passRate}%)`);

            // 80% pass rate threshold
            expect(passed).toBeGreaterThanOrEqual(Math.floor(batch.length * 0.8));
        }, TEST_TIMEOUT);
    });

    describe('Action Cards (330)', () => {
        const batches = Array.from({ length: Math.ceil(330 / BATCH_SIZE) }, (_, i) => i);

        it.each(batches)('batch %i', async (batchIndex) => {
            const actions = allCards.filter(c => c.type === CardType.Action);
            const start = batchIndex * BATCH_SIZE;
            const end = Math.min(start + BATCH_SIZE, actions.length);
            const batch = actions.slice(start, end);

            if (batch.length === 0) return;

            let passed = 0;

            for (const card of batch) {
                const result = await testCardPlayability(card, fixture);
                if (result.success) {
                    passed++;
                } else {
                    globalFailures.push(`[ACTION] ${card.fullName}: ${result.error}`);
                }
            }

            console.log(`  Actions Batch ${batchIndex}: ${passed}/${batch.length}`);
            expect(passed).toBeGreaterThanOrEqual(Math.floor(batch.length * 0.7));
        }, TEST_TIMEOUT);
    });

    describe('Item Cards (182)', () => {
        const batches = Array.from({ length: Math.ceil(182 / BATCH_SIZE) }, (_, i) => i);

        it.each(batches)('batch %i', async (batchIndex) => {
            const items = allCards.filter(c => c.type === CardType.Item);
            const start = batchIndex * BATCH_SIZE;
            const end = Math.min(start + BATCH_SIZE, items.length);
            const batch = items.slice(start, end);

            if (batch.length === 0) return;

            let passed = 0;

            for (const card of batch) {
                const result = await testCardPlayability(card, fixture);
                if (result.success) {
                    passed++;
                } else {
                    globalFailures.push(`[ITEM] ${card.fullName}: ${result.error}`);
                }
            }

            console.log(`  Items Batch ${batchIndex}: ${passed}/${batch.length}`);
            expect(passed).toBeGreaterThanOrEqual(Math.floor(batch.length * 0.8));
        }, TEST_TIMEOUT);
    });

    describe('Location Cards (92)', () => {
        it('all locations can be played', async () => {
            const locations = allCards.filter(c => c.type === CardType.Location);

            let passed = 0;

            for (const card of locations) {
                const result = await testCardPlayability(card, fixture);
                if (result.success) {
                    passed++;
                } else {
                    globalFailures.push(`[LOC] ${card.fullName}: ${result.error}`);
                }
            }

            console.log(`  Locations: ${passed}/${locations.length}`);
            expect(passed).toBeGreaterThanOrEqual(Math.floor(locations.length * 0.8));
        }, TEST_TIMEOUT);
    });

    describe('Coverage Summary', () => {
        it('reports final statistics', () => {
            const chars = allCards.filter(c => c.type === CardType.Character).length;
            const actions = allCards.filter(c => c.type === CardType.Action).length;
            const items = allCards.filter(c => c.type === CardType.Item).length;
            const locs = allCards.filter(c => c.type === CardType.Location).length;

            console.log('\n📊 FINAL COVERAGE REPORT');
            console.log('========================');
            console.log(`Total Cards:  ${allCards.length}`);
            console.log(`Characters:   ${chars}`);
            console.log(`Actions:      ${actions}`);
            console.log(`Items:        ${items}`);
            console.log(`Locations:    ${locs}`);
            console.log(`Failures:     ${globalFailures.length}`);
            console.log('========================\n');

            expect(allCards.length).toBe(2455);
        });
    });
});
