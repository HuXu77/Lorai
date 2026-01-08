'use server'

export async function fetchDreambornDeck(url: string): Promise<string> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch deck: ${response.statusText}`);
        }
        return await response.text();
    } catch (error) {
        console.error('Error fetching Dreamborn deck:', error);
        throw new Error('Failed to fetch deck content');
    }
}
