---
description: How to test the game UI in a browser
---

# Browser Testing Workflow

This workflow describes how to test the Lorai game UI in a browser. Use the test mode URLs for automated testing.

## Test Mode URLs

// turbo-all

### Quick Start (Full Auto)
Navigate directly to start a game with default decks, skipping all setup:
```
http://localhost:3000/game?test=true&autoMulligan=true
```

### With Forced Starting Hand
Test specific card scenarios by forcing cards into your starting hand:
```
http://localhost:3000/game?test=true&autoMulligan=true&startingHand=Lady - Elegant Spaniel,Tramp - Enterprising Dog
```
Cards are specified by full name, comma-separated. Cards not found in deck are skipped with a warning.

### With Mulligan Selection
Start with default decks but show mulligan screen:
```
http://localhost:3000/game?test=true
```

### Normal Flow
Full deck import flow:
```
http://localhost:3000/game
```

## Expected States After Loading

### After `?test=true&autoMulligan=true`:
- Game board is visible
- Turn 1 is active
- Player has 7 cards in hand
- Deck shows remaining cards
- No modals are visible
- "Your Turn" indicator is shown

### Key UI Elements
- **Hand**: Bottom of screen, shows player's cards
- **Play Area**: Center, where characters go
- **Ink Pile**: Left side, shows inked cards
- **End Turn Button**: Right side, ends the turn
- **Game Log**: Right sidebar, shows action history

## Testing Card Interactions

1. **Click a card in hand** → Opens CardActionMenu with options:
   - "Ink This Card" (if inkable)
   - "Play This Card" (if enough ink)

2. **Click a card in play** → Opens PlayAreaActionMenu with options:
   - "Quest" (if ready and can quest)
   - "Challenge" (if ready and valid targets exist)
   - Ability buttons (if card has activated abilities)

3. **End Turn** → Click the "Pass Turn" or "End Turn" button

## Verifying Ability Triggers

When testing specific cards:
1. Navigate to `http://localhost:3000/game?test=true&autoMulligan=true`
2. Wait for game to load
3. Check console logs for ability parsing info
4. Play cards and observe ability triggers in the Game Log
5. Watch for modals when effects require choices

## Known Button Selectors

For JavaScript automation:
- Start Game: `button:contains("Start Game")`
- End Turn: Look for button with "Pass" or "End Turn" text
- Cards in hand: Elements with card data in the hand area
- Action Menu buttons: Appear as popover near selected card

## Troubleshooting

If the page doesn't load:
1. Ensure dev server is running: `npm run dev`
2. Check for console errors
3. Verify the URL has correct query parameters

If cards don't appear:
1. Check deck files exist: `src/deck1.json`, `src/deck2.json`
2. Verify card names match entries in `allCards.json`

## Debug Mode

### Activating Debug Mode
Add `&debug=true` to any game URL to enable the debug panel:
```
http://localhost:3000/game?test=true&autoMulligan=true&debug=true
```

### Debug Panel Location
A yellow "🔧 Debug" button appears in the bottom-right corner. Click to expand the debug panel.

### Debug Panel Tabs

#### Cards Tab
Add cards to any zone for either player:
1. Select target player (You/Bot)
2. Select target zone (hand, play, inkwell, deck)
3. For play zone, toggle "Ready" checkbox for exerted cards
4. Click "Add Card" to search and select a card
5. Card is immediately added to the selected zone

#### State Tab
Manipulate game state directly:
- **Set Lore**: Enter a value and click "Set" for any player
- **Active Turn**: Switch which player's turn it is
- **Export State**: Download current game state as JSON
- **Import State**: Paste JSON to restore a saved state
- **Clear Zones**: Remove all cards from play or hands

#### Presets Tab
Load pre-built test scenarios:
- **Lady/Tramp Synergy**: Test lore bonus and Ward
- **Bodyguard Test**: Test Bodyguard challenge restrictions
- **On-Play Targeting**: Test targeting abilities
- **Quest Trigger Test**: Test quest-triggered abilities
- **Combat scenarios**: Basic combat, lethal combat
- **Near Victory**: Player at 19 lore

### Adding Custom Presets
Edit `src/debug/DebugPresets.ts` to add new presets:
```typescript
{
    id: 'my-preset',
    name: 'My Custom Preset',
    description: 'Description of what this tests',
    category: 'ability',
    setup: {
        player1: {
            hand: ['Card - Name'],
            play: [{ name: 'Card - Name', ready: true }],
            inkwell: ['Card - Name', 'Card - Name'],
            lore: 0
        },
        player2: {
            hand: [],
            play: [],
            inkwell: [],
            lore: 0
        },
        turnPlayer: 'player1'
    }
}
```

### State Export/Import for Bug Reports
1. Reproduce the bug state using the debug panel
2. Click "Export State" in the State tab
3. Include the JSON file in bug reports
4. Others can "Import State" to reproduce the exact scenario

