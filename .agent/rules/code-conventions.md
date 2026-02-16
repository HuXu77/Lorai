# Code Conventions

## Architecture & Layering

1.  **State Layer** (`models.ts`): Passive data only. No methods, no logic.
2.  **Abilities Layer** (`abilities/`):
    - **Parser**: Converts text to AST.
    - **Executor**: Executes AST effects. **Does NOT validate game rules.**
3.  **Actions Layer** (`actions.ts`, `game-actions/`):
    - **Validation**: Checks costs, permissions, and rules.
    - **Delegation**: Calls `abilitySystem.execute()` only after validation.

## Logging

- **Engine**: Use `this.logger` (ILogger). Do NOT use `console.log`.
- **UI**: Use `console.log` for debugging, but clean up before commit.

## TypeScript

### Imports
- Use relative imports within `src/`
- Engine imports: `import { X } from '../engine/models'`
- Test utils: `import { TestHarness } from '../engine-test-utils'`

### Naming
- Components: PascalCase (`CardActionMenu.tsx`)
- Functions: camelCase (`handleCardClick`)
- Constants: UPPER_SNAKE_CASE (`MAX_HAND_SIZE`)
- Test files: kebab-case (`card-name.test.ts`)

## React Components

### Required Patterns
```typescript
'use client';  // For client components

interface ComponentProps {
    // Always define props interface
}

export default function Component({ prop }: ComponentProps) {
    // Component logic
}
```

### Accessibility
- Interactive elements need `aria-label` or visible text
- Modals need `role="dialog"`
- Use `data-testid` for test-only selectors

## Parser Code

### Pattern Priority
Parsers in `src/engine/parsers/` follow priority order:
1. Specific patterns first (exact matches)
2. Generic patterns last (broad matches)
3. Add new patterns BEFORE catch-all patterns

### Effect Structure
```typescript
{
    trigger: 'on_play' | 'on_quest' | 'on_challenge' | ...,
    action: 'draw' | 'damage' | 'banish' | ...,
    target: 'self' | 'chosen_character' | ...,
    amount: number,
    rawText: string
}
```
