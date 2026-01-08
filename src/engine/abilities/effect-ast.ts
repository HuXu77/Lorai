/**
 * Effect AST (Abstract Syntax Tree)
 * 
 * Declarative representation of what an ability does.
 * Effects are interpreted at runtime, not executed during parsing.
 */

import { GameEvent } from './events';

/**
 * Expression - dynamic values
 */
export type Expression =
    | { type: 'constant', value: number }
    | { type: 'variable', name: string } // e.g., "damage_removed"
    | { type: 'count', what?: string, filter?: any, source?: string, owner?: string, count?: string } // e.g., "cards in hand" or "damaged_opponent_characters"
    | { type: 'attribute_of_self', attribute: string }
    | { type: 'attribute_of_target', attribute: string, target: TargetAST };

/**
 * Target specification
 */
export type TargetAST =
    | { type: 'self' }
    | { type: 'chosen_character', filter?: any, count?: number, upTo?: boolean }
    | { type: 'chosen_opposing_character', filter?: any }
    | { type: 'all_characters', filter?: any }
    | { type: 'all_opposing_characters' }
    | { type: 'player' }
    | { type: 'all_opponents' }
    | { type: 'chosen', filter?: any }
    | { type: 'self_and_chosen_other' }
    | { type: 'my_items', filter?: any }
    | { type: 'cards_in_hand' }
    | { type: 'cards_in_opponent_hand' }
    | { type: 'event_target' }
    | { type: 'chosen_character_at_self' }
    | { type: 'opposing_character_lowest_cost' }
    | { type: 'chosen_character_item_or_location', filter?: any }
    | { type: 'chosen_item', filter?: any }
    | { type: 'chosen_opposing_item', filter?: any }
    | { type: 'chosen_item_or_location', filter?: any }
    | { type: 'chosen_opposing_location', filter?: any }
    | { type: 'card_in_discard', filter?: any, mockChoices?: string[] }
    | { type: 'chosen_card_in_discard', filter?: any }
    | { type: 'chosen_from_discard', filter?: any }
    | { type: 'chosen_from_discard', filter?: any }
    | { type: 'all_inkwell' }
    | { type: 'chosen_opponent' }
    | { type: 'count', what: string, filter?: any }
    | { type: 'variable', name: string } // For loop iteration
    | { type: 'each_opposing_character' }
    | { type: 'all_friendly_characters' }
    | { type: 'each_opponent' }
    | { type: 'opponent' }
    | { type: 'top_card_of_deck' }
    | { type: 'trigger_card' }
    | { type: 'chosen_location', filter?: any }
    | { type: 'chosen_character_or_location', filter?: any }
    | { type: 'chosen_permanent', filter?: any }
    | { type: 'all_players' }
    | { type: 'each_player' }
    | { type: 'all_opposing_cards', filter?: any };

/**
 * Condition AST
 */
export type ConditionAST =
    | { type: 'is_self', card?: any }
    | { type: 'has_subtype', subtype: string }
    | { type: 'cost_less_than', amount: number }
    | { type: 'in_challenge' }
    | { type: 'has_cards_in_hand', amount: number, comparison: 'less_than' | 'greater_than' | 'equal' }
    | { type: 'ink_available', amount: number }
    | { type: 'card_put_under_this_turn' }
    | { type: 'has_character_in_play', subtype?: string }
    | { type: 'is_damaged', target?: 'self' | 'opponent' }
    | { type: 'check_revealed_card', filter: any }
    | { type: 'min_ink', amount: number }
    | { type: 'empty_hand' }
    | { type: 'control_character', name: string }
    | { type: 'self_status', status: string }
    | { type: 'self_stat_check', stat: string, operator: 'gte' | 'lte' | 'eq', value: number }
    | { type: 'at_location' }
    | { type: 'at_any_location' }
    | { type: 'deck_building' }
    | { type: 'count_check', amount: number, filter: any, operator?: 'gte' | 'lte' | 'eq' | 'gt' | 'lt' } | { type: 'opponent_lore_check', amount: number, operator: 'gte' | 'lte' | 'eq' }
    | { type: 'has_damaged_character_at_location' }
    | { type: 'status', status: string, target: string }
    | { type: 'my_turn' }
    | { type: 'self_exerted' }
    | { type: 'played_song_this_turn' }
    | { type: 'target_has_subtype', subtype: string }
    | { type: 'during_your_turn' }
    | { type: 'unless_presence', filter: any }
    | { type: 'unless_location' }
    | { type: 'while_here' }
    | { type: 'presence', filter: any }
    | { type: 'while_here_exerted', location?: string }
    | { type: 'event_occurred', event: string, turn?: string }
    | { type: 'ink_count', amount: number, comparison: string }
    | { type: 'min_other_characters', amount: number }
    | { type: 'hand_size', amount: number, comparison: string }
    | { type: 'relative_hand_size', comparison: string, opponent: string }
    | { type: 'has_card_under' };
/**
 * Effect AST - All possible effect types
 */
export type EffectAST =
    // Ability wrappers (contain nested effects)
    | { type: 'activated', effects?: EffectAST[], costs?: any[], rawText?: string }
    | { type: 'triggered', effects?: EffectAST[], trigger?: string, rawText?: string }
    | { type: 'static', effects?: EffectAST[], condition?: ConditionAST, rawText?: string }
    | { type: 'resolution', effects?: EffectAST[] }

    // Card draw
    | { type: 'draw', amount: number | Expression, optional?: boolean }
    | { type: 'reveal_hand', target: TargetAST }
    | { type: 'discard_chosen', target: TargetAST, filter: any, chooser: 'self' | 'opponent' }

    // Damage & healing
    | { type: 'damage', target: TargetAST, amount: number | Expression }

    | { type: 'heal', target: TargetAST, amount: number | Expression }

    // Card movement
    | { type: 'banish', target: TargetAST }
    | { type: 'return_to_hand', target: TargetAST, amount?: number }
    | { type: 'discard', amount: number, optional?: boolean }
    | { type: 'put_from_discard', filter?: { cardType?: string }, destination: string, optional?: boolean }
    | { type: 'shuffle_into_deck', target: TargetAST }

    // Stat modification
    | { type: 'modify_stats', target?: TargetAST, stat?: string, amount?: number, modifiers?: { [key: string]: number }, duration?: string, condition?: any, scaling?: any }

    // Keyword grants
    | { type: 'grant_keyword', target?: TargetAST, keyword: string, amount?: number, duration?: string, condition?: any }
    | { type: 'grant_ability', target: TargetAST, ability: string, duration?: string }

    // Lore
    | { type: 'gain_lore', amount: number | Expression }
    | { type: 'lose_lore', target: TargetAST, amount: number }

    // Batch 3: Complex trigger effects
    | { type: 'look_at_cards', amount: number, zone: string }
    | { type: 'look_and_rearrange', amount: number }
    | { type: 'exert_characters', amount: number, optional?: boolean }
    | { type: 'play_for_free', filter: { cardType: string, maxCost?: number } }
    | { type: 'play_revealed_card_for_free' }
    | { type: 'reveal_top_card', amount: number }
    | { type: 'shuffle_from_discard', optional?: boolean }
    | { type: 'cost_reduction', amount: number, filter?: { cardType?: string }, duration?: string, condition?: any }
    | { type: 'ink_from_hand', optional?: boolean }
    | { type: 'discard_hand_draw', amount: number, target?: TargetAST }
    | { type: 'heal_and_draw', amount: number, target: TargetAST }

    | { type: 'ink_from_hand', optional?: boolean }

    // Batch 3 Aliases
    | { type: 'headless_horseman_combo' }
    | { type: 'remove_damage', target: TargetAST, amount: number | Expression }
    | { type: 'return_self' }

    // Batch 5 Search types
    | { type: 'reveal_top_deck', amount?: number }
    | { type: 'look_at_top_of_deck', amount?: number }
    | { type: 'tutor_specific', filter: any }
    | { type: 'look_at_top_and_choose_placement', target: TargetAST }

    // Batch 7 Recursion types
    | { type: 'play_action_from_discard_then_bottom_deck', target: TargetAST }
    | { type: 'play_from_discard', target: TargetAST, free?: boolean, costAdjust?: number } // Ensure play_from_discard has properties

    // Batch 4: Remaining trigger variations

    // Batch 4: Remaining trigger variations
    | { type: 'return_from_discard', filter?: { cardType?: string, name?: string }, optional?: boolean }

    // Batch 8 Location types
    | { type: 'move_to_location', target: TargetAST, destination?: TargetAST | 'self', free?: boolean }
    | { type: 'move_characters', target: TargetAST, destination?: TargetAST | 'self' }
    | { type: 'free_move_to_location', target: TargetAST, destination?: TargetAST }
    | { type: 'opponent_discard', amount: number }
    | { type: 'discard_to_hand_size', limit?: number } // Hand size enforcement

    // Boost mechanic - Place cards under characters
    | { type: 'boost', cost: number } // Activated ability: pay ink to put top deck card under character
    | { type: 'put_card_under', source: string, facedown?: boolean, target?: TargetAST, optional?: boolean }

    // Tier 1 critical effects
    | { type: 'exert_self' }
    | { type: 'ready_self' }
    | { type: 'shuffle_into_deck', target: TargetAST }
    | { type: 'put_on_top', target: TargetAST }
    | { type: 'put_on_bottom', target: TargetAST }
    | { type: 'create_token', tokenType?: string, amount?: number, strength?: number, willpower?: number, lore?: number }
    | { type: 'search_deck', filter?: any, amount?: number }
    | { type: 'set_strength', target: TargetAST, value: number | Expression }
    | { type: 'set_willpower', target: TargetAST, value: number | Expression }
    | { type: 'add_counter', target: TargetAST, counterType?: string, amount?: number }
    | { type: 'choose_and_discard', amount?: number }
    | { type: 'draw_and_discard_by_count', countSource?: { type: string, filter?: any }, optional?: boolean }

    // Tier 2: Simple State Effects
    | { type: 'prevent_next_damage', target: TargetAST, amount: number | 'all' }
    | { type: 'exert', target: TargetAST }
    | { type: 'cant_quest', target: TargetAST, duration?: string }
    | { type: 'cant_challenge', target: TargetAST, duration?: string }
    | { type: 'cant_ready', target: TargetAST, duration?: string }
    | { type: 'must_challenge', target: TargetAST }
    | { type: 'return_from_discard', target: TargetAST, destination: 'hand' | 'deck' }
    | { type: 'unexertable', target: TargetAST }
    | { type: 'hexproof', target: TargetAST }
    | { type: 'lose_all_abilities', target: TargetAST }
    | { type: 'double_lore', target: TargetAST }
    | { type: 'copy_stats', target: TargetAST, source: TargetAST }
    | { type: 'set_cost', target: TargetAST, value: number }
    | { type: 'permanent_buff', target: TargetAST, strength?: number, willpower?: number }
    | { type: 'temporary_buff', target: TargetAST, strength?: number, willpower?: number, duration: string }
    | { type: 'restriction', restriction: string, target?: TargetAST, duration?: string, params?: any }

    // Tier 3: Complex Mechanics
    | { type: 'transform', target: TargetAST, cardType?: string, strength?: number, willpower?: number }
    | { type: 'create_copy', target: TargetAST }
    | { type: 'bounce_all', filter?: any }
    | { type: 'counter_ability', target: TargetAST }
    | { type: 'cascade', effects: EffectAST[] }
    | { type: 'exile', target: TargetAST }
    | { type: 'return_from_exile', filter?: any }
    | { type: 'flashback', target: TargetAST }
    | { type: 'gain_control', target: TargetAST, duration?: string }
    | { type: 'look_at_top', amount: number }
    | { type: 'mill_until', condition: any }
    | { type: 'play_additional_card', cardType?: string }
    | { type: 'sacrifice', target: TargetAST, amount?: number }
    | { type: 'tutor_specific', filter: any }
    | { type: 'ready_card', target: TargetAST }
    | { type: 'ward', target: TargetAST, amount?: number }

    // Choice-Based Effects (using choice system)
    | { type: 'choose_card_from_discard', filter?: any }
    | { type: 'choose_to_play_for_free', filter?: any }
    | { type: 'opponent_choose_and_discard', amount: number }
    | { type: 'look_and_choose', amount: number, chooseAmount: number }
    | { type: 'reveal_and_choose', amount: number }
    | { type: 'choose_target_effect', effects: EffectAST[] }
    | { type: 'modal_choice', choices: EffectAST[] }
    | { type: 'distribute_damage_choice', totalDamage: number, targets: TargetAST }
    | { type: 'choose_keyword_to_grant', target: TargetAST, keywords: string[] }
    | { type: 'optional_trigger', effect: EffectAST }
    | { type: 'choose_zone_target', zones: string[] }
    | { type: 'opponent_reveal_and_discard', filter?: any }
    | { type: 'opponent_reveal_top', target?: TargetAST, amount?: number }

    // Complex gameplay effects
    | { type: 'opponent_discard_choice', choices: any[] }
    | { type: 'opponent_choice_banish', amount: number }
    | { type: 'opponent_discard_from_hand', amount?: number }
    | { type: 'opponent_loses_lore', amount: number }
    | { type: 'opponent_banish_character', target: TargetAST }
    | { type: 'pay_lore_to_prevent_banish', cost: number, target: TargetAST }
    | { type: 'opponent_reveals_hand_you_choose_discard' }
    | { type: 'opponent_pays_ink_or_discard', inkCost?: number, discardCost?: number }
    | { type: 'prevent_opponent_lore_gain', amount?: number }
    | { type: 'steal_lore_from_opponent', amount: number }
    | { type: 'force_opponent_to_choose', choiceType: string }
    | { type: 'opponent_return_to_hand', target: TargetAST }
    | { type: 'opponent_choice_action', action: string, target?: any }
    | { type: 'exert_all', filter?: { damaged?: boolean, opposing?: boolean } }
    | { type: 'reveal_and_conditional', filter: any, destination: string, optional?: boolean }
    | { type: 'prevent_damage', source: string }

    // Batch 6: Advanced trigger variations
    | { type: 'put_into_inkwell', target?: TargetAST, source?: string }
    | { type: 'prevent_ready', target: TargetAST, duration?: string }
    | { type: 'redirect_damage', target: TargetAST }
    | { type: 'can_challenge_ready' }
    | { type: 'move_damage', amount: number, from: TargetAST, to: TargetAST }
    | { type: 'prevent_damage_from_source', source: string }
    | { type: 'prevent_play', target: TargetAST, filter?: any }
    | { type: 'inkwell_enters_exerted', target: string }
    | { type: 'reveal_and_put_multiple', amount: number, filter: any }
    | { type: 'move_to_location', target: TargetAST, free?: boolean }
    | { type: 'name_and_reveal' }
    | { type: 'move_cost_reduction', amount: number | 'free', target: TargetAST }
    | { type: 'challenge_banish_both' }
    | { type: 'challenge_banish_both_characters' }
    | { type: 'challenge_damage_all_damaged' }
    | { type: 'damage_on_being_challenged', amount: number }
    | { type: 'return_character_banished_in_challenge' }
    | { type: 'while_challenging_debuff_challenger', amount: number }

    // Batch 10: Quest/Draw/Lore
    | { type: 'gain_lore_when_damaged', amount?: number }
    | { type: 'draw_when_damaged', amount?: number }
    | { type: 'draw_on_sing', amount?: number }
    | { type: 'prevent_lore_loss' }
    | { type: 'draw_equal_to_count', count: any }
    | { type: 'gain_lore_equal_to_cost' }
    | { type: 'double_lore_gain' }
    | { type: 'lore_cost_to_activate', cost: number }
    | { type: 'quest_debuff_chosen', target: TargetAST, amount: number, stat: 'strength' | 'willpower' }
    | { type: 'quest_gain_equal_cost_ink' }
    | { type: 'quest_gain_ink_equal_cost' }
    | { type: 'quest_play_ally_free', filter?: any }
    | { type: 'quest_play_ally_free', filter?: any }
    | { type: 'quest_play_item_free', filter?: any }

    // Batch 11: Advanced Card Manipulation
    | { type: 'look_and_distribute', amount: number, destination: 'top' | 'bottom' }
    | { type: 'look_and_rearrange', amount: number }
    | { type: 'play_with_top_card_revealed' }
    | { type: 'reveal_hand_opponent_choice_discard', amount?: number }
    | { type: 'play_reveal_opponent_hand_choice_discard', filter?: any }

    // Batch 12: Static Abilities & Conditional Buffs
    | { type: 'conditional_buff_subtype_in_play', subtype: string, strength?: number, willpower?: number }
    | { type: 'conditional_multi_buff_subtype_count', subtype: string, strengthPerCount?: number, willpowerPerCount?: number }
    | { type: 'conditional_stat_buff_while_item_in_discard', strength?: number, willpower?: number }
    | { type: 'conditional_gain_keyword_while_damaged', keyword: string }
    | { type: 'conditional_resist_no_damage' }
    | { type: 'stat_buff_per_damage', strengthPerDamage?: number, willpowerPerDamage?: number }
    | { type: 'while_exerted_buff_others', target: TargetAST, strength?: number, willpower?: number }
    | { type: 'singing_power_buff', amount: number }

    // Batch 13: Inkwell & Special Mechanics
    | { type: 'all_inkwell' }
    | { type: 'hand_to_inkwell_all' }
    | { type: 'inkwell_trigger_debuff', target: TargetAST, amount: number, stat: 'strength' | 'willpower' }
    | { type: 'grant_inkable', target: TargetAST }
    | { type: 'add_name', name: string }
    | { type: 'add_name_for_shift', name: string }
    | { type: 'name_and_reveal', promptForName?: boolean }

    // Batch 14: Prevention & Restriction Effects
    | { type: 'prevent_ability_use', target?: TargetAST, abilityType?: string }
    | { type: 'prevent_discard', target: TargetAST }
    | { type: 'prevent_discard_effects' }
    | { type: 'prevent_lore_at_location', location?: string }
    | { type: 'prevent_play', target?: TargetAST, filter?: any }
    | { type: 'prevent_selection', target: TargetAST }
    | { type: 'play_trigger_draw_opponent', amount: number }
    | { type: 'play_trigger_opponent_draws', amount: number }
    | { type: 'play_action_trigger_buff', target: TargetAST, strength?: number, willpower?: number }

    // Batch 15: Advanced Opponent Interactions
    | { type: 'opponent_choice_damage', amount: number, filter?: any }
    | { type: 'opponent_choice_return_to_hand', filter?: any }
    | { type: 'opponent_discard_excess_hand', maxHandSize: number }
    | { type: 'opponent_pay_to_banish_self', cost: number }
    | { type: 'opponent_play_return_self', filter?: any }
    | { type: 'opponent_together_choice_banish', amount: number }
    | { type: 'opponent_reveal_conditional_hand_bottom', condition: any }

    // Batch 16: Utility & Miscellaneous Effects
    | { type: 'cards_in_hand' }
    | { type: 'cards_in_opponent_hand' }
    | { type: 'attribute_of_target', target: TargetAST, attribute: string }
    | { type: 'deck_copy_limit', cardName: string, limit: number }
    | { type: 'deck_limit_increase', amount: number }
    | { type: 'deck_limit_override', cardName: string, limit: number }
    | { type: 'ink', amount: number }
    | { type: 'lore', amount: number }
    | { type: 'self_status', status: string, value: any }
    | { type: 'grant_activated_ability', target: TargetAST, ability: any }
    | { type: 'choice', options: any[] }
    | { type: 'event_target' }

    // Batch 17: Final Consolidation - Specialized Effects (100% Coverage)
    // Return Mechanics
    | { type: 'return_damaged_character_to_hand', target?: TargetAST }
    | { type: 'return_multiple_items', amount: number }
    | { type: 'return_to_hand_on_banish' }
    | { type: 'return_triggered_card_from_discard' }
    | { type: 'activated_return_subtype_from_discard', subtype: string }
    | { type: 'item_banish_return_item' }
    | { type: 'one_to_hand_rest_bottom', amount: number }
    // Reveal & Play Mechanics
    | { type: 'reveal_and_conditional', condition: any, effect: EffectAST }
    | { type: 'reveal_and_put_multiple', amount: number, destination: string }
    | { type: 'reveal_top_and_play_if_name', cardName: string }
    | { type: 'reveal_top_multi_name_conditional', names: string[] }
    | { type: 'recursive_reveal_conditional', condition: any }
    | { type: 'reveal_opponent_hand_on_sing' }
    | { type: 'look_at_hand', target: TargetAST }
    // Conditional Play
    | { type: 'play_from_hand', filter?: any }
    | { type: 'conditional_play_for_free', condition: any, filter?: any }
    | { type: 'play_named_card_free', cardName: string }
    | { type: 'play_same_name_as_banished' }
    | { type: 'pay_to_resolve', cost: number }
    // Challenge & Lore
    | { type: 'challenge_trigger_buff_others', target: TargetAST, strength?: number, willpower?: number }
    | { type: 'gain_lore_on_character_play', amount: number }
    | { type: 'lose_lore_equal_to_stat', stat: string }
    // Edge Cases
    | { type: 'change_win_condition', newCondition: any }
    | { type: 'chosen_character_at_self' }
    | { type: 'chosen_from_discard', filter?: any }
    | { type: 'opposing_character_lowest_cost' }
    | { type: 'self_and_chosen_other', target: TargetAST }
    | { type: 'self_damage_cost_for_effect', damageAmount: number, effect: EffectAST }
    | { type: 'card_put_under_this_turn' }
    | { type: 'inkwell_enters_exerted' }
    | { type: 'opponent_choice_discard', target: TargetAST }
    | { type: 'conditional_action', base_action: EffectAST, condition: ConditionAST, replacement_action: EffectAST }
    | { type: 'additional_ink' }
    | { type: 'opponent_reveal_and_discard', target: TargetAST, filter: any, chooser: string }
    | { type: 'opponent_reveal_conditional_hand_bottom', filter: any, target: TargetAST }
    | { type: 'deck_limit_increase', amount: number, cardName: string }
    | { type: 'ready', target: TargetAST }
    | { type: 'lore_loss', amount: number, target: TargetAST }
    | { type: 'enters_with_damage', amount: number }
    | { type: 'look_and_move', amount: number, filter?: any, destination: 'hand' | 'top' | 'bottom', restDestination?: 'top' | 'bottom' | 'deck', moveAmount?: number, optional?: boolean }
    | { type: 'search_deck', filter: any, destination: string, shuffle?: boolean, reveal?: boolean }
    | { type: 'opponent_choice', target: TargetAST, action: EffectAST }
    | { type: 'look_at_top_deck', amount: number, destination?: string }
    | { type: 'play_from_discard', target: TargetAST, free?: boolean }
    | { type: 'reveal_and_draw', amount: number, filter: any, destination: 'hand' | 'top' | 'bottom' }
    | { type: 'modify_stats_by_count', stat: string, amountMultiplier: number, countTarget: TargetAST, target: TargetAST, duration?: string }
    | { type: 'return_from_discard', target: TargetAST, destination?: string }
    | { type: 'each_player_chooses_action', action: EffectAST }
    | { type: 'play_from_hand', filter: any, free?: boolean }
    | { type: 'look_and_move_to_top_or_bottom', amount: number, source: string }
    | { type: 'singing_power_buff', amount: number, target: TargetAST }
    | { type: 'add_name', names: string[] }
    | { type: 'look_at_hand', target: TargetAST }
    | { type: 'grant_inkable', target: TargetAST }
    | { type: 'prevent_damage_removal', target: TargetAST }
    | { type: 'prevent_selection', target: TargetAST, source: string }
    | { type: 'damage_reflection', target: TargetAST }
    | { type: 'mill', amount: number, target: TargetAST }
    | { type: 'mill', amount: number, target: TargetAST }
    | { type: 'pay_to_resolve', cost: { type: 'ink' | 'discard' | 'lore' | 'banish_self' | 'mill', amount: number }, effect: EffectAST }
    | { type: 'prevent_lore_loss', target: TargetAST, duration?: string }
    | { type: 'conditional_play_for_free', condition: ConditionAST }
    | { type: 'opponent_pay_to_banish_self', cost: { type: 'lore', amount: number } }
    | { type: 'opponent_together_choice_banish', target: TargetAST, amount: number }
    | { type: 'prevent_ability_use', target: TargetAST, abilityType: string }
    | { type: 'play_from_discard', filter?: any, free?: boolean }
    | { type: 'prevent_discard', source: string, duration?: string }
    | { type: 'opponent_choice_return_to_hand', target: TargetAST, filter: any }
    | { type: 'ready_after_challenge', target: TargetAST }
    | { type: 'play_same_name_as_banished', free?: boolean }
    | { type: 'opponent_discard_excess_hand', limit: number }
    | { type: 'add_name_for_shift', name: string }
    | { type: 'return_to_hand_on_banish', target: TargetAST }
    | { type: 'exert_and_damage_to_move', damage: number, free?: boolean }
    | { type: 'play_with_top_card_revealed' }
    | { type: 'reveal_top_and_play_if_name', name: string }
    | { type: 'grant_activated_ability', target: TargetAST, cost: any, effect: EffectAST, duration?: string }
    | { type: 'singing_cost_modifier', target: TargetAST, amount: number, duration?: string }
    | { type: 'deck_limit_override', cardName: string }
    | { type: 'play_named_card_free', cardName: string, filter?: any }
    | { type: 'damage_equal_to_count', target: TargetAST, countFilter: any }
    | { type: 'remove_all_damage', target: TargetAST }
    | { type: 'lose_lore_equal_to_stat', target: TargetAST, sourceTarget: TargetAST, stat: string, duration?: string }
    | { type: 'return_multiple_with_cost_filter', amount: number, filter: any, maxCost: number }
    | { type: 'deck_copy_limit', cardName: string, limit: number }
    | { type: 'vanish' }

    | { type: 'return_triggered_card_from_discard' }
    | { type: 'look_at_top_and_choose_placement', target: TargetAST }
    | { type: 'reveal_top_multi_name_conditional', names: string[], destination: string }
    | { type: 'self_damage_cost_for_effect', damage: number, effect: EffectAST }
    | { type: 'recursive_reveal_conditional', filter: any, successEffect: EffectAST, failEffect: EffectAST }
    | { type: 'prevent_discard_effects' }
    | { type: 'change_win_condition', loreRequired: number }
    | { type: 'reveal_opponent_hand_on_sing', target: TargetAST }
    | { type: 'discard_hand' }
    | { type: 'prevent_ready', target: TargetAST, duration: string }
    | { type: 'damage_on_any_play' }
    | { type: 'challenge_ready_damaged' }
    | { type: 'return_character_banished_in_challenge', target: TargetAST }
    | { type: 'return_damaged_character_to_hand', target: TargetAST }
    | { type: 'damage_on_character_play' }
    | { type: 'gain_lore_when_damaged' }
    | { type: 'prevent_lore_at_location' }
    | { type: 'draw_on_sing' }
    | { type: 'gain_lore_on_character_play', amount: number, filter?: any }
    | { type: 'exert_to_deal_damage', damage: number, target: TargetAST }
    | { type: 'location_damage_all_characters', damage: number }
    | { type: 'ready_inkwell', amount: number, target?: TargetAST }
    | { type: 'exert_inkwell', amount: number, target?: TargetAST }
    | { type: 'conditional_stat_buff_while_item_in_discard', stat: string, amount: number }
    | { type: 'ability_cost_reduction', abilityName: string, amount: 'free' | number }
    | { type: 'challenge_trigger_buff_others', stat: string, amount: number, duration: string }
    | { type: 'prevent_damage_high_strength', minStrength: number }
    | { type: 'play_action_trigger_buff', stat: string, amount: number, target: TargetAST }
    | { type: 'item_banish_return_item', filter: any }
    | { type: 'return_multiple_items', amount: number }
    | { type: 'quest_play_item_free' }
    | { type: 'quest_debuff_chosen', stat: string, amount: number, target: TargetAST }
    | { type: 'inkwell_trigger_debuff', stat: string, amount: number }
    | { type: 'conditional_resist_no_damage', resistAmount: number }
    | { type: 'quest_play_ally_free', filter: any }
    | { type: 'increase_play_cost', amount: number, filter: any }
    | { type: 'stat_buff_per_damage', stat: string, scaling: any }
    | { type: 'opponent_play_reveal_and_discard' }
    | { type: 'opponent_play_return_self' }
    | { type: 'while_challenging_debuff_challenger', stat: string, amount: number }
    | { type: 'conditional_buff_subtype_in_play', stat: string, amount: number, subtype: string, count?: number }
    | { type: 'conditional_multi_buff_subtype_count', stats: any[], subtype: string, minCount: number }
    | { type: 'activated_return_subtype_from_discard', cost: any, subtype: string }
    | { type: 'conditional_gain_keyword_while_damaged', keyword: string }
    | { type: 'multi_target_damage', targets: TargetAST[], damage: number }
    | { type: 'quest_gain_equal_cost_ink' }
    | { type: 'exert_banish_damaged' }
    | { type: 'play_trigger_draw_opponent' }
    | { type: 'reveal_hand_opponent_choice_discard' }
    | { type: 'shift_cost_reduction_subtype', amount: number, subtype: string }
    | { type: 'challenge_banish_both' }
    | { type: 'quest_gain_ink_equal_cost' }
    | { type: 'exert_banish_chosen_damaged' }
    | { type: 'play_trigger_opponent_draws' }
    | { type: 'play_reveal_opponent_hand_choice_discard' }
    | { type: 'reduce_shift_cost_subtype', amount: number, subtype: string }
    | { type: 'challenge_banish_both_characters' }
    | { type: 'deal_damage_each_exerted', damage: number }
    | { type: 'play_trigger_damage_self', damage: number }
    | { type: 'challenge_damage_all_damaged', damage: number }
    | { type: 'damage_on_being_challenged', damage: number, target: string }
    | { type: 'while_exerted_buff_others', stat: string, amount: number, filter: any }

    // Batch 7: Complex "When You Play"
    | { type: 'choice', choices: EffectAST[] }
    | { type: 'restriction', restriction: string, target: TargetAST, duration?: string }

    | { type: 'play_from_inkwell', filter?: any, free?: boolean }
    | { type: 'shuffle_from_discard', target: TargetAST }
    | { type: 'move_hand_to_bottom_deck' }
    | { type: 'balance_hand', amount: number }
    | { type: 'move_to_top_or_bottom', target: TargetAST, destination: 'top' | 'bottom' }

    // Control flow
    | { type: 'sequence', effects: EffectAST[] }
    | { type: 'conditional', condition: ConditionAST, effect: EffectAST, else?: EffectAST }
    | { type: 'for_each', variable: string, source?: TargetAST, in?: TargetAST, effect: EffectAST }
    | { type: 'area_effect', target: TargetAST }
    | { type: 'return_multiple_with_cost_filter', amount: number, maxCost: number, filter: any }
    | { type: 'put_top_card_under', target: TargetAST }
    | { type: 'play_for_free', filter: any, optional?: boolean }
    | { type: 'reveal_top_card', amount?: number }
    | { type: 'mill', amount: number, target: TargetAST }
    | { type: 'look_and_move_to_top_or_bottom', amount: number, target: TargetAST }
    | { type: 'play_revealed_card_for_free' }
    | { type: 'modal', options: { effects: EffectAST[] }[] }
    | { type: 'opponent_choice_damage', amount: number }
    | { type: 'one_to_hand_rest_bottom', amount: number }
    | { type: 'exert_ally_for_damage', target: TargetAST }
    | { type: 'look_and_distribute', amount: number, distribution: any }
    | { type: 'hand_to_inkwell_all', target: TargetAST, facedown?: boolean, exerted?: boolean }

    // Metadata effects (not executable, just informational)
    | { type: 'alternate_sing_cost', cost?: any }
    | { type: 'sing_cost', minCost?: number }
    | { type: 'keyword', keyword: string, keywordValue?: string, keywordValueNumber?: number };
