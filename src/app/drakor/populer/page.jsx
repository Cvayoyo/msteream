import DrakorCard from "../../components/DrakorCard";
import ScrollToContent from "../ScrollToContent";
import { getBaseUrl } from "../../lib/getBaseUrl";

const getPopularDramas = async () => {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/popular`, { cache: "no-store" });
  const drakor = await response.json();
  return drakor;
};

const PopulerDrakor = async () => {
  const popularDramas = await getPopularDramas();

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Drakor Populer</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {popularDramas.map((drakor, index) => (
          <DrakorCard
            key={`popular-${drakor.slug}-${index}`}
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

export default PopulerDrakor;