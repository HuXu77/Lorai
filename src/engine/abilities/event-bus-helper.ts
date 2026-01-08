import { EventContext } from './events';

/**
 * Evaluate a condition
 */
function evaluateCondition(condition: any, context: EventContext, card: any): boolean {
    switch (condition.type) {
        case 'is_self':
            return context.card === card;
        case 'in_challenge':
            return context.inChallenge === true;
        // More conditions will be added
        default:
            return true;
    }
}
