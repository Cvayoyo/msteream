
import DrakorCard from "../../components/DrakorCard";
import ScrollToContent from "../ScrollToContent";
import { getBaseUrl } from "../../lib/getBaseUrl";
import Pagination from "../../components/Pagination";
import Header from "../../components/Header";

const getSeries = async (page) => {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/series?page=${page}`, { cache: "no-store" });
    const data = await response.json();
    return data;
};

import SearchInput from "../../components/SearchInput";

const SeriesDrakor = async ({ searchParams: searchParamsPromise }) => {
    const searchParams = await searchParamsPromise;
    const page = parseInt(searchParams?.page) || 1;
    const data = await getSeries(page);
    const series = data.results || [];

    const hasPrev = page > 1;
    const hasNext = series.length > 0;

    return (
        <>
            <div className="flex justify-center mb-8">
                <SearchInput basePath="/drakor/series/search" placeholder="Cari Drakor Series..." />
            </div>
            <Header title="Drakor Series" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {series.map((drakor, index) => (
                    <DrakorCard
                        key={`series-${drakor.slug}-${index}`}
                        title={drakor.title}
                        image={drakor.image}
                        slug={drakor.slug}
                        episode={drakor.episode}
                        statusOrDay={drakor.status_or_day}
                        type={drakor.type}
                        rating={drakor.rating}
                    />
                ))}
            </div>

            <Pagination
                hasPrev={hasPrev}
                hasNext={hasNext}
                currentPage={page}
                basePath="/drakor/series"
                type="series"
            />

            <ScrollToContent />
        </>
    );
};

export default SeriesDrakor;
