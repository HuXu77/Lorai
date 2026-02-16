---
description: Project-specific conventions, patterns, and important knowledge for working on Lorai
---

# Lorai Agent Onboarding & Project Knowledge

This document is the **single source of truth** for agents to navigate the Lorai codebase. Read this first to avoid unnecessary searching.

## 🚀 Quick Path: Where do I go?

Find your task type below and go directly to the relevant files.

| Task Type | Key Directories / Files | Essential Documentation (Read These!) |
| :--- | :--- | :--- |
| **Fixing a Card Bug** | `src/engine/abilities/` (logic)<br>`allCards.json` (data) | `docs/EXECUTOR_ARCHITECTURE.md`<br>`docs/TEST_GUIDE.md` (Section: Ability Testing) |
| **Adding a New Card** | `allCards.json`<br>`src/engine/parsers/` | `docs/CARD_DATA_FORMAT.md`<br>`docs/PARSER_ORDERING.md` |
| **UI Changes / Styling** | `src/app/game/` (Game Page)<br>`src/components/` | `docs/UI_ARCHITECTURE.md` |
| **Bot / AI Logic** | `src/engine/ai/` | `docs/ENGINE_ARCHITECTURE.md` (AI Layer) |
| **Game Engine Core** | `src/engine/actions.ts` (TurnManager)<br>`src/engine/models.ts` | `docs/ENGINE_ARCHITECTURE.md` |
| **Writing Tests** | `src/tests/` | `docs/TEST_GUIDE.md` (Critical!) |

---

## 🏗️ Architecture at a Glance

The application follows a strict layered architecture. **Do not bypass layers.**

1.  **State Layer** (`src/engine/models.ts`):
    *   Pure data. No logic.
    *   **Rule**: Never mutate state directly in UI components. Use `TurnManager` actions.

2.  **Engine Layer** (`src/engine/`):
    *   **TurnManager** (`actions.ts`): The "brain". Validates rules and executes moves.
    *   **AbilitySystem** (`abilities/`):
        *   **Parser**: Converts text -> JSON AST (`EffectAST`).
        *   **Executor**: Executes JSON AST -> Game State changes.
    *   **Rule**: All game logic lives here.

3.  **UI Layer** (`src/app/game/`, `src/components/`):
    *   **Next.js 14** (App Router).
    *   **Rule**: UI only *displays* state and *requests* actions via `HumanController`.

---

## ⚠️ Critical Agent Rules

### 1. Testing is Mandatory
*   **Never** fix a bug without a reproduction test case.
*   **Use `TestHarness`**:
    ```typescript
    import { TestHarness } from '../engine-test-utils';
    const harness = new TestHarness();
    await harness.initialize();
    harness.setHand(harness.p1Id, ['Card Name']); // Setup state
    ```
*   **Run Tests**:
    *   `npm test` (All tests - slow)
    *   `npm test -- path/to/file` (Fast - use this!)

### 2. Card Naming
*   Always use the **exact full name** from `allCards.json` (e.g., `"Mickey Mouse - Brave Little Tailor"`, not just `"Mickey"`).
*   Typos in card names will cause tests to fail silently or throw "Card not found" errors.

### 3. Coding Standards
*   **Immutability**: Prefer creating new objects over mutating state where possible, though the engine uses mutable state for performance.
*   **No `any`**: TypeScript types are strict. Use `GameState`, `PlayerState`, `CardInstance`.
*   **No `console.log` in production**: Use the `GameLog` system for player-facing messages.

### 4. Common Pitfalls
*   **Infinite Loops**: When writing `while` loops in the engine, always add a safety break (e.g., `let checks = 0; if (checks++ > 100) break;`).
*   **Async/Await**: The engine is largely synchronous, but some UI interactions (choices) are async. Be careful when mixing the two.

---

## 📚 Critical Documentation Links

*   **[Engine Architecture](file:///Users/mitchellclay/Developer/Lorai/docs/ENGINE_ARCHITECTURE.md)**: How the loop works.
*   **[Test Guide](file:///Users/mitchellclay/Developer/Lorai/docs/TEST_GUIDE.md)**: How to write and run tests.
*   **[UI Architecture](file:///Users/mitchellclay/Developer/Lorai/docs/UI_ARCHITECTURE.md)**: Component hierarchy.
*   **[Executor Architecture](file:///Users/mitchellclay/Developer/Lorai/docs/EXECUTOR_ARCHITECTURE.md)**: How abilities work.

---
**Verification**: If you are unsure, run `npm test -- src/tests/abilities/choice-system.test.ts` to checking the choice system is working.
