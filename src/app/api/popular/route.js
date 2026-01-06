import { NextResponse } from 'next/server';
import { scrapePopular } from '../scraper';

export async function GET() {
  try {
    const results = await scrapePopular();
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error in /api/popular route:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}