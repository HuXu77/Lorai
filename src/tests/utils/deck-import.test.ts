import { parseDeckText, parseDreambornUrl } from "../../utils/deck-import";

describe('Deck Import Logic', () => {
    it('should parse text deck list correctly', () => {
        const text = `
            4 Stitch - Rock Star
            3 Mickey Mouse - Brave Little Tailor
            1x Maleficent - Monstrous Dragon
            Elsa - Snow Queen
        `;

        const cards = parseDeckText(text);

        // Count: 4 + 3 + 1 + 1 = 9
        expect(cards.length).toBe(9);
        expect(cards.filter(c => c === 'Stitch - Rock Star').length).toBe(4);
        expect(cards.filter(c => c === 'Mickey Mouse - Brave Little Tailor').length).toBe(3);
        expect(cards.filter(c => c === 'Maleficent - Monstrous Dragon').length).toBe(1);
        expect(cards.filter(c => c === 'Elsa - Snow Queen').length).toBe(1);
    });

    it('should ignore empty lines and whitespace', () => {
        const text = `
            4 Stitch - Rock Star
            
            2   Lilo - Making a Wish   
        `;
        const cards = parseDeckText(text);
        expect(cards.length).toBe(6);
        expect(cards.filter(c => c === 'Lilo - Making a Wish').length).toBe(2);
    });

    it('should parse Dreamborn URL correctly', async () => {
        const mockHtml = `
            <html>
            <body>
                <script id="__NUXT_DATA__" type="application/json">
                    [
                        {"pbCode": 1},
                        "VGhlIFF1ZWVuJDR8TWlja2V5IE1vdXNlX0JyYXZlIExpdHRsZSBUYWlsb3IkMw==" 
                    ]
                </script>
            </body>
            </html>
        `;
        // "VGhlIFF1ZWVuanM0fE1pY2tleSBNb3VzZV9CcmF2ZSBMaXR0bGUgVGFpbG9yJDM=" decodes to: "The Queen$4|Mickey Mouse_Brave Little Tailor$3"

        const mockFetcher = vi.fn().mockResolvedValue(mockHtml);

        const cards = await parseDreambornUrl('https://dreamborn.ink/decks/test', mockFetcher);

        expect(cards.length).toBe(7); // 4 + 3
        expect(cards.filter((c: string) => c === 'The Queen').length).toBe(4);
        expect(cards.filter((c: string) => c === 'Mickey Mouse - Brave Little Tailor').length).toBe(3);
    });
});
