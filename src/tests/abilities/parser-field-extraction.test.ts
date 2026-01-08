/**
 * Parser Field Extraction Test
 * 
 * TDD: Test that parser correctly extracts from 'effect' field
 */

import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { GameEvent } from '../../engine/abilities/events';
import { CardType } from '../../engine/models';

describe('Parser Field Extraction', () => {
    it('should extract from effect field for triggered abilities', () => {
        // Mock card like Ariel - with effect field
        const card = {
            id: 1,
            name: 'Test Card',
            fullName: 'Test Card - Name',
            type: 'Character' as CardType,
            abilities: [{
                type: 'triggered',
                fullText: 'ABILITY NAME When you play this character, draw a card.',
                effect: 'When you play this character, draw a card.',
                name: 'ABILITY NAME'
            }]
        } as any;

        const abilities = parseToAbilityDefinition(card);

        // Should parse the triggered ability
        expect(abilities.length).toBeGreaterThan(0);

        // Should be a triggered ability
        const triggered = abilities.find(a => a.type === 'triggered');
        expect(triggered).toBeDefined();

        // Should have  CARD_PLAYED event (from "When you play this character")
        expect(triggered?.event).toBe(GameEvent.CARD_PLAYED);

        // Should have draw effect
        const hasDrawEffect = triggered?.effects?.some((e: any) => e.type === 'draw');
        expect(hasDrawEffect).toBe(true);
    });

    it('should handle cards with only fullText (backward compatibility)', () => {
        const card = {
            id: 2,
            name: 'Old Format Card',
            type: 'Character' as CardType,
            abilities: [{
                fullText: 'When you play this character, draw a card.',
                type: 'triggered'
            }]
        } as any;

        const abilities = parseToAbilityDefinition(card);

        // Should still parse
        expect(abilities.length).toBeGreaterThan(0);
    });
});
