import { GameStateManager as Game } from '../../engine/state';
import { PlayerState } from '../../engine/state';
import { Card } from '../../engine/models';

/**
 * Test utilities for game setup and execution testing
 */

/**
 * Create a test game with minimal setup
 */
export function createTestGame(): Game {
    const game = new Game();

    // Initialize with two test players using current API
    game.addPlayer('player1');
    game.addPlayer('player2');
    game.state.turnPlayerId = 'player1'; // Set first player as active

    return game;
}

/**
 * Setup a player with specific cards in their hand
 */
export function setupPlayerWithCards(
    game: Game,
    playerId: string,
    cards: Card[]
): PlayerState {
    const player = game.getPlayer(playerId);
    if (!player) {
        throw new Error(`Player ${playerId} not found`);
    }

    // Add cards to hand
    for (const card of cards) {
        player.hand.push(card as any);
    }

    return player;
}

/**
 * Give a player enough ink to play a card
 */
export function setupPlayerInk(
    game: Game,
    playerId: string,
    inkAmount: number
): void {
    const player = game.getPlayer(playerId);
    if (!player) {
        throw new Error(`Player ${playerId} not found`);
    }

    // Create inkwell cards
    player.inkwell = [];
    for (let i = 0; i < inkAmount; i++) {
        player.inkwell.push({ instanceId: `ink-${i}` } as any);
    }
}

/**
 * Setup a player with cards and ink ready to play
 */
export function setupReadyPlayer(
    game: Game,
    playerId: string,
    cards: Card[],
    inkAmount: number = 10
): PlayerState {
    const player = setupPlayerWithCards(game, playerId, cards);
    setupPlayerInk(game, playerId, inkAmount);
    return player;
}

/**
 * Helper to get current player from game
 */
export function getCurrentPlayer(game: Game): PlayerState {
    const player = game.getActivePlayer();
    if (!player) throw new Error('No active player');
    return player;
}

/**
 * Helper to get opponent player from game
 */
export function getOpponentPlayer(game: Game): PlayerState {
    const allPlayers = Object.values(game.state.players);
    const activeId = game.state.turnPlayerId;
    const opponent = allPlayers.find((p: any) => p.id !== activeId);
    if (!opponent) throw new Error('No opponent found');
    return opponent as PlayerState;
}

/**
 * Play a card from hand (bypassing normal game flow for testing)
 */
export async function playCardDirectly(
    game: Game,
    card: Card,
    playerId?: string
): Promise<void> {
    const player = playerId ? game.getPlayer(playerId) : getCurrentPlayer(game);
    if (!player) {
        throw new Error('Player not found');
    }

    // Remove from hand
    const handIndex = player.hand.findIndex(c => c.id === card.id);
    if (handIndex !== -1) {
        player.hand.splice(handIndex, 1);
    }

    // Add to play area
    if (card.type === 'Character' || card.type === 'Item') {
        player.play.push(card as any);
    }

    // Trigger play effects
    // TODO: Implement trigger resolution
}

/**
 * Put a character into play directly (for setup)
 */
export function putCharacterIntoPlay(
    game: Game,
    card: Card,
    playerId?: string
): Card {
    const player = playerId ? game.getPlayer(playerId) : getCurrentPlayer(game);
    if (!player) {
        throw new Error('Player not found');
    }

    // Convert Card to CardInstance with required properties
    const cardInstance = {
        ...card,
        instanceId: `instance-${Date.now()}-${Math.random()}`,
        ownerId: player.id,
        zone: 'Play' as const,
        ready: true,
        damage: 0,
        turnPlayed: game.state.turnCount || 0,
        meta: {}
    };

    player.play.push(cardInstance as any);
    return card;
}

