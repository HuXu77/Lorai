# UI Components

## Overview

This directory contains all React components for the Lorai game UI. Components are organized by function.

---

## Card Display

### `Card.tsx`
Base card rendering with image integration.
```tsx
<Card card={cardInstance} isExerted={false} variant="full" />
```

### `ZoomableCard.tsx`
Wrapper for cards with portal-based hover zoom.
```tsx
<ZoomableCard card={card} size="w-32 h-44" zoomScale={2} selected={false} />
```

### `CardActionMenu.tsx`
Modal showing available actions for a selected card.
```tsx
<CardActionMenu
    card={card}
    hasInkedThisTurn={false}
    availableInk={3}
    isYourTurn={true}
    onInk={handleInk}
    onPlay={handlePlay}
    onCancel={handleCancel}
/>
```

---

## Zone Components

### `PlayerHand.tsx`
Displays player or opponent hand with hover effects.
```tsx
<PlayerHand cards={hand} onCardClick={handleClick} isOpponent={false} />
```

### `PlayArea.tsx`
Grid display for characters in play.
```tsx
<PlayArea cards={characters} onCardClick={handleClick} />
```

### `InkPile.tsx`
Inkwell display showing ready/exerted ink.
```tsx
<InkPile cards={inkwell} label="Your Ink" />
```

### `DiscardPile.tsx`
Compact discard pile summary with click to expand.
```tsx
<DiscardPile cards={discard} label="Discard" onClick={openModal} />
```

### `GameZone.tsx`
Generic zone container for locations/items.
```tsx
<GameZone cards={locations} label="Locations" />
```

---

## Modals

### `MulliganModal.tsx`
Mulligan phase card selection.
```tsx
<MulliganModal isOpen={true} hand={hand} onConfirm={handleConfirm} />
```

### `DeckImportModal.tsx`
Deck import via text or Dreamborn URL.
```tsx
<DeckImportModal isOpen={true} onImport={handleImport} onClose={close} />
```

### `DiscardPileModal.tsx`
Full discard pile view with zoom.
```tsx
<DiscardPileModal cards={discard} label="Your Discard" isOpen={true} onClose={close} />
```

### `ChoiceModal.tsx`
Generic choice prompt modal.

### `ModalChoice.tsx`
Choice card within choice modals.

---

## State Display

### `GameStatePanel.tsx`
Player stats (lore, deck size).
```tsx
<GameStatePanel playerName="You" lore={5} deckSize={40} isActive={true} />
```

### `TurnFlow.tsx`
Turn and phase indicator.
```tsx
<TurnFlow currentTurn={1} currentPhase="MAIN" isYourTurn={true} onEndTurn={end} />
```

### `GameLog.tsx`
Collapsible action log sidebar.
```tsx
<GameLog entries={logEntries} onClear={clear} isOpen={true} onToggle={toggle} />
```

### `LogEntry.tsx`
Individual log entry rendering.

---

## Choice Components

### `PlayerChoiceHandler.tsx`
Central router for all player choices. Routes ChoiceTypes to appropriate UI:
- **Modal choices** → `ModalChoice`
- **Card targeting** → `CardSelectionChoice`  
- **Damage distribution** → `DistributeDamageChoice`
- **Scry/rearrange** → `ScryChoice`

### `CardSelectionChoice.tsx`
Card selection interface for targeting abilities. Supports:
- Character/Item/Location targeting
- Hand and discard selection
- Zone-based filtering

### `DistributeDamageChoice.tsx`
UI for distributing damage across multiple targets.

### `ScryChoice.tsx`
Drag-and-drop interface for scry and card rearrangement.

### `ModalChoice.tsx`
Yes/No prompts and multi-option ability choices.

---

## Image Utilities

See `src/utils/card-images.ts`:
- `getCardImagePath(card, variant)` - Get local image path
- `preloadCardImages(cards)` - Preload images
- `cardImageExists(card)` - Check existence

---

## Adding New Components

1. Create `ComponentName.tsx` in this directory
2. Add `'use client'` directive if using hooks
3. Export from component file
4. Document above with usage example
5. Import in `src/app/game/page.tsx`

---

*Updated December 19, 2024*
