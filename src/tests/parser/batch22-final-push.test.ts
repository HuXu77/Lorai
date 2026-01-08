import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardType } from '../../engine/models';

describe('Batch 22: Final Push to 75%', () => {
    describe('Triggered: Bodyguard Banished', () => {
        it('should parse whenever bodyguard banished (Musketeer Tabard)', () => {
            const card = {
                id: 'test-tabard',
                name: 'Musketeer Tabard',
                type: 'Item' as CardType,
                abilities: [{ fullText: "All for One and One for All Whenever one of your characters with Bodyguard is banished, you may draw a card." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('triggered');
            expect((abilities[0] as any).event).toBe('card_banished');
            expect((abilities[0] as any).condition.keyword).toBe('bodyguard');
            expect((abilities[0] as any).effects[0].type).toBe('draw');
        });
    });

    describe('Static: Additional Ink', () => {
        it('should parse additional ink (Belle - Strange but Special)', () => {
            const card = {
                id: 'test-belle',
                name: 'Belle',
                type: 'Character' as CardType,
                abilities: [{ fullText: "Read a Book During your turn, you may put an additional card from your hand into your inkwell facedown." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('static');
            expect((abilities[0] as any).effects[0].type).toBe('additional_ink');
        });
    });

    describe('Triggered: Whenever Play Action', () => {
        it('should parse whenever play action (Mickey Mouse - Artful Rogue)', () => {
            const card = {
                id: 'test-mickey-rogue',
                name: 'Mickey Mouse',
                type: 'Character' as CardType,
                abilities: [{ fullText: "Misdirection Whenever you play an action, chosen character gets +2 strength this turn." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('triggered');
            expect((abilities[0] as any).event).toBe('card_played');
            expect((abilities[0] as any).triggerFilter.type).toBe('action');
            expect((abilities[0] as any).effects[0].type).toBe('modify_stats');
            expect((abilities[0] as any).effects[0].amount).toBe(2);
        });
    });
});
