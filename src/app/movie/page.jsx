export const dynamic = 'force-dynamic'

import React, { Suspense } from 'react';

import HeroSection from '../components/HeroSection';
import AnimeCard from '../components/AnimeCard';
import Pagination from '../components/Pagination';
import ScrollToContent from './ScrollToContent';
import { AuthUserSession } from '../libs/auth-libs';

async function getMovies(page = 1) {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/movies?page=${page}`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`Gagal mengambil data: ${response.status}`);
        }

        const result = await response.json();
        return result;

    } catch (error) {
        console.error("Gagal mengambil data movie:", error);
        return { animes: [], pagination: { hasNext: false, hasPrev: false, currentPage: 1 } };
    }
}

const Page = async ({ searchParams: searchParamsPromise }) => {
    const searchParams = await searchParamsPromise;
    const page = parseInt(searchParams?.page) || 1;
    const data = await getMovies(page);
    const { animes = [], pagination = {} } = data;

    // Ambil user session untuk Navbar
    const user = await AuthUserSession();

    return (
        <>

            <HeroSection />
            <Suspense fallback={null}>
                <ScrollToContent />
            </Suspense>
            <div id="movie-content" className="min-h-screen bg-[#1A1A29] text-white p-4 md:p-8">
                <h1 className="text-3xl font-bold mb-8 text-center text-pink-500">
                    Anime Movie
                </h1>

                {animes && animes.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {animes.map((anime, index) => (
                                <AnimeCard
                                    key={`${anime.slug}-${index}`}
                                    title={anime.title}
                                    image={anime.poster}
                                    slug={anime.slug}
                                    episode={anime.episode}
                                    statusOrDay={anime.status_or_day}
                                    type={anime.type}
                                    priority={index < 6}
                                />
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {pagination && (
                            <Pagination
                                hasPrev={pagination.hasPrev}
                                hasNext={pagination.hasNext}
                                currentPage={pagination.currentPage || page}
                                basePath="/movie"
                                type="movie"
                                totalPages={pagination.totalPages}
                            />
                        )}
                    </>
                ) : (
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-semibold text-neutral-400">
                            Tidak ada data movie
                        </h2>
                    </div>
                )}
            </div>
        </>
    );
}

export default Page;
