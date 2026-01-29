
import { TestHarness } from '../../engine-test-utils';
import { CardType, ActionType, ZoneType } from '../../../engine/models';

describe('Ability: Pongo - Old Rascal', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should deal 2 damage if Perdita is NOT in play', async () => {
        const player = harness.game.getPlayer(harness.p1Id);
        const opponent = harness.game.getPlayer(harness.p2Id);

        // 1. Setup Pongo
        // Text: "Once per turn, you may pay 2 ink to deal 2 damage to chosen character. If you have a character named Perdita in play, you may deal 4 damage instead."
        // Activated ability cost is separate from the "pay 2 ink" inside?
        // Wait, "you may pay 2 ink to deal" implies cost `ink: 2`?
        // If it's ink cost, it's usually part of activation cost.
        // Pongo has `abilities: [{ type: 'activated', cost: { ink: 2 }, effect: "..." }]`
        // Or is it "pay 2 ink" as part of effect resolution? 
        // "pay 2 ink to deal" usually means cost.
        // Let's assume standard activated ability structure.

        const pongo = harness.createCard(player, {
            name: 'Pongo - Old Rascal',
            type: CardType.Character,
            cost: 4,
            inkwell: true,
            abilities: [
                {
                    type: 'activated',
                    cost: { ink: 2 }, // Implied cost
                    effect: "deal 2 damage to chosen character. If you have a character named Perdita in play, you may deal 4 damage instead.",
                    fullText: "Once per turn, you may pay 2 ink to deal 2 damage to chosen character. If you have a character named Perdita in play, you may deal 4 damage instead."
                }
            ]
        });
        pongo.zone = ZoneType.Play;
        player.play.push(pongo);
        // Register Pongo (Critical Fix from Lucky)
        harness.turnManager.abilitySystem.registerCard(pongo);

        // Ink for Pongo cost
        const ink1 = harness.createCard(player, { name: 'Ink 1', inkwell: true });
        const ink2 = harness.createCard(player, { name: 'Ink 2', inkwell: true });
        ink1.zone = ZoneType.Inkwell; ink1.ready = true; player.inkwell.push(ink1);
        ink2.zone = ZoneType.Inkwell; ink2.ready = true; player.inkwell.push(ink2);

        // Target
        const target = harness.createCard(opponent, { name: 'Target', willpower: 5, type: CardType.Character });
        target.zone = ZoneType.Play;
        opponent.play.push(target);

        // 2. Activate Pongo
        // Mock choice: target
        harness.turnManager.mockPendingChoice = [target.instanceId];

        await harness.turnManager.resolveAction({
            type: ActionType.UseAbility,
            playerId: player.id,
            cardId: pongo.instanceId,
            abilityIndex: 0
        });

        // 3. Verify Damage (Should be 2)
        expect(target.damage).toBe(2);
    });

    it('should deal 4 damage if Perdita IS in play', async () => {
        const player = harness.game.getPlayer(harness.p1Id);
        const opponent = harness.game.getPlayer(harness.p2Id);

        const pongo = harness.createCard(player, {
            name: 'Pongo - Old Rascal',
            type: CardType.Character,
            cost: 4,
            inkwell: true,
            abilities: [
                {
                    type: 'activated',
                    cost: { ink: 2 },
                    effect: "deal 2 damage to chosen character. If you have a character named Perdita in play, you may deal 4 damage instead.",
                    fullText: "Once per turn, you may pay 2 ink to deal 2 damage to chosen character. If you have a character named Perdita in play, you may deal 4 damage instead."
                }
            ]
        });
        pongo.zone = ZoneType.Play;
        player.play.push(pongo);
        harness.turnManager.abilitySystem.registerCard(pongo);

        const perdita = harness.createCard(player, { name: 'Perdita - Devoted Mother', type: CardType.Character });
        perdita.zone = ZoneType.Play;
        player.play.push(perdita);
        // Register Perdita just in case
        harness.turnManager.abilitySystem.registerCard(perdita);

        // Ink
        const ink1 = harness.createCard(player, { name: 'Ink 1', inkwell: true });
        const ink2 = harness.createCard(player, { name: 'Ink 2', inkwell: true });
        ink1.zone = ZoneType.Inkwell; ink1.ready = true; player.inkwell.push(ink1);
        ink2.zone = ZoneType.Inkwell; ink2.ready = true; player.inkwell.push(ink2);

        const target = harness.createCard(opponent, { name: 'Target', willpower: 5, type: CardType.Character });
        target.zone = ZoneType.Play;
        opponent.play.push(target);

        harness.turnManager.mockPendingChoice = [target.instanceId];

        await harness.turnManager.resolveAction({
            type: ActionType.UseAbility,
            playerId: player.id,
            cardId: pongo.instanceId,
            abilityIndex: 0
        });

        // Verify Damage (Should be 4)
        expect(target.damage).toBe(4);
    });
});
