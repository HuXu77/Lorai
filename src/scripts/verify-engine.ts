import { GameStateManager } from '../engine/state';
import { TurnManager, ActionType } from '../engine/actions';
import { CardLoader } from '../engine/card-loader';
import { ZoneType } from '../engine/models';
import { RandomBot } from '../ai/random-bot';

async function main() {
    console.log('--- Starting Engine Verification Simulation ---');

    // 1. Initialize Game
    const loader = new CardLoader();
    await loader.loadCards();
    const allCards = loader.getAllCards();

    const game = new GameStateManager();
    const p1Id = game.addPlayer('Bot 1');
    const p2Id = game.addPlayer('Bot 2');
    const p1 = game.getPlayer(p1Id);
    const p2 = game.getPlayer(p2Id);

    // 2. Setup Decks (Mirror Match)
    for (let i = 0; i < 60; i++) {
        p1.addCardToZone(allCards[i % allCards.length], ZoneType.Deck);
        p2.addCardToZone(allCards[i % allCards.length], ZoneType.Deck);
    }

    // 3. Draw Hands
    for (let i = 0; i < 7; i++) {
        p1.hand.push(p1.deck.pop()!);
        p2.hand.push(p2.deck.pop()!);
    }


    class PersistentBot extends RandomBot {
        async decideAction(gameState: any): Promise<any> {
            const validActions = (this as any).turnManager.getValidActions((this as any).playerId);
            const nonConcedeActions = validActions.filter((a: any) => a.type !== ActionType.Concede);

            if (nonConcedeActions.length === 0) {
                // If only concede is left, pass turn instead if possible, or just pass
                return { type: ActionType.PassTurn, playerId: (this as any).playerId };
            }

            const randomIndex = Math.floor(Math.random() * nonConcedeActions.length);
            return nonConcedeActions[randomIndex];
        }
    }

    const turnManager = new TurnManager(game);
    const bot1 = new PersistentBot(turnManager);
    const bot2 = new PersistentBot(turnManager);

    bot1.onGameStart(p1Id, game.state);
    bot2.onGameStart(p2Id, game.state);

    turnManager.startGame(p1Id);

    // 4. Game Loop
    let turnCount = 0;
    const maxTurns = 20;

    while (!game.state.winnerId && turnCount < maxTurns) {
        turnCount++;
        const activePlayerId = game.state.turnPlayerId;
        const activeBot = activePlayerId === p1Id ? bot1 : bot2;
        const player = game.getPlayer(activePlayerId);
        const opponentId = activePlayerId === p1Id ? p2Id : p1Id;
        const opponent = game.getPlayer(opponentId);

        console.log(`\n--- Turn ${game.state.turnCount}: ${player.name} ---`);

        // --- VERIFICATION CHECKS ---
        console.log('Running verification checks...');

        // Check 1: Quest with card in hand (Should Fail)
        if (player.hand.length > 0) {
            const cardInHand = player.hand[0];
            const result = await turnManager.resolveAction({
                type: ActionType.Quest,
                playerId: activePlayerId,
                cardId: cardInHand.instanceId
            });
            if (result) console.error('❌ FAILED: Engine allowed questing from hand!');
            else console.log('✅ PASSED: Engine blocked questing from hand.');
        }

        // Check 2: Play card with insufficient ink (Should Fail)
        const expensiveCard = player.hand.find(c => c.cost > player.inkwell.filter(i => i.ready).length);
        if (expensiveCard) {
            const result = await turnManager.resolveAction({
                type: ActionType.PlayCard,
                playerId: activePlayerId,
                cardId: expensiveCard.instanceId
            });
            if (result) console.error(`❌ FAILED: Engine allowed playing ${expensiveCard.name} without enough ink!`);
            else console.log('✅ PASSED: Engine blocked playing card without enough ink.');
        }

        // Check 3: Challenge ready character (Should Fail - unless Rush/special ability)
        // Note: This is a basic check. Some cards might allow this, but generally it's illegal.
        const readyOpponent = opponent.play.find(c => c.ready);
        const myChallenger = player.play.find(c => c.ready && c.turnPlayed < game.state.turnCount); // Dry and ready
        if (readyOpponent && myChallenger && !myChallenger.meta?.canChallengeReady) {
            const result = await turnManager.resolveAction({
                type: ActionType.Challenge,
                playerId: activePlayerId,
                cardId: myChallenger.instanceId,
                targetId: readyOpponent.instanceId
            });
            if (result) console.error('❌ FAILED: Engine allowed challenging a ready character!');
            else console.log('✅ PASSED: Engine blocked challenging a ready character.');
        }

        // Check 4: Ink card twice (Should Fail)
        // We'll try to ink, then try to ink again immediately if the first succeeded
        const inkable = player.hand.find(c => c.inkwell);
        if (inkable && !player.inkedThisTurn) {
            // First ink (valid) - we won't actually do it here to let the bot decide, 
            // but we'll simulate the "already inked" state check by setting the flag manually for a moment
            player.inkedThisTurn = true;
            const result = await turnManager.resolveAction({
                type: ActionType.InkCard,
                playerId: activePlayerId,
                cardId: inkable.instanceId
            });
            if (result) console.error('❌ FAILED: Engine allowed inking twice!');
            else console.log('✅ PASSED: Engine blocked inking twice.');
            player.inkedThisTurn = false; // Reset
        }

        // --- END VERIFICATION CHECKS ---

        // Bot takes turn
        try {
            // Simple loop to take actions until pass
            let actionTaken = true;
            while (actionTaken) {
                try {
                    const action = await activeBot.decideAction(game.state);
                    console.log(`Bot Action: ${action.type} ${action.cardId ? 'on ' + action.cardId : ''}`);
                    const success = turnManager.resolveAction(action);
                    if (!success) {
                        console.warn('Bot attempted invalid action (should be filtered by getValidActions):', action);
                        actionTaken = false; // Stop if bot fails
                    }
                    if (action.type === ActionType.PassTurn) {
                        actionTaken = false;
                    }
                } catch (e) {
                    console.log('Bot has no more valid actions or passed.');
                    actionTaken = false;
                    turnManager.resolveAction({ type: ActionType.PassTurn, playerId: activePlayerId });
                }
            }
        } catch (e) {
            console.error('Error during bot turn:', e);
            break;
        }
    }

    console.log('\n--- Simulation Complete ---');
}

main().catch(console.error);
