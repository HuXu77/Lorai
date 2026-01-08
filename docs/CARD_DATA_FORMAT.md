# Card Data Format

This document describes the structure of `allCards.json` and how the parser interprets card abilities.

---

## Table of Contents
- [JSON Structure](#json-structure)
- [Card Schema](#card-schema)
- [Ability Format](#ability-format)
- [Parser Interpretation](#parser-interpretation)
- [Examples](#examples)

---

## JSON Structure

The `allCards.json` file contains an array of ~2,500 Lorcana cards from the official Ravensburger API.

```json
[
  {
    "id": 23,
    "fullName": "Stitch - Rock Star",
    "name": "Stitch",
    "version": "Rock Star",
    "color": "Amber",
    "type": "Character",
    "cost": 5,
    "inkwell": true,
    "strength": 3,
    "willpower": 5,
    "lore": 3,
    "subtypes": ["Dreamborn", "Hero", "Alien"],
    "abilities": [ /* ... */ ],
    "fullText": "Shift 4...",
    "images": { /* ... */ }
  }
]
```

---

## Card Schema

### Base Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | ✅ | Unique card identifier |
| `fullName` | string | ✅ | Full card name (e.g., "Stitch - Rock Star") |
| `name` | string | ✅ | Character/item name |
| `version` | string | ❌ | Card version/subtitle |
| `color` | string | ✅ | Ink color (Amber, Amethyst, Emerald, Ruby, Sapphire, Steel) |
| `type` | string | ✅ | Card type (Character, Action, Item, Location) |
| `cost` | number | ✅ | Ink cost to play |
| `inkwell` | boolean | ✅ | Can be placed in inkwell? |

### Character/Location Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `strength` | number | ❌ | Combat damage (Characters/Locations) |
| `willpower` | number | ❌ | Health (Characters/Locations) |
| `lore` | number | ❌ | Questing value (Characters only) |
| `subtypes` | string[] | ✅ | E.g., ["Hero", "Alien", "Dreamborn"] |

### Ability Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `abilities` | AbilityRaw[] | ✅ | Array of ability objects |
| `fullText` | string | ✅ | Complete card text |
| `fullTextSections` | string[] | ❌ | Text split by sections |

### Image Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `images.full` | string | ✅ | Full card image URL |
| `images.thumbnail` | string | ❌ | Thumbnail URL |
| `images.foilMask` | string | ❌ | Foil overlay URL |

---

## Ability Format

Each card has an `abilities` array containing ability objects:

```json
{
  "abilities": [
    {
      "type": "keyword",
      "name": "Shift",
      "fullText": "Shift 4 (You may pay 4 ⬡ to play this on top of one of your characters named Stitch.)"
    },
    {
      "type": "ability",
      "name": "ADORING FANS",
      "fullText": "Whenever you play a character with cost 2 or less, you may exert them to draw a card."
    }
  ]
}
```

### AbilityRaw Structure

```typescript
interface AbilityRaw {
  type: string;      // 'keyword' | 'ability' | 'reminder' | 'flavor'
  name?: string;     // Ability name (in ALL CAPS)
  fullText: string;  // Complete ability text
}
```

### Ability Types

| Type | Description | Example |
|------|-------------|---------|
| `keyword` | Game keywords | Shift, Rush, Singer, Evasive |
| `ability` | Named abilities | ADORING FANS, SWORD IN THE STONE |
| `reminder` | Reminder text | (They can't challenge cards with Evasive.) |
| `flavor` | Flavor text | "I'm not bad, I'm just drawn that way." |

---

## Parser Interpretation

The `EffectParser` converts ability text into structured `CardEffect` objects.

### Parsing Pipeline

```
fullText: "Shift 4 (You may pay...)"
    ↓
Split by \n and clean whitespace
    ↓
"Shift 4 (You may pay...)"
    ↓
parseKeyword("Shift")
    ↓
{
  trigger: 'keyword',
  action: 'keyword_shift',
  cost: 4,
  rawText: '...'
}
```

### Pattern Matching Rules

**1. Keywords First**

Keywords are checked before other patterns:
- Shift X
- Rush
- Singer X
- Evasive
- Challenger +X
- Bodyguard
- Ward
- Resist +X
- Support

**2. Activated Abilities (⟳)**

Patterns with ⟳ symbol:
```
"[NAME] ⟳ — Draw a card"
"[NAME] ⟳, 2 ⬡ — Deal 2 damage"
```

Parsed as:
```typescript
{
  trigger: 'activated',
  action: 'draw', // or relevant action
  cost: { exert: true, ink: 0 }, // ink cost if present
  abilityName: 'NAME'
}
```

**3. On Play Triggers**

Patterns starting with "When you play this...":
```
"When you play this character, draw a card"
```

Parsed as:
```typescript
{
  trigger: 'on_play',
  action: 'draw',
  amount: 1
}
```

**4. Static Abilities**

Persistent effects:
```
"Your characters cost 1 less to play"
```

Parsed as:
```typescript
{
  trigger: 'static',
  action: 'reduce_cost',
  target: 'your_characters',
  amount: 1,
  duration: 'while_active'
}
```

**5. Conditional Effects**

Effects with conditions:
```
"If you have 3 or more cards in hand, this character can't ready"
```

Parsed as:
```typescript
{
  trigger: 'static',
  action: 'conditional_cant_ready',
  params: {
    condition: {
      type: 'hand_size_greater_than_or_equal',
      threshold: 3
    }
  }
}
```

---

## Examples

### Example 1: Simple Character

```json
{
  "id": 100,
  "fullName": "Mickey Mouse - Brave Little Tailor",
  "name": "Mickey Mouse",
  "version": "Brave Little Tailor",
  "color": "Steel",
  "type": "Character",
  "cost": 5,
  "inkwell": true,
  "strength": 4,
  "willpower": 5,
  "lore": 2,
  "subtypes": ["Hero", "Storyborn"],
  "abilities": [
    {
      "type": "keyword",
      "name": "Rush",
      "fullText": "Rush (This character can challenge the turn they're played.)"
    },
    {
      "type": "keyword",
      "name": "Challenger",
      "fullText": "Challenger +2 (While challenging, this character gets +2 ¤.)"
    }
  ]
}
```

**Parsed Effects**:
```typescript
[
  {
    trigger: 'keyword',
    action: 'keyword_rush',
    rawText: 'Rush...'
  },
  {
    trigger: 'keyword',
    action: 'keyword_challenger',
    amount: 2,
    rawText: 'Challenger +2...'
  }
]
```

### Example 2: Activated Ability

```json
{
  "fullName": "Magic Mirror",
  "abilities": [
    {
      "type": "ability",
      "name": "WHAT DO YOU SEE?",
      "fullText": "What Do You See? ⟳ — Draw a card."
    }
  ]
}
```

**Parsed Effect**:
```typescript
{
  trigger: 'activated',
  action: 'draw',
  target: 'player',
  amount: 1,
  cost: { exert: true },
  abilityName: 'What Do You See?',
  rawText: '...'
}
```

### Example 3: On Play Trigger

```json
{
  "fullName": "Flounder - Voice of Reason",
  "abilities": [
    {
      "type": "ability",
      "name": "HOLD ON",
      "fullText": "Hold On When you play this character, if you have a character named Ariel in play, draw a card."
    }
  ]
}
```

**Parsed Effect**:
```typescript
{
  trigger: 'on_play',
  action: 'draw',
  amount: 1,
  params: {
    condition: {
      type: 'character_named_in_play',
      name: 'Ariel'
    }
  },
  rawText: '...'
}
```

### Example 4: Complex Multi-Part Ability

```json
{
  "fullName": "Lady Tremaine - Sinister Socialite",
  "abilities": [
    {
      "type": "keyword",
      "name": "Boost",
      "fullText": "Boost (After questing with this character, exile the top card of your deck...)"
    }
  ]
}
```

**Parsed Effect**:
```typescript
{
  trigger: 'on_quest',
  action: 'boost',
  params: {
    boostEffect: {
      action: 'play_free_action',
      filter: { type: 'Action' }
    }
  },
  rawText: '...'
}
```

---

## Adding New Cards

### Manual Addition

1. **Get card data** from Lorcana API or official source
2. **Add to allCards.json** following the schema
3. **Rebuild** the project:
   ```bash
   npm run build
   ```
4. **Test parsing**:
   ```bash
   node dist/ability-coverage-analyzer.js
   ```

### Batch Import

For updating from a new set release:

1. Download updated `allCards.json` from API
2. Replace existing file
3. Rebuild and test:
   ```bash
   npm run build
   npm test
   ```

---

## Parser Limitations

### Current

- **Natural Language Only**: Cannot parse effects not in text form
- **Pattern-Based**: New ability patterns may require parser updates
- **English Only**: Does not support other languages

### Unknown Abilities

Run coverage analyzer to find unparsed abilities:
```bash
node dist/ability-coverage-analyzer.js
```

Output: `unknown-abilities-analysis.json`

---

## Best Practices

1. **Maintain Consistency**: Follow official card text exactly
2. **Include All Fields**: Even optional fields for completeness
3. **Test After Changes**: Run parser and tests after updating cards
4. **Document New Patterns**: Update parser docs when adding new patterns

---

## Resources

- [Architecture Guide](../ARCHITECTURE.md) - Parser design details
- [API Reference](API_REFERENCE.md) - EffectParser API
- [Contributing Guide](../CONTRIBUTING.md) - Adding new parsers
