import { NextResponse } from 'next/server';
import { scrapeMovie } from '../scraper';

export async function GET(request) {
  const { searchParams } = new URL(request.url, 'http://localhost');
  const page = searchParams.get('page') || '1';

  try {
    const data = await scrapeMovie(page);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /api/movie route:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}