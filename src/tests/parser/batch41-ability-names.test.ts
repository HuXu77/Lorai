import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { Card } from '../../engine/models';

describe('Batch 41: Ability Name Stripping', () => {
    it('should strip flavor text/ability name from Dinner Bell', () => {
        const card: Card = {
            id: 'dinner-bell-1',
            name: 'Dinner Bell',
            abilities: [
                {
                    type: 'activated',
                    fullText: "You Know What Happens ⟳, 2 ⬡ — Draw cards equal to the damage on chosen character of yours, then banish them."
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('activated');
        expect((abilities[0] as any).costs[0].type).toBe('exert');
        expect((abilities[0] as any).costs[1].amount).toBe(2);
        expect((abilities[0] as any).effects[0].type).toBe('draw_equal_to_damage');
    });

    it('should strip ability name from Bernard', () => {
        const card: Card = {
            id: 'bernard-1',
            name: 'Bernard',
            abilities: [
                {
                    type: 'triggered',
                    fullText: "I'll Check It Out At the end of your turn, if this character is exerted, you may ready another chosen character of yours."
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('triggered');
        expect((abilities[0] as any).trigger.type).toBe('end_of_turn');
    });

    it('should strip ability name from Flotsam', () => {
        const card: Card = {
            id: 'flotsam-1',
            name: 'Flotsam',
            abilities: [
                {
                    type: 'static',
                    fullText: "Eerie Pair Your characters named Jetsam get +3 ¤."
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('static');
        expect((abilities[0] as any).effects[0].type).toBe('modify_stats');
        expect((abilities[0] as any).effects[0].amount).toBe(3);
    });

    it('should strip ability name from Mr. Smee', () => {
        const card: Card = {
            id: 'mr-smee-1',
            name: 'Mr. Smee',
            abilities: [
                {
                    type: 'triggered',
                    fullText: "Oh Dear, Dear, Dear At the end of your turn, if this character is exerted and you don't have a Captain character in play, deal 1 damage to this character."
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('triggered');
        expect((abilities[0] as any).trigger.type).toBe('end_of_turn');
    });

    it('should strip ability name from Simba', () => {
        const card: Card = {
            id: 'simba-1',
            name: 'Simba',
            abilities: [
                {
                    type: 'triggered',
                    fullText: "Triumphant Stance During your turn, whenever this character banishes another character in a challenge, chosen opposing character can't challenge during their next turn."
                }
            ]
        } as any;

        const abilities = parseToAbilityDefinition(card);
        expect(abilities.length).toBe(1);
        expect((abilities[0] as any).type).toBe('triggered');
        // Updated to match modern parser structure (flat event)
        expect((abilities[0] as any).event).toBe('challenge_banish');
        expect((abilities[0] as any).eventConditions).toEqual([{ type: 'during_your_turn' }]);
    });
});
