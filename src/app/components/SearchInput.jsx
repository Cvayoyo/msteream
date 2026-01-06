'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

export default function SearchInput({ basePath = "/search", placeholder = "Cari judul..." }) {
  const router = useRouter();
  const searchRef = useRef()

  const handleSearch = (e) => {
    e.preventDefault();

    const keyword = searchRef.current.value

    if (keyword == "") {
      // alert("ketik dulu dongo") // Removing rude alert for premium feel
      return; 
    } else if (keyword.trim() == "") {
      // alert("jangan ngetik spasi juga dongo") // Removing rude alert for premium feel
      return;
    } else {
      router.push(`${basePath}/${keyword}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-md my-8 relative group z-10">
      {/* Glow Effect Background */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full opacity-50 group-hover:opacity-100 transition duration-500 blur-sm group-focus-within:opacity-100 group-focus-within:blur-md"></div>
      
      <div className="relative flex items-center">
        <input
          type="text"
          ref={searchRef}
          placeholder={placeholder}
          className="w-full bg-[#1A1A29] border border-neutral-700 text-white rounded-full py-3 pl-6 pr-14 focus:outline-none focus:border-transparent placeholder-neutral-500 shadow-xl transition-all duration-300"
        />
        <button
          type="submit"
          className="absolute right-2 p-2 bg-pink-600 text-white rounded-full sm:hover:scale-110 active:scale-95 transition-all duration-200 shadow-lg shadow-pink-600/30"
          aria-label="Cari"
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}

