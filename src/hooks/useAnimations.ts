'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Lore gain animation state
 */
export interface LoreAnimationState {
    show: boolean;
    amount: number;
    position: { x: number; y: number };
    key: number;
}

/**
 * Stat change animation state
 */
export interface StatAnimationState {
    show: boolean;
    amount: number;
    statType: 'strength' | 'willpower' | 'lore';
    position: { x: number; y: number };
}

/**
 * Challenge animation state
 */
export interface ChallengeAnimationState {
    show: boolean;
    attackerPos: { x: number; y: number };
    defenderPos: { x: number; y: number };
    attackerDamage: number;
    defenderDamage: number;
}

/**
 * Draw animation state
 */
export interface DrawAnimationState {
    active: boolean;
    from?: DOMRect;
    to?: DOMRect;
}

/**
 * Return type for useAnimations hook
 */
export interface UseAnimationsReturn {
    // Lore animation
    loreAnimation: LoreAnimationState;
    triggerLoreAnimation: (amount: number, position: { x: number; y: number }) => void;
    clearLoreAnimation: () => void;

    // Stat animation
    statAnimation: StatAnimationState;
    triggerStatAnimation: (amount: number, statType: 'strength' | 'willpower' | 'lore', position: { x: number; y: number }) => void;
    clearStatAnimation: () => void;

    // Challenge animation
    challengeAnimation: ChallengeAnimationState;
    triggerChallengeAnimation: (attackerPos: { x: number; y: number }, defenderPos: { x: number; y: number }, attackerDamage: number, defenderDamage: number) => void;
    clearChallengeAnimation: () => void;

    // Draw animation
    drawAnimation: DrawAnimationState;
    triggerDrawAnimation: (from: DOMRect, to: DOMRect) => void;
    clearDrawAnimation: () => void;
}

/**
 * Custom hook for game animations
 * Centralizes animation state and triggers for cleaner page.tsx
 */
export function useAnimations(): UseAnimationsReturn {
    // Lore animation
    const [loreAnimation, setLoreAnimation] = useState<LoreAnimationState>({
        show: false,
        amount: 0,
        position: { x: 0, y: 0 },
        key: 0
    });

    const triggerLoreAnimation = useCallback((amount: number, position: { x: number; y: number }) => {
        setLoreAnimation(prev => ({
            show: true,
            amount,
            position,
            key: prev.key + 1
        }));
    }, []);

    const clearLoreAnimation = useCallback(() => {
        setLoreAnimation(prev => ({ ...prev, show: false }));
    }, []);

    // Stat animation
    const [statAnimation, setStatAnimation] = useState<StatAnimationState>({
        show: false,
        amount: 0,
        statType: 'strength',
        position: { x: 0, y: 0 }
    });

    const triggerStatAnimation = useCallback((
        amount: number,
        statType: 'strength' | 'willpower' | 'lore',
        position: { x: number; y: number }
    ) => {
        setStatAnimation({
            show: true,
            amount,
            statType,
            position
        });
    }, []);

    const clearStatAnimation = useCallback(() => {
        setStatAnimation(prev => ({ ...prev, show: false }));
    }, []);

    // Challenge animation
    const [challengeAnimation, setChallengeAnimation] = useState<ChallengeAnimationState>({
        show: false,
        attackerPos: { x: 0, y: 0 },
        defenderPos: { x: 0, y: 0 },
        attackerDamage: 0,
        defenderDamage: 0
    });

    const triggerChallengeAnimation = useCallback((
        attackerPos: { x: number; y: number },
        defenderPos: { x: number; y: number },
        attackerDamage: number,
        defenderDamage: number
    ) => {
        setChallengeAnimation({
            show: true,
            attackerPos,
            defenderPos,
            attackerDamage,
            defenderDamage
        });
    }, []);

    const clearChallengeAnimation = useCallback(() => {
        setChallengeAnimation(prev => ({ ...prev, show: false }));
    }, []);

    // Draw animation
    const [drawAnimation, setDrawAnimation] = useState<DrawAnimationState>({
        active: false
    });

    const triggerDrawAnimation = useCallback((from: DOMRect, to: DOMRect) => {
        setDrawAnimation({
            active: true,
            from,
            to
        });
    }, []);

    const clearDrawAnimation = useCallback(() => {
        setDrawAnimation({ active: false });
    }, []);

    return {
        loreAnimation,
        triggerLoreAnimation,
        clearLoreAnimation,
        statAnimation,
        triggerStatAnimation,
        clearStatAnimation,
        challengeAnimation,
        triggerChallengeAnimation,
        clearChallengeAnimation,
        drawAnimation,
        triggerDrawAnimation,
        clearDrawAnimation,
    };
}
