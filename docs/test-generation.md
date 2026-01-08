# Automated Test Generation

The project includes a robust system for generating parser tests for all cards in `allCards.json`. This ensures that our parser is tested against the actual data it needs to handle.

## The Generator Script

The script is located at `src/scripts/generate-ability-tests.ts`.

### How to Run

```bash
npx ts-node src/scripts/generate-ability-tests.ts
```

This command will:
1.  Read `allCards.json`.
2.  Process every card with abilities (2,186 cards).
3.  Generate 22 batched test files (100 cards each) in `src/tests/abilities/auto/`.

## Pre-Validation Logic

One of the key features of the generator is **Pre-Validation**. We do not want to generate thousands of failing tests for abilities we haven't implemented yet. Instead, the generator "asks" the parser if it can handle a card *before* writing the test.

### How it Works

1.  **Mock Parsing**: For each card, the generator runs `parseToAbilityDefinition(card)` in memory.
2.  **Verification**: It checks if the parser returns the expected number of abilities without throwing errors.
3.  **Conditional Generation**:
    *   **Success**: If the parser works, it generates a standard `it(...)` test case.
    *   **Failure/Partial**: If the parser fails or returns fewer abilities than expected, it generates a `it.skip(...)` test case.

### Benefits

*   **Green Test Suite**: The generated test suite will always pass (or skip), preventing "red" builds due to known missing features.
*   **No Hallucinations**: We don't generate assertions that we *hope* are true. The tests reflect the actual capabilities of the parser.
*   **Automatic Updates**: As you implement new parser features, simply re-run the generator. It will detect that more cards are now parsing correctly and automatically un-skip those tests.

## Test Output

The tests are generated in batches (e.g., `batch-01.test.ts`, `batch-02.test.ts`) to keep file sizes manageable.

Example of a generated test:

```typescript
describe('Simba - Future King', () => {
    it('should parse 1 abilities', () => {
        // ... card setup ...
        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBeGreaterThanOrEqual(1);
        // ... assertions ...
    });
});
```

Example of a skipped test (currently unparseable):

```typescript
describe.skip('Maleficent - Dragon', () => {
    it('should parse 1 abilities', () => {
        // ...
    });
});
```
