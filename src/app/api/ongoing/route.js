import { NextResponse } from 'next/server';
import { scrapeOngoing } from '../scraper';

export async function GET(request) {
  const { searchParams } = new URL(request.url, 'http://localhost');
  const page = searchParams.get('page') || '1';

  try {
    const data = await scrapeOngoing(page);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /api/ongoing route:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}