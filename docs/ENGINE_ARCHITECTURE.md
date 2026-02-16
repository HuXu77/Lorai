# Lorcana Game Engine Architecture

## 🏗️ Architecture Overview

The Lorcana game engine follows a **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                     AI LAYER (Bot)                      │
│  - HeuristicBot: Decision-making using heuristics      │
│  - RandomBot: Random action selection                   │
│  - Evaluator: Board state evaluation                    │
└─────────────────┬───────────────────────────────────────┘
                  │ decideAction()
                  ▼
┌─────────────────────────────────────────────────────────┐
│              ACTIONS LAYER (TurnManager)                │
│  - Turn/Phase management                                │
│  - Action validation & execution                        │
│  - Rule enforcement (costs, exert, ready)               │
│  - Delegates ability execution to Executor              │
└─────────────────┬───────────────────────────────────────┘
                  │ playCard(), quest(), challenge()
                  ▼
┌─────────────────────────────────────────────────────────┐
│           ABILITIES LAYER (AbilitySystem)               │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Parser: Text → EffectAST                        │ │
│  │  - Static effects, triggered, activated          │ │
│  └──────────────────┬────────────────────────────────┘ │
│                     ▼                                   │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Executor: EffectAST → Game Actions              │ │
│  │  - 12 Family Handlers                            │ │
│  │  - 329 effect implementations                    │ │
│  │  - High coverage ✅                               │ │
│  └──────────────────┬────────────────────────────────┘ │
                     │ modify game state
                     ▼
┌─────────────────────────────────────────────────────────┐
│             SHARED UTILS (utils/ability-helpers.ts)     │
│  - Centralized ability detection logic                  │
│  - Shared constraints (Boost cost, Song eligibility)   │
│  - Used by UI, Actions, and Executor layers             │
└────────────────────┬────────────────────────────────────┘
                     │ validate & inspect
                     ▼
┌─────────────────────────────────────────────────────────┐
│              STATE LAYER (GameStateManager)             │
│  - Game state: players, turn, phase, effects           │
│  - Player state: zones (deck, hand, play, etc)         │
│  - Card instances with metadata                        │
└─────────────────────────────────────────────────────────┘
```

---

## 📚 Layer Responsibilities

### 1️⃣ **STATE LAYER** (`state.ts`, `models.ts`)

**Responsibility**: Pure data structures, no logic

**Components**:
- `GameStateManager`: Root game state container
  - Players collection
  - Turn/phase tracking
  - Active effects registry
  - Win condition tracking
  
- `PlayerState`: Individual player state
  - Zones: deck, hand, play, discard, inkwell
  - Lore counter
  - Cost reductions

**Key Point**: This layer is **passive** - it doesn't validate or enforce rules.

---

### 2️⃣ **ABILITIES LAYER** (`abilities/`)

**Responsibility**: Parse and execute card abilities

#### Sub-layers:

**A. Parser** (`parsers/`)
- Converts card text → `EffectAST` (Abstract Syntax Tree)
- Handles 2000+ unique card abilities
- Parsers organized by category:
  - `static-effect-parser.ts`: Passive buffs ("While X, Y gets...")
  - `triggered/`: Event-based abilities
    - `on-play/`: Modular "When you play" patterns (5 files)
    - `on-quest.ts`: "Whenever this character quests"
    - `combat.ts`: Challenge/banish triggers
    - `turn-based.ts`: Start/end of turn
    - `misc.ts`: Other triggers
  - `activated-parser.ts`: Exert/ink costs

**B. Executor** (`executor.ts`)
- **High coverage** of all 321 effect types
- Routes effects to 12 family handlers:
  - `CostFamilyHandler`: Pay costs
  - `DamageFamilyHandler`: Damage/heal
  - `DeckManipulationFamilyHandler`: Draw/discard/search
  - `OpponentInteractionFamilyHandler`: Opponent targets
  - `LocationFamilyHandler`: Location effects
  - `ChallengeFamilyHandler`: Combat
  - `DrawLoreFamilyHandler`: Lore gain
  - `StaticEffectFamilyHandler`: Conditional buffs
  - `PreventionFamilyHandler`: Restrictions
  - `UtilityFamilyHandler`: Queries/limits
  - `SpecializedEffectsFamilyHandler`: Edge cases
  - `ReadyExertFamilyHandler`: Ready/exert

**C. Ability System** (`ability-system.ts`)
- Manages ability lifecycle
- Event bus for triggers
- "The Bag" priority queue

**D. Event Emission** (`abilities/events.ts`)
All game actions emit events for triggered abilities:

| Event | Emission Location | Purpose |
|-------|-------------------|---------|
| `CARD_PLAYED` | `play-card-action.ts` | "When you play..." triggers |
| `CARD_QUESTED` | `quest-action.ts` | "Whenever this character quests..." |
| `CARD_CHALLENGED` | `challenge.ts` | "When challenged..." triggers |
| `CARD_BANISHED` | `banishment.ts` | "When banished..." triggers |
| `CARD_INKED` | `ink-action.ts` | "Whenever you ink..." triggers |
| `CARD_SINGS_SONG` | `sing-song.ts` | "Whenever a character sings..." |
| `CARD_DRAWN` | `draw-phase.ts` | "Whenever you draw..." triggers |
| `CARD_EXERTED` | `quest-action.ts`, `challenge.ts` | "Whenever exerted..." triggers |
| `CARD_READIED` | `ready-phase.ts` | "When this character readies..." |
| `CARD_DISCARDED` | `executor.ts` | "Whenever you discard..." |
| `TURN_START` | `set-phase.ts` | "At the start of your turn..." |
| `TURN_END` | `actions.ts` | "At the end of your turn..." |
| `LORE_GAINED` | `quest-action.ts` | "Whenever you gain lore..." |

**Pattern**: Events use **fire-and-forget** (`.catch()`) to preserve sync behavior. Only events requiring immediate user choices (like target selection) use `await`.

**Key Point**: This layer **interprets** abilities but delegates **validation** to Actions layer.

---

### 3️⃣ **ACTIONS LAYER** (`actions.ts` - TurnManager)

**Responsibility**: Game rules enforcement and action validation

**Structure**:
- `actions.ts`: Orchestrator class (~5,354 lines, actively being modularized)

**Modular Components** (extracted for maintainability):

#### `phases/` - Turn Phase Handlers
- `ready-phase.ts`: Ready Phase (ability reset, card readying)
- `set-phase.ts`: Set Phase (start-of-turn events and effects)
- `draw-phase.ts`: Draw Phase (draw logic, deck-out handling)

#### `game-actions/` - Player Action Handlers
- `ink-action.ts`: Move card from hand to inkwell
- `quest-action.ts`: Quest with character (lore, Support, on_quest triggers)
- `move-action.ts`: Move character to location (checks move cost, willpower)
- `play-card-action.ts`: Play card from hand
- `use-ability.ts`: Activated abilities
- `sing-song.ts`: Sing songs with characters

#### `combat/` - Combat System
- `challenge.ts`: Challenge execution (validation, damage, keywords)
- `banishment.ts`: Banishment logic (damage check, discard, triggers)

#### Core Actions:
- `playCard()`: Playing cards, shifting, singing
- `quest()`: Delegates to `game-actions/quest-action.ts`
- `challenge()`: Delegates to `combat/challenge.ts`
- `useAbility()`: Activated/start-of-turn abilities
- `singSong()`: Validates singer requirements
- `inkCard()`: Delegates to `game-actions/ink-action.ts`

#### Validations:
- **Cost checking**: Can player afford the card?
- **Exert requirements**: Is card ready?
- **Target validity**: Can this card challenge that card?
- **One-per-turn rules**: Already inked this turn?
- **Phase restrictions**: Can only ink in main phase

#### **CRITICAL**: This is where the infinite loop protection should be!

**Current Issue**: `useAbility()` doesn't check:
1. If ability has activation cost
2. If player can pay cost
3. Turn action limits

---

### 4️⃣ **AI LAYER** (`ai/`)

**Responsibility**: Decision-making

**Components**:
- `HeuristicBot`: Scores actions based on:
  - Board advantage
  - Lore progress
  - Card advantage
  - Threat assessment
  
- `Evaluator`: State scoring
- `ActionGenerator`: Generate valid actions

**Current Issue**: Bot keeps choosing `UseAbility` because:
1. It's always "valid" (no cost check)
2. It scores reasonably high (30+ points)
3. No turn limit prevents infinite loops

---

## 🐛 Root Cause of Infinite Loop

### The Problem:

```typescript
// In TurnManager.useAbility():
useAbility(player, cardId, abilityIndex) {
    const card = player.play.find(c => c.instanceId === cardId);
    
    // ⚠️ NO COST VALIDATION!
    // ⚠️ NO EXERT CHECK!
    // ⚠️ NO TURN LIMIT!
    
    // Just executes the ability
    this.abilitySystem.execute(card.abilities[abilityIndex]);
    return true; // Always succeeds
}
```

### The Flow:
1. **Bot** evaluates actions
2. Sees `UseAbility` on Elsa (ability 0)
3. Scores ~30 points (reasonable)
4. **TurnManager** executes without validation
5. **Executor** runs the effect (works correctly)
6. **Bot** evaluates again...
7. `UseAbility` still available (no cost check!)
8. **LOOP** ♻️

---

## 🔧 Solutions (Ordered by Scope)

### Option 1: **Fix TurnManager.useAbility()** (Proper fix)
**Location**: `actions.ts`
**Scope**: ~30 lines
**Responsibility**: Actions layer should validate

Add checks:
```typescript
useAbility(player, cardId, abilityIndex) {
    const card = player.play.find(...);
    const ability = card.abilities[abilityIndex];
    
    // Check activation cost
    if (ability.cost?.exert && !card.ready) return false;
    if (ability.cost?.ink && !canPayInk(player, ability.cost.ink)) return false;
    
    // Execute
    this.abilitySystem.execute(ability);
    
    // Apply cost
    if (ability.cost?.exert) card.ready = false;
    if (ability.cost?.ink) exertInk(player, ability.cost.ink);
    
    return true;
}
```

### Option 2: **Add turn action limit** (Quick fix)
**Location**: `actions.ts` or `run-simulation.ts`
**Scope**: ~5 lines
**Responsibility**: Prevent runaway loops

```typescript
// In TurnManager or simulation
const MAX_ACTIONS_PER_TURN = 100;
let actionsThisTurn = 0;

// Before each action
if (++actionsThisTurn > MAX_ACTIONS_PER_TURN) {
    passTurn();
}
```

### Option 3: **Fix Bot heuristics** (Band-aid)
**Location**: `heuristic-bot.ts`
**Scope**: ~10 lines
**Responsibility**: AI should recognize futile actions

Heavily penalize repeating same action.

---

## 💡 **Recommended Approach**

**Do both Option 1 + Option 2**:

1. **Option 1**: Proper fix in Actions layer (correct responsibility)
2. **Option 2**: Safety net to prevent any infinite loops

This follows the architecture:
- **Actions layer** enforces rules ✅
- **Safety limit** protects simulation integrity ✅

---

## 📊 Current Coverage Status

- **Parser**: Extensively tested (317/317 core tests) ✅
- **Executor**: High coverage of all 329 effect types ✅
- **Actions**: Modularized & Tested ✅
- **AI**: Functional but needs loop detection

**Next Priority**: Complete Actions layer validation and expand regression tests for edge cases.
