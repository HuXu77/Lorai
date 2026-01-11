
// // Jest globals are automatically available
import { TestHarness } from '../engine-test-utils';
import { ILogger } from '../../engine/logger';
import { CardType } from '../../engine/models';

class CapturingLogger implements ILogger {
    logs: string[] = [];

    log(level: any, message: string, data?: unknown) { this.logs.push(`[LOG] ${message}`); }
    debug(message: string, data?: unknown) { this.logs.push(`[DEBUG] ${message}`); }
    info(message: string, data?: unknown) { this.logs.push(`[INFO] ${message}`); }
    warn(message: string, data?: unknown) { this.logs.push(`[WARN] ${message}`); }
    error(message: string, data?: unknown) { this.logs.push(`[ERROR] ${message}`); }

    action(player: string, action: string, details?: string) {
        this.logs.push(`[ACTION] ${player} ${action}${details ? ': ' + details : ''}`);
    }

    effect(source: string, effect: string, target?: string) {
        this.logs.push(`[EFFECT] ${source} -> ${effect}${target ? ' on ' + target : ''}`);
    }
}

describe('Duplicate Logs', () => {
    it('should not log duplicate "Played Card" messages', async () => {
        const harness = new TestHarness();
        const logger = new CapturingLogger();

        await harness.initialize();
        harness.turnManager.setLogger(logger);

        // Setup: Give player a card
        const player = harness.getPlayer(harness.p1Id);
        const card = harness.createCard(player, {
            name: 'Mickey Mouse',
            type: CardType.Character,
            cost: 1,
            inkwell: true,
            strength: 1,
            willpower: 1,
            lore: 1
        });
        player.hand = [card];
        player.inkwell = [harness.createCard(player, { name: 'Ink', type: CardType.Character, cost: 0, inkwell: true })];
        player.inkwell[0].ready = true; // Ensure ink is ready

        // Action: Play the card
        await harness.playCard(player, card);

        // Assert: Check logs
        const playedLogs = logger.logs.filter(log => log.includes('Played Mickey Mouse'));

        console.log('CAPTURED LOGS:', JSON.stringify(logger.logs, null, 2));

        // We expect EXACTLY one log entry for playing the card
        expect(playedLogs.length).toBe(1);
    });

    it('should not log duplicate "Played Action" messages', async () => {
        const harness = new TestHarness();
        const logger = new CapturingLogger();

        await harness.initialize();
        harness.turnManager.setLogger(logger);

        // Setup: Give player an Action card
        const player = harness.getPlayer(harness.p1Id);
        const card = harness.createCard(player, {
            name: 'Dragon Fire',
            type: CardType.Action,
            cost: 1,
            inkwell: true
        });
        player.hand = [card];
        player.inkwell = [harness.createCard(player, { name: 'Ink', type: CardType.Character, cost: 0, inkwell: true })];
        player.inkwell[0].ready = true;

        // Action: Play the card
        // Note: Actions might require a target, but Dragon Fire usually banishes chosen character. 
        // If no valid target (empty board), it might fizzle or generic play.
        // Let's use a simple action like "Heal" or generic.

        await harness.playCard(player, card);

        // Assert: Check logs
        // Usually logs 'Played Action Dragon Fire'
        const playedLogs = logger.logs.filter(log => log.includes('Played Action Dragon Fire'));

        console.log('CAPTURED ACTION LOGS:', JSON.stringify(logger.logs, null, 2));

        // We expect EXACTLY one log entry
        expect(playedLogs.length).toBe(1);
    });
});
