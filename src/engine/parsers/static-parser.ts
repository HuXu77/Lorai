import { AbilityDefinition, Card } from './parser-utils';
import { STATIC_PATTERNS } from './static-patterns';

export function parseStatic(text: string, card: Card, abilities: AbilityDefinition[]): boolean {
    // Check Pattern Table
    for (const { pattern, createAbility } of STATIC_PATTERNS) {
        const match = text.match(pattern);
        if (match) {
            const ability = createAbility(match, card, text);
            if (ability) {
                abilities.push(ability);
                return true;
            }
        }
    }

    // If no pattern matched, return false
    return false;
}
