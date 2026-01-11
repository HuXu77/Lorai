/**
 * Recalculate Effects Logic
 * 
 * Handles the recalculation of all static and continuous effects:
 * - Resets stats and keywords to base values
 * - Applies 'while_active' effects (static abilities)
 * - Applies 'until_end_of_turn' effects (temporary buffs)
 * - Evaluates conditional abilities (e.g. "While X, get Y")
 * - Calculates dynamic stats (e.g. "Get +1 lore for each X")
 */

import { PlayerState } from '../state';
import { CardInstance, CardType, ZoneType } from '../models';
import type { TurnManager } from '../actions';

/**
 * Recalculate all effects in the game state
 * 
 * @param turnManager - The TurnManager instance
 */
export function executeRecalculateEffects(turnManager: TurnManager) {
    // Keep temporary effects (duration != 'while_active')
    turnManager.game.state.activeEffects = turnManager.game.state.activeEffects.filter(e => e.duration !== 'while_active');

    const players = Object.values(turnManager.game.state.players);

    // PASS 1: Reset stats and keywords for ALL cards
    players.forEach(player => {
        player.loreGoal = 20;
        player.play.forEach(card => {
            // Reset stats to base
            if (card.baseStrength !== undefined) {
                card.strength = card.baseStrength;
            }
            if (card.baseWillpower !== undefined) card.willpower = card.baseWillpower;
            if (card.baseLore !== undefined) card.lore = card.baseLore;

            // Initialize keywords from base keywords
            if (!card.baseKeywords) card.baseKeywords = [];
            card.keywords = [...card.baseKeywords];  // Reset to base keywords

            // Apply temporary strength from meta (Support)
            if (card.meta && card.meta.temporaryStrength) {
                card.strength = (card.strength || 0) + card.meta.temporaryStrength;
            }

            // Reset temporary metadata
            if (card.meta) {
                delete card.meta.resist;
            }
        });
    });

    // PASS 2: Apply effects
    players.forEach(player => {
        player.play.forEach(card => {
            // Apply active effect modifications (e.g., Granted Keywords, Stat Buffs)
            turnManager.game.state.activeEffects.forEach(effect => {
                const effectAny = effect as any;
                // console.log(`[Recalc] Checking effect ${effect.id} (${effect.type}) against ${card.name}`);

                // Apply stat modifications (NEW: from executor's executeModifyStats)
                if (effectAny.type === 'modify_strength' && effectAny.targetCardId === card.instanceId) {
                    card.strength = (card.strength || 0) + (effectAny.value || 0);
                } else if (effectAny.type === 'modify_willpower' && effectAny.targetCardId === card.instanceId) {
                    card.willpower = (card.willpower || 0) + (effectAny.value || 0);
                } else if (effectAny.type === 'modify_lore' && effectAny.targetCardId === card.instanceId) {
                    card.lore = (card.lore || 0) + (effectAny.value || 0);
                }
                // Apply keyword grants (LEGACY: ContinuousEffect format)
                else if (effect.type === 'modification') {
                    if (effectAny.modificationType === 'grant_keyword') {
                        const keyword = effectAny.params?.keyword;

                        if (effect.targetCardIds?.includes(card.instanceId)) {
                            if (keyword) {
                                if (!card.keywords) card.keywords = [];
                                if (!card.keywords.includes(keyword)) {
                                    card.keywords.push(keyword);
                                }
                            }
                        }
                    }
                }
            });

            // NEW: Calculate Resist from keywords (e.g. "Resist +2" granted by effect)
            // This handles cases where 'grant_keyword' adds "Resist +2" to keywords array,
            // but does not explicitly set meta.resist.

            // FIRST: Restore permanent Resist from static keyword abilities (e.g., Troubadour)
            if (card.parsedEffects) {
                card.parsedEffects.forEach((effect: any) => {
                    if (effect.type === 'static' && effect.keyword === 'resist' && effect.value) {
                        if (!card.meta) card.meta = {};
                        card.meta.resist = (card.meta.resist || 0) + effect.value;
                    }
                });
            }

            // THEN: Add Resist from keywords array (granted by effects like "I'm Still Here")
            if (card.keywords) {
                let resistFromKeywords = 0;
                card.keywords.forEach(kw => {
                    if (kw.startsWith('Resist')) {
                        // Parse value "Resist +2" or "Resist 1"
                        const match = kw.match(/Resist\s*\+?(\d+)/);
                        if (match) {
                            const val = parseInt(match[1]);
                            // console.log(`[DEBUG] Found Resist keyword: ${kw}, value: ${val} on ${card.name}`);
                            resistFromKeywords += val;
                        }
                    }
                });

                if (resistFromKeywords > 0) {
                    if (!card.meta) card.meta = {};
                    // Add to existing resist (from static abilities)
                    const oldResist = card.meta.resist || 0;
                    card.meta.resist = oldResist + resistFromKeywords;
                }
            }

            // Reset turn-based stats if not modified by continuous effects
            // (Base stats are already reset)
            if (card.parsedEffects) {
                card.parsedEffects.forEach((effect: any) => {
                    // Win Condition Modification (Donald Duck - Flustered Sorcerer)
                    // Placed here because type is 'modify_win_condition', not 'static'
                    if (effect.type === 'modify_win_condition' && effect.loreRequired) {
                        const loreRequired = effect.loreRequired;
                        // Apply to opponents
                        Object.values(turnManager.game.state.players).forEach(p => {
                            if (p.id !== player.id) {
                                if (p.loreGoal < loreRequired) {
                                    p.loreGoal = loreRequired;
                                    turnManager.logger.debug(`[Recalc] ${p.name}'s lore goal set to ${loreRequired} by ${card.name}`);
                                }
                            }
                        });
                    }

                    if (effect.type === 'static') {

                        // Apply Simple Stat Buffs (Simba etc)
                        // This handles purely static buffs like "Your other characters get +1 Lore" or self-buffs
                        // But these should ideally be registered as ContinuousEffects?
                        // Actually, static abilities are evaluated here every time.

                        // Resolve Nested Effects (e.g. Conditional Buffs)
                        if (effect.effects) {
                            // Check parent condition (Group Condition - e.g. "While X, gets Y and Z")
                            if (effect.condition) {
                                if (!evaluateCondition(player as any, effect.condition, card)) return;
                            }

                            effect.effects.forEach((subEffect: any) => {
                                // Check subEffect's individual condition (e.g. Flynn Rider: "While there's a card under")
                                if (subEffect.condition) {
                                    if (!evaluateCondition(player as any, subEffect.condition, card)) return;
                                }

                                if (subEffect.type === 'modify_stats') {
                                    let amount = 0;

                                    // Handle dynamic amount (e.g. "+1 for each Villain")
                                    if (typeof subEffect.amount === 'object' && subEffect.amount.type === 'per_character') {
                                        const amountConfig = subEffect.amount;

                                        // Determine scope (yours vs all)
                                        // Hades says "you have in play", so 'yours' is true. 
                                        // The parser set 'yours': true.
                                        let targetPlayers = [player];
                                        if (amountConfig.opponent) {
                                            targetPlayers = players.filter(p => p.id !== player.id);
                                        } else if (!amountConfig.yours) {
                                            targetPlayers = players; // All players? Usually "each character" implies implied scope.
                                        }

                                        let count = 0;
                                        targetPlayers.forEach(p => {
                                            p.play.forEach(c => {
                                                // Skip self if 'other' is true
                                                if (amountConfig.other && c.instanceId === card.instanceId) return;

                                                // Check subtype
                                                if (amountConfig.subtype) {
                                                    if (c.subtypes && c.subtypes.some((s: string) => s.toLowerCase() === amountConfig.subtype.toLowerCase())) {
                                                        count++;
                                                    }
                                                }
                                                // Check type (e.g. "Item")
                                                else if (amountConfig.cardType) {
                                                    if (c.type.toLowerCase() === amountConfig.cardType.toLowerCase()) {
                                                        count++;
                                                    }
                                                }
                                                else {
                                                    // Just count everything?
                                                    count++;
                                                }
                                            });
                                        });

                                        amount = count * (amountConfig.multiplier || 1);
                                        // Add base if any? No, usually it's just the multiplier.
                                    } else {
                                        // Static number
                                        amount = typeof subEffect.amount === 'number' ? subEffect.amount : parseInt(String(subEffect.amount));
                                    }

                                    const stat = subEffect.stat;
                                    const target = subEffect.target;
                                    const filter = target?.filter; // e.g. { subtype: 'Villain' }

                                    // Apply to appropriate targets
                                    // Identify targets based on filter
                                    // CRITICAL: Previously iterate player.play. But logic should apply `amount` to `target`.
                                    // If target is self (which it is for Hades), we just modify `card`.
                                    // BUT the existing code iterates `player.play` to find targets.

                                    // Let's use the existing target iteration logic, just passed `amount`.

                                    player.play.forEach(targetCard => {
                                        // Skip self if filter says so
                                        if (filter?.other && targetCard.instanceId === card.instanceId) {
                                            return;
                                        }

                                        // CRITICAL FIX: Respect 'self' target type (or lack of target which implies self)
                                        // This prevents "While X, get +1 Lore" from applying to ALL cards
                                        const targetType = target?.type || target;
                                        const isSelfTarget = !targetType || targetType === 'self';

                                        if (isSelfTarget && targetCard.instanceId !== card.instanceId) {
                                            return;
                                        }

                                        // Check if target matches filter
                                        let matches = true;

                                        // Filter by mine
                                        if (filter?.mine !== undefined) {
                                            const isMine = targetCard.ownerId === player.id;
                                            if (filter.mine !== isMine) {
                                                matches = false;
                                            }
                                        }

                                        // Filter by subtype (single)
                                        if (filter?.subtype) {
                                            if (!targetCard.subtypes || !targetCard.subtypes.includes(filter.subtype)) {
                                                matches = false;
                                            }
                                        }

                                        // Filter by subtypes (multiple - match any)
                                        if (filter?.subtypes && Array.isArray(filter.subtypes)) {
                                            const hasAnySubtype = filter.subtypes.some((sub: string) =>
                                                targetCard.subtypes && targetCard.subtypes.includes(sub)
                                            );
                                            if (!hasAnySubtype) matches = false;
                                        }

                                        // Apply stat modification if matches
                                        if (matches) {
                                            // Allow Characters and Locations (for Lore/Willpower)
                                            // Items/Actions don't usually have stats modified this way, but costs are handled elsewhere
                                            if (targetCard.type === CardType.Character || targetCard.type === CardType.Location) {
                                                if (stat === 'strength' && targetCard.type === CardType.Character) {
                                                    targetCard.strength = (targetCard.strength || 0) + amount;
                                                } else if (stat === 'willpower') {
                                                    targetCard.willpower = (targetCard.willpower || 0) + amount;
                                                } else if (stat === 'lore') {
                                                    targetCard.lore = (targetCard.lore || 0) + amount;
                                                }
                                            }
                                        }
                                    });
                                } else if (subEffect.type === 'grant_keyword') {
                                    const target = subEffect.target;
                                    const filter = target?.filter;
                                    const keyword = subEffect.keyword;

                                    if (keyword) {
                                        player.play.forEach(targetCard => {
                                            // Skip self if filter says so
                                            if (filter?.other && targetCard.instanceId === card.instanceId) {
                                                return;
                                            }

                                            // Check if target matches filter
                                            let matches = true;

                                            // Filter by mine
                                            if (filter?.mine !== undefined) {
                                                const isMine = targetCard.ownerId === player.id;
                                                if (filter.mine !== isMine) {
                                                    matches = false;
                                                }
                                            }

                                            // Filter by subtype (single)
                                            if (filter?.subtype) {
                                                if (!targetCard.subtypes || !targetCard.subtypes.includes(filter.subtype)) {
                                                    matches = false;
                                                }
                                            }

                                            // Filter by subtypes (multiple - match any)
                                            if (filter?.subtypes && Array.isArray(filter.subtypes)) {
                                                const hasAnySubtype = filter.subtypes.some((sub: string) =>
                                                    targetCard.subtypes && targetCard.subtypes.includes(sub)
                                                );
                                                if (!hasAnySubtype) matches = false;
                                            }

                                            // Apply keyword if matches
                                            if (matches && targetCard.type === CardType.Character) {
                                                if (!targetCard.keywords) targetCard.keywords = [];
                                                // Handle string or object keyword
                                                const keywordName = typeof keyword === 'string' ? keyword : keyword.name;

                                                if (!targetCard.keywords.includes(keywordName)) {
                                                    targetCard.keywords.push(keywordName);
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        }

                        // LEGACY FORMAT: effect.trigger === 'static'
                        if (effect.trigger === 'static') {
                            // Map CardEffect to ContinuousEffect
                            let type: 'restriction' | 'modification' = 'restriction';
                            let restrictionType: any = undefined;

                            if (effect.action === 'cant_play_songs') restrictionType = 'cant_play_songs';
                            if (effect.action === 'cant_challenge') restrictionType = 'cant_challenge';

                            if (restrictionType) {
                                turnManager.game.state.activeEffects.push({
                                    id: `${card.instanceId}_${effect.action}`,
                                    type: 'restriction',
                                    restrictionType: restrictionType,
                                    target: effect.target as any,
                                    sourceCardId: card.instanceId,
                                    sourcePlayerId: player.id,
                                    duration: 'while_active'
                                });
                            }

                            // Buff Subtype (Beast)
                            if (effect.action === 'buff_subtype') {
                                turnManager.game.state.activeEffects.push({
                                    id: `${card.instanceId}_buff_subtype`,
                                    type: 'modification',
                                    modificationType: 'buff_subtype',
                                    target: 'your_characters',
                                    sourceCardId: card.instanceId,
                                    sourcePlayerId: player.id,
                                    duration: 'while_active',
                                    params: effect.params
                                } as any);
                            }

                            // Global cost reduction ("Your characters cost X less")
                            if (effect.action === 'reduce_cost') {
                                if (!player.costReductions) player.costReductions = [];
                                player.costReductions.push({
                                    amount: effect.amount as number,
                                    filter: effect.params?.filter || 'character',
                                    duration: 'until_end_of_turn',
                                    sourceId: card.instanceId
                                });
                            }

                            // Global stat buff ("Your characters get +X strength")
                            if (effect.action === 'buff_all_characters') {
                                const stat = effect.params?.stat;
                                const amount = effect.amount as number;

                                player.play.forEach(targetCard => {
                                    if (targetCard.type === CardType.Character && targetCard.instanceId !== card.instanceId) {
                                        if (stat === 'strength') targetCard.strength = (targetCard.strength || 0) + amount;
                                        else if (stat === 'willpower') targetCard.willpower = (targetCard.willpower || 0) + amount;
                                        else if (stat === 'lore') targetCard.lore = (targetCard.lore || 0) + amount;
                                    }
                                });
                                // Also apply to self if it's a character
                                if (card.type === CardType.Character) {
                                    if (stat === 'strength') card.strength = (card.strength || 0) + amount;
                                    else if (stat === 'willpower') card.willpower = (card.willpower || 0) + amount;
                                    else if (stat === 'lore') card.lore = (card.lore || 0) + amount;
                                }
                            }
                        }

                        // Conditional Lore Bonus (Lady)
                        if (effect.trigger === 'static' && effect.action === 'conditional_lore_bonus') {
                            turnManager.game.state.activeEffects.push({
                                id: `${card.instanceId}_conditional_lore_bonus`,
                                type: 'modification',
                                modificationType: 'conditional_lore_bonus',
                                target: 'self',
                                sourceCardId: card.instanceId,
                                sourcePlayerId: player.id,
                                duration: 'while_active',
                                params: effect.params
                            } as any);
                        }

                        // Lore per opposing damaged character (Robin Hood)
                        if (effect.trigger === 'static' && effect.action === 'lore_per_opposing_damaged') {
                            turnManager.game.state.activeEffects.push({
                                id: `${card.instanceId}_lore_per_opposing_damaged`,
                                type: 'modification',
                                modificationType: 'lore_per_opposing_damaged',
                                target: 'self',
                                sourceCardId: card.instanceId,
                                sourcePlayerId: player.id,
                                duration: 'while_active',
                                params: effect.params
                            } as any);
                        }

                        // Conditional keyword grant (Jasmine - Evasive during your turn)
                        if (effect.trigger === 'during_your_turn' && effect.action === 'gain_keyword') {
                            const keyword = effect.params?.keyword || 'Evasive';
                            const isOwnerTurn = turnManager.game.state.turnPlayerId === player.id;

                            if (isOwnerTurn) {
                                if (!card.keywords) card.keywords = [];
                                if (!card.keywords.includes(keyword)) {
                                    card.keywords.push(keyword);
                                }
                            }
                        }

                        // === GROUP 1: CONDITIONAL STATIC ABILITIES ===

                        // Conditional can't ready (STONE BY DAY)
                        if (effect.action === 'conditional_cant_ready' && effect.params?.condition) {
                            const conditionMet = evaluateCondition(player as any, effect.params.condition, card);
                            if (conditionMet) {
                                turnManager.game.state.activeEffects.push({
                                    id: `cant_ready_${card.instanceId}_${Date.now()}`,
                                    type: 'restriction',
                                    restrictionType: 'cant_ready',
                                    target: 'custom',
                                    targetCardIds: [card.instanceId],
                                    sourceCardId: card.instanceId,
                                    sourcePlayerId: player.id,
                                    duration: 'while_condition'
                                } as any);
                            }
                        }

                        // Conditional stat buff (ARCANE STUDY, TAKE THE LEAD)
                        if (effect.action === 'conditional_stat_buff' && effect.params?.condition && effect.amount) {
                            const conditionMet = evaluateCondition(player as any, effect.params.condition, card);
                            if (conditionMet) {
                                const statType = effect.params.statType;
                                const buffAmount = typeof effect.amount === 'number' ? effect.amount : parseInt(String(effect.amount));
                                if (statType === 'lore') card.lore = (card.lore || 0) + buffAmount;
                                else if (statType === 'strength') card.strength = (card.strength || 0) + buffAmount;
                                else if (statType === 'willpower') card.willpower = (card.willpower || 0) + buffAmount;
                            }
                        }

                        // Grant keyword to others (PROTECTIVE EMBRACE)
                        if (effect.action === 'grant_keyword_to_others' && effect.params?.keyword) {
                            player.play.forEach(otherCard => {
                                if (otherCard.instanceId !== card.instanceId) {
                                    if (!otherCard.keywords) otherCard.keywords = [];
                                    if (!otherCard.keywords.includes(effect.params.keyword)) {
                                        otherCard.keywords.push(effect.params.keyword);
                                    }
                                }
                            });
                        }

                        // Conditional grant keywords (YOU CAN BE WAY MORE)
                        if (effect.action === 'conditional_grant_keywords' && effect.params?.subtype && effect.params?.keywords) {
                            player.play.forEach(targetCard => {
                                if (targetCard.subtypes?.includes(effect.params.subtype)) {
                                    const conditionMet = effect.params.condition ?
                                        evaluateCondition(player as any, effect.params.condition, targetCard) : true;
                                    if (conditionMet) {
                                        if (!targetCard.keywords) targetCard.keywords = [];
                                        effect.params.keywords.forEach((kw: string) => {
                                            if (!targetCard.keywords!.includes(kw)) targetCard.keywords!.push(kw);
                                        });
                                    }
                                }
                            });
                        }

                        // Dynamic stat per count (SINISTER PLOT)
                        if (effect.action === 'dynamic_stat_per_count' && effect.params?.countedEntity && effect.params?.statType && effect.amount) {
                            const count = countEntities(player as any, effect.params.countedEntity, card);
                            const buffAmount = typeof effect.amount === 'number' ? effect.amount : parseInt(String(effect.amount));
                            const totalBuff = count * buffAmount;
                            if (totalBuff > 0) {
                                const statType = effect.params.statType;
                                if (statType === 'lore') card.lore = (card.lore || 0) + totalBuff;
                                else if (statType === 'strength') card.strength = (card.strength || 0) + totalBuff;
                                else if (statType === 'willpower') card.willpower = (card.willpower || 0) + totalBuff;
                            }
                        }

                    }
                });
            }
        });
    });

    // Apply Global/Active Effects (Modifications)
    turnManager.game.state.activeEffects.forEach(effect => {
        if (effect.type === 'modification') {
            const modEffect = effect as any;

            // Handle standard modification object (e.g. from gain_temporary_strength)
            if (modEffect.modification) {
                const mod = modEffect.modification;
                const targetIds = modEffect.targetCardIds || (modEffect.targetCardId ? [modEffect.targetCardId] : []);

                if (targetIds.length > 0) {
                    players.forEach(player => {
                        player.play.forEach(card => {
                            if (targetIds.includes(card.instanceId)) {
                                if (mod.strength) card.strength = (card.strength || 0) + mod.strength;
                                if (mod.willpower) card.willpower = (card.willpower || 0) + mod.willpower;
                                if (mod.lore) card.lore = (card.lore || 0) + mod.lore;
                            }
                        });
                    });
                }
            }

            if (modEffect.modificationType === 'strength') {
                const targetId = modEffect.targetCardId;
                const amount = modEffect.modificationAmount;

                // Find target card
                players.forEach(player => {
                    const card = player.play.find(c => c.instanceId === targetId);
                    if (card) {
                        card.strength = (card.strength || 0) + amount;
                    }
                });
            }
            // Apply Buff Subtype
            else if (modEffect.modificationType === 'buff_subtype') {
                const params = modEffect.params;
                const sourcePlayerId = modEffect.sourcePlayerId;
                const subtype = params.subtype;
                const buffs = params.buffs;

                if (sourcePlayerId) {
                    const player = turnManager.game.getPlayer(sourcePlayerId);
                    player.play.forEach(card => {
                        turnManager.logger.debug(`Checking ${card.name} for subtype ${subtype}. Subtypes: ${card.subtypes}`);
                        if (card.subtypes && card.subtypes.includes(subtype)) {
                            if (buffs.strength) card.strength = (card.strength || 0) + buffs.strength;
                            if (buffs.willpower) card.willpower = (card.willpower || 0) + buffs.willpower;
                            turnManager.logger.debug(`Buffed ${card.name}: +${buffs.strength}/+${buffs.willpower}`);
                        }
                    });
                }
            }

            // Apply Conditional Lore Bonus
            else if (modEffect.modificationType === 'conditional_lore_bonus') {
                const params = modEffect.params;
                const sourceCardId = modEffect.sourceCardId;
                const sourcePlayerId = modEffect.sourcePlayerId;

                if (sourcePlayerId && sourceCardId) {
                    const player = turnManager.game.getPlayer(sourcePlayerId);
                    const card = player.play.find(c => c.instanceId === sourceCardId);

                    if (card) {
                        const strengthThreshold = params.strengthThreshold;
                        const loreBonus = params.loreBonus;

                        // Check explicit condition (e.g. Presence of Tramp)
                        if (params.condition) {
                            if (!evaluateCondition(player, params.condition, card)) return;
                        }

                        if (card.strength !== undefined && (strengthThreshold === undefined || card.strength >= strengthThreshold)) {
                            card.lore = (card.lore || 0) + loreBonus;
                            turnManager.logger.effect(player.name, `${card.name} gets +${loreBonus} lore (Strength ${card.strength} >= ${strengthThreshold})`);
                        }
                    }
                }
            }

            // Apply Lore per Opposing Damaged Character
            else if (modEffect.modificationType === 'lore_per_opposing_damaged') {
                const params = modEffect.params;
                const sourceCardId = modEffect.sourceCardId;
                const sourcePlayerId = modEffect.sourcePlayerId;

                if (sourcePlayerId && sourceCardId) {
                    const player = turnManager.game.getPlayer(sourcePlayerId);
                    const card = player.play.find(c => c.instanceId === sourceCardId);

                    if (card) {
                        // Count opposing damaged characters
                        let damagedCount = 0;
                        const opponentIds = Object.keys(turnManager.game.state.players).filter(id => id !== sourcePlayerId);
                        opponentIds.forEach(oppId => {
                            const opponent = turnManager.game.getPlayer(oppId);
                            opponent.play.forEach(oppCard => {
                                if (oppCard.type === CardType.Character && oppCard.damage > 0) {
                                    damagedCount++;
                                }
                            });
                        });

                        const amountPerCard = params.amountPerCard || 0;
                        const totalBonus = damagedCount * amountPerCard;

                        if (totalBonus > 0) {
                            card.lore = (card.lore || 0) + totalBonus;
                            turnManager.logger.effect(player.name, `${card.name} gets +${totalBonus} lore (${damagedCount} damaged opponents)`);
                        }
                    }
                }
            }
        }
    });
}

/**
 * Evaluate a condition against current game state (Group 1: Conditional Static Abilities)
 */
export function evaluateCondition(player: PlayerState, condition: any, sourceCard?: CardInstance): boolean {
    if (!condition) return false;

    switch (condition.type) {
        case 'hand_size_greater_than_or_equal':
            return player.hand.length >= condition.threshold;

        case 'characters_with_subtype_in_play':
            const count = player.play.filter((c: CardInstance) => {
                const subtypes = c.subtypes || [];
                if (condition.subtypes && Array.isArray(condition.subtypes)) {
                    // Match ANY of the subtypes
                    return condition.subtypes.some((s: string) => subtypes.includes(s));
                }
                return subtypes.includes(condition.subtype);
            }).length;
            return count >= condition.threshold;

        case 'self_stat_greater_than_or_equal':
            if (!sourceCard) return false;
            const stat = condition.stat === 'strength' ? sourceCard.strength : sourceCard.willpower;
            return (stat || 0) >= condition.threshold;

        case 'has_card_under':
            // Check both sourceCard.cardsUnder and sourceCard.meta.cardsUnder
            const cardsUnder = sourceCard?.meta?.cardsUnder || sourceCard?.cardsUnder;
            return !!(cardsUnder && cardsUnder.length > 0);

        case 'filter':
        case 'has_character':
            if (condition.filter) {
                const filter = condition.filter;
                return player.play.some(c => {
                    if (filter.name && c.name !== filter.name) return false;
                    if (filter.subtype && (!c.subtypes || !c.subtypes.includes(filter.subtype))) return false;
                    if (filter.classifications && Array.isArray(filter.classifications)) {
                        // Check if card has ANY of the classifications
                        const hasAny = filter.classifications.some((cls: string) => c.subtypes && c.subtypes.includes(cls));
                        if (!hasAny) return false;
                    }
                    if (filter.type && c.type !== filter.type) return false;

                    // Support 'exclude_self' or similar if needed, but 'has_character' usually implies any.
                    return true;
                });
            }
            return false;

        // NEW: Check for card in discard (Lilo - Escape Artist)
        case 'in_discard':
            if (!sourceCard) return false;
            return sourceCard.zone === ZoneType.Discard;

        // CRITICAL FIX: Support presence condition for named card synergies (Lady/Tramp)
        // "While you have a character named X in play, this character gets +Y stat."
        case 'presence':
            if (condition.filter) {
                const presenceFilter = condition.filter;
                return player.play.some((c: CardInstance) => {
                    if (presenceFilter.name && c.name !== presenceFilter.name && !c.name.startsWith(presenceFilter.name + ' -')) return false;
                    if (presenceFilter.subtype) {
                        const subtypes = c.subtypes || [];
                        if (!subtypes.some((s: string) => s.toLowerCase() === presenceFilter.subtype.toLowerCase())) {
                            return false;
                        }
                    }
                    return true;
                });
            }
            return true; // No filter = always true

        // FIXED: Support "While undamaged" condition
        case 'no_damage':
            if (!sourceCard) return false;
            return !sourceCard.damage || sourceCard.damage === 0;

        default:
            return false;
    }
}

/**
 * Count entities matching a filter for dynamic stat calculations
 */
export function countEntities(player: PlayerState, filter: string, excludeCard?: CardInstance): number {
    // Parse "other Villain character" or "other Villain" pattern
    const subtypeMatch = filter.match(/other (\w+)(?: character)?/i);
    if (subtypeMatch) {
        const subtype = subtypeMatch[1];
        return player.play.filter((c: CardInstance) =>
            c.subtypes && c.subtypes.includes(subtype) &&
            c.instanceId !== excludeCard?.instanceId
        ).length;
    }

    // Parse "location" or other entity types
    if (filter.toLowerCase().includes('location')) {
        return player.play.filter((c: CardInstance) => c.type === CardType.Location).length;
    }

    return 0;
}
