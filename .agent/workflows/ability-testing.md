---
description: How to add or test new card abilities in the engine
---

# Ability Testing Workflow

This workflow describes how to test and add new card abilities in the Lorai engine.

// turbo-all

## Quick Start: Test an Existing Ability

```bash
# Find tests for a card
grep -r "Card Name" src/tests/

# Run specific test
npm test -- card-name.test.ts

# Run all ability tests
npm test -- src/tests/abilities/
```

## Check if Ability Parses Correctly

```bash
# Search for card in test failures
grep -i "CardName" parser-failures.json

# Check parsed effects for a card (create temp script)
node -e "
const fs = require('fs');
const cards = JSON.parse(fs.readFileSync('allCards.json'));
const card = cards.find(c => c.fullName?.includes('Card Name'));
console.log(JSON.stringify(card, null, 2));
"
```

## Writing Ability Unit Tests

### Test File Location
```
src/tests/abilities/<card-name>.test.ts
```

### Basic Test Template
```typescript
import { TestHarness, findInZone } from '../engine-test-utils';

describe('Card Name Ability', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    test('should trigger ability on play', async () => {
        // 1. Setup
        harness.setHand(harness.p1Id, ['Card Name']);
        harness.setInkwell(harness.p1Id, ['Ink', 'Ink', 'Ink'], true);

        // 2. Execute
        const card = findInZone(harness.getPlayer1(), 'hand', 'Card Name');
        harness.turnManager.playCard(harness.p1Id, card.instanceId);

        // 3. Assert
        expect(harness.getPlayer1().lore).toBe(1);
    });
});
```

### Testing Choice Handler
```typescript
test('optional effect prompts correctly', async () => {
    let capturedRequest: ChoiceRequest | null = null;
    
    // Register mock handler
    harness.turnManager.registerChoiceHandler(harness.p1Id, (request) => {
        capturedRequest = request;
        return {
            requestId: request.id,
            playerId: request.playerId,
            selectedIds: ['yes'],
            declined: false,
            timestamp: Date.now()
        };
    });

    // Play card with optional effect
    const card = findInZone(harness.getPlayer1(), 'hand', 'Optional Card');
    harness.turnManager.playCard(harness.p1Id, card.instanceId);

    // Verify prompt was shown
    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.optional).toBe(true);
});
```

## Adding a New Ability Parser

### 1. Identify the Pattern
Find the card text in `allCards.json`:
```bash
grep -A 5 '"fullName": "Card Name"' allCards.json
```

### 2. Create Parser Pattern

Location: `src/engine/parsers/<category>/<sub-category>.ts`

```typescript
// Pattern: "Deal X damage to chosen character"
private parseTargetedDamage(text: string): CardEffect | null {
    const match = text.match(/deal\s+(\d+)\s+damage\s+to\s+chosen\s+character/i);
    if (!match) return null;

    return {
        trigger: 'on_play',
        action: 'damage',
        target: 'chosen_character',
        amount: parseInt(match[1]),
        rawText: text
    };
}
```

### 3. Register Parser
Add to the parser chain in the appropriate file:
```typescript
// In parseEffectText or parseTriggeredAbility
effect = this.parseTargetedDamage(text);
if (effect) return [effect];
```

### 4. Add Handler (if new action type)

Location: `src/engine/abilities/effect-executor.ts` or family handlers

```typescript
case 'damage':
    const amount = effect.amount || 1;
    await this.damageFamilyHandler.execute(effect, context);
    break;
```

### 5. Write Tests
```bash
npm test -- card-name.test.ts
```

## Testing Triggered Abilities

### On-Play (when card enters play)
```typescript
harness.turnManager.playCard(harness.p1Id, card.instanceId);
// Assert effect happened
```

### On-Quest (when character quests)
```typescript
// Play card first
harness.turnManager.playCard(harness.p1Id, card.instanceId);
// Must wait a turn for "drying"
harness.turnManager.endTurn();
harness.turnManager.endTurn();
// Now quest
harness.turnManager.quest(harness.p1Id, card.instanceId);
// Assert
```

### On-Challenge (when character challenges or is challenged)
```typescript
// Setup: P1 has attacker, P2 has exerted target
harness.turnManager.challenge(harness.p1Id, attackerId, defenderId);
// Assert combat result
```

## Common Test Assertions

```typescript
// Hand size
expect(player.hand.length).toBe(5);

// Card in zone
expect(player.play.some(c => c.name === 'Card Name')).toBe(true);

// Lore
expect(player.lore).toBe(3);

// Card damage
const card = findInZone(player, 'play', 'Card Name');
expect(card.damage).toBe(2);

// Card banished
expect(player.discard.some(c => c.name === 'Card Name')).toBe(true);

// Effect logged
expect(harness.getLogMessages()).toContainEqual(
    expect.stringMatching(/drew.*card/i)
);
```

## Debugging Ability Execution

### Enable Debug Logging
```typescript
// In test file
process.env.DEBUG = 'true';
```

### Check Parser Output
```typescript
import { parseToAbilityDefinition } from '../../engine/effect-parser';

const card = { fullText: 'When this character quests, draw a card.' };
const abilities = parseToAbilityDefinition(card as any);
console.log(JSON.stringify(abilities, null, 2));
```

## Common Parser Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Returns `null` | Pattern not matched | Check regex against actual card text |
| Wrong trigger | Parser order | Move specific pattern before generic |
| Missing effect | Multi-effect text | Split text and parse each part |
| Infinite loop | Recursive trigger | Add trigger guards |
