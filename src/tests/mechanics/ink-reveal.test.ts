
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TurnManager } from '../../engine/actions';
import { GameStateManager } from '../../engine/state';
import { TestLogger } from '../test-logger'; // Assuming this exists or create mock
import { executeInkCard } from '../../engine/game-actions/ink-action';
import { PlayerState } from '../../engine/state';
import { CardInstance, ZoneType } from '../../engine/models';
import { LogCategory } from '../../types/log';

// Mock Logger
class MockLogger {
    logs: any[] = [];
    action(player: string, action: string, details?: any) {
        this.logs.push({ level: 'ACTION', message: `${player} ${action}`, details });
    }
    debug() { }
    info() { }
    warn() { }
    error() { }
}

describe('Ink Action Logging', () => {
    let turnManager: TurnManager;
    let stateManager: GameStateManager;
    let player: PlayerState;
    let card: CardInstance;
    let logger: MockLogger;

    beforeEach(() => {
        stateManager = new GameStateManager();
        logger = new MockLogger();

        // Mock TurnManager with logger
        turnManager = {
            logger: logger as any,
            abilitySystem: {
                emitEvent: vi.fn().mockResolvedValue(undefined)
            }
        } as any;

        player = {
            id: 'p1',
            name: 'Player 1',
            hand: [],
            inkwell: [],
            inkedThisTurn: false
        } as any;

        card = {
            instanceId: 'card-1',
            name: 'Mickey Mouse',
            inkwell: true,
            zone: ZoneType.Hand
        } as any;

        player.hand.push(card);
    });

    it('should log structured data when inking a card', () => {
        const success = executeInkCard(turnManager, player, card.instanceId);

        expect(success).toBe(true);
        expect(player.inkwell).toHaveLength(1);
        expect(player.inkedThisTurn).toBe(true);

        const logEntry = logger.logs.find(l => l.message.includes('inked'));
        expect(logEntry).toBeDefined();
        expect(logEntry.details).toEqual({
            type: 'ink',
            card: 'Mickey Mouse',
            cardId: 'card-1'
        });
    });

    it('should not log if inking fails (already inked)', () => {
        player.inkedThisTurn = true;
        const success = executeInkCard(turnManager, player, card.instanceId);

        expect(success).toBe(false);
        expect(logger.logs.length).toBe(0);
    });

    it('should not log if card is not inkable', () => {
        card.inkwell = false;
        const success = executeInkCard(turnManager, player, card.instanceId);

        expect(success).toBe(false);
        expect(logger.logs.length).toBe(0);
    });
});
