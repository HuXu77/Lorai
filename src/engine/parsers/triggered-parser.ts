import { AbilityDefinition, Card } from './parser-utils';
import { getTriggerPatterns } from './triggered/index';

export function parseTriggered(text: string, card: Card, abilities: AbilityDefinition[]): boolean {
    // Normalize text to handle newlines
    let cleanText = text.replace(/\\n/g, ' ').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();


    let turnCondition: any = undefined;

    // Text cleaners (for simplification)
    // Handle "During your turn" prefix
    if (text.match(/^(?:once )?during your turn, (.+)/i)) {
        const remaining = text.match(/^(?:once )?during your turn, (.+)/i)![1];
        // Re-normalize the remaining text
        cleanText = remaining.replace(/\\n/g, ' ').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
        turnCondition = 'during_your_turn';
    }

    // 0. Check Pattern Table (Refactoring Phase 4)
    const patterns = getTriggerPatterns();

    for (let i = 0; i < patterns.length; i++) {
        const { pattern, handler } = patterns[i];

        const match = cleanText.match(pattern);
        if (match) {
            try {
                const result = handler(match, card, text); // Pass original text for rawText
                if (result) {
                    if (turnCondition) {
                        // Apply turn condition to result(s)
                        const conditionObj = { type: turnCondition };

                        if (Array.isArray(result)) {
                            result.forEach(ability => {
                                if (!ability.eventConditions) ability.eventConditions = [];
                                ability.eventConditions.push(conditionObj);
                            });
                        } else {
                            if (!result.eventConditions) result.eventConditions = [];
                            result.eventConditions.push(conditionObj);
                        }
                    }

                    // Handle both single ability and array of abilities (compound patterns)
                    if (Array.isArray(result)) {
                        abilities.push(...result);
                    } else {
                        abilities.push(result);
                    }
                    return true;
                } else {
                    console.log(`[DEBUG-PARSER] Handler returned NULL for pattern ${i}`);
                }
            } catch (e) {
                console.log(`[DEBUG-PARSER] CAUGHT ERROR pattern ${i}:`, e);
                console.error(`[TRIGGER-ERROR] Handler ${i} failed for text "${text}":`, e);
            }
        }
    }

    console.log(`[DEBUG-PARSER] No match found for: "${cleanText}"`);
    return false;
}
