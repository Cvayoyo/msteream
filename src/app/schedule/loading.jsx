// Komponen untuk satu kartu skeleton (reusable)
function SkeletonCard() {
  return (
    <div className="bg-slate-800/50 rounded-xl overflow-hidden animate-pulse">
      {/* Placeholder untuk Gambar */}
      <div className="aspect-[2/3] bg-slate-700"></div>
      <div className="p-4">
        {/* Placeholder untuk Judul */}
        <div className="h-5 bg-slate-700 rounded w-3/4 mb-2"></div>
        {/* Placeholder untuk Info Tambahan */}
        <div className="h-4 bg-slate-700 rounded w-1/2"></div>
      </div>
    </div>
  );
}

// Komponen utama untuk halaman loading
export default function Loading() {
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu', 'Minggu', 'Random'];
  
  return (
    <div className="min-h-screen bg-[#1A1A29] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          {/* Placeholder untuk Judul Halaman */}
          <div className="h-10 w-3/5 bg-slate-800 rounded animate-pulse mx-auto"></div>
        </div>

        {/* Skeleton untuk setiap hari */}
        <div className="space-y-12">
          {days.map((day, dayIndex) => (
            <div key={dayIndex}>
              <div className="h-8 w-32 bg-slate-800 rounded mb-6 animate-pulse"></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
