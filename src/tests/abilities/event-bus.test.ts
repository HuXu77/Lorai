import { EventBus } from '../../engine/abilities/event-bus';
import { GameEvent, EventContext } from '../../engine/abilities/events';
import { TriggeredAbility } from '../../engine/abilities/types';

describe('EventBus', () => {
    let eventBus: EventBus;

    beforeEach(() => {
        eventBus = new EventBus();
    });

    describe('Registration', () => {
        it('should register triggered abilities', () => {
            const ability: TriggeredAbility = {
                id: 'test-1',
                cardId: 'card-1',
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{ type: 'draw', amount: 1 }],
                rawText: 'When you play this character, draw a card'
            };

            const card = { id: 'card-1' };
            eventBus.register(ability, card);

            const listeners = eventBus.getListeners(GameEvent.CARD_PLAYED);
            expect(listeners).toHaveLength(1);
            expect(listeners[0].ability).toBe(ability);
            expect(listeners[0].card).toBe(card);
        });

        it('should not register non-triggered abilities', () => {
            const ability: any = {
                id: 'test-1',
                cardId: 'card-1',
                type: 'static', // Not triggered!
                effects: [],
                rawText: 'Static ability'
            };

            const card = { id: 'card-1' };
            eventBus.register(ability, card);

            const allListeners = eventBus.getListeners();
            expect(allListeners).toHaveLength(0);
        });
    });

    describe('Event Emission', () => {
        it('should trigger abilities when event is emitted', () => {
            const ability: TriggeredAbility = {
                id: 'test-1',
                cardId: 'card-1',
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{ type: 'draw', amount: 1 }],
                rawText: 'When you play this character, draw a card'
            };

            const card = { id: 'card-1' };
            eventBus.register(ability, card);

            const context: Partial<EventContext> = {
                card,
                player: { id: 'player-1' }
            };

            const triggered = eventBus.emit(GameEvent.CARD_PLAYED, context);

            expect(triggered).toHaveLength(1);
            expect(triggered[0].ability).toBe(ability);
        });

        it('should not trigger abilities for different events', () => {
            const ability: TriggeredAbility = {
                id: 'test-1',
                cardId: 'card-1',
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{ type: 'draw', amount: 1 }],
                rawText: 'When you play this character, draw a card'
            };

            const card = { id: 'card-1' };
            eventBus.register(ability, card);

            const context: Partial<EventContext> = {
                card,
                player: { id: 'player-1' }
            };

            const triggered = eventBus.emit(GameEvent.CARD_QUESTED, context);

            expect(triggered).toHaveLength(0);
        });

        it('should check conditions before triggering', () => {
            const ability: TriggeredAbility = {
                id: 'test-1',
                cardId: 'card-1',
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                eventConditions: [{ type: 'is_self', card: { id: 'card-1' } }],
                effects: [{ type: 'draw', amount: 1 }],
                rawText: 'When you play this character, draw a card'
            };

            const card = { id: 'card-1' };
            eventBus.register(ability, card);

            // Should trigger when card matches
            const triggered1 = eventBus.emit(GameEvent.CARD_PLAYED, { card });
            expect(triggered1).toHaveLength(1);

            // Should NOT trigger when different card
            const triggered2 = eventBus.emit(GameEvent.CARD_PLAYED, { card: { id: 'card-2' } });
            expect(triggered2).toHaveLength(0);
        });
    });

    describe('Unregistration', () => {
        it('should remove all abilities for a card when unregistered', () => {
            const ability: TriggeredAbility = {
                id: 'test-1',
                cardId: 'card-1',
                type: 'triggered',
                event: GameEvent.CARD_PLAYED,
                effects: [{ type: 'draw', amount: 1 }],
                rawText: 'When you play this character, draw a card'
            };

            const card = { id: 'card-1' };
            eventBus.register(ability, card);

            expect(eventBus.getListeners(GameEvent.CARD_PLAYED)).toHaveLength(1);

            eventBus.unregister(card);

            expect(eventBus.getListeners(GameEvent.CARD_PLAYED)).toHaveLength(0);
        });
    });
});
