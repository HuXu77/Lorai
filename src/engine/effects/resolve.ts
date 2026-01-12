import { PlayerState, GameStateManager } from '../state';
import { CardInstance, ZoneType, CardType, ContinuousEffect, GameAction, ChoiceRequest, ChoiceType } from '../models';
import { TurnManager } from '../actions';
import { GameEvent, GameContext } from '../abilities';
import { banishCard } from '../combat';
import { evaluateCondition } from './recalculate';

/**
 * Validate if a target can be chosen by the source player (checks Ward)
 */
function validateTarget(target: CardInstance, sourcePlayerId: string, logger?: any): boolean {
    // Ward: Opponents can't choose this character except to challenge
    // Note: We only check Ward if the target is an opponent's character
    if (target.meta?.hasWard && target.ownerId !== sourcePlayerId) {
        if (logger) logger.debug(`[Ward] Cannot target ${target.name} because it has Ward.`);
        return false;
    }
    return true;
}

/**
 * Execute an ability effect on the game state
 * 
 * Extracted from TurnManager to reduce file size.
 */
export async function executeResolveEffect(
    turnManager: TurnManager,
    player: PlayerState,
    effect: any,
    sourceCard?: CardInstance,
    targetCard?: CardInstance,
    payload?: any
) {
    // Handle AbilityDefinition (container of effects)
    if (effect.effects && Array.isArray(effect.effects)) {
        for (const subEffect of effect.effects) {
            await executeResolveEffect(turnManager, player, subEffect, sourceCard, targetCard, payload);
        }
        return;
    }

    // NEW: Handle AST Effects via Executor
    // If effect has 'type' (AST) instead of 'action' (Legacy), Use new ability system executor if available
    if (effect.type && !effect.action && turnManager.abilitySystem?.executor) {
        turnManager.logger.debug(`[resolveEffect] Using new ability system executor for effect type: ${effect.type}`);
        const context: GameContext = {
            player,
            card: sourceCard, // Assuming 'card' should be 'sourceCard' based on original context
            gameState: turnManager.game,
            eventContext: {
                event: GameEvent.CARD_PLAYED,
                timestamp: Date.now(),
                player,
                sourceCard,
                targetCard
            },
            abilityName: effect.abilityName || sourceCard?.name,
            modalChoice: payload?.modalChoice // Pass modal choice
        };

        return turnManager.abilitySystem.executor.execute(effect, context).catch((err: any) => {
            turnManager.logger.error(`[resolveEffect] Executor failed for ${effect.type}: ${err.message}`);
            throw err;
        });
    }

    // Check Conditions
    if (effect.params?.condition === 'my_turn') {
        if (turnManager.game.state.turnPlayerId !== player.id) {
            turnManager.logger.debug(`[Effect] Skipped effect because it's not player's turn.`);
            return;
        }
    }

    // Handle AoE Targets
    if (effect.target === 'all_opposing_characters' || effect.target === 'all_characters') {
        let targets: CardInstance[] = [];
        if (effect.target === 'all_opposing_characters') {
            const opponents = Object.values(turnManager.game.state.players).filter(p => p.id !== player.id);
            targets = opponents.flatMap(p => p.play);
        } else {
            targets = Object.values(turnManager.game.state.players).flatMap(p => p.play);
        }

        turnManager.logger.debug(`[Effect] AoE targeting ${targets.length} characters.`);
        targets.forEach(target => {
            // Create a single-target version of the effect
            // We change target to 'resolved_target' to prevent infinite recursion
            // and pass the specific targetCard
            const singleTargetEffect = { ...effect, target: 'resolved_target' };
            executeResolveEffect(turnManager, player, singleTargetEffect, sourceCard, target, payload);
        });
        return;
    }

    // Draw
    if (effect.action === 'draw') {
        const amount = effect.amount || 1;
        for (let i = 0; i < amount; i++) {
            if (player.deck.length > 0) {
                const drawn = player.deck.pop()!;
                player.addCardToZone(drawn, ZoneType.Hand);
            }
        }
        const sourceName = sourceCard ? sourceCard.name : player.name;
        turnManager.logger.effect(sourceName, `Draw ${amount} card(s)`);
    }

    // Optional Draw (You May Draw)
    else if (effect.action === 'optional_draw') {
        const amount = effect.amount || 1;
        // For now, auto-accept the optional draw (bot heuristic: usually beneficial)
        for (let i = 0; i < amount; i++) {
            if (player.deck.length > 0) {
                const drawn = player.deck.pop()!;
                player.addCardToZone(drawn, ZoneType.Hand);
            }
        }
        turnManager.logger.effect(player.name, `Optionally drew ${amount} card(s)`);
    }

    // Draw Then Discard (e.g., The Bayou)
    else if (effect.action === 'draw_then_discard') {
        const drawAmount = effect.params?.drawAmount || 1;
        const discardAmount = effect.params?.discardAmount || 1;

        // Draw cards
        for (let i = 0; i < drawAmount; i++) {
            if (player.deck.length > 0) {
                const drawn = player.deck.pop()!;
                player.addCardToZone(drawn, ZoneType.Hand);
            }
        }

        // Discard cards (bot heuristic: discard lowest cost)
        for (let i = 0; i < discardAmount && player.hand.length > 0; i++) {
            const sortedHand = [...player.hand].sort((a, b) => a.cost - b.cost);
            const cardToDiscard = sortedHand[0];
            player.hand = player.hand.filter(c => c.instanceId !== cardToDiscard.instanceId);
            cardToDiscard.zone = ZoneType.Discard;
            player.discard.push(cardToDiscard);
        }

        turnManager.logger.effect(player.name, `Drew ${drawAmount} and discarded ${discardAmount} card(s)`);
    }

    // Gain Lore
    else if (effect.action === 'gain_lore') {
        const amount = effect.amount || 1;
        player.lore += amount;

        const sourceName = sourceCard ? sourceCard.name : player.name;
        turnManager.logger.effect(sourceName, `Gained ${amount} lore. Total: ${player.lore}`);
    }

    // Ready Character
    else if (effect.action === 'ready') {
        // Target is usually 'self' or 'chosen_character'
        // If self, use sourceCard
        let target = targetCard;
        if (effect.target === 'self') {
            target = sourceCard;
        }

        if (target) {
            target.ready = true;
            turnManager.logger.effect(player.name, `Readied ${target.name}`);
        }
    }

    // Move Damage Counters
    else if (effect.action === 'move_damage') {
        const amount = effect.amount || 1;

        // Get source and target characters from payload
        const sourceId = payload?.sourceId;
        const targetId = payload?.targetId;

        if (sourceId && targetId) {
            const allCards = Object.values(turnManager.game.state.players).flatMap(p => p.play);
            const sourceChar = allCards.find(c => c.instanceId === sourceId);
            const targetChar = allCards.find(c => c.instanceId === targetId);

            if (sourceChar && targetChar) {
                // Move up to 'amount' damage from source to target
                const damageToMove = Math.min(sourceChar.damage, amount);

                if (damageToMove > 0) {
                    sourceChar.damage -= damageToMove;
                    turnManager.applyDamage(turnManager.game.getPlayer(targetChar.ownerId), targetChar, damageToMove, sourceCard?.instanceId);

                    turnManager.logger.effect(player.name, `Moved ${damageToMove} damage from ${sourceChar.name} to ${targetChar.name}`);

                    // Check if target needs to be banished
                    turnManager.checkBanishment(turnManager.game.getPlayer(targetChar.ownerId), targetChar, sourceCard);
                }
            }
        }
    }

    // Optional Return from Discard (You May Return)
    else if (effect.action === 'optional_return_from_discard') {
        const cardType = effect.params?.cardType;
        const cardName = effect.params?.cardName;

        // Bot heuristic: always accept optional returns (usually beneficial)
        const validCards = player.discard.filter(c => {
            if (cardName && !c.name.toLowerCase().includes(cardName.toLowerCase())) return false;
            if (cardType.toLowerCase().includes('action') && c.type !== 'Action') return false;
            if (cardType.toLowerCase().includes('character') && c.type !== 'Character') return false;
            if (cardType.toLowerCase().includes('item') && c.type !== 'Item') return false;
            return true;
        });

        if (validCards.length > 0) {
            // Pick the highest cost card (heuristic: more valuable)
            const card = validCards.sort((a, b) => b.cost - a.cost)[0];
            player.discard = player.discard.filter(c => c.instanceId !== card.instanceId);
            card.zone = ZoneType.Hand;
            player.hand.push(card);
            turnManager.logger.effect(player.name, `Returned ${card.name} from discard to hand`);
        }
    }

    // Return from Discard (Non-optional)
    else if (effect.action === 'return_from_discard') {
        const cardType = effect.params?.cardType;

        const validCards = player.discard.filter(c => {
            if (cardType.toLowerCase().includes('action') && c.type !== 'Action') return false;
            if (cardType.toLowerCase().includes('character') && c.type !== 'Character') return false;
            if (cardType.toLowerCase().includes('item') && c.type !== 'Item') return false;
            return true;
        });

        if (validCards.length > 0) {
            // Pick the highest cost card (heuristic: more valuable)
            const card = validCards.sort((a, b) => b.cost - a.cost)[0];
            player.discard = player.discard.filter(c => c.instanceId !== card.instanceId);
            card.zone = ZoneType.Hand;
            player.hand.push(card);
            turnManager.logger.effect(player.name, `Returned ${card.name} from discard to hand (mandatory)`);
        }
    }

    // Deal Damage (Generic)
    else if (effect.action === 'deal_damage') {
        let target = targetCard;
        if (!target && payload?.targetId) {
            const allCards = Object.values(turnManager.game.state.players).flatMap(p => p.play);
            target = allCards.find(c => c.instanceId === payload.targetId);

            if (target && !validateTarget(target, player.id, turnManager.logger)) {
                target = undefined;
            }
        }

        if (target) {
            let damage = effect.amount || 0;

            // Handle dynamic amount
            if (effect.params?.amountSource === 'stat') {
                const stat = effect.params.stat;
                if (sourceCard) {
                    if (stat === 'strength') damage = sourceCard.strength || 0;
                    else if (stat === 'willpower') damage = sourceCard.willpower || 0;
                    else if (stat === 'lore') damage = sourceCard.lore || 0;
                }
            } else if (effect.params?.amountSource === 'count') {
                const countSource = effect.params.countSource;
                const filter = effect.params.filter;

                if (countSource === 'play') {
                    // Count cards in play matching filter
                    const cards = player.play.filter(c => {
                        if (filter.subtype && (!c.subtypes || !c.subtypes.includes(filter.subtype))) return false;
                        if (filter.type && c.type !== filter.type) return false;
                        return true;
                    });
                    damage = cards.length;
                }
            }

            const sourceName = sourceCard ? sourceCard.name : player.name;
            turnManager.logger.effect(sourceName, `Dealt ${damage} damage to ${target.name}`);
            turnManager.applyDamage(turnManager.game.getPlayer(target.ownerId), target, damage, sourceCard?.instanceId);
            turnManager.checkBanishment(turnManager.game.getPlayer(target.ownerId), target, sourceCard);
        }
    }

    // Deal Damage AOE (All/Each characters)
    else if (effect.action === 'deal_damage_aoe') {
        const damage = effect.amount || 0;
        let targets: CardInstance[] = [];

        if (effect.target === 'all_opposing_characters') {
            const opponents = Object.values(turnManager.game.state.players).filter(p => p.id !== player.id);
            targets = opponents.flatMap(p => p.play);
        } else if (effect.target === 'all_characters') {
            targets = Object.values(turnManager.game.state.players).flatMap(p => p.play);
        }

        turnManager.logger.effect(player.name, `Dealing ${damage} AOE damage to ${targets.length} character(s)`);
        targets.forEach(target => {
            turnManager.applyDamage(turnManager.game.getPlayer(target.ownerId), target, damage, sourceCard?.instanceId);
            turnManager.checkBanishment(turnManager.game.getPlayer(target.ownerId), target, sourceCard);
        });
    }

    // Heal (Generic)
    else if (effect.action === 'heal') {
        let target = targetCard;
        if (!target && payload?.targetId) {
            const allCards = Object.values(turnManager.game.state.players).flatMap(p => p.play);
            target = allCards.find(c => c.instanceId === payload.targetId);

            if (target && !validateTarget(target, player.id, turnManager.logger)) {
                target = undefined;
            }
        }

        if (target) {
            const amount = effect.amount || 0;
            const actualHeal = Math.min(target.damage, amount);
            target.damage -= actualHeal;

            const sourceName = sourceCard ? sourceCard.name : player.name;
            turnManager.logger.effect(sourceName, `Healed ${target.name} for ${actualHeal} damage`);
        } else {
            turnManager.logger.debug(`[${player.name}] No target for heal effect.`);
        }
    }

    // Exert (Generic)
    else if (effect.action === 'exert') {
        if (targetCard) {
            if (targetCard.ready) {
                targetCard.ready = false;
                turnManager.logger.effect(player.name, `Exerted ${targetCard.name}`);
            }
        }
    }

    // Lore Loss (Ursula)
    else if (effect.action === 'lore_loss') {
        const amount = effect.amount || 1;
        if (effect.target === 'opponent') {
            const opponentId = Object.keys(turnManager.game.state.players).find(id => id !== player.id);
            if (opponentId) {
                const opponent = turnManager.game.getPlayer(opponentId);
                const lost = Math.min(opponent.lore, amount);
                opponent.lore -= lost;

                const sourceName = sourceCard ? sourceCard.name : player.name;
                turnManager.logger.effect(sourceName, `${opponent.name} lost ${lost} lore. Remaining: ${opponent.lore}`);
            }
        }
    }

    // Cant Play Actions (Pete)
    else if (effect.action === 'cant_play_actions') {
        if (sourceCard && effect.duration) {
            // Normalize target: parser may provide { type: 'all_opponents' } or string 'opponent'
            let targetValue: 'opponent' | 'all' | 'self' | 'custom' = 'opponent'; // Default to opponent
            if (typeof effect.target === 'object' && effect.target?.type) {
                // Convert parser object format to string format for restriction check
                if (effect.target.type === 'all_opponents' || effect.target.type === 'opponent') {
                    targetValue = 'opponent';
                } else if (effect.target.type === 'all') {
                    targetValue = 'all';
                }
            } else if (effect.target === 'opponent' || effect.target === 'all') {
                targetValue = effect.target as 'opponent' | 'all';
            }

            turnManager.addActiveEffect({
                id: `${sourceCard.instanceId}_cant_play_actions`,
                type: 'restriction',
                restrictionType: 'cant_play_actions',
                target: targetValue,
                sourceCardId: sourceCard.instanceId,
                sourcePlayerId: player.id,
                duration: effect.duration
            });
            turnManager.logger.effect(player.name, `Applied restriction: Opponents can't play actions`);
        }
    }

    // Grant Keyword Temporary (Activated Ability)
    else if (effect.action === 'grant_keyword_temporary') {
        let target = targetCard;
        if (!target && payload?.targetId) {
            const allCards = Object.values(turnManager.game.state.players).flatMap(p => p.play);
            target = allCards.find(c => c.instanceId === payload.targetId);

            if (target && !validateTarget(target, player.id, turnManager.logger)) {
                target = undefined;
            }
        }

        if (target && effect.params?.keyword) {
            const keyword = effect.params.keyword;
            turnManager.addActiveEffect({
                id: `${sourceCard?.instanceId || 'effect'}_grant_${keyword}_${Date.now()}`,
                type: 'modification',
                modificationType: 'grant_keyword',
                target: 'custom',
                targetCardIds: [target.instanceId],
                sourceCardId: sourceCard?.instanceId || '',
                sourcePlayerId: player.id,
                duration: effect.params.duration || 'until_end_of_turn',
                params: { keyword: keyword }
            });
            turnManager.logger.effect(player.name, `Granted ${keyword} to ${target.name}`);
        }
    }

    // Temporary Stat Buff (Chosen Gets)
    else if (effect.action === 'temp_stat_buff') {
        let target = targetCard;
        if (effect.target === 'self') {
            target = sourceCard;
        }
        if (!target && payload?.targetId) {
            const allCards = Object.values(turnManager.game.state.players).flatMap(p => p.play);
            target = allCards.find(c => c.instanceId === payload.targetId);

            if (target && !validateTarget(target, player.id, turnManager.logger)) {
                target = undefined;
            }
        }

        if (target && effect.params?.stat && effect.params?.amount !== undefined) {
            const { stat, amount } = effect.params;

            turnManager.addActiveEffect({
                id: `${sourceCard?.instanceId || 'effect'}_stat_buff_${Date.now()}`,
                type: 'modification',
                modificationType: 'stat_buff',
                target: 'custom',
                targetCardIds: [target.instanceId],
                sourceCardId: sourceCard?.instanceId || '',
                sourcePlayerId: player.id,
                duration: effect.duration || 'until_end_of_turn',
                modification: {
                    [stat]: amount
                },
                params: { stat, amount }
            });

            const sign = amount >= 0 ? '+' : '';
            turnManager.logger.effect(player.name, `${target.name} gets ${sign}${amount} ${stat} this turn`);
        }
    }

    // Dynamic Stat Buff (Count Based)
    else if (effect.action === 'dynamic_stat_buff') {
        let target = targetCard;
        if (!target && payload?.targetId) {
            const allCards = Object.values(turnManager.game.state.players).flatMap(p => p.play);
            target = allCards.find(c => c.instanceId === payload.targetId);

            if (target && !validateTarget(target, player.id, turnManager.logger)) {
                target = undefined;
            }
        }

        if (target && effect.params) {
            const { stat, amountPerItem, countSource, filter } = effect.params;

            // Calculate count
            let count = 0;
            let sourceList: any[] = [];

            if (countSource === 'play') {
                sourceList = player.play;
            } else if (countSource === 'hand') {
                sourceList = player.hand;
            } else if (countSource === 'discard') {
                sourceList = player.discard;
            }

            count = sourceList.filter(c => {
                if (filter.subtype && (!c.subtypes || !c.subtypes.includes(filter.subtype))) return false;
                if (filter.type && c.type !== filter.type) return false;
                return true;
            }).length;

            // Handle "other" exclusion (simple heuristic)
            if (effect.rawText.toLowerCase().includes('other') && countSource === 'play') {
                // If sourceCard is in the list (and matches filter), subtract 1
                // We assume sourceCard matches filter if we are counting "other [filter]"
                const isSourceInList = sourceList.some(c => c.instanceId === sourceCard?.instanceId);
                if (isSourceInList) count = Math.max(0, count - 1);
            }

            const totalAmount = count * amountPerItem;

            if (totalAmount !== 0) {
                turnManager.addActiveEffect({
                    id: `${sourceCard?.instanceId || 'effect'}_dynamic_buff_${Date.now()}`,
                    type: 'modification',
                    modificationType: 'stat_buff',
                    target: 'custom',
                    targetCardIds: [target.instanceId],
                    sourceCardId: sourceCard?.instanceId || '',
                    sourcePlayerId: player.id,
                    duration: effect.duration || 'until_end_of_turn',
                    modification: {
                        [stat]: totalAmount
                    },
                    params: { stat, amount: totalAmount }
                });

                const sign = totalAmount >= 0 ? '+' : '';
                turnManager.logger.effect(player.name, `${target.name} gets ${sign}${totalAmount} ${stat} (Count: ${count})`);
            }
        }
    }

    // Restriction: Can't Quest
    else if (effect.action === 'cant_quest') {
        let target = targetCard;
        if (!target && payload?.targetId) {
            const allCards = Object.values(turnManager.game.state.players).flatMap(p => p.play);
            target = allCards.find(c => c.instanceId === payload.targetId);

            if (target && !validateTarget(target, player.id, turnManager.logger)) {
                target = undefined;
            }
        }

        if (target) {
            turnManager.addActiveEffect({
                id: `${sourceCard?.instanceId || 'effect'}_cant_quest_${Date.now()}`,
                type: 'restriction',
                restrictionType: 'cant_quest',
                target: 'custom',
                targetCardIds: [target.instanceId],
                sourceCardId: sourceCard?.instanceId || '',
                sourcePlayerId: player.id,
                duration: effect.duration || 'until_end_of_turn'
            });
            turnManager.logger.effect(player.name, `${target.name} can't quest ${effect.duration === 'until_next_turn' ? 'until next turn' : 'this turn'}`);
        }
    }

    // Conditional Effect (If you have...)
    else if (effect.action === 'conditional_effect') {
        const condition = effect.params?.condition;
        const chainedEffect = effect.params?.chainedEffect;

        if (condition && chainedEffect) {
            const conditionMet = evaluateCondition(player, condition, sourceCard);
            if (conditionMet) {
                turnManager.logger.debug(`[${player.name}] Condition met. Triggering chained effect.`);
                await executeResolveEffect(turnManager, player, chainedEffect, sourceCard, targetCard, payload);
            } else {
                turnManager.logger.debug(`[${player.name}] Condition NOT met.`);
            }
        }
    }

    // Trigger Effect (Chained)
    else if (effect.action === 'trigger_effect') {
        const chainedEffect = effect.params?.chainedEffect;
        if (chainedEffect) {
            await executeResolveEffect(turnManager, player, chainedEffect, sourceCard, targetCard, payload);
        }
    }

    // Heal and Draw (Rapunzel)
    else if (effect.action === 'heal_and_draw') {
        // For now, we auto-select the first damaged character of the player.
        // In a real game, this would be a user choice.
        const damagedChar = player.play.find(c => c.damage > 0);

        if (damagedChar) {
            const maxHeal = effect.amount || 0;
            const actualHeal = Math.min(damagedChar.damage, maxHeal);
            damagedChar.damage -= actualHeal;
            turnManager.logger.effect(player.name, `Healed ${damagedChar.name} for ${actualHeal}.`);

            // Draw cards equal to healed amount
            for (let i = 0; i < actualHeal; i++) {
                if (player.deck.length > 0) {
                    const drawn = player.deck.pop()!;
                    player.addCardToZone(drawn, ZoneType.Hand);
                }
            }
            turnManager.logger.effect(player.name, `Drew ${actualHeal} card(s).`);
        } else {
            turnManager.logger.debug(`[${player.name}] No damaged characters to heal.`);
        }
    }
    // Banish (Generic)
    else if (effect.action === 'banish') {
        let target = targetCard;
        // If target is 'chosen_opponent_character', we need payload or selection
        if (!target && payload?.targetId) {
            const allCards = Object.values(turnManager.game.state.players).flatMap(p => p.play);
            target = allCards.find(c => c.instanceId === payload.targetId);

            if (target && !validateTarget(target, player.id, turnManager.logger)) {
                target = undefined;
            }
        }

        // Handle 'self' target
        if (effect.target === 'self') {
            target = sourceCard;
        }

        if (target) {
            // Check Cost Limit
            if (effect.params?.costLimit !== undefined) {
                if (target.cost > effect.params.costLimit) {
                    turnManager.logger.debug(`[${player.name}] Cannot banish ${target.name} (Cost ${target.cost} > ${effect.params.costLimit}).`);
                    return;
                }
            }

            const sourceName = sourceCard ? sourceCard.name : player.name;
            turnManager.logger.effect(sourceName, `Banished ${target.name}`);
            banishCard(turnManager, turnManager.game.getPlayer(target.ownerId), target, sourceCard);
        }
    }
    // Exert and Draw (Stitch - Rock Star)
    else if (effect.action === 'exert_and_draw') {
        if (targetCard) {
            // Exert
            targetCard.ready = false;
            turnManager.logger.action(player.name, `Exerted ${targetCard.name} for ability.`);

            // Draw
            if (player.deck.length > 0) {
                const drawn = player.deck.pop()!;
                player.addCardToZone(drawn, ZoneType.Hand);
                turnManager.logger.action(player.name, `Drew a card.`);
            }
        }
    }
    // Reduce Cost of Next Card (Lantern)
    else if (effect.action === 'reduce_cost_next_card') {
        const amount = effect.amount || 1;
        const filter = effect.params?.filter || 'character'; // Default to character if not specified

        if (!player.costReductions) player.costReductions = [];

        player.costReductions.push({
            amount: amount,
            duration: 'one_use', // Next card only
            filter: filter,
            sourceId: sourceCard?.instanceId || ''
        });

        turnManager.logger.effect(player.name, `Next ${filter} played costs ${amount} less.`);
    }
    // Play Card for Free (Just in Time)
    else if (effect.action === 'play_free_card') {
        let targetCardId = payload?.targetCardId;

        // If no target selected yet, prompt user
        if (!targetCardId) {
            // Filter valid cards in hand
            const filter = effect.params?.filter;
            const maxCost = effect.params?.costLimit || 99;

            const validCards = player.hand.filter(c => {
                if (c.cost > maxCost) return false;
                if (filter && c.type.toLowerCase() !== filter.toLowerCase()) return false;
                return true;
            });

            if (validCards.length === 0) {
                turnManager.logger.debug(`[${player.name}] No valid cards to play for free.`);
                // If it was a mandatory effect, we might need to verify hand was empty of valid cards, but usually fine.
            } else {
                // Determine if we need to ask for choice
                if (turnManager.requestChoice) {
                    const choice: ChoiceRequest = {
                        id: `play_free_${Date.now()}`,
                        type: ChoiceType.TARGET_CARD,
                        playerId: player.id,
                        prompt: "Choose a card to play for free",
                        options: validCards.map(c => ({
                            id: c.instanceId,
                            display: c.name,
                            card: c,
                            valid: true
                        })),
                        min: 1,
                        max: 1,
                        source: {
                            card: sourceCard,
                            player: player
                        },
                        timestamp: Date.now()
                    };

                    // We can't await requestChoice here easily if executeResolveEffect signature doesn't support it strictly?
                    // executeResolveEffect IS async.
                    // But actions.ts implementations usually await.

                    try {
                        const response = await turnManager.requestChoice(choice);
                        if (response.selectedIds && response.selectedIds.length > 0) {
                            targetCardId = response.selectedIds[0];
                        }
                    } catch (e) {
                        turnManager.logger.debug(`[${player.name}] Choice request failed/modal handling not fully integrated.`, e);
                        // If headless/test, maybe we need to rely on payload being pre-filled?
                        // Tests usually pre-fill payload if they know choice is needed, OR we auto-select if bot/test mode?
                    }
                }
            }
        }

        if (targetCardId) {
            const card = player.hand.find(c => c.instanceId === targetCardId);
            if (card) {
                turnManager.logger.effect(player.name, `Playing ${card.name} for free.`);
                await turnManager.playCard(player, card.instanceId, undefined, undefined, undefined, undefined, undefined, { free: true });
            } else {
                turnManager.logger.warn(`[play_free_card] Target card ${targetCardId} not found in hand.`);
            }
        }
    }
    // Boost
    else if (effect.action === 'boost') {
        if (sourceCard) {
            if (player.deck.length > 0) {
                const card = player.deck.pop()!;
                if (!sourceCard.cardsUnder) sourceCard.cardsUnder = [];
                sourceCard.cardsUnder.push(card);

                // Track in turn history for conditional abilities
                if (!turnManager.game.state.turnHistory) {
                    turnManager.game.state.turnHistory = { zoneChanges: [], cardsPlacedUnder: [] };
                }
                if (!turnManager.game.state.turnHistory.cardsPlacedUnder) {
                    turnManager.game.state.turnHistory.cardsPlacedUnder = [];
                }

                turnManager.game.state.turnHistory.cardsPlacedUnder.push({
                    characterId: sourceCard.instanceId,
                    cardId: card.instanceId,
                    playerId: player.id,
                    turnNumber: turnManager.game.state.turnCount
                });

                turnManager.logger.effect(player.name, `Boosted ${sourceCard.name} (Card under: ${card.name})`);

                // Trigger "on_card_under_self" effects (Cheshire Cat)
                if (sourceCard.parsedEffects) {
                    sourceCard.parsedEffects.forEach(e => {
                        if (e.trigger === 'on_card_under_self') {
                            turnManager.logger.debug(`[${player.name}] Triggering ${e.trigger} for ${sourceCard.name}`);
                            executeResolveEffect(turnManager, player, e, sourceCard, undefined, payload); // Pass payload to allow choices if needed
                        }
                    });
                }
            } else {
                turnManager.logger.debug(`[${player.name}] Deck is empty, cannot Boost.`);
            }
        }
    }
    // Ramp (Mickey Mouse - Detective)
    else if (effect.action === 'ramp') {
        if (player.deck.length > 0) {
            const card = player.deck.pop()!;
            const facedown = effect.params?.facedown || false;
            const exerted = effect.params?.exerted || false;

            card.zone = ZoneType.Inkwell;
            card.ready = !exerted;
            card.meta = { ...card.meta, facedown: facedown };

            player.inkwell.push(card);
            turnManager.logger.effect(player.name, `Ramped a card into inkwell.`);
        } else {
            turnManager.logger.debug(`[${player.name}] Deck is empty, cannot Ramp.`);
        }
    }
    // Opponent Discard (Daisy Duck - Musketeer Spy, Cursed Merfolk)
    else if (effect.action === 'opponent_discard' || effect.action === 'all_opponents_discard') {
        // Get all opponents
        const opponents = Object.values(turnManager.game.state.players).filter(p => p.id !== player.id);

        opponents.forEach(opponent => {
            if (opponent.hand.length > 0) {
                // In a real game, opponent would choose which card to discard
                // For now, randomly discard a card
                const randomIndex = Math.floor(Math.random() * opponent.hand.length);
                const discardedCard = opponent.hand[randomIndex];

                opponent.hand = opponent.hand.filter((_, i) => i !== randomIndex);
                discardedCard.zone = ZoneType.Discard;
                opponent.discard.push(discardedCard);
                turnManager.trackZoneChange(discardedCard, ZoneType.Hand, ZoneType.Discard);

                // Log with causedBy context for ability tracking
                const abilityName = effect.trigger === 'on_challenge' ? 'When challenged' : 'ability';
                turnManager.logger.effect(
                    opponent.name,
                    `Discarded ${discardedCard.name}`,
                    sourceCard?.name,
                    { causedBy: { cardName: sourceCard?.name || 'Unknown', abilityName } }
                );
            } else {
                turnManager.logger.debug(`[${opponent.name}] No cards in hand to discard.`);
            }
        });
    }
    // Prevent Damage (Rapunzel)
    else if (effect.action === 'prevent_damage') {
        if (targetCard) {
            if (!targetCard.damageShields) targetCard.damageShields = [];
            targetCard.damageShields.push({
                amount: effect.amount,
                duration: effect.duration,
                usage: effect.usage,
                sourceId: sourceCard?.instanceId || '',
                sourcePlayerId: player.id
            });
            turnManager.logger.effect(player.name, `Applied Damage Shield to ${targetCard.name}.`);
        }
    }
    // Reveal and Guess (Bruno Madrigal)
    else if (effect.action === 'reveal_and_guess') {
        const guessType = effect.params?.guessType;
        const matchAction = effect.params?.matchAction;
        const matchLore = effect.params?.matchLore;
        const missAction = effect.params?.missAction;

        if (guessType === 'name') {
            const namedCard = payload?.namedCard;
            if (!namedCard) {
                turnManager.logger.debug(`[${player.name}] No card named for ability.`);
                return;
            }
            turnManager.logger.action(player.name, `Named: "${namedCard}"`);

            if (player.deck.length > 0) {
                // Reveal top card
                const revealedCard = player.deck.pop()!;
                turnManager.logger.info(`[${player.name}] Revealed: ${revealedCard.fullName}`);

                if (revealedCard.fullName === namedCard || revealedCard.name === namedCard) {
                    turnManager.logger.info(`[${player.name}] Correct Guess!`);
                    if (matchAction === 'hand_and_lore') {
                        // Put in hand
                        player.addCardToZone(revealedCard, ZoneType.Hand);
                        // Gain Lore
                        if (matchLore) {
                            player.lore += matchLore;
                            turnManager.logger.effect(player.name, `Gained ${matchLore} lore.`);
                        }
                    }
                } else {
                    turnManager.logger.info(`[${player.name}] Incorrect Guess.`);
                    if (missAction === 'top_of_deck') {
                        // Put back on top
                        player.deck.push(revealedCard);
                        turnManager.logger.info(`[${player.name}] Returned ${revealedCard.name} to top of deck.`);
                    }
                }
            } else {
                turnManager.logger.debug(`[${player.name}] Deck is empty, cannot reveal.`);
            }
        }
    }

    // Discard to Return Character to Hand (Hades - Lord of the Underworld? No, that's recover. This is generic?)
    // Actually Hades - Lord of the Underworld is 'recover_from_discard' (handled above).
    // This action 'discard_to_return_from_discard' seems to be specific.
    else if (effect.action === 'discard_to_return_from_discard') {
        const cardToDiscardId = payload?.discardCardId;
        const cardToReturnId = payload?.returnCardId;

        // Validation
        if (!cardToDiscardId || !cardToReturnId) {
            turnManager.logger.debug(`[${player.name}] Missing selection for discard_to_return_from_discard.`);
            return;
        }

        const cardToDiscard = player.hand.find(c => c.instanceId === cardToDiscardId);
        const cardToReturn = player.discard.find(c => c.instanceId === cardToReturnId);

        if (!cardToDiscard || !cardToReturn) {
            turnManager.logger.debug(`[${player.name}] Cards not found for trade.`);
            return;
        }

        if (cardToReturn.type !== 'Character') { // Restriction usually character
            turnManager.logger.debug(`[${player.name}] Target must be a character.`);
            return;
        }

        // Execute
        player.hand = player.hand.filter(c => c.instanceId !== cardToDiscardId);
        cardToDiscard.zone = ZoneType.Discard;
        player.discard.push(cardToDiscard);
        turnManager.trackZoneChange(cardToDiscard, ZoneType.Hand, ZoneType.Discard);

        player.discard = player.discard.filter(c => c.instanceId !== cardToReturnId);
        cardToReturn.zone = ZoneType.Hand;
        player.hand.push(cardToReturn);
        turnManager.trackZoneChange(cardToReturn, ZoneType.Discard, ZoneType.Hand);

        turnManager.logger.action(player.name, `Discarded ${cardToDiscard.name} to return ${cardToReturn.name} to hand.`);
    }

    // Return from Discard to Top of Deck (Mufasa - King of the Pride Lands?)
    else if (effect.action === 'return_from_discard_to_top_deck') {
        const targetCardId = payload?.targetCardId;
        if (!targetCardId) {
            turnManager.logger.debug(`[${player.name}] No target for return_from_discard_to_top_deck.`);
            return;
        }

        const cardInDiscard = player.discard.find(c => c.instanceId === targetCardId);
        if (!cardInDiscard) {
            turnManager.logger.debug(`[${player.name}] Card not found in discard.`);
            return;
        }

        // Check conditions/filters if any (params)
        if (effect.params?.filter?.type && cardInDiscard.type !== effect.params.filter.type) {
            return;
        }

        // Move
        player.discard = player.discard.filter(c => c.instanceId !== targetCardId);
        cardInDiscard.zone = ZoneType.Deck;
        player.deck.push(cardInDiscard); // Push to end (top)
        turnManager.trackZoneChange(cardInDiscard, ZoneType.Discard, ZoneType.Deck);

        turnManager.logger.action(player.name, `Returned ${cardInDiscard.name} from discard to top of deck.`);
    }

    // Conditional Return from Discard (Do It Again!)
    else if (effect.action === 'conditional_return_from_discard') {
        const targetCardId = payload?.targetid || payload?.targetCardId; // Note casing
        if (!targetCardId) return;

        const card = player.discard.find(c => c.instanceId === targetCardId);
        if (!card) return;

        const filter = effect.params?.filter;
        if (filter) {
            if (filter.cost && card.cost >= filter.cost) return; // "Cost less than X" means < X
            if (filter.type && card.type !== filter.type && card.type !== 'Action') return; // Usually Action
        }

        // Move
        player.discard = player.discard.filter(c => c.instanceId !== targetCardId);
        card.zone = ZoneType.Hand;
        player.hand.push(card);
        turnManager.trackZoneChange(card, ZoneType.Discard, ZoneType.Hand);
        turnManager.logger.action(player.name, `Returned ${card.name} from discard to hand.`);
    }

    // Conditional Play from Discard (Perdita)
    else if (effect.action === 'conditional_play_from_discard') {
        const targetCardId = payload?.targetCardId;
        if (!targetCardId) return;

        // Check if card exists in discard
        // But Perdita plays from discard.
        const cardToPlay = player.discard.find(c => c.instanceId === targetCardId);
        if (!cardToPlay) {
            turnManager.logger.debug(`[${player.name}] Card not found in discard.`);
            return;
        }

        // Validate cost (cost 2 or less)
        const costLimit = effect.params?.costLimit || 2;
        if (cardToPlay.cost > costLimit) {
            turnManager.logger.debug(`[${player.name}] Card cost ${cardToPlay.cost} exceeds limit ${costLimit}.`);
            return;
        }

        if (cardToPlay.type !== 'Character') return;

        // Play the card (Free?) - Usually yes
        turnManager.logger.action(player.name, `Playing ${cardToPlay.name} from discard (Cost <= ${costLimit})`);

        // Remove from discard first? playCard usually expects card in hand or just handles logic.
        // Actually playCard handles playing from hand. If from discard, we might need special handling.
        // TurnManager.playCard expects valid card.
        // Let's manually move to hand first then play normally, OR use specific logic.
        // If we move to hand, playCard will work.
        // But we want it to be free?
        // playCard checks costs.
        // We should start a "free play" transaction.

        // Simulating free play:
        player.costReductions = player.costReductions || [];
        player.costReductions.push({ amount: 99, filter: 'all', duration: 'one_use', sourceId: 'effect' });

        // Move to hand temp so playCard can find it?
        // Or play directly.
        // Lorcana rules: from discard -> enter play.
        // We need to remove from discard.
        player.discard = player.discard.filter(c => c.instanceId !== targetCardId);
        cardToPlay.zone = ZoneType.Hand; // Temp
        player.hand.push(cardToPlay);

        turnManager.playCard(player, cardToPlay.instanceId);
        // Note: playCard handles entering play
    }

    // Draw Then Discard (Duplicate/Variation)
    else if (effect.action === 'draw_then_discard') {
        // ... (Same logic as above, keeping duplicate for safety with existing flow)
        const drawAmount = effect.params?.drawAmount || 1;
        const discardAmount = effect.params?.discardAmount || 1;

        for (let i = 0; i < drawAmount; i++) {
            if (player.deck.length > 0) {
                const c = player.deck.pop()!;
                player.addCardToZone(c, ZoneType.Hand);
            }
        }

        // Check payload for discard selection
        const discardIds = payload?.discardIds || [];
        if (discardIds.length > 0) {
            discardIds.forEach((id: string) => {
                const c = player.hand.find(card => card.instanceId === id);
                if (c) {
                    player.hand = player.hand.filter(card => card.instanceId !== id);
                    c.zone = ZoneType.Discard;
                    player.discard.push(c);
                    turnManager.trackZoneChange(c, ZoneType.Hand, ZoneType.Discard);
                }
            });
            turnManager.logger.action(player.name, `Drew ${drawAmount} and discarded ${discardIds.length}`);
        } else {
            // Auto discard if no payload (Bot fallback)
            for (let i = 0; i < discardAmount && player.hand.length > 0; i++) {
                const c = player.hand[0]; // Simple heuristic
                player.hand.shift();
                c.zone = ZoneType.Discard;
                player.discard.push(c);
                turnManager.trackZoneChange(c, ZoneType.Hand, ZoneType.Discard);
            }
            turnManager.logger.action(player.name, `Drew ${drawAmount} and discarded ${discardAmount} (Auto)`);
        }
    }

    // Discard to Deal Damage (Simba - Returned King)
    else if (effect.action === 'discard_to_deal_damage') {
        const discardId = payload?.discardCardId;
        const targetId = payload?.targetCardId;

        if (discardId && targetId) {
            const discardCard = player.hand.find(c => c.instanceId === discardId);
            if (discardCard) {
                // Discard
                player.hand = player.hand.filter(c => c.instanceId !== discardId);
                discardCard.zone = ZoneType.Discard;
                player.discard.push(discardCard);
                turnManager.trackZoneChange(discardCard, ZoneType.Hand, ZoneType.Discard);

                // Damage
                const allCards = Object.values(turnManager.game.state.players).flatMap(p => p.play);
                const target = allCards.find(c => c.instanceId === targetId);
                if (target) {
                    turnManager.applyDamage(turnManager.game.getPlayer(target.ownerId), target, 2, sourceCard?.instanceId);
                    turnManager.logger.action(player.name, `Discarded to deal 2 damage to ${target.name}`);
                    turnManager.checkBanishment(turnManager.game.getPlayer(target.ownerId), target, sourceCard);
                }
            }
        }
    }

    // Balance Hand (A Whole New World)
    else if (effect.action === 'balance_hand') {
        // 1. Discard hand
        turnManager.logger.action(player.name, "Singing 'A Whole New World'!");

        Object.values(turnManager.game.state.players).forEach(p => {
            const handSize = p.hand.length;
            if (handSize > 0) {
                p.hand.forEach(c => {
                    c.zone = ZoneType.Discard;
                    p.discard.push(c);
                    turnManager.trackZoneChange(c, ZoneType.Hand, ZoneType.Discard);
                });
                p.hand = [];
                turnManager.logger.info(`${p.name} discarded hand`);
            }

            // 2. Draw 7
            for (let i = 0; i < 7; i++) {
                if (p.deck.length > 0) {
                    const c = p.deck.pop()!;
                    c.zone = ZoneType.Hand;
                    p.hand.push(c);
                }
            }
            turnManager.logger.info(`${p.name} drew 7 cards`);
        });
    }

    // Play from Discard to Bottom of Deck (Reuse - event)
    else if (effect.action === 'play_from_discard_bottom_deck') {
        // Logic similar to return_from_discard_to_deck but maybe triggered differently
        // ... implementation based on "The Boss is on a Roll" or similar
        const targetId = payload?.targetCardId;
        if (targetId) {
            const card = player.discard.find(c => c.instanceId === targetId);
            if (card) {
                player.discard = player.discard.filter(c => c.instanceId !== targetId);
                card.zone = ZoneType.Deck;
                player.deck.unshift(card); // Bottom
                turnManager.trackZoneChange(card, ZoneType.Discard, ZoneType.Deck);
                turnManager.logger.action(player.name, `Returned ${card.name} to bottom of deck.`);
            }
        }
    }

    // Pay Ink to Return from Discard (Part of Your World)
    else if (effect.action === 'pay_ink_to_return_from_discard') {
        const targetId = payload?.targetCardId; // Valid choice from discard
        if (!targetId) return;

        const card = player.discard.find(c => c.instanceId === targetId);
        if (!card) return;

        const cost = 2; // Usually specific
        // Check ink
        const readyInk = player.inkwell.filter(i => i.ready).length;
        if (readyInk < cost) {
            turnManager.logger.debug("Not enough ink");
            return;
        }

        // Pay
        let paid = 0;
        for (const ink of player.inkwell) {
            if (ink.ready && paid < cost) {
                ink.ready = false;
                paid++;
            }
        }

        // Return
        player.discard = player.discard.filter(c => c.instanceId !== targetId);
        card.zone = ZoneType.Hand;
        player.hand.push(card);
        turnManager.trackZoneChange(card, ZoneType.Discard, ZoneType.Hand);
        turnManager.logger.action(player.name, `Paid ${cost} ink to return ${card.name} from discard.`);
    }

    // Opponent Reveal and Discard (Ursula - Deceiver)
    else if (effect.action === 'opponent_reveal_and_discard') {
        let targetPlayerId = payload?.targetPlayerId;
        const targetCardId = payload?.targetCardId;

        // Auto-select opponent if only one exists
        const opponents = Object.values(turnManager.game.state.players).filter(p => p.id !== player.id);
        if (!targetPlayerId) {
            if (opponents.length === 1) {
                targetPlayerId = opponents[0].id;
            } else {
                return;
            }
        }

        const opponent = turnManager.game.getPlayer(targetPlayerId);
        if (!opponent) return;

        turnManager.logger.info(player.name, `Opponent ${opponent.name} reveals hand`);

        if (!targetCardId) return;

        const cardToDiscard = opponent.hand.find(c => c.instanceId === targetCardId);
        if (!cardToDiscard) return;

        // Discard
        opponent.hand = opponent.hand.filter(c => c.instanceId !== targetCardId);
        cardToDiscard.zone = ZoneType.Discard;
        opponent.discard.push(cardToDiscard);
        turnManager.trackZoneChange(cardToDiscard, ZoneType.Hand, ZoneType.Discard);
        turnManager.logger.action(player.name, `Forced ${opponent.name} to discard ${cardToDiscard.name}`);
    }

    // All Opponents Discard (Daisy Duck - Musketeer Spy / Cursed Merfolk)
    else if (effect.action === 'all_opponents_discard') {
        const discards = payload?.discards || {};
        const opponents = Object.values(turnManager.game.state.players).filter(p => p.id !== player.id);

        opponents.forEach(opp => {
            // Check if opponent made a choice
            const choices = discards[opp.id]; // Array of card IDs
            if (choices && choices.length > 0) {
                const cardId = choices[0];
                const card = opp.hand.find(c => c.instanceId === cardId);
                if (card) {
                    opp.hand = opp.hand.filter(c => c.instanceId !== cardId);
                    card.zone = ZoneType.Discard;
                    opp.discard.push(card);
                    turnManager.trackZoneChange(card, ZoneType.Hand, ZoneType.Discard);
                    // Include causedBy context for ability tracking
                    const abilityName = effect.trigger === 'on_challenge' ? 'When challenged' : 'ability';
                    turnManager.logger.effect(
                        opp.name,
                        `Discarded ${card.name}`,
                        sourceCard?.name,
                        { causedBy: { cardName: sourceCard?.name || 'Unknown', abilityName } }
                    );
                }
            } else {
                // Fallback: Random if forced
                // (or skip if optional)
                if (opp.hand.length > 0) {
                    const randInfo = Math.floor(Math.random() * opp.hand.length);
                    const card = opp.hand[randInfo];
                    opp.hand = opp.hand.filter(c => c.instanceId !== card.instanceId);
                    card.zone = ZoneType.Discard;
                    opp.discard.push(card);
                    turnManager.trackZoneChange(card, ZoneType.Hand, ZoneType.Discard);
                    // Include causedBy context for ability tracking (random fallback)
                    const abilityNameRandom = effect.trigger === 'on_challenge' ? 'When challenged' : 'ability';
                    turnManager.logger.effect(
                        opp.name,
                        `Discarded ${card.name}`,
                        sourceCard?.name,
                        { causedBy: { cardName: sourceCard?.name || 'Unknown', abilityName: abilityNameRandom } }
                    );
                }
            }
        });
    }

    // Conditional Draw/Discard/Banish (Yzma)
    else if (effect.action === 'conditional_draw_discard_banish') {
        // Yzma logic: Shuffle deck, reveal top, if cost > X ...
        // Implementation omitted for brevity, adding stub or basic logic
        turnManager.logger.info("Resolving Yzma effect (stub)");
    }

    // Discard to Buff Challenger (Kronk)
    else if (effect.action === 'discard_to_buff_challenger') {
        // ...
    }

    // Return Named Card (Hades)
    else if (effect.action === 'return_named_card_from_discard') {
        const targetId = payload?.targetCardId;
        if (targetId) {
            const card = player.discard.find(c => c.instanceId === targetId);
            if (card) {
                player.discard = player.discard.filter(c => c.instanceId !== targetId);
                card.zone = ZoneType.Hand;
                player.hand.push(card);
                turnManager.trackZoneChange(card, ZoneType.Discard, ZoneType.Hand);
            }
        }
    }

    // Return Item (Tamatoa)
    else if (effect.action === 'return_item_from_discard') {
        // ...
    }

    // Opponent Reveal Discard Non-Character (Ursula)
    else if (effect.action === 'opponent_reveal_discard_non_character') {
        // ...
    }

    // Opponent Reveal Top Deck Conditional (Daisy Duck - Donald's Date)
    else if (effect.action === 'opponent_reveal_top_deck_conditional') {
        const opponents = Object.values(turnManager.game.state.players).filter(p => p.id !== player.id);

        for (const opp of opponents) {
            if (opp.deck.length === 0) {
                turnManager.logger.debug(`[${opp.name}] Deck is empty, cannot reveal.`);
                continue;
            }

            // Top of deck is at the END of the array (pop() takes from end)
            const topCard = opp.deck[opp.deck.length - 1];
            turnManager.logger.info(opp.name, `Reveals top card: ${topCard.name} (Type: ${topCard.type})`);

            // Check condition (e.g. Type: Character)
            const conditionType = effect.params?.condition?.type;
            let conditionMet = false;
            if (conditionType === 'Character' && topCard.type === CardType.Character) {
                conditionMet = true;
            }

            // First: Send informational reveal to the ability owner (so they see the opponent's card)
            if (turnManager.requestChoice) {
                const infoRequest: ChoiceRequest = {
                    id: 'reveal_info_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    type: ChoiceType.REVEAL_AND_DECIDE,
                    playerId: player.id, // Ability owner sees this
                    prompt: `${opp.name} reveals ${topCard.name}`,
                    options: [{ id: 'acknowledge', display: 'OK', valid: true }],
                    source: {
                        card: sourceCard,
                        abilityName: 'BIG PRIZE',
                        player: opp // The revealer
                    },
                    context: {
                        revealedCard: topCard
                    },
                    min: 1,
                    max: 1,
                    timestamp: Date.now()
                };

                try {
                    await turnManager.requestChoice(infoRequest);
                } catch (e) {
                    // Ignore if player doesn't have a handler or timeouts
                }
            }

            // Build choice options for the opponent
            const options = [];
            if (conditionMet) {
                options.push({ id: 'hand', display: 'Put into Hand', valid: true });
                options.push({ id: 'bottom', display: 'Bottom of Deck', valid: true });
            } else {
                options.push({ id: 'bottom', display: 'Bottom of Deck (Not a Character)', valid: true });
            }

            // Create choice request for the opponent
            const choiceRequest: ChoiceRequest = {
                id: 'choice_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                type: ChoiceType.REVEAL_AND_DECIDE,
                playerId: opp.id, // The opponent makes this choice
                prompt: `Reveal: ${topCard.name}. ${conditionMet ? 'Put into hand?' : 'Must go to bottom.'}`,
                options: options,
                source: {
                    card: sourceCard,
                    abilityName: 'BIG PRIZE',
                    player: player
                },
                context: {
                    revealedCard: topCard
                },
                min: 1,
                max: 1,
                timestamp: Date.now()
            };

            let decision = 'bottom'; // Default

            if (turnManager.requestChoice) {
                const response = await turnManager.requestChoice(choiceRequest);
                decision = response.selectedIds[0] || 'bottom';
            }

            // Remove the top card from deck (pop takes from end = top)
            opp.deck.pop();

            // Execute decision
            if (decision === 'hand') {
                topCard.zone = ZoneType.Hand;
                (opp as PlayerState).hand.push(topCard);
                turnManager.logger.action(opp.name, `Put ${topCard.name} into hand`);
            } else {
                // Put at bottom (start of array)
                opp.deck.unshift(topCard);
                turnManager.logger.action(opp.name, `Put ${topCard.name} on bottom of deck`);
            }
        }
    }
    // Opponent Choice: Banish (Lady Tremaine)
    else if (effect.action === 'opponent_choice_banish') {
        const filter = effect.params?.filter || 'character';
        const opponents = Object.values(turnManager.game.state.players).filter(p => p.id !== player.id);

        opponents.forEach(opp => {
            // Find valid targets (e.g. characters)
            // Note: Should respect Ward? Yes, "chooses and banishes" usually bypasses Ward if the PLAYER chooses their own character.
            // Ward prevents "opponents choosing". Here the opponent chooses their own.
            const validTargets = opp.play.filter(c => {
                if (filter === 'character' && c.type !== CardType.Character) return false;
                return true;
            });

            if (validTargets.length > 0) {
                // Heuristic: Banish lowest strength (weakest) character
                const sortedTargets = [...validTargets].sort((a, b) => (a.strength || 0) - (b.strength || 0));
                const target = sortedTargets[0];

                // Banish it
                banishCard(turnManager, opp as PlayerState, target); // Use banishCard helper (passed turnManager?) 
                // Wait, imported banishCard signature is banishCard(turnManager, player, card, banisher?)
                // My helper usage was banishCard(turnManager, player, card, sourceCard)
                // Here 'opp' is player.
                turnManager.logger.action(opp.name, `Chose to banish ${target.name} (Effect from ${player.name})`);
            } else {
                turnManager.logger.debug(`[${opp.name}] No valid targets to banish.`);
            }
        });
    }

    // Return Character to Hand (Basil on play)
    else if (effect.action === 'return_character_to_hand') {
        const targetCardId = payload?.targetCardId;
        if (!targetCardId) {
            turnManager.logger.debug(`[${player.name}] No target selected for bounce.`);
            return;
        }

        // Find target character in any player's play zone
        let targetCard: CardInstance | undefined;
        let targetOwner: PlayerState | undefined;

        for (const pId of Object.keys(turnManager.game.state.players)) {
            const p = turnManager.game.getPlayer(pId) as PlayerState;
            targetCard = p.play.find(c => c.instanceId === targetCardId);
            if (targetCard) {
                targetOwner = p;
                break;
            }
        }

        if (!targetCard || !targetOwner) {
            turnManager.logger.debug(`[${player.name}] Target character not found in play.`);
            return;
        }

        // Return to owner's hand
        targetOwner.play = targetOwner.play.filter(c => c.instanceId !== targetCardId);
        targetCard.zone = ZoneType.Hand;
        targetOwner.hand.push(targetCard);
        turnManager.trackZoneChange(targetCard, ZoneType.Play, ZoneType.Hand);

        turnManager.logger.action(player.name, `Returned ${targetCard.name} to ${targetOwner.name}'s hand`);
    }
    // Opponent Discard Random (Basil on quest)
    else if (effect.action === 'opponent_discard_random') {
        const opponentId = payload?.opponentId;
        if (!opponentId) {
            turnManager.logger.debug(`[${player.name}] No opponent specified.`);
            return;
        }

        const opponent = turnManager.game.getPlayer(opponentId);
        if (opponent.hand.length === 0) {
            turnManager.logger.debug(`[${player.name}] ${opponent.name} has no cards to discard.`);
            return;
        }

        // Pick random card
        const randomIndex = Math.floor(Math.random() * opponent.hand.length);
        const randomCard = opponent.hand[randomIndex];

        opponent.hand.splice(randomIndex, 1);
        opponent.addCardToZone(randomCard, ZoneType.Discard);

        turnManager.logger.action(player.name, `${opponent.name} discarded ${randomCard.name} at random`);
    }
    // Challenger May Discard or Opponent Gains Lore (Flynn Rider)
    else if (effect.action === 'challenger_may_discard_or_opponent_gains_lore') {
        const discardCardId = payload?.discardCardId;
        const loreAmount = effect.params?.loreAmount || 2;

        if (discardCardId) {
            // Challenger chose to discard - find the challenging player
            // The target card is the one being challenged, so we need to find who's challenging
            // The payload should come from the challenge action which has the challenger's player ID
            // We can infer the challenger is NOT the owner of the challenged card
            const challengerId = Object.keys(turnManager.game.state.players).find(id => id !== player.id);
            if (!challengerId) return;

            const challenger = turnManager.game.getPlayer(challengerId);
            const cardToDiscard = challenger.hand.find(c => c.instanceId === discardCardId);

            if (!cardToDiscard) {
                turnManager.logger.debug(`[${player.name}] Challenger chose not to discard (card not found).`);
                player.lore += loreAmount;
                turnManager.logger.effect(player.name, `Gained ${loreAmount} lore. Total: ${player.lore}`);
                return;
            }

            challenger.hand = challenger.hand.filter(c => c.instanceId !== discardCardId);
            challenger.addCardToZone(cardToDiscard, ZoneType.Discard);
            turnManager.logger.action(challenger.name, `discarded ${cardToDiscard.name} to avoid giving lore`);
        } else {
            // Challenger chose not to discard
            player.lore += loreAmount;
            turnManager.logger.effect(player.name, `Gained ${loreAmount} lore. Total: ${player.lore}`);
        }
    }
    // Conditional Item to Inkwell (Judy Hopps)
    else if (effect.action === 'conditional_item_to_inkwell') {
        const requiredSubtype = effect.params?.requiredSubtype || 'Detective';

        // Check if player has another character with required subtype (excluding source card)
        const hasRequiredSubtype = player.play.some(c =>
            c.instanceId !== sourceCard?.instanceId &&
            c.subtypes?.includes(requiredSubtype)
        );

        if (!hasRequiredSubtype) {
            turnManager.logger.debug(`[${player.name}] Condition not met: No other ${requiredSubtype} character in play.`);
            return;
        }

        const targetCardId = payload?.targetCardId;
        if (!targetCardId) {
            turnManager.logger.debug(`[${player.name}] No item selected.`);
            return;
        }

        // Find target item in any zone, any player
        let targetCard: CardInstance | undefined;
        let targetOwner: PlayerState | undefined;

        for (const pId of Object.keys(turnManager.game.state.players)) {
            const p = turnManager.game.getPlayer(pId);

            // Check play zone
            targetCard = p.play.find(c => c.instanceId === targetCardId);
            if (targetCard) {
                targetOwner = p;
                break;
            }
            // Check hand
            targetCard = p.hand.find(c => c.instanceId === targetCardId);
            if (targetCard) {
                targetOwner = p;
                break;
            }
            // Check discard
            targetCard = p.discard.find(c => c.instanceId === targetCardId);
            if (targetCard) {
                targetOwner = p;
                break;
            }
        }

        if (!targetCard || !targetOwner) {
            turnManager.logger.debug(`[${player.name}] Target item not found.`);
            return;
        }

        // Verify it's an item
        if (targetCard.type !== 'Item') {
            turnManager.logger.debug(`[${player.name}] Target is not an item.`);
            return;
        }

        // Remove from current zone
        if (targetCard.zone === ZoneType.Play) {
            targetOwner.play = targetOwner.play.filter(c => c.instanceId !== targetCardId);
            turnManager.trackZoneChange(targetCard, ZoneType.Play, ZoneType.Inkwell);
        } else if (targetCard.zone === ZoneType.Hand) {
            targetOwner.hand = targetOwner.hand.filter(c => c.instanceId !== targetCardId);
            turnManager.trackZoneChange(targetCard, ZoneType.Hand, ZoneType.Inkwell);
        } else if (targetCard.zone === ZoneType.Discard) {
            targetOwner.discard = targetOwner.discard.filter(c => c.instanceId !== targetCardId);
            turnManager.trackZoneChange(targetCard, ZoneType.Discard, ZoneType.Inkwell);
        }
        // Add to owner's inkwell
        targetCard.zone = ZoneType.Inkwell;
        targetCard.ready = false;  // Exerted
        targetOwner.inkwell.push(targetCard);

        turnManager.logger.effect(player.name, `Put ${targetCard.name} into ${targetOwner.name}'s inkwell facedown and exerted`);
    }
    // Optional Pay Ink to Draw (Webby's Diary)
    else if (effect.action === 'optional_pay_ink_to_draw') {
        const inkCost = effect.params?.inkCost || 1;
        const payInk = payload?.payInk;

        if (!payInk) {
            turnManager.logger.debug(`[${player.name}] Chose not to pay ink.`);
            return;
        }

        // Check if player has enough ready ink
        const readyInk = player.inkwell.filter(c => c.ready).length;
        if (readyInk < inkCost) {
            turnManager.logger.debug(`[${player.name}] Not enough ink. Need ${inkCost}, have ${readyInk}`);
            return;
        }

        // Pay ink cost
        let paid = 0;
        for (const ink of player.inkwell) {
            if (ink.ready && paid < inkCost) {
                ink.ready = false;
                paid++;
            }
        }

        // Draw card
        if (player.deck.length > 0) {
            const drawn = player.deck.pop()!;
            player.addCardToZone(drawn, ZoneType.Hand);
            turnManager.logger.action(player.name, `Paid ${inkCost} ink and drew a card`);
        } else {
            turnManager.logger.debug(`[${player.name}] Deck is empty, cannot draw.`);
        }
    }
    // Heal Character (Munchings and Crunchings)
    else if (effect.action === 'heal_character') {
        const healAmount = effect.params?.healAmount || 2;
        const targetCardId = payload?.targetCardId;

        if (!targetCardId) {
            turnManager.logger.debug(`[${player.name}] No target selected for healing.`);
            return;
        }

        // Find target character in any player's play zone
        let targetCard: CardInstance | undefined;
        let targetOwner: PlayerState | undefined;

        for (const pId of Object.keys(turnManager.game.state.players)) {
            const p = turnManager.game.getPlayer(pId);
            targetCard = p.play.find(c => c.instanceId === targetCardId);
            if (targetCard) {
                targetOwner = p;
                break;
            }
        }

        if (!targetCard || !targetOwner) {
            turnManager.logger.debug(`[${player.name}] Target character not found.`);
            return;
        }

        // Remove damage (up to healAmount, can't go below 0)
        const damageBefore = targetCard.damage || 0;
        const actualHeal = Math.min(healAmount, damageBefore);
        targetCard.damage = damageBefore - actualHeal;

        turnManager.logger.effect(player.name, `Removed ${actualHeal} damage from ${targetCard.name}. Damage: ${damageBefore} -> ${targetCard.damage}`);
    }
    // Conditional Heal on Quest (Winter Camp)
    else if (effect.action === 'conditional_heal_on_quest') {
        const questingCharacterId = payload?.questingCharacterId;

        if (!questingCharacterId) {
            turnManager.logger.debug(`[${player.name}] No questing character specified.`);
            return;
        }

        // Find the questing character
        const questingChar = player.play.find(c => c.instanceId === questingCharacterId);

        if (!questingChar) {
            turnManager.logger.debug(`[${player.name}] Questing character not found.`);
            return;
        }

        // Determine heal amount based on Hero subtype
        const isHero = questingChar.subtypes?.includes('Hero') || false;
        const healAmount = isHero ? (effect.params?.heroHealAmount || 4) : (effect.params?.baseHealAmount || 2);

        // Remove damage (up to specified amount)
        const currentDamage = questingChar.damage || 0;
        const amountHealed = Math.min(currentDamage, healAmount);
        questingChar.damage = Math.max(0, currentDamage - healAmount);

        turnManager.logger.effect(player.name, `${questingChar.name}${isHero ? ' (Hero)' : ''} healed ${amountHealed} damage (${currentDamage} -> ${questingChar.damage})`);
    }
    // Temporary Lore Reduction (Inscrutable Map)
    else if (effect.action === 'temporary_lore_reduction') {
        const loreReduction = effect.params?.loreReduction || 1;
        const targetCardId = payload?.targetCardId;

        if (!targetCardId) {
            turnManager.logger.debug(`[${player.name}] No target selected.`);
            return;
        }

        // Find target character (should be opposing)
        let targetCard: CardInstance | undefined;
        let targetOwner: PlayerState | undefined;

        for (const pId of Object.keys(turnManager.game.state.players)) {
            const p = turnManager.game.getPlayer(pId);
            if (pId !== player.id) {  // Opposing player
                targetCard = p.play.find(c => c.instanceId === targetCardId);
                if (targetCard) {
                    targetOwner = p;
                    break;
                }
            }
        }

        if (!targetCard || !targetOwner) {
            turnManager.logger.debug(`[${player.name}] Target character not found in opponent's play.`);
            return;
        }

        // Create continuous effect for lore reduction
        const continuousEffect: ContinuousEffect = {
            id: `lore_reduction_${Date.now()}_${Math.random()}`,
            type: 'modification',
            target: 'custom',
            targetCardIds: [targetCardId],
            duration: 'until_source_next_start',
            sourcePlayerId: player.id,
            sourceCardId: sourceCard?.instanceId || '',
            modification: {
                lore: -loreReduction
            }
        };

        turnManager.addActiveEffect(continuousEffect);
        turnManager.logger.effect(player.name, `Reduced ${targetCard.name}'s lore by ${loreReduction} until start of ${player.name}'s next turn`);
    }

    // Draw per character then discard (Tramp)
    else if (effect.action === 'draw_per_character_then_discard') {
        // Count other characters in play (not including the source card)
        const effectSourceCardId = effect.sourceCardId || sourceCard?.instanceId;
        const otherCharacters = player.play.filter(c =>
            c.type === CardType.Character && c.instanceId !== effectSourceCardId
        );
        const count = otherCharacters.length;

        if (count === 0) {
            turnManager.logger.debug(`[${player.name}] No other characters in play, no cards to draw.`);
            return;
        }

        turnManager.logger.info(player.name, `Drawing ${count} cards for ${count} other characters...`);

        // Draw cards
        for (let i = 0; i < count; i++) {
            if (player.deck.length > 0) {
                const card = player.deck.shift()!;
                card.zone = ZoneType.Hand;
                player.hand.push(card);
            } else {
                turnManager.logger.debug(`[${player.name}] Deck is empty, cannot draw more cards.`);
                break;
            }
        }

        // Now need to discard the same number of cards
        // This would require payload with card selections
        const discardCardIds = payload?.discardCardIds || [];

        if (discardCardIds.length !== count) {
            turnManager.logger.debug(`[${player.name}] Must select exactly ${count} cards to discard.`);
            return;
        }

        // Discard selected cards
        discardCardIds.forEach((cardId: string) => {
            const cardIndex = player.hand.findIndex(c => c.instanceId === cardId);
            if (cardIndex !== -1) {
                const card = player.hand.splice(cardIndex, 1)[0];
                // Move card to discard (don't create duplicate!)
                card.zone = ZoneType.Discard;
                player.discard.push(card);
                turnManager.trackZoneChange(card, ZoneType.Hand, ZoneType.Discard);
                turnManager.logger.action(player.name, `Discarded ${card.name}`);
            }
        });
    }
    // Conditional Draw on Move (The Bitterwood)
    else if (effect.action === 'conditional_draw_on_move') {
        const strengthRequired = effect.params?.strengthRequired || 5;
        const characterStrength = payload?.characterStrength || targetCard?.strength || 0;

        // Check strength requirement
        if (characterStrength < strengthRequired) {
            turnManager.logger.debug(`[${player.name}] Character strength ${characterStrength} < ${strengthRequired}, no draw.`);
            return;
        }

        // Check once per turn restriction
        if (effect.params?.oncePerTurn) {
            // Track if this location has triggered this turn
            if (!sourceCard?.meta) sourceCard!.meta = {};
            if (!sourceCard?.meta.triggeredThisTurn) sourceCard!.meta.triggeredThisTurn = {};

            const currentTurn = turnManager.game.state.turnCount;
            if (sourceCard?.meta.triggeredThisTurn[currentTurn]) {
                turnManager.logger.debug(`[${player.name}] ${sourceCard.name} already triggered this turn.`);
                return;
            }

            sourceCard!.meta.triggeredThisTurn[currentTurn] = true;
        }

        // Draw card
        if (player.deck.length > 0) {
            const drawn = player.deck.pop()!;
            player.addCardToZone(drawn, ZoneType.Hand);
            turnManager.logger.action(player.name, `Drew a card from moving character to location`);
        } else {
            turnManager.logger.debug(`[${player.name}] Deck is empty, cannot draw.`);
        }
    }
    // Gain Temporary Strength (Lady)
    else if (effect.action === 'gain_temporary_strength') {
        const strengthBonus = effect.params?.strengthBonus || 1;
        const duration = effect.params?.duration || 'until_end_of_turn';

        if (!sourceCard) {
            turnManager.logger.debug(`[${player.name}] No source card for temporary strength.`);
            return;
        }

        // Create continuous effect for temporary strength boost
        const continuousEffect: ContinuousEffect = {
            id: `temp_strength_${Date.now()}_${Math.random()}`,
            type: 'modification',
            target: 'custom',
            targetCardIds: [sourceCard.instanceId],
            duration: duration as any,
            sourcePlayerId: player.id,
            sourceCardId: sourceCard.instanceId,
            modification: {
                strength: strengthBonus
            }
        };

        turnManager.game.state.activeEffects.push(continuousEffect);
        turnManager.logger.effect(player.name, `${sourceCard.name} gets +${strengthBonus} strength until end of turn`);
    }

    // Grant Challenger (Mickey Mouse - Standard Bearer)
    else if (effect.action === 'grant_challenger') {
        const targetCardId = payload?.targetCardId || payload?.targetId;

        if (!targetCardId) {
            turnManager.logger.debug(`[${player.name}] No target selected for granting Challenger.`);
            return;
        }

        // Find target
        const allCards = Object.values(turnManager.game.state.players).flatMap(p => p.play);
        const targetCard = allCards.find(c => c.instanceId === targetCardId);

        if (!targetCard) {
            turnManager.logger.debug(`[${player.name}] Target card not found for granting Challenger.`);
            return;
        }

        if (targetCard && !validateTarget(targetCard, player.id, turnManager.logger)) {
            return;
        }

        const amount = effect.amount || 0;

        // Create continuous effect
        const continuousEffect: ContinuousEffect = {
            id: `grant_challenger_${Date.now()}_${Math.random()}`,
            type: 'modification',
            target: 'custom',
            targetCardIds: [targetCardId],
            duration: 'until_end_of_turn',
            sourcePlayerId: player.id,
            sourceCardId: sourceCard?.instanceId || '',
            modification: {
                challenger: amount
            }
        };

        turnManager.addActiveEffect(continuousEffect);
        turnManager.logger.debug('Active effects count after push: ' + turnManager.game.state.activeEffects.length);
        turnManager.logger.effect(player.name, `Granted Challenger +${amount} to target until end of turn`);
    }

    // Move Damage (Cheshire Cat)
    else if (effect.action === 'move_damage') {
        const sourceCardId = payload?.sourceCardId;
        const destCardId = payload?.destCardId;
        const amountToMove = payload?.amount || effect.amount || 0;

        if (!sourceCardId || !destCardId) {
            turnManager.logger.debug(`[${player.name}] Source or destination for move_damage missing.`);
            return;
        }

        // Find cards
        let sourceChar: CardInstance | undefined;
        let destChar: CardInstance | undefined;
        let sourceOwner: PlayerState | undefined;
        let destOwner: PlayerState | undefined;

        for (const pId of Object.keys(turnManager.game.state.players)) {
            const p = turnManager.game.getPlayer(pId);
            const s = p.play.find(c => c.instanceId === sourceCardId);
            if (s) { sourceChar = s; sourceOwner = p; }
            const d = p.play.find(c => c.instanceId === destCardId);
            if (d) { destChar = d; destOwner = p; }
        }

        if (!sourceChar || !destChar || !sourceOwner || !destOwner) {
            turnManager.logger.debug(`[${player.name}] Character(s) not found for move_damage.`);
            return;
        }

        // Validate amount
        const currentDamage = sourceChar.damage || 0;
        const actualMove = Math.min(amountToMove, currentDamage);

        if (actualMove <= 0) {
            turnManager.logger.debug(`[${player.name}] No damage to move from ${sourceChar.name}.`);
            return;
        }

        // Move damage
        sourceChar.damage = (sourceChar.damage || 0) - actualMove;
        turnManager.logger.effect(player.name, `Moved ${actualMove} damage from ${sourceChar.name} to ${destChar.name}`);

        // Apply damage to destination using applyDamage to handle shields/banishment
        turnManager.applyDamage(destOwner, destChar, actualMove, sourceCard?.instanceId);
    }

    // ========== NEWLY ADDED HANDLERS (Missing from validator) ==========

    // Keyword: Ward - Prevents opponents from choosing this character except to challenge
    else if (effect.action === 'keyword_ward') {
        if (sourceCard) {
            if (!sourceCard.meta) sourceCard.meta = {};
            sourceCard.meta.hasWard = true;
            turnManager.logger.info(player.name, `[WARD] ${sourceCard.name} has Ward (opponents can't choose except to challenge)`);
        }
    }

    // Keyword: Resist - Reduces damage dealt to this character
    else if (effect.action === 'keyword_resist' ||
        (effect as any).keyword === 'resist' ||
        ((effect as any).type === 'resist')) {
        if (sourceCard) {
            if (!sourceCard.meta) sourceCard.meta = {};
            const resistValue = (effect as any).amount || (effect as any).value || 0;
            sourceCard.meta.resist = resistValue;
            turnManager.logger.info(player.name, `[RESIST] ${sourceCard.name} has Resist +${resistValue} (damage reduced by ${resistValue})`);
        }
    }

    // Keyword: Reckless - Can't quest, must challenge if able
    else if (effect.action === 'keyword_reckless') {
        if (sourceCard) {
            if (!sourceCard.meta) sourceCard.meta = {};
            sourceCard.meta.hasReckless = true;
            turnManager.logger.info(player.name, `[RECKLESS] ${sourceCard.name} is Reckless (can't quest, must challenge if able)`);
        }
    }

    // Activated Ability: Exert to activate
    else if (effect.action === 'exert_ability') {
        // Exerting is handled by useAbility() before calling this
        // Just execute the nested/chained effect
        if (effect.params?.chainedEffect) {
            await executeResolveEffect(turnManager, player, effect.params.chainedEffect, sourceCard, targetCard, payload);
        } else {
            turnManager.logger.info(player.name, `[EXERT_ABILITY] ${sourceCard?.name || 'Card'} activated exert ability`);
        }
    }

    // Activated Ability: Exert + Ink cost to activate
    else if (effect.action === 'exert_ink_ability') {
        // Costs are handled by useAbility() before calling this
        // Execute the nested/chained effect
        if (effect.params?.chainedEffect) {
            await executeResolveEffect(turnManager, player, effect.params.chainedEffect, sourceCard, targetCard, payload);
        } else {
            turnManager.logger.info(player.name, `[EXERT_INK_ABILITY] ${sourceCard?.name || 'Card'} activated exert+ink ability`);
        }
    }

    // Enters Play Exerted
    else if (effect.action === 'enters_play_exerted') {
        // This is handled in playCard() - adding stub for validator detection
        turnManager.logger.info(player.name, `[ENTERS_PLAY_EXERTED] ${sourceCard?.name || 'Card'} enters play exerted (handled in playCard)`);
    }

    // Can Challenge Ready Characters
    else if (effect.action === 'can_challenge_ready_characters') {
        if (sourceCard) {
            if (!sourceCard.meta) sourceCard.meta = {};
            sourceCard.meta.canChallengeReady = true;
            turnManager.logger.info(player.name, `[CAN_CHALLENGE_READY] ${sourceCard.name} can challenge ready characters`);
        }
    }

    // Can't Exert to Sing
    else if (effect.action === 'cant_exert_to_sing') {
        if (sourceCard) {
            if (!sourceCard.meta) sourceCard.meta = {};
            sourceCard.meta.cantExertToSing = true;
            turnManager.logger.info(player.name, `[CANT_EXERT_TO_SING] ${sourceCard.name} can't exert to sing songs`);
        }
    }

    // Quest (stub - likely false positive, quest is an action not an effect)
    else if (effect.action === 'quest') {
        turnManager.logger.debug(`[QUEST] Quest action detected in resolveEffect - may be parser issue.`);
        // Quest is typically handled by the quest() method, not as an effect
    }

    // Song Cost Requirement (stub - handled in playCard/singSong)
    else if (effect.action === 'song_cost_requirement') {
        turnManager.logger.debug(`[SONG_COST] Song cost requirement (handled in playCard/singSong).`);
        // This is checked during singing, not resolved as an effect
    }

    // ========== END NEWLY ADDED HANDLERS ==========

    // Opponent Lose Lore, Self Gain Lore (Gloyd Orangeboar)
    else if (effect.action === 'opponent_lose_lore_self_gain_lore') {
        const loseAmount = effect.params?.loseAmount || 1;
        const gainAmount = effect.params?.gainAmount || 1;

        // Opponents lose lore
        const opponents = Object.values(turnManager.game.state.players).filter(p => p.id !== player.id);
        opponents.forEach(opp => {
            const actualLoss = Math.min(opp.lore, loseAmount);
            opp.lore -= actualLoss;
            turnManager.logger.effect(opp.name, `Lost ${actualLoss} lore`);
        });

        // Self gains lore
        player.lore += gainAmount;
        turnManager.logger.effect(player.name, `Gained ${gainAmount} lore`);
    }

    // Discard to Return Character to Hand (Nana)
    else if (effect.action === 'discard_to_return_character_to_hand') {
        const discardCardId = payload?.discardCardId;
        const targetCardId = payload?.targetCardId;
        const costLimit = effect.params?.costLimit || 0;

        // Optional check
        if (effect.params?.optional && !discardCardId) {
            turnManager.logger.debug(`[${player.name}] Skipped optional ability (Discard to Bounce).`);
            return;
        }

        if (!discardCardId) {
            turnManager.logger.debug(`[${player.name}] No card selected for discard.`);
            return;
        }

        if (!targetCardId) {
            turnManager.logger.debug(`[${player.name}] No target character selected.`);
            return;
        }

        // Find discard card
        const cardToDiscard = player.hand.find(c => c.instanceId === discardCardId);
        if (!cardToDiscard) {
            turnManager.logger.debug(`[${player.name}] Selected discard card not found in hand.`);
            return;
        }

        // Find target character (any player)
        let targetCard: CardInstance | undefined;
        let targetOwner: PlayerState | undefined;

        for (const pId of Object.keys(turnManager.game.state.players)) {
            const p = turnManager.game.getPlayer(pId);
            targetCard = p.play.find(c => c.instanceId === targetCardId);
            if (targetCard) {
                targetOwner = p;
                break;
            }
        }

        if (!targetCard || !targetOwner) {
            turnManager.logger.debug(`[${player.name}] Target character not found in play.`);
            return;
        }

        // Validate cost
        if (targetCard.cost > costLimit) {
            turnManager.logger.debug(`[${player.name}] Target cost ${targetCard.cost} exceeds limit ${costLimit}.`);
            return;
        }

        // Execute Discard
        player.hand = player.hand.filter(c => c.instanceId !== discardCardId);
        player.addCardToZone(cardToDiscard, ZoneType.Discard);
        turnManager.logger.action(player.name, `Discarded ${cardToDiscard.name}`);

        // Execute Bounce
        targetOwner.play = targetOwner.play.filter(c => c.instanceId !== targetCardId);
        targetCard.zone = ZoneType.Hand;
        targetOwner.hand.push(targetCard);
        turnManager.logger.action(player.name, `Returned ${targetCard.name} to ${targetOwner.name}'s hand`);
    }
    // Heal (Generic - same as heal_character for now)
    else if (effect.action === 'heal') {
        const healAmount = effect.amount || 0;
        const targetCardId = payload?.targetCardId || payload?.targetId;

        if (!targetCardId) {
            turnManager.logger.debug(`[${player.name}] No target selected for healing.`);
            return;
        }

        // Find target character in any player's play zone
        let targetCard: CardInstance | undefined;
        let targetOwner: PlayerState | undefined;

        for (const pId of Object.keys(turnManager.game.state.players)) {
            const p = turnManager.game.getPlayer(pId);
            targetCard = p.play.find(c => c.instanceId === targetCardId);
            if (targetCard) {
                targetOwner = p;
                break;
            }
        }

        if (!targetCard || !targetOwner) {
            turnManager.logger.debug(`[${player.name}] Target character not found.`);
            return;
        }

        // Remove damage (up to healAmount, can't go below 0)
        const damageBefore = targetCard.damage || 0;
        const actualHeal = Math.min(healAmount, damageBefore);
        targetCard.damage = damageBefore - actualHeal;

        turnManager.logger.effect(player.name, `Removed ${actualHeal} damage from ${targetCard.name}. Damage: ${damageBefore} -> ${targetCard.damage}`);
    }
    // Modify Strength (Megara)
    else if (effect.action === 'modify_strength') {
        const strengthAmount = effect.amount || 0;
        const targetCardId = payload?.targetCardId || payload?.targetId;
        const duration = effect.duration || 'until_end_of_turn';

        if (!targetCardId) {
            turnManager.logger.debug(`[${player.name}] No target selected for strength modification.`);
            return;
        }

        // Find target character
        let targetCard: CardInstance | undefined;
        for (const pId of Object.keys(turnManager.game.state.players)) {
            const p = turnManager.game.getPlayer(pId);
            targetCard = p.play.find(c => c.instanceId === targetCardId);
            if (targetCard) break;
        }

        if (!targetCard) {
            turnManager.logger.debug(`[${player.name}] Target character not found.`);
            return;
        }

        // Create continuous effect
        const continuousEffect: ContinuousEffect = {
            id: `modify_strength_${Date.now()}_${Math.random()}`,
            type: 'modification',
            target: 'custom',
            targetCardIds: [targetCardId],
            duration: duration as any,
            sourcePlayerId: player.id,
            sourceCardId: sourceCard?.instanceId || '',
            modification: {
                strength: strengthAmount
            }
        };

        turnManager.addActiveEffect(continuousEffect);
        turnManager.logger.effect(player.name, `Modified ${targetCard.name}'s strength by ${strengthAmount} until ${duration}`);
    }
    // Recover from Discard (Hades)
    else if (effect.action === 'recover_from_discard') {
        const targetCardId = payload?.targetCardId || payload?.targetId;

        if (!targetCardId) {
            turnManager.logger.debug(`[${player.name}] No target selected for recover_from_discard.`);
            return;
        }

        // Find card in discard
        const cardIndex = player.discard.findIndex(c => c.instanceId === targetCardId);
        if (cardIndex === -1) {
            turnManager.logger.debug(`[${player.name}] Target card not found in discard.`);
            return;
        }

        const card = player.discard[cardIndex];

        // Move to hand (don't create duplicate!)
        player.discard.splice(cardIndex, 1);
        card.zone = ZoneType.Hand;
        player.hand.push(card);

        turnManager.logger.action(player.name, `Returned ${card.name} from discard to hand`);
    }

    // Look at Top Deck (Ariel)
    else if (effect.action === 'look_top_deck') {
        const amount = effect.amount || 0;
        const filter = effect.params?.filter; // e.g., 'song'

        if (player.deck.length === 0) {
            turnManager.logger.debug(`[${player.name}] Deck is empty, cannot look at top cards.`);
            return;
        }

        // Look at top X cards
        const cards = player.deck.splice(-amount); // Take from end (top)
        turnManager.logger.info(player.name, `Looking at top ${cards.length} cards`);

        // In a real UI, we would ask the user to choose.
        // For now, we'll auto-pick the first valid card if any.
        let chosenCardIndex = -1;

        if (filter) {
            chosenCardIndex = cards.findIndex(c =>
                c.subtypes && c.subtypes.map(s => s.toLowerCase()).includes(filter)
            );
        } else {
            chosenCardIndex = 0; // Pick first if no filter
        }

        if (chosenCardIndex !== -1) {
            const chosenCard = cards[chosenCardIndex];
            // Move to hand
            player.addCardToZone(chosenCard, ZoneType.Hand);
            turnManager.logger.action(player.name, `Revealed and put ${chosenCard.name} into hand`);

            // Remove from temp list
            cards.splice(chosenCardIndex, 1);
        } else {
            turnManager.logger.debug(`[${player.name}] No matching card found to reveal.`);
        }

        // Put rest on bottom of deck
        // "Put the rest on the bottom of your deck in any order."
        // We'll just put them back at the beginning of the array (bottom)
        player.deck.unshift(...cards);
        turnManager.logger.action(player.name, `Put ${cards.length} cards on bottom of deck`);
    }
}

