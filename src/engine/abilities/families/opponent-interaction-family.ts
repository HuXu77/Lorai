import { BaseFamilyHandler } from './base-family-handler';
import type { GameContext } from '../executor';

/**
 * Opponent Interaction Family Handler
 * Handles 13 opponent-focused effect types with simple bot logic:
 * - opponent_choice_discard
 * - opponent_choice_banish
 * - opponent_play_reveal_and_discard
 * - opponent_discard_from_hand
 * - opponent_loses_lore
 * - opponent_banish_character
 * - pay_lore_to_prevent_banish
 * - opponent_reveals_hand_you_choose_discard
 * - opponent_pays_ink_or_discard
 * - prevent_opponent_lore_gain
 * - steal_lore_from_opponent
 * - force_opponent_to_choose
 * - opponent_return_to_hand
 */
export class OpponentInteractionFamilyHandler extends BaseFamilyHandler {
    private executor: any;

    constructor(executor: any) {
        super(executor.turnManager);
        this.executor = executor;
    }

    protected async resolveTargets(target: any, context: GameContext): Promise<any[]> {
        if (this.executor?.resolveTargets) {
            return this.executor.resolveTargets(target, context);
        }
        return super.resolveTargets(target, context);
    }
    async execute(effect: any, context: GameContext): Promise<void> {
        const player = context.player;
        const opponent = this.getOpponent(player.id); // Fix: Pass ID, not object

        if (!opponent) {
            this.turnManager.logger.warn(`[OpponentInteraction] No opponent found for ${player.name} (ID: ${player.id})`);
            return;
        }

        switch (effect.type) {
            case 'opponent_choice':
                const subAction = effect.action;
                if (subAction && subAction.type === 'modal') {
                    // Handle modal choice for opponent
                    const options = subAction.options.map((opt: any, index: number) => ({
                        id: index.toString(),
                        display: opt.description || `Option ${index + 1}`,
                        valid: true,
                        value: index
                    }));

                    if (this.turnManager.requestChoice) {
                        const choiceRequest = {
                            id: 'choice_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                            type: 'modal' as any,
                            playerId: opponent.id,
                            prompt: context.abilityName ? `${context.abilityName} - Opponent Choice` : 'Choose an option',
                            options: options,
                            source: {
                                card: context.card,
                                abilityName: context.abilityName || 'Opponent Choice',
                                player: player
                            },
                            min: 1,
                            max: 1 // Modal is single choice
                        };

                        const response = await this.turnManager.requestChoice(choiceRequest);
                        if (response && response.selectedIds && response.selectedIds.length > 0) {
                            const selectedIndex = parseInt(response.selectedIds[0]);
                            const selectedOption = subAction.options[selectedIndex];
                            if (selectedOption) {
                                this.turnManager.logger.info(`[OpponentInteraction] Opponent chose: ${options[selectedIndex].display}`);

                                // Execute as OPPONENT
                                const oppContext = { ...context, player: opponent };

                                for (const subEffect of selectedOption.effects) {
                                    // Use the executor passed in constructor
                                    if (this.executor && this.executor.execute) {
                                        await this.executor.execute(subEffect, oppContext);
                                    }
                                }
                            }
                        }
                    } else {
                        // Bot fallback: Default to first option
                        // TODO: sophisticated logic
                        if (subAction.options.length > 0) {
                            const selectedOption = subAction.options[0];
                            const oppContext = { ...context, player: opponent };
                            for (const subEffect of selectedOption.effects) {
                                if (this.executor && this.executor.execute) {
                                    await this.executor.execute(subEffect, oppContext);
                                }
                            }
                        }
                    }
                } else {
                    this.turnManager.logger.warn(`[OpponentInteraction] Unknown sub-action type: ${subAction?.type}`);
                }
                break;

            case 'opponent_choice_discard':
                // Opponent chooses cards to discard from their hand
                const discardAmount = effect.amount || 1;

                if (opponent.hand.length > 0) {
                    // Create choice options from opponent's hand
                    const discardOptions = opponent.hand.map((c: any) => ({
                        id: c.instanceId,
                        display: `${c.fullName || c.name} (Cost ${c.cost || 0})`,
                        card: c,
                        valid: true
                    }));

                    if (this.turnManager.requestChoice) {
                        const choiceRequest = {
                            id: 'choice_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                            type: 'target_card_in_hand' as any,
                            playerId: opponent.id,
                            prompt: `Choose ${discardAmount} card(s) to discard`,
                            options: discardOptions,
                            source: {
                                card: context.card,
                                abilityName: context.abilityName || 'Opponent Discard',
                                player: player
                            },
                            min: Math.min(discardAmount, opponent.hand.length),
                            max: Math.min(discardAmount, opponent.hand.length),
                            timestamp: Date.now()
                        };

                        const response = await this.turnManager.requestChoice(choiceRequest);

                        // Process selections
                        const toDiscardIDs = response.selectedIds;
                        const discardedCards: any[] = [];

                        toDiscardIDs.forEach((id: string) => {
                            const card = opponent.hand.find((c: any) => c.instanceId === id);
                            if (card) {
                                opponent.hand = opponent.hand.filter((c: any) => c.instanceId !== id);
                                card.zone = 'discard';
                                opponent.discard.push(card);
                                discardedCards.push(card);
                            }
                        });

                        this.turnManager.logger.info(`[OpponentInteraction] 🗑️ Opponent discarded ${discardedCards.length} card(s)`, {
                            effectType: 'opponent_choice_discard',
                            cards: discardedCards.map(c => c.name)
                        });
                    } else {
                        // Fallback: Bot logic (for tests/no-UI)
                        const sortedHand = [...opponent.hand].sort((a: any, b: any) => a.cost - b.cost);
                        const toDiscard = sortedHand.slice(0, Math.min(discardAmount, opponent.hand.length));

                        toDiscard.forEach((card: any) => {
                            opponent.hand = opponent.hand.filter((c: any) => c.instanceId !== card.instanceId);
                            card.zone = 'discard';
                            opponent.discard.push(card);
                        });
                    }
                }
                break;

            case 'opponent_choice_banish':
                // Opponent chooses character to banish
                const banishAmount = effect.amount || 1;
                const opponentChars = opponent.play.filter((c: any) => c.type && c.type.toLowerCase() === 'character');

                if (opponentChars.length > 0) {
                    // Create choice options
                    const banishOptions = opponentChars.map((c: any) => ({
                        id: c.instanceId,
                        display: `${c.fullName || c.name} (${c.strength}/${c.willpower})`,
                        card: c,
                        valid: true
                    }));

                    if (this.turnManager.requestChoice) {
                        const choiceRequest = {
                            id: 'choice_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                            type: 'target_character' as any,
                            playerId: opponent.id,
                            prompt: `Choose ${banishAmount} character(s) to banish`,
                            options: banishOptions,
                            source: {
                                card: context.card,
                                abilityName: context.abilityName || 'Opponent Banish',
                                player: player
                            },
                            min: Math.min(banishAmount, opponentChars.length),
                            max: Math.min(banishAmount, opponentChars.length),
                            timestamp: Date.now()
                        };

                        const response = await this.turnManager.requestChoice(choiceRequest);

                        // Check if response is valid (undefined in test/bot mode)
                        if (response && response.selectedIds && response.selectedIds.length > 0) {
                            const selectedIds = response.selectedIds;

                            selectedIds.forEach((id: string) => {
                                const toBanish = opponent.play.find((c: any) => c.instanceId === id);
                                if (toBanish) {
                                    opponent.play = opponent.play.filter((c: any) => c.instanceId !== id);
                                    opponent.discard.push(toBanish);
                                    this.turnManager.logger.info(`[OpponentInteraction] 🗑️ Opponent chose to banish ${toBanish.name}`);
                                }
                            });
                        } else {
                            // Fallback: Bot logic when no response or in test mode
                            const sortedChars = [...opponentChars].sort((a: any, b: any) =>
                                (a.willpower || 0) - (b.willpower || 0)
                            );
                            const toBanish = sortedChars[0];

                            opponent.play = opponent.play.filter((c: any) => c.instanceId !== toBanish.instanceId);
                            opponent.discard.push(toBanish);

                            this.turnManager.logger.info(`[OpponentInteraction] 🗑️ Opponent banished ${toBanish.name}`, {
                                effectType: 'opponent_choice_banish'
                            });
                        }

                    } else {
                        // Fallback: Simple bot logic when requestChoice doesn't exist
                        const sortedChars = [...opponentChars].sort((a: any, b: any) =>
                            (a.willpower || 0) - (b.willpower || 0)
                        );
                        const toBanish = sortedChars[0];

                        opponent.play = opponent.play.filter((c: any) => c.instanceId !== toBanish.instanceId);
                        opponent.discard.push(toBanish);

                        this.turnManager.logger.info(`[OpponentInteraction] 🗑️ Opponent banished ${toBanish.name}`, {
                            effectType: 'opponent_choice_banish'
                        });
                    }
                }
                break;

            case 'opponent_play_reveal_and_discard':
                // Reveal opponent's hand, you choose what they discard
                // ALWAYS show modal with full hand - valid cards selectable, invalid cards visible but grayed out
                this.turnManager.logger.info(`[OpponentInteraction] 👀 Opponent reveals hand`, {
                    cards: opponent.hand.map((c: any) => c.name)
                });

                // Build choice options from opponent's ENTIRE hand with validity based on filter
                const filter = effect.filter;
                const allHandOptions = opponent.hand.map((c: any) => {
                    let isValid = true;

                    // Apply Filter to determine selectability
                    if (filter) {
                        if (filter.type === 'not') {
                            // "non-character" = NOT character type
                            if (filter.filter.type === 'character' && c.type?.toLowerCase() === 'character') {
                                isValid = false;
                            }
                        } else if (filter.type) {
                            // Direct type filter (e.g., "song", "action", "item")
                            if (c.type?.toLowerCase() !== filter.type.toLowerCase()) {
                                isValid = false;
                            }
                        }
                    }

                    return {
                        id: c.instanceId,
                        display: `${c.fullName || c.name} (${c.type || 'Unknown'} - Cost ${c.cost || 0})`,
                        card: c,
                        valid: isValid,
                        invalidReason: isValid ? undefined : `Cannot select ${c.type || 'this card type'}`
                    };
                });
                // NOTE: Do NOT filter - we show ALL cards, valid or not

                const hasValidOptions = allHandOptions.some((o: any) => o.valid);

                // Request choice from player via TurnManager - ALWAYS show modal
                if (this.turnManager.requestChoice) {
                    const choiceRequest = {
                        id: 'choice_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        type: 'reveal_opponent_hand_choose_discard' as any,
                        playerId: player.id,
                        prompt: hasValidOptions
                            ? `Choose a card from opponent's hand to discard`
                            : `Opponent's hand revealed (no valid cards to discard)`,
                        options: allHandOptions,
                        source: {
                            card: context.card,
                            abilityName: context.abilityName || 'Reveal and Discard',
                            player: player
                        },
                        min: hasValidOptions ? 1 : 0,
                        max: hasValidOptions ? 1 : 0,
                        allowSkip: !hasValidOptions, // Allow skip if no valid options
                        timestamp: Date.now()
                    };

                    const response = await this.turnManager.requestChoice(choiceRequest);
                    if (response && response.selectedIds && response.selectedIds.length > 0) {
                        const toDiscard = opponent.hand.find((c: any) => c.instanceId === response.selectedIds[0]);
                        if (toDiscard) {
                            opponent.hand = opponent.hand.filter((c: any) => c.instanceId !== toDiscard.instanceId);
                            toDiscard.zone = 'discard';
                            opponent.discard.push(toDiscard);
                            this.turnManager.logger.info(`[OpponentInteraction] 🗑️ You chose opponent discards ${toDiscard.name}`);
                        }
                    } else if (!hasValidOptions) {
                        this.turnManager.logger.info(`[OpponentInteraction] 👁️ No valid cards to discard, opponent's hand was revealed only`);
                    } else {
                        // Bot fallback: Choose highest cost valid card
                        const validCards = opponent.hand.filter((c: any) => {
                            if (!filter) return true;
                            if (filter.type === 'not' && filter.filter.type === 'character') {
                                return c.type?.toLowerCase() !== 'character';
                            }
                            return true;
                        });
                        if (validCards.length > 0) {
                            const sortedByDesc = [...validCards].sort((a: any, b: any) => (b.cost || 0) - (a.cost || 0));
                            const toDiscard = sortedByDesc[0];

                            opponent.hand = opponent.hand.filter((c: any) => c.instanceId !== toDiscard.instanceId);
                            toDiscard.zone = 'discard';
                            opponent.discard.push(toDiscard);
                            this.turnManager.logger.info(`[OpponentInteraction] 🗑️ Bot chose opponent discard: ${toDiscard.name}`);
                        }
                    }
                } else {
                    // Fallback: No choice handler
                    this.turnManager.logger.info(`[OpponentInteraction] 🗑️ No choice handler, skipping reveal and discard`);
                }
                break;

            case 'opponent_discard':
            case 'opponent_discard_from_hand':
                // Force opponent to discard (no choice)
                const forceDiscardAmount = effect.amount || 1;
                const discarded = opponent.hand.splice(0, Math.min(forceDiscardAmount, opponent.hand.length));

                discarded.forEach((card: any) => {
                    card.zone = 'discard';
                    opponent.discard.push(card);
                });

                this.turnManager.logger.info(`[OpponentInteraction] 🗑️ Opponent forced to discard ${discarded.length} card(s)`, {
                    effectType: 'opponent_discard_from_hand'
                });
                break;

            case 'opponent_loses_lore':
                // Opponent loses lore
                const loreAmount = effect.amount || 1;
                opponent.lore = Math.max(0, opponent.lore - loreAmount);

                this.turnManager.logger.info(`[OpponentInteraction] 📉 Opponent lost ${loreAmount} lore`, {
                    effectType: 'opponent_loses_lore',
                    newLore: opponent.lore
                });
                break;

            case 'opponent_banish_character':
                // Banish opponent's character (you choose or specific)
                const targetChar = (await this.resolveTargets(effect.target, context))[0];

                if (targetChar) {
                    opponent.play = opponent.play.filter((c: any) => c.instanceId !== targetChar.instanceId);
                    opponent.discard.push(targetChar);

                    this.turnManager.logger.info(`[OpponentInteraction] 🗑️ Banished opponent's ${targetChar.name}`, {
                        effectType: 'opponent_banish_character'
                    });
                }
                break;

            case 'pay_lore_to_prevent_banish':
                // Opponent can pay lore to prevent character banish
                const loreCost = effect.cost || 1;
                const characterToBanish = (await this.resolveTargets(effect.target, context))[0];

                if (characterToBanish) {
                    // Simple bot logic: pay if affordable and character is valuable
                    const charValue = (characterToBanish.willpower || 0) + (characterToBanish.strength || 0);
                    const shouldPay = opponent.lore >= loreCost && charValue >= loreCost * 2;

                    if (shouldPay) {
                        opponent.lore -= loreCost;
                        this.turnManager.logger.info(`[OpponentInteraction] 💰 Opponent paid ${loreCost} lore to save ${characterToBanish.name}`);
                    } else {
                        opponent.play = opponent.play.filter((c: any) => c.instanceId !== characterToBanish.instanceId);
                        opponent.discard.push(characterToBanish);
                        this.turnManager.logger.info(`[OpponentInteraction] 🗑️ Opponent didn't pay, banished ${characterToBanish.name}`);
                    }
                }
                break;

            case 'opponent_reveals_hand_you_choose_discard':
                // You choose what opponent discards from their revealed hand
                if (opponent.hand.length > 0) {
                    // Build choice options from opponent's hand
                    const handOptions = opponent.hand.map((c: any) => ({
                        id: c.instanceId,
                        display: `${c.fullName || c.name} (Cost ${c.cost || 0})`,
                        card: c,
                        valid: true
                    }));

                    // Request choice from player via TurnManager
                    if (this.turnManager.requestChoice) {
                        const choiceRequest = {
                            id: 'choice_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                            type: 'target_card_in_hand' as any,
                            playerId: player.id,
                            prompt: `Choose a card from opponent's hand to discard`,
                            options: handOptions,
                            source: {
                                card: context.card,
                                abilityName: context.abilityName || 'Choose Discard',
                                player: player
                            },
                            min: 1,
                            max: 1,
                            timestamp: Date.now()
                        };

                        const response = await this.turnManager.requestChoice(choiceRequest);
                        if (response.selectedIds.length > 0) {
                            const toDiscard = opponent.hand.find((c: any) => c.instanceId === response.selectedIds[0]);
                            if (toDiscard) {
                                opponent.hand = opponent.hand.filter((c: any) => c.instanceId !== toDiscard.instanceId);
                                opponent.discard.push(toDiscard);
                                this.turnManager.logger.info(`[OpponentInteraction] 🗑️ Chose opponent discards ${toDiscard.name}`);
                            }
                        }
                    } else {
                        // Fallback: decline
                        this.turnManager.logger.info(`[OpponentInteraction] 🗑️ No choice handler, skipping`);
                    }
                }
                break;

            case 'opponent_pays_ink_or_discard':
                // Opponent pays ink or discards cards
                const inkCost = effect.inkCost || 2;
                const discardCost = effect.discardCost || 1;

                // Simple bot logic: pay ink if available, else discard
                const availableInk = opponent.inkwell.filter((c: any) => c.ready).length;

                if (availableInk >= inkCost) {
                    // Pay ink (exert ink cards)
                    const readyInk = opponent.inkwell.filter((c: any) => c.ready);
                    readyInk.slice(0, inkCost).forEach((card: any) => {
                        card.ready = false;
                    });
                    this.turnManager.logger.info(`[OpponentInteraction] 💰 Opponent paid ${inkCost} ink`);
                } else {
                    // Discard instead
                    const toDiscard = opponent.hand.splice(0, Math.min(discardCost, opponent.hand.length));
                    toDiscard.forEach((card: any) => opponent.discard.push(card));
                    this.turnManager.logger.info(`[OpponentInteraction] 🗑️ Opponent discarded ${toDiscard.length} card(s)`);
                }
                break;

            case 'prevent_opponent_lore_gain':
            case 'steal_lore_from_opponent':
            case 'force_opponent_to_choose':
            case 'opponent_return_to_hand':
                // Register passive opponent interaction effects
                this.registerPassiveEffect({
                    type: effect.type,
                    amount: effect.amount,
                    filter: effect.filter,
                    sourceCardId: context.card?.instanceId
                }, context);

                this.turnManager.logger.info(`[OpponentInteraction] 🎯 Passive opponent effect registered`, {
                    effectType: effect.type
                });
                break;

            // === BATCH 15: Advanced Opponent Interactions ===
            case 'opponent_choice_damage':
                // Opponent chooses which of YOUR characters to damage
                const damageAmount = effect.amount || 1;
                const damageableChars = player.play.filter((c: any) => c.type === 'character' || c.type === 'Character');
                if (damageableChars.length > 0) {
                    // Build choice options
                    const damageOptions = damageableChars.map((c: any) => ({
                        id: c.instanceId,
                        display: `${c.fullName || c.name} (${c.willpower || 0}⛉, ${c.damage || 0} damage)`,
                        card: c,
                        valid: true
                    }));

                    // Request choice from OPPONENT
                    if (this.turnManager.requestChoice) {
                        const choiceRequest = {
                            id: 'choice_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                            type: 'target_character' as any,
                            playerId: opponent.id,
                            prompt: `Choose a character to deal ${damageAmount} damage to`,
                            options: damageOptions,
                            source: {
                                card: context.card,
                                abilityName: context.abilityName || 'Choose Damage Target',
                                player: player
                            },
                            min: 1,
                            max: 1,
                            timestamp: Date.now()
                        };

                        const response = await this.turnManager.requestChoice(choiceRequest);
                        if (response.selectedIds.length > 0) {
                            const chosen = damageableChars.find((c: any) => c.instanceId === response.selectedIds[0]);
                            if (chosen) {
                                chosen.damage = (chosen.damage || 0) + damageAmount;
                                this.turnManager.logger.info(`[OpponentInteraction] 💥 Opponent chose to damage ${chosen.name} for ${damageAmount}`);
                            }
                        }
                    } else {
                        // Fallback: skip
                        this.turnManager.logger.info(`[OpponentInteraction] 💥 No choice handler, skipping damage choice`);
                    }
                }
                break;

            case 'opponent_choice_return_to_hand':
                // Opponent chooses which of YOUR cards to return to hand
                const returnCandidates = player.play.filter((c: any) =>
                    !effect.filter || (effect.filter.cardType ? c.type?.toLowerCase() === effect.filter.cardType?.toLowerCase() : true)
                );
                if (returnCandidates.length > 0) {
                    // Build choice options
                    const returnOptions = returnCandidates.map((c: any) => ({
                        id: c.instanceId,
                        display: `${c.fullName || c.name} (Cost ${c.cost || 0})`,
                        card: c,
                        valid: true
                    }));

                    // Request choice from OPPONENT
                    if (this.turnManager.requestChoice) {
                        const choiceRequest = {
                            id: 'choice_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                            type: 'target_card' as any,
                            playerId: opponent.id,
                            prompt: `Choose a card to return to its owner's hand`,
                            options: returnOptions,
                            source: {
                                card: context.card,
                                abilityName: context.abilityName || 'Choose Return',
                                player: player
                            },
                            min: 1,
                            max: 1,
                            timestamp: Date.now()
                        };

                        const response = await this.turnManager.requestChoice(choiceRequest);
                        if (response.selectedIds.length > 0) {
                            const toReturn = returnCandidates.find((c: any) => c.instanceId === response.selectedIds[0]);
                            if (toReturn) {
                                player.play = player.play.filter((c: any) => c.instanceId !== toReturn.instanceId);
                                toReturn.zone = 'hand';
                                player.hand.push(toReturn);
                                this.turnManager.logger.info(`[OpponentInteraction] ↩️ Opponent chose to return ${toReturn.name} to hand`);
                            }
                        }
                    } else {
                        // Fallback: skip
                        this.turnManager.logger.info(`[OpponentInteraction] ↩️ No choice handler, skipping return choice`);
                    }
                }
                break;

            case 'opponent_discard_excess_hand':
                // Opponent discards down to max hand size
                const maxSize = effect.maxHandSize || 7;
                const excessCount = Math.max(0, opponent.hand.length - maxSize);
                if (excessCount > 0) {
                    const discarded = opponent.hand.splice(0, excessCount);
                    discarded.forEach((c: any) => {
                        c.zone = 'discard';
                        opponent.discard.push(c);
                    });
                    this.turnManager.logger.info(`[OpponentInteraction] 🗑️ Opponent discarded ${excessCount} excess cards`);
                }
                break;

            case 'opponent_pay_to_banish_self':
                // Opponent must pay cost or this card is banished
                const payCost = effect.cost || 1;
                const canPay = opponent.inkwell.filter((c: any) => c.ready).length >= payCost;

                if (canPay) {
                    // Pay the cost
                    const readyInk = opponent.inkwell.filter((c: any) => c.ready);
                    readyInk.slice(0, payCost).forEach((c: any) => c.ready = false);
                    this.turnManager.logger.info(`[OpponentInteraction] 💰 Opponent paid ${payCost} to prevent banish`);
                } else {
                    // Banish the card
                    if (context.card) {
                        player.play = player.play.filter((c: any) => c.instanceId !== context.card.instanceId);
                        context.card.zone = 'banished';
                        this.turnManager.logger.info(`[OpponentInteraction] 💀 Card banished (opponent couldn't pay)`);
                    }
                }
                break;

            case 'opponent_play_return_self':
                // Opponent plays a card, then this returns to hand
                // Stub: assume opponent plays something
                this.turnManager.logger.info(`[OpponentInteraction] 🔄 Opponent plays card, returning self to hand (stub)`);
                if (context.card && player.play.includes(context.card)) {
                    player.play = player.play.filter((c: any) => c.instanceId !== context.card.instanceId);
                    context.card.zone = 'hand';
                    player.hand.push(context.card);
                }
                break;

            case 'opponent_together_choice_banish':
                // Both players choose cards to banish from their own board
                const banishCount = effect.amount || 1;

                // Player chooses cards to banish
                const playerBanishable = player.play.filter((c: any) => c.type === 'character' || c.type === 'Character');
                if (playerBanishable.length > 0 && this.turnManager.requestChoice) {
                    const playerOptions = playerBanishable.map((c: any) => ({
                        id: c.instanceId,
                        display: `${c.fullName || c.name}`,
                        card: c,
                        valid: true
                    }));

                    const playerChoiceRequest = {
                        id: 'choice_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        type: 'target_character' as any,
                        playerId: player.id,
                        prompt: `Choose ${banishCount} character(s) to banish`,
                        options: playerOptions,
                        source: {
                            card: context.card,
                            abilityName: context.abilityName || 'Together Banish',
                            player: player
                        },
                        min: Math.min(banishCount, playerBanishable.length),
                        max: Math.min(banishCount, playerBanishable.length),
                        timestamp: Date.now()
                    };

                    const playerResponse = await this.turnManager.requestChoice(playerChoiceRequest);
                    for (const id of playerResponse.selectedIds) {
                        const toBanish = player.play.find((c: any) => c.instanceId === id);
                        if (toBanish) {
                            player.play = player.play.filter((c: any) => c.instanceId !== toBanish.instanceId);
                            toBanish.zone = 'banished';
                            this.turnManager.logger.info(`[OpponentInteraction] 💀 Player banished ${toBanish.name}`);
                        }
                    }
                }

                // Opponent chooses cards to banish
                const oppBanishable = opponent.play.filter((c: any) => c.type === 'character' || c.type === 'Character');
                if (oppBanishable.length > 0 && this.turnManager.requestChoice) {
                    const oppOptions = oppBanishable.map((c: any) => ({
                        id: c.instanceId,
                        display: `${c.fullName || c.name}`,
                        card: c,
                        valid: true
                    }));

                    const oppChoiceRequest = {
                        id: 'choice_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        type: 'target_character' as any,
                        playerId: opponent.id,
                        prompt: `Choose ${banishCount} character(s) to banish`,
                        options: oppOptions,
                        source: {
                            card: context.card,
                            abilityName: context.abilityName || 'Together Banish',
                            player: player
                        },
                        min: Math.min(banishCount, oppBanishable.length),
                        max: Math.min(banishCount, oppBanishable.length),
                        timestamp: Date.now()
                    };

                    const oppResponse = await this.turnManager.requestChoice(oppChoiceRequest);
                    for (const id of oppResponse.selectedIds) {
                        const toBanish = opponent.play.find((c: any) => c.instanceId === id);
                        if (toBanish) {
                            opponent.play = opponent.play.filter((c: any) => c.instanceId !== toBanish.instanceId);
                            toBanish.zone = 'banished';
                            this.turnManager.logger.info(`[OpponentInteraction] 💀 Opponent banished ${toBanish.name}`);
                        }
                    }
                }
                break;

            case 'opponent_reveal_conditional_hand_bottom':
                // Opponent reveals hand, conditionally put cards to bottom
                // Stub implementation
                const revealedCards = opponent.hand;
                this.turnManager.logger.info(`[OpponentInteraction] 👁️ Opponent reveals hand: ${revealedCards.map((c: any) => c.name).join(', ')} (stub)`);
                break;

            case 'opponent_choice_action':
                const action = effect.action;
                const targetSpec = effect.target || {};

                // Determine source of cards for the choice
                // If mine=true, opponent chooses from YOUR board.
                // Otherwise (default), opponent chooses from THEIR board.
                const candidateSource = targetSpec.mine === true ? player : opponent;

                // Filter candidates from play based on cardType
                let candidates = candidateSource.play;

                if (targetSpec.cardType) {
                    const types = Array.isArray(targetSpec.cardType)
                        ? targetSpec.cardType.map((t: string) => t.toLowerCase())
                        : [targetSpec.cardType.toLowerCase()];

                    candidates = candidates.filter((c: any) =>
                        c.type && types.includes(c.type.toLowerCase())
                    );
                }

                if (candidates.length > 0) {
                    // Bot Logic: Choose the 'best' option for the opponent (least bad)
                    let chosen: any;

                    // Sort by cost/value to determine what to sacrifice
                    // Ascending value: good for banish/discard (lose cheap stuff)
                    // Descending value: good for return to hand (save expensive stuff)
                    const sortedByCost = [...candidates].sort((a: any, b: any) => (a.cost || 0) - (b.cost || 0));

                    if (action === 'return_to_hand') {
                        // Return most expensive card to hand (to save it or replay it)
                        chosen = sortedByCost[sortedByCost.length - 1];
                    } else {
                        // Banish/Damage/Exert/Discard: Target weakest/cheapest
                        chosen = sortedByCost[0];
                    }

                    // Execute Action
                    if (action === 'banish' || action === 'discard') {
                        candidateSource.play = candidateSource.play.filter((c: any) => c.instanceId !== chosen.instanceId);
                        candidateSource.discard.push(chosen);
                        this.turnManager.logger.info(`[OpponentInteraction] 🗑️ Opponent chose to banish ${chosen.name}`, {
                            effectType: 'opponent_choice_action',
                            action: 'banish',
                            card: chosen.name
                        });
                    } else if (action === 'exert') {
                        chosen.ready = false;
                        this.turnManager.logger.info(`[OpponentInteraction] 💤 Opponent chose to exert ${chosen.name}`);
                    } else if (action === 'return_to_hand') {
                        candidateSource.play = candidateSource.play.filter((c: any) => c.instanceId !== chosen.instanceId);
                        candidateSource.hand.push(chosen);
                        this.turnManager.logger.info(`[OpponentInteraction] ↩️ Opponent chose to return ${chosen.name} to hand`);
                    } else if (action === 'damage') {
                        const amount = effect.amount || 0;
                        chosen.damage = (chosen.damage || 0) + amount;
                        this.turnManager.logger.info(`[OpponentInteraction] 💥 Opponent chose to deal ${amount} damage to ${chosen.name}`);
                    }
                } else {
                    this.turnManager.logger.info(`[OpponentInteraction] Opponent has no valid targets to choose for ${action}`);
                }
                break;

                break;

            case 'opponent_reveal_top':
                // Logic:
                // 1. Reveal top card
                // 2. Check condition (e.g. is it a character?)
                // 3. Prompt user for decision (Hand vs Bottom) logic is handled by UI via REVEAL_AND_DECIDE

                // Get targets (usually "all opponents" or specific opponent)
                // Note: In family handler, 'player' is the source of effect. 'context.opponent' might not be set for "all opponents".
                // We must resolve targets via effect.target
                // Get targets (usually "all opponents" or specific opponent)
                const executor = this.turnManager.abilitySystem.executor;
                const targetPlayers = executor['resolvePlayerTargets']
                    ? executor['resolvePlayerTargets'](effect.target, context)
                    : (await this.resolveTargets(effect.target, context)).map((c: any) => c.ownerId ? this.turnManager.game.state.players[c.ownerId] : null).filter((p: any) => p);

                // Fallback for "all_opponents" text parsing
                const opponents = Object.values(this.turnManager.game.state.players).filter((p: any) => (p as any).id !== player.id);

                for (const opponentObj of opponents) {
                    const opponent = opponentObj as any;
                    if (opponent.deck.length === 0) continue;

                    const topCard = opponent.deck[0]; // Peek at top card (don't remove yet)

                    this.turnManager.logger.info(`[OpponentInteraction] 👁️ ${opponent.name} reveals top card: ${topCard.name}`);
                    if (this.turnManager.trackZoneChange) {
                        // Optional: Track reveal event if needed by UI
                    }

                    // NEW: Send informational request to Human Player so they see the card
                    if (this.turnManager && this.turnManager.requestChoice) {
                        // Find human controller (hacky: typically 'player1' or check controller type)
                        // Ideally, we broadcast to all NOT opponent, but for now assuming player is human context
                        // We need to send this to the PLAYER who is NOT the one revealing (if they are human)
                        const players = Object.values(this.turnManager.game.state.players);
                        const humanPlayers = players.filter((p: any) => p.id !== opponent.id); // Potential humans

                        console.log(`[DEBUG REVEAL] Sending reveal to ${humanPlayers.length} non-opponent player(s)`);
                        console.log(`[DEBUG REVEAL] Revealed card: ${topCard.name}, type: ${topCard.type}`);

                        for (const humanObj of humanPlayers) {
                            const human = humanObj as any;
                            console.log(`[DEBUG REVEAL] Sending reveal request to player: ${human.id} (${human.name})`);

                            // Check if actually human (stub: assume non-bot ID or check controller)
                            // For this codebase, let's just send to 'player1' if opponent is 'player2', etc.
                            // Better: Send to all other players. The Controller will ignore if it's a bot (or auto-respond).

                            const infoRequest = {
                                id: 'reveal_info_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                                type: 'reveal_and_decide' as any,
                                playerId: human.id,
                                prompt: `${opponent.name} reveals ${topCard.name}`,
                                options: [{ id: 'acknowledge', display: 'OK', valid: true }],
                                source: {
                                    card: context.card,
                                    abilityName: context.abilityName || 'Reveal Effect',
                                    player: opponent // The revealer
                                },
                                context: {
                                    revealedCard: topCard
                                },
                                min: 1,
                                max: 1,
                                timestamp: Date.now()
                            };

                            console.log(`[DEBUG REVEAL] Request created:`, JSON.stringify(infoRequest, null, 2));

                            // We await this so the human SEES it before the bot continues.
                            // If we don't await, it might close too fast or get overridden.
                            try {
                                console.log(`[DEBUG REVEAL] Calling requestChoice for player ${human.id}...`);
                                await this.turnManager.requestChoice(infoRequest);
                                console.log(`[DEBUG REVEAL] requestChoice returned for player ${human.id}`);
                            } catch (e) {
                                // Ignore error if controller doesn't handle it or timeouts
                                console.warn("[DEBUG REVEAL] Failed to send reveal info to player", e);
                            }
                        }
                    } else {
                        console.log(`[DEBUG REVEAL] No turnManager or requestChoice available`);
                    }

                    // Check conditional logic
                    const condition = effect.conditional_put;
                    const ifType = condition?.if_type; // e.g. "character"

                    let matchesCondition = false;
                    if (ifType === 'character') {
                        matchesCondition = topCard.type === 'Character';
                    } else if (ifType === 'item') {
                        matchesCondition = topCard.type === 'Item';
                    }

                    // Create choice for opponent
                    // If matches: Valid options = Hand, Bottom (optional mechanism implied by "may put into hand")
                    // If no match: Valid options = Bottom (forced)

                    const options = [];

                    if (matchesCondition) {
                        options.push({ id: 'hand', display: 'Put into Hand', valid: true });
                        options.push({ id: 'bottom', display: 'Bottom of Deck', valid: true });
                    } else {
                        options.push({ id: 'bottom', display: 'Bottom of Deck (Not a Character)', valid: true });
                    }

                    const choiceRequest = {
                        id: 'choice_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        type: 'reveal_and_decide' as any, // Cast to any to avoid TS error until build update
                        playerId: opponent.id,
                        prompt: `Reveal: ${topCard.name}. ${matchesCondition ? 'Put into hand?' : 'Must go to bottom.'}`,
                        options: options,
                        source: {
                            card: context.card,
                            abilityName: context.abilityName || 'Reveal Effect',
                            player: player
                        },
                        // KEY: Pass revealed card in context for UI
                        context: {
                            revealedCard: topCard
                        },
                        min: 1,
                        max: 1
                    };

                    const response = await this.turnManager.requestChoice(choiceRequest);
                    const decision = response.selectedIds[0];

                    // Execute decision
                    // Remove card from deck NOW
                    const poppedCard = opponent.deck.shift();

                    if (decision === 'hand') {
                        poppedCard.zone = 'hand';
                        opponent.hand.push(poppedCard);
                        this.turnManager.logger.info(`[OpponentInteraction] ✋ ${opponent.name} put ${poppedCard.name} into hand`);
                    } else {
                        poppedCard.zone = 'deck'; // Bottom
                        opponent.deck.push(poppedCard);
                        this.turnManager.logger.info(`[OpponentInteraction] ⬇️ ${opponent.name} put ${poppedCard.name} on bottom of deck`);
                    }
                }
                break;

            default:
                this.turnManager.logger.warn(`[OpponentInteraction] Unhandled opponent effect: ${effect.type}`);
                break;
        }
    }
}
