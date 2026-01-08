import { AbilityDefinition, TriggeredAbility, StaticAbility, ActivatedAbility } from '../abilities/types';
import { Card } from '../models';
import { GameEvent } from '../abilities/events';

// Re-export types for convenience
export type { AbilityDefinition, TriggeredAbility, StaticAbility, ActivatedAbility, Card };
export { GameEvent };

let abilityIdCounter = 0;

/**
 * Generate unique ability ID
 */
export function generateAbilityId(): string {
    return `ability-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
