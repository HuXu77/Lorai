
import { parseToAbilityDefinition } from '../../engine/ability-parser';
import * as fs from 'fs';
import * as path from 'path';

describe('Page.tsx Card Loading Logic', () => {
    it('should correctly parse The Queen - Commanding Presence using page.tsx logic', () => {
        // Mock the allCards require used in page.tsx
        const allCardsPath = path.join(process.cwd(), 'allCards.json');
        const allCards = JSON.parse(fs.readFileSync(allCardsPath, 'utf8'));

        // Build card map like page.tsx
        const cardMap = new Map<string, any>();
        const cardsArray = allCards.cards || Object.values(allCards);

        cardsArray.forEach((card: any) => {
            const existing = cardMap.get(card.fullName.toLowerCase());
            if (!existing) {
                cardMap.set(card.fullName.toLowerCase(), card);
            }
        });

        const queenName = 'The Queen - Commanding Presence';
        const normalizedName = queenName.trim().toLowerCase().replace(/\s+/g, ' ');
        const card = cardMap.get(normalizedName);

        if (!card) {
            throw new Error(`Card not found: ${queenName}`);
        }

        const copiedCard = JSON.parse(JSON.stringify(card));

        // Logic from page.tsx lines 484-492
        try {
            const parsedAbilities = parseToAbilityDefinition(copiedCard);
            copiedCard.parsedEffects = parsedAbilities;
        } catch (parseError) {
            console.warn(`[DeckLoad] Failed to parse abilities for ${name}:`, parseError);
            copiedCard.parsedEffects = [];
        }

        console.log('Parsed Effects:', JSON.stringify(copiedCard.parsedEffects, null, 2));

        // Assertion
        const onQuest = copiedCard.parsedEffects.find((e: any) => e.event === 'card_quested');
        expect(onQuest).toBeDefined();
        expect(onQuest.type).toBe('triggered');
        // Check effects - should have 2
        expect(onQuest.effects).toHaveLength(2);
        expect(onQuest.effects[0].type).toBe('modify_stats');
        expect(onQuest.effects[1].type).toBe('modify_stats');
    });
});
