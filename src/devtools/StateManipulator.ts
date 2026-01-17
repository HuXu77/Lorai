/**
 * StateManipulator - UI-accessible game state manipulation
 * 
 * Mirrors the TestHarness API for use in the debug UI.
 * Provides methods to add cards to zones, set player state, and serialize/deserialize.
 */

import { CardInstance, ZoneType, CardType } from '../engine/models';
import { TurnManager, Phase } from '../engine/actions';
import { GameStateManager, PlayerState } from '../engine/state';
import { parseToAbilityDefinition } from '../engine/ability-parser';
import { DebugPreset, CardSetup } from './presets';

// Import card database
const allCards = require('../../allCards.json');

// Build card lookup map
const cardMap = new Map<string, any>();
(allCards.cards as any[]).forEach(card => {
    const existing = cardMap.get(card.fullName.toLowerCase());
    if (!existing) {
        cardMap.set(card.fullName.toLowerCase(), card);
    }
    // Also index by short name for convenience
    if (card.name && !cardMap.has(card.name.toLowerCase())) {
        cardMap.set(card.name.toLowerCase(), card);
    }
});

export interface GameEngine {
    turnManager: TurnManager;
    stateManager: GameStateManager;
}

export class StateManipulator {
    private engine: GameEngine;

    constructor(engine: GameEngine) {
        this.engine = engine;
    }

    /**
     * Find a card definition by name (exact or partial match)
     */
    findCard(name: string): any | null {
        const normalized = name.toLowerCase().trim();

        // Try exact match first
        if (cardMap.has(normalized)) {
            return cardMap.get(normalized);
        }

        // Try partial match
        for (const [key, card] of cardMap.entries()) {
            if (key.includes(normalized) || normalized.includes(key)) {
                return card;
            }
        }

        return null;
    }

    /**
     * Search for cards matching a query
     */
    searchCards(query: string, filters?: {
        type?: CardType;
        color?: string;
        maxCost?: number;
        minCost?: number;
    }): any[] {
        const normalized = query.toLowerCase().trim();
        const results: any[] = [];

        for (const card of allCards.cards) {
            // Name match
            const nameMatch = !query ||
                card.fullName.toLowerCase().includes(normalized) ||
                card.name.toLowerCase().includes(normalized);

            if (!nameMatch) continue;

            // Apply filters
            if (filters?.type && card.type !== filters.type) continue;
            if (filters?.color && card.color !== filters.color) continue;
            if (filters?.maxCost !== undefined && card.cost > filters.maxCost) continue;
            if (filters?.minCost !== undefined && card.cost < filters.minCost) continue;

            results.push(card);

            // Limit results
            if (results.length >= 50) break;
        }

        return results;
    }

    /**
     * Create a CardInstance from a card definition
     */
    private createCardInstance(
        cardDef: any,
        playerId: string,
        zone: ZoneType,
        options: { ready?: boolean; damage?: number; turnPlayed?: number } = {}
    ): CardInstance {
        const instance: CardInstance = {
            ...cardDef,
            instanceId: `debug-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
            ownerId: playerId,
            zone: zone,
            ready: options.ready !== undefined ? options.ready : true,
            damage: options.damage || 0,
            turnPlayed: options.turnPlayed !== undefined ? options.turnPlayed : this.engine.stateManager.state.turnCount,
            meta: {},
            baseStrength: cardDef.strength,
            baseWillpower: cardDef.willpower,
            baseLore: cardDef.lore,
            baseCost: cardDef.cost,
            baseKeywords: cardDef.baseKeywords || []
        };

        // Parse abilities
        if (!instance.parsedEffects) {
            try {
                instance.parsedEffects = parseToAbilityDefinition(instance) as any;
            } catch (e) {
                console.warn(`[StateManipulator] Failed to parse abilities for ${cardDef.fullName}:`, e);
                instance.parsedEffects = [];
            }
        }

        return instance;
    }

    /**
     * Add a card to a player's hand
     */
    addToHand(playerId: string, cardName: string): CardInstance | null {
        const cardDef = this.findCard(cardName);
        if (!cardDef) {
            console.error(`[StateManipulator] Card not found: ${cardName}`);
            return null;
        }

        const player = this.engine.stateManager.getPlayer(playerId);
        if (!player) {
            console.error(`[StateManipulator] Player not found: ${playerId}`);
            return null;
        }

        const instance = this.createCardInstance(cardDef, playerId, ZoneType.Hand);
        player.hand.push(instance);

        console.log(`[StateManipulator] Added ${cardDef.fullName} to ${playerId}'s hand`);
        return instance;
    }

    /**
     * Add a card to a player's play area
     */
    addToPlay(
        playerId: string,
        cardName: string,
        options: { ready?: boolean; damage?: number; turnPlayed?: number } = {}
    ): CardInstance | null {
        const cardDef = this.findCard(cardName);
        if (!cardDef) {
            console.error(`[StateManipulator] Card not found: ${cardName}`);
            return null;
        }

        const player = this.engine.stateManager.getPlayer(playerId);
        if (!player) {
            console.error(`[StateManipulator] Player not found: ${playerId}`);
            return null;
        }

        const instance = this.createCardInstance(cardDef, playerId, ZoneType.Play, options);
        player.play.push(instance);

        // Register with ability system
        if ((this.engine.turnManager as any).abilitySystem) {
            (this.engine.turnManager as any).abilitySystem.registerCard(instance);
        }

        console.log(`[StateManipulator] Added ${cardDef.fullName} to ${playerId}'s play area (ready: ${instance.ready})`);
        return instance;
    }

    /**
     * Add a card to a player's inkwell
     */
    addToInkwell(playerId: string, cardName: string): CardInstance | null {
        const cardDef = this.findCard(cardName);
        if (!cardDef) {
            console.error(`[StateManipulator] Card not found: ${cardName}`);
            return null;
        }

        const player = this.engine.stateManager.getPlayer(playerId);
        if (!player) {
            console.error(`[StateManipulator] Player not found: ${playerId}`);
            return null;
        }

        const instance = this.createCardInstance(cardDef, playerId, ZoneType.Inkwell);
        player.inkwell.push(instance);

        console.log(`[StateManipulator] Added ${cardDef.fullName} to ${playerId}'s inkwell`);
        return instance;
    }

    /**
     * Set the top cards of a player's deck
     */
    setDeckTop(playerId: string, cardNames: string[]): boolean {
        const player = this.engine.stateManager.getPlayer(playerId);
        if (!player) {
            console.error(`[StateManipulator] Player not found: ${playerId}`);
            return false;
        }

        // Create card instances for the new top cards
        const newTopCards: CardInstance[] = [];
        for (const name of cardNames) {
            const cardDef = this.findCard(name);
            if (!cardDef) {
                console.error(`[StateManipulator] Card not found: ${name}`);
                continue;
            }
            newTopCards.push(this.createCardInstance(cardDef, playerId, ZoneType.Deck));
        }

        // Prepend to deck (top of deck is index 0)
        player.deck = [...newTopCards, ...player.deck];

        console.log(`[StateManipulator] Set ${newTopCards.length} cards on top of ${playerId}'s deck`);
        return true;
    }

    /**
     * Set a player's lore value
     */
    setLore(playerId: string, amount: number): boolean {
        const player = this.engine.stateManager.getPlayer(playerId);
        if (!player) {
            console.error(`[StateManipulator] Player not found: ${playerId}`);
            return false;
        }

        player.lore = Math.max(0, amount);
        console.log(`[StateManipulator] Set ${playerId}'s lore to ${amount}`);
        return true;
    }

    /**
     * Set damage on a specific card
     */
    setDamage(cardInstanceId: string, amount: number): boolean {
        // Search all players' play areas
        for (const player of Object.values(this.engine.stateManager.state.players)) {
            const card = (player as PlayerState).play.find(c => c.instanceId === cardInstanceId);
            if (card) {
                card.damage = Math.max(0, amount);
                console.log(`[StateManipulator] Set damage on ${card.fullName} to ${amount}`);
                return true;
            }
        }

        console.error(`[StateManipulator] Card not found in play: ${cardInstanceId}`);
        return false;
    }

    /**
     * Set the ready state of a specific card
     */
    setReady(cardInstanceId: string, ready: boolean): boolean {
        for (const player of Object.values(this.engine.stateManager.state.players)) {
            const card = (player as PlayerState).play.find(c => c.instanceId === cardInstanceId);
            if (card) {
                card.ready = ready;
                console.log(`[StateManipulator] Set ${card.fullName} ready: ${ready}`);
                return true;
            }
        }

        console.error(`[StateManipulator] Card not found in play: ${cardInstanceId}`);
        return false;
    }

    /**
     * Set the drying status of a specific card
     */
    setDrying(cardInstanceId: string, isDrying: boolean): boolean {
        for (const player of Object.values(this.engine.stateManager.state.players)) {
            const card = (player as PlayerState).play.find(c => c.instanceId === cardInstanceId);
            if (card) {
                const currentTurn = this.engine.stateManager.state.turnCount;
                if (isDrying) {
                    card.turnPlayed = currentTurn;
                } else {
                    card.turnPlayed = Math.max(0, currentTurn - 1);
                }
                console.log(`[StateManipulator] Set ${card.fullName} drying: ${isDrying}`);
                return true;
            }
        }

        console.error(`[StateManipulator] Card not found in play: ${cardInstanceId}`);
        return false;
    }

    /**
     * Switch the active turn to a player
     */
    setTurn(playerId: string): boolean {
        const player = this.engine.stateManager.getPlayer(playerId);
        if (!player) {
            console.error(`[StateManipulator] Player not found: ${playerId}`);
            return false;
        }

        this.engine.stateManager.state.turnPlayerId = playerId;
        console.log(`[StateManipulator] Set turn to ${playerId}`);
        return true;
    }

    /**
     * Clear all cards from a player's zone
     */
    clearZone(playerId: string, zone: ZoneType): boolean {
        const player = this.engine.stateManager.getPlayer(playerId);
        if (!player) {
            console.error(`[StateManipulator] Player not found: ${playerId}`);
            return false;
        }

        switch (zone) {
            case ZoneType.Hand:
                player.hand = [];
                break;
            case ZoneType.Play:
                player.play = [];
                break;
            case ZoneType.Inkwell:
                player.inkwell = [];
                break;
            case ZoneType.Deck:
                player.deck = [];
                break;
            case ZoneType.Discard:
                player.discard = [];
                break;
            default:
                return false;
        }

        console.log(`[StateManipulator] Cleared ${playerId}'s ${zone}`);
        return true;
    }

    /**
     * Export current game state as JSON
     */
    exportState(): string {
        return this.engine.stateManager.serialize();
    }

    /**
     * Import game state from JSON
     */
    importState(json: string): boolean {
        try {
            const newManager = GameStateManager.deserialize(json);

            // Copy state to current manager
            this.engine.stateManager.state = newManager.state;

            // Re-register all cards with ability system
            if ((this.engine.turnManager as any).abilitySystem) {
                const abilitySystem = (this.engine.turnManager as any).abilitySystem;
                for (const player of Object.values(this.engine.stateManager.state.players)) {
                    for (const card of (player as PlayerState).play) {
                        abilitySystem.registerCard(card);
                    }
                }
            }

            console.log('[StateManipulator] State imported successfully');
            return true;
        } catch (e) {
            console.error('[StateManipulator] Failed to import state:', e);
            return false;
        }
    }

    /**
     * Load a debug preset
     */
    loadPreset(preset: DebugPreset): boolean {
        console.log(`[StateManipulator] Loading preset: ${preset.name}`);

        try {
            // Clear current state
            for (const playerId of Object.keys(this.engine.stateManager.state.players)) {
                this.clearZone(playerId, ZoneType.Hand);
                this.clearZone(playerId, ZoneType.Play);
                this.clearZone(playerId, ZoneType.Inkwell);
            }

            // Helper to process card setup
            const processCardSetup = (
                playerId: string,
                cards: (string | CardSetup)[],
                zone: 'hand' | 'play' | 'inkwell' | 'deck'
            ) => {
                if (!cards) return;
                for (const card of cards) {
                    const name = typeof card === 'string' ? card : card.name;
                    const options = typeof card === 'string' ? {} : {
                        ready: card.exerted === true ? false : (card.ready ?? true),
                        damage: card.damage ?? 0,
                        turnPlayed: card.turnPlayed
                    };

                    switch (zone) {
                        case 'hand':
                            this.addToHand(playerId, name);
                            break;
                        case 'play':
                            this.addToPlay(playerId, name, options);
                            break;
                        case 'inkwell':
                            this.addToInkwell(playerId, name);
                            break;
                        case 'deck':
                            this.setDeckTop(playerId, [name]);
                            break;
                    }
                }
            };

            // Set up player 1
            if (preset.setup.player1) {
                processCardSetup('player1', preset.setup.player1.hand, 'hand');
                processCardSetup('player1', preset.setup.player1.play, 'play');
                processCardSetup('player1', preset.setup.player1.inkwell, 'inkwell');
                if (preset.setup.player1.deck) {
                    processCardSetup('player1', preset.setup.player1.deck, 'deck');
                }
                if (preset.setup.player1.lore !== undefined) {
                    this.setLore('player1', preset.setup.player1.lore);
                }
            }

            // Set up player 2
            if (preset.setup.player2) {
                processCardSetup('player2', preset.setup.player2.hand, 'hand');
                processCardSetup('player2', preset.setup.player2.play, 'play');
                processCardSetup('player2', preset.setup.player2.inkwell, 'inkwell');
                if (preset.setup.player2.deck) {
                    processCardSetup('player2', preset.setup.player2.deck, 'deck');
                }
                if (preset.setup.player2.lore !== undefined) {
                    this.setLore('player2', preset.setup.player2.lore);
                }
            }

            // Set active turn
            this.setTurn(preset.setup.turnPlayer);

            // Set phase to Main to allow actions
            this.engine.stateManager.state.phase = Phase.Main;

            // Set turn number if specified
            if (preset.setup.turnNumber) {
                this.engine.stateManager.state.turnCount = preset.setup.turnNumber;
            }

            console.log(`[StateManipulator] Preset "${preset.name}" loaded successfully`);
            return true;
        } catch (e) {
            console.error(`[StateManipulator] Failed to load preset:`, e);
            return false;
        }
    }

    /**
     * Get all available cards for the card picker
     */
    getAllCards(): any[] {
        return allCards.cards;
    }
    /**
     * Force a challenge between two cards
     */
    async challenge(attackerId: string, defenderId: string): Promise<boolean> {
        // Find attacker and owner
        let attacker: CardInstance | undefined;
        let attackerPlayer: PlayerState | undefined;
        let defender: CardInstance | undefined;

        for (const player of Object.values(this.engine.stateManager.state.players)) {
            const card = (player as PlayerState).play.find(c => c.instanceId === attackerId);
            if (card) {
                attacker = card;
                attackerPlayer = player as PlayerState;
                break;
            }
        }

        for (const player of Object.values(this.engine.stateManager.state.players)) {
            const card = (player as PlayerState).play.find(c => c.instanceId === defenderId);
            if (card) {
                defender = card;
                break;
            }
        }

        if (!attacker || !defender || !attackerPlayer) {
            console.error('[StateManipulator] Could not find attacker or defender');
            return false;
        }

        console.log(`[StateManipulator] Forcing challenge: ${attacker.name} -> ${defender.name}`);
        return await this.engine.turnManager.challenge(attackerPlayer, attacker.instanceId, defender.instanceId);
    }
}
