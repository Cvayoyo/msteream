"use client";

import { useEffect } from 'react';

const ScrollToContent = () => {
  useEffect(() => {
    // Scroll ke body content setelah HeroSection
    const timer = setTimeout(() => {
      const contentElement = document.getElementById('schedule-content');
      if (contentElement) {
        contentElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100); // Small delay to ensure HeroSection is rendered

    return () => clearTimeout(timer);
  }, []);

  return null;
};

export default ScrollToContent;
