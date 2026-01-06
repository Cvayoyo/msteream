import { NextResponse } from 'next/server';
import { scrapeDetail } from '../scraper';

export async function GET(request) {
  const { searchParams } = new URL(request.url, 'http://localhost');
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ message: 'Query parameter "slug" is required' }, { status: 400 });
  }

  try {
    const detail = await scrapeDetail(slug);
    return NextResponse.json(detail);
  } catch (error) {
    console.error("Error in /api/detail route:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}