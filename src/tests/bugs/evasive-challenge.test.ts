// // Jest globals are automatically available
import { TestHarness } from '../engine-test-utils';
import { ZoneType, CardType } from '../../engine/models';
import { canChallenge } from '../../engine/combat';

describe('Evasive Challenge Logic', () => {
    let harness: TestHarness;

    beforeEach(async () => {
        harness = new TestHarness();
        await harness.initialize();
    });

    it('should prevent non-Evasive character from challenging Evasive character', () => {
        // Setup Evasive target for opponent
        const opponent = harness.getPlayer(harness.p2Id);
        const evasiveTarget = harness.createCard(opponent, {
            name: 'Evasive Target',
            type: CardType.Character,
            cost: 1,
            strength: 1,
            willpower: 1,
            lore: 1,
            subtypes: [],
            abilities: [{ type: 'keyword', keyword: 'evasive' }]
        });

        // Ensure effects are parsed
        if (!evasiveTarget.parsedEffects || evasiveTarget.parsedEffects.length === 0) {
            evasiveTarget.parsedEffects = [{
                type: 'keyword',
                keyword: 'evasive',
                action: 'keyword_evasive'
            } as any];
        }
        evasiveTarget.keywords = ['Evasive'];

        // Add to opponent's play area
        opponent.play.push(evasiveTarget);
        evasiveTarget.zone = ZoneType.Play;
        evasiveTarget.ready = false; // Exerted so it can be challenged

        // Setup non-Evasive attacker for player
        const player = harness.getPlayer(harness.p1Id);
        const normalAttacker = harness.createCard(player, {
            name: 'Normal Attacker',
            type: CardType.Character,
            cost: 1,
            strength: 1,
            willpower: 1,
            lore: 1,
            subtypes: [],
            abilities: []
        });

        player.play.push(normalAttacker);
        normalAttacker.zone = ZoneType.Play;
        normalAttacker.ready = true; // Ready to attack
        normalAttacker.turnPlayed = -1; // Not drying

        // Attempt challenge
        const isValid = canChallenge(normalAttacker, evasiveTarget);

        expect(isValid).toBe(false);
    });

    it('should allow Evasive character to challenge Evasive character', () => {
        const player = harness.getPlayer(harness.p1Id);
        const opponent = harness.getPlayer(harness.p2Id);

        // Setup Evasive target for opponent
        const evasiveTarget = harness.createCard(opponent, {
            name: 'Evasive Target',
            type: CardType.Character,
            cost: 1,
            strength: 1,
            willpower: 1,
            lore: 1,
            subtypes: [],
            abilities: [{ type: 'keyword', keyword: 'evasive' }]
        });

        if (!evasiveTarget.parsedEffects || evasiveTarget.parsedEffects.length === 0) {
            evasiveTarget.parsedEffects = [{
                type: 'keyword',
                keyword: 'evasive',
                action: 'keyword_evasive'
            } as any];
        }
        evasiveTarget.keywords = ['Evasive'];

        opponent.play.push(evasiveTarget);
        evasiveTarget.zone = ZoneType.Play;
        evasiveTarget.ready = false;

        // Setup Evasive attacker for player
        const evasiveAttacker = harness.createCard(player, {
            name: 'Evasive Attacker',
            type: CardType.Character,
            cost: 1,
            strength: 1,
            willpower: 1,
            lore: 1,
            subtypes: [],
            abilities: [{ type: 'keyword', keyword: 'evasive' }]
        });

        if (!evasiveAttacker.parsedEffects || evasiveAttacker.parsedEffects.length === 0) {
            evasiveAttacker.parsedEffects = [{
                type: 'keyword',
                keyword: 'evasive',
                action: 'keyword_evasive'
            } as any];
        }
        evasiveAttacker.keywords = ['Evasive'];

        player.play.push(evasiveAttacker);
        evasiveAttacker.zone = ZoneType.Play;
        evasiveAttacker.ready = true;
        evasiveAttacker.turnPlayed = -1;

        const isValid = canChallenge(evasiveAttacker, evasiveTarget);
        expect(isValid).toBe(true);
    });
});
