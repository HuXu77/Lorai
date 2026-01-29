---
description: Project-specific conventions, patterns, and important knowledge for working on Lorai
---

# Lorai Project Knowledge

This document captures critical project knowledge, conventions, and patterns.

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI**: React with TailwindCSS
- **Testing**: Jest (unit), Playwright (E2E)
- **Key Files**:
  - `allCards.json` - Card database (6.4MB, 2500+ cards)
  - `src/engine/actions.ts` - TurnManager (main game logic)
  - `src/app/game/page.tsx` - Main game UI

## Directory Structure

```
src/
├── app/           # Next.js pages
├── components/    # React UI components
├── engine/        # Core game engine (CRITICAL)
│   ├── actions.ts      # TurnManager - game state mutations
│   ├── abilities/      # AbilitySystemManager, EffectExecutor
│   ├── parsers/        # Card text parsing
│   └── models.ts       # Core types
├── tests/         # Test suites
│   ├── abilities/      # 124 files - ability execution
│   ├── parser/         # 70 files - text parsing
│   ├── e2e/            # Playwright browser tests
│   └── engine-test-utils.ts  # TestHarness helper
└── debug/         # Debug utilities (StateManipulator, presets)
```

## Testing Commands

```bash
# Unit tests (Jest)
npm test                                    # All tests
npm test -- path/to/test.ts                 # Specific file
npm test -- --testNamePattern="pattern"     # By name

# E2E tests (Playwright)
npx playwright test                         # All E2E
npx playwright test src/tests/e2e/modals/   # Specific directory
npx playwright show-report                  # View HTML report
```

## Key Test Patterns

### Unit Test Setup (TestHarness)
```typescript
import { TestHarness } from '../engine-test-utils';

const harness = new TestHarness();
await harness.initialize();

harness.setHand(harness.p1Id, ['Card Name']);
harness.setInkwell(harness.p1Id, ['Ink Card'], true);
harness.turnManager.playCard(harness.p1Id, cardId);
```

### E2E Test Setup (injectState)
```typescript
await gamePage.injectState({
    player1: {
        hand: ['Card Name'],
        inkwell: ['Generic Ink', 'Generic Ink'],
        play: [{ name: 'Character', ready: true, turnPlayed: 0 }],
        deck: ['Deck Card'],
        lore: 0
    },
    player2: {
        deck: ['Deck Card'],
        play: []
    },
    turnPlayer: 'player1'
});
```

### E2E Modal Interaction (Reliable Pattern)
```typescript
// Use getByRole for reliable button detection
const button = gamePage.page.getByRole('button', { name: /Button Text/i });
await expect(button).toBeVisible({ timeout: 10000 });
await button.click();

// Wait for confirm and click
const confirmBtn = gamePage.page.getByRole('button', { name: /Confirm/i });
await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
await confirmBtn.click();
```

## Card Name Resolution

- Use **exact full names** from `allCards.json` (e.g., `"Mickey Mouse - Brave Little Tailor"`)
- Card lookup during `injectState` uses fuzzy matching but exact names prevent issues
- Verify card exists: `grep '"fullName":.*CardName' allCards.json`

## Critical UI Components

- **CardActionMenu.tsx** - Card detail modal (has `role="dialog"`)
- **ChoiceContainer.tsx** - Wrapper for all choice modals (has `data-testid="choice-modal"`)
- **PlayerChoiceHandler.tsx** - Routes choice types to appropriate components

## Debug Mode

### Browser Debug URL
```
http://localhost:3000/game?test=true&autoMulligan=true&debug=true
```

### Debug Panel Features
- **Cards Tab**: Add cards to any zone
- **State Tab**: Export/Import state JSON
- **Presets Tab**: Load pre-built test scenarios

## Common Issues & Solutions

### E2E Test: Cards are "drying" (can't act)
**Fix**: Add `turnPlayed: 0` to cards in play:
```typescript
play: [{ name: 'Card', ready: true, turnPlayed: 0 }]
```

### E2E Test: Modal not found
**Fix**: Ensure modals have `role="dialog"` or `data-testid="choice-modal"`. Use `getByRole` instead of scoped locators.

### E2E Test: Card not in hand
**Fix**: Verify card name exists in `allCards.json`. Check for typos.

### Parser returning null
**Fix**: Check parser ordering in `src/engine/parsers/`. Earlier patterns take priority.

## Before Pushing Changes

```bash
npm run next:build    # Type check and build
npm test              # Run all tests
```
