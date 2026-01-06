
import DrakorCard from "../../components/DrakorCard";
import ScrollToContent from "../ScrollToContent";
import { getBaseUrl } from "../../lib/getBaseUrl";
import Pagination from "../../components/Pagination";
import Header from "../../components/Header";

const getCompleteDrakor = async (page) => {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/complete?page=${page}`, { cache: "no-store" });
    const data = await response.json();
    return data;
};

import SearchInput from "../../components/SearchInput";

const CompleteDrakor = async ({ searchParams: searchParamsPromise }) => {
    const searchParams = await searchParamsPromise;
    const page = parseInt(searchParams?.page) || 1;
    const data = await getCompleteDrakor(page);
    const completeDrakors = data.results || [];

    const hasPrev = page > 1;
    const hasNext = completeDrakors.length > 0;

    return (
        <>
            <div className="flex justify-center mb-8">
                <SearchInput basePath="/drakor/complete/search" placeholder="Cari Drakor Selesai..." />
            </div>
            <Header title="Drakor Selesai" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {completeDrakors.map((drakor, index) => (
                    <DrakorCard
                        key={`complete-${drakor.slug}-${index}`}
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
                basePath="/drakor/complete"
                type="complete"
            />

            <ScrollToContent />
        </>
    );
};

export default CompleteDrakor;
