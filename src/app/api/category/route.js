import { NextResponse } from 'next/server';

// Static category data (you can replace this with dynamic scraping if needed)
const categories = [
  { slug: 'romance', name: 'Romance' },
  { slug: 'action', name: 'Action' },
  { slug: 'comedy', name: 'Comedy' },
  { slug: 'fantasy', name: 'Fantasy' },
  { slug: 'thriller', name: 'Thriller' },
  { slug: 'drama', name: 'Drama' },
  { slug: 'horror', name: 'Horror' },
  { slug: 'mystery', name: 'Mystery' },
  { slug: 'crime', name: 'Crime' },
  { slug: 'historical', name: 'Historical' },
  { slug: 'medical', name: 'Medical' },
  { slug: 'law', name: 'Law' },
  { slug: 'school', name: 'School' },
  { slug: 'business', name: 'Business' },
  { slug: 'family', name: 'Family' },
  { slug: 'friendship', name: 'Friendship' }
];

export async function GET() {
  return NextResponse.json(categories);
}