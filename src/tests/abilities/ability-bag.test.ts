import { AbilityBag, BagEntry } from '../../engine/abilities/bag';
import { TriggeredAbility } from '../../engine/abilities/types';
import { GameEvent } from '../../engine/abilities/events';

describe('AbilityBag (The Bag)', () => {
    let bag: AbilityBag;

    beforeEach(() => {
        bag = new AbilityBag();
    });

    describe('Adding Abilities', () => {
        it('should add triggered abilities to the bag', () => {
            const ability: TriggeredAbility = {
                id: 'test-1',
                cardId: 'card-1',
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{ type: 'draw', amount: 1 }],
                rawText: 'Draw a card'
            };

            const player = { id: 'player-1' };
            const context: any = { event: GameEvent.CARD_PLAYED };

            bag.add(ability, context, player);

            expect(bag.size()).toBe(1);
            expect(bag.isEmpty()).toBe(false);
        });

        it('should organize abilities by player', () => {
            const ability1: TriggeredAbility = {
                id: 'test-1',
                cardId: 'card-1',
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{ type: 'draw', amount: 1 }],
                rawText: 'Draw a card'
            };

            const ability2: TriggeredAbility = {
                id: 'test-2',
                cardId: 'card-2',
                type: 'triggered',
                event: GameEvent.CARD_QUESTED,
                effects: [{ type: 'draw', amount: 2 }],
                rawText: 'Draw 2 cards'
            };

            const player1 = { id: 'player-1' };
            const player2 = { id: 'player-2' };
            const context: any = {};

            bag.add(ability1, context, player1);
            bag.add(ability2, context, player2);

            expect(bag.getPlayerAbilities(player1)).toHaveLength(1);
            expect(bag.getPlayerAbilities(player2)).toHaveLength(1);
            expect(bag.size()).toBe(2);
        });
    });

    describe('Checking Abilities', () => {
        it('should correctly report if player has abilities', () => {
            const ability: TriggeredAbility = {
                id: 'test-1',
                cardId: 'card-1',
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{ type: 'draw', amount: 1 }],
                rawText: 'Draw a card'
            };

            const player = { id: 'player-1' };
            const otherPlayer = { id: 'player-2' };
            const context: any = {};

            bag.add(ability, context, player);

            expect(bag.hasAbilities(player)).toBe(true);
            expect(bag.hasAbilities(otherPlayer)).toBe(false);
        });

        it('should report empty when no abilities', () => {
            expect(bag.isEmpty()).toBe(true);
            expect(bag.size()).toBe(0);
        });
    });

    describe('Removing Abilities', () => {
        it('should remove specific abilities', () => {
            const ability: TriggeredAbility = {
                id: 'test-1',
                cardId: 'card-1',
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{ type: 'draw', amount: 1 }],
                rawText: 'Draw a card'
            };

            const player = { id: 'player-1' };
            const context: any = {};

            bag.add(ability, context, player);
            const abilities = bag.getPlayerAbilities(player);
            const entry = abilities[0];

            bag.remove(entry);

            expect(bag.isEmpty()).toBe(true);
        });
    });

    describe('Resolution Order (Lorcana Rules)', () => {
        it('should allow player to choose which ability to resolve', async () => {
            const ability1: TriggeredAbility = {
                id: 'test-1',
                cardId: 'card-1',
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{ type: 'draw', amount: 1 }],
                rawText: 'Draw 1 card'
            };

            const ability2: TriggeredAbility = {
                id: 'test-2',
                cardId: 'card-2',
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{ type: 'draw', amount: 2 }],
                rawText: 'Draw 2 cards'
            };

            const player = { id: 'player-1' };
            const context: any = {};

            bag.add(ability1, context, player);
            bag.add(ability2, context, player);

            const resolved: string[] = [];
            const mockExecutor = {
                execute: async (effect: any) => {
                    resolved.push(effect.amount.toString());
                }
            };

            const mockGameState = {
                getTurnOrder: () => [player],
                activePlayer: player
            };

            // Player chooses abilities (we'll just pick first)
            const playerChoice = async (p: any, abilities: BagEntry[]) => {
                return abilities[0]; // Choose first available
            };

            await bag.resolveAll(mockGameState, mockExecutor, playerChoice);

            // Should have resolved both abilities
            expect(resolved).toHaveLength(2);
        });
    });

    describe('Clear', () => {
        it('should clear all abilities', () => {
            const ability: TriggeredAbility = {
                id: 'test-1',
                cardId: 'card-1',
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{ type: 'draw', amount: 1 }],
                rawText: 'Draw a card'
            };

            const player = { id: 'player-1' };
            bag.add(ability, {} as any, player);

            expect(bag.isEmpty()).toBe(false);

            bag.clear();

            expect(bag.isEmpty()).toBe(true);
        });
    });
});
