import * as readline from 'readline';
import { CardLoader } from './engine/card-loader';
import { GameStateManager } from './engine/state';
import { TurnManager, ActionType } from './engine/actions';
import { ZoneType, CardInstance } from './engine/models';
import { GameLogger } from './engine/logger';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function main() {
    // Initialize Logger (default to console only for CLI, or maybe file if user wants?)
    // For CLI game, maybe we don't want a file by default unless specified?
    // User said "ideally it will write out to a file that is provided by the user".
    // Let's check args for --log or similar, or just default to null for now.
    // But wait, the user request implies they WANT a file.
    // "ideally it will write out to a file that is provided by the user"
    // I'll add a simple arg check here too.
    const args = process.argv.slice(2);
    const logFile = args.find(a => a.startsWith('--log='))?.split('=')[1];

    const logger = new GameLogger(logFile);

    logger.info('Loading cards...');
    const loader = new CardLoader(logger);
    await loader.loadCards();
    const allCards = loader.getAllCards();

    const game = new GameStateManager();
    const p1Id = game.addPlayer('Player 1');
    const p2Id = game.addPlayer('Player 2'); // Dummy opponent for now
    const p1 = game.getPlayer(p1Id);
    const p2 = game.getPlayer(p2Id);

    // Setup Decks
    for (let i = 0; i < 60; i++) {
        p1.addCardToZone(allCards[i % allCards.length], ZoneType.Deck);
        p2.addCardToZone(allCards[(i + 10) % allCards.length], ZoneType.Deck);
    }

    // Draw Hands
    for (let i = 0; i < 7; i++) {
        p1.hand.push(p1.deck.pop()!);
        p2.hand.push(p2.deck.pop()!);
    }

    const turnManager = new TurnManager(game, logger);

    // Register simple CLI choice handler
    turnManager.registerChoiceHandler(p1Id, async (request) => {
        return new Promise((resolve) => {
            console.log(`\n[CHOICE] ${request.prompt}`);
            request.options.forEach((opt, i) => {
                console.log(`  [${i}] ${opt.display}`);
            });

            // Temporarily pause main loop prompt to get choice
            rl.question('[Choice] Select option (index): ', (answer) => {
                const idx = parseInt(answer);
                if (!isNaN(idx) && idx >= 0 && idx < request.options.length) {
                    const selected = request.options[idx];
                    resolve({
                        requestId: request.id,
                        playerId: p1Id,
                        selectedIds: [selected.id],
                        timestamp: Date.now()
                    });
                } else {
                    // Default to first option if invalid
                    console.log('Invalid selection, defaulting to first option.');
                    resolve({
                        requestId: request.id,
                        playerId: p1Id,
                        selectedIds: [request.options[0].id],
                        timestamp: Date.now()
                    });
                }
                // We don't resume main prompt here; the main loop will resume when resolveAction completes
            });
        });
    });

    turnManager.startGame(p1Id);

    logger.info('\n--- Welcome to Lorcana CLI ---');
    logger.info('Commands: ink <idx>, play <idx>, quest <idx>, challenge <atkIdx> <defIdx>, pass, quit');

    const prompt = () => {
        renderState(game, p1Id);
        rl.question('> ', (line) => {
            const args = line.trim().split(' ');
            const cmd = args[0].toLowerCase();

            if (cmd === 'quit' || cmd === 'exit') {
                rl.close();
                return;
            }

            try {
                handleCommand(cmd, args.slice(1), turnManager, game, p1Id, logger);
            } catch (e) {
                logger.error('Error:', e);
            }

            // If turn passed to P2, simulate P2 turn automatically
            if (game.state.turnPlayerId === p2Id) {
                logger.info('\n--- Opponent Turn (Simulated) ---');
                // Simple AI: Ink first card, Play first playable, Pass
                const ai = game.getPlayer(p2Id);
                if (ai.hand.length > 0 && ai.hand[0].inkwell) {
                    turnManager.resolveAction({ type: ActionType.InkCard, playerId: p2Id, cardId: ai.hand[0].instanceId });
                }
                const playable = ai.hand.find(c => c.cost <= ai.inkwell.filter(i => i.ready).length);
                if (playable) {
                    turnManager.resolveAction({ type: ActionType.PlayCard, playerId: p2Id, cardId: playable.instanceId });
                }
                // Quest with everyone
                ai.play.filter(c => c.ready).forEach(c => {
                    turnManager.resolveAction({ type: ActionType.Quest, playerId: p2Id, cardId: c.instanceId });
                });

                turnManager.resolveAction({ type: ActionType.PassTurn, playerId: p2Id });
            }

            prompt();
        });
    };

    prompt();
}

function renderState(game: GameStateManager, playerId: string) {
    const p = game.getPlayer(playerId);
    const opponentId = Object.keys(game.state.players).find(id => id !== playerId)!;
    const opp = game.getPlayer(opponentId);

    console.log('\n' + '='.repeat(40));
    console.log(`Turn: ${game.state.turnCount} | Phase: ${game.state.phase} | Active: ${game.state.turnPlayerId === playerId ? 'YOU' : 'OPPONENT'}`);
    console.log('-'.repeat(40));

    console.log(`OPPONENT (${opp.name}) | Lore: ${opp.lore} | Hand: ${opp.hand.length} | Ink: ${opp.inkwell.length}`);
    console.log(`Play Zone:`);
    opp.play.forEach((c, i) => {
        const status = c.ready ? 'READY' : 'EXERTED';
        console.log(`  [${i}] ${c.name} (${c.strength}/${c.willpower}) - ${status} (Dmg: ${c.damage})`);
    });

    console.log('-'.repeat(40));

    console.log(`YOU (${p.name}) | Lore: ${p.lore} | Ink: ${p.inkwell.length} (${p.inkwell.filter(c => c.ready).length} ready)`);
    console.log(`Play Zone:`);
    p.play.forEach((c, i) => {
        const status = c.ready ? 'READY' : 'EXERTED';
        const dry = c.turnPlayed < game.state.turnCount ? 'DRY' : 'WET';
        console.log(`  [${i}] ${c.name} (${c.strength}/${c.willpower}) - ${status} [${dry}] (Dmg: ${c.damage})`);

        // Show Activated Abilities
        if (c.parsedEffects) {
            c.parsedEffects.forEach((e, ai) => {
                if (e.trigger === 'activated') {
                    console.log(`      (Ability ${ai}) ${e.rawText}`);
                }
            });
        }
    });

    console.log(`Hand:`);
    p.hand.forEach((c, i) => {
        const ink = c.inkwell ? '(Ink)' : '';
        console.log(`  [${i}] ${c.name} (Cost: ${c.cost}) ${ink}`);
    });
    console.log('='.repeat(40));
}

function handleCommand(cmd: string, args: string[], tm: TurnManager, game: GameStateManager, playerId: string, logger: GameLogger) {
    const p = game.getPlayer(playerId);
    const oppId = Object.keys(game.state.players).find(id => id !== playerId)!;
    const opp = game.getPlayer(oppId);

    if (cmd === 'pass') {
        tm.resolveAction({ type: ActionType.PassTurn, playerId });
        return;
    }

    if (cmd === 'ink') {
        const idx = parseInt(args[0]);
        if (isNaN(idx) || idx < 0 || idx >= p.hand.length) {
            logger.warn('Invalid index');
            return;
        }
        tm.resolveAction({ type: ActionType.InkCard, playerId, cardId: p.hand[idx].instanceId });
        return;
    }

    if (cmd === 'play') {
        const idx = parseInt(args[0]);
        if (isNaN(idx) || idx < 0 || idx >= p.hand.length) {
            logger.warn('Invalid index');
            return;
        }
        tm.resolveAction({ type: ActionType.PlayCard, playerId, cardId: p.hand[idx].instanceId });
        return;
    }

    if (cmd === 'quest') {
        const idx = parseInt(args[0]);
        if (isNaN(idx) || idx < 0 || idx >= p.play.length) {
            logger.warn('Invalid index');
            return;
        }
        tm.resolveAction({ type: ActionType.Quest, playerId, cardId: p.play[idx].instanceId });
        return;
    }

    if (cmd === 'challenge') {
        const atkIdx = parseInt(args[0]);
        const defIdx = parseInt(args[1]);

        if (isNaN(atkIdx) || atkIdx < 0 || atkIdx >= p.play.length) {
            logger.warn('Invalid attacker index');
            return;
        }
        if (isNaN(defIdx) || defIdx < 0 || defIdx >= opp.play.length) {
            logger.warn('Invalid defender index');
            return;
        }

        tm.resolveAction({
            type: ActionType.Challenge,
            playerId,
            cardId: p.play[atkIdx].instanceId,
            targetId: opp.play[defIdx].instanceId
        });
        return;
    }

    if (cmd === 'concede') {
        tm.resolveAction({ type: ActionType.Concede, playerId });
        return;
    }

    if (cmd === 'activate') {
        const idx = parseInt(args[0]);
        const abilityIdx = parseInt(args[1]);

        if (isNaN(idx) || idx < 0 || idx >= p.play.length) {
            logger.warn('Invalid card index');
            return;
        }
        if (isNaN(abilityIdx) || abilityIdx < 0) {
            logger.warn('Invalid ability index');
            return;
        }

        tm.resolveAction({
            type: ActionType.UseAbility,
            playerId,
            cardId: p.play[idx].instanceId,
            abilityIndex: abilityIdx
        });
        return;
    }

    logger.warn('Unknown command');
}

main().catch(e => console.error(e));
