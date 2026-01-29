---
description: How to write and debug E2E tests using Playwright
---

# E2E Test Writing Workflow

This workflow describes how to write reliable E2E tests for the Lorai game UI using Playwright.

// turbo-all

## Quick Reference

```bash
# Run E2E tests
npx playwright test                                          # All tests
npx playwright test src/tests/e2e/modals/                    # Directory
npx playwright test src/tests/e2e/modals/order-cards.spec.ts # Single file
npx playwright show-report                                   # HTML report
```

## Test File Template

```typescript
import { test, expect } from '../fixtures/game-fixture';

test.describe('Feature Name', () => {
    test('should do something', async ({ gamePage }) => {
        await gamePage.loadTestGame();

        // Setup game state
        await gamePage.injectState({
            player1: {
                hand: ['Card Name'],
                inkwell: ['Generic Ink', 'Generic Ink'],
                deck: ['Deck Card'],
                play: [{ name: 'Character', ready: true, turnPlayed: 0 }]
            },
            player2: {
                deck: ['Deck Card']
            },
            turnPlayer: 'player1'
        });

        await gamePage.page.waitForTimeout(2000); // State settle

        // Test actions...
    });
});
```

## Critical injectState Options

| Property | Description | Default |
|----------|-------------|---------|
| `hand` | Array of card names | `[]` |
| `deck` | Array of card names (prevents empty deck game-over) | Required |
| `inkwell` | Array of inkable card names | `[]` |
| `play` | Array of card configs (see below) | `[]` |
| `lore` | Player lore score | `0` |
| `turnPlayer` | `'player1'` or `'player2'` | Current |

### Card in Play Configuration
```typescript
{
    name: 'Card - Full Name',    // Required
    ready: true,                  // false = exerted
    turnPlayed: 0,                // 0 = not "drying", can act immediately
    damage: 0,                    // Damage on card
    exerted: false                // Explicit exert state
}
```

## Reliable UI Interaction Patterns

### ✅ DO: Use getByRole for Buttons
```typescript
const button = gamePage.page.getByRole('button', { name: /Play Card/i });
await expect(button).toBeVisible({ timeout: 10000 });
await button.click();
```

### ❌ DON'T: Use Scoped Modal Locators
```typescript
// This can fail if data-testid isn't applied correctly
const modal = await gamePage.expectModal();
await modal.locator('button').filter({ hasText: /Play/i }).click();
```

### ✅ DO: Wait for Confirmation
```typescript
const confirmBtn = gamePage.page.getByRole('button', { name: /Confirm/i });
await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
await confirmBtn.click();
```

### ✅ DO: Verify Modal Closed
```typescript
await expect(gamePage.page.getByText('Choose a card')).toBeHidden();
```

## Playing Cards from Hand

```typescript
// 1. Click card in hand
await gamePage.clickCardInHand('Card Name');

// 2. Wait for card detail modal
const detailModal = gamePage.page.locator('[role="dialog"]').filter({ hasText: 'Card Name' });
await expect(detailModal).toBeVisible({ timeout: 5000 });

// 3. Click Play Card button
await detailModal.getByRole('button', { name: /Play Card/i }).click();

// 4. Verify detail modal closes
await expect(detailModal).toBeHidden();
```

## Handling Choice Modals

```typescript
// Wait for choice modal
await expect(gamePage.page.getByText(/choose|target|select/i).first()).toBeVisible({ timeout: 10000 });

// Select an option (card)
const cardButton = gamePage.page.getByRole('button', { name: /Mickey Mouse/i });
await expect(cardButton).toBeVisible();
await cardButton.click();

// Confirm selection
const confirmBtn = gamePage.page.getByRole('button', { name: /Confirm/i });
await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
await confirmBtn.click();
```

## Debugging Failed Tests

### View Error Context
After test failure, check:
```
test-results/<test-name>/error-context.md  # Page snapshot (YAML)
test-results/<test-name>/test-failed-1.png # Screenshot
test-results/<test-name>/video.webm        # Recording
```

### Common Failure Patterns

| Symptom | Cause | Fix |
|---------|-------|-----|
| Button "disabled" | Card "drying" | Add `turnPlayed: 0` |
| Modal not visible | Missing ARIA role | Check component has `role="dialog"` |
| "No cards in hand" | Wrong card name | Verify in `allCards.json` |
| Timeout on confirm | Button not enabled | Select required option first |
| Card auto-resolved | No valid choices | Add targets to game state |
| Multi-select clicks ignored | CardSelectionChoice UI issue | Use simpler single-target tests |

## Card Name Verification

```bash
# Check if card exists
grep -i '"fullName":.*Mickey Mouse' allCards.json

# Get card details
grep -A 15 '"fullName": "Card Name"' allCards.json
```

## Writing Tests for Different Modal Types

### Target Character
Use cards like: `Dragon Fire`, `Smash`, `Be Prepared`

### Target Opposing Character
Use cards like: `The Queen - Commanding Presence` (quest trigger)

### Choose One
Use cards like: `Tug-of-War`, `Make the Potion`

### Scry / Order Cards
Use items like: `Ursula's Cauldron` (activated ability)

### Discard from Hand
Use cards like: `Eye of the Fates` (discard then draw)

---

## Modal Selector Reference

### Component Selectors

| Component | Selector | Purpose |
|-----------|----------|---------|
| Choice Modal Container | `[data-testid="choice-modal"]` | Main modal wrapper |
| Card Option Buttons | `[data-testid="choice-option"]` | Clickable card options |
| Card Detail Modal | `[role="dialog"]` | Card action menu popup |
| Card by Name | `getByRole('button', { name: /CardName/i })` | Select card (uses aria-label) |
| Confirm Button | `getByRole('button', { name: /Confirm/i })` | Confirm selection |
| Cancel Button | `getByRole('button', { name: /Cancel|No|Decline/i })` | Decline optional |

### Choice Type → UI Component Mapping

| Choice Type | Component | Notes |
|-------------|-----------|-------|
| `TARGET_CHARACTER` | `CardSelectionChoice` | Shows all valid characters |
| `TARGET_OPPOSING_CHARACTER` | `CardSelectionChoice` | Only opponent's characters |
| `TARGET_ITEM` | `CardSelectionChoice` | Items in play |
| `TARGET_LOCATION` | `CardSelectionChoice` | Locations in play |
| `DISCARD_FROM_HAND` | `CardSelectionChoice` | Cards from own hand |
| `TARGET_CARD_IN_DISCARD` | `CardSelectionChoice` | Cards in discard pile |
| `YES_NO` | `MayChoiceModal` | Yes/No for "may" abilities |
| `MODAL_CHOICE` | `ModalChoice` | Multi-option selection |
| `CHOOSE_EFFECT` | `ModalChoice` | Modal options |
| `SCRY` | `ScryChoice` | Reorder/keep cards |
| `ORDER_CARDS` | `OrderCardsChoice` | Drag-drop reordering |
| `DISTRIBUTE_DAMAGE` | `DistributeDamageChoice` | Multi-target damage |
| `REVEAL_AND_DECIDE` | `RevealModal` | Reveal then choose |

### Best Practices for Modal Selection

```typescript
// 1. Wait for modal to appear
await expect(gamePage.page.getByText(/choose|target|select/i).first()).toBeVisible({ timeout: 10000 });

// 2. Select card using aria-label (most reliable)
await gamePage.page.getByRole('button', { name: /Mickey Mouse/i }).click();

// 3. Wait for confirm to be enabled
const confirmBtn = gamePage.page.getByRole('button', { name: /Confirm/i });
await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
await confirmBtn.click();

// 4. Verify modal closed
await expect(gamePage.page.getByText('Choose a card')).toBeHidden();
```
