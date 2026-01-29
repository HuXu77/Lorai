# Card Verification Tracking

This file tracks which cards have been verified to work correctly with proper modals and functionality.

## Status Legend
- ✅ **Verified** - Tested and working correctly
- ⚠️ **Partial** - Some functionality works, issues remain
- ❌ **Broken** - Not working correctly
- 🔲 **Untested** - Not yet verified

---

## Verified Cards (✅)

### Characters
| Card Name | Abilities | Modals | Notes | Test File |
|-----------|-----------|--------|-------|-----------|
| Lady - Miss Park Avenue | on_play return | ✅ | Fixed shift trigger | `lady-shift.test.ts` |
| Mowgli - Man Cub | reveal_hand | ✅ | Shows opponent hand | N/A |

### Actions  
| Card Name | Effects | Modals | Notes | Test File |
|-----------|---------|--------|-------|-----------|
| (none verified yet) | | | | |

### Items
| Card Name | Effects | Modals | Notes | Test File |
|-----------|---------|--------|-------|-----------|
| (none verified yet) | | | | |

---

## Known Issues (❌ / ⚠️)

| Card Name | Issue | Status | Priority |
|-----------|-------|--------|----------|
| (none currently tracked) | | | |

---

## Cards Requiring Multi-Modal Testing

These cards have complex decision trees requiring multiple choices:

| Card Name | Type | Decision Flow | Test File |
|-----------|------|---------------|-----------|
| Daisy Duck - Donald's Date | Character | reveal → decide | N/A |
| The Queen - Commanding Presence | Character | target → effect | N/A |
| Lucifer | Character | choice A or B | N/A |

---

## Effect Types Coverage

| Effect Type | Has Unit Test | Has Integration Test |
|-------------|---------------|---------------------|
| draw_card | ❌ | ❌ |
| damage | ❌ | ❌ |
| heal | ❌ | ❌ |
| banish | ❌ | ❌ |
| return_from_discard | ❌ | ✅ `lady-shift.test.ts` |
| opponent_reveal_and_discard | ✅ | ✅ `modal-card-rendering.test.ts` |
| choose_and_discard | ❌ | ❌ |
| modify_stats | ❌ | ❌ |
| grant_keyword | ❌ | ❌ |
| scry | ❌ | ❌ |
| ramp | ❌ | ❌ |

---

## Testing Progress

| Phase | Status | Coverage |
|-------|--------|----------|
| Phase 1: Parser Snapshots | ✅ Complete | 100% cards parse |
| Phase 2: Effect Unit Tests | 🔄 In Progress | 2/20+ effect types |
| Phase 3: Card Smoke Tests | 🔲 Not Started | 0% |
| Phase 4: UI Rendering | 🔲 Not Started | 0% |

---

## How to Add Verified Cards

1. Test the card manually or via automated test
2. Add entry to appropriate table above
3. Link test file if applicable
4. Update effect coverage table if new effect tested
