/**
 * PARSER PATTERN ORDERING GUIDE
 * 
 * CRITICAL: Pattern order matters! Patterns are checked sequentially.
 * Follow this hierarchy: SPECIFIC → GENERIC, COMPLEX → SIMPLE
 * 
 * === TIER 1: MOST SPECIFIC (Check First) ===
 * - Pattern 0: Conditional effects (if/then)
 * - Batch 3-4: Very specific complex triggers with exact wording
 *   * "look at top X cards" (Pattern 1a)
 *   * "exert up to X chosen characters" (Pattern 1b)
 *   * "play action for free" (Pattern 1c)
 *   * "shuffle from discard" (Pattern 1d)
 *   * "cost reduction" (Pattern 1e)
 *   * "return chosen character to hand" (Pattern 1g)
 *   * "return from discard to hand" (Pattern 1h)
 *   * "opponent discard" (Pattern 1i)
 *   * "exert all damaged" (Pattern 1j)
 *   * "subtype stat boost" (Pattern 1k)
 *   * "reveal and conditional" (Pattern 1l)
 * 
 * === TIER 2: MODERATELY SPECIFIC ===
 * - Pattern 14: While conditions (with specific stat/keyword)
 * - Pattern 16: Chosen character effects
 * - Pattern 42b: Discard manipulation (specific destination)
 * 
 * === TIER 3: BROAD TEMPORAL/STATE (Check After Specific) ===
 * - Batch 5: Temporal/state patterns
 *   * Pattern 1o: "At start of turn" (specific trigger)
 *   * Pattern 1n: "While has no damage" (broad condition)
 *   * Pattern 1p: "During your turn" (very broad scope)
 *   * Pattern 1m: "Enters play exerted" (simple state)
 * 
 * === TIER 4: GENERIC TRIGGERS ===
 * - Pattern 1: Simple draw on play
 * - Pattern 5: Deal damage
 * - Pattern 6: Heal
 * - Pattern 7: Banish
 * - Pattern 8: Return to hand
 * 
 * === TIER 5: KEYWORD-BASED (Check Last) ===
 * - Pattern 2: Singer (keyword with value)
 * - Pattern 2b: Song singing cost
 * - Pattern 3: Shift (keyword with value)
 * - Pattern 4: Boost (keyword with value)
 * - Pattern 9: Simple keywords (Evasive, Bodyguard, Ward, Support, etc.)
 * 
 * === FALLBACK ===
 * - Unrecognized patterns (log for analysis)
 */
