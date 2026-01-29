
import { TestHarness } from '../../engine-test-utils';
import { CardType, ActionType, ZoneType } from '../../../engine/models';

describe('Static Keywords: Ward, Evasive, Resist', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    describe('Ward', () => {
        it('should prevent opponents from choosing character with Ward for abilities', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);
            const p2 = harness.game.getPlayer(harness.p2Id);

            // P1 has Ward character
            const warded = harness.createCard(p1, {
                name: 'Warded Character',
                type: CardType.Character,
                strength: 2,
                willpower: 5,
                keywords: ['Ward']
            });
            warded.baseKeywords = ['Ward']; // Critical for recalculate persistence
            warded.zone = ZoneType.Play;
            p1.play.push(warded);
            harness.turnManager.abilitySystem.registerCard(warded);

            // P1 has non-Ward character (control)
            const normal = harness.createCard(p1, {
                name: 'Normal Character',
                type: CardType.Character,
                strength: 2,
                willpower: 5
            });
            normal.baseKeywords = [];
            normal.zone = ZoneType.Play;
            p1.play.push(normal);
            harness.turnManager.abilitySystem.registerCard(normal);

            // P2 uses "Deal 2 damage to chosen character"
            // Create Dragon Fire with manual parsing to avoid loading real card issues
            // This mocks the ability exactly as we want to test it
            const fire = harness.createCard(p2, {
                name: 'Dragon Fire',
                type: CardType.Action,
                cost: 0, // ensure payable
                inkwell: true,
                parsedEffects: [{
                    type: 'activated',
                    trigger: 'on_play',
                    effects: [{
                        type: 'damage',
                        amount: 2,
                        target: { type: 'chosen_character' }
                    }]
                } as any],
                abilities: []
            });
            p2.hand.push(fire);

            // Verify NO damage on warded (Expected to fail until Ward is implemented in executor)

            // Start P2 turn to ensure action is valid
            harness.turnManager.startTurn(harness.p2Id);
            harness.game.state.turnPlayerId = harness.p2Id; // Force state sync

            (harness.turnManager as any).mockPendingChoice = [warded.instanceId];
            await harness.turnManager.resolveAction({
                type: ActionType.PlayCard,
                playerId: p2.id,
                cardId: fire.instanceId
            });

            // Check if damage applied 
            // Ward check is implemented, so we expect NO damage (0). 
            const p1StateForWard = harness.game.getPlayer(harness.p1Id);
            const freshWarded = p1StateForWard.play.find(c => c.instanceId === warded.instanceId);
            expect(freshWarded?.damage).toBe(0);


            // Reset P2 turn for clean state
            harness.turnManager.startTurn(harness.p2Id);

            // Create FRESH Dragon Fire to avoid state issues
            const fire2 = harness.createCard(p2, {
                name: 'Dragon Fire 2',
                type: CardType.Action,
                parsedEffects: [{
                    type: 'activated',
                    trigger: 'on_play',
                    effects: [{
                        type: 'damage',
                        amount: 2,
                        target: { type: 'chosen_character' }
                    }]
                } as any],
                abilities: []
            });
            p2.hand.push(fire2);

            // Verify `ActionType.PlayCard` value (sanity check)
            console.log('DEBUG: ActionType.PlayCard =', ActionType.PlayCard);
            console.log('DEBUG: fire2 parsedEffects:', JSON.stringify(fire2.parsedEffects, null, 2));

            // Use test harness helper which correctly handles action construction
            await harness.playCard(p2, fire2, normal);

            // Should verify damage on normal
            // Note: Since normal reference might be stale if object replaced, using variable directly
            // assuming harness returns persistent object. Earlier debug showed Banished = reset damage.
            expect(normal.damage).toBe(2);
        });
    });

    describe('Evasive', () => {
        it('should enforce Evasive challenge restrictions', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);
            const p2 = harness.game.getPlayer(harness.p2Id);

            // P1 has Evasive character (exerted to be liable for challenge)
            const flotsam = harness.createCard(p1, {
                name: 'Flotsam',
                type: CardType.Character,
                keywords: ['Evasive'],
                strength: 1, willpower: 3
            });
            flotsam.baseKeywords = ['Evasive'];
            flotsam.zone = ZoneType.Play;
            flotsam.ready = false;
            flotsam.exerted = true;
            p1.play.push(flotsam);
            harness.turnManager.abilitySystem.registerCard(flotsam);

            // P2 has Normal character (Ready, dry)
            const simba = harness.createCard(p2, {
                name: 'Simba',
                type: CardType.Character,
                strength: 2, willpower: 2
            });
            simba.baseKeywords = [];
            simba.zone = ZoneType.Play;
            simba.ready = true;
            p2.play.push(simba);
            harness.turnManager.abilitySystem.registerCard(simba);

            // P2 has Evasive character (Ready, dry)
            const jetsam = harness.createCard(p2, {
                name: 'Jetsam',
                type: CardType.Character,
                keywords: ['Evasive'],
                strength: 2, willpower: 2
            });
            jetsam.baseKeywords = ['Evasive'];
            jetsam.zone = ZoneType.Play;
            jetsam.ready = true;
            p2.play.push(jetsam);
            harness.turnManager.abilitySystem.registerCard(jetsam);

            // P2 Turn
            harness.turnManager.startTurn(harness.p2Id);

            // 1. Normal attacks Evasive -> EXPECT FAIL
            let challengeFailed = false;
            try {
                await harness.turnManager.resolveAction({
                    type: ActionType.Challenge,
                    playerId: p2.id,
                    cardId: simba.instanceId,
                    targetId: flotsam.instanceId
                });
            } catch (e) {
                challengeFailed = true;
            }

            // Depending on how engine handles invalid actions, it might not throw but just log and do nothing.
            // Check exertions/damage.
            expect(simba.ready).toBe(true); // Should not have exerted
            expect(flotsam.damage).toBe(0);

            // 2. Evasive attacks Evasive -> EXPECT SUCCESS
            await harness.turnManager.resolveAction({
                type: ActionType.Challenge,
                playerId: p2.id,
                cardId: jetsam.instanceId,
                targetId: flotsam.instanceId
            });

            expect(jetsam.ready).toBe(false); // Exerted
            expect(flotsam.damage).toBe(2);
            expect(jetsam.damage).toBe(1);
        });
    });

    describe('Resist', () => {
        it('should reduce damage from challenges', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);
            const p2 = harness.game.getPlayer(harness.p2Id);

            // P1 has Resist +1 character
            const cinderella = harness.createCard(p1, {
                name: 'Cinderella',
                type: CardType.Character,
                keywords: ['Resist +1'], // Parser should pick this up, or we rely on logic manual set?
                // Logic usually parses keywords on load.
                // manual createCard might not trigger keyword parsing if we just pass string array.
                // `executeRecalculateEffects` handles "Resist +X" strings in `card.keywords`.
                strength: 1, willpower: 5
            });
            cinderella.baseKeywords = ['Resist +1'];
            // Manual Resist check needs Recalculate to run or manual meta set
            // Let's ensure keywords works:
            // The stat-calculator/recalculate logic parses "Resist +1" from keywords array.

            cinderella.zone = ZoneType.Play;
            cinderella.ready = false;
            cinderella.exerted = true;
            p1.play.push(cinderella);
            harness.turnManager.abilitySystem.registerCard(cinderella);

            // P2 Attacker (Strength 2)
            const attacker = harness.createCard(p2, {
                name: 'Attacker',
                type: CardType.Character,
                strength: 2, willpower: 2
            });
            attacker.baseKeywords = [];
            attacker.zone = ZoneType.Play;
            attacker.ready = true;
            p2.play.push(attacker);
            harness.turnManager.abilitySystem.registerCard(attacker);

            // Recalculate to apply Resist from keywords
            harness.turnManager.recalculateEffects();

            // Verify Resist is active
            expect(cinderella.meta?.resist).toBe(1);

            // Challenge
            harness.turnManager.startTurn(harness.p2Id);

            await harness.turnManager.resolveAction({
                type: ActionType.Challenge,
                playerId: p2.id,
                cardId: attacker.instanceId,
                targetId: cinderella.instanceId
            });

            // Damage should be 2 - 1 = 1
            expect(cinderella.damage).toBe(1);
        });

        it('should reduce damage from abilities', async () => {
            const p1 = harness.game.getPlayer(harness.p1Id);
            const p2 = harness.game.getPlayer(harness.p2Id);

            // P1 has Resist +2
            const hercules = harness.createCard(p1, {
                name: 'Hercules',
                type: CardType.Character,
                keywords: ['Resist +2'],
                willpower: 5
            });
            hercules.baseKeywords = ['Resist +2'];
            hercules.zone = ZoneType.Play;
            p1.play.push(hercules);
            harness.turnManager.abilitySystem.registerCard(hercules);

            harness.turnManager.recalculateEffects();
            expect(hercules.meta?.resist).toBe(2);

            // P2 plays "Deal 2 damage" - should be 0
            const smash = harness.createCard(p2, {
                name: 'Smash',
                type: CardType.Action,
                abilities: [{
                    type: 'activated',
                    effect: 'Deal 2 damage to chosen character'
                }]
            });
            p2.hand.push(smash);

            // Trigger P2 turn
            harness.turnManager.startTurn(harness.p2Id);

            (harness.turnManager as any).mockPendingChoice = [hercules.instanceId];
            await harness.turnManager.resolveAction({
                type: ActionType.Play,
                playerId: p2.id,
                cardId: smash.instanceId
            });

            expect(hercules.damage).toBe(0);
        });
    });
});
