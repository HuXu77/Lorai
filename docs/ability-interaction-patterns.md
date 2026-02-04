# Ability Interaction Patterns Reference Guide

This document defines the 7 interaction patterns used for UI testing of card abilities in Lorcana.

## Overview

Instead of testing 400+ individual abilities, we categorize them by **how they interact with the player**. Each pattern has:
- **Engine Integration Tests**: Verify the engine emits correct `ChoiceRequest` objects
- **E2E Tests**: Verify the UI correctly displays and handles the prompts

## Pattern Categories

### Category 1: No Interaction Required
**Description**: Automatic effects that execute without player input.

**Examples**:
- "When you play this character, draw a card"
- "This character gets +1 Strength"
- "When this character quests, gain 1 lore"

**UI Behavior**: No prompt, effect executes automatically

**Test Coverage**:
- Integration: Verify NO choice request is emitted
- E2E: Not needed (no UI interaction)

---

### Category 2: Optional Prompts (Yes/No)
**Description**: Effects with "you may..." that require player confirmation.

**Examples**:
- "When you play this character, you may draw a card"
- "You may deal 2 damage to chosen character"
- "You may banish chosen item"

**UI Behavior**: Yes/No modal with ability context

**Test Coverage**:
- Integration: Verify choice request with `type: 'yes_no'` or `type: 'confirm'`
- E2E: Test modal display, Yes/No buttons, effect execution

**Test Cards**:
- `Elsa - Exploring the Unknown`: "When you play this character, you may draw a card"
- `Maleficent - Sorceress`: "When you play this character, you may draw a card"
- `Stitch - Team Underdog`: "When you play this character, you may deal 2 damage to chosen character"

---

### Category 3: Single Target Selection
**Description**: Effects requiring selection of one target (character, item, location).

**Examples**:
- "Deal 2 damage to chosen character"
- "Return chosen character to their player's hand"
- "Banish chosen item"

**UI Behavior**: Highlight valid targets, gray out invalid ones (Ward, etc.)

**Test Coverage**:
- Integration: Verify choice request with target options
- E2E: Test target highlighting, invalid target prevention, selection confirmation

**Test Cards**:
- `Stitch - Team Underdog`: Requires choosing a character for damage
- `Dragon Fire`: "Banish chosen character"

---

### Category 4: Multiple Target Selection
**Description**: Effects allowing selection of multiple targets ("choose up to X").

**Examples**:
- "Choose up to 2 characters"
- "Choose 3 cards from your hand to discard"

**UI Behavior**: Multi-select UI with count display (e.g., "2/3 selected")

**Test Coverage**:
- Integration: Verify choice request with `min`/`max` fields
- E2E: Test multi-select, count enforcement, confirm button state

---

### Category 5: Choice Between Options (Modal Choices)
**Description**: "Choose one:" effects presenting multiple distinct options.

**Examples**:
- "Choose one: • Draw a card • Deal 2 damage to chosen character"
- "Choose one: • Gain 2 lore • Ready this character"

**UI Behavior**: Modal with radio buttons or option cards

**Test Coverage**:
- Integration: Verify `type: 'modal_choice'` with all options
- E2E: Test option display, selection, execution of chosen effect only

---

### Category 6: Conditional Prompts
**Description**: Prompts that only appear when a condition is met.

**Examples**:
- "If you have a Princess character, you may draw a card"
- "If this character is exerted, you may ready them"

**UI Behavior**: Prompt appears only when condition is true

**Test Coverage**:
- Integration: Verify choice request emitted only when condition met
- E2E: Test both scenarios (condition met vs not met)

---

### Category 7: Cascading Choices
**Description**: Abilities requiring multiple sequential decisions.

**Examples**:
- "You may draw a card, then choose and discard a card"
- "Choose a character. If you do, deal 2 damage to another chosen character"
- "If you removed damage this way, you may draw a card"

**UI Behavior**: Sequential prompts, each appearing after the previous completes

**Test Coverage**:
- Integration: Verify multiple choice requests in sequence
- E2E: Test prompt order, conditional cascading, abort on decline

---

## Testing Strategy

### 1. Engine Integration Tests
**Location**: `src/tests/integration/choice-system-contract.test.ts`

**Purpose**: Verify the engine emits correct `ChoiceRequest` objects with all required fields.

**What We Test**:
- ✅ Choice requests have required fields (`id`, `playerId`, `type`, `prompt`)
- ✅ Options have valid IDs that can be sent back
- ✅ Source information is included for context
- ✅ Each pattern emits the expected choice request type

**Results**: 13/13 tests passing ✅

### 2. E2E Tests
**Location**: `src/tests/e2e/ability-prompts/`

**Purpose**: Verify the UI correctly displays prompts and handles user interactions.

**Test Files**:
- `optional-prompts.spec.ts` - 4 tests
- `single-target.spec.ts` - 4 tests
- `multi-target.spec.ts` - 3 tests
- `modal-choices.spec.ts` - 3 tests
- `conditional-prompts.spec.ts` - 3 tests
- `cascading-choices.spec.ts` - 4 tests

**Total**: 21 E2E tests covering all interaction patterns

---

## Benefits of Pattern-Based Testing

✅ **Comprehensive**: Covers all ability interaction types  
✅ **Efficient**: 34 tests instead of 400+  
✅ **Fast**: Engine tests run in milliseconds  
✅ **Maintainable**: Update pattern tests, not individual abilities  
✅ **Scalable**: New abilities automatically covered if they match existing patterns  
✅ **Documented**: Clear reference for designers and developers  

---

## Adding New Abilities

When adding a new ability:

1. **Identify the interaction pattern** (Categories 1-7)
2. **Verify engine behavior** with integration tests
3. **If it's a new pattern**, add new test categories
4. **Document the pattern** in this guide

---

## Implementation Status

- ✅ **Phase 1**: Engine investigation complete
- ✅ **Phase 2**: Integration tests complete (13/13 passing)
- ✅ **Phase 3**: E2E test files created (21 tests, placeholders)
- 🔄 **Phase 4**: Documentation in progress

---

## Future Work

- Implement actual E2E test logic (currently placeholders)
- Add devtools support for setting up game states
- Create visual regression tests for modals
- Add accessibility tests for prompts
