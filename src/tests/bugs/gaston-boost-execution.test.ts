
import { describe, it, expect, beforeEach } from 'vitest';
import { TestHarness } from '../engine-test-utils';
import { CardType, ZoneType } from '../../engine/models';

describe('Gaston Boost Execution', () => {
    let harness: TestHarness;
    let gastonCardData: any;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();

        gastonCardData = {
            name: "Gaston - Frightful Bully",
            type: CardType.Character,
            cost: 6,
            inkwell: true,
            abilities: [
                {
                    fullText: "Boost 2 ⬡ (Pay 2 ⬡ to put the top card of your deck facedown under this character.)"
                }
            ],
            strength: 4,
            willpower: 4,
            lore: 2
        };
    });

    it('should pay ink and put card under when Boost is used', async () => {
        const player = harness.game.getPlayer(harness.p1Id);

        // 1. Setup Gaston in Play
        const gastonInstance = harness.createCard(player, gastonCardData);
        gastonInstance.zone = ZoneType.Play;
        gastonInstance.ready = true;
        player.play.push(gastonInstance);

        // Register with ability system via TurnManager (TestHarness.setPlay handles this, manually pushing might skip it?)
        // Let's use harness.setPlay for robustness if possible, or just register it manually
        // But createCard doesn't register.
        // Let's just assume local execution for Boost doesn't need global registration if we call useAbility directly on the card.

        // 2. Setup Ink
        harness.setInk(player.id, 2);

        // 3. Setup Deck
        // Create dummy card
        const topDeck = harness.createCard(player, { name: "Top Deck", type: CardType.Character });
        topDeck.zone = ZoneType.Deck;
        player.deck = [topDeck];

        // 4. Verify Initial State
        expect(player.inkwell.filter(i => i.ready).length).toBe(2);
        expect(gastonInstance.meta.cardsUnder?.length || 0).toBe(0);

        // 5. Find Boost Ability
        // Note: harness.createCard calls parseToAbilityDefinition
        const boostIndex = gastonInstance.parsedEffects?.findIndex(e =>
            e.effects?.some((eff: any) => eff.type === 'boost') ||
            (e as any).keyword === 'boost'
        );
        expect(boostIndex).toBeGreaterThanOrEqual(0);

        // 6. Execute Boost
        console.log('Using ability index:', boostIndex);
        const success = await harness.turnManager.useAbility(player, gastonInstance.instanceId, boostIndex!);

        // 7. Verification
        expect(success).toBe(true);

        // Check Ink
        expect(player.inkwell.filter(i => i.ready).length).toBe(0);

        // Check Cards Under
        expect(gastonInstance.meta.cardsUnder).toBeDefined();
        expect(gastonInstance.meta.cardsUnder!.length).toBe(1);
        expect(gastonInstance.meta.cardsUnder![0].name).toBe("Top Deck");

        // Check Deck
        expect(player.deck.length).toBe(0);
    });
});
