import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const cardsPath = path.join(process.cwd(), 'allCards.json');
        const data = fs.readFileSync(cardsPath, 'utf-8');
        const cards = JSON.parse(data);
        return NextResponse.json(cards);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to load cards' }, { status: 500 });
    }
}
