/**
 * Tests for ability-helpers.ts
 * Ensures consistent ability detection across the application
 */

import {
    getBoostCost,
    hasBoost,
    getShiftCost,
    hasShift,
    hasAbilityKeyword,
    isSong,
    getEligibleSingers,
    getActivatedAbilities,
    parseStatModification,
    getBoostAbilityIndex
} from '../../utils/ability-helpers';
import { CardInstance, CardType } from '../../engine/models';

// Helper to create test card
function createTestCard(overrides: Partial<CardInstance> = {}): CardInstance {
    return {
        instanceId: 'test-card-1',
        definitionId: 'test-def',
        name: 'Test Card',
        fullName: 'Test Card - Version',
        type: 'Character' as any, // Runtime type is string
        cost: 3,
        strength: 2,
        willpower: 3,
        lore: 1,
        inkwell: true,
        ready: true,
        damage: 0,
        zone: 'play' as any,
        turnPlayed: 0,
        subtypes: [],
        parsedEffects: [],
        ...overrides
    } as CardInstance;
}

describe('ability-helpers', () => {

    // ========================================================================
    // BOOST DETECTION
    // ========================================================================

    describe('getBoostCost', () => {
        it('returns cost from activated boost ability with nested effects', () => {
            const card = createTestCard({
                parsedEffects: [{
                    trigger: 'activated',
                    cost: { ink: 2 },
                    effects: [{ type: 'boost', cost: 2 }]
                }]
            });
            expect(getBoostCost(card)).toBe(2);
        });

        it('returns cost from direct boost type', () => {
            const card = createTestCard({
                parsedEffects: [{ type: 'boost', cost: 3 }]
            });
            expect(getBoostCost(card)).toBe(3);
        });

        it('returns cost from keyword type (Flynn Rider style)', () => {
            const card = createTestCard({
                parsedEffects: [{
                    type: 'keyword',
                    keyword: 'Boost',
                    keywordValueNumber: 2
                }]
            });
            expect(getBoostCost(card)).toBe(2);
        });

        it('returns null for cards without boost', () => {
            const card = createTestCard({
                parsedEffects: [{ type: 'rush' }]
            });
            expect(getBoostCost(card)).toBeNull();
        });

        it('returns null for cards with no parsedEffects', () => {
            const card = createTestCard({ parsedEffects: undefined });
            expect(getBoostCost(card)).toBeNull();
        });
    });

    describe('hasBoost', () => {
        it('returns true when card has boost', () => {
            const card = createTestCard({
                parsedEffects: [{
                    trigger: 'activated',
                    effects: [{ type: 'boost', cost: 2 }]
                }]
            });
            expect(hasBoost(card)).toBe(true);
        });

        it('returns false when card has no boost', () => {
            const card = createTestCard({ parsedEffects: [] });
            expect(hasBoost(card)).toBe(false);
        });
    });

    // ========================================================================
    // SHIFT DETECTION
    // ========================================================================

    describe('getShiftCost', () => {
        it('returns cost from keyword_shift action', () => {
            const card = createTestCard({
                parsedEffects: [{ action: 'keyword_shift', shiftCost: 4 }]
            });
            expect(getShiftCost(card)).toBe(4);
        });

        it('returns null for cards without shift', () => {
            const card = createTestCard({ parsedEffects: [] });
            expect(getShiftCost(card)).toBeNull();
        });
    });

    // ========================================================================
    // KEYWORD DETECTION
    // ========================================================================

    describe('hasAbilityKeyword', () => {
        it('detects keyword from action field', () => {
            const card = createTestCard({
                parsedEffects: [{ action: 'keyword_rush' }]
            });
            expect(hasAbilityKeyword(card, 'rush')).toBe(true);
        });

        it('detects keyword from type field', () => {
            const card = createTestCard({
                parsedEffects: [{ type: 'keyword', keyword: 'evasive' }]
            });
            expect(hasAbilityKeyword(card, 'evasive')).toBe(true);
        });

        it('detects keyword from nested effects', () => {
            const card = createTestCard({
                parsedEffects: [{
                    trigger: 'activated',
                    effects: [{ type: 'boost' }]
                }]
            });
            expect(hasAbilityKeyword(card, 'boost')).toBe(true);
        });

        it('is case-insensitive', () => {
            const card = createTestCard({
                parsedEffects: [{ action: 'keyword_RUSH' }]
            });
            expect(hasAbilityKeyword(card, 'rush')).toBe(true);
            expect(hasAbilityKeyword(card, 'RUSH')).toBe(true);
        });

        it('returns false when keyword not present', () => {
            const card = createTestCard({
                parsedEffects: [{ action: 'keyword_rush' }]
            });
            expect(hasAbilityKeyword(card, 'ward')).toBe(false);
        });
    });

    // ========================================================================
    // SONG DETECTION
    // ========================================================================

    describe('isSong', () => {
        it('returns true for Song subtypes', () => {
            const card = createTestCard({ subtypes: ['Song'] });
            expect(isSong(card)).toBe(true);
        });

        it('is case-insensitive', () => {
            const card = createTestCard({ subtypes: ['SONG'] });
            expect(isSong(card)).toBe(true);
        });

        it('returns false for non-songs', () => {
            const card = createTestCard({ subtypes: ['Hero', 'Prince'] });
            expect(isSong(card)).toBe(false);
        });
    });

    describe('getEligibleSingers', () => {
        it('filters by cost >= song cost', () => {
            const song = createTestCard({ cost: 3 });
            const characters = [
                createTestCard({ instanceId: 'c1', cost: 2, ready: true, turnPlayed: -1 }),
                createTestCard({ instanceId: 'c2', cost: 3, ready: true, turnPlayed: -1 }),
                createTestCard({ instanceId: 'c3', cost: 5, ready: true, turnPlayed: -1 })
            ];
            const eligible = getEligibleSingers(song, characters, 0);
            expect(eligible.map(c => c.instanceId)).toEqual(['c2', 'c3']);
        });

        it('excludes exerted characters', () => {
            const song = createTestCard({ cost: 2 });
            const characters = [
                createTestCard({ instanceId: 'c1', cost: 3, ready: true, turnPlayed: -1 }),
                createTestCard({ instanceId: 'c2', cost: 3, ready: false, turnPlayed: -1 })
            ];
            const eligible = getEligibleSingers(song, characters, 0);
            expect(eligible.map(c => c.instanceId)).toEqual(['c1']);
        });

        it('excludes drying characters', () => {
            const song = createTestCard({ cost: 2 });
            const characters = [
                createTestCard({ instanceId: 'c1', cost: 3, ready: true, turnPlayed: 5 }),
                createTestCard({ instanceId: 'c2', cost: 3, ready: true, turnPlayed: 3 })
            ];
            const eligible = getEligibleSingers(song, characters, 5);
            expect(eligible.map(c => c.instanceId)).toEqual(['c2']);
        });
    });

    // ========================================================================
    // PROMPT PARSING
    // ========================================================================

    describe('parseStatModification', () => {
        it('parses strength modification', () => {
            expect(parseStatModification('Target gets +2 strength')).toEqual({
                statType: 'strength',
                amount: 2
            });
        });

        it('parses willpower modification', () => {
            expect(parseStatModification('Gets +1 willpower')).toEqual({
                statType: 'willpower',
                amount: 1
            });
        });

        it('parses lore modification', () => {
            expect(parseStatModification('Gets +3 lore this turn')).toEqual({
                statType: 'lore',
                amount: 3
            });
        });

        it('parses negative modifications', () => {
            expect(parseStatModification('Gets -2 strength')).toEqual({
                statType: 'strength',
                amount: -2
            });
        });

        it('returns null for non-stat prompts', () => {
            expect(parseStatModification('Draw 2 cards')).toBeNull();
        });
    });

    // ========================================================================
    // BOOST ABILITY INDEX
    // ========================================================================

    describe('getBoostAbilityIndex', () => {
        it('returns correct index for boost ability', () => {
            const card = createTestCard({
                parsedEffects: [
                    { type: 'rush' },
                    { trigger: 'activated', effects: [{ type: 'boost', cost: 2 }] }
                ]
            });
            expect(getBoostAbilityIndex(card)).toBe(1);
        });

        it('returns -1 when no boost ability', () => {
            const card = createTestCard({
                parsedEffects: [{ type: 'rush' }]
            });
            expect(getBoostAbilityIndex(card)).toBe(-1);
        });
    });
});
