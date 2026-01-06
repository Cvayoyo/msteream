import Image from "next/image";
import Link from "next/link";
import { getBaseUrl } from "../../../lib/getBaseUrl";

async function getDramaDetail(slug) {
  const baseUrl = getBaseUrl();
  // Slug from route params is just the slug part (e.g., "spring-fever-2026-lkg")
  // Need to add /detail/ prefix and ensure proper format
  let cleanSlug = slug.trim();
  // Remove trailing slash if present
  if (cleanSlug.endsWith('/')) {
    cleanSlug = cleanSlug.slice(0, -1);
  }
  // Add leading slash
  if (!cleanSlug.startsWith('/')) {
    cleanSlug = `/${cleanSlug}`;
  }
  // Add /detail/ prefix if not present
  if (!cleanSlug.startsWith('/detail/')) {
    cleanSlug = `/detail${cleanSlug}`;
  }
  const response = await fetch(`${baseUrl}/api/detail?slug=${encodeURIComponent(cleanSlug)}`, { cache: "no-store" });
  const detail = await response.json();
  return detail;
}

async function getDramaEpisodes(slug) {
  const baseUrl = getBaseUrl();
  // Slug from route params is just the slug part (e.g., "spring-fever-2026-lkg")
  // Need to add /detail/ prefix and ensure proper format
  let cleanSlug = slug.trim();
  // Remove trailing slash if present
  if (cleanSlug.endsWith('/')) {
    cleanSlug = cleanSlug.slice(0, -1);
  }
  // Add leading slash
  if (!cleanSlug.startsWith('/')) {
    cleanSlug = `/${cleanSlug}`;
  }
  // Add /detail/ prefix if not present
  if (!cleanSlug.startsWith('/detail/')) {
    cleanSlug = `/detail${cleanSlug}`;
  }
  const response = await fetch(`${baseUrl}/api/detail?slug=${encodeURIComponent(cleanSlug)}`, { cache: "no-store" });
  const detailData = await response.json();
  // Return episodes array from detail data
  return { episodes: detailData.episodes || [] };
}

const DetailDrakor = async ({ params }) => {
  const { slug } = await params;
  const [dramaDetail, dramaEpisodes] = await Promise.all([
    getDramaDetail(slug),
    getDramaEpisodes(slug),
  ]);

  const drakor = dramaDetail;
  const episodes = dramaEpisodes.episodes;

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${drakor.image})` }}
      ></div>

      {/* Content Overlay */}
      <div className="relative z-10 container mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster and Basic Info */}
          <div className="flex-shrink-0 md:w-1/3 lg:w-1/4">
            <Image
              src={drakor.image}
              alt={drakor.title}
              width={400}
              height={600}
              className="rounded-lg shadow-lg w-full h-auto"
              priority
            />
            <div className="mt-4 text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                {drakor.title}
              </h1>
              {drakor.quality && (
                <span className="inline-block bg-pink-600/80 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {drakor.quality}
                </span>
              )}
            </div>
          </div>

          {/* Detailed Info */}
          <div className="flex-1">
            <div className="bg-neutral-800/70 p-6 rounded-lg shadow-xl">
              <h2 className="text-2xl font-bold mb-4">Synopsis</h2>
              <p className="text-neutral-300 mb-6 text-sm md:text-base">
                {drakor.description || "No description available."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-neutral-300 text-sm">
                <div>
                  <p>
                    <span className="font-semibold text-white">Year: </span>
                    {drakor.year || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold text-white">Release Date: </span>
                    {drakor.releaseDate || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold text-white">Status: </span>
                    {drakor.status || "N/A"}
                  </p>
                  {drakor.producer && (
                    <p>
                      <span className="font-semibold text-white">Producer: </span>
                      {drakor.producer}
                    </p>
                  )}
                </div>
                <div>
                  <p>
                    <span className="font-semibold text-white">Rating: </span>
                    {drakor.rating || "N/A"} <span className="text-yellow-400">★</span>
                  </p>
                  <p>
                    <span className="font-semibold text-white">Episode: </span>
                    {drakor.episode || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold text-white">Duration: </span>
                    {drakor.duration || "N/A"}
                  </p>
                  {drakor.quality && (
                    <p>
                      <span className="font-semibold text-white">Quality: </span>
                      {drakor.quality}
                    </p>
                  )}
                </div>
              </div>

              {drakor.genres && drakor.genres.length > 0 && (
                <div className="mt-6">
                  <span className="font-semibold text-white">Genres: </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {drakor.genres.map((genre, index) => (
                      <Link
                        href={`/drakor/genre/${genre.slug}`}
                        key={`genre-${genre.slug}-${index}`}
                        className="bg-neutral-700 hover:bg-neutral-600 px-3 py-1 rounded-full text-xs font-medium text-white transition-colors"
                      >
                        {genre.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Episode List */}
            <div className="mt-8 bg-neutral-800/70 p-6 rounded-lg shadow-xl">
              <h2 className="text-2xl font-bold mb-4">Episodes</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {episodes && episodes.length > 0 ? (
                  episodes.map((episode, index) => (
                    <Link
                      href={`/drakor/watch/${index}?slug=${encodeURIComponent(slug)}&title=${encodeURIComponent(drakor.title || '')}&image=${encodeURIComponent(drakor.image || '')}`}
                      key={`episode-${index}-${index}`}
                      className="bg-neutral-700 hover:bg-neutral-600 p-4 rounded-lg transition-colors"
                    >
                      <h3 className="font-semibold text-white line-clamp-1">
                        {episode.name || `Episode ${index + 1}`}
                      </h3>
                    </Link>
                  ))
                ) : (
                  <p className="text-neutral-400">No episodes available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailDrakor;