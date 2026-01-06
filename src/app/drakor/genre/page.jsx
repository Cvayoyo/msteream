import ScrollToContent from "./ScrollToContent";
import Link from "next/link";
import { getBaseUrl } from "../../lib/getBaseUrl";

async function getCategories() {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/category`, { cache: "no-store" });
  const categories = await response.json();
  return categories;
}

const DrakorGenreList = async () => {
  const categories = await getCategories();

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Daftar Genre Drakor</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Link
            href={`/drakor/genre/${category.slug}`}
            key={category.slug}
            className="bg-neutral-800 hover:bg-neutral-700 p-4 rounded-lg text-center transition-colors"
          >
            <h3 className="text-white font-semibold text-lg">
              {category.name}
            </h3>
          </Link>
        ))}
      </div>
      <ScrollToContent />
    </>
  );
};

export default DrakorGenreList;