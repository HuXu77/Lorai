# Lorai Project Rules

Rules for optimal AI agent collaboration on this project.

## File Organization

- **Engine code**: `src/engine/` - Core game logic
- **UI components**: `src/components/` - React components
- **Unit tests**: `src/tests/abilities/`, `src/tests/parser/`
- **E2E tests**: `src/tests/e2e/`
- **Workflows**: `.agent/workflows/` - Reference before complex tasks

## Testing Patterns

### Unit Tests (Jest)
```typescript
import { TestHarness, findInZone } from '../engine-test-utils';

const harness = new TestHarness();
await harness.initialize();
harness.setHand(harness.p1Id, ['Card Name']);
harness.setInkwell(harness.p1Id, ['Ink Card'], true);
```

### E2E Tests (Playwright)
```typescript
await gamePage.loadTestGame();
await gamePage.injectState({
    player1: { hand: ['Card'], deck: ['Card'], turnPlayer: 'player1' },
    player2: { deck: ['Card'] }
});
// Use getByRole for buttons
await gamePage.page.getByRole('button', { name: /CardName/i }).click();
```

## Card Names

Always use **exact full names** from `allCards.json`:
- ✅ `"Mickey Mouse - Brave Little Tailor"`
- ❌ `"Mickey Mouse"` (ambiguous)

Verify card exists: `grep '"fullName":.*CardName' allCards.json`

## UI Component Selectors

| Selector | Usage |
|----------|-------|
| `data-testid="choice-modal"` | Main modal container |
| `data-testid="choice-option"` | Card option buttons |
| `getByRole('button', { name: /pattern/i })` | Primary selection method |
| `[role="dialog"]` | Card detail modals |

## Common Gotchas

1. **Cards "drying"** - Add `turnPlayed: 0` to cards in play
2. **Empty deck = game over** - Always provide `deck: ['Card']`
3. **Modal not found** - Use `getByRole` not scoped locators
4. **Parser returns null** - Check parser ordering in `src/engine/parsers/`

## Before Pushing

```bash
npm run next:build    # Type check
npm test              # Unit tests
```

User preference: Long-running tests - pause and let user run.
