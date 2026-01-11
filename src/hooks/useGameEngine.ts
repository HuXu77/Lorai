'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { GameState, ChoiceRequest } from '../engine/models';
import { TurnManager, Phase } from '../engine/actions';
import { GameStateManager } from '../engine/state';
import { HumanController } from '../controllers/HumanController';
import { HeuristicBot } from '../ai/heuristic-bot';
import { parseToAbilityDefinition } from '../engine/ability-parser';
import { LogEntry, LogCategory } from '../types/log';
import { starterDeck1 as deck1Data, starterDeck2 as deck2Data } from '../decks/starter-decks';

// Import card definitions
const allCards = require('../../allCards.json');

/**
 * Game engine state and controllers
 */
export interface GameEngine {
    turnManager: TurnManager;
    stateManager: GameStateManager;
    humanController: HumanController;
    botController: HeuristicBot;
}

/**
 * Options for game initialization
 */
export interface GameOptions {
    isTestMode?: boolean;
    isDebugMode?: boolean;
    forcedStartingHand?: string[];
    onLog?: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
    onChoice?: (choice: ChoiceRequest) => void;
    onRevealOpponentHand?: (reveal: boolean) => void;
}

/**
 * Return type for useGameEngine hook
 */
export interface UseGameEngineReturn {
    // State
    engine: GameEngine | null;
    engineState: GameState | null;
    isInitialized: boolean;
    mulliganOpen: boolean;

    // Derived state
    yourPlayer: any | null;
    opponent: any | null;
    isYourTurn: boolean;

    // Actions
    initializeGame: (deck1Names?: string[], deck2Names?: string[]) => void;
    handleMulligan: (selectedIds: string[]) => void;

    // Refs for animations
    deckRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Custom hook to manage game engine initialization and state
 * Extracts ~400 lines of logic from page.tsx
 */
export function useGameEngine(options: GameOptions): UseGameEngineReturn {
    const {
        isTestMode = false,
        isDebugMode = false,
        forcedStartingHand = [],
        onLog,
        onChoice,
        onRevealOpponentHand,
    } = options;

    // Engine state
    const [engine, setEngine] = useState<GameEngine | null>(null);
    const [engineState, setEngineState] = useState<GameState | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [mulliganOpen, setMulliganOpen] = useState(false);

    // Refs
    const initRef = useRef(false);
    const deckRef = useRef<HTMLDivElement>(null);

    /**
     * Add log entry helper
     */
    const addLog = useCallback((entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
        onLog?.(entry);
    }, [onLog]);

    /**
     * Initialize the game engine with decks
     */
    const initializeGame = useCallback((deck1Names?: string[], deck2Names?: string[]) => {
        if (initRef.current) {
            console.log('[useGameEngine] Already initialized, skipping');
            return;
        }
        initRef.current = true;
        setIsInitialized(true);

        console.log('[useGameEngine] Initializing game engine...');

        try {
            // Create state manager
            const stateManager = new GameStateManager();

            // Create browser-compatible logger
            const browserLogger = {
                info: (msg: string, data?: any) => {
                    console.log('[INFO]', msg, data);

                    // Handle opponent hand reveal
                    if (msg.includes('reveals hand:')) {
                        const isOpponent = msg.toLowerCase().includes('bot') ||
                            msg.toLowerCase().includes('player 2');
                        if (isOpponent) {
                            onRevealOpponentHand?.(true);
                            setTimeout(() => onRevealOpponentHand?.(false), 4000);
                        }
                    }
                },
                action: (player: string, action: string, details?: any) => {
                    console.log('[ACTION]', `${player} ${action}`, details);

                    let category = LogCategory.SYSTEM;
                    const actionLower = action.toLowerCase();

                    if (actionLower.includes('challenge')) category = LogCategory.COMBAT;
                    else if (actionLower.includes('quest') || actionLower.includes('lore')) category = LogCategory.LORE;
                    else if (actionLower.includes('played') || actionLower.includes('ink')) category = LogCategory.CARD;
                    else if (actionLower.includes('ability')) category = LogCategory.ABILITY;

                    addLog({ category, message: `${player} ${action}`, details });
                },
                effect: (source: string, effect: string, target?: string) =>
                    console.log('[EFFECT]', `${source} -> ${effect}${target ? ' on ' + target : ''}`),
                debug: (msg: string, data?: any) => console.log('[DEBUG]', msg, data),
                warn: (msg: string, data?: any) => console.warn('[WARN]', msg, data),
                error: (msg: string, data?: any) => console.error('[ERROR]', msg, data),
                getLogs: () => []
            };

            // Create turn manager
            const turnManager = new TurnManager(stateManager, browserLogger as any);

            // Create human controller with state enrichment
            const humanController = new HumanController(
                'You',
                (newState) => {
                    // Enrich state with effective stats for UI
                    if (turnManager?.abilitySystem) {
                        Object.values(newState.players).forEach((player: any) => {
                            player.play.forEach((card: any) => {
                                card.lore = turnManager.abilitySystem.getModifiedStat(card, 'lore');
                                card.strength = turnManager.abilitySystem.getModifiedStat(card, 'strength');
                                card.willpower = turnManager.abilitySystem.getModifiedStat(card, 'willpower');

                                if (typeof turnManager.abilitySystem.getModifiedKeywords === 'function') {
                                    card.keywords = turnManager.abilitySystem.getModifiedKeywords(card, player);
                                }
                                if (typeof turnManager.abilitySystem.getModifiedResist === 'function') {
                                    const resist = turnManager.abilitySystem.getModifiedResist(card, player);
                                    if (!card.meta) card.meta = {};
                                    if (resist > 0) {
                                        card.meta.resist = resist;
                                    } else {
                                        delete card.meta.resist;
                                    }
                                }
                            });
                            player.hand.forEach((card: any) => {
                                if (card.baseCost === undefined) {
                                    card.baseCost = card.cost;
                                } else {
                                    card.cost = card.baseCost;
                                }
                                card.cost = turnManager.abilitySystem.getModifiedCost(card, player);
                            });
                        });
                    }
                    setEngineState(newState);
                }
            );

            // Set up callbacks
            humanController.setLogCallback((category, message, details) => {
                addLog({ category: category as any, message, details });
            });
            humanController.setChoiceCallback((choice) => {
                console.log('[useGameEngine] Choice request:', choice);
                if (choice) {
                    onChoice?.(choice);
                }
            });

            // Create bot controller
            const botController = new HeuristicBot(turnManager);

            // Add players
            const player1Id = stateManager.addPlayer('player1', 'You');
            const player2Id = stateManager.addPlayer('player2', 'Bot');
            const player1 = stateManager.getPlayer(player1Id);
            const player2 = stateManager.getPlayer(player2Id);

            // Load decks
            const cardMap = new Map<string, any>();
            (allCards.cards as any[]).forEach(card => {
                const existing = cardMap.get(card.fullName.toLowerCase());
                if (!existing) {
                    cardMap.set(card.fullName.toLowerCase(), card);
                }
            });

            const loadDeck = (cardNames: any[], deckName: string) => {
                return cardNames.map((item, index) => {
                    const name = typeof item === 'string' ? item : (item.fullName || item.name);
                    const normalizedName = name.trim().toLowerCase().replace(/\s+/g, ' ');
                    const card = cardMap.get(normalizedName);

                    if (!card) {
                        console.error(`[DeckLoad] Card not found: "${name}"`);
                        return null;
                    }

                    const copiedCard = JSON.parse(JSON.stringify(card));
                    if (!copiedCard.ink && copiedCard.color) {
                        copiedCard.ink = copiedCard.color;
                    }

                    try {
                        copiedCard.parsedEffects = parseToAbilityDefinition(copiedCard);
                    } catch (e) {
                        copiedCard.parsedEffects = [];
                    }

                    return copiedCard;
                }).filter(c => c !== null);
            };

            const deck1Cards = loadDeck(deck1Names || deck1Data.cards, 'Deck1');
            const deck2Cards = loadDeck(deck2Names || deck2Data.cards, 'Deck2');

            // Add cards to decks
            deck1Cards.forEach(card => player1.addCardToZone(card, 'Deck' as any));
            deck2Cards.forEach(card => player2.addCardToZone(card, 'Deck' as any));

            // Shuffle
            player1.deck.sort(() => Math.random() - 0.5);
            player2.deck.sort(() => Math.random() - 0.5);

            // Register choice handlers
            turnManager.registerChoiceHandler(player1Id, async (request) => {
                return await humanController.respondToChoiceRequestAsync(request);
            });
            turnManager.registerChoiceHandler(player2Id, (request) =>
                botController.respondToChoiceRequest(request)
            );

            // Initialize controllers
            humanController.onGameStart(player1Id, stateManager.state);
            botController.onGameStart(player2Id, stateManager.state);

            // Draw starting hands
            turnManager.drawStartingHand(player1);
            turnManager.drawStartingHand(player2);

            // Store engine
            setEngine({ turnManager, stateManager, humanController, botController });
            setEngineState({ ...stateManager.state });
            setMulliganOpen(true);

            console.log('[useGameEngine] Engine initialized, awaiting mulligan');

        } catch (error) {
            console.error('[useGameEngine] Failed to initialize:', error);
            addLog({
                category: LogCategory.SYSTEM,
                message: `Failed to start game: ${error}`,
                details: {}
            });
        }
    }, [addLog, onChoice, onRevealOpponentHand]);

    /**
     * Handle mulligan selection
     */
    const handleMulligan = useCallback((selectedIds: string[]) => {
        if (!engine) return;
        const { turnManager, stateManager, botController } = engine;

        console.log('[useGameEngine] Processing mulligan...');

        // Player mulligan
        const player1 = stateManager.getPlayer('player1');
        turnManager.mulligan(player1, selectedIds);

        // Bot mulligan
        const player2 = stateManager.getPlayer('player2');
        const botMulliganIds = botController.decideMulligan(player2.hand);
        turnManager.mulligan(player2, botMulliganIds);

        // Start game
        turnManager.startGame('player1');

        // Apply forced starting hand (for testing)
        if (forcedStartingHand.length > 0) {
            console.log('[useGameEngine] Adding forced cards:', forcedStartingHand);
            forcedStartingHand.forEach(cardName => {
                const normalizedName = cardName.toLowerCase().trim();
                const inHand = player1.hand.some(c =>
                    c.fullName?.toLowerCase() === normalizedName ||
                    c.name?.toLowerCase() === normalizedName
                );
                if (inHand) return;

                const idx = player1.deck.findIndex(c =>
                    c.fullName?.toLowerCase() === normalizedName ||
                    c.name?.toLowerCase() === normalizedName
                );
                if (idx !== -1) {
                    const card = player1.deck.splice(idx, 1)[0];
                    card.zone = 'Hand' as any;
                    player1.hand.push(card);
                }
            });
        }

        // Update state
        setEngineState({ ...stateManager.state });
        setMulliganOpen(false);

        addLog({
            category: LogCategory.SYSTEM,
            message: 'Game started! You vs Bot',
            details: {}
        });
    }, [engine, forcedStartingHand, addLog]);

    // Derived state
    const yourPlayer = engineState && engine
        ? engineState.players[engine.humanController.id]
        : null;
    const opponentId = engineState && engine
        ? Object.keys(engineState.players).find(id => id !== engine.humanController.id)
        : null;
    const opponent = opponentId && engineState
        ? engineState.players[opponentId]
        : null;
    const isYourTurn = engineState && engine
        ? engineState.turnPlayerId === engine.humanController.id
        : true;

    return {
        engine,
        engineState,
        isInitialized,
        mulliganOpen,
        yourPlayer,
        opponent,
        isYourTurn,
        initializeGame,
        handleMulligan,
        deckRef,
    };
}
