/**
 * Parser test for Cursed Merfolk challenge trigger
 * Ensures "Whenever this character is challenged, each opponent..." 
 * is NOT matched by the on-play pattern
 */

import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { GameEvent } from '../../engine/parsers/parser-utils';
import { CardType } from '../../engine/models';

describe('Cursed Merfolk - Challenge Trigger Parser', () => {
    it('should parse "Whenever this character is challenged, each opponent..." as CARD_CHALLENGED not CARD_PLAYED', () => {
        const cursedMerfolk = {
            id: 506,
            name: 'Cursed Merfolk',
            type: 'Character' as CardType,
            abilities: [
                {
                    fullText: 'POOR SOULS Whenever this character is challenged, each opponent chooses and discards a card.'
                }
            ]
        };

        const abilities = parseToAbilityDefinition(cursedMerfolk as any);

        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('triggered');

        const triggered = abilities[0] as any;
        expect(triggered.event).toBe(GameEvent.CARD_CHALLENGED);
        expect(triggered.event).not.toBe(GameEvent.CARD_PLAYED);

        expect(triggered.effects).toBeDefined();
        expect(triggered.effects.length).toBe(1);
        expect(triggered.effects[0].type).toBe('opponent_discard_choice');
    });

    it('should correctly parse "When you play this character, each opponent..." as CARD_PLAYED', () => {
        const daisyDuck = {
            id: 999,
            name: 'Daisy Duck',
            type: 'Character' as CardType,
            abilities: [
                {
                    fullText: 'When you play this character, each opponent chooses and discards a card.'
                }
            ]
        };

        const abilities = parseToAbilityDefinition(daisyDuck as any);

        expect(abilities.length).toBe(1);
        expect(abilities[0].type).toBe('triggered');

        const triggered = abilities[0] as any;
        expect(triggered.event).toBe(GameEvent.CARD_PLAYED);
        expect(triggered.event).not.toBe(GameEvent.CARD_CHALLENGED);
    });
});
