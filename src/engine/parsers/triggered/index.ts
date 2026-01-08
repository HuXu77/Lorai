import { TriggerPattern } from './types';
import { ON_PLAY_PATTERNS } from './on-play';
import { getOnQuestPatterns } from './on-quest';
import { TURN_BASED_PATTERNS } from './turn-based';
import { getCombatPatterns } from './combat';
import { ON_MOVE_PATTERNS } from './on-move';
import { MISC_PATTERNS } from './misc';
import { ACTION_EFFECT_PATTERNS } from './action-effects';

export function getTriggerPatterns(): TriggerPattern[] {
    return [
        ...ON_PLAY_PATTERNS,
        ...getOnQuestPatterns(),
        ...TURN_BASED_PATTERNS,
        ...getCombatPatterns(),
        ...ON_MOVE_PATTERNS,
        ...ACTION_EFFECT_PATTERNS,
        ...MISC_PATTERNS,
    ];
}
