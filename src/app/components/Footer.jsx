"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Footer = () => {
  const router = useRouter();
  
  // Generate array dari A sampai Z
  const letters = [...Array(26)].map((_, i) => String.fromCharCode(65 + i));

  const handleAlphabetClick = (letter) => {
    // Redirect ke search page dengan alphabet yang dipilih
    router.push(`/search/${encodeURIComponent(letter)}`);
  };

  return (
    <footer className="w-full bg-[#1A1A29] text-neutral-400 py-6 mt-12 border-t border-neutral-700">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* A-Z LIST Header Section */}
          <div className="mb-4 pt-4">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-xl md:text-2xl font-bold text-white">A-Z LIST</h2>
              <div className="h-5 w-px bg-white"></div>
              <p className="text-neutral-300 text-xs md:text-sm">
                Searching anime order by alphabet name A to Z
              </p>
            </div>
            
            {/* Alphabet Buttons */}
            <div className="flex flex-wrap justify-center gap-1.5">
              {letters.map((letter) => (
                <button
                  key={letter}
                  onClick={() => handleAlphabetClick(letter)}
                  className="w-9 h-9 flex items-center justify-center font-bold text-xs rounded-full bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white transition-all"
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-neutral-700 my-4"></div>

          {/* Disclaimer */}
          <p className="text-xs leading-relaxed mb-3">
            StudentArt-Anime does not host any files, it merely pulls streams from 3rd party services. 
            Legal issues should be taken up with the file hosts and providers. 
            StudentArt-Anime is not responsible for any media files shown by the video providers.
          </p>
          
          {/* Copyright */}
          <p className="text-xs text-center">
            © StudentArt-Anime. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
