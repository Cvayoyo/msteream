import { NextResponse } from 'next/server';
import { scrapeSeries } from '../scraper';

export async function GET(request) {
  const { searchParams } = new URL(request.url, 'http://localhost');
  const page = searchParams.get('page') || '1';

  try {
    const data = await scrapeSeries(page);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /api/series route:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}