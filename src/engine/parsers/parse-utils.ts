import { parseStaticEffects } from './static-effect-parser';

/**
 * Component parsers for compositional ability parsing
 * Breaks abilities into: Trigger → Agent → Action → Target → Filter
 */

export interface AgentDescriptor {
    type: 'player' | 'opponent' | 'chosen_opponent' | 'chosen_character' | 'referenced_character' | 'all_players';
    filter?: any;
}

export interface ActionDescriptor {
    verb: string;
    modifiers?: string[];
}

export interface TargetDescriptor {
    type: string;
    amount?: number;
    filter?: any;
}

export interface FilterDescriptor {
    [key: string]: any;
}

/**
 * Parse agent from text
 * "chosen opponent" → { type: 'chosen_opponent' }
 * "you" → { type: 'player' }
 * "that character" → { type: 'referenced_character' }
 */
export function parseAgent(text: string): AgentDescriptor | null {
    const normalized = text.toLowerCase().trim();

    if (normalized.includes('chosen opponent')) {
        return { type: 'chosen_opponent' };
    }
    if (normalized.includes('opponent')) {
        return { type: 'opponent' };
    }
    if (normalized.includes('you')) {
        return { type: 'player' };
    }
    if (normalized.includes('that character')) {
        return { type: 'referenced_character' };
    }
    if (normalized.includes('chosen character')) {
        return { type: 'chosen_character' };
    }
    if (normalized.includes('each illumineer')) {
        return { type: 'all_players' };
    }

    return null;
}

/**
 * Parse action verb and modifiers
 * "chooses and discards" → [{ verb: 'choose' }, { verb: 'discard' }]
 * "gains" → { verb: 'gain' }
 */
export function parseAction(text: string): ActionDescriptor[] {
    const normalized = text.toLowerCase().trim();
    const actions: ActionDescriptor[] = [];

    // Split compound actions
    const parts = normalized.split(' and ').map(p => p.trim());

    for (const part of parts) {
        if (part.includes('discard')) {
            actions.push({ verb: 'discard' });
        } else if (part.includes('choose')) {
            actions.push({ verb: 'choose' });
        } else if (part.includes('gain')) {
            actions.push({ verb: 'gain' });
        } else if (part.includes('remove')) {
            actions.push({ verb: 'remove' });
        } else if (part.includes('draw')) {
            actions.push({ verb: 'draw' });
        } else if (part.includes('search')) {
            actions.push({ verb: 'search' });
        } else if (part.includes('reveal')) {
            actions.push({ verb: 'reveal' });
        }
    }

    return actions;
}

/**
 * Parse target from text
 * "a card" → { type: 'card', amount: 1 }
 * "Evasive" → { type: 'keyword', value: 'evasive' }
 */
export function parseTarget(text: string): TargetDescriptor | null {
    const normalized = text.toLowerCase().trim();

    // Keyword detection
    const keywords = ['evasive', 'bodyguard', 'challenger', 'resist', 'shift', 'support', 'rush', 'reckless'];
    for (const keyword of keywords) {
        if (normalized.includes(keyword)) {
            return { type: 'keyword', filter: { keyword } };
        }
    }

    // Card amount
    const cardMatch = normalized.match(/(\d+)?\s*cards?/);
    if (cardMatch) {
        return {
            type: 'card',
            amount: cardMatch[1] ? parseInt(cardMatch[1]) : 1
        };
    }

    // Character
    if (normalized.includes('character')) {
        const amountMatch = normalized.match(/(\d+)\s*characters?/);
        return {
            type: 'character',
            amount: amountMatch ? parseInt(amountMatch[1]) : 1
        };
    }

    // Damage
    if (normalized.includes('damage')) {
        const amountMatch = normalized.match(/(\d+)\s*damage/);
        return {
            type: 'damage',
            amount: amountMatch ? parseInt(amountMatch[1]) : 1
        };
    }

    return null;
}

/**
 * Parse filter from text
 * "with cost 3 or less" → { maxCost: 3 }
 * "opposing" → { opponent: true }
 */
export function parseFilter(text: string): FilterDescriptor {
    const normalized = text.toLowerCase().trim();
    const filter: FilterDescriptor = {};

    // Opposing/opponent
    if (normalized.includes('opposing') || normalized.includes('opponent')) {
        filter.opponent = true;
    }

    // Own/yours
    if (normalized.includes('your') || normalized.includes('of yours')) {
        filter.owned = true;
    }

    // Cost filter
    const costMatch = normalized.match(/cost (\d+) or less/);
    if (costMatch) {
        filter.maxCost = parseInt(costMatch[1]);
    }

    // Damaged
    if (normalized.includes('damaged')) {
        filter.damaged = true;
    }

    // Exerted
    if (normalized.includes('exerted')) {
        filter.exerted = true;
    }

    // Character type filter (e.g., "Musketeer")
    const typeMatch = normalized.match(/\bof your ([A-Z][a-z]+) characters/);
    if (typeMatch) {
        filter.characterType = typeMatch[1];
    }

    return filter;
}

/**
 * Parse compound effect text into multiple effects
 * Handles period-separated and comma-separated compound structures
 */
export function parseCompoundEffect(text: string): any[] {
    const effects: any[] = [];

    // Try parsing with existing effect parser first
    const parsedEffects = parseStaticEffects(text);
    if (parsedEffects.length > 0) {
        return parsedEffects;
    }

    // Split by periods for distinct abilities
    const segments = text.split(/\.\s+/).filter(s => s.trim().length > 0);

    for (const segment of segments) {
        const segmentEffects = parseStaticEffects(segment);
        if (segmentEffects.length > 0) {
            effects.push(...segmentEffects);
        }
    }

    return effects;
}

/**
 * Parse "while X, Y" conditional structures
 * "While this item is in play, that character gains Evasive"
 */
export function parseWhileConditional(text: string): { condition: string; effect: string } | null {
    const match = text.match(/while (.+?), (.+)/i);
    if (match) {
        return {
            condition: match[1].trim(),
            effect: match[2].trim()
        };
    }
    return null;
}

/**
 * Parse "choose X. Y" structures
 * "choose a character of yours. While this item is in play, that character gains Evasive"
 */
export function parseChooseThen(text: string): { choose: string; then: string } | null {
    const match = text.match(/choose (.+?)\.\s+(.+)/i);
    if (match) {
        return {
            choose: match[1].trim(),
            then: match[2].trim()
        };
    }
    return null;
}
