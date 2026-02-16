# Testing Rules

## Test File Locations

| Test Type | Directory | Pattern |
|-----------|-----------|---------|
| Ability execution | `src/tests/abilities/` | `card-name.test.ts` |
| Parser patterns | `src/tests/parser/` | `batch-N-*.test.ts` |
| E2E modals | `src/tests/e2e/modals/` | `modal-type.spec.ts` |
| E2E features | `src/tests/e2e/` | `feature.spec.ts` |
| Mechanics | `src/tests/mechanics/[mechanic-name]/` | `mechanic.test.ts` AND `mechanic.spec.ts` |

## Mechanics Testing Strategy (Mandatory)
For any new mechanic (e.g., Singer, Bodyguard, Shift), you **MUST** create a dedicated directory in `src/tests/mechanics/`.
This directory must contain TWO test files:
1.  **Engine Test**: `[mechanic].test.ts` (Vitest) - Verifies the rules/math/state using `TestHarness`.
2.  **UI Test**: `[mechanic].spec.ts` (Playwright) - Verifies the user interaction/modals.

**Do NOT** split these into separate `abilities/` and `e2e/` folders. Keep them together.

## Bug Fixes & Regressions
- Create a reproduction test in `src/tests/bugs/` (e.g., `elsa-infinite-loop.test.ts`).
- Ensure the test fails BEFORE the fix and passes AFTER.
- Use `TestHarness` for engine bugs, Playwright for UI bugs.

## TestHarness Usage
Always use `TestHarness` from `src/tests/engine-test-utils.ts` for engine tests.
- `harness.setHand(playerId, ['Card Name'])`: Setup hand.
- `harness.setInkwell(playerId, ['Card'], true)`: Setup ink.
- `harness.turnManager`: Access engine actions.

## Unit Test Structure

```typescript
describe('Card Name Ability', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    test('should [expected behavior]', async () => {
        // 1. Setup
        harness.setHand(harness.p1Id, ['Card Name']);
        harness.setInkwell(harness.p1Id, ['Ink'], true);
        
        // 2. Execute
        const card = findInZone(harness.getPlayer1(), 'hand', 'Card Name');
        harness.turnManager.playCard(harness.p1Id, card.instanceId);
        
        // 3. Assert
        expect(harness.getPlayer1().lore).toBe(1);
    });
});
```

## E2E Test Structure

```typescript
test.describe('Feature Name', () => {
    test('should [expected behavior]', async ({ gamePage }) => {
        await gamePage.loadTestGame();
        
        await gamePage.injectState({
            player1: {
                hand: ['Card Name'],
                inkwell: ['Generic Ink', 'Generic Ink'],
                deck: ['Deck Card'],  // REQUIRED
                play: [{ name: 'Card', ready: true, turnPlayed: 0 }]
            },
            player2: { deck: ['Deck Card'] },  // REQUIRED
            turnPlayer: 'player1'
        });
        
        await gamePage.page.waitForTimeout(2000);
        
        // Test actions...
    });
});
```

## Critical Rules

1. **Always provide deck** - Empty deck causes immediate game loss
2. **Use `turnPlayed: 0`** - Cards can act immediately (no "drying")
3. **Wait for state** - Add `waitForTimeout(2000)` after `injectState`
4. **Use getByRole** - Most reliable selector pattern for buttons
5. **Verify card names** - Check `allCards.json` for exact names
