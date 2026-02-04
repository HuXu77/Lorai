
import fs from 'fs';
import path from 'path';

// Define minimal types to avoid importing from src (which might require compilation)
interface RawCard {
    name: string;
    fullName: string;
    abilities?: Array<string | { fullText: string }>;
    fullTextSections?: string[];
}

interface AbilityEntry {
    text: string;
    count: number;
    cards: string[]; // List of card names that have this ability
}

async function analyzeAbilities() {
    const cardsPath = path.join(process.cwd(), 'allCards.json');

    if (!fs.existsSync(cardsPath)) {
        console.error(`Error: Could not find ${cardsPath}`);
        process.exit(1);
    }

    console.log(`Reading cards from ${cardsPath}...`);
    const data = JSON.parse(fs.readFileSync(cardsPath, 'utf8'));
    const cards: RawCard[] = data.cards;
    console.log(`Loaded ${cards.length} cards.`);

    const abilitiesMap = new Map<string, AbilityEntry>();

    for (const card of cards) {
        const abilitiesToProcess: string[] = [];

        // 1. Process 'abilities' array
        if (card.abilities && Array.isArray(card.abilities)) {
            card.abilities.forEach(ability => {
                if (typeof ability === 'string') {
                    abilitiesToProcess.push(ability);
                } else if (ability.fullText) {
                    abilitiesToProcess.push(ability.fullText);
                }
            });
        }

        // 2. Process 'fullTextSections' (often used for cards without structured abilities)
        if (card.fullTextSections && Array.isArray(card.fullTextSections)) {
            card.fullTextSections.forEach(text => {
                abilitiesToProcess.push(text);
            });
        }

        // Normalize and store
        for (const rawText of abilitiesToProcess) {
            // Clean text: remove newlines, collapse spaces, trim
            const cleanedText = rawText
                .replace(/\n/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();

            // Filter out empty strings or just keywords like "Bodyguard" (optional, but requested ONLY ability texts)?
            // User said "Only unique entries".
            // We should keep keywords if they are the full text.

            if (!cleanedText) continue;

            // Normalize "this character" or card name references?
            // "When [Card Name] is played..." -> "When this character is played..."
            // This is complex. For now, let's keep exact text but be aware of name variations.
            // A perfect uniquer would replace the card's own name with "this character".
            // Let's try a simple name replacement.

            // Naive replacement of card name with "this character" to group identical abilities
            // e.g. "When Mickey Mouse is banished" vs "When Donald Duck is banished"
            // Be careful not to replace other card names.
            // Only replace if it matches the card's exact short name or full name?
            // Let's stick to exact text for now as requested, maybe add normalization later if asked.
            // Actually, usually ability text ALREADY uses "this character". 
            // Named references are rare unless specific.

            if (!abilitiesMap.has(cleanedText)) {
                abilitiesMap.set(cleanedText, {
                    text: cleanedText,
                    count: 0,
                    cards: []
                });
            }

            const entry = abilitiesMap.get(cleanedText)!;
            entry.count++;
            if (!entry.cards.includes(card.fullName)) {
                entry.cards.push(card.fullName);
            }
        }
    }

    // Convert to array and sort by count (descending)
    const sortedAbilities = Array.from(abilitiesMap.values()).sort((a, b) => b.count - a.count);

    console.log(`\nFound ${sortedAbilities.length} unique ability texts across ${cards.length} cards.\n`);

    // Output to file
    const outputPath = path.join(process.cwd(), 'docs', 'ability_inventory.md');
    let markdown = '# Ability Inventory\n\n';
    markdown += `**Total Cards**: ${cards.length}\n`;
    markdown += `**Unique Abilities**: ${sortedAbilities.length}\n\n`;
    markdown += '| Count | Ability Text | Example Cards |\n';
    markdown += '|-------|--------------|---------------|\n';

    sortedAbilities.forEach(entry => {
        // Truncate example cards to 3
        const examples = entry.cards.slice(0, 3).join(', ') + (entry.cards.length > 3 ? ` (+${entry.cards.length - 3} more)` : '');
        markdown += `| ${entry.count} | ${entry.text.replace(/\|/g, '\\|')} | ${examples} |\n`;
    });

    fs.writeFileSync(outputPath, markdown);
    console.log(`Report written to ${outputPath}`);
}

analyzeAbilities().catch(console.error);
