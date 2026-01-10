import { parseToAbilityDefinition } from '../../engine/ability-parser';

describe('Sudden Scare Parser Debug', () => {
    it('should parse Sudden Scare with both effects', () => {
        const abilityText = "Put chosen opposing character into their player's inkwell facedown. That player puts the top card of their deck into their inkwell facedown.";
        const card = {
            id: 2408,
            name: 'Sudden Scare',
            fullName: 'Sudden Scare',
            abilities: [],
            fullTextSections: [abilityText],
            cost: 4,
            type: 'Action',
            inkwell: true,
            color: 'Sapphire'
        } as any;

        console.log('\n=== SUDDEN SCARE PARSER DEBUG ===');
        console.log('Input text:', abilityText);
        console.log('Has "That player puts":', abilityText.includes('That player puts'));

        const abilities = parseToAbilityDefinition(card);

        console.log('Number of abilities:', abilities.length);

        abilities.forEach((ability, idx) => {
            console.log(`\nAbility ${idx + 1}:`);
            console.log('  Type:', ability.type);
            console.log('  RawText:', (ability as any).rawText?.substring(0, 150));
            console.log('  Effects:', ability.effects?.length || 0);
            ability.effects?.forEach((effect: any, eIdx: number) => {
                console.log(`    Effect ${eIdx + 1}:`, JSON.stringify(effect, null, 2));
            });
        });
        console.log('=================================\n');

        // Assertions for expected structure
        expect(abilities.length).toBeGreaterThanOrEqual(1);

        // Should have 2 effects:
        // 1. Move character to inkwell
        // 2. Opponent puts top card of deck into inkwell
        const totalEffects = abilities.reduce((sum, a) => sum + (a.effects?.length || 0), 0);
        console.log('Total effects across all abilities:', totalEffects);

        // Check for expected effect types
        const allEffects = abilities.flatMap(a => a.effects || []);
        const effectTypes = allEffects.map((e: any) => e.type);
        console.log('Effect types found:', effectTypes);

        // Verify both effects are present
        expect(effectTypes).toContain('put_into_inkwell');
        expect(effectTypes).toContain('opponent_deck_to_inkwell');
    });
});
