import { headers } from 'next/headers';

export function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  try {
    const headersList = headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    return `${protocol}://${host}`;
  } catch (error) {
    // Fallback jika headers() tidak tersedia
    return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  }
}