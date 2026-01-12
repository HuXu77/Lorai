/**
 * Ability System Manager Tests
 * 
 * TDD: Test the integration of parser → event bus → executor
 */

import { AbilitySystemManager } from '../../engine/abilities/ability-system';
import { GameEvent } from '../../engine/abilities/events';
import { SharedTestFixture } from '../test-fixtures';

describe('Ability System Manager', () => {
    let fixture: SharedTestFixture;
    let abilitySystem: AbilitySystemManager;
    let mockTurnManager: any;
    let mockPlayer: any;

    beforeAll(async () => {
        fixture = await SharedTestFixture.getInstance();

    });

    beforeEach(() => {
        // Create mock turn manager
        mockTurnManager = {
            game: {
                getPlayer: vi.fn(id => mockPlayer)
            },
            logger: {
                debug: vi.fn(),
                info: vi.fn(),
                warn: vi.fn(),
                error: vi.fn()
            },
            requestChoice: vi.fn().mockReturnValue({
                selectedIds: ['yes'],
                declined: false
            })
        };

        // Create mock player
        mockPlayer = {
            id: 'player-1',
            name: 'Player 1',
            deck: [
                { id: 1, name: 'Card 1', zone: 'Deck' },
                { id: 2, name: 'Card 2', zone: 'Deck' },
                { id: 3, name: 'Card 3', zone: 'Deck' }
            ],
            hand: [],
            play: [],
            discard: [],
            inkwell: [],
            lore: 0
        };

        abilitySystem = new AbilitySystemManager(mockTurnManager);
    });

    describe('Card Registration', () => {
        it('should register abilities from real Ariel card', async () => {
            // Load real Ariel card
            const ariel = fixture.getAllCards().find(c =>
                c.name === 'Ariel' && c.fullName?.includes('Spectacular Singer')
            );

            expect(ariel).toBeDefined();

            // Register card
            abilitySystem.registerCard(ariel);

            // Should have registered triggered ability
            const listeners = abilitySystem.getEventBus().getListeners(GameEvent.CARD_PLAYED);
            expect(listeners.length).toBeGreaterThan(0);
        });

        it('should not double-register the same card', () => {
            const ariel = fixture.getAllCards().find(c =>
                c.name === 'Ariel' && c.fullName?.includes('Spectacular Singer')
            );

            abilitySystem.registerCard(ariel);
            abilitySystem.registerCard(ariel); // Second time

            const listeners = abilitySystem.getEventBus().getListeners(GameEvent.CARD_PLAYED);
            expect(listeners.length).toBe(1); // Should only have one
        });
    });

    describe('Ability Execution', () => {
        it('should execute draw ability when Maleficent is played', async () => {
            const maleficent = fixture.getAllCards().find(c =>
                c.name === 'Maleficent' && c.fullName?.includes('Sorceress')
            );

            expect(maleficent).toBeDefined();
            expect(maleficent?.abilities).toBeDefined();
            expect(maleficent?.abilities.length).toBeGreaterThan(0);

            // Register Maleficent
            abilitySystem.registerCard(maleficent);

            // Initial hand size
            expect(mockPlayer.hand.length).toBe(0);
            expect(mockPlayer.deck.length).toBe(3);

            // Emit CARD_PLAYED event
            await abilitySystem.emitEvent(GameEvent.CARD_PLAYED, {
                card: maleficent,
                player: mockPlayer
            });

            // Should have drawn 1 card
            expect(mockPlayer.hand.length).toBe(1);
            expect(mockPlayer.deck.length).toBe(2);
        });
    });

    describe('Card Unregistration', () => {
        it('should unregister abilities when card leaves play', () => {
            const ariel = fixture.getAllCards().find(c =>
                c.name === 'Ariel' && c.fullName?.includes('Spectacular Singer')
            );

            abilitySystem.registerCard(ariel);
            const initialListeners = abilitySystem.getEventBus().getListeners(GameEvent.CARD_PLAYED);
            expect(initialListeners.length).toBeGreaterThan(0);

            abilitySystem.unregisterCard(ariel);
            const afterListeners = abilitySystem.getEventBus().getListeners(GameEvent.CARD_PLAYED);
            expect(afterListeners.length).toBe(0);
        });
    });
});
