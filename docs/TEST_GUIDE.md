# Lorai Test Suite Guide

## Overview
The Lorai game engine has a comprehensive test suite covering parsers, abilities, game rules, and the choice system. This guide covers all test suites and how to run them.

## Quick Start

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/tests/abilities/choice-system.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="Optional"

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Browser Test Mode

For UI testing in the browser, use special URL parameters to skip manual setup:

```bash
# Full auto - starts game immediately with default decks
http://localhost:3000/game?test=true&autoMulligan=true

# Test mode with manual mulligan
http://localhost:3000/game?test=true

# Normal mode (shows deck import modal)
http://localhost:3000/game

# Debug mode - enables state manipulation panel
http://localhost:3000/game?test=true&autoMulligan=true&debug=true
```

| Parameter | Effect |
|-----------|--------|
| `test=true` | Skips deck import modal, auto-loads `deck1.json` and `deck2.json` |
| `autoMulligan=true` | Skips mulligan phase (keeps all cards) |
| `debug=true` | Enables the Debug Panel for state manipulation |
| `startingHand=Card1,Card2` | Forces specific cards into starting hand |

This is useful for:
- Automated browser testing with the browser subagent
- Quick manual testing without deck setup
- Debugging specific card interactions
- Setting up exact game states to reproduce bugs

---

## Debug Mode 🔧

The Debug Mode provides a powerful UI panel for manipulating game state in real-time. This is essential for testing abilities and reproducing bugs.

### Activating Debug Mode

Add `&debug=true` to any game URL:
```
http://localhost:3000/game?test=true&autoMulligan=true&debug=true
```

A yellow **"🔧 Debug"** button appears in the bottom-right corner. Click to expand.

### Debug Panel Tabs

#### Cards Tab
Add any card to any zone for either player:
1. Select target player (You/Bot)
2. Select target zone (hand, play, inkwell, deck)
3. For play zone, toggle "Ready" checkbox for exerted state
4. Click "Add Card" to open the card picker
5. Search by name, filter by type/color/cost
6. Click a card to add it immediately

#### State Tab
Direct state manipulation:
- **Set Lore**: Enter a value for any player
- **Active Turn**: Switch which player's turn it is
- **Export State**: Download game state as JSON file
- **Import State**: Paste JSON to restore a saved state
- **Clear Zones**: Remove all cards from play or hands

#### Presets Tab
Load pre-built test scenarios with one click:

| Preset | Category | What It Tests |
|--------|----------|---------------|
| Lady/Tramp Synergy | ability | Lore bonus and Ward when both in play |
| Bodyguard Test | keyword | Bodyguard forcing challenges |
| On-Play Targeting | ability | Targeting abilities on play |
| Quest Trigger Test | ability | Quest-triggered abilities |
| Cost Reduction Test | ability | Cost reduction mechanics |
| Basic Combat | combat | Simple combat scenario |
| Lethal Combat | combat | Combat with banishing |
| Near Victory | general | Player at 19 lore |
| Empty Board | general | Fresh start with cards in hand |

### Adding Custom Presets

Edit `src/debug/DebugPresets.ts`:

```typescript
{
    id: 'my-bug-repro',
    name: 'My Bug Reproduction',
    description: 'Steps to reproduce issue #123',
    category: 'ability',
    setup: {
        player1: {
            hand: ['Card - Full Name'],
            play: [
                { name: 'Card - Name', ready: true },
                { name: 'Another Card', ready: false, damage: 2 }
            ],
            inkwell: ['Stitch - Rock Star', 'Stitch - Rock Star'],
            lore: 0
        },
        player2: {
            hand: [],
            play: [{ name: 'Enemy Card', ready: true }],
            inkwell: [],
            lore: 5
        },
        turnPlayer: 'player1'
    }
}
```

### State Export/Import for Bug Reports

1. Reproduce the bug state using the debug panel
2. Click "Export State" in the State tab
3. Include the JSON file in bug reports
4. Others can "Import State" to reproduce exactly

### Debug API (Programmatic)

The `StateManipulator` class provides programmatic access:

```typescript
import { StateManipulator } from '../debug';

const manipulator = new StateManipulator(gameEngine);

// Add cards
manipulator.addToHand('player1', 'Lady - Elegant Spaniel');
manipulator.addToPlay('player1', 'Tramp - Enterprising Dog', { ready: true });
manipulator.addToInkwell('player1', 'Stitch - Rock Star');

// Modify state
manipulator.setLore('player1', 15);
manipulator.setDamage(cardInstanceId, 3);
manipulator.setTurn('player2');

// Serialize
const json = manipulator.exportState();
manipulator.importState(json);

// Load presets
manipulator.loadPreset(DEBUG_PRESETS[0]);
```



## Test Organization

### 📁 Test Directory Structure
```
src/tests/
├── abilities/          # 124 files - Ability execution tests
├── parser/             # 70 files - Card text parsing tests  
├── engine/             # 5 files - Core game engine tests
├── rules/              # 6 files - Game rule tests
├── ai/                 # 1 file - AI/bot tests
├── generated/          # 16 files - Auto-generated tests
└── test-utils/         # 5 files - Shared test utilities
```

## Test Categories

### 1. **Choice System Tests** ⭐ NEW
**File**: `src/tests/abilities/choice-system.test.ts`

Tests the unified callback-based choice system for player interactions.

```bash
npm test -- choice-system.test.ts
```

**What it tests**:
- ✅ Optional effects prompt correctly with yes/no
- ✅ Declining optional prevents execution
- ✅ Accepting optional allows execution
- ✅ Non-optional effects don't prompt
- ✅ Request structure validation
- ✅ Separate handlers per player

**Status**: 6/6 tests passing ✅

---

### 2. **Parser Tests**
**Location**: `src/tests/parser/`

Tests that card ability text is correctly parsed into executable AST.

```bash
# Run all parser tests
npm test -- src/tests/parser/

# Run specific batch
npm test -- batch-14.test.ts
```

**Test Files** (70 files):
- `batch-*.test.ts` - Organized by card groups
- `cursed-merfolk-pattern.test.ts` - Specific card patterns
- `missing-patterns.test.ts` - Known gaps
- `bobby-zimuruski.test.ts` - Optional ability parsing

**What it tests**:
- Card text → AST conversion
- Trigger patterns (on_play, while_in_play, etc.)
- Effect types (draw, discard, damage, etc.)
- Target filters and conditions

---

### 3. **Ability Execution Tests**
**Location**: `src/tests/abilities/`

Tests that parsed abilities execute correctly in-game.

```bash
# Run all ability tests
npm test -- src/tests/abilities/

# Run specific ability type
npm test -- keyword-singer.test.ts
```

**Test Files** (124 files):
- `tdd-batch*.test.ts` - Test-driven development suites
- `keyword-*.test.ts` - Keyword ability tests (Singer, etc.)
- `choice-system.test.ts` - Choice/prompt system

**What it tests**:
- Ability execution logic
- Game state mutations
- Triggered effects
- Optional effects
- Targeting

---

### 4. **Executor Tests** 🔥
**Location**: `src/tests/abilities/execution/`

**Dedicated executor effect tests** - 29 specialized test files!

```bash
# Run all executor tests
npm test -- src/tests/abilities/execution/

# Run specific executor test
npm test -- draw.test.ts
```

**Test Files** (29 specialized files):
- `draw.test.ts` - Draw effects
- `damage.test.ts` - Damage effects
- `heal.test.ts` - Heal effects
- `banish.test.ts` - Banish effects
- `buffs.test.ts` - Stat modification
- `challenge.test.ts` - Challenge mechanics
- `quest-and-lore.test.ts` - Questing
- `inkwell.test.ts` / `inkwell-mechanics.test.ts` - Ink system
- `locations.test.ts` - Location abilities
- `items.test.ts` - Item mechanics
- `songs.test.ts` - Song cards
- `keywords.test.ts` / `advanced-keywords.test.ts` - Keywords
- `static-effects.test.ts` - Static abilities
- `control-flow.test.ts` - Flow control (if/then/else)
- `recursion.test.ts` - Recursive effects
- `prevention-effects.test.ts` - Prevention abilities
- `opponent-interaction.test.ts` / `opponent.test.ts` - Opponent effects
- `search-and-tutor.test.ts` - Deck searching
- `deck-manipulation-advanced.test.ts` - Deck manipulation
- `return-to-hand.test.ts` - Return effects
- `complex-conditionals.test.ts` - Complex conditions
- `specialized-effects.test.ts` - Special mechanics
- `utility-effects.test.ts` - Utility effects
- `interactions.test.ts` - Card interactions
- `aliases-and-combos.test.ts` - Combos

**Plus**:
- `executor-targeting-methods.test.ts` - Targeting system tests

**What it tests**:
- ✅ Individual effect type execution
- ✅ Effect combinations
- ✅ Edge cases and error handling
- ✅ Game state validation
- ✅ Complex interactions

**Example Pattern**:
```typescript
describe('Draw Effect Execution', () => {
    let executor: EffectExecutor;
    
    beforeEach(async () => {
        executor = new EffectExecutor(turnManager);
    });
    
    test('Draw effects', () => {
        // Execute draw
        // Verify hand size
    });
});
```

---

### 5. **Engine Tests**
**Location**: `src/tests/engine/`

Core game engine functionality.

```bash
npm test -- src/tests/engine/
```

**Test Files** (5 files):
- `turn-cleanup.test.ts` - Turn phase cleanup
- Game loop tests
- State management

---

### 5. **Rules Tests**
**Location**: `src/tests/rules/`

Game rule validation.

```bash
npm test -- src/tests/rules/
```

**Test Files** (6 files):
- `ink-rule.test.ts` - Ink system
- `cost-rule.test.ts` - Cost calculations
- Challenge rules
- Zone movement rules

---

## Test Utilities

### Shared Test Helpers
**File**: `src/tests/engine-test-utils.ts`

```typescript
import { TestHarness } from '../tests/engine-test-utils';

// Create test game
const harness = new TestHarness();
await harness.initialize();

// Set up cards
harness.setHand(harness.p1Id, ['Card Name']);
harness.setInkwell(harness.p1Id, ['Ink Card'], true);
```

### Test Fixtures
**File**: `src/tests/test-fixtures.ts`

Pre-configured card data for testing.

---

## Running Tests by Category

### Parser Coverage
```bash
# All parser tests
npm test -- src/tests/parser/

# Check coverage
npm test -- src/tests/parser/ --coverage
```

### Ability Execution
```bash
# All ability tests
npm test -- src/tests/abilities/

# Specific batch
npm test -- tdd-batch20
```

### Integration Tests
```bash
# Full game scenarios
npm test -- src/tests/integration/
```

---

## Test Patterns

### Testing Optional Effects
```typescript
test('Optional effect prompts correctly', async () => {
    const mockHandler = (request: ChoiceRequest): ChoiceResponse => {
        // Capture request
        return {
            requestId: request.id,
            playerId: request.playerId,
            selectedIds: ['yes'],
            declined: false,
            timestamp: Date.now()
        };
    };
    
    turnManager.registerChoiceHandler(playerId, mockHandler);
    // Execute ability...
});
```

### Testing Card Parsing
```typescript
test('Parses card ability', () => {
    const abilities = parseToAbilityDefinition(card);
    expect(abilities[0].type).toBe('triggered');
    expect(abilities[0].effects[0].type).toBe('draw');
});
```

### Testing Ability Execution
```typescript
test('Ability executes correctly', async () => {
    const harness = new TestHarness();
    await harness.initialize();
    
    // Play card
    harness.turnManager.playCard(harness.p1Id, cardInstanceId);
    
    // Verify state
    expect(player.hand.length).toBe(expectedHandSize);
});
```

---

## Test Statistics

Based on the test suite:
- **Total Test Files**: ~200+
- **Parser Tests**: 70 files
- **Ability Tests**: 124 files
- **Engine Tests**: 5 files
- **Rules Tests**: 6 files
- **Choice System**: 6 tests (100% passing ✅)

---

## Debugging Tests

### Run Single Test
```bash
npm test -- -t "Optional effect prompts"
```

### Verbose Output
```bash
npm test -- --verbose
```

### Debug Mode
```bash
# Add this to test file
console.log('Debug:', variable);
```

### Watch Mode
```bash
npm test -- --watch
```

---

## CI/CD Integration

All tests run automatically on:
- Pull requests
- Main branch commits
- Manual workflow triggers

---

## Common Issues

### Test Timeout
```bash
# Increase timeout
npm test -- --testTimeout=10000
```

### Async Issues
```typescript
// Always await async operations
const result = await (executor as any).checkOptional(...);
```

### Mock Handler Errors
```typescript
// Ensure proper signature
const handler = (request: ChoiceRequest): ChoiceResponse => {
    // Must return ChoiceResponse, not Promise
    return { ... };
};
```

---

## Next Steps

1. **Run choice system tests**: Verify new callback system works
   ```bash
   npm test -- choice-system.test.ts
   ```

2. **Run parser coverage**: Check parsing accuracy
   ```bash
   npm test -- src/tests/parser/
   ```

3. **Run full suite**: Ensure no regressions
   ```bash
   npm test
   ```

---

## Documentation

- **Test Coverage Analysis**: `docs/test-coverage-analysis.md`
- **Test Generation**: `docs/test-generation.md`
- **Test Optimization**: `docs/test-optimization.md`
- **Test Inventory**: `docs/test_inventory.md`

---

Last Updated: 2025-12-14
