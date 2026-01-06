import { NextResponse } from 'next/server';
import { scrapeSearchSeries } from '../../scraper';

export async function GET(request) {
    const { searchParams } = new URL(request.url, 'http://localhost');
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ message: 'Query parameter "q" is required' }, { status: 400 });
    }

    try {
        const data = await scrapeSearchSeries(query);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in /api/series/search route:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
