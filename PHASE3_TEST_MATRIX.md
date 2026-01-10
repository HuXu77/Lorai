# Phase 3: Card Smoke Test Matrix

## Complex Cards Requiring Multi-Modal Testing

### Priority 1: Cards with Chained Prompts

| Card Name | Ability | Expected Flow | Status |
|-----------|---------|---------------|--------|
| The Queen - Commanding Presence | WHO IS THE FAIREST? When quests: chosen opponent char -4◆, chosen char +4◆ | Quest → Modal 1 (choose opponent) → Modal 2 (choose yours) | 🔲 |
| Daisy Duck - Donald's Date | BIG PRIZE: When quests, opponent reveals top deck. If character, may put in hand | Quest → Reveal Modal → Decision Modal | 🔲 |
| Mowgli - Man Cub | BARE NECESSITIES: When play, opponent reveals hand and discards non-char | Play → Reveal Hand → Choose to Discard | 🔲 |
| Lady - Miss Park Avenue | SOMETHING WONDERFUL: When play, return up to 2 chars cost≤2 from discard | Play → Choose Cards Modal (multi-select) | ✅ |

### Priority 2: Cards with Conditional Effects

| Card Name | Ability | Expected Flow | Status |
|-----------|---------|---------------|--------|
| Stitch - Rock Star | If shifted, play cost≤3 char free | Shift → Check condition → Play Free Modal | 🔲 |
| Merlin - Self-Appointed Mentor | Reveal top. If char, put in hand | Play → Reveal → Auto-resolve or choice | 🔲 |
| Bruno Madrigal | Name a card, reveal top. If match: hand+lore | Play → Name Modal → Reveal → Result | 🔲 |

### Priority 3: Cards with Optional Effects

| Card Name | Ability | Expected Flow | Status |
|-----------|---------|---------------|--------|
| Bodyguard characters | May enter exerted | Play → Yes/No Modal | ✅ |
| Cards with "you may" | Optional triggers | Play → Optional Modal | 🔲 |

---

## Visual Verification Checklist

For each card test, verify:
- [ ] Modal title is clear and readable
- [ ] Card images display correctly (not text fallback)
- [ ] Selectable options are visually distinct
- [ ] Invalid options are grayed out
- [ ] Selection feedback is visible
- [ ] Confirm/Cancel buttons work

---

## Bugs Found

| Card | Issue | Severity | Fixed |
|------|-------|----------|-------|
| (none yet) | | | |

---

## Test Progress

- Total Priority 1 Cards: 4
- Tested: 1 (Lady)
- Remaining: 3
