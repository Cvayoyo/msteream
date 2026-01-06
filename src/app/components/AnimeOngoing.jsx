import React, { Suspense } from 'react'
import AnimeCard from './AnimeCard'
import Pagination from './Pagination'

const AnimeOngoing = ({ api, pagination }) => {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 my-12 mx-4 md:mx-24 gap-4 md:gap-6">
        {api.map((anime, index) => (
          <AnimeCard
            key={anime.slug}
            title={anime.title}
            image={anime.poster}
            slug={anime.slug}
            type={anime.type}
            episode={anime.episode}
            statusOrDay={anime.release_day}
            priority={index < 6}
          />
        ))}
      </div>
      {pagination && (
        <Suspense fallback={<div className="h-12"></div>}>
          <Pagination
            hasPrev={pagination.hasPrev}
            hasNext={pagination.hasNext}
            currentPage={pagination.currentPage || 1}
            basePath="/"
            type="ongoing"
            totalPages={pagination.totalPages}
          />
        </Suspense>
      )}
    </>
  )
}

export default AnimeOngoing