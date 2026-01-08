import { CardLoader } from './card-loader';
import { CardType, InkColor } from './models';

describe('CardLoader', () => {
    let loader: CardLoader;

    beforeAll(async () => {
        loader = new CardLoader();
        await loader.loadCards();
    });

    it('should load all cards', () => {
        const cards = loader.getAllCards();
        expect(cards.length).toBeGreaterThan(0);
    });

    it('should correctly map a specific card (Ariel - On Human Legs)', () => {
        // ID 1 is Ariel - On Human Legs based on previous file view
        const ariel = loader.getCard(1);

        expect(ariel).toBeDefined();
        if (ariel) {
            expect(ariel.name).toBe('Ariel');
            expect(ariel.version).toBe('On Human Legs');
            expect(ariel.cost).toBe(4);
            expect(ariel.inkwell).toBe(true);
            expect(ariel.color).toBe(InkColor.Amber);
            expect(ariel.type).toBe(CardType.Character);
            expect(ariel.strength).toBe(3);
            expect(ariel.willpower).toBe(4);
            expect(ariel.lore).toBe(2);
            expect(ariel.subtypes).toContain('Princess');
        }
    });
});
