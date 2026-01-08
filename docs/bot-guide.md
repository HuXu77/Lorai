# Lorai Bot & Simulation Guide 🤖

This guide explains how to use the AI bots, load custom decks, and run simulations in Lorai.

## 1. Bot Simulator

The `BotSimulator` allows you to run automated games between two bots. This is useful for testing deck performance, verifying game rules, and benchmarking bot logic.

### Usage

Run the simulator using `ts-node`:

```bash
npx ts-node src/scripts/bot-sim.ts [deck1_path] [deck2_path]
```

- **No Arguments**: Runs a mirror match with random dummy decks (mostly for engine stress testing).
- **One Argument**: Player 1 uses the provided deck, Player 2 uses a random dummy deck.
- **Two Arguments**: Player 1 uses `deck1`, Player 2 uses `deck2`.

### Example

```bash
# Run a mirror match with the Starter Deck
npx ts-node src/scripts/bot-sim.ts src/tests/decks/starter-amber-amethyst.json src/tests/decks/starter-amber-amethyst.json
```

## 2. Deck Formats

Lorai supports two deck formats: **JSON** and **Dreamborn.ink (Text)**.

### JSON Format
A simple JSON object with a `cards` array containing card names.

```json
{
  "cards": [
    "Ariel - On Human Legs",
    "Ariel - On Human Legs",
    "Ursula - Deceiver",
    ...
  ]
}
```

### Dreamborn.ink (Text) Format
A plain text list compatible with Dreamborn.ink exports. Format is `Quantity Card Name`. You can use `.txt` or `.deck` extensions.

```text
3 Madam Mim - Elephant
2 Go Go Tomago - Darting Dynamo
4 Genie - Wish Fulfilled
...
```

**Note**: Card names must match exactly with the names in `allCards.json`. Punctuation matters (e.g., "Control Your Temper!").

## 3. Bot Types

- **`HeuristicBot`**: A competitive bot that uses heuristics to evaluate game state and make intelligent decisions (Inking, Questing, Challenging).
- **`RandomBot`**: A baseline bot that makes random valid moves.
- **`PersistentRandomBot`**: A version of RandomBot that refuses to concede, forcing the game to play out (used for training/benchmarking).

## 4. Running Tests

To verify the engine and bots:

```bash
# Run all tests
npm test

# Run specific bot scenario tests
npx jest src/tests/ai/scenarios.test.ts
```
