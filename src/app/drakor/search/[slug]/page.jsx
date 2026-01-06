import DrakorCard from "../../../components/DrakorCard";
import SearchInput from "../../../components/SearchInput";
import Navigation from "../../../components/Navigation";
import { getBaseUrl } from "../../../lib/getBaseUrl";

async function searchDrakor(slug) {
    if (!slug) return [];

    try {
        const baseUrl = getBaseUrl();
        const searchUrl = `${baseUrl}/api/search?q=${slug}`;

        const response = await fetch(searchUrl, { cache: "no-store" });

        if (!response.ok) {
            console.error(`API error for query "${slug}": Status ${response.status}`);
            return [];
        }

        const result = await response.json();
        return result || [];
    } catch (error) {
        console.error("Gagal total saat mengambil hasil pencarian:", error);
        return [];
    }
}

export default async function SearchPage({ params: ParamsPromise }) {
    const params = await ParamsPromise;
    const { slug } = params;
    const keyword = decodeURIComponent(slug);
    const searchResults = await searchDrakor(slug);

    return (
        <div className="min-h-screen bg-[#1A1A29] text-white">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-10">
                    <Navigation />
                    <div className="mt-6 flex flex-col items-center">
                        <h1 className="text-3xl md:text-5xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-500">
                            Hasil Pencarian: <span className="text-white">{keyword}</span>
                        </h1>
                        <SearchInput basePath="/drakor/search" placeholder="Cari judul drakor lain..." />
                    </div>
                </div>

                {searchResults && searchResults.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {searchResults.map((drakor, index) => {
                            // Ensure unique key strategy similar to page.jsx
                            return (
                                <DrakorCard
                                    key={`${drakor.slug}-${index}`}
                                    title={drakor.title}
                                    image={drakor.image}
                                    slug={drakor.slug}
                                    episode={drakor.episode}
                                    statusOrDay={drakor.status_or_day} // API might return different field for status
                                    type={drakor.type}
                                // Pass additional props if needed like rating/quality if available in search result
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-neutral-800/20 rounded-3xl border border-neutral-700/50 backdrop-blur-sm">
                        <div className="text-6xl mb-4">😕</div>
                        <h2 className="text-2xl md:text-3xl font-semibold text-neutral-400 text-center mb-2">
                            Yah, tidak ketemu...
                        </h2>
                        <p className="text-neutral-500 text-center max-w-md">
                            Coba cari dengan kata kunci lain atau judul yang lebih spesifik.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
