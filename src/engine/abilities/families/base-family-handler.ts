import type { GameContext } from '../executor';

/**
 * Base class for effect family handlers
 * Provides common utilities and structure for family-specific implementations
 */
export abstract class BaseFamilyHandler {
    constructor(protected turnManager: any) { }

    /**
     * Execute an effect within this family
     * Each family handler implements this to handle its specific effect types
     */
    abstract execute(effect: any, context: GameContext): Promise<void>;

    setTurnManager(turnManager: any) {
        this.turnManager = turnManager;
    }

    /**
     * Resolve targets based on target descriptor
     * Shared utility for finding characters/cards that match criteria
     */
    protected async resolveTargets(target: any, context: GameContext): Promise<any[]> {
        // Handle same_target
        if (target && target.type === 'same_target') {
            const lastTargets = (context as any).lastResolvedTargets || [];
            if (this.turnManager) {
                this.turnManager.logger.debug(`[FamilyHandler] Resolving same_target. Found ${lastTargets.length} targets.`);
            }
            return lastTargets;
        }

        const targets = await this._resolveTargetsInternal(target, context);

        // Cache targets for same_target reference
        // Note: We might want to filter this? 
        // e.g. don't cache if target type is 'self'? 
        // Logic from executor: cache unless it was same_target (handled above).

        if (targets.length > 0 || (target && target.type !== 'same_target')) {
            (context as any).lastResolvedTargets = targets;
        }

        return targets;
    }

    private async _resolveTargetsInternal(target: any, context: GameContext): Promise<any[]> {
        const player = context.player;
        const allPlayers = Object.values(this.turnManager.game.state.players);

        if (!target) {
            return [];
        }

        // Handle different target types
        if (target.type === 'self') {
            return context.card ? [context.card] : [];
        }

        if (target.type === 'all_characters') {
            return allPlayers.flatMap((p: any) =>
                p.play.filter((c: any) => c.type === 'Character')
            );
        }

        if (target.type === 'chosen' || target.type === 'chosen_character') {
            // Check context for pre-resolved targets (e.g. from UI choice or test)
            if (context.payload && context.payload.targets) {
                return context.payload.targets;
            }

            // Check payload for targetId (single target pre-selected)
            if (context.payload && context.payload.targetId) {
                const targetCard = allPlayers.flatMap((p: any) => p.play)
                    .find((c: any) => c.instanceId === context.payload.targetId);
                if (targetCard) return [targetCard];
            }

            // Build list of valid targets based on filter
            let validTargets: any[] = [];
            const filter = target.filter || {};

            if (filter.controller === 'opponent') {
                const opponent = allPlayers.find((p: any) => p.id !== player.id) as any;
                validTargets = opponent?.play?.filter((c: any) => c.type === 'Character') || [];
            } else if (filter.controller === 'self' || filter.controller === 'you') {
                validTargets = player.play.filter((c: any) => c.type === 'Character');
            } else {
                // Any character
                validTargets = allPlayers.flatMap((p: any) =>
                    p.play.filter((c: any) => c.type === 'Character')
                );
            }

            // Apply additional filters
            if (filter.subtype) {
                validTargets = validTargets.filter((c: any) => c.subtypes?.includes(filter.subtype));
            }
            if (filter.exerted !== undefined) {
                validTargets = validTargets.filter((c: any) => filter.exerted ? !c.ready : c.ready);
            }

            if (validTargets.length === 0) {
                this.turnManager.logger.debug('[resolveTargets] No valid targets for chosen');
                return [];
            }

            // Request choice from player controller
            try {
                const choiceRequest = {
                    id: `choice_${Date.now()}`,
                    type: 'target_character' as any,
                    playerId: player.id,
                    prompt: context.card
                        ? `${context.card.name}: Choose a character`
                        : 'Choose a character',
                    options: validTargets.map((c: any) => ({
                        id: c.instanceId,
                        display: c.fullName || c.name,
                        card: c,
                        valid: true
                    })),
                    source: {
                        card: context.card,
                        player: context.player,
                        abilityName: context.abilityName
                    },
                    optional: target.optional || false,
                    timestamp: Date.now()
                };

                const response = await this.turnManager.requestChoice(choiceRequest);

                if (response.declined) {
                    this.turnManager.logger.debug('[resolveTargets] Player declined optional targeting');
                    return [];
                }

                if (response.selectedIds && response.selectedIds.length > 0) {
                    const selectedTargets = validTargets.filter((c: any) =>
                        response.selectedIds.includes(c.instanceId)
                    );
                    this.turnManager.logger.debug(`[resolveTargets] Player chose: ${selectedTargets.map((c: any) => c.name).join(', ')}`);
                    return selectedTargets;
                }
            } catch (err) {
                this.turnManager.logger.warn('[resolveTargets] Choice request failed, using first valid target:', err);
            }

            // Fallback: return first valid target (for tests/bots without handler)
            return validTargets.slice(0, 1);
        }

        return [];
    }

    /**
     * Register a passive effect to the game state
     */
    protected registerPassiveEffect(effect: any, context: GameContext): void {
        if (!this.turnManager.game.state.activeEffects) {
            this.turnManager.game.state.activeEffects = [];
        }

        this.turnManager.addActiveEffect({
            type: effect.type,
            playerId: context.player.id,
            sourceCardId: context.card?.instanceId,
            ...effect
        });
    }

    /**
     * Get opponent player
     */
    protected getOpponent(currentPlayerId: string): any {
        return Object.values(this.turnManager.game.state.players).find(
            (p: any) => p.id !== currentPlayerId
        );
    }
}
