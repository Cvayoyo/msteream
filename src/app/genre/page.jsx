export const dynamic = 'force-dynamic'

import React from 'react';

import HeroSection from '../components/HeroSection';
import ScrollToContent from './ScrollToContent';
import { AuthUserSession } from '../libs/auth-libs';
import Link from 'next/link';

async function getGenres() {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/genres`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`Gagal mengambil data: ${response.status}`);
        }

        const result = await response.json();
        return result;

    } catch (error) {
        console.error("Gagal mengambil data genre:", error);
        return { genres: [] };
    }
}

const Page = async () => {
    const data = await getGenres();
    const { genres = [] } = data;

    // Ambil user session untuk Navbar
    const user = await AuthUserSession();

    return (
        <>

            <HeroSection />
            <ScrollToContent />
            <div id="genre-content" className="min-h-screen bg-[#1A1A29] text-white p-4 md:p-8">
                <h1 className="text-3xl font-bold mb-8 text-center text-pink-500">
                    Genre Anime
                </h1>

                {genres && genres.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {genres.map((genre) => (
                            <Link
                                key={genre.slug}
                                href={`/genre/${genre.slug}`}
                                className="bg-neutral-800 hover:bg-neutral-700 rounded-lg p-4 text-center transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-pink-500/20"
                            >
                                <h3 className="text-white font-semibold text-sm md:text-base">
                                    {genre.name}
                                </h3>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-semibold text-neutral-400">
                            Tidak ada data genre
                        </h2>
                    </div>
                )}
            </div>
        </>
    );
}

export default Page;
