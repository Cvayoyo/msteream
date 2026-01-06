"use client";

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Player from 'react-player';

const WatchDrakor = () => {
  const params = useParams();
  const episodeSlug = params?.episodeSlug;
  const searchParams = useSearchParams();
  const router = useRouter();
  const dramaSlug = searchParams.get('slug');
  const dramaTitle = searchParams.get('title');
  const dramaImage = searchParams.get('image');
  const [streamUrl, setStreamUrl] = useState(null);
  const [allEpisodes, setAllEpisodes] = useState([]);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const playerRef = useRef(null);

  const apiUrl = ""; // No longer needed as we are using internal API

  useEffect(() => {
    const fetchEpisodeData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!dramaSlug) {
          throw new Error("Drama slug not found in URL.");
        }

        // Parse episode index from episodeSlug (should be a number)
        // episodeSlug might be a string like "0", "1", "2", etc.
        const episodeIndex = typeof episodeSlug === 'string' ? parseInt(episodeSlug, 10) : episodeSlug;
        if (isNaN(episodeIndex) || episodeIndex < 0) {
          throw new Error(`Invalid episode index: ${episodeSlug}`);
        }

        // Get episodes list from detail endpoint
        const detailResponse = await fetch(`/api/detail?slug=${encodeURIComponent(dramaSlug)}`);
        if (!detailResponse.ok) {
          throw new Error(`Failed to fetch episodes: ${detailResponse.statusText}`);
        }
        const detailData = await detailResponse.json();
        const episodes = detailData.episodes || [];
        setAllEpisodes(episodes);

        // Validate episode index
        if (episodeIndex >= episodes.length) {
          throw new Error("Episode index out of range.");
        }
        setCurrentEpisodeIndex(episodeIndex);

        // Get streaming URL from episode slug (which contains the streaming URL)
        const currentEpisode = episodes[episodeIndex];
        if (currentEpisode && currentEpisode.slug) {
          // episode.slug contains the streaming URL (e.g., "https://nonton.bid/#njeoof")
          let streamUrl = currentEpisode.slug.trim();
          // Ensure URL has proper protocol
          if (streamUrl.startsWith('//')) {
            streamUrl = `https:${streamUrl}`;
          } else if (!streamUrl.startsWith('http')) {
            streamUrl = `https://${streamUrl}`;
          }
          setStreamUrl(streamUrl);
          // Reset playing state when new episode loads
          setIsPlaying(true);
          setIsPlayerReady(false);
        } else {
          throw new Error("Episode streaming URL not found.");
        }

      } catch (err) {
        console.error("Error fetching episode data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodeData();
  }, [dramaSlug, episodeSlug, apiUrl]);

  // Auto play when streamUrl changes
  useEffect(() => {
    if (streamUrl && isPlayerReady) {
      setIsPlaying(true);
    }
  }, [streamUrl, isPlayerReady]);

  const handleNextEpisode = () => {
    if (currentEpisodeIndex < allEpisodes.length - 1) {
      const nextIndex = currentEpisodeIndex + 1;
      router.push(`/drakor/watch/${nextIndex}?slug=${encodeURIComponent(dramaSlug || '')}&title=${encodeURIComponent(dramaTitle || '')}&image=${encodeURIComponent(dramaImage || '')}`);
    }
  };

  const handlePreviousEpisode = () => {
    if (currentEpisodeIndex > 0) {
      const prevIndex = currentEpisodeIndex - 1;
      router.push(`/drakor/watch/${prevIndex}?slug=${encodeURIComponent(dramaSlug || '')}&title=${encodeURIComponent(dramaTitle || '')}&image=${encodeURIComponent(dramaImage || '')}`);
    }
  };

  const toggleEpisodeList = () => {
    setShowEpisodeList(!showEpisodeList);
  };

  // Prevent redirects from ads

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-white">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  const currentEpisode = allEpisodes[currentEpisodeIndex];

  return (
    <div className="container mx-auto px-4 md:px-8 py-8">
      <h1 className="text-3xl font-bold mb-4 text-white">{dramaTitle || "Drakor Episode"}</h1>
      <p className="text-neutral-400 mb-6">{currentEpisode?.title}</p>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Video Player Section */}
        <div className="flex-1">
          <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
            {streamUrl ? (
              // Check if URL is a direct video file or needs iframe
              streamUrl.match(/\.(mp4|m3u8|webm|ogg|mp3|wav|flv|avi|mov|wmv|mkv)$/i) ? (
                <Player
                  ref={playerRef}
                  url={streamUrl}
                  playing={isPlaying}
                  controls
                  width="100%"
                  height="100%"
                  className="absolute top-0 left-0"
                  onReady={() => {
                    setIsPlayerReady(true);
                    setIsPlaying(true);
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  config={{
                    file: {
                      attributes: {
                        crossOrigin: 'anonymous',
                        autoPlay: true,
                      },
                    },
                  }}
                />
              ) : (
                // Use iframe for URLs like https://nonton.bid/#njeoof
                <iframe
                  src={streamUrl}
                  className="w-full h-full absolute top-0 left-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  frameBorder="0"
                  title={currentEpisode?.name || "Video Player"}
                  onLoad={() => {
                    setIsPlayerReady(true);
                    setIsPlaying(true);
                  }}
                />
              )
            ) : (
              <div className="flex justify-center items-center w-full h-full text-white">Video tidak tersedia.</div>
            )}
          </div>
          
          {/* Player controls (Next/Prev) */}
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={handlePreviousEpisode}
              disabled={currentEpisodeIndex === 0}
              className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous Episode
            </button>
            <button
              onClick={handleNextEpisode}
              disabled={currentEpisodeIndex === allEpisodes.length - 1}
              className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Episode
            </button>
          </div>
        </div>

        {/* Episode List Sidebar (for larger screens) */}
        <div className="w-full lg:w-1/4 bg-neutral-800 p-4 rounded-lg flex flex-col">
          <button 
            onClick={toggleEpisodeList}
            className="lg:hidden bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-lg mb-4"
          >
            {showEpisodeList ? "Hide Episodes" : "Show All Episodes"}
          </button>
          
          <div className={`overflow-y-auto flex-1 ${showEpisodeList ? 'block' : 'hidden lg:block'}`}>
            <h3 className="text-xl font-bold mb-4">All Episodes</h3>
            <ul className="space-y-2">
              {allEpisodes.map((episode, index) => (
                <li key={`episode-${index}-${index}`}>
                  <Link
                    href={`/drakor/watch/${index}?slug=${encodeURIComponent(dramaSlug || '')}&title=${encodeURIComponent(dramaTitle || '')}&image=${encodeURIComponent(dramaImage || '')}`}
                    className={`block p-3 rounded-lg transition-colors ${
                      (typeof episodeSlug === 'string' ? parseInt(episodeSlug, 10) : episodeSlug) === index ? 'bg-pink-600 text-white' : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-200'
                    }`}
                  >
                    {episode.name || `Episode ${index + 1}`}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchDrakor;