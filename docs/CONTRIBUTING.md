# Contributing to Lorai Engine

Thank you for your interest in contributing to the Lorai TCG Engine! This guide will help you get started.

## Table of Contents
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Code Style](#code-style)
- [Testing](#testing)
- [Adding New Features](#adding-new-features)
- [Pull Request Process](#pull-request-process)

---

## Development Setup

### Prerequisites
- Node.js v18 or higher
- npm
- TypeScript knowledge
- Git

### Initial Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Lorai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

5. **Try the CLI**:
   ```bash
   node dist/cli-game.js
   ```

---

## Project Structure

```
Lorai/
├── src/
│   ├── engine/          # Core game engine
│   │   ├── models.ts    # Type definitions
│   │   ├── state.ts     # State management
│   │   ├── actions.ts   # TurnManager (3700 lines!)
│   │   ├── effect-parser.ts # Ability text parser
│   │   └── card-loader.ts   # Card database loader
│   ├── ai/              # AI bot implementations
│   │   ├── models.ts    # Bot interface
│   │   └── random-bot.ts
│   ├── tests/           # Test suite
│   │   ├── abilities/   # 73 ability tests
│   │   └── rules/       # Core rule tests
│   └── cli-game.ts      # Interactive game CLI
├── docs/                # Documentation
├── allCards.json        # Card database (2,500+ cards)
└── README.md
```

---

## Code Style

### TypeScript Guidelines

**1. Use TypeScript types, not `any`**:
```typescript
// ❌ Bad
function doSomething(data: any): any { }

// ✅ Good
function processCard(card: CardInstance): CardEffect[] { }
```

**2. Prefer interfaces for data, types for unions**:
```typescript
// ✅ Good
interface Player {
  id: string;
  lore: number;
}

type ZoneType = 'Deck' | 'Hand' | 'Play' | 'Discard';
```

**3. Use descriptive variable names**:
```typescript
// ❌ Bad
const c = player.hand[0];

// ✅ Good
const cardToPlay = player.hand[0];
```

### Naming Conventions

- **Classes**: PascalCase (`TurnManager`, `EffectParser`)
- **Interfaces**: PascalCase (`CardInstance`, `GameState`)
- **Functions**: camelCase (`playCard`, `resolveEffect`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_HAND_SIZE`)
- **Private methods**: camelCase with underscore prefix (`_internalHelper`)

### Comments

**Use JSDoc for public APIs**:
```typescript
/**
 * Plays a card from the player's hand.
 * 
 * @param player - The player playing the card
 * @param cardId - Instance ID of the card to play
 * @param payload - Optional payload for complex card effects
 * @returns true if the card was successfully played
 */
playCard(player: PlayerState, cardId: string, payload?: any): boolean {
  // Implementation
}
```

**Use inline comments for complex logic**:
```typescript
// Check Bodyguard requirement: Must challenge bodyguard if present
const opponentBodyguards = opponent.play.filter(c =>
  !c.ready && c.parsedEffects?.some(e => e.action === 'keyword_bodyguard')
);
```

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- stitch-rock-star.test.ts

# Run tests matching pattern
npm test -- --testPathPattern=abilities
```

### Writing Tests

**Test Structure**:
```typescript
import { TestHarness } from '../engine-test-utils';
import { ActionType, ZoneType } from '../../engine/models';

describe('My Feature', () => {
  let harness: TestHarness;

  beforeEach(async () => {
    harness = new TestHarness();
    await harness.initialize();
  });

  test('should do something', () => {
    const player = harness.createPlayer('Player 1');
    harness.setTurn(player.id);
    
    // Setup
    const card = harness.createCard(player, {
      name: 'Test Card',
      type: CardType.Character,
      cost: 3
    });
    
    // Execute
    harness.playCard(player, card);
    
    // Assert
    expect(player.play).toContain(card);
    expect(player.hand).not.toContain(card);
  });
});
```

**Testing Abilities** (see [TESTING.md](docs/TESTING.md) for details):
1. Create test file: `src/tests/abilities/card-name.test.ts`
2. Set up game state with TestHarness
3. Execute action
4. Verify results

### Test Coverage

Aim for:
- **100%** coverage of new effect parsers
- **100%** coverage of new action handlers
- **At least one test** per new card ability pattern

---

## Adding New Features

### Adding a New Card Ability

**Step 1: Check if parser exists**

Run the card through the parser to see if it's already recognized:
```bash
npm run build
node dist/ability-coverage-analyzer.js
```

**Step 2: Add parser pattern** (if needed)

In `src/engine/effect-parser.ts`:

```typescript
private parseNewAbility(text: string): CardEffect | null {
  // Match pattern
  const match = text.match(/your pattern regex/i);
  if (!match) return null;

  return {
    trigger: 'on_play',      // When does this trigger?
    action: 'new_action',    // What does it do?
    target: 'self',          // Who is affected?
    amount: parseInt(match[1]),
    rawText: text
  };
}
```

Call it from `parseEffectText()`:
```typescript
// Add to parsing chain
effect = this.parseNewAbility(text);
if (effect) return [effect];
```

**Step 3: Add action handler**

In `src/engine/actions.ts`, add handler to `resolveEffect()`:

```typescript
else if (effect.action === 'new_action') {
  // Implement the effect logic
  const amount = effect.amount || 1;
  player.lore += amount;
  console.log(`[${player.name}] Gained ${amount} lore from new action.`);
}
```

**Step 4: Write test**

Create `src/tests/abilities/card-name.test.ts`:
```typescript
describe('Card Name Ability', () => {
  test('should perform new action', () => {
    // Setup, Execute, Assert
  });
});
```

**Step 5: Run tests**
```bash
npm test -- card-name.test.ts
```

### Adding a New AI Bot

1. **Create bot file**: `src/ai/your-bot.ts`
2. **Implement Bot interface**:
   ```typescript
   export class YourBot implements Bot {
     name = "Your Bot";
     
     chooseAction(game: GameStateManager, playerId: string): GameAction {
       // Your decision logic here
       const player = game.getPlayer(playerId);
       
       // Example: Always quest if possible
       const canQuest = player.play.find(c => 
         c.ready && c.turnPlayed < game.state.turnCount
       );
       
       if (canQuest) {
         return {
           type: ActionType.Quest,
           playerId,
           cardId: canQuest.instanceId
         };
       }
       
       return { type: ActionType.PassTurn, playerId };
     }
   }
   ```
3. **Test in bot-sim**:
   ```typescript
   // In src/bot-sim.ts
   import { YourBot } from './ai/your-bot';
   
   const bot1 = new YourBot();
   const bot2 = new RandomBot();
   ```

---

## Pull Request Process

### Before Submitting

1. **Run tests**: `npm test` should pass
2. **Run build**: `npm run build` should succeed
3. **Check formatting**: Ensure code follows style guide
4. **Update docs**: Add/update relevant documentation
5. **Write clear commit messages**:
   ```
   Add parser for "Boost" keyword
   
   - Implemented parseBoost() method
   - Added boost action handler in resolveEffect()
   - Added test coverage in keyword-boost.test.ts
   - Fixes #123
   ```

### PR Checklist

- [ ] Tests pass locally (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] New code has tests
- [ ] Documentation updated (if needed)
- [ ] No `console.log` left in code (use proper logging)
- [ ] TSLint/ESLint issues resolved
- [ ] PR description explains what/why

### PR Description Template

```markdown
## Description
Brief description of what this PR does.

## Changes
- Added X feature
- Fixed Y bug
- Updated Z documentation

## Testing
How to test these changes:
1. Run `npm test`
2. Try card X in CLI game

## Related Issues
Fixes #123
Related to #456
```

---

## Common Development Tasks

### Debugging a Card Ability

1. **Check if card is loaded**:
   ```typescript
   const loader = new CardLoader();
   loader.loadCards();
   const card = loader.getCard(cardId);
   console.log(card?.parsedEffects);
   ```

2. **Enable debug logging**:
   ```typescript
   // In effect-parser.ts
   console.log(`[PARSE] Attempting to parse: ${text}`);
   ```

3. **Run specific test**:
   ```bash
   npm test -- card-name.test.ts
   ```

### Finding Unimplemented Abilities

Run the coverage analyzer:
```bash
npm run build
node dist/ability-coverage-analyzer.js
```

This generates `unknown-abilities-analysis.json` showing unparsed abilities.

### Updating Card Database

Download latest `allCards.json` from Lorcana API or update manually. Rebuild and retest:
```bash
npm run build
npm test
```

---

## Getting Help

- **Documentation**: Start with [ARCHITECTURE.md](ARCHITECTURE.md)
- **API Reference**: See [docs/API_REFERENCE.md](docs/API_REFERENCE.md)
- **Issues**: Check existing issues on GitHub
- **Questions**: Open a GitHub Discussion

---

## Code of Conduct

- Be respectful and constructive
- Focus on the code, not the person
- Welcome newcomers and help them learn
- Follow project guidelines

Thank you for contributing! 🎉
