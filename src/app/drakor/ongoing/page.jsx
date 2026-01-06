
import DrakorCard from "../../components/DrakorCard";
import ScrollToContent from "../ScrollToContent";
import { getBaseUrl } from "../../lib/getBaseUrl";
import Pagination from "../../components/Pagination";
import Header from "../../components/Header";
import SearchInput from "../../components/SearchInput";

const getOngoingDramas = async (page) => {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/ongoing?page=${page}`, { cache: "no-store" });
    const data = await response.json();
    return data;
};

const OngoingDrakor = async ({ searchParams: searchParamsPromise }) => {
    const searchParams = await searchParamsPromise;
    const page = parseInt(searchParams?.ongoingPage) || 1;
    const data = await getOngoingDramas(page);
    const ongoingDramas = data.results || [];

    // Since the API for ongoing might not return standard pagination object like anime,
    // we might need to rely on what "results" gives us or if there's a "pagination" field.
    // Looking at scraper.js, scrapeOngoing returns { page: pageNum, results }.
    // It doesn't seem to return pagination metadata (hasNext, etc) explicitly in the return object 
    // other than page and results. 
    // Let's assume simple pagination: if results.length > 0, assume there *might* be a next page.
    // Or reuse the Logic from Home page if possible.

    // Wait, scrapeOngoing just returns { page, results }. 
    // It effectively behaves like "has next" if results are full? 
    // Let's implement basic pagination controls.
    const hasPrev = page > 1;
    const hasNext = ongoingDramas.length > 0; // Rough check

    return (
        <>
            <div className="flex justify-center mb-8">
                <SearchInput basePath="/drakor/ongoing/search" placeholder="Cari Drakor Ongoing..." />
            </div>

            <Header title="Drakor Ongoing" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {ongoingDramas.map((drakor, index) => (
                    <DrakorCard
                        key={`ongoing-${drakor.slug}-${index}`}
                        title={drakor.title}
                        image={drakor.image}
                        slug={drakor.slug}
                        episode={drakor.episode}
                        statusOrDay={drakor.status_or_day}
                        type={drakor.type}
                    />
                ))}
            </div>

            <Pagination
                hasPrev={hasPrev}
                hasNext={hasNext}
                currentPage={page}
                basePath="/drakor/ongoing"
                type="ongoing"
            // totalPages not available from this specific scraper currently
            />

            <ScrollToContent />
        </>
    );
};

export default OngoingDrakor;
