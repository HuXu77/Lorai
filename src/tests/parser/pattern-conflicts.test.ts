/**
 * Pattern Conflict & Edge Case Tests
 * 
 * Purpose: Prevent greedy pattern bugs like Cursed Merfolk where a pattern
 * in one trigger category (e.g., on-play) incorrectly matches text meant for
 * another trigger category (e.g., on-challenge).
 * 
 * This test suite ensures parser patterns are specific enough to avoid conflicts.
 */

import { parseToAbilityDefinition } from '../../engine/ability-parser';
import { GameEvent } from '../../engine/parsers/parser-utils';
import { CardType } from '../../engine/models';

describe('Parser Pattern Conflicts', () => {
    describe('Opponent Discard Patterns', () => {
        it('should distinguish play vs challenge triggers for "each opponent discards"', () => {
            // ON-PLAY version
            const playCard = {
                id: 1,
                name: 'Play Card',
                type: 'Character' as CardType,
                abilities: [{ fullText: 'When you play this character, each opponent chooses and discards a card.' }]
            };

            const playAbilities = parseToAbilityDefinition(playCard as any);
            expect(playAbilities[0].type).toBe('triggered');
            expect((playAbilities[0] as any).event).toBe(GameEvent.CARD_PLAYED);

            // ON-CHALLENGE version (Cursed Merfolk)
            const challengeCard = {
                id: 2,
                name: 'Challenge Card',
                type: 'Character' as CardType,
                abilities: [{ fullText: 'Whenever this character is challenged, each opponent chooses and discards a card.' }]
            };

            const challengeAbilities = parseToAbilityDefinition(challengeCard as any);
            expect(challengeAbilities[0].type).toBe('triggered');
            expect((challengeAbilities[0] as any).event).toBe(GameEvent.CARD_CHALLENGED);
            expect((challengeAbilities[0] as any).event).not.toBe(GameEvent.CARD_PLAYED);
        });

        it('should distinguish quest vs challenge triggers for "each opponent discards"', () => {
            // ON-QUEST version
            const questCard = {
                id: 3,
                name: 'Quest Card',
                type: 'Character' as CardType,
                abilities: [{ fullText: 'Whenever this character quests, each opponent chooses and discards a card.' }]
            };

            const questAbilities = parseToAbilityDefinition(questCard as any);
            expect(questAbilities[0].type).toBe('triggered');
            expect((questAbilities[0] as any).event).toBe(GameEvent.CARD_QUESTED);

            // ON-CHALLENGE version
            const challengeCard = {
                id: 4,
                name: 'Challenge Card',
                type: 'Character' as CardType,
                abilities: [{ fullText: 'Whenever this character is challenged, each opponent chooses and discards a card.' }]
            };

            const challengeAbilities = parseToAbilityDefinition(challengeCard as any);
            expect(challengeAbilities[0].type).toBe('triggered');
            expect((challengeAbilities[0] as any).event).toBe(GameEvent.CARD_CHALLENGED);
        });
    });

    describe('Stat Modification Patterns', () => {
        it('should distinguish different triggers for "gains +2 strength"', () => {
            // ON-PLAY
            const playCard = {
                id: 5,
                name: 'Play Buff',
                type: 'Character' as CardType,
                abilities: [{ fullText: 'When you play this character, chosen character gains +2 strength this turn.' }]
            };

            const playAbilities = parseToAbilityDefinition(playCard as any);
            expect(playAbilities.length).toBeGreaterThan(0);
            expect((playAbilities[0] as any).event).toBe(GameEvent.CARD_PLAYED);

            // ON-QUEST
            const questCard = {
                id: 6,
                name: 'Quest Buff',
                type: 'Character' as CardType,
                abilities: [{ fullText: 'Whenever this character quests, chosen character gains +2 strength this turn.' }]
            };

            const questAbilities = parseToAbilityDefinition(questCard as any);
            expect(questAbilities.length).toBeGreaterThan(0);
            expect((questAbilities[0] as any).event).toBe(GameEvent.CARD_QUESTED);
        });
    });

    describe('Banish Patterns', () => {
        it('should distinguish triggers for "banish chosen character"', () => {
            // ON-PLAY
            const playBanish = {
                id: 7,
                name: 'Play Banish',
                type: 'Character' as CardType,
                abilities: [{ fullText: 'When you play this character, banish chosen damaged character.' }]
            };

            const playAbilities = parseToAbilityDefinition(playBanish as any);
            expect(playAbilities.length).toBeGreaterThan(0);
            if (playAbilities.length > 0) {
                expect((playAbilities[0] as any).event).toBe(GameEvent.CARD_PLAYED);
            }

            // Skip challenge banish test - pattern not yet implemented
            // TODO: Add when "whenever this character challenges" pattern is implemented
        });
    });

    describe('Deal Damage Patterns', () => {
        it('should distinguish triggers for "deal damage"', () => {
            // ON-PLAY
            const playDamage = {
                id: 9,
                name: 'Play Damage',
                type: 'Character' as CardType,
                abilities: [{ fullText: 'When you play this character, deal 2 damage to chosen character.' }]
            };

            const playAbilities = parseToAbilityDefinition(playDamage as any);
            expect((playAbilities[0] as any).event).toBe(GameEvent.CARD_PLAYED);

            // ON-QUEST  
            const questDamage = {
                id: 10,
                name: 'Quest Damage',
                type: 'Character' as CardType,
                abilities: [{ fullText: 'Whenever this character quests, deal 1 damage to each opposing character.' }]
            };

            const questAbilities = parseToAbilityDefinition(questDamage as any);
            expect((questAbilities[0] as any).event).toBe(GameEvent.CARD_QUESTED);
        });
    });

    describe('Draw Card Patterns', () => {
        it('should distinguish triggers for "draw a card"', () => {
            // ON-PLAY
            const playDraw = {
                id: 11,
                name: 'Play Draw',
                type: 'Character' as CardType,
                abilities: [{ fullText: 'When you play this character, you may draw a card.' }]
            };

            const playAbilities = parseToAbilityDefinition(playDraw as any);
            expect((playAbilities[0] as any).event).toBe(GameEvent.CARD_PLAYED);

            // ON-QUEST
            const questDraw = {
                id: 12,
                name: 'Quest Draw',
                type: 'Character' as CardType,
                abilities: [{ fullText: 'Whenever this character quests, draw a card.' }]
            };

            const questAbilities = parseToAbilityDefinition(questDraw as any);
            expect((questAbilities[0] as any).event).toBe(GameEvent.CARD_QUESTED);
        });
    });

    describe('Conditional Prefix Handling', () => {
        it('should handle "during your turn" prefix correctly', () => {
            const duringTurn = {
                id: 13,
                name: 'During Turn',
                type: 'Character' as CardType,
                abilities: [{ fullText: 'During your turn, whenever this character quests, draw a card.' }]
            };

            const abilities = parseToAbilityDefinition(duringTurn as any);
            expect(abilities.length).toBeGreaterThan(0);
            if (abilities.length > 0) {
                expect(abilities[0].type).toBe('triggered');
                expect((abilities[0] as any).event).toBe(GameEvent.CARD_QUESTED);
                expect((abilities[0] as any).eventConditions).toEqual([{ type: 'during_your_turn' }]);
            }
        });

        it('should NOT confuse "while" static with "whenever" triggered', () => {
            // STATIC - "While"
            const whileCard = {
                id: 14,
                name: 'While Static',
                type: 'Character' as CardType,
                abilities: [{ fullText: 'While this character is damaged, it gets +2 strength.' }]
            };

            const whileAbilities = parseToAbilityDefinition(whileCard as any);
            expect(whileAbilities.length).toBeGreaterThan(0);
            expect(whileAbilities[0].type).toBe('static');

            // TRIGGERED - "Whenever"  
            const wheneverCard = {
                id: 15,
                name: 'Whenever Triggered',
                type: 'Character' as CardType,
                abilities: [{ fullText: 'Whenever this character is challenged, draw a card.' }]
            };

            const wheneverAbilities = parseToAbilityDefinition(wheneverCard as any);
            expect(wheneverAbilities.length).toBeGreaterThan(0);
            expect(wheneverAbilities[0].type).toBe('triggered');
        });
    });

    describe('Pronoun Variations', () => {
        it('should parse "whenever this character challenges" pattern', () => {
            const thisChar = {
                id: 16,
                name: 'This Character',
                type: 'Character' as CardType,
                abilities: [{ fullText: 'Whenever this character challenges, it gets +2 strength this turn.' }]
            };

            const abilities = parseToAbilityDefinition(thisChar as any);
            expect(abilities.length).toBeGreaterThan(0);
            expect((abilities[0] as any).event).toBe(GameEvent.CARD_CHALLENGES);
        });
    });

    describe('Pattern Priority', () => {
        it('should prefer specific patterns over generic fallbacks', () => {
            // This tests that specific "banish chosen damaged character" pattern
            // matches before generic "banish" pattern
            const specific = {
                id: 18,
                name: 'Specific',
                type: 'Character' as CardType,
                abilities: [{ fullText: 'When you play this character, banish chosen damaged character.' }]
            };

            const abilities = parseToAbilityDefinition(specific as any);
            expect(abilities[0].type).toBe('triggered');
            expect((abilities[0] as any).effects[0].type).toBe('banish');
            expect((abilities[0] as any).effects[0].target).toBeDefined();
        });
    });

    describe('Multiple Effect Phrases', () => {
        it('should not double-match effects that appear in multiple patterns', () => {
            const card = {
                id: 19,
                name: 'Multi Effect',
                type: 'Character' as CardType,
                abilities: [{ fullText: 'When you play this character, each opponent chooses and discards a card.' }]
            };

            const abilities = parseToAbilityDefinition(card as any);

            // Should only create ONE ability, not multiple from different patterns
            expect(abilities.length).toBe(1);
            expect((abilities[0] as any).event).toBe(GameEvent.CARD_PLAYED);
        });
    });
});
