import { AbilityDefinition, Card, generateAbilityId } from './parser-utils';

export function parseKeywords(text: string, card: Card, abilities: AbilityDefinition[]): boolean {
    let processedText = text;
    // console.error("DEBUG: parseKeywords input: [" + text + "]");
    let foundAny = false;
    let keepGoing = true;

    // Helper to process a regex match
    const process = (regex: RegExp, handler: (match: RegExpMatchArray) => void): boolean => {
        const match = processedText.match(regex);
        if (match) {
            handler(match);
            // Remove the matched part from the text to allow finding subsequent keywords
            // We use replace with the exact match string
            processedText = processedText.replace(match[0], '').trim();
            foundAny = true;
            return true;
        }
        return false;
    };

    while (keepGoing && processedText.length > 0) {
        // Strip separators (commas, newlines, carets, bullets)
        processedText = processedText.replace(/^[\s,·•\n]+/, '');
        if (processedText.length === 0) break;

        keepGoing = false;

        // 1. Singer Keyword
        // "Singer 5"
        if (process(/^singer (\d+)/i, (match) => {
            const cost = parseInt(match[1]);
            abilities.push({
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'static',
                keyword: 'singer',
                value: cost,
                effects: [{ type: 'singer', value: cost }],
                rawText: match[0]
            } as any);
        })) { keepGoing = true; continue; }

        // 2. Sing Together Keyword (MOVED HERE - must be before Song Singer Pattern)
        // Match "Sing Together 7" and consume the reminder text in parentheses to prevent double-parsing
        if (process(/^sing together (\d+)(?:\s*\([^)]+\))?/i, (match) => {
            const amount = parseInt(match[1]);
            abilities.push({
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'static',
                keyword: 'sing_together',
                amount,
                effects: [{ type: 'sing_together', amount }],
                rawText: match[0]
            } as any);
        })) { keepGoing = true; continue; }

        // 3. Song Singer Pattern
        // "A character with cost 2 or more can ⟳ to sing this song for free."
        if (process(/cost (\d+) or more.*sing this song/i, (match) => {
            // console.log("DEBUG: Matched Sing Pattern");
            const cost = parseInt(match[1]);
            abilities.push({
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'static',
                keyword: 'sing_cost', // Match test expectation
                value: cost,
                effects: [{ type: 'sing_cost', minCost: cost }],
                rawText: match[0]
            } as any);
        })) { keepGoing = true; continue; }

        // 3. Support Keyword
        if (process(/^support\b/i, (match) => {
            abilities.push({
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'static',
                keyword: 'support',
                effects: [{ type: 'support' }],
                rawText: match[0]
            } as any);
        })) { keepGoing = true; continue; }

        // 4. Evasive Keyword
        if (process(/^evasive\b/i, (match) => {
            abilities.push({
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'static',
                keyword: 'evasive',
                effects: [{ type: 'evasive' }],
                rawText: match[0]
            } as any);
        })) { keepGoing = true; continue; }

        // 5. Ward Keyword
        if (process(/^ward\b/i, (match) => {
            abilities.push({
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'static',
                keyword: 'ward',
                effects: [{ type: 'ward' }],
                rawText: match[0]
            } as any);
        })) { keepGoing = true; continue; }

        // 6. Rush Keyword
        if (process(/^rush\b/i, (match) => {
            abilities.push({
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'static',
                keyword: 'rush',
                effects: [{ type: 'rush' }],
                rawText: match[0]
            } as any);
        })) { keepGoing = true; continue; }

        // 7. Reckless Keyword
        if (process(/^reckless\b/i, (match) => {
            abilities.push({
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'static',
                keyword: 'reckless',
                effects: [{ type: 'reckless' }],
                rawText: match[0]
            } as any);
        })) { keepGoing = true; continue; }

        // 8. Vanish Keyword  
        if (process(/^vanish\b/i, (match) => {
            abilities.push({
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'static',
                keyword: 'vanish',
                effects: [{ type: 'vanish' }],
                rawText: match[0]
            } as any);
        })) { keepGoing = true; continue; }

        // 9. Bodyguard Keyword
        if (process(/^bodyguard\b/i, (match) => {
            abilities.push({
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'static',
                keyword: 'bodyguard',
                effects: [{ type: 'bodyguard' }],
                rawText: match[0]
            } as any);
        })) { keepGoing = true; continue; }

        // 5. Challenger Keyword
        if (process(/^challenger \+(\d+)/i, (match) => {
            const bonus = parseInt(match[1]);
            abilities.push({
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'static',
                keyword: 'challenger',
                value: bonus,
                effects: [{
                    type: 'modify_stats',
                    stat: 'strength',
                    amount: bonus,
                    condition: { type: 'while_challenging' }
                }],
                rawText: match[0]
            } as any);
        })) { keepGoing = true; continue; }

        // 6. Shift and Universal Shift Keywords
        // "Shift 4", "Shift 5 ⬡", "Universal Shift 4", "Shift: Discard..."
        // PHASE 7D: Also handle "Shift 5 (You may pay 5 ⬡ to play this on top of...named X)"
        if (process(/^(universal )?shift(?: |: ?)(?:(\d+)(?: ⬡)?|([^(]+))/i, (match) => {
            const isUniversal = !!match[1];
            let costNum = match[2] ? parseInt(match[2]) : undefined;
            const costText = match[4] ? match[4].trim() : undefined;

            // If no cost yet, try to extract from reminder text if present
            if (!costNum && !costText) {
                const reminderMatch = text.match(/shift\s*\(you may pay (\d+)/i);
                if (reminderMatch) {
                    costNum = parseInt(reminderMatch[1]);
                }
            }

            const cost = costNum !== undefined ? costNum : costText;

            abilities.push({
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'static',
                keyword: isUniversal ? 'universal_shift' : 'shift',
                value: cost,
                effects: [{
                    type: isUniversal ? 'universal_shift' : 'shift',
                    cost
                }],
                rawText: match[0]
            } as any);
        })) { keepGoing = true; continue; }

        // 7. Boost Keyword
        if (process(/^boost (\d+) \u2B21/i, (match) => {
            console.log(`[BOOST PARSER] Matched! Cost: ${match[1]}`);
            const cost = parseInt(match[1]);
            abilities.push({
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'activated',
                keyword: 'boost',
                costs: [{ type: 'ink', amount: cost }],
                cost: { ink: cost },
                effects: [{
                    type: 'boost',
                    cost
                }],
                rawText: match[0]
            } as any);
        })) { keepGoing = true; continue; }

        // 8. Resist Keyword
        if (process(/^resist \+(\d+)/i, (match) => {
            const amount = parseInt(match[1]);
            abilities.push({
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'static',
                keyword: 'resist',
                value: amount,
                effects: [{ type: 'resist', amount }],
                rawText: match[0]
            } as any);
        })) { keepGoing = true; continue; }

        // 10. Vanish Keyword
        if (process(/^vanish\b/i, (match) => {
            abilities.push({
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'static',
                keyword: 'vanish',
                effects: [{ type: 'vanish' }],
                rawText: match[0]
            } as any);
        })) { keepGoing = true; continue; }

        // Alert Keyword
        if (process(/^alert\b/i, (match) => {
            abilities.push({
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'static',
                keyword: 'alert',
                effects: [{ type: 'alert' }],
                rawText: match[0]
            } as any);
        })) { keepGoing = true; continue; }

        // 11. Simple Keywords (Rush, Evasive, Ward, Reckless)
        if (process(/^(rush|evasive|ward|reckless)\b/i, (match) => {
            const keyword = match[1].toLowerCase();
            const keywordCap = keyword.charAt(0).toUpperCase() + keyword.slice(1);
            abilities.push({
                id: generateAbilityId(),
                cardId: card.id.toString(),
                type: 'static',
                keyword,
                effects: [{ type: 'grant_keyword', keyword: keywordCap, target: { type: 'self' } }],
                rawText: match[0]
            } as any);
        })) { keepGoing = true; continue; }
    }

    return foundAny;
}
