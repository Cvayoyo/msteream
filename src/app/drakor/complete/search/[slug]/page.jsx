import DrakorCard from "../../../../components/DrakorCard";
import SearchInput from "../../../../components/SearchInput";
import Header from "../../../../components/Header";
import { getBaseUrl } from "../../../../lib/getBaseUrl";

async function searchCompleteDrakor(slug) {
    if (!slug) return [];

    try {
        const baseUrl = getBaseUrl();
        const searchUrl = `${baseUrl}/api/complete/search?q=${slug}`;

        const response = await fetch(searchUrl, { cache: "no-store" });

        if (!response.ok) {
            console.error(`API error for query "${slug}": Status ${response.status}`);
            return [];
        }

        const result = await response.json();
        return result || [];
    } catch (error) {
        console.error("Gagal total saat mengambil hasil pencarian complete:", error);
        return [];
    }
}

export default async function SearchPage({ params: ParamsPromise }) {
    const params = await ParamsPromise;
    const { slug } = params;
    const keyword = decodeURIComponent(slug);
    const searchResults = await searchCompleteDrakor(slug);

    return (
        <div className="min-h-screen bg-[#1A1A29] text-white">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-10">
                    <Header title={`Hasil Pencarian Complete: ${keyword}`} />
                    <div className="mt-6 flex flex-col items-center">
                        <SearchInput basePath="/drakor/complete/search" placeholder="Cari Drakor Complete lain..." />
                    </div>
                </div>

                {searchResults && searchResults.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {searchResults.map((drakor, index) => {
                            return (
                                <DrakorCard
                                    key={`${drakor.slug}-${index}`}
                                    title={drakor.title}
                                    image={drakor.image}
                                    slug={drakor.slug}
                                    episode={drakor.episode}
                                    statusOrDay={drakor.status_or_day}
                                    type={drakor.type}
                                    rating={drakor.rating}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-neutral-800/20 rounded-3xl border border-neutral-700/50 backdrop-blur-sm">
                        <div className="text-6xl mb-4">😕</div>
                        <h2 className="text-2xl md:text-3xl font-semibold text-neutral-400 text-center mb-2">
                            Tidak ditemukan di Drakor Complete...
                        </h2>
                        <p className="text-neutral-500 text-center max-w-md">
                            Coba cari di pencarian utama atau kategori lain.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
