/**
 * Custom Hooks
 * 
 * This directory contains custom React hooks that encapsulate
 * complex game logic and state management.
 */

export { useGameEngine } from './useGameEngine';
export type { GameEngine, GameOptions, UseGameEngineReturn } from './useGameEngine';

export { useGameActions } from './useGameActions';
export type { GameActionsOptions, UseGameActionsReturn } from './useGameActions';

export { useAnimations } from './useAnimations';
export type {
    LoreAnimationState,
    StatAnimationState,
    ChallengeAnimationState,
    DrawAnimationState,
    UseAnimationsReturn
} from './useAnimations';
