
import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { CardType } from '../../engine/models';

describe('Batch 6: Keywords', () => {
    describe('Boost', () => {
        it('should parse Boost keyword', () => {
            const card = {
                id: 'test-boost',
                name: 'Yzma',
                type: 'Character' as CardType,
                abilities: [{
                    fullText: 'Boost 2 ⬡ (Once during your turn, you may pay 2 ⬡ to put the top card of your deck facedown under this character.)'
                }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect(abilities[0].type).toBe('activated');
            expect((abilities[0] as any).keyword).toBe('boost');
            expect((abilities[0] as any).costs[0].amount).toBe(2);
        });
    });

    describe('Sing Together', () => {
        it('should parse Sing Together keyword', () => {
            const card = {
                id: 'test-sing-together',
                name: 'Look at This Family',
                type: 'Song',
                abilities: [{
                    fullText: 'Sing Together 7 (Any number of your or your teammates\' characters with total cost 7 or more may ⟳ to sing this song for free.)'
                }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            console.log('DEBUG: Number of abilities:', abilities.length);
            abilities.forEach((a, i) => {
                console.log(`DEBUG: Ability ${i + 1}:`, {
                    type: a.type,
                    keyword: (a as any).keyword,
                    rawText: (a as any).rawText
                });
            });
            expect(abilities.length).toBe(1);
            expect(abilities[0].type).toBe('static');
            expect((abilities[0] as any).keyword).toBe('sing_together');
            expect((abilities[0] as any).amount).toBe(7);
        });

        it('should parse Sing Together with newlines', () => {
            const card = {
                id: 'test-sing-together-newlines',
                name: 'Look at This Family',
                type: 'Song',
                abilities: [{
                    fullText: 'Sing Together 7 (Any number of your or your teammates\'\ncharacters with total cost 7 or more may ⟳ to sing this\nsong for free.)'
                }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).keyword).toBe('sing_together');
        });
    });

    describe('Singer Reminder Text', () => {
        it('should ignore Singer reminder text', () => {
            const card = {
                id: 'test-singer-reminder',
                name: 'Be Our Guest',
                type: 'Song',
                abilities: [{
                    fullText: '(A character with cost 2 or more can ⟳ to sing this song for free.)'
                }]
            } as any;

            const abilities = parseToAbilityDefinition(card);
            expect(abilities.length).toBe(0); // Should be filtered out
        });
    });
});
