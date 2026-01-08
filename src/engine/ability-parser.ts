/**
 * NEW Parser: Convert card text into structured ability definitions
 * Replaces old EffectParser with modern event-driven architecture
 */

import { Card } from './models';
import { AbilityDefinition, TriggeredAbility, StaticAbility, ActivatedAbility } from './abilities/types';
import { parseTriggered } from './parsers/triggered-parser';
import { parseActivated } from './parsers/activated-parser';
import { parseStatic } from './parsers/static-parser';
import { parseKeywords } from './parsers/keyword-parser';
import { stripAbilityName } from './parsers/ability-cleaner';

/**
 * Detect ability duration based on text patterns
 */
function detectAbilityDuration(text: string): 'permanent' | 'until_end_of_turn' | 'next_turn_start' | 'while_condition' | undefined {
    const lowerText = text.toLowerCase();

    // Specific duration: Until next turn start
    if (lowerText.includes('until the start of your next turn')) {
        return 'next_turn_start';
    }

    // Check for temporary duration markers (End of Turn)
    if (lowerText.includes('this turn') || lowerText.includes('until the end of turn') || lowerText.includes('for the rest of this turn')) {
        return 'until_end_of_turn';
    }

    // Check for conditional/while effects
    if (lowerText.startsWith('while ') || lowerText.includes(' while ')) {
        return 'while_condition';
    }

    // Default to permanent
    return 'permanent';
}

// Debug logging: Enable with PARSER_LOG=true
export const PARSER_LOG = process.env.PARSER_LOG === 'true';
export function log(...args: any[]) {
    if (PARSER_LOG) {
        console.log('[PARSER]', ...args);
    }
}

// Debug mode: Throw errors on parse failures for easier debugging
// Enable with: PARSER_DEBUG=true npm test
export const PARSER_DEBUG_MODE = process.env.PARSER_DEBUG === 'true';
// Re-export for test utilities
export type { AbilityDefinition, TriggeredAbility, StaticAbility, ActivatedAbility } from './abilities/types';

/**
 * Parse card text to AbilityDefinitions (NEW FORMAT)
 * 
 * This is the new parser that outputs event-driven ability definitions.
 */

export function parseToAbilityDefinition(card: Card): AbilityDefinition[] {
    const abilities: AbilityDefinition[] = [];
    if (PARSER_LOG) {
        log(`\n=== PARSING CARD: ${card.name}  ===`);
    }

    // Extract text from abilities array OR fullTextSections (for songs)
    // For triggered abilities, prefer 'effect' field (cleaner text without ability name)
    // Otherwise use 'fullText' for backward compatibility
    let abilityTexts: (string | { text: string; usingFullText: boolean })[] = [];

    if (card.abilities && card.abilities.length > 0) {
        // Regular cards with abilities array
        abilityTexts = card.abilities.map((a: any) => {
            // Handle simple string abilities (test data format)
            if (typeof a === 'string') {
                return a; // Return as-is, will need stripping
            }

            const ability = a;

            // NEW: Handle structured keywords (from test generator)
            // Keywords have type: "keyword", keyword: "Shift", fullText with reminder text
            if (ability.type === 'keyword' && ability.keyword) {
                // Use fullText but strip reminder text in parentheses
                // This preserves symbols like ⬡ that are part of the keyword's fullText
                // Fallback to keyword name if fullText is missing (fixes tests with incomplete data)
                let text = ability.fullText || ability.keyword || '';
                // Strip reminder text in parentheses for keywords
                text = text.replace(/\([^)]+\)/g, '').trim();
                console.log(`[KEYWORD EXTRACTION] ${ability.keyword}: "${text}"`);
                // If ability has a 'name' field (caps names like FRESH INK), strip it from fullText
                if (ability.name && text.includes(ability.name)) {
                    // Remove the name from the beginning of the text
                    text = text.replace(new RegExp(`^${ability.name}\\s*`, 'i'), '').trim();
                }
                return { text, usingFullText: true }; // Treat as using fullText for stripping
            }

            // IMPROVED: Prefer 'effect' field (clean text without ability name)
            // Falls back to 'fullText' for keywords (Singer, Bodyguard, etc.)
            let text = ability.effect || ability.fullText || '';

            // PHASE 7D: If ability has a 'name' field (caps names like FRESH INK), strip it from fullText
            if (ability.name && text.includes(ability.name)) {
                log(`    Stripping ability name: "${ability.name}"`);
                // Remove the name from the beginning of the text
                text = text.replace(new RegExp(`^${ability.name}\\s*`, 'i'), '').trim();
                log(`    After name strip: "${text.substring(0, 100)}..."`);
            }

            // Track if we're using fullText (will need stripping)
            const usingFullText = !ability.effect && ability.fullText;

            // Reconstruct cost for activated abilities if separated (common in test data)
            // allCards.json uses 'costsText' field, not 'cost' object
            const costField = (ability as any).costsText || ability.cost;
            if (costField && !text.includes('—')) {
                let costStr = '';

                // If it's a string (costsText), use it directly
                if (typeof costField === 'string') {
                    costStr = costField;
                    log(`    Reconstructing cost from costsText: "${costStr}"`);
                } else if (typeof costField === 'object') {
                    // Legacy cost object format
                    if (costField.ink) costStr += `${costField.ink} \u2B21`;
                    if (costField.exert) costStr += (costStr ? ', ' : '') + '\u27F3';
                    log(`    Reconstructing cost from cost object: "${costStr}"`);
                }

                if (costStr) {
                    text = `${costStr} — ${text}`;
                    log(`    After cost reconstruction: "${text.substring(0, 100)}..."`);
                }
            }

            return { text, usingFullText };
        }).filter(item => {
            if (typeof item === 'string') return item.length > 0;
            return item.text.length > 0;
        });

        // IMPORTANT: For Songs, also append fullTextSections if present
        // Songs have Singer ability in abilities array, but main effect in fullTextSections
        // Only merge for actual Songs (Action cards with Singer ability)
        if ((card as any).fullTextSections && (card as any).fullTextSections.length > 0) {
            const sections = (card as any).fullTextSections.filter((t: string) => t && t.length > 0);

            // Detect if this is a Song: Action type + has Singer ability text
            const isSong = card.type === 'Action' && card.abilities.some((a: any) =>
                (a.effect || a.fullText || '').match(/sing this song for free/i)
            );

            // Only merge additional sections for Songs
            if (isSong && sections.length > card.abilities.length) {
                log(`Found ${sections.length} fullTextSections vs ${card.abilities.length} abilities - merging additional sections (Song)`);
                abilityTexts = [...abilityTexts, ...sections];
            }
        }
    } else if ((card as any).fullTextSections && (card as any).fullTextSections.length > 0) {
        // Songs and other cards that use fullTextSections instead of abilities array
        // These are already clean text, return as strings
        log(`Found ${(card as any).fullTextSections.length} fullTextSections (no abilities array)`);
        log(`DEBUG: fullTextSections content: ${JSON.stringify((card as any).fullTextSections)}`);
        abilityTexts = (card as any).fullTextSections.filter((t: string) => t && t.length > 0);
        log(`DEBUG: abilityTexts length: ${abilityTexts.length}`);
    }

    // Fallback: If no structured abilities found but fullText is present (legacy/test manual mocks)
    if (abilityTexts.length === 0 && (card as any).fullText) {
        log(`No structured abilities found, using fullText fallback: "${(card as any).fullText.substring(0, 50)}..."`);
        abilityTexts = [(card as any).fullText];
    }

    // Skip if no abilities
    if (abilityTexts.length === 0) {
        return abilities;
    }

    // Process each ability text
    for (let i = 0; i < abilityTexts.length; i++) {
        const item = abilityTexts[i];
        let text: string;
        let usingFullText = false;

        if (typeof item === 'string') {
            text = item;
        } else {
            text = item.text;
            usingFullText = item.usingFullText;
        }

        log(`\nProcessing ability ${i + 1}:`);
        log(`  Original: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`);

        // PREPROCESSING: Strip reminder text in parentheses
        // This helps patterns match without interference from explanatory text
        const beforeReminder = text;

        // Exception: Sing ability text often appears as reminder text but IS the ability (e.g. Part of Your World)
        // We match extremely broadly to catch variations "can . to sing"
        // LOGGING to debug specific failure
        const isSingAbility = text.match(/sing this song/i);
        // console.log(`DEBUG: Checking Sing Ability for ["${text.substring(0, 50)}..."]: ${!!isSingAbility}`);

        if (!isSingAbility) {
            text = text.replace(/\([^)]+\)/g, '').trim();
        }

        if (beforeReminder !== text) {
            log(`  After reminder strip: "${text.substring(0, 100)}..."`);
        }

        // PREPROCESSING: Strip ability name ONLY if using fullText OR if it's a raw string (legacy/test data)
        // If we have the clean 'effect' field, no stripping needed!
        if (usingFullText || typeof item === 'string') {
            const beforeStrip = text;
            text = stripAbilityName(text);
            if (beforeStrip !== text) {
                log(`  After name strip: "${text.substring(0, 100)}..."`);
            }
        }

        // Normalize whitespace: replace newlines and multiple spaces with single space
        text = text.replace(/\s+/g, ' ').trim();

        // NOTE: Removed skip logic for sing cost abilities - Song cards need these parsed!
        // Previously we skipped text matching "a character with cost X or more can ⟳ to sing this song"
        // but this was the ONLY ability for many Song cards, so we were skipping valid abilities.

        // Handle compound effects: split on "then" and parse each part
        // Special case: "Name a card, then reveal" should be treated as one unit to preserve context
        if (text.match(/Name a card, then reveal/i)) {
            text = text.replace(/Name a card, then reveal/i, "Name a card and reveal");
        }

        // BATCH 41: Do NOT split by "then" globally.
        // This breaks Activated Abilities where the cost applies to the whole sequence.
        // Instead, let individual parsers (parseActivated, parseTriggered, parseStatic) handle "then" splitting if appropriate.
        // const parts = text.split(/,?\s+then\s+/i);

        // for (const part of parts) {
        //    parseAbilityPart(part.trim(), card, abilities);
        // }

        parseAbilityPart(text.trim(), card, abilities);
    }

    // POST-PROCESSING: Add duration to all abilities based on text patterns
    // Apply to ALL ability types (triggered, activated, static) since effects can be temporary
    for (const ability of abilities) {
        if (!ability.duration) {
            ability.duration = detectAbilityDuration(ability.rawText);
        }
    }

    console.log(`[PARSE COMPLETE] ${card.name}: returning ${abilities.length} abilities`, abilities.map((a: any) => ({ type: a.type, keyword: a.keyword, trigger: a.trigger })));
    return abilities;
}

/**
 * Parse a single ability part (after splitting compounds)
 */
export function parseAbilityPart(text: string, card: Card, abilities: AbilityDefinition[]): void {
    // Early exit for empty text
    if (!text || text.length === 0) return;

    // Pattern: "When X and whenever Y, [effect]"
    // Example: "When you play this character and whenever she quests, you may play a character with cost 2 or less from your discard for free."
    // This should be ONE ability that triggers on BOTH events, not two separate abilities
    const compoundMatch = text.match(/^(When .+?) and (whenever .+?), (.+)$/i);
    if (compoundMatch) {
        const trigger1Text = compoundMatch[1]; // "When you play this character"
        const trigger2Text = compoundMatch[2]; // "whenever she quests"
        const effectText = compoundMatch[3]; // "you may play a character..."

        log(`  ** Detected compound ability: "${trigger1Text}" AND "${trigger2Text}"`);
        log(`     Effect: "${effectText}"`);

        // Instead of splitting, parse as a SINGLE ability with MULTIPLE events
        // We'll construct the full text and let the triggered parser handle it
        // The triggered parser should recognize this pattern and create an ability with events array

        // Try parsing the compound form directly first
        // This allows specific parsers (like on-play.ts) to handle it as one ability
        if (parseAbilityStructured(text, card, abilities)) {
            log(`  ✅ Compound ability parsed as single ability with multiple events`);
            return;
        }

        // Fallback: If no parser handles the compound form, split it
        // (This maintains backward compatibility if no parser pattern matches)
        log(`  ⚠️  No parser handled compound form, falling back to split`);
        const ability1 = `${trigger1Text}, ${effectText}`;
        const ability2 = `${trigger2Text.charAt(0).toUpperCase() + trigger2Text.slice(1)}, ${effectText}`;

        parseAbilityPart(ability1, card, abilities);
        parseAbilityPart(ability2, card, abilities);
        return;
    }


    // USE NEW STRUCTURED PARSER ONLY
    parseAbilityStructured(text, card, abilities);
}

export function parseAbilityStructured(text: string, card: Card, abilities: AbilityDefinition[]): boolean {
    log(`  >> Trying parseAbilityStructured on: "${text.substring(0, 80)}${text.length > 80 ? '...' : ''}"`);

    // 1. Activated Abilities (Check first to catch "Banish this item — Effect")
    log(`    Trying parseActivated...`);
    if (parseActivated(text, card, abilities)) {
        log(`    ✅ parseActivated succeeded`);
        if (text.includes("choose one") || text.includes("banished")) {
            console.log("[DEBUG PARSER] Hijacked by Activated Parser!");
        }
        return true;
    }

    // 2. Triggered Abilities
    log(`    Trying parseTriggered...`);
    // ==========================================================================
    // Phase 1: Check Triggered Abilities (on_play, on_quest, when challenged, etc.)
    // ==========================================================================

    if (parseTriggered(text, card, abilities)) {
        log(`    ✅ parseTriggered succeeded`);
        return true;
    }

    // 3. Keywords (often single words or simple phrases)
    log(`    Trying parseKeywords...`);
    if (parseKeywords(text, card, abilities)) {
        log(`    ✅ parseKeywords succeeded`);
        return true;
    }

    // 4. Static Abilities
    log(`    Trying parseStatic...`);

    // TRIGGER GUARD: If text looks like a trigger but parseTriggered failed, do NOT attempt parseStatic
    // This forces the fallback mechanism in parseAbilityPart to split the compound trigger.
    if (text.match(/^(when|whenever|at the (start|end))/i)) {
        log(`    ⚠️ Text looks like a trigger but parseTriggered failed. Skipping parseStatic to force splitting.`);
        return false;
    }

    if (parseStatic(text, card, abilities)) {
        log(`    ✅ parseStatic succeeded`);
        return true;
    }

    // 4. Fallback for Action Cards: Treat as "Resolution" ability (implicit on_play)
    // If it didn't match Activated, Triggered, or Static, and it's an Action card,
    // assume it's the spell effect itself.
    if (card.type === 'Action') {
        log(`    Info: Action card ability didn't match standard patterns. Treating as Resolution ability.`);

        // Prepend "When you play this action, " and call parseTriggered
        const syntheticText = `When you play this action, ${text.charAt(0).toLowerCase() + text.slice(1)}`;
        log(`    Trying synthetic trigger: "${syntheticText}"`);
        if (parseTriggered(syntheticText, card, abilities)) {
            log(`    ✅ Parsed as synthetic on_play trigger`);
            return true;
        }
    }

    log(`    ❌ All parsers failed for this text`);
    return false;
}


