
---
description: How to use the UI Test Harness to verify ability choice modals
---
1. Navigate to `/debug/ui` in your browser.
2. Use the **Scenarios** sidebar to select a specific choice type (e.g., "Select Cards", "Order Cards").
3. The main view will render the `PlayerChoiceHandler` with a mock `ChoiceRequest`.
4. Interact with the UI (select cards, confirm).
5. Verify the **Last Response** payload in the sidebar to ensure the component outputs the correct data.

## Adding New Scenarios
To add a new scenario, edit `src/app/debug/ui/page.tsx` and add an entry to the `scenarios` object.
```typescript
'My New Scenario': () => ({
    id: 'req-new',
    type: ChoiceType.TARGET_CHARACTER,
    playerId: 'player-1',
    prompt: "Choose something",
    source: { ... },
    options: [ ... ]
})
```
