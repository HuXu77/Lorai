import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardType } from '../../engine/models';

describe('Batch 21: Conditional Activated & Triggered', () => {
    describe('Triggered: Whenever Remove Damage', () => {
        it('should parse whenever remove damage (Rapunzel)', () => {
            const card = {
                id: 'test-rapunzel',
                name: 'Rapunzel',
                type: 'Character' as CardType,
                abilities: [{ fullText: "Gleam and Glow Whenever you remove damage from a character, draw a card." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('triggered');
            expect((abilities[0] as any).event).toBe('card_healed');
            expect((abilities[0] as any).effects[0].type).toBe('draw');
        });
    });

    describe('Activated: Condition (Played Song)', () => {
        it('should parse if played song condition (Sleepys Flute)', () => {
            const card = {
                id: 'test-flute',
                name: 'Sleepys Flute',
                type: 'Item' as CardType,
                abilities: [{ fullText: "A Silly Song ⟳ — If you played a song this turn, gain 1 lore." }]
            } as any;


            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('activated');
            expect((abilities[0] as any).costs[0].type).toBe('exert');
            expect((abilities[0] as any).condition.type).toBe('played_song_this_turn');
            expect((abilities[0] as any).effects[0].type).toBe('gain_lore');
        });
    });

    describe('Activated: Conditional Replacement (Poisoned Apple)', () => {
        it('should parse conditional replacement (Poisoned Apple)', () => {
            const card = {
                id: 'test-apple',
                name: 'Poisoned Apple',
                type: 'Item' as CardType,
                abilities: [{ fullText: "Take a Bite... 1 ⬡, Banish this item — Exert chosen character. If a Princess character is chosen, banish her instead." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('activated');
            expect((abilities[0] as any).costs[0].type).toBe('ink');
            expect((abilities[0] as any).costs[0].amount).toBe(1);
            expect((abilities[0] as any).costs[1].type).toBe('banish');
            expect((abilities[0] as any).costs[1].target).toBe('self');

            // This is a complex effect. We might parse it as a single "exert_or_banish_if_subtype" effect
            // or a conditional effect structure.
            // For now, let's see how we implement it.
            const effect = (abilities[0] as any).effects[0];
            expect(effect.type).toBe('conditional_action');
            expect(effect.base_action.type).toBe('exert');
            expect(effect.condition.type).toBe('target_has_subtype');
            expect(effect.condition.subtype).toBe('Princess');
            expect(effect.replacement_action.type).toBe('banish');
        });
    });
});
