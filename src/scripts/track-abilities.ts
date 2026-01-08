import { CardLoader } from '../engine/card-loader';
import { parseToAbilityDefinition } from '../engine/ability-parser';
import * as fs from 'fs';
import * as path from 'path';

interface AbilityTracker {
    cardName: string;
    abilityIndex: number;
    abilityText: string;
    parsed: boolean;
    pattern?: string; // What pattern it matches (e.g., "vanish_keyword", "chosen_opponent_discard")
}

(async () => {
    const loader = new CardLoader();
    await loader.loadCards();
    const allCards = loader.getAllCards();

    const parsed: AbilityTracker[] = [];
    const unparsed: AbilityTracker[] = [];

    allCards.forEach(card => {
        if (card.abilities && card.abilities.length > 0) {
            card.abilities.forEach((ability: any, idx: number) => {
                const text = ability.effect || ability.fullText || '';
                if (!text) return;

                const result = parseToAbilityDefinition(card);
                const isParsed = result.length > 0;

                const tracker: AbilityTracker = {
                    cardName: card.fullName || card.name,
                    abilityIndex: idx + 1,
                    abilityText: text,
                    parsed: isParsed
                };

                if (isParsed) {
                    parsed.push(tracker);
                } else {
                    unparsed.push(tracker);
                }
            });
        }
    });

    // Write to files
    const outputDir = process.cwd();
    fs.writeFileSync(
        path.join(outputDir, 'unparsed-abilities.json'),
        JSON.stringify(unparsed, null, 2)
    );

    fs.writeFileSync(
        path.join(outputDir, 'parsed-abilities.json'),
        JSON.stringify({
            timestamp: new Date().toISOString(),
            count: parsed.length,
            totalAbilities: parsed.length + unparsed.length,
            coveragePct: ((parsed.length / (parsed.length + unparsed.length)) * 100).toFixed(1),
            abilities: parsed
        }, null, 2)
    );

    console.log('\n=== Parser Coverage Summary ===');
    console.log(`Parsed: ${parsed.length}`);
    console.log(`Unparsed: ${unparsed.length}`);
    console.log(`Coverage: ${((parsed.length / (parsed.length + unparsed.length)) * 100).toFixed(1)}%`);
    console.log(`\nFiles written:`);
    console.log(`  - unparsed-abilities.json (${unparsed.length} abilities)`);
    console.log(`  - parsed-abilities.json (${parsed.length} abilities)`);

    // Group unparsed by pattern
    console.log(`\n=== Unparsed Patterns ===`);
    const patterns = new Map<string, number>();
    unparsed.forEach(u => {
        const text = u.abilityText.toLowerCase();
        let pattern = 'other';

        if (text.includes('vanish')) pattern = 'vanish_keyword';
        else if (text.includes('alert')) pattern = 'alert_keyword';
        else if (text.includes('when jafar plays')) pattern = 'jafar_mechanics';
        else if (text.includes('chosen opponent chooses')) pattern = 'opponent_discard';
        else if (text.includes('put') && text.includes('damage counter')) pattern = 'damage_counter';
        else if (text.includes('gain lore equal')) pattern = 'gain_lore_from_stat';
        else if (text.includes('leaves play')) pattern = 'leaves_play';
        else if (text.includes('skip') && text.includes('draw step')) pattern = 'skip_draw';
        else if (text.includes('under') && text.includes('item')) pattern = 'under_card';
        else if (text.includes('opponent plays')) pattern = 'opponent_trigger';
        else if (text.includes('when you play') || text.includes('whenever this character quests')) pattern = 'standard_trigger';

        patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
    });

    Array.from(patterns.entries())
        .sort((a, b) => b[1] - a[1])
        .forEach(([pattern, count]) => {
            console.log(`  ${count.toString().padStart(3)} - ${pattern}`);
        });
})();
