import { NextResponse } from 'next/server';
import { scrapeSearchOngoing } from '../../scraper';

export async function GET(request) {
    const { searchParams } = new URL(request.url, 'http://localhost');
    const q = searchParams.get('q');

    if (!q) {
        return NextResponse.json({ message: 'Query parameter "q" is required' }, { status: 400 });
    }

    try {
        const results = await scrapeSearchOngoing(q);
        return NextResponse.json(results);
    } catch (error) {
        console.error("Error in /api/search/ongoing route:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
