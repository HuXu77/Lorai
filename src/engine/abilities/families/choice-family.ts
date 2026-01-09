import { BaseFamilyHandler } from './base-family-handler';
import { matchesCardFilter } from '../filters';
import type { GameContext } from '../executor';
import type { EffectAST, TargetAST } from '../effect-ast';
import type { ChoiceOption } from '../../models';
import type { ChoiceRequest } from '../../models';
import { ChoiceType } from '../../models';
import { GameEvent } from '../events';

export class ChoiceFamilyHandler extends BaseFamilyHandler {
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
        switch (effect.type) {
            case 'choose_and_discard':
                await this.executeChooseAndDiscard(effect, context);
                break;
            case 'choose_card_from_discard':
                await this.executeChooseCardFromDiscard(effect, context);
                break;
            case 'choose_to_play_for_free':
                await this.executeChooseToPlayForFree(effect, context);
                break;
            case 'opponent_choose_and_discard':
                await this.executeOpponentChooseAndDiscard(effect, context);
                break;
            case 'look_and_choose':
                await this.executeLookAndChoose(effect, context);
                break;
            case 'reveal_and_choose':
                await this.executeRevealAndChoose(effect, context);
                break;
            case 'choose_target_effect':
                await this.executeChooseTargetEffect(effect, context);
                break;
            case 'distribute_damage_choice':
                await this.executeDistributeDamageChoice(effect, context);
                break;
            case 'choose_keyword_to_grant':
                await this.executeChooseKeywordToGrant(effect, context);
                break;
            case 'optional_trigger':
                await this.executeOptionalTrigger(effect, context);
                break;
            case 'choose_zone_target':
                await this.executeChooseZoneTarget(effect, context);
                break;
            case 'opponent_discard_choice':
                await this.executeOpponentDiscardChoice(effect, context);
                break;
            case 'opponent_reveal_and_discard':
                await this.executeOpponentRevealAndDiscard(effect, context);
                break;
        }
    }

    private async executeChooseAndDiscard(effect: any, context: GameContext): Promise<void> {
        const player = context.player;
        const amount = effect.amount || 1;

        if (this.turnManager) {
            this.turnManager.logger.debug(`[executeChooseAndDiscard] Called for ${player.name}, amount: ${amount}, hand size: ${player.hand.length}`);
        }

        if (player.hand.length === 0) {
            if (this.turnManager) {
                this.turnManager.logger.info(`${player.name} has no cards to discard`);
            }
            return;
        }

        const toDiscard = Math.min(amount, player.hand.length);

        for (let i = 0; i < toDiscard; i++) {
            if (player.hand.length === 0) break;

            const options = player.hand.map((card: any) => ({
                id: card.instanceId,
                display: `${card.name} (${card.cost}💧)`,
                label: card.name,
                card: card,
                valid: true
            }));

            const choices = await this.turnManager.requestChoice({
                id: `discard_${Date.now()}_${i}`,
                type: 'discard_from_hand' as any,
                playerId: player.id,
                prompt: `Choose a card to discard (${i + 1}/${toDiscard})`,
                options: options,
                min: 1,
                max: 1,
                source: {
                    card: context.card,
                    player: context.player,
                    abilityName: context.abilityName
                }
            });

            const selectedId = choices.selectedIds[0];
            const cardToDiscard = player.hand.find((c: any) => c.instanceId === selectedId);

            if (cardToDiscard) {
                player.hand = player.hand.filter((c: any) => c.instanceId !== selectedId);
                cardToDiscard.zone = 'discard';
                player.discard.push(cardToDiscard);

                if (this.turnManager) {
                    this.turnManager.trackZoneChange(cardToDiscard, 'hand', 'discard');
                    this.turnManager.logger.info(`${player.name} discarded ${cardToDiscard.name}`);
                    this.turnManager.eventBus.emit(GameEvent.CARD_DISCARDED, {
                        card: cardToDiscard,
                        player: player,
                        source: context.card
                    });
                }
            }
        }
    }

    private async executeChooseCardFromDiscard(effect: { type: 'choose_card_from_discard', filter?: any }, context: GameContext): Promise<void> {
        const player = context.player;

        if (player.discard.length === 0) {
            if (this.turnManager) {
                this.turnManager.logger.info(`${player.name} has no cards in discard`);
            }
            return;
        }

        const eligibleCards = player.discard.filter((card: any) => matchesCardFilter(card, effect.filter));

        if (eligibleCards.length > 0) {
            const options = eligibleCards.map((card: any) => ({
                id: card.instanceId,
                display: `${card.name}`,
                card: card,
                valid: true
            }));

            // Use request choice instead of random
            const choice = await this.turnManager.requestChoice({
                id: `choose_discard_${Date.now()}`,
                type: 'general_select' as any, // Should be choose_from_discard?
                playerId: player.id,
                prompt: 'Choose a card from your discard',
                options: options,
                min: 1,
                max: 1,
                source: { card: context.card, player: context.player }
            });

            const selectedId = choice.selectedIds[0];
            const chosen = eligibleCards.find((c: any) => c.instanceId === selectedId);

            if (chosen) {
                player.discard = player.discard.filter((c: any) => c !== chosen);
                chosen.zone = 'hand';
                player.hand.push(chosen);

                if (this.turnManager) {
                    this.turnManager.logger.info(`${player.name} chose ${chosen.name} from discard`);
                    this.turnManager.trackZoneChange(chosen, 'discard', 'hand');
                }
            }
        }
    }

    private async executeChooseToPlayForFree(effect: { type: 'choose_to_play_for_free', filter?: any }, context: GameContext): Promise<void> {
        const player = context.player;

        const eligibleCards = player.hand.filter((card: any) => {
            if (!matchesCardFilter(card, effect.filter)) return false;
            if (effect.filter && effect.filter.cost && card.cost > effect.filter.cost) return false;
            return true;
        });

        if (eligibleCards.length > 0) {
            const options = eligibleCards.map((card: any) => ({
                id: card.instanceId,
                display: `${card.name} (${card.cost})`,
                card: card,
                valid: true
            }));

            const choice = await this.turnManager.requestChoice({
                id: `play_free_${Date.now()}`,
                type: 'general_select' as any,
                playerId: player.id,
                prompt: 'Choose a card to play for free',
                options: options,
                min: 1,
                max: 1, // Or 0 if optional? Usually mandatory if "Choose a card..."
                source: { card: context.card, player: context.player }
            });

            const selectedId = choice.selectedIds[0];
            const chosen = eligibleCards.find((c: any) => c.instanceId === selectedId);

            if (chosen) {
                if (this.turnManager) {
                    this.turnManager.logger.info(`${player.name} may play ${chosen.name} for free`);
                    chosen.freePlayToken = true;
                    // Trigger play logic? Or just mark it? 
                    // Executor implementation only marked it.
                }
            }
        }
    }

    private async executeOpponentChooseAndDiscard(effect: { type: 'opponent_choose_and_discard', amount: number }, context: GameContext): Promise<void> {
        const opponent = Object.values(this.turnManager?.game?.state?.players || {}).find(
            (p: any) => p.id !== context.player.id
        ) as any;

        if (!opponent || opponent.hand.length === 0) return;

        const toDiscard = Math.min(effect.amount, opponent.hand.length);

        // TODO: Implement actual choice request to opponent. For now keeping simulation (random) or implementing choice?
        // Since we are consolidating, let's keep random/simulation as placeholder unless we want to fix opponent choice.
        // The original implementation was random.

        for (let i = 0; i < toDiscard; i++) {
            const randomIndex = Math.floor(Math.random() * opponent.hand.length);
            const card = opponent.hand.splice(randomIndex, 1)[0];

            card.zone = 'discard';
            opponent.discard.push(card);

            if (this.turnManager) {
                this.turnManager.logger.info(`${opponent.name} discards ${card.name}`);
                this.turnManager.trackZoneChange(card, 'hand', 'discard');
                this.turnManager.eventBus.emit(GameEvent.CARD_DISCARDED, {
                    card: card,
                    player: opponent,
                    source: context.card
                });
            }
        }
    }

    private async executeLookAndChoose(effect: { type: 'look_and_choose', amount: number, chooseAmount: number }, context: GameContext): Promise<void> {
        const player = context.player;
        const lookAmount = Math.min(effect.amount, player.deck.length);

        if (lookAmount > 0) {
            const topCards = player.deck.slice(-lookAmount);

            // Should be a choice UI for player. 
            // Original strict implementation was random.
            // Keeping random for now to match behavior, but TODO: Implement UI
            const chosen = topCards.slice(0, Math.min(effect.chooseAmount, topCards.length));

            chosen.forEach((card: any) => {
                player.deck = player.deck.filter((c: any) => c !== card);
                card.zone = 'hand';
                player.hand.push(card);

                if (this.turnManager) {
                    this.turnManager.logger.info(`${player.name} chose ${card.name}`);
                    this.turnManager.trackZoneChange(card, 'deck', 'hand');
                }
            });
        }
    }

    private async executeRevealAndChoose(effect: { type: 'reveal_and_choose', amount: number }, context: GameContext): Promise<void> {
        const player = context.player;
        const revealAmount = Math.min(effect.amount, player.deck.length);

        if (revealAmount > 0) {
            const revealed = player.deck.slice(-revealAmount);

            if (this.turnManager) {
                this.turnManager.logger.info(`${player.name} reveals: ${revealed.map((c: any) => c.name).join(', ')}`);
            }

            // Random choice (legacy)
            const chosen = revealed[Math.floor(Math.random() * revealed.length)];

            player.deck = player.deck.filter((c: any) => c !== chosen);
            chosen.zone = 'hand';
            player.hand.push(chosen);

            if (this.turnManager) {
                this.turnManager.logger.info(`${player.name} chose ${chosen.name}`);
                this.turnManager.trackZoneChange(chosen, 'deck', 'hand');
            }
        }
    }

    private async executeChooseTargetEffect(effect: { type: 'choose_target_effect', effects: EffectAST[] }, context: GameContext): Promise<void> {
        if (effect.effects.length > 0) {
            // Should request choice of effect types/descriptions.
            // Legacy was random.
            const chosen = effect.effects[Math.floor(Math.random() * effect.effects.length)];
            await this.executor.execute(chosen, context);
        }
    }

    private async executeDistributeDamageChoice(effect: { type: 'distribute_damage_choice', totalDamage: number, targets: TargetAST }, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.targets, context);

        if (targets.length === 0) return;

        if (targets.length === 1) {
            targets[0].damage = (targets[0].damage || 0) + effect.totalDamage;
            if (this.turnManager) {
                this.turnManager.logger.info(`${targets[0].name} takes ${effect.totalDamage} damage`);
            }
            return;
        }

        if (!this.turnManager) return;

        const options = targets.map((t: any) => ({
            id: t.instanceId,
            display: t.name,
            valid: true
        }));

        const response = await this.turnManager.requestChoice({
            id: 'distribute-damage-' + Date.now(),
            type: 'distribute_damage' as any,
            playerId: context.player.id,
            prompt: `Distribute ${effect.totalDamage} damage among targets`,
            options: options,
            min: effect.totalDamage,
            max: effect.totalDamage,
            optional: false,
            source: {
                card: context.card,
                abilityName: context.abilityName || 'Distribute Damage',
                player: context.player
            },
            timestamp: Date.now(),
            context: {
                totalDamage: effect.totalDamage || (effect as any).amount
            }
        });

        if (response.declined) return;

        const distribution: Record<string, number> = {};
        response.selectedIds.forEach((id: string) => {
            distribution[id] = (distribution[id] || 0) + 1;
        });

        targets.forEach((target: any) => {
            const amount = distribution[target.instanceId] || 0;
            if (amount > 0) {
                target.damage = (target.damage || 0) + amount;
                this.turnManager.logger.info(`${target.name} takes ${amount} damage`);
            }
        });
    }

    private async executeChooseKeywordToGrant(effect: { type: 'choose_keyword_to_grant', target: TargetAST, keywords: string[] }, context: GameContext): Promise<void> {
        const targets = await this.resolveTargets(effect.target, context);

        if (effect.keywords.length === 0 || targets.length === 0) return;

        // Legacy: Random
        const chosenKeyword = effect.keywords[Math.floor(Math.random() * effect.keywords.length)];

        targets.forEach((target: any) => {
            if (!target.keywords) {
                target.keywords = [];
            }
            if (!target.keywords.includes(chosenKeyword)) {
                target.keywords.push(chosenKeyword);
            }
            if (this.turnManager) {
                this.turnManager.logger.info(`${target.name} gains ${chosenKeyword}`);
            }
        });
    }

    private async executeOptionalTrigger(effect: { type: 'optional_trigger', effect: EffectAST }, context: GameContext): Promise<void> {
        if (!this.turnManager) return;

        const response = await this.turnManager.requestChoice({
            id: 'optional-trigger-' + Date.now(),
            type: 'yes_no',
            playerId: context.player.id,
            prompt: `Do you want to use the ability of ${context.card?.name}?`,
            options: [
                { id: 'yes', display: 'Yes', valid: true },
                { id: 'no', display: 'No', valid: true }
            ],
            min: 1,
            max: 1,
            optional: false,
            source: {
                card: context.card,
                abilityName: context.abilityName || 'Optional Ability',
                player: context.player
            },
            timestamp: Date.now()
        });

        const choice = response.selectedIds[0];

        if (choice === 'yes') {
            await this.executor.execute(effect.effect, context);
        }
    }

    private async executeChooseZoneTarget(effect: { type: 'choose_zone_target', zones: string[] }, context: GameContext): Promise<void> {
        const player = context.player;
        if (effect.zones.length === 0) return;

        const chosenZone = effect.zones[Math.floor(Math.random() * effect.zones.length)];

        if (this.turnManager) {
            this.turnManager.logger.info(`${player.name} chooses to target ${chosenZone}`);
        }
    }

    private async executeOpponentDiscardChoice(effect: { type: 'opponent_discard_choice', amount?: number, target?: any, choices?: any[] }, context: GameContext): Promise<void> {
        const affectsEachOpponent = effect.target?.type === 'each_opponent';
        const allPlayers = Object.values(this.turnManager?.game?.state?.players || {}) as any[];
        const opponents = affectsEachOpponent
            ? allPlayers.filter((p: any) => p.id !== context.player.id)
            : [allPlayers.find((p: any) => p.id !== context.player.id)];

        for (const opponent of opponents) {
            if (!opponent || opponent.hand.length === 0) {
                if (this.turnManager) {
                    this.turnManager.logger.info(`${opponent?.name || 'Opponent'} has no cards to discard`);
                }
                continue;
            }

            if (effect.amount && (!effect.choices || effect.choices.length === 0)) {
                const toDiscard = Math.min(effect.amount, opponent.hand.length);

                for (let i = 0; i < toDiscard; i++) {
                    const randomIndex = Math.floor(Math.random() * opponent.hand.length);
                    const card = opponent.hand.splice(randomIndex, 1)[0];
                    card.zone = 'discard';
                    opponent.discard.push(card);

                    if (this.turnManager) {
                        this.turnManager.logger.info(`[EffectExecutor] ${opponent.name} chose to discard ${card.name}`);
                        this.turnManager.trackZoneChange(card, 'hand', 'discard');
                        this.turnManager.eventBus.emit(GameEvent.CARD_DISCARDED, {
                            card: card,
                            player: opponent,
                            source: context.card
                        });
                    }
                }
                continue;
            }

            if (effect.choices && effect.choices.length > 0) {
                const chosenOption = effect.choices[Math.floor(Math.random() * effect.choices.length)];

                if (this.turnManager) {
                    this.turnManager.logger.info(`${opponent.name} chooses option: ${JSON.stringify(chosenOption)}`);
                }

                if (chosenOption.type === 'discard') {
                    const amount = chosenOption.amount || 1;
                    const toDiscard = Math.min(amount, opponent.hand.length);

                    for (let i = 0; i < toDiscard; i++) {
                        const randomIndex = Math.floor(Math.random() * opponent.hand.length);
                        const card = opponent.hand.splice(randomIndex, 1)[0];
                        card.zone = 'discard';
                        opponent.discard.push(card);
                        if (this.turnManager) {
                            this.turnManager.logger.info(`${opponent.name} chose to discard ${card.name}`);
                            this.turnManager.trackZoneChange(card, 'hand', 'discard');
                            this.turnManager.eventBus.emit(GameEvent.CARD_DISCARDED, {
                                card: card,
                                player: opponent,
                                source: context.card
                            });
                        }
                    }
                }
            }
        }
    }

    private async executeOpponentRevealAndDiscard(effect: { type: 'opponent_reveal_and_discard', filter?: any }, context: GameContext): Promise<void> {
        const opponent = Object.values(this.turnManager?.game?.state?.players || {}).find(
            (p: any) => p.id !== context.player.id
        ) as any;

        if (!opponent || opponent.hand.length === 0) {
            if (this.turnManager) {
                this.turnManager.logger.info(`Opponent has no cards to reveal/discard`);
            }
            return;
        }

        if (this.turnManager) {
            const cardNames = opponent.hand.map((c: any) => c.name).join(', ');
            this.turnManager.logger.info(`${opponent.name} reveals hand: ${cardNames}`);
        }

        const eligibleCards = opponent.hand.filter((card: any) => matchesCardFilter(card, effect.filter));
        // Note: original had custom filter logic for excludeCardType, which matchesCardFilter might not cover yet.
        // But for now use matchesCardFilter. If filter logic is complex, we might need to enhance matchesCardFilter.
        // Original logic checked excludeCardType.
        // matchesCardFilter only checks cardType and subtype.
        // We should ENHANCE matchesCardFilter in filters.ts if needed, or do extra check here.
        // For simplicity, implementing exclude check here or filtering matchesCardFilter results?
        // Original logic: "if (effect.filter.excludeCardType)..."

        let finalEligible = eligibleCards;
        if (effect.filter && effect.filter.excludeCardType) {
            const excludeType = effect.filter.excludeCardType.toLowerCase();
            finalEligible = finalEligible.filter((card: any) => !card.type?.toLowerCase().includes(excludeType));
        }

        if (finalEligible.length > 0) {
            const discardOptions = finalEligible.map((card: any) => ({
                id: card.instanceId,
                display: `${card.fullName || card.name} (${card.type}, Cost ${card.cost || 0})`,
                card: card,
                valid: true
            }));

            if (this.turnManager.requestChoice) {
                // Map ALL cards to options, but mark non-matching ones as invalid
                const options = opponent.hand.map((card: any) => ({
                    id: card.instanceId,
                    display: card.name, // Client should show full card details
                    card: card, // Pass full card object for rendering
                    valid: finalEligible.some((c: any) => c.instanceId === card.instanceId),
                    // Pass extra data so UI knows why it's invalid if needed, or just relying on valid flag
                    // We can also pass 'card' object in a real implementation if the UI supports it, 
                    // but for now we rely on the ID matching the card availability in the UI's view of the hand.
                }));

                const choiceRequest: ChoiceRequest = {
                    id: `choice_discard_${Date.now()}`,
                    type: ChoiceType.TARGET_CARD_IN_HAND,
                    playerId: context.player.id, // The player ("you") chooses
                    prompt: `Choose a card from ${opponent.name}'s hand to discard`,
                    options: options, // Show all cards
                    source: {
                        card: context.card,
                        abilityName: context.abilityName || 'Reveal and Discard',
                        player: context.player
                    },
                    context: {
                        revealedCards: opponent.hand, // Reveal ALL cards
                        opponentHand: opponent.hand
                    },
                    min: 1,
                    max: 1,
                    timestamp: Date.now()
                };

                const response = await this.turnManager.requestChoice(choiceRequest);
                if (response.selectedIds && response.selectedIds.length > 0) {
                    const toDiscard = opponent.hand.find((c: any) => c.instanceId === response.selectedIds[0]);

                    // Validate selection again just in case (though UI should prevent it)
                    if (toDiscard && finalEligible.some((c: any) => c.instanceId === toDiscard.instanceId)) {
                        opponent.hand = opponent.hand.filter((c: any) => c.instanceId !== toDiscard.instanceId);
                        toDiscard.zone = 'discard';
                        opponent.discard.push(toDiscard);

                        if (this.turnManager) {
                            this.turnManager.logger.info(`${context.player.name} chose: ${opponent.name} discards ${toDiscard.name}`);
                            this.turnManager.trackZoneChange(toDiscard, 'hand', 'discard');
                            this.turnManager.eventBus.emit(GameEvent.CARD_DISCARDED, {
                                card: toDiscard,
                                player: opponent,
                                source: context.card
                            });
                        }
                    } else if (toDiscard) {
                        this.turnManager?.logger.warn(`Player attempted to discard invalid target ${toDiscard.name}`);
                    }
                }
            } else {
                // Fallback for AI/No-UI: randomly pick a VALID card
                if (finalEligible.length > 0) {
                    const toDiscard = finalEligible[Math.floor(Math.random() * finalEligible.length)];
                    opponent.hand = opponent.hand.filter((c: any) => c !== toDiscard);
                    toDiscard.zone = 'discard';
                    opponent.discard.push(toDiscard);

                    if (this.turnManager) {
                        this.turnManager.logger.info(`${opponent.name} discards ${toDiscard.name} (random fallback)`);
                        this.turnManager.trackZoneChange(toDiscard, 'hand', 'discard');
                    }
                }
            }
        } else {
            if (this.turnManager) {
                this.turnManager.logger.info(`${opponent.name} has no matching cards to discard, but hand is revealed`);
            }
        }
    }
}
