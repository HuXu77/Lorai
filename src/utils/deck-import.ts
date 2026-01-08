// Utility for parsing deck lists

export const parseDeckText = (text: string): string[] => {
    const cards: string[] = [];
    const lines = text.split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Format: "4 Stitch - Rock Star" or "4x Stitch - Rock Star"
        const match = trimmed.match(/^(\d+)[x\s]+(.+)$/);
        if (match) {
            const count = parseInt(match[1]);
            const name = match[2].trim();
            for (let i = 0; i < count; i++) {
                cards.push(name);
            }
        } else {
            // Assume single card if no number
            cards.push(trimmed);
        }
    }
    return cards;
}

export const parseDreambornUrl = async (url: string, fetcher: (url: string) => Promise<string>): Promise<string[]> => {
    const html = await fetcher(url);

    // Find Nuxt data
    const match = html.match(/id="__NUXT_DATA__"[^>]*>([^<]+)<\/script>/);
    if (!match) {
        throw new Error('Could not find deck data on page');
    }

    const json = JSON.parse(match[1]);
    let pbCodeIndex = -1;

    for (const item of json) {
        if (item && typeof item === 'object' && 'pbCode' in item) {
            pbCodeIndex = item.pbCode;
            break;
        }
    }

    if (pbCodeIndex !== -1 && json[pbCodeIndex]) {
        const encoded = json[pbCodeIndex];
        if (typeof encoded === 'string') {
            const decoded = atob(encoded);
            const cards: string[] = [];
            // Format: "Name$Count|Name$Count..."

            const parts = decoded.split('|');
            for (const part of parts) {
                if (!part) continue;
                const [namePart, countPart] = part.split('$');
                if (namePart && countPart) {
                    const count = parseInt(countPart);
                    // "Name_Subtitle" -> "Name - Subtitle"
                    const name = namePart.replace(/_/g, ' - ');

                    for (let i = 0; i < count; i++) {
                        cards.push(name);
                    }
                }
            }
            return cards;
        }
    }

    throw new Error('Could not extract deck data from page');
}
