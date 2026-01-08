import { expectHasAbilities, expectKeyword, createTestCardWithAbility } from '../test-utils';

/**
 * Example test using new utilities
 * Demonstrates how to update integration tests
 */

describe('Test Utilities Example', () => {
    describe('Ability Assertions', () => {
        it('should verify keyword parsing', () => {
            const card = createTestCardWithAbility('Singer 5', {
                name: 'Test Singer'
            });

            // Old way (would fail with new parser):
            // expect(parsedEffects.length).toBeGreaterThan(0);

            // New way (works with new parser):
            const abilities = expectHasAbilities(card);
            expect(abilities.length).toBe(1);

            const singerAbility = expectKeyword(card, 'singer');
            expect(singerAbility).toBeDefined();
        });

        it('should create test cards easily', () => {
            const drawCard = createTestCardWithAbility(
                'When you play this character, draw a card.'
            );

            const abilities = expectHasAbilities(drawCard);
            expect(abilities[0].type).toBe('triggered');
        });
    });
});
