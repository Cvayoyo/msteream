"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const ScrollToContent = () => {
  const searchParams = useSearchParams();
  const page = searchParams.get('page');

  useEffect(() => {
    // Scroll ke body content setelah HeroSection
    // Juga trigger saat page berubah (pagination)
    const timer = setTimeout(() => {
      const contentElement = document.getElementById('genre-content');
      if (contentElement) {
        contentElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100); // Small delay to ensure HeroSection is rendered

    return () => clearTimeout(timer);
  }, [page]); // Re-run saat page berubah

  return null;
};

export default ScrollToContent;
