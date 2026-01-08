# Parser Architecture & Best Practices

## Critical Discovery: Pattern Ordering

**⚠️ MOST IMPORTANT RULE**: Pattern order matters! Specific patterns MUST be checked before general patterns.

### The Problem

```typescript
// ❌ WRONG - General pattern comes first
if (text.match(/gain (\d+) lore/i)) {
    return { type: 'gain_lore', amount: parseInt(match[1]) };
}
// This pattern never executes because the above already matched!
if (text.match(/gain (\d+) lore for each damaged character/i)) {
    return { type: 'gain_lore', per: 'damaged_character' };
}
```

### The Solution

```typescript
// ✅ CORRECT - Specific pattern comes first
if (text.match(/gain (\d+) lore for each damaged character/i)) {
    return { 
        type: 'gain_lore', 
        amount: parseInt(match[1]),
        per: 'damaged_character'
    };
}
// General pattern only matches if specific didn't
if (text.match(/gain (\d+) lore/i)) {
    return { type: 'gain_lore', amount: parseInt(match[1]) };
}
```

### Early Returns Prevent Fallthrough

Always use `return effects;` after adding to effects array to prevent pattern fallthrough:

```typescript
const specificMatch = text.match(/specific pattern/i);
if (specificMatch) {
    effects.push({ /* ... */ });
    return effects;  // ✅ Early return prevents checking other patterns
}

const generalMatch = text.match(/general pattern/i);
if (generalMatch) {
    effects.push({ /* ... */ });
}
```

---

## Architecture Overview

### Directory Structure

```
src/engine/parsers/
├── ability-parser.ts            # Main entry point for parsing
├── pattern-matchers.ts          # Shared utilities (SINGLE SOURCE OF TRUTH)
├── static-effect-parser.ts      # Static ability delegator
├── static-patterns/             # Modular static patterns ⭐
│   ├── index.ts                 # Registry & exports
│   ├── cost-patterns.ts         # Cost modifiers
│   ├── stat-patterns.ts         # Stat modifiers
│   └── ... (others)
├── activated-parser.ts          # Activated abilities
├── triggered-parser.ts          # Trigger aggregator
└── triggered/                   # Modular trigger patterns ⭐
    ├── index.ts                 # Pattern registry (aggregates all patterns)
    ├── types.ts                 # Shared type definitions
    ├── on-play.ts               # Delegates to on-play/ subdirectory
    ├── on-play/                 # "When you play" patterns (MODULAR) ⭐
    │   ├── card-manipulation.ts # Draw, discard, return, tutor, mill, shuffle
    │   ├── control.ts           # Exert, ready, return to hand, move
    │   ├── damage.ts            # Damage, banish, heal
    │   ├── general.ts           # Conditional effects, generic on-play
    │   └── stats.ts             # Stat mods, lore gain, keyword grants
    ├── on-quest.ts              # "Whenever this character quests" patterns
    ├── combat.ts                # Challenge/banish combat patterns
    ├── turn-based.ts            # "At the start/end of turn" patterns
    ├── on-move.ts               # Movement/location patterns
    ├── action-effects.ts        # Action card effect patterns
    ├── stat-gain-pattern.ts     # Stat gain utility patterns
    └── misc.ts                  # Other triggers (large file, needs refactor)
```

### Pattern Table Model

The triggered parser uses a **pattern table architecture** - an array of pattern-handler pairs:

```typescript
export const COMBAT_PATTERNS: TriggerPattern[] = [
    {
        pattern: /^whenever you ready this character,? (.+)/i,
        handler: (match, card, text) => ({
            id: generateAbilityId(),
            type: 'triggered',
            event: GameEvent.CARD_READIED,
            effects: parseStaticEffects(match[1]),
            rawText: text
        })
    },
    // More patterns...
];
```

**Benefits:**
- ✅ Declarative and easy to read
- ✅ Patterns evaluated in order (order matters!)
- ✅ Easy to add new patterns
- ✅ Modular - patterns grouped by category

---

## Best Practices

### 1. Adding New Patterns

**Choose the right file:**
- **Static abilities** → `static-effect-parser.ts` (or create modular files)
- **Activated abilities** → `activated-parser.ts`
- **Triggered abilities** → Choose based on trigger type:

| Trigger Type | File Location |
|-------------|---------------|
| "When you play this character" | `triggered/on-play/[category].ts` |
| "Whenever this character quests" | `triggered/on-quest.ts` |
| "When challenged/banished in challenge" | `triggered/combat.ts` |
| "At the start/end of turn" | `triggered/turn-based.ts` |
| "When enters/leaves play" | `triggered/on-move.ts` |
| Other triggers | `triggered/misc.ts` |

**On-Play Module Selection:**
| Effect Category | File |
|----------------|------|
| Draw, discard, tutor, shuffle, mill | `on-play/card-manipulation.ts` |
| Damage, banish, heal | `on-play/damage.ts` |
| Exert, ready, move, return to hand | `on-play/control.ts` |
| Stat mods, lore gain, keyword grants | `on-play/stats.ts` |
| Conditionals, generic fallbacks | `on-play/general.ts` |

**Pattern specificity order:**
1. Named card patterns (e.g., "card named X")
2. Conditional patterns (e.g., "for each damaged")
3. Targeted patterns (e.g., "chosen character")
4. General patterns (e.g., "gain lore")

**Example:**
```typescript
// Add to appropriate triggered/[category].ts file
export const NEW_PATTERNS: TriggerPattern[] = [
    // Specific pattern first
    {
        pattern: /^whenever you remove damage from a character, (.+)/i,
        handler: (match, card, text) => ({
            type: 'triggered',
            event: GameEvent.CARD_HEALED,
            effects: parseStaticEffects(match[1])
        })
    }
];
```

### 2. Using Helper Utilities

**Always use shared utilities** from `pattern-matchers.ts`:

```typescript
import { 
    parseStat,              // Parse ¤, ◊, ⬡ symbols
    parseStatModification,  // Parse "+2 strength"
    parseCardType,          // Parse "character", "item", etc.
    parseTargetFilter,      // Parse target modifiers
    parseAmount             // Extract numbers
} from './pattern-matchers';

// ✅ DO: Use shared utilities
const stat = parseStat(match[3]);
const amount = parseAmount(text);

// ❌ DON'T: Duplicate regex logic
const stat = match[3] === '¤' ? 'strength' : 'lore';  // NO!
```

### 3. Composing Parsers

Parsers can call other parsers for complex effects:

```typescript
{
    pattern: /^whenever you ready this character,? (.+)/i,
    handler: (match, card, text) => {
        // ✅ Parse the effect text using another parser
        const effects = parseStaticEffects(match[1]);
        
        return {
            type: 'triggered',
            event: GameEvent.CARD_READIED,
            effects,  // Reuse parsed effects
            rawText: text
        };
    }
}
```

### 4. Documentation

**Always document:**
- Pattern intent (what card type it matches)
- Example ability text
- Any ordering requirements

```typescript
// Remove damage from character (Rapunzel)
// "Whenever you remove damage from a character, draw a card."
{
    pattern: /^whenever you remove damage from (?:a|an|this) character,? (.+)/i,
    handler: // ...
}
```

---

## Common Pitfalls

### ❌ Modifying Shared Utilities Without Tests

**Problem:** Changing `parseTargetFilter` or other utilities can break many parsers.

**Solution:** 
- Add unit tests first
- Make changes backward compatible
- Consider creating new specialized functions instead

### ❌ Not Testing Pattern Order

**Problem:** Adding a general pattern before a specific one breaks parsing.

**Solution:**
- Always add specific patterns BEFORE general patterns
- Test with multiple ability variations
- Use early returns to prevent fallthrough

### ❌ Inconsistent Return Schemas

**Problem:** Different parsers returning different structures for the same concept.

**Solution:**
- Document expected return types in types.ts
- Use TypeScript interfaces
- Review existing patterns before adding new ones

---

## Testing Strategy

### Unit Tests for Utilities

```typescript
// pattern-matchers.test.ts
describe('parseStat', () => {
    it('should parse Unicode symbols', () => {
        expect(parseStat('¤')).toBe('strength');
        expect(parseStat('◊')).toBe('lore');
        expect(parseStat('⛉')).toBe('willpower');
    });
});
```

### Integration Tests for Patterns

```typescript
// batch-tests verify end-to-end card parsing
it('should parse gain lore for each', () => {
    const card = {
        abilities: [{ 
            fullText: "Gain 1 lore for each damaged character opponents have in play." 
        }]
    };
    const abilities = parseToAbilityDefinition(card);
    expect(abilities[0].effects[0]).toMatchObject({
        type: 'gain_lore',
        amount: 1,
        per: 'damaged_opponent_character'
    });
});
```

---

## Future Improvements

### ✅ Completed: On-Play Pattern Modularization
- ~~Break `on-play.ts` into modular files~~ → Done! Refactored into:
  - `on-play/card-manipulation.ts` - Draw, discard, tutor, shuffle, mill
  - `on-play/control.ts` - Exert, ready, move, return to hand
  - `on-play/damage.ts` - Damage, banish, heal
  - `on-play/general.ts` - Conditional effects, generic on-play
  - `on-play/stats.ts` - Stat mods, lore gain, keyword grants

### Priority 1: Split Large Files
- Break `static-effect-parser.ts` (59KB) into modular files
- Break `misc.ts` (94KB) - largest file, needs modularization

### Priority 2: Pattern Validator
- Build tool to detect pattern ordering issues
- Warn when general patterns come before specific ones

### Priority 3: Documentation Generator
- Auto-generate pattern docs from code comments
- Create searchable pattern reference

---

## Quick Reference

| Task | File | Notes |
|------|------|-------|
| Add on-play draw/discard | `triggered/on-play/card-manipulation.ts` | Mill, tutor, shuffle patterns |
| Add on-play damage | `triggered/on-play/damage.ts` | Damage, banish, heal patterns |
| Add on-play control | `triggered/on-play/control.ts` | Exert, ready, move patterns |
| Add on-play stats | `triggered/on-play/stats.ts` | Stat mods, lore, keywords |
| Add on-play general | `triggered/on-play/general.ts` | Conditionals, fallbacks |
| Add quest trigger | `triggered/on-quest.ts` | "Whenever this quests" |
| Add combat trigger | `triggered/combat.ts` | Challenge/banish patterns |
| Add turn trigger | `triggered/turn-based.ts` | Start/end of turn |
| Add static effect | `static-effect-parser.ts` | "While" / passive effects |
| Add activated ability | `activated-parser.ts` | Cost → Effect abilities |
| Parse stat symbol | `pattern-matchers.ts` | `parseStat(symbol)` |
| Test pattern | `src/tests/abilities/auto/` | Batch test files |

---

## Key Takeaway

**The parser architecture is fundamentally sound.** The pattern table approach is excellent for maintainability and scalability. The critical insight is:

> **Always check specific patterns before general patterns, and use early returns to prevent pattern fallthrough.**

Following this principle will prevent 90% of parsing bugs.
