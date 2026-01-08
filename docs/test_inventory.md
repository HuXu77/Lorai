# Test Inventory

This document lists all test files in the `src/tests/parser` directory and the specific patterns they cover.

## Core Parser Tests
| File | Coverage |
|------|----------|
| `batch6-keywords.test.ts` | Keyword parsing (Rush, Evasive, Ward, etc.) |
| `batch7-activated.test.ts` | Basic activated abilities (Cost — Effect) |
| `batch8-simple-actions.test.ts` | Simple actions (Draw, Damage, Heal, Banish) |
| `batch9-static.test.ts` | Basic static abilities (Stat buffs, Cost reduction) |
| `batch10-triggered.test.ts` | Basic triggered abilities (When/Whenever X, do Y) |

## Complex Ability Tests
| File | Coverage |
|------|----------|
| `batch11-activated-temp.test.ts` | Complex activated abilities, temporary effects |
| `batch12-complex-triggers.test.ts` | Triggers with conditions, multiple effects |
| `batch13-conditionals.test.ts` | "If you have X", "If you played Y" conditions |
| `batch20-static-complex.test.ts` | Complex static abilities, conditional buffs |
| `batch21-conditional-activated.test.ts` | Activated abilities with conditions |

## Specific Pattern Batches
| File | Coverage |
|------|----------|
| `batch23-more-triggers.test.ts` | "Whenever quests", "Whenever play floodborn" |
| `batch24-quest-items.test.ts` | "Whenever quests", "Banish this item" cost |
| `batch25-remaining.test.ts` | "Look at top cards", "Move damage", "During your turn" |
| `batch26-unless-inkwell.test.ts` | "Unless" conditions, "Put into inkwell" |
| `batch27-cant-ready-locations.test.ts` | "Can't ready", "While here" location abilities |
| `batch28-search-location-damage.test.ts` | "Search deck", "Remove damage from location" |
| `batch29-opponent-choice-move.test.ts` | "Opponent chooses", "Move to location" |
| `batch30-complex-locations-conditions.test.ts` | "While here" conditions, "Conditional play" |
| `batch31-conditional-effects-triggers.test.ts` | "Conditional heal", "Global banish" |
| `batch32-while-global.test.ts` | "While no cards in hand", "While exerted", Global effects |
| `batch33-look-move-discard.test.ts` | "Look and move", "Play from discard" |
| `batch34-reveal-heal-each.test.ts` | "Reveal top cards", "Heal each", "Opponent exerts" |
| `batch35-opponent-discard-damaged.test.ts` | "Each opponent discards", "Damaged filter", "Pay ink" |
| `batch36-remaining-patterns.test.ts` | "Move damage", "Can't ready", "Put chosen into inkwell" |
| `batch37-conditional-play.test.ts` | "Shift", "Conditional play", "Opponent can't play actions" |
| `batch38-while-count-return.test.ts` | "While named character in play", "Count and debuff", "Return from discard" |

## Phase & Diagnostic Tests
| File | Coverage |
|------|----------|
| `phase1-chosen-character.test.ts` | Targeting "chosen character" variations |
| `phase1-while-conditions.test.ts` | "While" condition variations |
| `phase2-conditional-effects.test.ts` | Conditional effect logic |
| `phase2-discard-manipulation.test.ts` | Discard pile interactions |
| `diagnostic-pattern-matching.test.ts` | Diagnostic tests for pattern matching logic |
