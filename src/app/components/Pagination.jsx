"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React from 'react';

const Pagination = ({ hasPrev, hasNext, currentPage, basePath, type, totalPages }) => {
  const searchParams = useSearchParams();
  
  // Build query string untuk pagination sambil mempertahankan query params yang ada
  const buildQuery = (page) => {
    const params = new URLSearchParams();
    
    // Pertahankan query params yang ada
    if (searchParams) {
      searchParams.forEach((value, key) => {
        // Skip jika ini adalah page untuk type yang sama
        if (type === 'ongoing' && key === 'ongoingPage') return;
        if (type === 'completed' && key === 'completedPage') return;
        if (type === 'popular' && key === 'page') return;
        if (type === 'movie' && key === 'page') return;
        if (type === 'genre' && key === 'page') return;
        params.set(key, value);
      });
    }
    
    // Set page untuk type yang sesuai
    if (type === 'ongoing') {
      params.set('ongoingPage', page.toString());
    } else if (type === 'completed') {
      params.set('completedPage', page.toString());
    } else if (type === 'popular') {
      params.set('page', page.toString());
    } else if (type === 'movie') {
      params.set('page', page.toString());
    } else if (type === 'genre') {
      params.set('page', page.toString());
    }
    
    return params.toString() ? `?${params.toString()}` : '';
  };

  // Generate array of page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Maximum number of page buttons to show
    
    if (totalPages && totalPages <= maxVisible) {
      // If total pages is less than max visible, show all
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(startPage + maxVisible - 1, totalPages || currentPage + 2);
      
      // Adjust start if we're near the end
      if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const firstPage = 1;
  const lastPage = totalPages || (hasNext ? currentPage + 10 : currentPage); // Estimate if totalPages not available

  return (
    <div className="flex justify-center items-center gap-2 mt-8 mb-8">
      {/* First Page Button */}
      {currentPage > 1 && (
        <Link
          href={`${basePath}${buildQuery(firstPage)}`}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white transition-colors"
          title="Halaman Pertama"
        >
          &lt;&lt;
        </Link>
      )}

      {/* Previous Page Button */}
      {hasPrev && currentPage > 1 && (
        <Link
          href={`${basePath}${buildQuery(currentPage - 1)}`}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white transition-colors"
          title="Halaman Sebelumnya"
        >
          &lt;
        </Link>
      )}

      {/* Page Number Buttons */}
      {pageNumbers.map((pageNum) => (
        <Link
          key={pageNum}
          href={`${basePath}${buildQuery(pageNum)}`}
          className={`w-10 h-10 flex items-center justify-center rounded-full font-medium transition-colors ${
            pageNum === currentPage
              ? 'bg-pink-500 text-white'
              : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
          }`}
        >
          {pageNum}
        </Link>
      ))}

      {/* Next Page Button */}
      {hasNext && (
        <Link
          href={`${basePath}${buildQuery(currentPage + 1)}`}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white transition-colors"
          title="Halaman Selanjutnya"
        >
          &gt;
        </Link>
      )}

      {/* Last Page Button */}
      {hasNext && totalPages && currentPage < totalPages && (
        <Link
          href={`${basePath}${buildQuery(lastPage)}`}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white transition-colors"
          title="Halaman Terakhir"
        >
          &gt;&gt;
        </Link>
      )}
    </div>
  );
};

export default Pagination;
