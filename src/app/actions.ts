'use server'

export async function fetchDreambornDeck(url: string): Promise<string> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Referer': 'https://dreamborn.ink/',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-User': '?1',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            },
            cache: 'no-store' // Ensure we don't cache failed/challenged responses
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
