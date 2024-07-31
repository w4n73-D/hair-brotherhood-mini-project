// src/components/Header.tsx
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Header = ({ show }: { show: boolean }) => {
  const [isSearchSticky, setIsSearchSticky] = useState(false);
  const [search, setSearch] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    // Implement search logic here
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSearchSticky(true);
      } else {
        setIsSearchSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`fixed top-0 w-full bg-gradient-to-r from-purple-300 to-blue-200 p-4 z-50 flex justify-between items-center ${show ? '' : 'hidden'}`} style={{ height: '64px' }}>
      <div className="flex items-center space-x-4">
        <div className="mr-4">
          <Image src="/logo/hairbrotherhoodLOGO.png" alt="Logo" width={200} height={80} />
        </div>
      </div>
      <div className="flex-grow max-w-xl mx-auto">
        <form onSubmit={(e) => e.preventDefault()} className="flex items-center justify-center">
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none"
            placeholder="Any treatment or venue"
            value={search}
            onChange={handleSearchChange}
          />
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded-r-lg hover:bg-gray-800 transition-colors"
          >
            Search
          </button>
        </form>
      </div>
      <div className="flex items-center space-x-4">
        <span>👤</span>
        <span>✉️</span>
      </div>
    </div>
  );
};

export default Header;
