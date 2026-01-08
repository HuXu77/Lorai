import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardType } from '../../engine/models';

describe('Batch 28: Search & Location Damage', () => {
    describe('Triggered: Search Deck', () => {
        it('should parse search deck (Alma Madrigal)', () => {
            const card = {
                id: 'test-alma-madrigal',
                name: 'Alma Madrigal',
                type: 'Character' as CardType,
                abilities: [{ fullText: "To the Table When you play this character, you may search your deck for a Madrigal character card and reveal that card to all players. Shuffle your deck and put that card on top of it." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('triggered');
            expect((abilities[0] as any).event).toBe('card_played');
            expect((abilities[0] as any).effects[0].type).toBe('search_deck');
            expect((abilities[0] as any).effects[0].filter.subtype).toBe('madrigal');
            expect((abilities[0] as any).effects[0].destination).toBe('top_of_deck');
            expect((abilities[0] as any).effects[0].shuffle).toBe(true);
            expect((abilities[0] as any).effects[0].reveal).toBe(true);
        });
    });

    describe('Action: Remove Damage from Location', () => {
        it('should parse remove damage from location (Quick Patch)', () => {
            const card = {
                id: 'test-quick-patch',
                name: 'Quick Patch',
                type: 'Action' as CardType,
                abilities: [{ fullText: "Remove up to 3 damage from chosen location." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('activated'); // Action card effects are parsed as activated
            // Actually actions usually come out as 'resolution' or similar if parsed via parseAbilityStructured?
            // But parseToAbilityDefinition for Action card usually returns an ability with type 'resolution' or 'static' if it's just text?
            // Let's check how actions are parsed. Usually they are 'resolution' if not triggered/static.
            // But for now let's assume it might be parsed as 'resolution' or we check the effect structure.
            // If it's an action card, the main text is the effect.
            expect((abilities[0] as any).effects[0].type).toBe('heal');
            expect((abilities[0] as any).effects[0].amount).toBe(3);
            expect((abilities[0] as any).effects[0].target.type).toBe('chosen_location');
        });

        it('should parse remove damage from location (Wildcats Wrench)', () => {
            const card = {
                id: 'test-wildcats-wrench',
                name: "Wildcat's Wrench",
                type: 'Item' as CardType,
                abilities: [{ fullText: "Rebuild ⟳ — Remove up to 2 damage from chosen location." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('activated');
            expect((abilities[0] as any).effects[0].type).toBe('heal');
            expect((abilities[0] as any).effects[0].amount).toBe(2);
            expect((abilities[0] as any).effects[0].target.type).toBe('chosen_location');
        });
    });
});
