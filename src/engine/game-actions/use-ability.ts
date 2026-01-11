import { TurnManager } from '../actions';
import { PlayerState } from '../state';
import { CardInstance, ZoneType, ActivationCost } from '../models';
import { executeResolveEffect } from '../effects/resolve';
import { GameEvent, EventContext } from '../abilities';

/**
 * Activate a card's ability during the player's turn
 */
export async function executeUseAbility(
    turnManager: TurnManager,
    player: PlayerState,
    cardId: string,
    abilityIndex: number,
    payload?: any
): Promise<boolean> {
    const card = player.play.find(c => c.instanceId === cardId);
    if (!card) return false;

    if (!card.parsedEffects || !card.parsedEffects[abilityIndex]) {
        turnManager.logger.debug(`[${player.name}] Invalid ability index ${abilityIndex} on ${card.name}.`);
        return false;
    }
    const effect = card.parsedEffects[abilityIndex];

    // Allow 'activated' AND 'on_start_turn' (for optional triggers handled manually)
    // CRITICAL FIX: Check both 'trigger' and 'type' fields since abilities can be represented either way
    // Also check for Boost keyword which is an activated ability
    const effectAny = effect as any;
    const isActivated = effectAny.trigger === 'activated' ||
        effectAny.type === 'activated' ||
        (effectAny.keyword === 'boost' && effectAny.costs);
    const isStartTurn = effectAny.trigger === 'on_start_turn';

    if (!isActivated && !isStartTurn) {
        turnManager.logger.debug(`[${player.name}] Not an activated or start-of-turn ability (Trigger: ${effectAny.trigger}, Type: ${effectAny.type}, Keyword: ${effectAny.keyword})`);
        return false;
    }

    // INFINITE LOOP PROTECTION: Check if ability already used this turn
    if (!card.meta) card.meta = {};
    if (!card.meta.usedAbilities) card.meta.usedAbilities = {};

    // For Boost, use the shared 'boost' key to match executor
    let abilityKey = `ability_${abilityIndex}`;
    if (effectAny.keyword?.toLowerCase() === 'boost') {
        abilityKey = 'boost';
    }
    const currentTurn = turnManager.game.state.turnCount;

    if (card.meta.usedAbilities[abilityKey] === currentTurn) {
        turnManager.logger.debug(`[${player.name}] ${card.name}'s ability ${abilityIndex} already used this turn.`);
        return false;
    }

    // Validate Costs
    let cost: ActivationCost = effect.cost ? { ...effect.cost } : {};

    // BACKWARD COMPATIBILITY: Map 'costs' array (from new parser) to ActivationCost object
    // CRITICAL FIX: If 'costs' array exists, it is the source of truth. 
    // We must reset 'cost' to avoid double-counting if the parser populated both.
    if ((effect as any).costs && Array.isArray((effect as any).costs) && (effect as any).costs.length > 0) {
        cost = {}; // Reset to build from costs array
        (effect as any).costs.forEach((c: any) => {
            if (c.type === 'exert') cost.exert = true;
            if (c.type === 'ink') cost.ink = (cost.ink || 0) + (c.amount || 0);
            if (c.type === 'discard') cost.discard = (cost.discard || 0) + (c.amount || 0);
            if (c.type === 'banish') cost.banish = true;
        });
    }

    // 1. Exert Cost
    if (cost.exert) {
        if (!card.ready) {
            turnManager.logger.debug(`[${player.name}] ${card.name} is exerted and cannot use this ability.`);
            return false;
        }
        // Check drying (activated abilities requiring exert usually require drying)
        // Only Characters have drying sickness (summoning sickness)
        if (card.type === 'Character' && card.turnPlayed === turnManager.game.state.turnCount) {
            // Exception: Rush (if ability is an attack? No, Rush is for challenging)
            turnManager.logger.debug(`[${player.name}] ${card.name} is drying and cannot use exert ability.`);
            return false;
        }
    }

    // 2. Ink Cost
    if (cost.ink) {
        const readyInk = player.inkwell.filter(i => i.ready).length;
        if (readyInk < cost.ink) {
            turnManager.logger.debug(`[${player.name}] Not enough ink (Need ${cost.ink}, Have ${readyInk}).`);
            return false;
        }
    }

    // 3. Discard Cost
    if (cost.discard) {
        if (player.hand.length < cost.discard) {
            turnManager.logger.debug(`[${player.name}] Not enough cards to discard (Need ${cost.discard}, Have ${player.hand.length}).`);
            return false;
        }
    }

    // Pay Costs
    if (cost.exert) {
        card.ready = false;
    }

    if (cost.ink) {
        let paid = 0;
        for (const inkCard of player.inkwell) {
            if (inkCard.ready && paid < cost.ink) {
                inkCard.ready = false;
                paid++;
            }
        }
    }
    if (cost.discard) {
        // Handle discard payment
        if (payload?.discardCardId) {
            const cardToDiscard = player.hand.find(c => c.instanceId === payload.discardCardId);
            if (cardToDiscard) {
                player.hand = player.hand.filter(c => c.instanceId !== cardToDiscard.instanceId);
                cardToDiscard.zone = ZoneType.Discard;
                player.discard.push(cardToDiscard);
                turnManager.trackZoneChange(cardToDiscard, ZoneType.Hand, ZoneType.Discard);
                turnManager.logger.action(player.name, `Paid discard cost: ${cardToDiscard.name}`);
            }
        } else if (cost.discard > 0) {
            turnManager.logger.debug(`[${player.name}] Discard cost paid but no card specified in payload.`);
        }
    }

    if (cost.banish) {
        // Banish self
        player.play = player.play.filter(c => c.instanceId !== card.instanceId);
        card.zone = ZoneType.Discard;
        player.discard.push(card);
        turnManager.trackZoneChange(card, ZoneType.Play, ZoneType.Discard);
        turnManager.logger.action(player.name, `Banished ${card.name} to pay cost`);
    }

    // Extract ability name for logging
    let abilityDisplayName = effect.abilityName;
    if (!abilityDisplayName && effect.rawText) {
        // Try to extract ability name from rawText (format: "NAME Effect text")
        const nameMatch = effect.rawText.match(/^([A-Z][A-Z\s'-]+?)\s+(?:[⟳]|When|Whenever|While|Shift|Singer|Support|Evasive|Ward|Challenger|Reckless|Bodyguard|Rush)/);
        if (nameMatch) {
            abilityDisplayName = nameMatch[1].trim();
        } else {
            // Fallback to first 30 characters of rawText
            abilityDisplayName = effect.rawText.substring(0, 30) + (effect.rawText.length > 30 ? '...' : '');
        }
    }

    turnManager.logger.action(player.name, `Activated ${card.name}'s ability: ${abilityDisplayName || 'Unnamed Ability'}`);

    // Mark ability as used this turn
    card.meta.usedAbilities[abilityKey] = currentTurn;

    // Resolve Target (if any)
    let targetCard: CardInstance | undefined;
    if (payload?.targetId) {
        // Check Play (All Players)
        const allPlayers = Object.values(turnManager.game.state.players);
        for (const p of allPlayers) {
            const found = p.play.find(c => c.instanceId === payload.targetId);
            if (found) {
                targetCard = found;
                break;
            }
        }
    }

    // Execute Effect
    await executeResolveEffect(turnManager, player, effect, card, targetCard, payload);

    return true;
}
