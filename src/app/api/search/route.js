import { NextResponse } from 'next/server';
import { scrapeSearch } from '../scraper';

export async function GET(request) {
  const { searchParams } = new URL(request.url, 'http://localhost');
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ message: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    const results = await scrapeSearch(q);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error in /api/search route:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}