'use client';

import { useCallback } from 'react';
import { CardInstance } from '../engine/models';
import { ActionType } from '../engine/actions';
import { LogEntry, LogCategory } from '../types/log';
import { GameEngine } from './useGameEngine';

/**
 * Options for game actions hook
 */
export interface GameActionsOptions {
    engine: GameEngine | null;
    onLog?: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
    onStateUpdate?: () => void;
}

/**
 * Return type for useGameActions hook
 */
export interface UseGameActionsReturn {
    // Hand actions
    inkCard: (card: CardInstance) => boolean;
    playCard: (card: CardInstance) => Promise<boolean>;
    shiftCard: (card: CardInstance, targetId: string) => Promise<boolean>;
    singCard: (song: CardInstance, singerIdOrIds: string | string[]) => Promise<boolean>;

    // Play area actions
    quest: (card: CardInstance) => Promise<{ success: boolean; loreGained: number }>;
    challenge: (attacker: CardInstance, targetId: string) => Promise<boolean>;
    move: (card: CardInstance, locationId: string) => Promise<boolean>;
    useAbility: (card: CardInstance, abilityIndex: number) => Promise<boolean>;

    // Turn actions
    endTurn: () => Promise<void>;
}

/**
 * Custom hook for game action handlers
 * Extracts action logic from page.tsx for cleaner separation
 */
export function useGameActions(options: GameActionsOptions): UseGameActionsReturn {
    const { engine, onLog, onStateUpdate } = options;

    const addLog = useCallback((entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
        onLog?.(entry);
    }, [onLog]);

    const updateState = useCallback(() => {
        if (engine) {
            engine.humanController.updateState(engine.stateManager.state);
        }
        onStateUpdate?.();
    }, [engine, onStateUpdate]);

    /**
     * Ink a card from hand
     */
    const inkCard = useCallback((card: CardInstance): boolean => {
        if (!engine) return false;

        const player = engine.stateManager.getPlayer(engine.humanController.id);
        const success = engine.turnManager.inkCard(player as any, card.instanceId);

        if (success) {
            updateState();
        } else {
            addLog({
                category: LogCategory.SYSTEM,
                message: `Failed to ink ${card.name}`,
                details: {}
            });
        }

        return success;
    }, [engine, updateState, addLog]);

    /**
     * Play a card from hand
     */
    const playCard = useCallback(async (card: CardInstance): Promise<boolean> => {
        if (!engine) return false;

        try {
            const player = engine.stateManager.getPlayer(engine.humanController.id);
            await engine.turnManager.playCard(player as any, card.instanceId);
            updateState();
            return true;
        } catch (error) {
            addLog({
                category: LogCategory.SYSTEM,
                message: `Failed to play ${card.name}: ${error}`,
                details: {}
            });
            return false;
        }
    }, [engine, updateState, addLog]);

    /**
     * Shift a Floodborn character onto a matching character
     */
    const shiftCard = useCallback(async (card: CardInstance, targetId: string): Promise<boolean> => {
        if (!engine) return false;

        try {
            const player = engine.stateManager.getPlayer(engine.humanController.id);
            await engine.turnManager.playCard(
                player,
                card.instanceId,
                undefined, // singerId
                targetId   // shiftTargetId
            );
            addLog({
                category: LogCategory.CARD,
                message: `${card.fullName || card.name} shifted!`,
                details: {}
            });
            updateState();
            return true;
        } catch (error) {
            console.error('Shift failed:', error);
            return false;
        }
    }, [engine, updateState, addLog]);

    /**
     * Sing a song using a character
     */
    const singCard = useCallback(async (song: CardInstance, singerIdOrIds: string | string[]): Promise<boolean> => {
        if (!engine) return false;

        try {
            const player = engine.stateManager.getPlayer(engine.humanController.id);

            let singerId: string | undefined;
            let singerIds: string[] | undefined;

            if (Array.isArray(singerIdOrIds)) {
                singerIds = singerIdOrIds;
            } else {
                singerId = singerIdOrIds;
            }

            await engine.turnManager.playCard(
                player,
                song.instanceId,
                singerId,
                undefined, // shiftTargetId
                undefined, // targetId
                undefined, // payload
                singerIds
            );

            const singerDesc = Array.isArray(singerIdOrIds)
                ? `${singerIdOrIds.length} characters`
                : 'Character';

            addLog({
                category: LogCategory.CARD,
                message: `🎵 ${singerDesc} sang ${song.fullName || song.name}!`,
                details: {}
            });
            updateState();
            return true;
        } catch (error) {
            console.error('Sing failed:', error);
            return false;
        }
    }, [engine, updateState, addLog]);

    /**
     * Quest with a character
     */
    const quest = useCallback(async (card: CardInstance): Promise<{ success: boolean; loreGained: number }> => {
        if (!engine || !card.ready) {
            return { success: false, loreGained: 0 };
        }

        try {
            const loreAmount = card.lore || 0;

            await engine.turnManager.resolveAction({
                type: ActionType.Quest,
                playerId: engine.humanController.id,
                cardId: card.instanceId
            });

            addLog({
                category: LogCategory.LORE,
                message: `${card.fullName || card.name} quested for ${loreAmount} lore`,
                details: {}
            });
            updateState();

            return { success: true, loreGained: loreAmount };
        } catch (error) {
            console.error('Quest failed:', error);
            return { success: false, loreGained: 0 };
        }
    }, [engine, updateState, addLog]);

    /**
     * Challenge an opponent's character
     */
    const challenge = useCallback(async (attacker: CardInstance, targetId: string): Promise<boolean> => {
        if (!engine || !attacker.ready) return false;

        try {
            await engine.turnManager.resolveAction({
                type: ActionType.Challenge,
                playerId: engine.humanController.id,
                cardId: attacker.instanceId,
                targetId
            });
            updateState();
            return true;
        } catch (error) {
            console.error('Challenge failed:', error);
            return false;
        }
    }, [engine, updateState]);

    /**
     * Move a character to a location
     */
    const move = useCallback(async (card: CardInstance, locationId: string): Promise<boolean> => {
        if (!engine) return false;

        try {
            await engine.turnManager.resolveAction({
                type: ActionType.Move,
                playerId: engine.humanController.id,
                cardId: card.instanceId,
                destinationId: locationId
            });
            updateState();
            return true;
        } catch (error) {
            console.error('Move failed:', error);
            return false;
        }
    }, [engine, updateState]);

    /**
     * Use an activated ability
     */
    const useAbility = useCallback(async (card: CardInstance, abilityIndex: number): Promise<boolean> => {
        if (!engine) return false;

        try {
            const player = engine.stateManager.getPlayer(engine.humanController.id);
            engine.turnManager.useAbility(player, card.instanceId, abilityIndex);
            updateState();
            return true;
        } catch (error) {
            console.error('Ability use failed:', error);
            addLog({
                category: LogCategory.SYSTEM,
                message: `Failed to use ability: ${error}`,
                details: { error }
            });
            return false;
        }
    }, [engine, updateState, addLog]);

    /**
     * End the current turn
     */
    const endTurn = useCallback(async () => {
        if (!engine) return;

        try {
            await engine.turnManager.resolveAction({
                type: ActionType.PassTurn,
                playerId: engine.humanController.id
            });

            addLog({
                category: LogCategory.TURN,
                message: 'You ended your turn',
                details: {}
            });
            updateState();
        } catch (error) {
            console.error('Error ending turn:', error);
        }
    }, [engine, updateState, addLog]);

    return {
        inkCard,
        playCard,
        shiftCard,
        singCard,
        quest,
        challenge,
        move,
        useAbility,
        endTurn,
    };
}
