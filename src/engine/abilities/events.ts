/**
 * Game Events
 * 
 * All possible events that can occur during gameplay.
 * Abilities listen to these events to determine when to trigger.
 */

export enum GameEvent {
    // Card lifecycle
    CARD_PLAYED = 'card_played',
    CARD_ENTERS_PLAY = 'card_enters_play',
    CARD_LEAVES_PLAY = 'card_leaves_play',

    // Character actions
    CARD_QUESTED = 'card_quested',
    ON_QUEST = 'on_quest', // Alias for CARD_QUESTED, more semantic for "whenever quests" triggers
    CARD_CHALLENGED = 'card_challenged',
    CARD_CHALLENGES = 'card_challenges',
    CARD_EXERTED = 'card_exerted',
    CARD_READIED = 'card_readied',
    CARD_DEALS_DAMAGE = 'card_deals_damage',

    // Damage & removal
    CARD_DAMAGED = 'card_damaged',
    CARD_HEALED = 'card_healed',
    CARD_BANISHED = 'card_banished',
    CHALLENGE_BANISH = 'challenge_banish', // When this character banishes another in a challenge
    CHARACTER_BANISHED_IN_CHALLENGE = 'character_banished_in_challenge',
    CHARACTER_CHALLENGED_AND_BANISHED = 'character_challenged_and_banished', // When character is both challenged AND banished
    CHARACTER_DAMAGED = 'character_damaged',
    CARD_MOVED_TO_LOCATION = 'card_moved_to_location',
    CARD_SINGS_SONG = 'card_sings_song',

    // Turn phases
    TURN_START = 'turn_start',
    TURN_END = 'turn_end',
    END_OF_TURN = 'turn_end', // Alias for semantic clarity in parsers
    PHASE_START = 'phase_start',
    PHASE_END = 'phase_end',

    // Other events
    CARD_DRAWN = 'card_drawn',
    CARD_DISCARDED = 'card_discarded',
    LORE_GAINED = 'lore_gained',
    ABILITY_ACTIVATED = 'ability_activated',
    CARD_INKED = 'card_inked',
    CARD_RETURNED_TO_HAND = 'card_returned_to_hand',
    CARD_PUT_UNDER = 'card_put_under',

    // Support
    CHARACTER_CHOSEN_FOR_SUPPORT = 'character_chosen_for_support',
    CARD_CHOSEN = 'card_chosen',
    HAND_REVEALED = 'hand_revealed'
}

/**
 * Event Context
 * 
 * Information about what happened when an event was emitted.
 * Different events provide different context.
 */
export interface EventContext {
    event: GameEvent;
    timestamp: number;

    // Common context
    card?: any; // The card involved (will be proper Card type)
    player?: any; // The player who took the action

    // Event-specific context
    target?: any; // Target of an action (e.g., challenged card)
    amount?: number; // Amount (e.g., damage dealt)
    source?: any; // Source of an effect

    // Additional data
    [key: string]: any;
}

/**
 * Ability Listener
 * 
 * Wraps an ability and determines if it should trigger for an event.
 */
export interface AbilityListener {
    ability: any; // Will be AbilityDefinition
    card: any; // The card this ability belongs to

    shouldTrigger(context: EventContext): boolean;
    meetsConditions(context: EventContext): boolean;
}
