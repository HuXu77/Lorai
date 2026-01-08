/**
 * The Bag
 * 
 * Lorcana's system for resolving triggered abilities.
 * Unlike MTG's LIFO stack, The Bag allows players to choose
 * the order in which their triggered abilities resolve.
 * 
 * Rules from section 8.7:
 * - Only triggered abilities go in the bag
 * - Active player chooses which of their abilities to resolve
 * - Active player resolves ALL their abilities first
 * - Then next player in turn order
 * - Players choose resolution order for their own abilities
 */

import { TriggeredAbility } from './types';
import { EventContext } from './events';

export interface BagEntry {
    ability: TriggeredAbility;
    context: EventContext;
    controller: any; // Player who controls this ability
    timestamp: number;
}

export class AbilityBag {
    // Organize abilities by player for easier management
    private abilitiesByPlayer: Map<any, BagEntry[]> = new Map();

    /**
     * Add a triggered ability to the bag
     * Only triggered abilities can be added (not activated)
     */
    add(ability: TriggeredAbility, context: EventContext, controller: any): void {
        if (!this.abilitiesByPlayer.has(controller)) {
            this.abilitiesByPlayer.set(controller, []);
        }

        this.abilitiesByPlayer.get(controller)!.push({
            ability,
            context,
            controller,
            timestamp: Date.now()
        });
    }

    /**
     * Get all abilities for a specific player
     */
    getPlayerAbilities(player: any): BagEntry[] {
        return this.abilitiesByPlayer.get(player) || [];
    }

    /**
     * Remove a specific ability from the bag
     */
    remove(entry: BagEntry): void {
        const playerAbilities = this.abilitiesByPlayer.get(entry.controller);
        if (playerAbilities) {
            const index = playerAbilities.indexOf(entry);
            if (index > -1) {
                playerAbilities.splice(index, 1);
            }
        }
    }

    /**
     * Check if a player has any abilities in the bag
     */
    hasAbilities(player: any): boolean {
        const abilities = this.abilitiesByPlayer.get(player);
        return abilities !== undefined && abilities.length > 0;
    }

    /**
     * Check if the bag is empty
     */
    isEmpty(): boolean {
        for (const abilities of this.abilitiesByPlayer.values()) {
            if (abilities.length > 0) {
                return false;
            }
        }
        return true;
    }

    /**
     * Get total number of abilities in the bag
     */
    size(): number {
        let total = 0;
        for (const abilities of this.abilitiesByPlayer.values()) {
            total += abilities.length;
        }
        return total;
    }

    /**
     * Clear all abilities
     */
    clear(): void {
        this.abilitiesByPlayer.clear();
    }

    /**
     * Resolve all abilities in the bag following Lorcana rules
     * 
     * @param gameState - Current game state with activePlayer and turn order
     * @param executor - Effect executor to run ability effects
     * @param playerChoice - Callback for player to choose which ability to resolve
     */
    async resolveAll(
        gameState: any,
        executor: any,
        playerChoice: (player: any, abilities: BagEntry[]) => Promise<BagEntry>
    ): Promise<void> {
        // Get turn order starting with active player
        const players = gameState.getTurnOrder(); // Should return [activePlayer, ...otherPlayers]

        for (const player of players) {
            // Each player resolves all their abilities (8.7.5 & 8.7.6)
            while (this.hasAbilities(player)) {
                const abilities = this.getPlayerAbilities(player);

                // Player chooses which ability to resolve (8.7.4)
                const chosen = await playerChoice(player, abilities);

                // Remove from bag
                this.remove(chosen);

                // Resolve the ability
                await this.resolveOne(chosen, executor, gameState);

                // Note: New triggers added during resolution will be
                // resolved by the current player before moving on (8.7.6)
            }
        }
    }

    /**
     * Resolve a single ability
     */
    private async resolveOne(entry: BagEntry, executor: any, gameState: any): Promise<void> {
        // Construct GameContext
        const context = {
            player: entry.controller,
            card: entry.context.card,
            gameState: gameState,
            eventContext: entry.context,
            abilityName: entry.ability.abilityName
        };

        // Execute each effect in the ability
        for (const effect of entry.ability.effects) {
            if (executor) {
                await executor.execute(effect, context);
            }
        }
    }

    /**
     * Get all abilities (for debugging/display)
     */
    getAll(): BagEntry[] {
        const all: BagEntry[] = [];
        for (const abilities of this.abilitiesByPlayer.values()) {
            all.push(...abilities);
        }
        return all;
    }
}
