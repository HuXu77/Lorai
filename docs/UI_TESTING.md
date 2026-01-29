# UI Testing Guide

This document outlines the strategy, tools, and best practices for E2E UI testing in the Lorcana codebase.

## Philosophy

Our E2E tests focus on **User Interaction** and **UI State**, not deep game engine logic.
- **Do Test**: Can the user click "Quest"? Does the targeting modal appear? Can I select a card? Does the turn pass?
- **Do Not Test**: Does the engine correctly calculate complex rule interactions 5 turns deep? (Use Engine Tests for this).

## Tools

We use **Playwright** for browser automation.
- Config: `playwright.config.ts`
- Fixtures: `src/tests/e2e/fixtures/game-fixture.ts` (Provides `gamePage` helper).

## Best Practices

### Selectors
Prioritize accessibility-based selectors to ensure the app is usable and tests are robust.
1. `getByRole('button', { name: "Card Name" })`: Best. Handles `aria-label` and visible text.
2. `getByLabel("Card Name")`: Good for form inputs or labelled elements.
3. `getByTestId("choice-modal")`: Use for structural elements not exposed to users (e.g. containers).

### Handling Modals
Use the `gamePage` helpers to interact with choice modals interactively:
```typescript
// Wait for modal
await gamePage.expectModal();

// Select an option (handles cards and buttons)
await gamePage.selectModalOption('Mickey Mouse');

// Confirm selection
await gamePage.confirmModal();
```

### Test State Injection
Use `injectState` to set up complex board states instantly, bypassing manual setup steps. This is preferred for testing specific mechanics.

```typescript
await gamePage.injectState({
    player1: {
        hand: ['Stitch - Rock Star'], // Cards in hand
        inkwell: ['Minnie Mouse - Always Classy'], // Cards in inkwell (ready)
        play: [{ name: 'Stitch - New Dog', ready: true }], // Cards in play
        deck: ['Mickey Mouse - Detective'] // Required to prevent deck-out!
    },
    player2: {
        deck: ['Mickey Mouse - Detective'] // Always specify a deck for opponent too
    }
});
```
**Note:** Always provide a `deck` list to prevent immediate game loss due to drawing from an empty deck.

### Async & Animations
- Playwright auto-waits for actionability (visible, stable, enabled) on `click()`.
- Use `await expect(locator).toBeVisible()` for assertions.
- **Avoid** strict timeouts logic like `isVisible() ? click() : fallback`. Instead, ensure your selectors act on visible elements or use `waitFor`.

### Hidden Text (sr-only)
Interactive elements that only display images (like Cards) should include hidden text or `aria-label` for accessibility and testing.
- Add `aria-label={cardName}` to the interactive wrapper.
- Playwright's `getByRole` will find it by name.

## Common Pitfalls
- **Exertion/Ready State**: If a card is exerted, actions like "Quest" may be missing. Ensure turn transitions complete (Ready Phase) before verifying actions.
- **Modal Persistence**: Ensure modals are closed (`toBeHidden()`) before attempting to end turn.
- **Selector Precision**: Use regex `/Name/i` for flexible matching if needed (e.g. ignoring subtitles).
