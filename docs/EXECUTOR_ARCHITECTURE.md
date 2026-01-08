# Effect Executor Architecture

## Overview

The Effect Executor is the core engine component responsible for executing all card abilities and effects in the Lorcana game. It uses a **Family Handler** architecture to organize effects into logical groups, promoting code reuse and maintainability.

## Architecture Pattern

```
┌──────────────────┐
│ Effect AST Input │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Effect Executor  │ ◄── Routes effects to appropriate handlers
└────────┬─────────┘
         │
         ├──►┌──────────────────────┐
         │   │ Cost Family Handler  │ (ink, banish costs, etc.)
         │   └──────────────────────┘
         │
         ├──►┌──────────────────────────┐
         │   │ Damage Family Handler    │ (damage, healing)
         │   └──────────────────────────┘
         │
         ├──►┌──────────────────────────────┐
         │   │ Deck Manipulation Handler    │ (draw, discard, scry, inkwell)
         │   └──────────────────────────────┘
         │
         └──► ... (10+ family handlers)
```

## Family Handlers

### Implemented Handlers

#### 1. **CostFamilyHandler**
- **Responsibilities**: Pay costs, check if actions can be afforded
- **Effects**: `pay_ink`, `banish_cost`, `exert_cost`
- **Location**: `src/engine/abilities/families/cost-family.ts`

####2. **DamageFamilyHandler**  
- **Responsibilities**: Deal damage, heal, modify health
- **Effects**: `deal_damage`, `heal`, `damage_all`, `deal_damage_to_player`
- **Location**: `src/engine/abilities/families/damage-family.ts`

#### 3. **ReadyExertFamilyHandler**
- **Responsibilities**: Ready/exert cards, modify ready state
- **Effects**: `exert`, `ready`, `exert_all`, `ready_all`
- **Location**: `src/engine/abilities/families/ready-exert-family.ts`

#### 4. **DeckManipulationFamilyHandler**
- **Responsibilities**: Draw, discard, search, scry, inkwell operations
- **Effects**: `draw`, `discard`, `search_deck`, `look_and_distribute`, `all_inkwell`, `hand_to_inkwell_all`
- **Location**: `src/engine/abilities/families/deck-manipulation-family.ts`
- **Batches**: 2, 5, 7, 11, 13

#### 5. **OpponentInteractionFamilyHandler**
- **Responsibilities**: Effects that target or force opponent actions
- **Effects**: `opponent_discard`, `opponent_choice_banish`, `opponent_choice_damage`, `opponent_pay_to_banish_self`
- **Location**: `src/engine/abilities/families/opponent-interaction-family.ts`
- **Batches**: 4, 15

#### 6. **LocationFamilyHandler**
- **Responsibilities**: Location-based movement and effects
- **Effects**: `move_to_location`, `move_characters`, `location_buff`
- **Location**: `src/engine/abilities/families/location-family.ts`
- **Batch**: 8

#### 7. **ChallengeFamilyHandler**
- **Responsibilities**: Challenge/combat mechanics
- **Effects**: `challenge_banish_both`, `challenge_damage_all_damaged`, `damage_on_being_challenged`
- **Location**: `src/engine/abilities/families/challenge-family.ts`
- **Batch**: 9

#### 8. **DrawLoreFamilyHandler**
- **Responsibilities**: Draw, lore gain, quest mechanics
- **Effects**: `gain_lore_when_damaged`, `draw_when_damaged`, `quest_debuff_chosen`
- **Location**: `src/engine/abilities/families/draw-lore-family.ts`
- **Batch**: 10

#### 9. **StaticEffectFamilyHandler**
- **Responsibilities**: Passive conditional buffs and stat modifications
- **Effects**: `conditional_buff_subtype_in_play`, `stat_buff_per_damage`, `singing_power_buff`
- **Location**: `src/engine/abilities/families/static-effect-family.ts`
- **Batch**: 12

#### 10. **PreventionFamilyHandler** ⭐ Optimization Example
- **Responsibilities**: All prevention/restriction mechanics (consolidated)
- **Effects**: `prevent_discard`, `prevent_play`, `prevent_ability_use`, `prevent_lore_at_location`
- **Location**: `src/engine/abilities/families/prevention-family.ts`
- **Batch**: 14
- **Optimization**: Single unified handler instead of 9 separate implementations

## Effect Routing

Effects are routed to handlers via a large switch statement in `EffectExecutor.execute()`:

```typescript
async execute(effect: EffectAST, context: GameContext) {
    switch (effect.type) {
        // Cost effects → Cost Handler
        case 'pay_ink':
        case 'banish_cost':
            return this.familyHandlers.get('cost').execute(effect, context);
        
        // Damage effects → Damage Handler
        case 'deal_damage':
        case 'heal':
            return this.familyHandlers.get('damage').execute(effect, context);
        
        // ... etc
    }
}

        // ... etc
    }
}
```

## Keyword Handling

Unlike standard effects, Keyword effects (like `Boost`) are often handled directly within `EffectExecutor` via dedicated methods (e.g., `executeKeyword`) or delegated to `executePutCardUnder` to ensure consistent application of complex keyword rules without requiring a full family handler.


## Handler Initialization

All handlers are initialized in the `EffectExecutor` constructor:

```typescript
constructor(turnManager) {
    this.familyHandlers.set('cost', new CostFamilyHandler(turnManager));
    this.familyHandlers.set('damage', new DamageFamilyHandler(turnManager));
    // ... all other handlers
}
```

## Adding a New Handler

1. **Create handler file** in `src/engine/abilities/families/`
2. **Extend `BaseFamilyHandler`**
3. **Implement `execute()` method** with effect-specific logic
4. **Initialize in executor** constructor
5. **Add routing** in executor's switch statement
6. **Update this documentation**

Example:

```typescript
// src/engine/abilities/families/my-new-family.ts
import { BaseFamilyHandler } from './base-family-handler';

export class MyNewFamilyHandler extends BaseFamilyHandler {
    async execute(effect: any, context: GameContext) {
        switch (effect.type) {
            case 'my_effect':
                // Implementation
                break;
        }
    }
}
```

## Coverage Statistics

- **Total Effect Types**: 321
- **Handled Effects**: ~287 (89%)
- **Family Handlers**: 10
- **Batches Completed**: 15

## Design Principles

1. **Single Responsibility**: Each handler manages one logical group of effects
2. **Code Reuse**: Related effects share logic within handlers
3. **Consolidation**: Similar effects are unified (e.g., Prevention handler)
4. **Extensibility**: Easy to add new handlers or extend existing ones
5. **Testability**: Each handler can be tested independently

## Future Optimizations

- Consider merging very small handlers into related larger ones
- Extract common patterns (e.g., target resolution) into shared utilities
- Implement handler dependencies/composition for complex effects

---

**Last Updated**: Batch 15 (Advanced Opponent Interactions)  
**Maintainer**: Effect Executor Team
