/**
 * Ability Definition Types
 * 
 * Declarative representation of card abilities.
 * These define WHAT an ability does, not HOW to execute it.
 */

import { GameEvent, EventContext } from './events';
import { EffectAST, ConditionAST } from './effect-ast';

/**
 * Ability Type
 */
export type AbilityType = 'static' | 'triggered' | 'activated' | 'keyword';

/**
 * Activation Cost (for activated abilities)
 */
export interface ActivationCost {
    exert?: boolean;
    ink?: number;
    banish?: boolean;
    discard?: number;
}

/**
 * Ability Definition
 * 
 * Complete definition of a card ability.
 * Parsed from card text, interpreted at runtime.
 */
export interface AbilityDefinition {
    // Identity
    id: string;
    cardId: string;
    type: AbilityType;

    // Trigger conditions (for triggered abilities)
    event?: GameEvent; // Single trigger event (legacy/simple abilities)
    events?: GameEvent[]; // Multiple trigger events (compound abilities like "When X and whenever Y")
    triggerFilter?: any; // For filtering trigger events (e.g., "play an action")
    eventConditions?: ConditionAST[];

    // Activation (for activated abilities)
    cost?: ActivationCost;

    // Effects (what happens)
    effects: EffectAST[];

    // Metadata
    optional?: boolean;
    duration?: 'permanent' | 'until_end_of_turn' | 'next_turn_start' | 'while_condition';
    rawText: string;
    abilityName?: string;
}

/**
 * Static Ability
 * Continuous effects that modify game rules/state
 */
export interface StaticAbility extends AbilityDefinition {
    type: 'static';
    layer?: number; // Application layer (for ordering)
    condition?: any; // Condition for the static ability (e.g. "While you have X")

    // Static abilities don't have events, they're always active
    // Effects describe the modification they apply
}

/**
 * Triggered Ability  
 * Activates when specific events occur
 */
export interface TriggeredAbility extends AbilityDefinition {
    type: 'triggered';
    event: GameEvent; // Required for triggered abilities
    eventConditions?: ConditionAST[];
    condition?: any; // Root-level condition (e.g. "if you have 2 or more other characters")
}

/**
 * Activated Ability
 * Player chooses when to activate (with cost)
 */
export interface ActivatedAbility extends AbilityDefinition {
    type: 'activated';
    cost: ActivationCost; // Required for activated abilities
}

/**
 * Queued Ability (for The Bag)
 * Triggered abilities waiting to be resolved in turn order
 */
export interface QueuedAbility {
    ability: AbilityDefinition;
    card: any;
    context: EventContext;
    controller: any;  // Player who controls this ability
    timestamp: number;
}
