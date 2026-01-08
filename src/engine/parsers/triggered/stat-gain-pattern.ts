// Pattern for "chosen character gains +X stat this turn"
// Examples:
// - "When you play this character, chosen character gains +2 strength this turn."
// - "Whenever this character quests, chosen character gains +1 willpower this turn."

import { TriggerPattern } from './types';
import { GameEvent, generateAbilityId } from '../parser-utils';

export const STAT_GAIN_PATTERN: TriggerPattern = {
    pattern: /chosen (?:opposing )?character (?:gets|gains) ([+-]\d+) (strength|willpower|lore|¤|◊|⛉) (?:this turn|until the start of your next turn)/i,
    handler: (match, card, text) => {
        const modifier = parseInt(match[1]);
        const statRaw = match[2].toLowerCase();

        // Map stat names to internal representation
        const statMap: Record<string, string> = {
            'strength': 'strength',
            '¤': 'strength',
            'willpower': 'willpower',
            '◊': 'willpower',
            'lore': 'lore',
            '⛉': 'lore'
        };

        const stat = statMap[statRaw] || statRaw;
        const duration = text.includes('until the start of your next turn')
            ? 'until_start_of_next_turn'
            : 'this_turn';

        return {
            id: generateAbilityId(),
            cardId: card.id.toString(),
            type: 'triggered',
            event: null, // Will be set by caller (on-play or on-quest)
            effects: [{
                type: 'modify_stats',
                target: {
                    type: 'chosen_character',
                    opposing: text.toLowerCase().includes('opposing')
                },
                stat,
                amount: modifier,
                duration
            }],
            rawText: text
        } as any;
    }
};
