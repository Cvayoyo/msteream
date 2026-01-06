import { NextResponse } from 'next/server';
import { scrapeStreamingUrl } from '../scraper';

export async function GET(request) {
  const { searchParams } = new URL(request.url, 'http://localhost');
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ message: 'Query parameter "slug" is required' }, { status: 400 });
  }

  try {
    const streamingData = await scrapeStreamingUrl(slug);
    return NextResponse.json(streamingData);
  } catch (error) {
    console.error("Error in /api/streaming route:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}