import { TurnManager } from '../actions';
import { PlayerState } from '../state';
import { CardInstance, ZoneType, ActivationCost, GameAction, ActionType, CardType } from '../models';

export function getValidActions(manager: TurnManager, playerId: string): GameAction[] {
    // CRITICAL: If game is already over, no actions are valid
    if (manager.game.state.winnerId) {
        return [];
    }

    if (manager.game.state.activeEffects.length > 0) {
        // manager.game.state.activeEffects.forEach(e => console.log(` - ${e.type} ${e.restrictionType}`));
    }

    const actions: GameAction[] = [];
    const player = manager.game.getPlayer(playerId);
    const opponentId = Object.keys(manager.game.state.players).find(id => id !== playerId);
    const opponent = opponentId ? manager.game.getPlayer(opponentId) : null;

    // 0. Pass Turn and Concede (Always Valid)
    actions.push({ type: ActionType.PassTurn, playerId });
    actions.push({ type: ActionType.Concede, playerId });

    // 1. Ink Card
    if (!player.inkedThisTurn) {
        player.hand.forEach(card => {
            if (card.inkwell) {
                actions.push({ type: ActionType.InkCard, playerId, cardId: card.instanceId });
            }
        });
    }

    // 2. Play Card
    const readyInk = player.inkwell.filter(c => c.ready).length;

    // Check for Play Restrictions
    const cantPlaySongs = manager.game.state.activeEffects.some(e =>
        e.restrictionType === 'cant_play_songs' &&
        (e.target === 'all' || (e.target === 'opponent' && e.sourceCardId && manager.game.getPlayer(opponentId || '').play.some(c => c.instanceId === e.sourceCardId)))
    );

    const restrictedSongs = manager.game.state.activeEffects.some(e => {
        if (e.restrictionType !== 'cant_play_songs') return false;
        const sourceOwnerId = Object.keys(manager.game.state.players).find(pid =>
            manager.game.state.players[pid].play.some(c => c.instanceId === e.sourceCardId)
        );
        if (!sourceOwnerId) return false; // Source gone

        if (e.target === 'all') return true;
        if (e.target === 'self' && sourceOwnerId === playerId) return true;
        if (e.target === 'opponent' && sourceOwnerId !== playerId) return true;
        return false;
    });

    const restrictedActions = manager.game.state.activeEffects.some(e => {
        if (e.restrictionType !== 'cant_play_actions') return false;

        // Check explicit player targets
        if (e.targetPlayerIds && e.targetPlayerIds.includes(playerId)) return true;

        // Legacy target check
        const sourceOwnerId = e.sourcePlayerId;
        if (!sourceOwnerId) return false;

        if (e.target === 'all') return true;
        if (e.target === 'opponent' && sourceOwnerId !== playerId) return true;
        return false;
    });

    player.hand.forEach(card => {
        const cost = manager.abilitySystem ? manager.abilitySystem.getModifiedCost(card, player) : card.cost;
        if (cost <= readyInk) {
            if (restrictedSongs && card.subtypes.includes('Song')) {
                return; // Skip
            }
            if (restrictedActions && card.type === CardType.Action) {
                return; // Skip
            }
            actions.push({ type: ActionType.PlayCard, playerId, cardId: card.instanceId });
        }

        // 2b. Shift - play card onto same-name character for reduced cost
        const shiftEffect = card.parsedEffects?.find((e: any) =>
            e.action === 'keyword_shift' ||
            (e.type === 'static' && e.keyword === 'shift') ||
            (e.type === 'static' && e.keyword === 'universal_shift')
        ) as any;

        if (shiftEffect) {
            const isUniversalShift = (shiftEffect.keyword === 'universal_shift' || shiftEffect.type === 'universal_shift');
            const baseShiftCost = (shiftEffect.amount !== undefined) ? shiftEffect.amount : (shiftEffect.value || 0);
            const shiftCost = manager.abilitySystem ? manager.abilitySystem.getModifiedShiftCost(card, player, baseShiftCost) : baseShiftCost;

            if (shiftCost <= readyInk) {
                // Find valid shift targets (characters with same name in play)
                const shiftTargets = player.play.filter(c => {
                    if (isUniversalShift) {
                        // Universal Shift can target any character
                        return c.type === 'Character';
                    }
                    return c.name === card.name;
                });

                shiftTargets.forEach(target => {
                    actions.push({
                        type: ActionType.PlayCard,
                        playerId,
                        cardId: card.instanceId,
                        shiftTargetId: target.instanceId
                    });
                });
            }
        }
    });

    // 3. Quest
    // Check if opponent has any exerted characters (for Reckless check)
    const opponentHasExertedTargets = opponent && opponent.play.some(c => !c.ready && c.type === 'Character');

    player.play.forEach(card => {
        // Must be ready and dry
        const isDry = card.turnPlayed < manager.game.state.turnCount;
        if (!card.ready || !isDry) return;

        // Reckless keyword: Cannot quest if there's a valid challenge target
        const hasReckless = card.meta?.hasReckless ||
            card.keywords?.includes('Reckless') ||
            card.parsedEffects?.some((e: any) => e.keyword === 'reckless' || e.type === 'reckless');

        if (hasReckless && opponentHasExertedTargets) {
            // Reckless characters must challenge if able, skip quest action
            return;
        }

        actions.push({ type: ActionType.Quest, playerId, cardId: card.instanceId });
    });

    // 4. Challenge
    const restrictedChallenge = manager.game.state.activeEffects.some(e => {
        if (e.restrictionType !== 'cant_challenge') return false;
        const sourceOwnerId = Object.keys(manager.game.state.players).find(pid =>
            manager.game.state.players[pid].play.some(c => c.instanceId === e.sourceCardId)
        );
        if (!sourceOwnerId) return false;

        if (e.target === 'all') return true;
        if (e.target === 'self' && sourceOwnerId === playerId) return true;
        if (e.target === 'opponent' && sourceOwnerId !== playerId) return true;
        return false;
    });

    if (opponent && !restrictedChallenge) {
        // Rush keyword allows challenging on the turn played (bypasses dry-ink rule)
        const readyAttackers = player.play.filter(c => {
            if (!c.ready) return false;
            const isDry = c.turnPlayed < manager.game.state.turnCount;
            const hasRush = c.keywords?.includes('Rush') ||
                c.parsedEffects?.some((e: any) => e.keyword === 'rush' || e.type === 'rush');
            return isDry || hasRush;
        });
        // CRITICAL: Characters must be exerted to be challenged. Locations can be challenged regardless of state.
        const exertedTargets = opponent.play.filter(c =>
            (!c.ready && c.type === 'Character') ||
            c.type === CardType.Location
        );

        readyAttackers.forEach(attacker => {
            exertedTargets.forEach(target => {
                if (!manager.canChallenge(attacker, target)) return;

                actions.push({
                    type: ActionType.Challenge,
                    playerId,
                    cardId: attacker.instanceId,
                    targetId: target.instanceId
                });
            });
        });
    }

    // 5. Sing Song
    // Characters with cost >= 3 (or Singer N keyword) can exert to sing songs from hand
    const songCards = player.hand.filter(card => card.subtypes?.includes('Song'));
    if (songCards.length > 0) {
        // Find eligible singers: ready, dry characters that can sing
        const eligibleSingers = player.play.filter(character => {
            if (!character.ready) return false;
            if (character.turnPlayed >= manager.game.state.turnCount) return false; // Not dry
            return true;
        });

        songCards.forEach(song => {
            // Default song requirement is the song's cost
            // Songs say "(A character with cost X or more can ⟳ to sing this song for free.)"
            const songRequirement = song.cost || 0;

            // Single singer actions
            eligibleSingers.forEach(singer => {
                const singingValue = manager.getSingingValue(singer);
                if (singingValue >= songRequirement) {
                    actions.push({
                        type: ActionType.SingSong,
                        playerId,
                        cardId: song.instanceId, // The song being sung
                        singerId: singer.instanceId // The character singing
                    });
                }
            });

            // Check for Sing Together songs - allows multiple singers
            const singTogetherEffect = song.parsedEffects?.find((e: any) =>
                e.action === 'keyword_sing_together' ||
                e.keyword === 'sing_together' ||
                (e.type === 'static' && e.effects?.some((ef: any) => ef.type === 'sing_together'))
            ) as any;

            if (singTogetherEffect && eligibleSingers.length >= 2) {
                // Sing Together: sum of singer values must meet requirement
                const singTogetherReq = singTogetherEffect.amount || singTogetherEffect.value || 7;

                // For bots: Generate some reasonable two-singer combinations
                // For UI: A special action will trigger multi-select modal
                // Generate pairs of singers that can meet the requirement
                for (let i = 0; i < eligibleSingers.length; i++) {
                    for (let j = i + 1; j < eligibleSingers.length; j++) {
                        const singer1 = eligibleSingers[i];
                        const singer2 = eligibleSingers[j];
                        const combinedValue = manager.getSingingValue(singer1) + manager.getSingingValue(singer2);

                        if (combinedValue >= singTogetherReq) {
                            actions.push({
                                type: ActionType.SingSong,
                                playerId,
                                cardId: song.instanceId,
                                singerIds: [singer1.instanceId, singer2.instanceId] as any
                            });
                        }
                    }
                }
            }
        });
    }

    // 6. Use Ability
    player.play.forEach(card => {
        if (card.parsedEffects) {
            card.parsedEffects.forEach((effect, index) => {
                const effectAny = effect as any;
                // CRITICAL FIX: Check both trigger and type for activated abilities
                // Also check for Boost keyword which is an activated ability
                const isActivated = effectAny.trigger === 'activated' ||
                    effectAny.type === 'activated' ||
                    (effectAny.keyword === 'boost' && effectAny.costs);
                if (isActivated) {
                    // INFINITE LOOP PROTECTION: Check if ability already used this turn
                    const abilityKey = `ability_${index}`;
                    const currentTurn = manager.game.state.turnCount;
                    if (card.meta?.usedAbilities?.[abilityKey] === currentTurn) {
                        return; // Skip - already used this turn
                    }

                    // Check Costs
                    let canPay = true;
                    // Fix: ActivationCost type import or usage
                    // effect.cost is 'any' or ActivationCost.
                    // Assuming ActivationCost is imported.
                    const cost: ActivationCost = effect.cost || {};

                    if (cost.exert) {
                        if (!card.ready || card.turnPlayed === manager.game.state.turnCount) {
                            canPay = false;
                        }
                    }

                    if (cost.ink) {
                        const readyInk = player.inkwell.filter(i => i.ready).length;
                        if (readyInk < cost.ink) {
                            canPay = false;
                        }
                    }

                    if (cost.discard) {
                        if (player.hand.length < cost.discard) {
                            canPay = false;
                        }
                    }

                    if (canPay) {
                        actions.push({
                            type: ActionType.UseAbility,
                            playerId,
                            cardId: card.instanceId,
                            abilityIndex: index
                        });
                    }
                }
            });
        }
    });

    return actions;
}
