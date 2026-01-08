# UI Architecture

## Overview

The Lorai UI is a Next.js 14 application with React components that interface with the game engine. The UI follows a component-based architecture with clear separation between display components and game logic.

---

## Directory Structure

```
src/
├── app/
│   ├── globals.css          # Global styles (Tailwind)
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── game/
│       └── page.tsx         # Main game page (GamePage)
├── components/              # Reusable UI components
├── controllers/             # Player controller interfaces
├── types/                   # UI-specific types
└── utils/                   # Helper utilities
```

---

## Core Components

### Game Page (`src/app/game/page.tsx`)
The main game orchestrator. Responsibilities:
- Initializes game engine (`TurnManager`, `GameStateManager`)
- Manages UI state (modals, selections, current phase)
- Bridges engine state to UI components
- Handles player actions (ink, play, challenge)

**Key State:**
```typescript
// Engine integration
const [gameEngine, setGameEngine] = useState<{ turnManager, stateManager, humanController, botController }>()
const [engineState, setEngineState] = useState<GameState>()

// UI state
const [actionMenuCard, setActionMenuCard] = useState<CardInstance>()  // Card action menu
const [mulliganOpen, setMulliganOpen] = useState<boolean>()
const [deckImportModalOpen, setDeckImportModalOpen] = useState<boolean>()
```

**Test Mode:**
The game page supports URL parameters for automated testing:

```bash
# Full auto mode - skips all setup
http://localhost:3000/game?test=true&autoMulligan=true

# Debug mode - enables state manipulation panel
http://localhost:3000/game?test=true&autoMulligan=true&debug=true
```

| Parameter | Effect |
|-----------|--------|
| `test=true` | Skips deck import, loads default decks from `deck1.json`/`deck2.json` |
| `autoMulligan=true` | Skips mulligan phase, keeps all cards |
| `debug=true` | Enables the Debug Panel for state manipulation |
| `startingHand=Card1,Card2` | Forces specific cards into starting hand |

Enabled by `useSearchParams()` hook with `Suspense` wrapper for SSR compatibility.


---

### Component Categories

#### Card Display Components
| Component | Purpose |
|-----------|---------|
| `Card.tsx` | Base card rendering (image + fallback) |
| `ZoomableCard.tsx` | Wrapper with hover-to-zoom portal |
| `CardActionMenu.tsx` | Action menu for selected cards |
| `AbilityBadge.tsx` | Visual indicator for keywords (Boost, etc.) |

#### Zone Components
| Component | Purpose |
|-----------|---------|
| `PlayerHand.tsx` | Player/opponent hand display |
| `PlayArea.tsx` | Cards in play (characters) |
| `InkPile.tsx` | Inkwell display |
| `DiscardPile.tsx` | Discard pile summary |
| `GameZone.tsx` | Generic zone container |
| `ActiveEffectsPanel.tsx` | Displays temporary effects (e.g. +1 Lore) |

#### Modal Components
| Component | Purpose |
|-----------|---------|
| `MulliganModal.tsx` | Mulligan phase card selection |
| `DeckImportModal.tsx` | Deck import (text/URL) & persistent storage (tabs) |
| `DiscardPileModal.tsx` | Full discard pile view |
| `CardActionMenu.tsx` | Card action selection |
| `ChoiceModal.tsx` | Generic choice prompts |
| `CardPickerModal.tsx` | Search/filter cards from database (debug) |

#### Debug Components
| Component | Purpose |
|-----------|--------|
| `DebugPanel.tsx` | Main debug panel with Cards/State/Presets tabs |
| `CardPickerModal.tsx` | Card search modal with filters |

**Location**: `src/debug/`
| File | Purpose |
|------|---------|
| `DebugPresets.ts` | Pre-built test scenarios (9 included) |
| `StateManipulator.ts` | Programmatic state manipulation API |
| `index.ts` | Module exports |

#### State Display Components
| Component | Purpose |
|-----------|---------|
| `GameStatePanel.tsx` | Player stats (lore, deck size) |
| `TurnFlow.tsx` | Turn/phase indicator |
| `GameLog.tsx` | Action log sidebar |

---

## Component Conventions

### ZoomableCard Pattern
For consistent card hover effects, use `ZoomableCard` instead of `Card` directly:

```tsx
<ZoomableCard
    card={cardInstance}
    size="w-32 h-44"           // Fixed size
    zoomScale={2}              // Zoom multiplier
    selected={isSelected}      // Selection overlay
    onClick={handleClick}
/>
```

### Action Handlers
All game actions should go through handler functions in `page.tsx`:
- `handleInkCardAction()` - Ink a card
- `handlePlayCardAction()` - Play a card
- `handleMulligan()` - Process mulligan selection

### State Flow
```
Engine Event → engineState update → UI re-render
User Action → handler function → TurnManager method → engineState update
```

---

## Styling

- **Framework**: Tailwind CSS
- **Colors**: Slate/gray base, amber accents, color-coded actions
- **Modals**: Fixed positioning with backdrop blur
- **Cards**: Rounded corners, shadows, 5:7 aspect ratio

---

## Engine Integration

The UI connects to the game engine via:

1. **GameStateManager**: Holds authoritative game state
2. **TurnManager**: Processes game actions
3. **HumanController**: Bridges UI → engine for player actions
4. **HeuristicBot**: AI opponent

**State Sync Pattern:**
```typescript
// After any action
gameEngine.humanController.updateState(gameEngine.stateManager.state);
```

---

## File Placement Guidelines

| Type | Location |
|------|----------|
| New UI component | `src/components/` |
| Component documentation | `src/components/README.md` |
| Game page logic | `src/app/game/page.tsx` |
| UI types | `src/types/` |
| Card utilities | `src/utils/card-images.ts` |
| Deck utilities | `src/utils/deck-*.ts` |

---

## Adding New Components

1. Create component in `src/components/ComponentName.tsx`
2. Use `'use client'` directive if using React hooks
3. Import in `page.tsx` or parent component
4. Document props in `src/components/README.md`

---

*Architecture as of December 19, 2024*
