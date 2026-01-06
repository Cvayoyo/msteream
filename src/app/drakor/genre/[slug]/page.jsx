import DrakorCard from "../../../components/DrakorCard";
import ScrollToContent from "../ScrollToContent";
import { getBaseUrl } from "../../../lib/getBaseUrl";

async function getDramasByGenre(genreSlug) {
  // For now, use search endpoint with genre as query
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/search?q=${encodeURIComponent(genreSlug)}`, { cache: "no-store" });
  const drakor = await response.json();
  return drakor;
}

const DrakorGenrePage = async ({ params }) => {
  const { slug } = await params;
  const dramas = await getDramasByGenre(slug);

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Drakor Genre: {slug.replace(/-/g, ' ').toUpperCase()}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {dramas.map((drakor, index) => (
          <DrakorCard
            key={`genre-${slug}-${drakor.slug}-${index}`}
            title={drakor.title}
            image={drakor.image}
            slug={drakor.slug}
            episode={drakor.episode}
            statusOrDay={drakor.status_or_day}
            type={drakor.type}
          />
        ))}
      </div>
      <ScrollToContent />
    </>
  );
};

export default DrakorGenrePage;