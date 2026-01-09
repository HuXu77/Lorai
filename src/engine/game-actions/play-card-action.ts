/**
 * Play Card Action Handler
 * 
 * Handles playing cards from hand:
 * - Shift: Play onto existing character with reduced cost
 * - Sing: Use characters to pay for Song cards
 * - Normal Play: Pay ink cost and put into play/discard
 * - Triggered abilities: on_play, on_play_other, on_character_played
 */

import { PlayerState } from '../state';
import { CardInstance, CardType, ChoiceRequest, ChoiceType, ZoneType } from '../models';
import { GameEvent } from '../abilities/events';
import { Phase } from '../actions';
import type { TurnManager } from '../actions';

/**
 * Execute play card action
 * 
 * @param turnManager - The TurnManager instance
 * @param player - The player playing the card
 * @param cardId - Instance ID of the card to play
 * @param singerId - Optional: ID of singer for Song cards (legacy single-singer)
 * @param shiftTargetId - Optional: ID of character to shift onto
 * @param targetId - Optional: ID of target for the card's effect
 * @param payload - Optional: Additional data for effects
 * @param singerIds - Optional: Array of singer IDs for multi-singer Songs
 * @param options - Optional: { free?: boolean } for playing without cost
 * @returns True if card was played successfully
 */
export async function executePlayCard(
    turnManager: TurnManager,
    player: PlayerState,
    cardId: string,
    singerId?: string,
    shiftTargetId?: string,
    targetId?: string,
    payload?: any,
    singerIds?: string[],
    options?: { free?: boolean }
): Promise<boolean> {
    const logger = turnManager.logger;
    const game = turnManager.game;
    const abilitySystem = turnManager.abilitySystem;

    // Validate Phase
    if (game.state.phase !== Phase.Main) {
        logger.debug(`Cards can only be played during Main Phase. Current: ${game.state.phase}`);
        return false;
    }

    const cardIndex = player.hand.findIndex(c => c.instanceId === cardId);
    if (cardIndex === -1) {
        return false;
    }
    const card = player.hand[cardIndex];

    // ================== RESTRICTION CHECK ==================
    // Check for Play Restrictions (Global & Player-Specific)
    const activeRestrictions = [
        ...(game.state.activeEffects || []),
        ...(player.restrictions || [])
    ];

    const cantPlayActions = activeRestrictions.some(e => {
        if (e.restrictionType !== 'cant_play_actions') return false;
        // Check filtering for global effects
        if (e.targetPlayerIds && e.targetPlayerIds.includes(player.id)) return true;
        // Check opponent targeting (global effect)
        if (e.target === 'opponent' && e.sourcePlayerId && e.sourcePlayerId !== player.id) return true;
        // Direct restriction on player (from player.restrictions)
        if (!e.target && !e.targetPlayerIds && !e.sourcePlayerId) return true; // Generically attached to player

        // If it's a restriction attached to the player instance, it applies
        if ((player.restrictions || []).includes(e)) return true;

        return e.target === 'all';
    });

    if (cantPlayActions && card.type === CardType.Action) {
        logger.debug(`Cannot play actions due to restriction.`);
        return false;
    }

    // ================== SHIFT PATH ==================
    if (shiftTargetId) {
        return handleShift(turnManager, player, card, cardIndex, shiftTargetId, payload);
    }

    // ================== SING PATH ==================
    const effectiveSingerIds = singerIds || (singerId ? [singerId] : []);
    if (effectiveSingerIds.length > 0) {
        return handleSing(turnManager, player, card, cardIndex, effectiveSingerIds, targetId, payload);
    }

    // ================== NORMAL PLAY PATH ==================
    return handleNormalPlay(turnManager, player, card, cardIndex, targetId, payload, options);
}

/**
 * Handle Shift: Play card onto existing character with reduced cost
 */
async function handleShift(
    turnManager: TurnManager,
    player: PlayerState,
    card: CardInstance,
    cardIndex: number,
    shiftTargetId: string,
    payload?: any
): Promise<boolean> {
    const logger = turnManager.logger;
    const abilitySystem = turnManager.abilitySystem;

    const shiftTarget = player.play.find(c => c.instanceId === shiftTargetId);
    if (!shiftTarget) {
        logger.debug('Shift target not found.');
        return false;
    }

    // Verify name match
    if (card.name !== shiftTarget.name) {
        logger.debug(`Cannot shift ${card.name} onto ${shiftTarget.name} (names do not match).`);
        return false;
    }

    // Verify Shift keyword
    const shiftEffect = card.parsedEffects?.find((e: any) =>
        e.action === 'keyword_shift' ||
        (e.type === 'static' && e.keyword === 'shift') ||
        (e.type === 'static' && e.keyword === 'universal_shift')
    ) as any;

    if (!shiftEffect) {
        logger.debug(`${card.name} does not have Shift.`);
        return false;
    }

    // Check cost (Shift Cost)
    const baseShiftCost = (shiftEffect.amount !== undefined) ? shiftEffect.amount : (shiftEffect.value || 0);
    const shiftCost = abilitySystem.getModifiedShiftCost(card, player, baseShiftCost);
    const readyInk = player.inkwell.filter(c => c.ready).length;
    if (readyInk < shiftCost) {
        logger.debug(`Not enough ink for Shift. Need ${shiftCost}, have ${readyInk}`);
        return false;
    }

    // Pay ink
    let paid = 0;
    for (const ink of player.inkwell) {
        if (ink.ready && paid < shiftCost) {
            ink.ready = false;
            paid++;
        }
    }

    // Move card to play (replacing target)
    player.hand.splice(cardIndex, 1);

    // Replace target in play
    const targetIndex = player.play.findIndex(c => c.instanceId === shiftTargetId);
    player.play[targetIndex] = card;

    // Inherit state
    card.zone = ZoneType.Play;
    card.ready = shiftTarget.ready;
    card.damage = shiftTarget.damage;
    card.turnPlayed = shiftTarget.turnPlayed; // Inherit drying status
    card.turnPlayed = shiftTarget.turnPlayed; // Inherit drying status
    card.meta = { ...shiftTarget.meta, shiftedUnder: shiftTarget };

    // CRITICAL FIX: Update ability system
    // 1. Unregister the old card (remove its listeners)
    if (abilitySystem) {
        abilitySystem.unregisterCard(shiftTarget);
    }

    // 2. Register the new card (add its listeners)
    if (abilitySystem) {
        abilitySystem.registerCard(card);
    }

    logger.action(player.name, `Shifted ${card.name} onto ${shiftTarget.name}`, {
        card,
        cost: paid,
        shiftTarget: shiftTarget,
        type: 'shift'
    });

    // Emit CARD_PLAYED event (triggers abilities registered via event system)
    await abilitySystem.emitEvent(GameEvent.CARD_PLAYED, {
        card,
        player,
        wasShifted: true
    });

    // Trigger "On Play" effects (legacy support for `trigger: 'on_play'`)
    if (card.parsedEffects) {
        for (const effect of card.parsedEffects) {
            const e = effect as any;
            if (e.trigger === 'on_play' || e.event === GameEvent.CARD_PLAYED) {
                await turnManager.resolveEffect(player, effect, card, undefined, payload);
            }
        }
    }

    // Trigger global on_play_other effects
    await triggerGlobalPlayEffects(turnManager, player, card, payload);

    return true;
}

/**
 * Handle Sing: Use characters to pay for Song cards
 */
async function handleSing(
    turnManager: TurnManager,
    player: PlayerState,
    card: CardInstance,
    cardIndex: number,
    singerIds: string[],
    targetId?: string,
    payload?: any
): Promise<boolean> {
    const logger = turnManager.logger;
    const abilitySystem = turnManager.abilitySystem;

    // Validate Song
    if (!card.subtypes?.includes('Song')) {
        logger.debug(`${card.name} is not a Song.`);
        return false;
    }

    // Calculate total singing value
    let totalSingValue = 0;
    const singers: CardInstance[] = [];

    for (const id of singerIds) {
        const singer = player.play.find(c => c.instanceId === id);
        if (!singer) {
            logger.debug(`Singer ${id} not found.`);
            return false;
        }
        if (!singer.ready) {
            logger.debug(`${singer.name} is exerted and cannot sing.`);
            return false;
        }

        // Calculate sing value using abilitySystem
        const singValue = turnManager.getSingingValue(singer);

        if (singValue <= 0) {
            logger.debug(`${singer.name} cannot sing (value: ${singValue}).`);
            return false;
        }

        totalSingValue += singValue;
        singers.push(singer);
    }

    // Use ability system for comprehensive cost calculation
    const effectiveCost = abilitySystem.getModifiedCost(card, player);

    if (totalSingValue < effectiveCost) {
        logger.debug(`Not enough singing value. Need ${effectiveCost}, have ${totalSingValue}`);
        return false;
    }

    // Exert all singers
    singers.forEach(s => {
        s.ready = false;
    });

    // Move card
    player.hand.splice(cardIndex, 1);
    card.zone = ZoneType.Discard;
    player.discard.push(card);

    // Resolve target
    const targetCard = await resolveTarget(turnManager, targetId);

    // Execute action card abilities
    await abilitySystem.executeActionCard(card, player, targetCard, payload);

    // Emit event
    await abilitySystem.emitEvent(GameEvent.CARD_PLAYED, {
        card,
        player,
        targetCard
    });

    // Trigger "on_play_song" effects
    player.play.forEach(c => {
        if (c.parsedEffects) {
            c.parsedEffects.forEach(effect => {
                if (effect.trigger === 'on_play_song') {
                    turnManager.resolveEffect(player, effect, c, undefined, payload);
                }
            });
        }
    });

    singers.forEach(s => {
        logger.action(player.name, `${s.name} sings ${card.name}`);
    });

    return true;
}

/**
 * Handle Normal Play: Pay ink cost and put card into play/discard
 */
async function handleNormalPlay(
    turnManager: TurnManager,
    player: PlayerState,
    card: CardInstance,
    cardIndex: number,
    targetId?: string,
    payload?: any,
    options?: { free?: boolean }
): Promise<boolean> {
    const logger = turnManager.logger;
    const game = turnManager.game;
    const abilitySystem = turnManager.abilitySystem;

    // Calculate cost
    let effectiveCost = abilitySystem.getModifiedCost(card, player);

    if (options?.free) {
        effectiveCost = 0;
        logger.debug(`Playing ${card.name} for free.`);
    }

    // Consume one-use cost reductions
    if (player.costReductions && player.costReductions.length > 0) {
        const applicableReductions = player.costReductions.filter(r => {
            if (r.filter === 'all') return true;
            if (r.filter === 'character' && card.type === CardType.Character) return true;
            if (r.filter === 'action' && card.type === CardType.Action) return true;
            if (r.filter === 'item' && card.type === CardType.Item) return true;
            return false;
        });

        if (applicableReductions.length > 0) {
            player.costReductions = player.costReductions.filter(r => {
                if (applicableReductions.includes(r) && r.duration === 'one_use') {
                    return false;
                }
                return true;
            });
            logger.debug(`[${player.name}] Consumed ${applicableReductions.length} cost reductions.`);
        }
    }



    // Check ink
    const readyInk = player.inkwell.filter(c => c.ready).length;
    logger.debug(`[PlayCard] Checking ink for ${card.name}: Cost=${effectiveCost}, ReadyInk=${readyInk}`);
    if (readyInk < effectiveCost) {
        logger.debug(`Not enough ink. Need ${effectiveCost}, have ${readyInk}`);
        return false;
    }

    // Pay cost
    let paid = 0;
    for (const ink of player.inkwell) {
        if (ink.ready && paid < effectiveCost) {
            ink.ready = false;
            paid++;
        }
    }





    // Move card from hand
    player.hand.splice(cardIndex, 1);

    // Resolve target
    const targetCard = await resolveTarget(turnManager, targetId);
    const targetPlayer = targetId && !targetCard ? game.state.players[targetId] : undefined;

    if (card.type === CardType.Action) {
        return handleActionCard(turnManager, player, card, targetCard, targetPlayer, payload);
    } else {
        return handlePermanentCard(turnManager, player, card, targetCard, targetPlayer, payload);
    }
}

/**
 * Handle Action card: Goes to discard, effects resolve
 */
async function handleActionCard(
    turnManager: TurnManager,
    player: PlayerState,
    card: CardInstance,
    targetCard?: CardInstance,
    targetPlayer?: any,
    payload?: any
): Promise<boolean> {
    const logger = turnManager.logger;
    const abilitySystem = turnManager.abilitySystem;

    card.zone = ZoneType.Discard;
    player.discard.push(card);
    logger.action(player.name, `Played Action ${card.name}`, {
        card,
        cost: card.cost,
        target: targetCard,
        targetPlayer: targetPlayer?.name
    });

    // Execute Action Card Abilities
    await abilitySystem.executeActionCard(card, player, targetCard || targetPlayer, payload);

    // Emit CARD_PLAYED event
    await abilitySystem.emitEvent(GameEvent.CARD_PLAYED, {
        card,
        player,
        targetCard: targetCard || targetPlayer
    });

    // Trigger "On Play Song" effects
    if (card.subtypes && card.subtypes.includes('Song')) {
        player.play.forEach(c => {
            if (c.parsedEffects) {
                c.parsedEffects.forEach(effect => {
                    if (effect.trigger === 'on_play_song') {
                        turnManager.resolveEffect(player, effect, c, undefined, payload);
                    }
                });
            }
        });
    }

    // Recalculate effects to ensure changes (e.g. from Action effects) are applied
    turnManager.recalculateEffects();

    return true;
}

/**
 * Handle Permanent card (Character/Item/Location): Goes to play area
 */
async function handlePermanentCard(
    turnManager: TurnManager,
    player: PlayerState,
    card: CardInstance,
    targetCard?: CardInstance,
    targetPlayer?: any,
    payload?: any
): Promise<boolean> {
    const logger = turnManager.logger;
    const game = turnManager.game;
    const abilitySystem = turnManager.abilitySystem;

    card.zone = ZoneType.Play;

    // Check for "enters play exerted" effect
    const entersExerted = card.parsedEffects?.some(e => e.action === 'enters_play_exerted');

    // Check for Bodyguard - "may enter play exerted"
    const hasBodyguard = card.parsedEffects?.some((e: any) =>
        e.action === 'keyword_bodyguard' ||
        e.keyword === 'bodyguard' ||
        (e.type === 'static' && e.effects?.some((ef: any) => ef.type === 'bodyguard'))
    );

    let bodyguardExerted = false;
    if (hasBodyguard && turnManager.requestChoice) {
        const bodyguardRequest: ChoiceRequest = {
            id: `bodyguard_${card.instanceId}_${Date.now()}`,
            type: ChoiceType.YES_NO,
            playerId: player.id,
            prompt: `${card.fullName || card.name} has Bodyguard. Enter play exerted?`,
            options: [
                { id: 'yes', display: 'Yes, enter exerted', valid: true },
                { id: 'no', display: 'No, enter ready', valid: true }
            ],
            optional: true,
            source: {
                card: card,
                abilityName: 'Bodyguard',
                player: player as any
            },
            timestamp: Date.now()
        };

        try {
            const response = await turnManager.requestChoice(bodyguardRequest);
            bodyguardExerted = response.selectedIds?.includes('yes') && !response.declined;
            logger.debug(`[Bodyguard] Player chose: ${bodyguardExerted ? 'exerted' : 'ready'}`);
        } catch (e) {
            logger.debug(`[Bodyguard] Choice request failed, defaulting to ready`);
        }
    }

    card.ready = !entersExerted && !bodyguardExerted;
    card.turnPlayed = game.state.turnCount;
    player.play.push(card);
    card.zone = ZoneType.Play;

    // Register abilities
    if (abilitySystem) {
        abilitySystem.registerCard(card);
    }

    logger.action(player.name, `Played ${card.name}`, {
        card,
        cost: card.cost,
        ready: card.ready
    });

    // Recalculate effects
    turnManager.recalculateEffects();

    // Emit CARD_PLAYED event
    await abilitySystem.emitEvent(GameEvent.CARD_PLAYED, {
        card,
        player,
        targetCard: targetCard || targetPlayer
    });

    // Handle on_targeted
    if (targetCard) {
        await handleOnTargeted(turnManager, player, targetCard);
    }

    // Trigger on_character_played for other characters
    if (card.type === CardType.Character) {
        player.play.forEach(char => {
            if (char.instanceId !== card.instanceId && char.parsedEffects) {
                char.parsedEffects.forEach((effect: any) => {
                    if (effect.trigger === 'on_character_played') {
                        turnManager.resolveEffect(player, effect, char, card, payload);
                    }
                });
            }
        });
    }

    // Trigger global on_play_other effects
    await triggerGlobalPlayEffects(turnManager, player, card, payload);

    // CRITICAL FIX: Recalculate effects to ensure on-play changes (e.g. Resist +2) are applied
    turnManager.recalculateEffects();

    return true;
}

/**
 * Resolve a target ID to a CardInstance
 */
async function resolveTarget(
    turnManager: TurnManager,
    targetId?: string
): Promise<CardInstance | undefined> {
    if (!targetId) return undefined;

    const game = turnManager.game;
    const allPlayers = Object.values(game.state.players);

    // Check Play
    for (const p of allPlayers) {
        const found = p.play.find(c => c.instanceId === targetId);
        if (found) return found;
    }

    // Check Discard
    for (const p of allPlayers) {
        const found = p.discard.find(c => c.instanceId === targetId);
        if (found) return found;
    }

    return undefined;
}

/**
 * Handle on_targeted effects (e.g., Vanish)
 */
async function handleOnTargeted(
    turnManager: TurnManager,
    player: PlayerState,
    targetCard: CardInstance
): Promise<void> {
    if (targetCard.parsedEffects) {
        for (const effect of targetCard.parsedEffects) {
            if (effect.trigger === 'on_targeted') {
                if (targetCard.ownerId !== player.id) {
                    await turnManager.resolveEffect(
                        turnManager.game.getPlayer(targetCard.ownerId),
                        effect,
                        targetCard
                    );
                }
            }
        }
    }
}

/**
 * Trigger global on_play_other effects
 */
async function triggerGlobalPlayEffects(
    turnManager: TurnManager,
    player: PlayerState,
    card: CardInstance,
    payload?: any
): Promise<void> {
    const game = turnManager.game;
    const allPlayers = Object.values(game.state.players);

    allPlayers.forEach(p => {
        p.play.forEach(c => {
            if (c.instanceId !== card.instanceId && c.parsedEffects) {
                c.parsedEffects.forEach(effect => {
                    if (effect.trigger === 'on_play_other') {
                        const filter = effect.params?.filter;
                        let match = true;

                        if (filter) {
                            if (filter.type && card.type !== filter.type) match = false;
                            if (filter.subtype && (!card.subtypes || !card.subtypes.includes(filter.subtype))) match = false;
                            if (filter.costLimit !== undefined && card.cost > filter.costLimit) match = false;
                        }

                        if (match) {
                            turnManager.logger.effect(c.name, `Global Trigger triggered by ${card.name}`);
                            turnManager.resolveEffect(
                                p as PlayerState,
                                effect,
                                c,
                                undefined,
                                { ...payload, triggerCard: card }
                            );
                        }
                    }
                });
            }
        });
    });
}
