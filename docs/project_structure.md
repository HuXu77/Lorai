# Project Structure Map

This document outlines the high-level file structure of the Lorai project.

## Root Directory
- `.agent/`: Agent workflows and configurations.
- `docs/`: Project documentation.
- `logs/`: Application logs (gitignored).
- `src/`: Main source code directory.
- `allCards.json`: Master card database.
- `debug_*.js/ts`: (Temporary) Debug scripts may appear here during development but should be cleaned up.

## Source Directory (`src/`)

### Core Application
- `app/`: Next.js App Router pages and layouts.
- `components/`: React UI components.
    - `animations/`: Game animation components.
- `engine/`: The Core Lorcana Game Engine. **(Critical)**
    - `actions.ts`: Main action handling and `TurnManager`.
    - `game-actions/`: Implementation of specific actions (Play, Ink, Quest, etc.).
    - `abilities/`: Ability system implementation (`AbilitySystemManager`, `EffectExecutor`).
    - `parsers/`: Logic for parsing card text into game effects.
    - `models.ts`: Core data models and types.
- `ai/`: Bot logic and heuristics.

### Testing & Tools
- `tests/`: Jest test suite.
    - `bugs/`: Regression tests for specific bugs.
    - `engine-test-utils.ts`: `TestHarness` and testing helpers.
- `scripts/`: various utility scripts for data processing/verification.
- `cli/`: CLI entry points for testing/debugging the engine directly.

### Support
- `utils/`: General utility functions.
- `types/`: Global TypeScript type definitions.
- `decks/`: Pre-constructed deck configurations.

## Key Files
- `src/engine/actions.ts`: The central hub for game state mutations and turn progression.
- `src/app/game/page.tsx`: The main game UI container.
- `allCards.json`: The source of truth for all card data.
