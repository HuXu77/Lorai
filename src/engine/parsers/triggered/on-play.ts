import { TriggerPattern } from './types';
import { DAMAGE_PATTERNS } from './on-play/damage';
import { CARD_MANIPULATION_PATTERNS } from './on-play/card-manipulation';
import { CONTROL_PATTERNS } from './on-play/control';
import { STATS_PATTERNS } from './on-play/stats';
import { GENERAL_PATTERNS } from './on-play/general';

// On-Play triggers are checked in order. Specific patterns should appear before generic ones.
// Order:
// 1. STATS: Often has "gain X lore" which is specific but can be generic. Most are distinct.
// 2. DAMAGE: "Deal X damage". Very distinct.
// 3. CONTROL: "Return to hand", "Exert". Distinct.
// 4. CARD: "Draw", "Search". Distinct.
// 5. GENERAL: Captures "When you play this character, [Static Effect]" which is the catch-all.
export const ON_PLAY_PATTERNS: TriggerPattern[] = [
    ...STATS_PATTERNS,
    ...DAMAGE_PATTERNS,
    ...CONTROL_PATTERNS,
    ...CARD_MANIPULATION_PATTERNS,
    ...GENERAL_PATTERNS,
];
