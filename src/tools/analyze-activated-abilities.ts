import * as fs from 'fs';

// Load all cards
const allCardsData = JSON.parse(fs.readFileSync('./allCards.json', 'utf-8'));
const cards = allCardsData.cards || Object.values(allCardsData);

console.log(`Total cards loaded: ${cards.length}\n`);

// Find activated abilities (with exert cost or ⟳ symbol)
const activatedAbilities: any[] = [];

cards.forEach((card: any) => {
    if (!card.abilities) return;

    card.abilities.forEach((ability: any) => {
        const text = ability.fullText || '';

        // Look for activated patterns:
        // 1. "⟳ - " or "⟳ :" prefix
        // 2. "Exert -" or "Exert:" pattern (but not "Whenever" triggers)
        // 3. "[ABILITY NAME] ⟳"
        if ((text.includes('⟳') || text.match(/^[^:]+\s*-\s*Exert/i))
            && !text.includes('Whenever')
            && !text.includes('When you play')) {

            activatedAbilities.push({
                card: card.name,
                fullText: text
            });
        }
    });
});

console.log(`Found ${activatedAbilities.length} activated abilities\n`);
console.log('=== FIRST 20 EXAMPLES ===\n');

activatedAbilities.slice(0, 20).forEach((ab, i) => {
    console.log(`${i + 1}. ${ab.card}`);
    console.log(`   ${ab.fullText}`);
    console.log('');
});

// Try to categorize patterns
const patterns: { [key: string]: number } = {};

activatedAbilities.forEach(ab => {
    const text = ab.fullText;

    // Extract action from activated ability
    const actionMatch = text.match(/⟳.*?[-:](.+?)(?:\.|$)/i) ||
        text.match(/Exert.*?[-:](.+?)(?:\.|$)/i);

    if (actionMatch) {
        const action = actionMatch[1].trim().substring(0, 50); // First 50 chars
        patterns[action] = (patterns[action] || 0) + 1;
    }
});

console.log('\n=== TOP ACTIVATED ABILITY ACTIONS ===\n');
const sorted = Object.entries(patterns)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

sorted.forEach(([pattern, count]) => {
    console.log(`${count}x: ${pattern}...`);
});
