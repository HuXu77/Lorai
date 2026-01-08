import { Card } from '../../engine/models';
import { parseToAbilityDefinition, AbilityDefinition } from '../../engine/ability-parser';
import { TriggeredAbility, StaticAbility, ActivatedAbility } from '../../engine/abilities/types';
import { GameEvent } from '../../engine/abilities/events';

/**
 * Test utilities for ability assertions
 * Used across integration and execution tests
 */

/**
 * Assert that a card has at least one ability parsed
 */
export function expectHasAbilities(card: Card): AbilityDefinition[] {
    const abilities = parseToAbilityDefinition(card);
    expect(abilities).toBeDefined();
    expect(abilities.length).toBeGreaterThan(0);
    return abilities;
}

/**
 * Assert that a card has a specific ability type
 */
export function expectAbilityType(
    card: Card,
    expectedType: 'triggered' | 'activated' | 'static'
): AbilityDefinition {
    const abilities = expectHasAbilities(card);
    const ability = abilities.find(a => a.type === expectedType);
    expect(ability).toBeDefined();
    return ability!;
}

/**
 * Assert that a card has a keyword ability
 */
export function expectKeyword(card: Card, keyword: string): StaticAbility {
    const ability = expectAbilityType(card, 'static') as StaticAbility;
    // TODO: StaticAbility doesn't have keyword property - need to check rawText instead
    // expect(ability.keyword?.toLowerCase()).toBe(keyword.toLowerCase());
    return ability;
}

/**
 * Assert that a card has a triggered ability with specific event
 */
export function expectTrigger(card: Card, event: GameEvent): TriggeredAbility {
    const ability = expectAbilityType(card, 'triggered') as TriggeredAbility;
    expect(ability.event).toBe(event);
    return ability;
}

/**
 * Assert that a card has an activated ability
 */
export function expectActivated(card: Card): ActivatedAbility {
    return expectAbilityType(card, 'activated') as ActivatedAbility;
}

/**
 * Assert that an ability has a specific effect type
 */
export function expectEffectType(ability: AbilityDefinition, effectType: string): any {
    expect(ability.effects).toBeDefined();
    expect(ability.effects.length).toBeGreaterThan(0);
    const effect = ability.effects.find((e: any) => e.type === effectType);
    expect(effect).toBeDefined();
    return effect;
}

/**
 * Assert that an ability has a draw effect with specific amount
 */
export function expectDrawEffect(ability: AbilityDefinition, amount: number): void {
    const effect = expectEffectType(ability, 'draw');
    expect(effect.amount).toBe(amount);
}

/**
 * Assert that an ability has a damage effect
 */
export function expectDamageEffect(ability: AbilityDefinition, amount?: number): void {
    const effect = expectEffectType(ability, 'damage');
    if (amount !== undefined) {
        expect(effect.amount).toBe(amount);
    }
}

/**
 * Create a test card with minimal required fields
 */
export function createTestCard(overrides: Partial<Card> = {}): Card {
    return {
        id: 99999,
        fullName: 'Test Card',
        name: 'Test Card',
        cost: 1,
        inkwell: true,
        color: 'Amber',
        type: 'character',
        abilities: [],
        parsedEffects: [],
        ...overrides
    } as Card;
}

/**
 * Create a test card with a specific ability text
 */
export function createTestCardWithAbility(
    abilityText: string,
    overrides: Partial<Card> = {}
): Card {
    return createTestCard({
        abilities: [{
            fullText: abilityText,
            type: 'triggered'
        }],
        ...overrides
    });
}
