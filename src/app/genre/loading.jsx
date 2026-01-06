// Komponen untuk satu kartu skeleton (reusable)
function SkeletonCard() {
  return (
    <div className="bg-slate-800/50 rounded-lg overflow-hidden animate-pulse">
      <div className="p-4">
        <div className="h-6 bg-slate-700 rounded w-3/4 mx-auto"></div>
      </div>
    </div>
  );
}

// Komponen utama untuk halaman loading
export default function Loading() {
  return (
    <div className="min-h-screen bg-[#1A1A29] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          {/* Placeholder untuk Judul Halaman */}
          <div className="h-10 w-3/5 bg-slate-800 rounded animate-pulse mx-auto"></div>
        </div>

        {/* Grid untuk kartu-kartu skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {/* Menampilkan 12 kartu skeleton sebagai placeholder */}
          {Array.from({ length: 12 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
