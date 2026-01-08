'use server'

export async function fetchDreambornDeck(url: string): Promise<string> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch deck: ${response.statusText}`);
        }
        return await response.text();
    } catch (error) {
        console.error('Error fetching Dreamborn deck:', error);
        throw new Error('Failed to fetch deck content');
    }
}
