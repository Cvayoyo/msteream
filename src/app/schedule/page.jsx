export const dynamic = 'force-dynamic'

import React from 'react';

import HeroSection from '../components/HeroSection';
import AnimeCard from '../components/AnimeCard';
import ScrollToContent from './ScrollToContent';
import { AuthUserSession } from '../libs/auth-libs';

async function getSchedule() {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/schedule`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`Gagal mengambil data: ${response.status}`);
        }

        const result = await response.json();
        return result;

    } catch (error) {
        console.error("Gagal mengambil data schedule:", error);
        return { schedule: {} };
    }
}

const Page = async () => {
    const data = await getSchedule();
    const { schedule = {} } = data;

    // Ambil user session untuk Navbar
    const user = await AuthUserSession();

    // Dapatkan hari sekarang dalam bahasa Indonesia
    const today = new Date();
    const dayIndex = today.getDay(); // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
    const dayMap = {
        0: 'minggu',
        1: 'senin',
        2: 'selasa',
        3: 'rabu',
        4: 'kamis',
        5: 'jum\'at',
        6: 'sabtu'
    };
    const todayKey = dayMap[dayIndex];

    // Urutan hari dalam seminggu
    const days = [
        { key: 'senin', label: 'Senin' },
        { key: 'selasa', label: 'Selasa' },
        { key: 'rabu', label: 'Rabu' },
        { key: 'kamis', label: 'Kamis' },
        { key: 'jum\'at', label: 'Jum\'at' },
        { key: 'sabtu', label: 'Sabtu' },
        { key: 'minggu', label: 'Minggu' },
        { key: 'random', label: 'Random' }
    ];

    return (
        <>

            <HeroSection />
            <ScrollToContent />
            <div id="schedule-content" className="min-h-screen bg-[#1A1A29] text-white p-4 md:p-8">
                <h1 className="text-3xl font-bold mb-8 text-center text-pink-500">
                    Jadwal Anime Terbaru
                </h1>

                {schedule && Object.keys(schedule).length > 0 ? (
                    <div className="space-y-12">
                        {days.map((day) => {
                            const dayAnimes = schedule[day.key] || [];
                            if (dayAnimes.length === 0) return null;

                            return (
                                <div key={day.key} className="mb-8">
                                    <h2 className="text-2xl font-bold mb-6 text-pink-400 capitalize">
                                        {day.label}
                                    </h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                        {dayAnimes.map((anime, index) => (
                                            <AnimeCard
                                                key={`${anime.slug}-${day.key}-${index}`}
                                                title={anime.title}
                                                image={anime.poster}
                                                slug={anime.slug}
                                                episode={anime.episode}
                                                statusOrDay={anime.status_or_day}
                                                type={anime.type}
                                                priority={index < 6 && day.key === 'senin'}
                                                isToday={day.key === todayKey}
                                                showEpisodeBadge={true}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-semibold text-neutral-400">
                            Tidak ada data schedule
                        </h2>
                    </div>
                )}
            </div>
        </>
    );
}

export default Page;
