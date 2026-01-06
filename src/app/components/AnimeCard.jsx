"use client";

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useRef, useEffect } from 'react';

const AnimeCard = ({ title, image, slug, episode, statusOrDay, type, priority = false, isToday = false, showEpisodeBadge = false }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [animeDetail, setAnimeDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [popupWidth, setPopupWidth] = useState(320);
  const cardRef = useRef(null);
  const popupRef = useRef(null);
  const timeoutRef = useRef(null);

  // Fungsi untuk mengekstrak nomor episode dari string
  const extractEpisodeNumber = (episodeStr) => {
    if (!episodeStr) return null;
    const match = episodeStr.match(/(\d+)/);
    return match ? match[1] : null;
  };

  // Fungsi untuk mendapatkan teks episode badge di pojok kiri atas
  const getEpisodeBadgeText = () => {
    if (!statusOrDay) return 'Episode';
    
    if (statusOrDay === '??') {
      return 'Episode Terbaru';
    }
    
    if (/^\d+$/.test(statusOrDay)) {
      return `Episode ${statusOrDay}`;
    }
    
    return 'Episode';
  };

  // Cek apakah episode sudah rilis dengan membandingkan total episode dengan status_or_day
  const getEpisodeStatus = () => {
    if (!episode) return null;
    
    if (episode === 'Sudah Rilis!') {
      // Jika hari sekarang sama dengan hari schedule, ubah menjadi "Sudah Rilis"
      return isToday ? 'Sudah Rilis' : 'Segera Rilis';
    }

    // Jika episode adalah "??" dan status_or_day ada (bukan "??"), tampilkan "Segera Rilis"
    if (episode === '??' && statusOrDay && statusOrDay !== '??') {
      return 'Segera Rilis';
    }

    // Ekstrak total episode yang sudah ada
    const totalEpisodeNum = extractEpisodeNumber(episode);
    // Ekstrak episode yang akan rilis dari status_or_day
    const statusNum = statusOrDay && /^\d+$/.test(statusOrDay) ? parseInt(statusOrDay, 10) : null;

    // Jika status_or_day adalah angka dan <= total episode, berarti sudah rilis
    if (totalEpisodeNum && statusNum) {
      const totalEp = parseInt(totalEpisodeNum, 10);
      if (statusNum <= totalEp) {
        return 'Sudah Rilis';
      }
    }

    // Default: tampilkan format normal
    return episode.replace('Episode ', 'Eps ');
  };

  // Handle mouse enter untuk menampilkan overlay card
  const handleMouseEnter = async (e) => {
    e.stopPropagation();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const scrollY = window.scrollY || window.pageYOffset;
      
      // Responsive popup width berdasarkan viewport
      const isMobile = viewportWidth < 640;
      const isTablet = viewportWidth >= 640 && viewportWidth < 1024;
      const calculatedWidth = isMobile 
        ? Math.min(260, viewportWidth - 32) 
        : isTablet 
        ? 300 
        : 320;
      setPopupWidth(calculatedWidth);
      
      // Posisi statis di samping card (kanan atau kiri)
      let x = rect.right + 8; // Default: di kanan card
      let y = rect.top + scrollY; // Sejajar dengan top card

      // Jika popup keluar dari kanan, pindahkan ke kiri card
      if (x + calculatedWidth > viewportWidth - 16) {
        x = rect.left - calculatedWidth - 8;
      }

      // Jika masih keluar dari kiri setelah dipindah, tetap di kanan tapi adjust
      if (x < 16) {
        x = rect.right + 8;
        // Jika masih keluar, kurangi width atau posisikan di dalam viewport
        if (x + calculatedWidth > viewportWidth - 16) {
          x = viewportWidth - calculatedWidth - 16;
        }
      }

      // Pastikan tidak keluar dari atas - sejajarkan dengan top card
      if (y < scrollY + 16) {
        y = scrollY + 16;
      }

      // Pastikan tidak keluar dari bawah (estimasi height popup responsif)
      const popupHeight = isMobile ? 350 : isTablet ? 380 : 400;
      if (y + popupHeight > scrollY + viewportHeight - 16) {
        y = scrollY + viewportHeight - popupHeight - 16;
        if (y < scrollY + 16) {
          y = scrollY + 16;
        }
      }

      setPopupPosition({ x, y });
    }

    setShowPopup(true);

    // Fetch detail jika belum pernah di-fetch
    if (!animeDetail && !loading && slug) {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/detail/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setAnimeDetail(data.detail);
        } else {
          console.error('Gagal mengambil detail:', response.status);
        }
      } catch (error) {
        console.error('Gagal mengambil detail:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMouseLeave = (e) => {
    e.stopPropagation();
    timeoutRef.current = setTimeout(() => {
      setShowPopup(false);
    }, 200);
  };

  const handlePopupMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handlePopupMouseLeave = () => {
    setShowPopup(false);
  };


  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={cardRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative w-full"
      >
    <Link
      href={`/detail/${slug}`}
          className="group will-change-transform block w-full"
    >
          <div className="flex flex-col h-full border border-blue-500 rounded-lg p-1 hover:border-blue-400 transition-colors">
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg">
          <Image
            src={image} 
            alt={title}
            unoptimized={true}
            fill
            priority={priority}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105 bg-neutral-700"
          />
              {episode && showEpisodeBadge && (
                <div className="absolute top-2 left-2 z-10 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
                  {getEpisodeBadgeText()}
                </div>
              )}
          {type && (
            <div className="absolute top-2 right-2 z-10 rounded-md bg-pink-600/80 px-2 py-1 text-xs font-bold text-white">
              <span>{type}</span>
            </div>
          )}
          {episode && (
            <div className="absolute bottom-2 left-2 z-10 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
                  {getEpisodeStatus()}
            </div>
          )}
        </div>

        <div className="mt-2 px-1">
          <h3 className="font-semibold text-sm text-white line-clamp-2 group-hover:text-pink-400 transition-colors">
            {title}
          </h3>
            </div>
          </div>
        </Link>
      </div>

      {showPopup && (
        <div
          ref={popupRef}
          onMouseEnter={handlePopupMouseEnter}
          onMouseLeave={handlePopupMouseLeave}
          className="fixed z-[9999] bg-[#1A1A29] border border-neutral-700/50 rounded-lg shadow-2xl p-3 sm:p-4 pointer-events-auto max-h-[85vh] overflow-y-auto"
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
            width: `${popupWidth}px`,
            maxWidth: 'calc(100vw - 32px)',
            animation: 'fadeIn 0.2s ease-in-out',
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
          ) : animeDetail ? (
            <div className="space-y-2 sm:space-y-3">
              {/* Title */}
              <h3 className="font-bold text-base sm:text-lg text-white line-clamp-2">
                {animeDetail.title || 'N/A'}
              </h3>

              {/* Metadata Line 1: Rating, HD, CC */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-xs sm:text-sm text-yellow-400">★ {animeDetail.rating || 'N/A'}</span>
                <span className="text-xs bg-pink-600/80 text-white px-1.5 sm:px-2 py-0.5 rounded">HD</span>
                {animeDetail.episodes && animeDetail.episodes.length > 0 && (
                  <span className="text-xs bg-green-600/80 text-white px-1.5 sm:px-2 py-0.5 rounded">
                    cc {animeDetail.episodes.length}
                  </span>
                )}
              </div>

              {/* Type Badge */}
              {type && (
                <div className="inline-block">
                  <span className="text-xs bg-pink-600/80 text-white px-1.5 sm:px-2 py-0.5 rounded">
                    {type}
                  </span>
                </div>
              )}

              {/* Synopsis */}
              {animeDetail.synopsis && (
                <p className="text-xs sm:text-sm text-neutral-300 line-clamp-3 sm:line-clamp-4">
                  {animeDetail.synopsis}
                </p>
              )}

              {/* Japanese Title */}
              {animeDetail.synonym && (
                <div className="text-xs text-neutral-400 line-clamp-1">
                  <span className="font-semibold text-white">Japanese: </span>
                  <span className="truncate">{animeDetail.synonym}</span>
                </div>
              )}

              {/* Aired */}
              {animeDetail.aired && (
                <div className="text-xs text-neutral-400">
                  <span className="font-semibold text-white">Aired: </span>
                  {animeDetail.aired}
                </div>
              )}

              {/* Status */}
              {animeDetail.status && (
                <div className="text-xs text-neutral-400">
                  <span className="font-semibold text-white">Status: </span>
                  {animeDetail.status}
                </div>
              )}

              {/* Genres */}
              {animeDetail.genres && animeDetail.genres.length > 0 && (
                <div className="text-xs text-neutral-400">
                  <span className="font-semibold text-white">Genres: </span>
                  <span className="line-clamp-1">
                    {animeDetail.genres.map((g, idx) => (
                      <span key={g.slug}>
                        {g.name}
                        {idx < animeDetail.genres.length - 1 && ', '}
                      </span>
                    ))}
                  </span>
                </div>
              )}

              {/* Watch Now Button */}
              {animeDetail.episodes && animeDetail.episodes.length > 0 && (
                <Link
                  href={`/watch/${animeDetail.episodes[0].slug}?slug=${slug}&title=${encodeURIComponent(animeDetail.title || '')}&image=${encodeURIComponent(animeDetail.poster || '')}`}
                  className="block w-full bg-pink-600 hover:bg-pink-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold text-center transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPopup(false);
                  }}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-black" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Watch Now
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-400">
              Gagal memuat detail
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AnimeCard;
