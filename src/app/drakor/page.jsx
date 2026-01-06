import DrakorCard from "../components/DrakorCard";
import SearchInput from "../components/SearchInput";
import Header from "../components/Header";
import { getBaseUrl } from "../lib/getBaseUrl";

const getNewReleaseDramas = async () => {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/home`, { cache: "no-store" });
  const data = await response.json();
  return data.latest || [];
};

const getOngoingDramas = async () => {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/ongoing?page=1`, { cache: "no-store" });
  const data = await response.json();
  return data.results || [];
};

const getPopularDramas = async () => {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/popular`, { cache: "no-store" });
  const drakor = await response.json();
  return drakor;
};

const Drakor = async () => {
  const [newReleaseDramas, ongoingDramas, popularDramas] = await Promise.all([
    getNewReleaseDramas(),
    getOngoingDramas(),
    getPopularDramas(),
  ]);

  return (
    <>
      <div className="flex justify-center mb-8">
        <SearchInput basePath="/drakor/search" placeholder="Cari Drakor..." />
      </div>

      <section>
        <Header title="Drakor Terbaru" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {newReleaseDramas.map((drakor, index) => (
            <DrakorCard
              key={`new-release-${drakor.slug}-${index}`}
              title={drakor.title}
              image={drakor.image}
              slug={drakor.slug}
              episode={drakor.episode}
              statusOrDay={drakor.status_or_day}
              type={drakor.type}
            />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <Header title="Drakor Sedang Tayang" />
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
      </section>

      <section className="mt-8">
        <Header title="Drakor Populer" />
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
      </section>
    </>
  );
};

export default Drakor;