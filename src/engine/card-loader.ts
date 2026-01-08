import fs from 'fs-extra';
import path from 'path';
import { Card, CardType, InkColor } from './models';
import { parseToAbilityDefinition } from './ability-parser';
import { GameLogger } from './logger';

const CARDS_FILE_PATH = path.join(process.cwd(), 'allCards.json');

interface RawCard {
    id: number;
    number: number;        // Card number in set
    setCode: string;       // Set code (e.g., "1", "2", "Q1")
    fullName: string;
    name: string;
    version?: string;
    cost: number;
    inkwell: boolean;
    color: string;
    type: string;
    strength?: number;
    willpower?: number;
    lore?: number;
    moveCost?: number;
    subtypes?: string[];
    abilities?: any[];
    [key: string]: any;
}

/**
 * Normalize ability text to handle multi-line text and whitespace variations
 * This fixes issues with newlines breaking regex patterns
 */
function normalizeAbilityText(text: string): string {
    return text
        .replace(/\n/g, ' ')          // Replace newlines with spaces
        .replace(/\s+/g, ' ')          // Collapse multiple spaces into one
        .trim();                       // Trim leading/trailing whitespace
}

export class CardLoader {
    private cards: Map<number, Card> = new Map();
    private logger: GameLogger | undefined;

    constructor(logger?: GameLogger) {
        this.logger = logger;
    }

    async loadCards(): Promise<void> {
        if (!fs.existsSync(CARDS_FILE_PATH)) {
            throw new Error(`Cards file not found at ${CARDS_FILE_PATH}`);
        }

        const data = await fs.readJson(CARDS_FILE_PATH);
        const rawCards: RawCard[] = data.cards;

        for (const raw of rawCards) {
            const card = this.mapRawToCard(raw);
            this.cards.set(card.id, card);
        }

        if (this.logger) {
            this.logger.info(`Loaded ${this.cards.size} cards.`);
        } else {
            console.log(`Loaded ${this.cards.size} cards.`);
        }
    }

    getCard(id: number): Card | undefined {
        return this.cards.get(id);
    }

    getAllCards(): Card[] {
        return Array.from(this.cards.values());
    }

    /**
     * Get a card with parsed abilities (lazy loading)
     */
    getParsedCard(id: number): Card | undefined {
        const card = this.cards.get(id);
        if (card) {
            this.ensureParsed(card);
        }
        return card;
    }

    /**
     * Ensure a card's abilities are parsed (lazy loading helper)
     */
    private ensureParsed(card: Card): void {
        if ((!card.parsedEffects || card.parsedEffects.length === 0) && card.abilities && card.abilities.length > 0) {
            const abilityDefinitions = parseToAbilityDefinition(card);
            card.parsedEffects = abilityDefinitions as any[];
            console.log(`[CARD LOAD] ${card.name}: ${card.abilities.length} raw → ${abilityDefinitions.length} parsed`);
        }
    }

    private mapRawToCard(raw: RawCard): Card {
        // Normalize abilities text to handle multi-line and whitespace issues
        const normalizedAbilities = (raw.abilities || []).map(ability => {
            if (typeof ability === 'string') {
                return {
                    fullText: normalizeAbilityText(ability),
                    type: 'unknown'
                };
            } else if (ability.fullText) {
                return {
                    ...ability,
                    fullText: normalizeAbilityText(ability.fullText),
                    effect: ability.effect ? normalizeAbilityText(ability.effect) : ability.effect
                };
            }
            return ability;
        });

        // Extract keyword abilities from abilities array to populate baseKeywords
        const baseKeywords: string[] = [];
        if (raw.abilities) {
            for (const ability of raw.abilities) {
                if (ability.type === 'keyword' && ability.keyword) {
                    baseKeywords.push(ability.keyword);
                }
            }
        }

        // Handle fullTextSections for cards without abilities array
        const fullTextSections = raw.fullTextSections?.map((section: string) =>
            normalizeAbilityText(section)
        );

        return {
            id: raw.id,
            number: raw.number,              // For image mapping
            setCode: raw.setCode,            // For image mapping
            fullName: raw.fullName,
            name: raw.name,
            version: raw.version,
            cost: raw.cost,
            inkwell: raw.inkwell,
            color: raw.color as InkColor,
            type: raw.type as CardType,
            strength: raw.strength,
            willpower: raw.willpower,
            lore: raw.lore,
            moveCost: raw.moveCost,
            subtypes: raw.subtypes || [],
            abilities: normalizedAbilities,
            baseKeywords: baseKeywords.length > 0 ? baseKeywords : undefined,  // Populate baseKeywords!
            fullText: raw.fullText,
            fullTextSections: fullTextSections,
            parsedEffects: [] // Will be populated on-demand via getParsedCard()
        } as Card;
    }
}
