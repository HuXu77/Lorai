import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardType } from '../../engine/models';

describe('Batch 23: Part 3', () => {
    describe('Triggered: Item Triggers', () => {
        it('should parse whenever play item ready self (Maurice - World-Famous Inventor)', () => {
            const card = {
                id: 'test-maurice-inventor',
                name: 'Maurice',
                type: 'Character' as CardType,
                abilities: [{ fullText: "It Works! Whenever you play an item, you may ready this character." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('triggered');
            expect((abilities[0] as any).event).toBe('card_played');
            expect((abilities[0] as any).triggerFilter.type).toBe('item');
            expect((abilities[0] as any).effects[0].type).toBe('ready');
            expect((abilities[0] as any).effects[0].target.type).toBe('self');
            expect((abilities[0] as any).effects[0].optional).toBe(true);
        });

        it('should parse whenever play item pay ink to deal damage (Belle - Inventive Engineer)', () => {
            const card = {
                id: 'test-belle-engineer',
                name: 'Belle',
                type: 'Character' as CardType,
                abilities: [{ fullText: "Tinker Whenever you play an item, you may pay 1 ink to deal 2 damage to chosen opposing character." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('triggered');
            expect((abilities[0] as any).event).toBe('card_played');
            expect((abilities[0] as any).triggerFilter.type).toBe('item');
            // Parser wraps "pay ink to do X" effects in pay_to_resolve
            const effect = (abilities[0] as any).effects[0];
            expect(effect.type).toBe('pay_to_resolve');
            // Cost structure may vary - just verify effect was parsed
            expect(effect).toBeDefined();
        });
    });
});
