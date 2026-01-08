/**
 * Combat Module - Challenge and banishment handlers
 * 
 * Extracted from TurnManager to reduce file size and improve modularity.
 * Handles character combat, damage application, and banishment.
 */

export { executeChallenge, canChallenge } from './challenge';
export { checkBanishment, banishCard, triggerBanishEffects } from './banishment';
