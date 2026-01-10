'use client'

import { useState, useEffect, useRef, Suspense, useMemo, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Card from '../../components/Card'
import PlayerHand from '../../components/PlayerHand'
import PlayArea from '../../components/PlayArea'
import { GameStatePanel } from '../../components/GameStatePanel'
import InkPile from '../../components/InkPile'
import DiscardPile from '../../components/DiscardPile'
import DiscardPileModal from '../../components/DiscardPileModal'
import PlayerChoiceHandler from '../../components/PlayerChoiceHandler'
import GameLog from '../../components/GameLog'
import TurnFlow from '../../components/TurnFlow'
import DeckImportModal from '../../components/DeckImportModal'
import { MulliganModal } from '../../components/MulliganModal'
import CardActionMenu from '../../components/CardActionMenu'
import PlayAreaActionMenu from '../../components/PlayAreaActionMenu'
import GameZone from '../../components/GameZone'
import ActiveEffectsPanel from '../../components/ActiveEffectsPanel'
import { AnimationDemo, LoreGainEffect, StatChangeEffect, DrawAnimation, ChallengeEffect } from '../../components/animations'
import VictoryOverlay from '../../components/VictoryOverlay'
import { DebugPanel } from '../../components/DebugPanel'
import { CardInstance, ZoneType, ChoiceRequest, ChoiceResponse, ChoiceType, GameState } from '../../engine/models'
import { LogEntry, LogCategory } from '../../types/log'
import { TurnPhase } from '../../types/turn'
import { TurnManager, Phase, ActionType } from '../../engine/actions'
import { parseToAbilityDefinition } from '../../engine/ability-parser'
import { GameStateManager } from '../../engine/state'
import { HumanController } from '../../controllers/HumanController'
import { SimpleBot } from '../../controllers/SimpleBot'
import { HeuristicBot } from '../../ai/heuristic-bot'
import { starterDeck1 as deck1Data, starterDeck2 as deck2Data } from '../../decks/starter-decks'

// Import card definitions
const allCards = require('../../../allCards.json');

// Mock data for testing the UI - using real card data for images
const mockCard: CardInstance = {
    instanceId: '1',
    id: 23,
    number: 23,
    setCode: '1',
    fullName: 'Stitch - Rock Star',
    name: 'Stitch',
    version: 'Rock Star',
    cost: 6,
    type: 'Character',
    color: 'Amber',
    inkwell: true,
    subtypes: ['Floodborn', 'Hero', 'Alien'],
    strength: 3,
    willpower: 5,
    lore: 3,
    damage: 0,
    ready: true,
    ownerId: 'player1',
    zone: 'Play',
    turnPlayed: 0,
    meta: {},
    abilities: [{
        type: 'triggered',
        fullText: 'ADORING FANS Whenever you play a character with cost 2 or less, you may exert them to draw a card.',
        effect: 'draw',
        name: 'ADORING FANS'
    }]
} as CardInstance

const mockHand: CardInstance[] = [
    { ...mockCard, instanceId: '2', id: 3, number: 3, setCode: '1', name: 'Cinderella', fullName: 'Cinderella - Gentle and Kind', cost: 4, lore: 2 },
    { ...mockCard, instanceId: '3', id: 88, number: 88, setCode: '1', name: 'Mickey Mouse', fullName: 'Mickey Mouse - Brave Little Tailor', cost: 5, lore: 3 },
    { ...mockCard, instanceId: '4', id: 116, number: 116, setCode: '1', name: 'Moana', fullName: 'Moana - Of Motunui', cost: 5, lore: 2 },
    { ...mockCard, instanceId: '5', id: 2, number: 2, setCode: '1', name: 'Ariel', fullName: 'Ariel - Spectacular Singer', cost: 3, strength: 2, willpower: 3, lore: 1 },
] as CardInstance[]

const mockInk: CardInstance[] = [
    { ...mockCard, instanceId: 'ink1', zone: ZoneType.Inkwell },
    { ...mockCard, instanceId: 'ink2', zone: ZoneType.Inkwell },
    { ...mockCard, instanceId: 'ink3', zone: ZoneType.Inkwell },
]

// Mock discard piles
const mockPlayerDiscard: CardInstance[] = [
    { ...mockCard, instanceId: 'discard1', id: 45, number: 45, setCode: '1', name: 'Elsa', fullName: 'Elsa - Ice Surfer', zone: ZoneType.Discard },
    { ...mockCard, instanceId: 'discard2', id: 72, number: 72, setCode: '1', name: 'Jasmine', fullName: 'Jasmine - Queen of Agrabah', zone: ZoneType.Discard },
    { ...mockCard, instanceId: 'discard3', id: 101, number: 101, setCode: '1', name: 'Maleficent', fullName: 'Maleficent - Monstrous Dragon', zone: ZoneType.Discard },
    { ...mockCard, instanceId: 'discard4', id: 36, number: 36, setCode: '1', name: 'Donald Duck', fullName: 'Donald Duck - Boisterous Fowl', zone: ZoneType.Discard },
]

const mockOpponentDiscard: CardInstance[] = [
    { ...mockCard, instanceId: 'opp-discard1', id: 15, number: 15, setCode: '1', name: 'Belle', fullName: 'Belle - Strange but Special', zone: ZoneType.Discard },
    { ...mockCard, instanceId: 'opp-discard2', id: 89, number: 89, setCode: '1', name: 'Aladdin', fullName: 'Aladdin - Heroic Outlaw', zone: ZoneType.Discard },
]

// Mock zones - empty by default to demonstrate conditional rendering
const mockPlayerLocations: CardInstance[] = []
const mockPlayerItems: CardInstance[] = []
const mockOpponentLocations: CardInstance[] = []
const mockOpponentItems: CardInstance[] = []

// Inner component that uses useSearchParams (must be wrapped in Suspense)
function GamePageInner() {
    // Parse URL parameters for test mode
    const searchParams = useSearchParams()
    // Parse startingHand parameter for testing specific card scenarios
    // Format: comma-separated card full names (e.g., startingHand=Lady - Elegant Spaniel,Tramp - Enterprising Dog)
    const startingHandParam = searchParams.get('startingHand')

    const isTestMode = searchParams.get('test') === 'true' || !!startingHandParam
    const autoMulligan = searchParams.get('autoMulligan') === 'true' || !!startingHandParam
    const isDebugMode = searchParams.get('debug') === 'true'
    const forcedStartingHand = startingHandParam
        ? startingHandParam.split(',').map(s => s.trim())
        : []

    const [selectedCard, setSelectedCard] = useState<CardInstance | null>(null)
    // Backend will control this via GameState - this is just for testing
    const [opponentHandRevealed, setOpponentHandRevealed] = useState(false)
    const [playerDiscardModalOpen, setPlayerDiscardModalOpen] = useState(false)
    const [opponentDiscardModalOpen, setOpponentDiscardModalOpen] = useState(false)
    const [currentChoice, setCurrentChoice] = useState<ChoiceRequest | null>(null)
    const [logEntries, setLogEntries] = useState<LogEntry[]>([])
    const [logOpen, setLogOpen] = useState(false)
    const [currentTurn, setCurrentTurn] = useState(1)
    const [currentPhase, setCurrentPhase] = useState<TurnPhase>(TurnPhase.MAIN)
    const [activePlayer, setActivePlayer] = useState<'player' | 'opponent'>('player')
    const [availableInk, setAvailableInk] = useState(isTestMode ? 50 : 0)

    // Engine state
    const [gameEngine, setGameEngine] = useState<{
        turnManager: TurnManager;
        stateManager: GameStateManager;
        humanController: HumanController;
        botController: HeuristicBot;
    } | null>(null)
    const [engineState, setEngineState] = useState<GameState | null>(null)
    const [gameInitialized, setGameInitialized] = useState(false)
    const gameInitializedRef = useRef(false) // Synchronous guard for race condition
    // In test mode, don't show deck import modal - we'll auto-load default decks
    const [deckImportModalOpen, setDeckImportModalOpen] = useState(!isTestMode && !isDebugMode)
    const [mulliganOpen, setMulliganOpen] = useState(false)
    const [actionMenuCard, setActionMenuCard] = useState<CardInstance | null>(null)
    const [showAnimationDemo, setShowAnimationDemo] = useState(false)
    const [victoryDismissed, setVictoryDismissed] = useState(false)
    const botIsActingRef = useRef(false) // Prevent duplicate bot actions
    const [playAreaMenuCard, setPlayAreaMenuCard] = useState<CardInstance | null>(null) // For quest/challenge menu
    const [playAreaMenuCardPosition, setPlayAreaMenuCardPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 }) // Track card position for animations
    const [loreAnimation, setLoreAnimation] = useState<{ show: boolean; amount: number; position: { x: number; y: number }; key: number }>({ show: false, amount: 0, position: { x: 0, y: 0 }, key: 0 })
    const [statAnimation, setStatAnimation] = useState<{ show: boolean; amount: number; statType: 'strength' | 'willpower' | 'lore'; position: { x: number; y: number } }>({ show: false, amount: 0, statType: 'strength', position: { x: 0, y: 0 } })
    const [challengeAnimation, setChallengeAnimation] = useState<{ show: boolean; attackerPos: { x: number; y: number }; defenderPos: { x: number; y: number }; attackerDamage: number; defenderDamage: number }>({ show: false, attackerPos: { x: 0, y: 0 }, defenderPos: { x: 0, y: 0 }, attackerDamage: 0, defenderDamage: 0 })

    // Draw animation state
    const [drawAnim, setDrawAnim] = useState<{ active: boolean; from?: DOMRect; to?: DOMRect }>({ active: false });
    const lastHandSize = useRef<number>(0);
    const deckRef = useRef<HTMLDivElement>(null);
    const handRef = useRef<HTMLDivElement>(null);






    // Subscribe to engine logger
    useEffect(() => {
        if (!gameEngine || !gameEngine.turnManager.logger.subscribe) return;

        const unsubscribe = gameEngine.turnManager.logger.subscribe((entry) => {
            setLogEntries(prev => [entry, ...prev]);
        });

        return () => {
            try {
                unsubscribe();
            } catch (e) {
                console.error("Failed to unsubscribe logger", e);
            }
        };
    }, [gameEngine]);

    // Mock player data for choices
    const mockPlayer = { id: 'player1', name: 'You' } as any;

    // Add log entry helper
    const addLogEntry = (entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
        setLogEntries(prev => [{
            ...entry,
            id: `log-${Date.now()}-${Math.random()}`,
            timestamp: Date.now()
        }, ...prev]);
    };

    // Check if card can be played

    // Check if card can be played
    const canPlayCard = (card: CardInstance) => {
        if (activePlayer !== 'player') {
            return { canPlay: false, reason: "Not your turn" };
        }

        if (currentPhase !== TurnPhase.MAIN) {
            return { canPlay: false, reason: "Wait for Main phase" };
        }

        // Get modified cost (accounts for cost reduction abilities like Tramp/Lady synergy)
        const modifiedCost = gameEngine
            ? gameEngine.turnManager.abilitySystem.getModifiedCost(card, yourPlayer)
            : card.cost;

        if (modifiedCost > availableInk) {
            return { canPlay: false, reason: `Need ${modifiedCost}◆` };
        }

        return { canPlay: true, modifiedCost };
    };

    // Handle playing a card
    const handlePlayCard = (card: CardInstance) => {
        const { canPlay, reason } = canPlayCard(card);

        if (!canPlay) {
            addLogEntry({
                category: LogCategory.SYSTEM,
                message: `Cannot play ${card.name}: ${reason}`,
                details: { card }
            });
            return;
        }

        // Deduct ink
        setAvailableInk(prev => prev - card.cost);

        // Note: Logging is handled by the engine integration

        // TODO: Actually move card to play area when we have mutable state
        console.log('Card played:', card);
    };

    // Handle inking a card from the action menu
    const handleInkCardAction = () => {
        if (!gameEngine || !actionMenuCard || !engineState) return;
        setActionMenuCard(null); // Dismiss menu first

        const player = engineState.players[gameEngine.humanController.id];
        if (!player) return;

        const success = gameEngine.turnManager.inkCard(player as any, actionMenuCard.instanceId);
        if (success) {
            // Note: Logging is handled by engine
            gameEngine.humanController.updateState(gameEngine.stateManager.state);
        } else {
            addLogEntry({
                category: LogCategory.SYSTEM,
                message: `Failed to ink ${actionMenuCard.name}`,
                details: {}
            });
        }
    };

    // Handle generic ability use
    const handleUseAbility = (abilityIndex: number) => {
        if (!gameEngine || !playAreaMenuCard || !engineState) return;
        setPlayAreaMenuCard(null); // Dismiss menu first

        try {
            const player = gameEngine.stateManager.getPlayer(gameEngine.humanController.id);
            gameEngine.turnManager.useAbility(player, playAreaMenuCard.instanceId, abilityIndex);

            // Note: Logging is handled by engine
            setEngineState({ ...gameEngine.stateManager.state });
        } catch (error) {
            console.error('Ability use failed:', error);
            addLogEntry({
                category: LogCategory.SYSTEM,
                message: `Failed to use ability: ${error}`,
                details: { error }
            });
        }
    };

    // Handle playing a card from the action menu
    const handlePlayCardAction = async () => {
        if (!gameEngine || !actionMenuCard || !engineState) return;

        // Cache card info before clearing state
        const cardToPlay = actionMenuCard;
        setActionMenuCard(null); // Dismiss menu BEFORE async call

        const player = engineState.players[gameEngine.humanController.id];
        if (!player) return;

        try {
            await gameEngine.turnManager.playCard(player as any, cardToPlay.instanceId);
            // Note: Logging is handled by engine
            gameEngine.humanController.updateState(gameEngine.stateManager.state);
        } catch (error) {
            addLogEntry({
                category: LogCategory.SYSTEM,
                message: `Failed to play ${cardToPlay.name}: ${error}`,
                details: {}
            });
        }
    };

    // Initialize game engine
    const initializeGame = (deck1Names?: string[], deck2Names?: string[]) => {
        // Use ref for SYNCHRONOUS guard - state updates are async and cause race conditions
        if (gameInitializedRef.current) {
            console.log('[GamePage] Already initialized, skipping duplicate call');
            return;
        }
        gameInitializedRef.current = true; // This is SYNCHRONOUS, prevents race condition

        setGameInitialized(true);
        setDeckImportModalOpen(false);

        console.log('[GamePage] Initializing game engine...');
        console.log('[GamePage] Deck1 passed:', deck1Names?.slice(0, 3));
        console.log('[GamePage] Deck2 passed:', deck2Names?.slice(0, 3));

        try {
            // Create game state manager
            const stateManager = new GameStateManager();

            // Create human controller
            // Create browser-compatible logger (GameLogger uses fs which doesn't work in browser)
            const browserLogger = {
                info: (msg: string, data?: any) => {
                    console.log('[INFO]', msg, data);

                    if (msg.includes('reveals hand:')) {
                        const lowerMsg = msg.toLowerCase();
                        const isOpponent = lowerMsg.includes('bot') || lowerMsg.includes('player 2') || lowerMsg.includes('player2');

                        if (isOpponent) {
                            console.log('[GamePage] Auto-revealing opponent hand via log interception');
                            setOpponentHandRevealed(true);

                            // Auto-hide after 4 seconds
                            setTimeout(() => {
                                setOpponentHandRevealed(false);
                            }, 4000);
                        }
                    }
                },
                action: (player: string, action: string, details?: any) => {
                    console.log('[ACTION]', `${player} ${action}`, details);

                    // Default styling
                    let category = LogCategory.SYSTEM;
                    const actionLower = action.toLowerCase();

                    if (actionLower.includes('challenge') || actionLower.includes('combat')) category = LogCategory.COMBAT;
                    else if (actionLower.includes('quest') || actionLower.includes('lore')) category = LogCategory.LORE;
                    else if (actionLower.includes('played') || actionLower.includes('plays')) category = LogCategory.CARD;
                    else if (actionLower.includes('ink')) category = LogCategory.CARD;
                    else if (actionLower.includes('activate') || actionLower.includes('ability')) category = LogCategory.ABILITY;

                    if (typeof details === 'object' && details?.type) {
                        if (details.type.includes('challenge') || details.type.includes('combat')) category = LogCategory.COMBAT;
                        else if (details.type.includes('quest') || details.type.includes('lore')) category = LogCategory.LORE;
                        else if (details.type === 'shift') category = LogCategory.CARD;
                        else if (details.type === 'ink') category = LogCategory.CARD;
                        else if (details.type === 'play') category = LogCategory.CARD;
                        else if (details.type === 'ability') category = LogCategory.ABILITY;
                    }

                    // --- ACTION MESSAGE ENHANCEMENT ---
                    // Helper to verify/resolve card name
                    const getCardName = (obj: any, id?: string): string | undefined => {
                        if (obj) return obj.fullName || obj.name;
                        // In page.tsx we have access to stateManager via closure, but strictly we should check engineState 
                        // However, simpler is to trust details if present, or search simplified mock arrays? 
                        // Actually, we can access stateManager variable captured in closure!
                        if (id && stateManager) {
                            const p1 = stateManager.getPlayer('player1');
                            const p2 = stateManager.getPlayer('player2');
                            // Simple search
                            const all = [...p1.hand, ...p1.play, ...p1.discard, ...p1.inkwell,
                            ...p2.hand, ...p2.play, ...p2.discard, ...p2.inkwell];
                            const c = all.find(x => x.instanceId === id);
                            if (c) return c.fullName || c.name;
                        }
                        return undefined;
                    };

                    // 1. Challenge
                    if (details?.type === 'challenge_start' || details?.type === 'challenge' || actionLower.includes('challenge')) {
                        const attackerName = getCardName(details?.attacker || details?.card, details?.attackerId || details?.cardId) || 'Unknown Card';
                        const targetName = getCardName(details?.defender || details?.target, details?.defenderId || details?.targetId) || 'Unknown Target';
                        action = `challenged **${targetName}** with **${attackerName}**`;
                    }
                    // 2. Play Card
                    else if (details?.type === 'play' || action === 'PlayCard' || action === 'playCard') {
                        const cardName = getCardName(details?.card, details?.cardId) || 'Unknown Card';
                        action = `played **${cardName}**`;
                    }
                    // 3. Quest
                    else if (details?.type === 'quest' || action === 'Quest' || action === 'quest') {
                        const cardName = getCardName(details?.card, details?.cardId) || 'Unknown Card';
                        action = `quested with **${cardName}**`;
                    }
                    // 4. Ink
                    else if (details?.type === 'ink' || action === 'InkCard' || action === 'inkCard') {
                        const cardName = getCardName(details?.card, details?.cardId) || 'Unknown Card';
                        action = `inked **${cardName}**`;
                    }
                    // 5. Ability
                    else if (details?.type === 'ability' || action === 'UseAbility' || action === 'useAbility') {
                        const cardName = getCardName(details?.card, details?.cardId) || 'Unknown Card';
                        action = `used ability of **${cardName}**`;
                    }

                    // Actually add to UI log!
                    addLogEntry({
                        category,
                        message: `${player} ${action}`,
                        details
                    });
                },
                effect: (source: string, effect: string, target?: string) =>
                    console.log('[EFFECT]', `${source} -> ${effect}${target ? ' on ' + target : ''}`),
                debug: (msg: string, data?: any) => console.log('[DEBUG]', msg, data),
                warn: (msg: string, data?: any) => console.warn('[WARN]', msg, data),
                error: (msg: string, data?: any) => console.error('[ERROR]', msg, data),
                getLogs: () => []
            };

            // Create turn manager with browser logger
            const turnManager = new TurnManager(stateManager, browserLogger as any);

            // Create human controller with state enrichment
            const humanController = new HumanController(
                'You',
                (newState) => {
                    console.log('[GamePage] State update from engine');

                    // CRITICAL FIX: Enrich state with effective stats for UI
                    // This ensures Lady shows 2 Lore when Tramp is in play, etc.
                    if (turnManager?.abilitySystem) {
                        Object.values(newState.players).forEach((player: any) => {
                            // Update cards in play
                            player.play.forEach((card: any) => {
                                card.lore = turnManager.abilitySystem.getModifiedStat(card, 'lore');
                                card.strength = turnManager.abilitySystem.getModifiedStat(card, 'strength');
                                card.willpower = turnManager.abilitySystem.getModifiedStat(card, 'willpower');
                                // Determine effective keywords (e.g. Ward granted by Tramp)
                                if (typeof turnManager.abilitySystem.getModifiedKeywords === 'function') {
                                    card.keywords = turnManager.abilitySystem.getModifiedKeywords(card, player);
                                }
                                // Determine effective Resist (for UI badge)
                                if (typeof turnManager.abilitySystem.getModifiedResist === 'function') {
                                    const resist = turnManager.abilitySystem.getModifiedResist(card, player);
                                    if (!card.meta) card.meta = {};

                                    if (resist > 0) {
                                        card.meta.resist = resist;
                                    } else {
                                        // Clear expired resist so it doesn't persist in UI
                                        delete card.meta.resist;
                                    }
                                }
                            });
                            // Update cards in hand (primarily cost)
                            player.hand.forEach((card: any) => {
                                // Store original cost only if not already stored (to preserve true base cost)
                                if (card.baseCost === undefined) {
                                    card.baseCost = card.cost;
                                } else {
                                    // Reset cost to base before recalculating to avoid recursive verification
                                    card.cost = card.baseCost;
                                }

                                card.cost = turnManager.abilitySystem.getModifiedCost(card, player);
                            });
                        });
                    }

                    setEngineState(newState);
                }
            );

            // Set up logging callback (RE-ADDED)
            humanController.setLogCallback((category, message, details) => {
                addLogEntry({ category: category as any, message, details });
            });

            // Set up choice callback to show selection modals (RE-ADDED)
            humanController.setChoiceCallback((choice) => {
                console.log('[GamePage] Choice request from engine:', choice);
                setCurrentChoice(choice);
            });

            //Create bot controller
            const botController = new HeuristicBot(turnManager);



            // Add players to game
            const player1Id = stateManager.addPlayer('player1', 'You');
            console.log('[GamePage] Player1 ID:', player1Id);
            const player2Id = stateManager.addPlayer('player2', 'Bot');

            const player1 = stateManager.getPlayer(player1Id);
            const player2 = stateManager.getPlayer(player2Id);

            // Load decks (browser-compatible without fs module)
            const cardMap = new Map<string, any>();
            (allCards.cards as any[]).forEach(card => {
                const existing = cardMap.get(card.fullName.toLowerCase());
                // First Match Strategy: Only set if not already present.
                // This avoids overwritting standard cards with later promo/enchanted variants that might be broken or duplicates.
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
                        console.error(`[DeckLoad] Card not found: "${name}" (normalized: "${normalizedName}")`);
                        // Fallback: Try looking for partial match or subtitle variation?
                        // For now just log aggressively
                        return null;
                    }
                    const copiedCard = JSON.parse(JSON.stringify(card)); // Deep copy

                    // Map 'color' to 'ink' if missing, as CardInstance expects 'ink'
                    if (!copiedCard.ink && copiedCard.color) {
                        copiedCard.ink = copiedCard.color;
                    }
                    if (!copiedCard.ink) {
                        console.warn(`[DeckLoad] Card "${name}" missing ink/color property!`, copiedCard);
                    }

                    // Parse abilities into parsedEffects
                    // CRITICAL: Include ALL ability types, not just triggered and static!
                    try {
                        const parsedAbilities = parseToAbilityDefinition(copiedCard);
                        // Store the raw parsed abilities directly - don't filter them!
                        // getBoostCost and other helpers expect the full ability format
                        copiedCard.parsedEffects = parsedAbilities;
                    } catch (parseError) {
                        console.warn(`[DeckLoad] Failed to parse abilities for ${name}:`, parseError);
                        copiedCard.parsedEffects = [];
                    }

                    if (name.includes("The Queen - Commanding Presence")) {
                        console.log('[DEBUG QUEEN] Parsed Effects:', JSON.stringify(copiedCard.parsedEffects, null, 2));
                    }

                    // Debug first few cards
                    if (index < 3) {
                        console.log(`[${deckName}] Card ${index}: ${copiedCard.fullName}`, {
                            cost: copiedCard.cost,
                            number: copiedCard.number,
                            setCode: copiedCard.setCode,
                            ink: copiedCard.ink,
                            parsedEffectsCount: copiedCard.parsedEffects?.length || 0
                        });
                    }
                    return copiedCard;
                }).filter(c => c !== null);
            };

            const deck1Cards = loadDeck(deck1Names || deck1Data.cards, 'Deck1');
            const deck2Cards = loadDeck(deck2Names || deck2Data.cards, 'Deck2');

            // Add cards to player decks with instance IDs
            deck1Cards.forEach((card, index) => {
                const instance = player1.addCardToZone(card, 'Deck' as any);
                if (index < 3) {
                    console.log(`[Player1 Added] Card ${index}:`, {
                        fullName: instance.fullName,
                        cost: instance.cost,
                        number: instance.number,
                        setCode: instance.setCode,
                        instanceId: instance.instanceId
                    });
                }
            });
            deck2Cards.forEach(card => player2.addCardToZone(card, 'Deck' as any));

            // Shuffle decks
            player1.deck.sort(() => Math.random() - 0.5);
            player2.deck.sort(() => Math.random() - 0.5);

            // Register choice handlers
            // Register choice handlers
            // Human player: Use ASYNC handler to wait for UI interaction
            // Human player: Use ASYNC handler to wait for UI interaction
            turnManager.registerChoiceHandler(player1Id, async (request) => {
                console.log('[GamePage] HUMAN CHOICE HANDLER CALLED for', request.playerId, request.type);
                return await humanController.respondToChoiceRequestAsync(request);
            });

            // Bot player: Use standard synchronous handler
            turnManager.registerChoiceHandler(player2Id, (request) =>
                botController.respondToChoiceRequest(request)
            );

            // Initialize bot controllers
            humanController.onGameStart(player1Id, stateManager.state);
            botController.onGameStart(player2Id, stateManager.state);

            // Draw starting hands
            turnManager.drawStartingHand(player1);
            turnManager.drawStartingHand(player2);

            // Store engine
            setGameEngine({ turnManager, stateManager, humanController, botController });

            // Trigger UI update to show initial hand
            setEngineState({ ...stateManager.state }); // Spread to ensure new reference

            // Pause for Mulligan
            console.log('[GamePage] Hand drawn. Pausing for Mulligan.');
            setMulliganOpen(true);

            // Note: startGame is NOT called yet. It will be called after Mulligan.

        } catch (error) {
            console.error('[GamePage] Failed to initialize game:', error);
            addLogEntry({
                category: LogCategory.SYSTEM,
                message: `Failed to start game: ${error}`,
                details: {}
            });
        }
    };

    const handleMulligan = (selectedIds: string[]) => {
        if (!gameEngine) return;
        const { turnManager, stateManager, botController } = gameEngine;

        console.log('[GamePage] Processing Mulligan...', selectedIds);

        // 1. Player Mulligan
        const player1 = stateManager.getPlayer('player1');
        turnManager.mulligan(player1, selectedIds);

        // 2. Bot Mulligan
        const player2 = stateManager.getPlayer('player2');
        const botMulliganIds = botController.decideMulligan(player2.hand);
        turnManager.mulligan(player2, botMulliganIds);

        // 3. Start Game
        turnManager.startGame('player1');

        // 4. Apply forced starting hand if specified (for testing)
        // These cards are ADDED to the hand (moved from deck), keeping other cards for inking
        if (forcedStartingHand.length > 0) {
            console.log('[TestMode] Adding forced cards to starting hand:', forcedStartingHand);

            // Find and move specified cards from deck to hand (add to existing hand)
            forcedStartingHand.forEach(cardName => {
                const normalizedName = cardName.toLowerCase().trim();
                // First check if already in hand
                const inHand = player1.hand.some(c =>
                    c.fullName?.toLowerCase() === normalizedName ||
                    c.name?.toLowerCase() === normalizedName
                );
                if (inHand) {
                    console.log(`[TestMode] Card already in hand: ${cardName}`);
                    return;
                }

                // Find in deck
                const idx = player1.deck.findIndex(c =>
                    c.fullName?.toLowerCase() === normalizedName ||
                    c.name?.toLowerCase() === normalizedName
                );
                if (idx !== -1) {
                    const card = player1.deck.splice(idx, 1)[0];
                    card.zone = 'Hand' as any;
                    player1.hand.push(card);
                    console.log(`[TestMode] Added to hand from deck: ${card.fullName}`);
                } else {
                    console.warn(`[StartingHand] Card not found in deck: "${cardName}"`);
                }
            });

            console.log(`[TestMode] Final hand (${player1.hand.length} cards): ${player1.hand.map(c => c.fullName).join(', ')}`);
        }

        // 5. Update UI
        setEngineState({ ...stateManager.state });
        setMulliganOpen(false);
        setGameInitialized(true);

        console.log('[GamePage] Game engine initialized and started!');
        addLogEntry({
            category: LogCategory.SYSTEM,
            message: 'Game started! You vs Bot',
            details: { player1: player1.name, player2: player2.name }
        });
    };

    // Extract engine state for UI
    const yourPlayer = engineState && gameEngine ? engineState.players[gameEngine.humanController.id] : null;
    const opponentId = engineState && gameEngine ?
        Object.keys(engineState.players).find(id => id !== gameEngine.humanController.id) : null;
    const opponent = opponentId && engineState ? engineState.players[opponentId] : null;

    // Helper to check for generic play restrictions (like Pete - Games Referee)
    const checkCardRestrictions = (card: CardInstance): { restricted: boolean; reason?: string } => {
        if (!gameEngine || !engineState || !yourPlayer) return { restricted: false };

        const activeRestrictions = [
            ...(engineState.activeEffects || []),
            ...(yourPlayer.restrictions || [])
        ];

        const cantPlayActions = activeRestrictions.some(e => {
            if (e.restrictionType !== 'cant_play_actions') return false;
            // Check filtering for global effects
            if (e.targetPlayerIds && e.targetPlayerIds.includes(yourPlayer.id)) return true;
            // Check opponent targeting (global effect)
            if (e.target === 'opponent' && e.sourcePlayerId && e.sourcePlayerId !== yourPlayer.id) return true;
            // Direct restriction on player (from player.restrictions)
            if (!e.target && !e.targetPlayerIds && !e.sourcePlayerId) return true;

            // If it's a restriction attached to the player instance, it applies
            // Note: In React state, object ref equality might fail, so we check ID if available or containment
            if (yourPlayer.restrictions && yourPlayer.restrictions.some(r => r.id === e.id)) return true;

            return e.target === 'all';
        });

        if (cantPlayActions && card.type === 'Action') { // 'Action' matches CardType.Action
            return { restricted: true, reason: "Actions blocked by opponent" };
        }

        return { restricted: false };
    };

    // Auto-initialize game in test/debug mode
    useEffect(() => {
        if ((isTestMode || isDebugMode) && !gameInitializedRef.current) {
            console.log('[GamePage] Auto-initializing game with default decks (Test/Debug Mode)...');
            initializeGame(); // Uses default decks from deck1.json/deck2.json
        }
    }, [isTestMode, isDebugMode]);

    // Auto-mulligan in test/debug mode (keep all cards)
    useEffect(() => {
        if ((autoMulligan || isDebugMode) && mulliganOpen && gameEngine) {
            console.log('[GamePage] Auto-mulligan: keeping all cards (Test/Debug Mode)');
            handleMulligan([]); // Keep all cards
        }
    }, [autoMulligan, isDebugMode, mulliganOpen, gameEngine]);

    // Monitor hand size for draw animation
    useEffect(() => {
        if (!yourPlayer) return;


        // Detect draw (hand size increase)
        if (yourPlayer.hand.length > lastHandSize.current && lastHandSize.current > 0) {
            // Trigger animation
            if (deckRef.current && handRef.current) {
                // Get rects
                const deckRect = deckRef.current.getBoundingClientRect();
                const handRect = handRef.current.getBoundingClientRect();

                // Adjust hand target to center/right
                const handTarget = {
                    ...handRect,
                    left: handRect.left + (handRect.width / 2) - 30, // Rough center/offset
                    width: 100, // Card width equiv
                } as DOMRect;

                setDrawAnim({
                    active: true,
                    from: deckRect,
                    to: handTarget
                });
            }
        }

        // Update ref
        lastHandSize.current = yourPlayer.hand.length;
    }, [yourPlayer?.hand.length]);

    // Map engine Phase to UI TurnPhase
    // Note: Engine's Beginning phase encompasses Ready, Set, and Draw sub-phases
    const phaseToTurnPhase: Record<Phase, TurnPhase> = {
        [Phase.Beginning]: TurnPhase.SET, // Beginning phase shown as "Set" in UI
        [Phase.Main]: TurnPhase.MAIN,
        [Phase.End]: TurnPhase.END
    };

    const uiPhase = engineState ? phaseToTurnPhase[engineState.phase as Phase] : TurnPhase.MAIN;
    const isYourTurn = engineState && gameEngine ? engineState.turnPlayerId === gameEngine.humanController.id : true;

    // Handle restart match
    const handleRestart = () => {
        console.log('[GamePage] Restarting match...');

        // 1. Reset React State
        setGameEngine(null);
        setEngineState(null);
        setGameInitialized(false);
        setLogEntries([]);
        setVictoryDismissed(false);
        setMulliganOpen(false);
        setAvailableInk(0);
        setCurrentTurn(1);

        // 2. Reset Refs
        gameInitializedRef.current = false;
        botIsActingRef.current = false;
        lastHandSize.current = 0;

        // 3. Re-open Deck Import (or auto-init if test mode)
        if (isTestMode) {
            console.log('[GamePage] Test mode restart - auto-init will trigger via useEffect');
            // The existing useEffect([isTestMode]) will see gameInitializedRef.current is false and re-run!
        } else {
            setDeckImportModalOpen(true);
        }
    };

    // DEBUG: Log hand state on every render
    if (yourPlayer?.hand) {
        console.log('[UI DEBUG] yourPlayer.hand:', yourPlayer.hand.map(c => ({
            fullName: c.fullName,
            setCode: c.setCode,
            number: c.number,
            instanceId: c.instanceId
        })));
    }

    // Bot Automation Effect
    useEffect(() => {
        // Guards: Need game engine and state, and it must be bot's turn
        if (!gameEngine || !engineState) return;
        if (isYourTurn) {
            // Reset bot acting flag when it's our turn again
            botIsActingRef.current = false;
            return;
        }

        // Only act during Main phase
        if (engineState.phase !== Phase.Main) return;

        // Prevent duplicate bot action scheduling
        if (botIsActingRef.current) return;
        botIsActingRef.current = true;

        const performBotTurn = async () => {
            try {
                console.log('[Bot] Starting bot turn...');

                // Bot takes actions until it passes
                let actionCount = 0;
                const maxActions = 50; // Safety limit

                while (gameEngine.stateManager.state.turnPlayerId !== gameEngine.humanController.id && actionCount < maxActions) {
                    // Get the current state
                    const currentState = gameEngine.stateManager.state;

                    // Determine action
                    const action = await gameEngine.botController.decideAction(currentState);
                    console.log(`[Bot] Action #${actionCount + 1}: ${action.type}`, action);

                    // Execute action
                    await gameEngine.turnManager.resolveAction(action);
                    actionCount++;

                    // Update UI state
                    setEngineState({ ...gameEngine.stateManager.state });

                    // Add log entry for bot actions
                    if (action.type === ActionType.PassTurn) {
                        addLogEntry({
                            category: LogCategory.TURN,
                            message: 'Bot ended their turn',
                            details: {}
                        });
                        break;
                    } else {
                        // Format bot action message with card details
                        let message = 'Bot: ';
                        const botPlayer = Object.values(gameEngine.stateManager.state.players).find((p: any) => p.id === action.playerId);
                        let card: any = null;

                        // Find the card for the action
                        if (action.cardId) {
                            if (action.type === ActionType.PlayCard || action.type === ActionType.InkCard) {
                                card = botPlayer?.hand.find((c: any) => c.instanceId === action.cardId);
                            } else if (action.type === ActionType.Quest || action.type === ActionType.Challenge || action.type === ActionType.UseAbility || action.type === ActionType.SingSong) {
                                card = botPlayer?.play.find((c: any) => c.instanceId === action.cardId);
                            }
                        }

                        const cardName = card ? (card.fullName || card.name) : null;

                        // Build detailed message based on action type
                        switch (action.type) {
                            case ActionType.PlayCard:
                                message += cardName ? `played **${cardName}**` : 'played a card';
                                break;
                            case ActionType.InkCard:
                                message += cardName ? `inked **${cardName}**` : 'inked a card';
                                break;
                            case ActionType.Quest:
                                message += cardName ? `quested with **${cardName}**` : 'quested';
                                break;
                            case ActionType.Challenge:
                                if (cardName) {
                                    const targetCard = [...(Object.values(gameEngine.stateManager.state.players).find((p: any) => p.id === gameEngine.humanController.id)?.play || [])].find((c: any) => c.instanceId === action.targetId);
                                    const targetName = targetCard ? (targetCard.fullName || targetCard.name) : 'a character';
                                    message += `challenged **${targetName}** with **${cardName}**`;
                                } else {
                                    message += 'challenged';
                                }
                                break;
                            case ActionType.UseAbility:
                                message += cardName ? `activated **${cardName}**'s ability` : 'used an ability';
                                break;
                            case ActionType.SingSong:
                                message += cardName ? `sang **${cardName}**` : 'sang a song';
                                break;
                            default:
                                message += action.type;
                        }

                        addLogEntry({
                            category: LogCategory.CARD,
                            message,
                            details: { action, card }
                        });
                    }

                    // Small delay between actions for visual clarity
                    await new Promise(resolve => setTimeout(resolve, 800));
                }

                console.log(`[Bot] Turn complete after ${actionCount} actions`);
                botIsActingRef.current = false;

                // Final state update
                setEngineState({ ...gameEngine.stateManager.state });

            } catch (error) {
                console.error('[Bot] Error during turn:', error);
                botIsActingRef.current = false;
            }
        };

        // Start bot turn after a short delay for visual feedback
        const timer = setTimeout(performBotTurn, 1000);

        return () => clearTimeout(timer);
    }, [gameEngine, engineState?.turnPlayerId, isYourTurn]); // Trigger on turn change

    // Test log functions
    const testCardPlayed = () => {
        addLogEntry({
            category: LogCategory.CARD,
            message: 'You played Stitch - Rock Star',
            details: {
                card: mockCard,
                player: 'You',
                amount: 6
            },
            debugInfo: { action: 'PLAY_CARD', cost: 6 }
        });
    };

    const testAbilityTriggered = () => {
        addLogEntry({
            category: LogCategory.ABILITY,
            message: 'Stitch - Rock Star triggered ADORING FANS',
            details: {
                card: mockCard,
                ability: 'ADORING FANS'
            }
        });
    };

    const testCombat = () => {
        addLogEntry({
            category: LogCategory.COMBAT,
            message: 'Stitch challenged Maleficent',
            details: {
                player: 'You'
            }
        });
        setTimeout(() => {
            addLogEntry({
                category: LogCategory.COMBAT,
                message: 'Stitch dealt 3 damage to Maleficent',
                details: { amount: 3 }
            });
        }, 500);
    };

    const testLoreGain = () => {
        addLogEntry({
            category: LogCategory.LORE,
            message: 'Mickey Mouse quested for 3 lore',
            details: {
                amount: 3
            }
        });
    };

    const testTurnEvent = () => {
        addLogEntry({
            category: LogCategory.TURN,
            message: 'Turn 3 started',
            details: {}
        });
    };

    // Handle End Turn
    const handleEndTurn = async () => {
        if (!gameEngine || !isYourTurn) return;

        try {
            console.log('[UI] Ending player turn...');

            // Pass turn to game engine
            await gameEngine.turnManager.resolveAction({
                type: ActionType.PassTurn,
                playerId: gameEngine.humanController.id
            });

            // Update UI state
            setEngineState({ ...gameEngine.stateManager.state });

            addLogEntry({
                category: LogCategory.TURN,
                message: 'You ended your turn',
                details: {}
            });

            console.log('[UI] Turn passed, bot should start now');
        } catch (error) {
            console.error('[UI] Error ending turn:', error);
        }
    };

    // Handler for choice responses
    const handleChoiceResponse = (response: ChoiceResponse) => {
        console.log('Choice response:', response);

        // If we have selected cards and current choice has source ability info, check for stat mods
        if (response.selectedIds && response.selectedIds.length > 0 && currentChoice?.source) {
            const abilityName = currentChoice.source.abilityName || '';

            // Check if the ability modifies stats by looking at the prompt or ability name
            const isStatModify =
                abilityName.toLowerCase().includes('gets +') ||
                abilityName.toLowerCase().includes('gets -') ||
                currentChoice.prompt?.toLowerCase().includes('gets +') ||
                // Context-aware checks to avoid matching card names like "Strength of a Raging Fire"
                (currentChoice.prompt?.toLowerCase().includes('strength') && (currentChoice.prompt?.toLowerCase().includes('gets') || currentChoice.prompt?.toLowerCase().includes('sets'))) ||
                (currentChoice.prompt?.toLowerCase().includes('willpower') && (currentChoice.prompt?.toLowerCase().includes('gets') || currentChoice.prompt?.toLowerCase().includes('sets'))) ||
                (currentChoice.prompt?.toLowerCase().includes('lore') && (currentChoice.prompt?.toLowerCase().includes('gets') || currentChoice.prompt?.toLowerCase().includes('sets')));

            if (isStatModify) {
                // Find the target card position for animation
                const targetId = response.selectedIds[0];
                const targetCard = yourPlayer?.play.find(c => c.instanceId === targetId) ||
                    opponent?.play.find(c => c.instanceId === targetId);

                if (targetCard) {
                    // Find the card element in the DOM to get its position
                    const cardElement = document.querySelector(`[data-card-id="${targetId}"]`);
                    if (cardElement) {
                        const rect = cardElement.getBoundingClientRect();
                        const centerX = rect.left + rect.width / 2;
                        const centerY = rect.top + rect.height / 2;

                        // Determine stat type and amount from prompt/ability
                        let statType: 'strength' | 'willpower' | 'lore' = 'strength';
                        let amount = 1;

                        const prompt = (currentChoice.prompt || abilityName).toLowerCase();
                        if (prompt.includes('willpower') || prompt.includes('⛉')) {
                            statType = 'willpower';
                        } else if (prompt.includes('lore') || prompt.includes('◊')) {
                            statType = 'lore';
                        }

                        // Extract amount from patterns like "+1" or "+2"
                        const amountMatch = prompt.match(/[+-](\d+)/);
                        if (amountMatch) {
                            amount = parseInt(amountMatch[1]);
                            if (prompt.includes('-' + amountMatch[1])) {
                                amount = -amount;
                            }
                        }

                        setStatAnimation({
                            show: true,
                            amount,
                            statType,
                            position: { x: centerX, y: centerY }
                        });
                    }
                }
            }
        }

        setCurrentChoice(null);

        // Notify the HumanController so it can resolve any pending promises
        if (gameEngine?.humanController) {
            gameEngine.humanController.submitChoice(response);
        }
    };

    // Test function: Modal Choice
    const testModalChoice = () => {
        setCurrentChoice({
            id: 'choice-modal-1',
            type: ChoiceType.MODAL_CHOICE,
            playerId: 'player1',
            prompt: 'Choose one:',
            options: [
                { id: 'opt-1', display: 'Draw 2 cards', valid: true },
                { id: 'opt-2', display: 'Each opponent discards a card', valid: true },
                { id: 'opt-3', display: 'Deal 3 damage to chosen character', valid: false, invalidReason: 'No valid targets' }
            ],
            source: {
                card: mockCard,
                abilityName: 'A Whole New World',
                player: mockPlayer
            },
            optional: false,
            timestamp: Date.now()
        });
    };

    // Test function: Card Selection
    const testCardSelection = () => {
        setCurrentChoice({
            id: 'choice-target-1',
            type: ChoiceType.TARGET_CHARACTER,
            playerId: 'player1',
            prompt: 'Choose a character to challenge',
            options: [
                { id: mockHand[0].instanceId, display: mockHand[0].fullName, card: mockHand[0], valid: true },
                { id: mockHand[1].instanceId, display: mockHand[1].fullName, card: mockHand[1], valid: true },
                { id: mockHand[2].instanceId, display: mockHand[2].fullName, card: mockHand[2], valid: false, invalidReason: 'Has Evasive' },
                { id: mockHand[3].instanceId, display: mockHand[3].fullName, card: mockHand[3], valid: true }
            ],
            source: {
                card: mockCard,
                abilityName: 'Challenge',
                player: mockPlayer
            },
            optional: false,
            timestamp: Date.now()
        });
    };



    // Memoized props for PlayArea to prevent re-renders
    const opponentCharacters = opponent?.play.filter(c => c.type === 'Character') || [];

    const yourCharacters = yourPlayer?.play.filter(c => c.type === 'Character') || [];

    const handlePlayAreaCardClick = useCallback((card: CardInstance, position: { x: number; y: number }) => {
        setPlayAreaMenuCard(card);
        setPlayAreaMenuCardPosition(position);
    }, []);

    const opponentLocations = opponent?.play.filter(c => c.type === 'Location') || [];

    const opponentItems = opponent?.play.filter(c => c.type === 'Item') || [];

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-black bg-opacity-30">
                <h1 className="text-2xl font-bold text-white">🎮 Lorai • Lorcana</h1>
                <div className="flex gap-2">
                    {/* Test buttons for log system */}

                    <button onClick={testCardPlayed} className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">🎴</button>
                    <button onClick={testAbilityTriggered} className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs">⚡</button>
                    <button onClick={testCombat} className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">⚔️</button>
                    <button onClick={testLoreGain} className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs">◆</button>
                    <button onClick={testTurnEvent} className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs">🔄</button>
                    <div className="border-l border-gray-600 mx-2"></div>
                    {/* Test buttons for choice system */}
                    <button
                        onClick={testModalChoice}
                        className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
                    >
                        🎴 Test Modal
                    </button>
                    <button
                        onClick={testCardSelection}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                    >
                        🎯 Test Targeting
                    </button>
                    {/* Test button - will be removed when backend integration is complete */}
                    <button
                        onClick={() => setOpponentHandRevealed(!opponentHandRevealed)}
                        className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm"
                    >
                        {opponentHandRevealed ? '🔒 Hide' : '🔍 Reveal'} Opp Hand
                    </button>
                    <button
                        onClick={() => setShowAnimationDemo(true)}
                        className="px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded text-sm font-medium"
                    >
                        🎬 Animations
                    </button>
                    <button
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
                        onClick={() => {
                            if (gameEngine) {
                                // Implement concede
                                // gameEngine.turnManager.concede(player1.id);
                                // setEngineState({ ...gameEngine.stateManager.state });
                            }
                        }}
                    >
                        Concede (Not Impl)
                    </button>
                </div>
            </div>

            {/* Turn Flow */}
            <div className="px-4 pt-2">
                <TurnFlow
                    currentTurn={engineState?.turnCount || 1}
                    currentPhase={uiPhase}
                    activePlayer={isYourTurn ? 'player' : 'opponent'}
                    availableInk={yourPlayer?.inkwell.filter(c => c.ready).length || 0}
                    onEndTurn={() => {
                        if (gameEngine && isYourTurn) {
                            console.log('[GamePage] End Turn clicked');

                            // Add log entry for user feedback
                            addLogEntry({
                                category: LogCategory.TURN,
                                message: 'You ended your turn',
                                details: { turn: engineState?.turnCount }
                            });

                            // Pass turn through engine
                            gameEngine.turnManager.passTurn(gameEngine.humanController.id);

                            // Force state update with new object reference to trigger re-render
                            const newState = { ...gameEngine.stateManager.state };
                            console.log('[GamePage] Turn passed. New turn player:', newState.turnPlayerId);
                            setEngineState(newState);
                        }
                    }}
                />
            </div>

            {/* Main Game Board */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Opponent Stats & Ink */}
                <div className="w-64 p-4 bg-black bg-opacity-20 flex flex-col gap-4 overflow-y-auto">
                    <GameStatePanel
                        playerName={opponent?.name || 'Bot'}
                        lore={opponent?.lore || 0}
                        loreGoal={opponent?.loreGoal || 20}
                        deckSize={opponent?.deck.length || 0}
                        handSize={opponent?.hand.length || 0}
                        isActive={!isYourTurn}
                        hasPriority={false}
                    />
                    <InkPile cards={opponent?.inkwell || []} label="Opponent Ink" />
                    <DiscardPile
                        cards={opponent?.discard || []}
                        label="Opponent Discard"
                        onClick={() => setOpponentDiscardModalOpen(true)}
                    />
                </div>

                {/* Center - Game Zones & Play Areas */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Opponent Hand */}
                    <PlayerHand
                        cards={opponent?.hand || []}
                        isOpponent={true}
                        revealed={opponentHandRevealed}
                    />

                    {/* Middle Section - Play Areas & Zones */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Opponent Zones */}
                        <div className="space-y-2">
                            {/* Opponent Items and Locations */}
                            {((opponent?.play.filter(c => c.type === 'Location').length || 0) > 0 ||
                                (opponent?.play.filter(c => c.type === 'Item').length || 0) > 0) && (
                                    <div className="grid grid-cols-2 gap-2">
                                        {(opponent?.play.filter(c => c.type === 'Location').length || 0) > 0 && (
                                            <GameZone cards={opponent?.play.filter(c => c.type === 'Location') || []} label="🏰 Opponent Locations" />
                                        )}
                                        {(opponent?.play.filter(c => c.type === 'Item').length || 0) > 0 && (
                                            <GameZone cards={opponent?.play.filter(c => c.type === 'Item') || []} label="🎯 Opponent Items" />
                                        )}
                                    </div>
                                )}
                            <PlayArea
                                cards={opponentCharacters}
                                label="⚔️ Opponent Characters"
                                currentTurn={engineState?.turnCount}
                            />
                        </div>

                        {/* Player Zones */}
                        <div className="space-y-2">
                            <PlayArea
                                cards={yourCharacters}
                                label="⚔️ Your Characters"
                                currentTurn={engineState?.turnCount}
                                onCardClick={handlePlayAreaCardClick}
                            />
                            {/* Items and Locations */}
                            {((yourPlayer?.play.filter(c => c.type === 'Location').length || 0) > 0 ||
                                (yourPlayer?.play.filter(c => c.type === 'Item').length || 0) > 0) && (
                                    <div className="grid grid-cols-2 gap-2">
                                        {(yourPlayer?.play.filter(c => c.type === 'Location').length || 0) > 0 && (
                                            <GameZone
                                                cards={yourPlayer?.play.filter(c => c.type === 'Location') || []}
                                                label="🏰 Your Locations"
                                                onCardClick={(card) => handlePlayAreaCardClick(card, { x: 0, y: 0 })}
                                            />
                                        )}
                                        {(yourPlayer?.play.filter(c => c.type === 'Item').length || 0) > 0 && (
                                            <GameZone
                                                cards={yourPlayer?.play.filter(c => c.type === 'Item') || []}
                                                label="🎯 Your Items"
                                                onCardClick={(card) => handlePlayAreaCardClick(card, { x: 0, y: 0 })}
                                            />
                                        )}
                                    </div>
                                )}
                        </div>
                    </div>

                    {/* Player Hand - Fixed at Bottom, peek-on-hover */}
                    <div className="border-t border-gray-600 bg-gradient-to-t from-black/30 to-transparent">
                        <PlayerHand
                            cards={yourPlayer?.hand || []}
                            handRef={handRef as any}
                            onCardClick={(card) => setActionMenuCard(card)}
                            canPlayCard={(card) => {
                                if (!gameEngine || !yourPlayer || !engineState) return { canPlay: false, reason: "Game not ready" };
                                if (!isYourTurn) return { canPlay: false, reason: "Not your turn" };
                                if (engineState.phase !== Phase.Main) return { canPlay: false, reason: "Wait for Main phase" };
                                const availInk = yourPlayer.inkwell.filter(c => c.ready).length;
                                if (card.cost > availInk) return { canPlay: false, reason: `Need ${card.cost - availInk} more◆` };
                                return { canPlay: true };
                            }}
                            onPlayCard={async (card) => {
                                if (gameEngine && yourPlayer) {
                                    await gameEngine.turnManager.playCard(yourPlayer as any, card.instanceId);
                                    gameEngine.humanController.updateState(gameEngine.stateManager.state);
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Right Sidebar - Player Stats & Ink */}
                <div className="w-64 p-4 bg-black bg-opacity-20 flex flex-col gap-4 overflow-y-auto">
                    <GameStatePanel
                        playerName={yourPlayer?.name || 'You'}
                        lore={yourPlayer?.lore || 0}
                        loreGoal={yourPlayer?.loreGoal || 20}
                        deckSize={yourPlayer?.deck.length || 0}
                        handSize={yourPlayer?.hand.length || 0}
                        isActive={isYourTurn}
                        hasPriority={isYourTurn}
                    />
                    <InkPile cards={yourPlayer?.inkwell || []} label="Your Ink" />
                    {/* Active Effects Panel */}
                    {engineState?.activeEffects && engineState.activeEffects.length > 0 && (
                        <ActiveEffectsPanel activeEffects={engineState.activeEffects} />
                    )}
                    <DiscardPile
                        cards={yourPlayer?.discard || []}
                        label="Your Discard"
                        onClick={() => setPlayerDiscardModalOpen(true)}
                    />

                    {/* Selected Card Info */}
                    {selectedCard && (
                        <div className="mt-4 p-3 bg-gray-800 rounded">
                            <div className="text-sm text-gray-300 mb-2">Selected:</div>
                            <div className="text-white font-bold">{selectedCard.name}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Game Log */}
            <GameLog
                entries={logEntries}
                onClear={() => setLogEntries([])}
                isOpen={logOpen}
                onToggle={() => setLogOpen(!logOpen)}
            />

            {/* Mulligan Modal */}
            <MulliganModal
                isOpen={mulliganOpen}
                hand={yourPlayer?.hand || []}
                onConfirm={handleMulligan}
            />

            {/* Card Action Menu */}
            {actionMenuCard && yourPlayer && (
                <CardActionMenu
                    card={actionMenuCard}
                    hasInkedThisTurn={yourPlayer.inkedThisTurn || false}
                    availableInk={yourPlayer.inkwell?.filter(c => c.ready).length || 0}
                    isYourTurn={isYourTurn}
                    modifiedCost={actionMenuCard.cost}
                    originalCost={(actionMenuCard as any).baseCost}
                    shiftTargets={yourPlayer.play.filter(c =>
                        c.type === 'Character' &&
                        c.name === actionMenuCard.name &&
                        c.instanceId !== actionMenuCard.instanceId
                    )}
                    eligibleSingers={
                        // Songs can be sung by characters with cost >= song cost
                        (actionMenuCard.subtypes || []).some((s: string) => s.toLowerCase() === 'song')
                            ? yourPlayer.play.filter(c => {
                                if (c.type !== 'Character') return false;
                                if (!c.ready) return false;
                                // Characters can't sing the turn they are played (unless they have Haste? No, singing uses Exert so drying applies)
                                if (c.turnPlayed === engineState?.turnCount) return false;

                                // Check for Sing Together
                                const hasSingTogether = actionMenuCard.parsedEffects?.some((e: any) =>
                                    e.keyword === 'Sing Together' ||
                                    e.keyword === 'sing_together' ||
                                    e.action === 'sing_together' ||
                                    (e.fullText && e.fullText.includes('Sing Together'))
                                );

                                if (hasSingTogether) {
                                    // For Sing Together, ANY ready/non-drying character can participate
                                    // Total value is checked by engine or UI during selection (engine check is robust)
                                    return true;
                                }

                                // Standard Singing: Individual cost/value check
                                // Calculate singing value (max of cost or Singer ability)
                                let singingValue = c.cost;
                                if (c.parsedEffects) {
                                    const singerEffect = c.parsedEffects.find((e: any) =>
                                        e.keyword === 'singer' ||
                                        (e.type === 'static' && e.keyword === 'singer')
                                    );
                                    if (singerEffect) {
                                        const val = (singerEffect as any).value || (singerEffect as any).amount || parseInt((singerEffect as any).keywordValue);
                                        if (val) singingValue = Math.max(singingValue, val);
                                    }
                                }

                                return singingValue >= actionMenuCard.cost;
                            })
                            : []
                    }
                    onInk={handleInkCardAction}
                    onPlay={handlePlayCardAction}
                    isBlocked={(() => {
                        const restriction = checkCardRestrictions(actionMenuCard);
                        return restriction.restricted ? { reason: restriction.reason || "Restricted" } : null;
                    })()}

                    onShift={async (targetId) => {
                        if (gameEngine && actionMenuCard) {
                            const cardToShift = actionMenuCard;
                            setActionMenuCard(null); // Dismiss first

                            try {
                                const player = gameEngine.stateManager.getPlayer(gameEngine.humanController.id);
                                await gameEngine.turnManager.playCard(
                                    player,
                                    cardToShift.instanceId,
                                    undefined, // singerId
                                    targetId   // shiftTargetId
                                );
                                addLogEntry({
                                    category: LogCategory.CARD,
                                    message: `${cardToShift.fullName || cardToShift.name} shifted!`,
                                    details: {}
                                });
                                setEngineState({ ...gameEngine.stateManager.state });
                            } catch (error) {
                                console.error('Shift failed:', error);
                            }
                        } else {
                            setActionMenuCard(null);
                        }
                    }}
                    onSing={async (singerIdOrIds) => {
                        if (gameEngine && actionMenuCard) {
                            const songCard = actionMenuCard;
                            setActionMenuCard(null); // Dismiss first

                            try {
                                const player = gameEngine.stateManager.getPlayer(gameEngine.humanController.id);

                                // Handle single or multiple singers
                                let singerId: string | undefined;
                                let singerIds: string[] | undefined;

                                if (Array.isArray(singerIdOrIds)) {
                                    singerIds = singerIdOrIds;
                                    // We don't set singerId for multiple (engine expects either)
                                } else {
                                    singerId = singerIdOrIds;
                                }

                                console.log('[SING DEBUG] Song:', songCard.name, 'Singer(s):', singerId || singerIds);

                                await gameEngine.turnManager.playCard(
                                    player,
                                    songCard.instanceId,
                                    singerId, // singerId (for single)
                                    undefined, // shiftTargetId
                                    undefined, // targetId
                                    undefined, // payload
                                    singerIds  // singerIds (for multiple)
                                );

                                const singerNames = Array.isArray(singerIdOrIds)
                                    ? `${singerIdOrIds.length} characters`
                                    : (yourPlayer.play.find(c => c.instanceId === singerIdOrIds)?.name || 'Character');

                                addLogEntry({
                                    category: LogCategory.CARD,
                                    message: `🎵 ${singerNames} sang ${songCard.fullName || songCard.name}!`,
                                    details: {}
                                });
                                setEngineState({ ...gameEngine.stateManager.state });
                            } catch (error) {
                                console.error('Sing failed:', error);
                            }
                        } else {
                            setActionMenuCard(null);
                        }
                    }}
                    onCancel={() => setActionMenuCard(null)}
                />
            )}

            {/* Play Area Action Menu (Quest/Challenge) */}
            {playAreaMenuCard && yourPlayer && opponent && (
                <PlayAreaActionMenu
                    card={playAreaMenuCard}
                    isYourTurn={isYourTurn}
                    isDrying={engineState?.turnCount !== undefined && playAreaMenuCard.turnPlayed === engineState.turnCount}
                    challengeTargets={opponent.play.filter(c =>
                        !c.ready &&
                        c.type === 'Character' &&
                        (gameEngine?.turnManager?.canChallenge(playAreaMenuCard, c) ?? true)
                    )}
                    moveTargets={yourPlayer.play
                        .filter(c => c.type === 'Location')
                        .map(location => ({
                            card: location,
                            cost: gameEngine?.turnManager?.abilitySystem
                                ? gameEngine.turnManager.abilitySystem.getModifiedMoveCost(playAreaMenuCard, location)
                                : (location.moveCost || 0)
                        }))}
                    onMove={async (locationId) => {
                        if (gameEngine) {
                            const mover = playAreaMenuCard;
                            const location = yourPlayer.play.find(c => c.instanceId === locationId);
                            setPlayAreaMenuCard(null); // Dismiss first

                            try {
                                await gameEngine.turnManager.resolveAction({
                                    type: ActionType.Move,
                                    playerId: gameEngine.humanController.id,
                                    cardId: mover.instanceId,
                                    destinationId: locationId
                                });
                                setEngineState({ ...gameEngine.stateManager.state });
                            } catch (error) {
                                console.error('Move failed:', error);
                            }
                        }
                    }}
                    onQuest={async () => {
                        if (gameEngine && playAreaMenuCard.ready) {
                            const quester = playAreaMenuCard;
                            setPlayAreaMenuCard(null); // Dismiss first

                            try {
                                const loreAmount = quester.lore || 0;

                                await gameEngine.turnManager.resolveAction({
                                    type: ActionType.Quest,
                                    playerId: gameEngine.humanController.id,
                                    cardId: quester.instanceId
                                });

                                // Trigger lore animation at card position
                                setLoreAnimation(prev => ({
                                    show: true,
                                    amount: loreAmount,
                                    position: playAreaMenuCardPosition,
                                    key: prev.key + 1  // Increment key to force remount
                                }));

                                addLogEntry({
                                    category: LogCategory.LORE,
                                    message: `${quester.fullName || quester.name} quested for ${loreAmount} lore`,
                                    details: {}
                                });
                                setEngineState({ ...gameEngine.stateManager.state });
                            } catch (error) {
                                console.error('Quest failed:', error);
                            }
                        } else {
                            setPlayAreaMenuCard(null);
                        }
                    }}
                    onChallenge={(targetId) => {
                        if (gameEngine && playAreaMenuCard.ready) {
                            const challenger = playAreaMenuCard;
                            setPlayAreaMenuCard(null); // Dismiss first

                            try {
                                // Get target card for animation
                                const targetCard = opponent?.play.find(c => c.instanceId === targetId);

                                // Get DOM positions for both cards
                                const attackerElement = document.querySelector(`[data-card-id="${challenger.instanceId}"]`);
                                const defenderElement = document.querySelector(`[data-card-id="${targetId}"]`);

                                if (attackerElement && defenderElement && targetCard) {
                                    const attackerRect = attackerElement.getBoundingClientRect();
                                    const defenderRect = defenderElement.getBoundingClientRect();

                                    // Calculate damage (simplified - actual damage comes from engine)
                                    const attackerDmg = challenger.strength || 0;
                                    const defenderDmg = targetCard.strength || 0;

                                    // Trigger animation BEFORE resolving action
                                    setChallengeAnimation({
                                        show: true,
                                        attackerPos: {
                                            x: attackerRect.left + attackerRect.width / 2,
                                            y: attackerRect.top + attackerRect.height / 2
                                        },
                                        defenderPos: {
                                            x: defenderRect.left + defenderRect.width / 2,
                                            y: defenderRect.top + defenderRect.height / 2
                                        },
                                        attackerDamage: defenderDmg,
                                        defenderDamage: attackerDmg
                                    });

                                    // Delay action resolution to let challenge animation play fully (1800ms),
                                    // then sync state so PlayArea can detect removed cards and trigger banish animation
                                    setTimeout(async () => {
                                        await gameEngine.turnManager.resolveAction({
                                            type: ActionType.Challenge,
                                            playerId: gameEngine.humanController.id,
                                            cardId: challenger.instanceId,
                                            targetId
                                        });
                                        addLogEntry({
                                            category: LogCategory.COMBAT,
                                            message: `${challenger.fullName || challenger.name} challenged ${targetCard.fullName || targetCard.name}!`,
                                            details: {}
                                        });
                                        setEngineState({ ...gameEngine.stateManager.state });
                                    }, 1900); // Wait for challenge animation (1800ms) + buffer
                                } else {
                                    // Fallback if positions can't be found
                                    gameEngine.turnManager.resolveAction({
                                        type: ActionType.Challenge,
                                        playerId: gameEngine.humanController.id,
                                        cardId: challenger.instanceId,
                                        targetId
                                    });
                                    addLogEntry({
                                        category: LogCategory.COMBAT,
                                        message: `${challenger.fullName || challenger.name} challenged!`,
                                        details: {}
                                    });
                                    setEngineState({ ...gameEngine.stateManager.state });
                                }
                            } catch (error) {
                                console.error('Challenge failed:', error);
                            }
                        } else {
                            setPlayAreaMenuCard(null);
                        }
                    }}
                    availableInk={yourPlayer.inkwell?.filter(c => c.ready).length || 0}
                    currentTurn={engineState?.turnCount || 0}
                    onBoost={async () => {
                        if (gameEngine && playAreaMenuCard) {
                            const booster = playAreaMenuCard;
                            setPlayAreaMenuCard(null); // Dismiss first

                            try {
                                const player = gameEngine.stateManager.getPlayer(gameEngine.humanController.id);

                                // Find the boost ability index in parsedEffects
                                const boostAbilityIndex = booster.parsedEffects?.findIndex((e: any) =>
                                    e.effects?.some((eff: any) => eff.type === 'boost')
                                ) ?? -1;

                                if (boostAbilityIndex >= 0) {
                                    const success = await gameEngine.turnManager.useAbility(
                                        player,
                                        booster.instanceId,
                                        boostAbilityIndex
                                    );

                                    if (success) {
                                        addLogEntry({
                                            category: LogCategory.ABILITY,
                                            message: `📚 ${booster.fullName || booster.name} used Boost!`,
                                            details: {}
                                        });
                                    }
                                    setEngineState({ ...gameEngine.stateManager.state });
                                } else {
                                    console.error('Could not find Boost ability');
                                }
                            } catch (error) {
                                console.error('Boost failed:', error);
                            }
                        } else {
                            setPlayAreaMenuCard(null);
                        }
                    }}
                    onUseAbility={handleUseAbility}
                    onCancel={() => setPlayAreaMenuCard(null)}
                />
            )}

            {/* Discard Pile Modals */}
            <DiscardPileModal
                cards={yourPlayer?.discard || []}
                label="Your Discard Pile"
                isOpen={playerDiscardModalOpen}
                onClose={() => setPlayerDiscardModalOpen(false)}
            />
            <DiscardPileModal
                cards={opponent?.discard || []}
                label="Opponent's Discard Pile"
                isOpen={opponentDiscardModalOpen}
                onClose={() => setOpponentDiscardModalOpen(false)}
            />

            {/* Deck Import Modal */}

            <DeckImportModal
                isOpen={deckImportModalOpen}
                onClose={() => {
                    // If closing without import, maybe load defaults?
                    if (!gameInitialized) {
                        initializeGame(); // Load defaults
                        setDeckImportModalOpen(false);
                    }
                }}
                onImport={(d1, d2) => initializeGame(d1, d2)}
            />

            {/* Player Choice Handler */}
            <PlayerChoiceHandler
                choice={currentChoice}
                onResponse={handleChoiceResponse}
            />

            {/* Lore Gain Animation */}
            {loreAnimation.show && (
                <LoreGainEffect
                    key={loreAnimation.key}
                    position={loreAnimation.position}
                    amount={loreAnimation.amount}
                    onComplete={() => setLoreAnimation(prev => ({ show: false, amount: 0, position: { x: 0, y: 0 }, key: prev.key }))}
                />
            )}

            {/* Draw Animation */}
            <DrawAnimation
                isActive={drawAnim.active}
                fromRect={drawAnim.from}
                toRect={drawAnim.to}
                onComplete={() => setDrawAnim({ ...drawAnim, active: false })}
            />

            {/* Stat Change Animation */}
            {statAnimation.show && (
                <StatChangeEffect
                    position={statAnimation.position}
                    statType={statAnimation.statType}
                    amount={statAnimation.amount}
                    onComplete={() => setStatAnimation({ show: false, amount: 0, statType: 'strength', position: { x: 0, y: 0 } })}
                />
            )}

            {/* Challenge Animation */}
            {challengeAnimation.show && (
                <ChallengeEffect
                    attackerPosition={challengeAnimation.attackerPos}
                    defenderPosition={challengeAnimation.defenderPos}
                    attackerDamage={challengeAnimation.attackerDamage}
                    defenderDamage={challengeAnimation.defenderDamage}
                    onComplete={() => setChallengeAnimation({ show: false, attackerPos: { x: 0, y: 0 }, defenderPos: { x: 0, y: 0 }, attackerDamage: 0, defenderDamage: 0 })}
                />
            )}

            {/* Animation Demo Modal */}
            {showAnimationDemo && (
                <AnimationDemo onClose={() => setShowAnimationDemo(false)} />
            )}

            {/* Victory Overlay */}
            {engineState?.winnerId && !victoryDismissed && (
                <VictoryOverlay
                    winnerId={engineState.winnerId}
                    currentPlayerId="player1"
                    onDismiss={() => {
                        setVictoryDismissed(true);
                        console.log('Victory overlay dismissed');
                    }}
                    onRestart={handleRestart}
                />
            )}

            {/* Debug Panel - only visible when ?debug=true */}
            {isDebugMode && gameEngine && engineState && (
                <DebugPanel
                    gameEngine={gameEngine}
                    engineState={engineState}
                    onStateChange={(newState) => setEngineState(newState)}
                />
            )}
        </div>
    )
}


// Wrapper component with Suspense for useSearchParams
export default function GamePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>}>
            <GamePageInner />
        </Suspense>
    )
}
