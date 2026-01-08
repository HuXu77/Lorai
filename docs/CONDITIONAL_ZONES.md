# Conditional Zone Rendering

## Overview
Item and Location zones now only appear when they contain cards. This saves significant vertical space for decks that don't use these card types.

## Implementation
```typescript
// Only render if either zone has cards
{(mockPlayerLocations.length > 0 || mockPlayerItems.length > 0) && (
    <div className="grid grid-cols-2 gap-2">
        {mockPlayerLocations.length > 0 && <GameZone cards={mockPlayerLocations} label="🏰 Your Locations" />}
        {mockPlayerItems.length > 0 && <GameZone cards={mockPlayerItems} label="🎯 Your Items" />}
    </div>
)}
```

## Behavior
- **Empty zones**: Completely hidden, no wasted space
- **Single zone**: Shows only that zone (no grid, full width possible)
- **Both zones**: Shows both in 2-column grid layout

## Backend Integration
When you integrate your game state, the zones will automatically show/hide based on card presence:

```typescript
// In your game state rendering
{(playerLocations.length > 0 || playerItems.length > 0) && (
    <div className="grid grid-cols-2 gap-2">
        {playerLocations.length > 0 && <GameZone cards={playerLocations} label="🏰 Your Locations" />}
        {playerItems.length > 0 && <GameZone cards={playerItems} label="🎯 Your Items" />}
    </div>
)}
```

This applies to both player and opponent zones.
