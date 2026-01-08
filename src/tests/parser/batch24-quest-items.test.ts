import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardType } from '../../engine/models';

describe('Batch 24: Quest Triggers & Item Costs', () => {
    describe('Triggered: Whenever Quests (Complex)', () => {
        it('should parse whenever quests ready others (Moana)', () => {
            const card = {
                id: 'test-moana',
                name: 'Moana',
                type: 'Character' as CardType,
                abilities: [{ fullText: "We Can Fix It Whenever this character quests, you may ready your other Princess characters. They can't quest for the rest of this turn." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('triggered');
            expect((abilities[0] as any).event).toBe('card_quested');
            // expect((abilities[0] as any).condition.source).toBe('self');
            // Effects should include readying others and restricting them
            expect((abilities[0] as any).effects.length).toBeGreaterThan(0);
            expect((abilities[0] as any).effects[0].type).toBe('ready');
            expect((abilities[0] as any).effects[0].target.type).toBe('all_characters');
            expect((abilities[0] as any).effects[0].target.filter.subtype).toBe('Princess');
        });

        it('should parse whenever quests grant keyword (Li Shang)', () => {
            const card = {
                id: 'test-li-shang',
                name: 'Li Shang',
                type: 'Character' as CardType,
                abilities: [{ fullText: "Archery Lesson Whenever this character quests, your characters gain Evasive this turn." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('triggered');
            expect((abilities[0] as any).event).toBe('card_quested');
            expect((abilities[0] as any).effects[0].type).toBe('grant_keyword');
            expect((abilities[0] as any).effects[0].keyword).toBe('evasive');
            expect((abilities[0] as any).effects[0].target.type).toBe('all_characters');
            expect((abilities[0] as any).effects[0].target.filter.mine).toBe(true);
        });
    });

    describe('Activated: Banish Item Cost', () => {
        it('should parse banish item to grant rush (Croquet Mallet)', () => {
            const card = {
                id: 'test-croquet-mallet',
                name: 'Croquet Mallet',
                type: 'Item' as CardType,
                abilities: [{ fullText: "Hurtling Hedgehog Banish this item — Chosen character gains Rush this turn." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('activated');
            expect((abilities[0] as any).costs[0].type).toBe('banish');
            expect((abilities[0] as any).effects[0].type).toBe('grant_keyword');
            expect((abilities[0] as any).effects[0].keyword).toBe('rush');
        });

        it('should parse banish item to return to hand (Perplexing Signposts)', () => {
            const card = {
                id: 'test-perplexing-signposts',
                name: 'Perplexing Signposts',
                type: 'Item' as CardType,
                abilities: [{ fullText: "To Wonderland Banish this item — Return chosen character of yours to your hand." }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('activated');
            expect((abilities[0] as any).costs[0].type).toBe('banish');
            expect((abilities[0] as any).effects[0].type).toBe('return_to_hand');
        });
    });

    describe('Static: Enters Play With Damage', () => {
        it('should parse enters play with damage (Mother Gothel)', () => {
            const card = {
                id: 'test-mother-gothel',
                name: 'Mother Gothel',
                type: 'Character' as CardType,
                abilities: [{
                    fullText: "What Have You Done?! This character enters play with 3 damage.",
                    effect: "This character enters play with 3 damage."
                }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).type).toBe('static');
            expect((abilities[0] as any).effects[0].type).toBe('enters_with_damage');
            expect((abilities[0] as any).effects[0].amount).toBe(3);
        });
    });
});
