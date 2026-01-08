/**
 * Stat Calculator - Dynamic stat calculation from active effects
 * 
 * Cards have base stats, and active effects modify them.
 * This module calculates current stats by applying all relevant effects.
 */

import { Card, ContinuousEffect } from './models';

/**
 * Active Effect - represents a temporary or conditional modification
 */
export interface ActiveEffect {
    id: string;
    sourceCardId: string;        // Card that created this effect
    targetCardId: string;         // Card that is affected
    type: 'modify_strength' | 'modify_willpower' | 'modify_lore' | 'grant_keyword' | 'modify_damage';
    value: number;                // Amount of modification
    keyword?: string;             // For keyword grants (e.g., 'rush', 'evasive')
    duration: 'permanent' | 'until_end_of_turn' | 'while_condition';
    condition?: string;           // Condition for effect to be active
    timestamp: number;
}

/**
 * Game State interface for effects
 */
export interface GameStateWithEffects {
    activeEffects: ActiveEffect[];
    phase?: string;
    turnPlayerId?: string;
}

/**
 * Calculate current strength including all active effects
 */


export function getCurrentStrength(card: Card, gameState: GameStateWithEffects): number {
    const cardAny = card as any;
    // CRITICAL FIX: Use baseStrength, not strength
    let strength = cardAny.baseStrength !== undefined ? cardAny.baseStrength : (card.strength || 0);

    for (const effect of gameState.activeEffects as any[]) {
        if (canApplyEffect(effect, cardAny, gameState)) {
            if (effect.type === 'modify_strength') strength += effect.value;
            if (effect.type === 'modification' && effect.modification?.strength) strength += effect.modification.strength;
        }
    }
    return Math.max(0, strength);
}

export function getCurrentWillpower(card: Card, gameState: GameStateWithEffects): number {
    const cardAny = card as any;
    let willpower = cardAny.baseWillpower !== undefined ? cardAny.baseWillpower : (card.willpower || 0);

    for (const effect of gameState.activeEffects as any[]) {
        if (canApplyEffect(effect, cardAny, gameState)) {
            if (effect.type === 'modify_willpower') willpower += effect.value;
            if (effect.type === 'modification' && effect.modification?.willpower) willpower += effect.modification.willpower;
        }
    }
    return Math.max(0, willpower);
}

export function getCurrentLore(card: Card, gameState: GameStateWithEffects): number {
    const cardAny = card as any;
    let lore = cardAny.baseLore !== undefined ? cardAny.baseLore : (card.lore || 0);




    for (const effect of gameState.activeEffects as any[]) {
        const canApply = canApplyEffect(effect, cardAny, gameState);
        // console.log(`[StatCalc] Effect ${effect.id}, Type: ${effect.type}, CanApply: ${canApply}`);

        if (canApply) {
            if (effect.type === 'modify_lore') {
                lore += effect.value;
                // console.log(`[StatCalc] Applied +${effect.value} (legacy)`);
            }
            if (effect.type === 'modification' && effect.modification?.lore) {
                lore += effect.modification.lore;
                // console.log(`[StatCalc] Applied +${effect.modification.lore} (continuous)`);
            }
        }
    }
    return Math.max(0, lore);
}

function canApplyEffect(effect: any, card: any, gameState: any): boolean {
    const isTarget = effect.targetCardId === card.instanceId ||
        (effect.targetCardIds && effect.targetCardIds.includes(card.instanceId)) ||
        (effect.sourceCardId === card.instanceId && effect.target === 'self');

    if (!isTarget) return false;

    // Condition check
    if (effect.condition) {
        return evaluateCondition(effect, card, gameState);
    }
    return true;
}

/**
 * Check if a card has a keyword (base or granted via effect)
 */
export function hasKeyword(card: Card, keyword: string, gameState: GameStateWithEffects): boolean {
    // Check base keywords on card
    if ((card as any)[keyword]) {
        return true;
    }

    const cardAny = card as any;
    // Check active keyword grants
    for (const effect of gameState.activeEffects) {
        if (effect.targetCardId === cardAny.instanceId &&
            effect.type === 'grant_keyword' &&
            effect.keyword === keyword) {
            if (!effect.condition || evaluateCondition(effect, card, gameState)) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Get all active keywords on a card
 */
export function getActiveKeywords(card: Card, gameState: GameStateWithEffects): string[] {
    const keywords: string[] = [];
    const cardAny = card as any;

    // Base keywords
    const keywordList = ['rush', 'evasive', 'ward', 'bodyguard', 'singer', 'support', 'challenger', 'resist'];
    for (const keyword of keywordList) {
        if (cardAny[keyword]) {
            keywords.push(keyword);
        }
    }

    // Granted keywords from effects
    for (const effect of gameState.activeEffects) {
        if (effect.targetCardId === cardAny.instanceId &&
            effect.type === 'grant_keyword' &&
            effect.keyword) {
            if (!effect.condition || evaluateCondition(effect, card, gameState)) {
                if (!keywords.includes(effect.keyword)) {
                    keywords.push(effect.keyword);
                }
            }
        }
    }

    return keywords;
}

/**
 * Evaluate effect condition
 */
function evaluateCondition(effect: ActiveEffect, card: Card, gameState: GameStateWithEffects): boolean {
    if (!effect.condition) return true;

    const cardAny = card as any;
    switch (effect.condition) {
        case 'while_attacking':
            // Only active during attack (would need attack context)
            return false; // Placeholder - needs attack state

        case 'while_has_damage':
            return (cardAny.damage || 0) > 0;

        case 'while_ready':
            return cardAny.ready === true;

        case 'while_exerted':
            return cardAny.ready === false;

        default:
            return true;
    }
}

/**
 * Create a new active effect
 */
export function createEffect(
    sourceCard: Card,
    targetCard: Card,
    type: ActiveEffect['type'],
    value: number,
    options?: {
        keyword?: string;
        duration?: ActiveEffect['duration'];
        condition?: string;
    }
): ActiveEffect {
    const sourceAny = sourceCard as any;
    const targetAny = targetCard as any;
    return {
        id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sourceCardId: sourceAny.instanceId,
        targetCardId: targetAny.instanceId,
        type,
        value,
        keyword: options?.keyword,
        duration: options?.duration || 'permanent',
        condition: options?.condition,
        timestamp: Date.now()
    };
}
