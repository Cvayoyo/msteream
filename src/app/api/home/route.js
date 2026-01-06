import { NextResponse } from 'next/server';
import { scrapeHome } from '../scraper';

export async function GET() {
  try {
    const data = await scrapeHome();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /api/home route:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}