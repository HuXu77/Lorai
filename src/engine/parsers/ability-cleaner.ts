export const PARSER_LOG = process.env.PARSER_LOG === 'true';

export function log(...args: any[]) {
    if (PARSER_LOG) {
        console.log('[PARSER]', ...args);
    }
}

/**
 * Heuristic to strip ability names/flavor text from the beginning of the string.
 * Looks for common ability starting patterns and removes text preceding them.
 */
export function stripAbilityName(text: string): string {
    const originalText = text;
    // Normalize: Replace newlines with spaces for easier pattern matching
    text = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    // console.log(`[STRIP] Input: "${originalText}" -> Normalized: "${text}"`);

    const specificNamePatterns = [
        /^voice of reason /i,
        /^glean /i,
        /^lead by example /i,
        /^fan the flames /i,
        /^cut to the chase /i,
        /^mark of the hero /i,
        /^show me the beast! /i,
        /^healing glow /i,
        /^you're welcome /i,
        /^wait, what\? /i,
        /^i'm stuck! /i,
        /^just in time /i,
        /^part of your world /i,
        /^bibbidi-bobbidi-boo /i,
        /^mother knows best /i,
        /^let it go /i,
        /^grab your sword /i,
        /^dragon fire /i,
        /^a whole new world /i,
        /^be prepared /i,
        /^friends on the other side /i,
        /^do it again! /i,
        /^develop your brain /i,
        /^one jump ahead /i,
        /^reflection /i,
        /^smash /i,
        /^stampede /i,
        /^steal from the rich /i,
        /^sudden chill /i,
        /^tangle /i,
        /^the queen's castle /i,
        /^you have forgotten me /i,
        /^zero to hero /i,
        /^to the rescue /i,
        /^here's the trade-off /i,
        /^stolen away /i,
        /^we have to come together /i,
        /^how do you do\?\s+/i,
        /^fervent address /i,
        /^animate broom /i,
        /^there's trouble a-brewin' /i,
        /^under arrest /i,
        /^full of spirit /i,
        /^pick one! /i,
        /^not without my family /i,
        /^on your marks! /i, // BATCH 48: Sugar Rush Speedway  
        /^eternal winter /i, // BATCH 48: Elsa's Ice Palace
        /^rowdy guest /i, // BATCH 48: Ed
        /^pick your fights /i, // BATCH 19: John Silver
        /^i'll take that /i, // Flynn Rider - Spectral Scoundrel
    ];

    const triggerPatterns = [
        // Activated ability costs
        /\u27F3/, // Exert symbol
        /(?<!pay )\d+ \u2B21/, // Ink cost (e.g. "2 ⬡"), but not "pay 1 ⬡"
        /banish this item/i,
        /put this card into your inkwell/i,

        // Campaign Jafar actions (prevent stripping "Jafar" as a name)
        /^jafar /i,

        // Triggered ability starts
        /when /i,
        /whenever /i,
        /(?<!ready )at the (start|end) of/i,
        /during (your|opponents'|each player's) turn/i,

        // Cost starts (for activated abilities with names)
        /exert/i,
        /pay \d+/i,

        // Static ability starts
        /your characters/i,
        /characters named/i,
        // Only match "this character" when it's clearly starting a static ability, not in the middle
        /this character (gets|has|gains|can't|can)/i,  // Only at start + verb
        /(?<!banish )chosen (character|item|location|opponent)/i, // Don't strip "banish chosen" (action cards)
        /each (player|opponent|character)/i,
        /opposing (characters|items|locations)/i,
        /other (characters|items)/i,
        /(villain|hero|princess|alien|sorcerer|dreamborn|floodborn|storyborn) characters/i, // Subtype starts
        /while (this character|you have|damaging|challenging|at a location)/i,
        /you may/i,
        /gain \d+ lore/i,
        /draw \d+ cards/i,
        /look at the top/i,
        /reveal the top/i,
        /return (a|chosen|all)/i,
        /exert (chosen|all)/i,
        /deal \d+ damage/i,
        /put (a|the|chosen)/i,
        /ready (chosen|all)/i,
        /remove (up to )?\d+ damage/i,
        /move (up to )?\d+ damage/i,
        /prevent /i,
        /skip your/i, // Arthur
        /opponents need/i, // Donald Duck
        /if you have/i, // Desperate Plan
        /if chosen opponent/i, // BATCH 48: Remember Who You Are
        /once per turn/i, // Sugar Rush Speedway
        /once during your turn/i, // Raya
        /banish all/i, // BATCH 45: Mass banish action cards
        /the opposing/i, // BATCH 45: Opponent choice effects
        /each opposing player/i, // BATCH 35: Entangling Magic
        /shift \d+/i, // BATCH 49: Shift keyword
        /boost \d+/i, // BATCH 49: Boost keyword
        /choose one/i, // Modal choice start
    ];

    const genericNamePatterns = [
        // Generic lowercase ability names - detect by common terminators
        // Use lookahead (?=...) to match the name but NOT consume the trigger
        /^(?!you )[a-z][a-z\s\',-]+?(?= (?:you |your |when you|whenever|at the end|⟳,|characters with|during your|if ))/i,
    ];

    // 1. Try specific patterns first (highest priority)
    for (const pattern of specificNamePatterns) {
        const match = text.match(pattern);
        if (match && match.index === 0) {
            const matchEnd = match[0].length;
            // console.log(`Stripping specific ability name: "${text.substring(0, matchEnd)}"`);
            return text.substring(matchEnd).trim();
        }
    }

    let bestSplitIndex = -1;

    // IMPORTANT: Don't strip ability text that starts with action keywords  
    // Action cards often start with "Banish chosen...", "Exert chosen...", "Chosen opponent...", etc and this is the actual effect
    // These are direct effects, not ability names to be stripped
    if (text.match(/^(banish|exert|ready|deal|draw|look|reveal|return|put|remove|gain|chosen|choose|move|prevent|skip|each|your|sing|during|if)/i)) {
        log(`  [STRIP] Skipping strip - text starts with action keyword`);
        return text; // Don't strip - this is likely an action card effect
    }

    // Find the first trigger/ability pattern
    for (const pattern of triggerPatterns) {
        const match = text.match(pattern);
        if (match && match.index !== undefined) {
            // If found, the split point is the START of the match (we keep the trigger)
            if (bestSplitIndex === -1 || match.index < bestSplitIndex) {
                bestSplitIndex = match.index;
            }
        }
    }

    // 3. Try generic name patterns
    for (const pattern of genericNamePatterns) {
        const match = text.match(pattern);
        if (match && match.index === 0) {
            const matchEnd = match[0].length;
            // matchEnd is the end of the name (because of lookahead)
            // This is the split point.
            // We only use this if it's EARLIER than any trigger found (or no trigger found yet)

            if (bestSplitIndex === -1 || matchEnd < bestSplitIndex) {
                bestSplitIndex = matchEnd;
            }
        }
    }

    // Check if we found a split point
    if (bestSplitIndex > 0) {
        // console.log(`Stripping ability name: "${text.substring(0, bestSplitIndex)}" from "${text}"`);
        return text.substring(bestSplitIndex).trim();
    }

    return text;
}
