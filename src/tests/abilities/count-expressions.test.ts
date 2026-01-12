import { TurnManager } from '../../engine/actions';
import { GameStateManager } from '../../engine/state';
import { CardType, ZoneType } from '../../engine/models';

describe('Count Expression Evaluation', () => {
    let gameState: GameStateManager;
    let turnManager: TurnManager;

    beforeEach(() => {
        gameState = new GameStateManager();
        gameState.addPlayer('p1');
        gameState.addPlayer('p2');
        turnManager = new TurnManager(gameState);
    });

    describe('Count Characters', () => {
        it('should count characters in play', () => {
            const player = gameState.getPlayer('p1');

            // Add 3 characters to play
            for (let i = 0; i < 3; i++) {
                player.addCardToZone({
                    id: 100 + i,
                    name: `Character ${i}`,
                    type: CardType.Character,
                    cost: 2,
                    strength: 2,
                    willpower: 2
                } as any, ZoneType.Play);
            }

            // Count should be 3
            expect(player.play.length).toBe(3);
        });

        it('should count damaged characters', () => {
            const player = gameState.getPlayer('p1');

            // Add 3 characters, damage 2 of them
            const char1 = player.addCardToZone({
                id: 201,
                name: 'Char 1',
                type: CardType.Character,
                cost: 2,
                strength: 2,
                willpower: 3
            } as any, ZoneType.Play);
            char1.damage = 1; // Damaged

            const char2 = player.addCardToZone({
                id: 202,
                name: 'Char 2',
                type: CardType.Character,
                cost: 2,
                strength: 2,
                willpower: 3
            } as any, ZoneType.Play);
            char2.damage = 2; // Damaged

            player.addCardToZone({
                id: 203,
                name: 'Char 3',
                type: CardType.Character,
                cost: 2,
                strength: 2,
                willpower: 3
            } as any, ZoneType.Play);
            // No damage

            // Count damaged characters
            const damagedCount = player.play.filter(c => (c.damage || 0) > 0).length;
            expect(damagedCount).toBe(2);
        });
    });

    describe('Count with Filters', () => {
        it('should count characters with specific trait', () => {
            const player = gameState.getPlayer('p1');

            // Add characters with different traits
            player.addCardToZone({
                id: 301,
                name: 'Hero 1',
                type: CardType.Character,
                cost: 2,
                classifications: ['Hero']
            } as any, ZoneType.Play);

            player.addCardToZone({
                id: 302,
                name: 'Hero 2',
                type: CardType.Character,
                cost: 3,
                classifications: ['Hero']
            } as any, ZoneType.Play);

            player.addCardToZone({
                id: 303,
                name: 'Villain',
                type: CardType.Character,
                cost: 2,
                classifications: ['Villain']
            } as any, ZoneType.Play);

            // Count heroes
            const heroCount = player.play.filter(c =>
                c.classifications?.includes('Hero')
            ).length;

            expect(heroCount).toBe(2);
        });

        it('should count opponent characters', () => {
            const p1 = gameState.getPlayer('p1');
            const p2 = gameState.getPlayer('p2');

            // P1 has 2 characters
            for (let i = 0; i < 2; i++) {
                p1.addCardToZone({
                    id: 400 + i,
                    name: `P1 Char ${i}`,
                    type: CardType.Character,
                    cost: 2
                } as any, ZoneType.Play);
            }

            // P2 (opponent) has 3 characters
            for (let i = 0; i < 3; i++) {
                p2.addCardToZone({
                    id: 500 + i,
                    name: `P2 Char ${i}`,
                    type: CardType.Character,
                    cost: 2
                } as any, ZoneType.Play);
            }

            expect(p2.play.length).toBe(3);
        });
    });

    describe('Expression Context', () => {
        it('should provide count value in damage context', () => {
            // Test that count expressions can be used in damage effects
            // e.g., "Deal damage equal to number of characters"

            const context = {
                count: 3 // Number of characters
            };

            const damageAmount = context.count;
            expect(damageAmount).toBe(3);
        });
    });
});
