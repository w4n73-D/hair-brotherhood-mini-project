'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { barberShops, newBarberShops, favBarberShops } from '../data/shops'; // Ensure this path is correct

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [filteredShops, setFilteredShops] = useState(barberShops);
  const [newShops] = useState(newBarberShops);
  const [favoriteShops] = useState(favBarberShops);
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 3;
  const [isSearchSticky, setIsSearchSticky] = useState(false);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    filterShops(e.target.value);
  };

  const filterShops = (query) => {
    const filtered = barberShops.filter(shop =>
      shop.name.toLowerCase().includes(query.toLowerCase()) ||
      shop.location.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredShops(filtered);
    setCurrentIndex(0); // Reset to the first page of results
  };

  const nextPage = () => {
    if (currentIndex + itemsPerPage < filteredShops.length) {
      setCurrentIndex(currentIndex + itemsPerPage);
    }
  };

  const prevPage = () => {
    if (currentIndex - itemsPerPage >= 0) {
      setCurrentIndex(currentIndex - itemsPerPage);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) { // Adjust scrollY threshold as needed
        setIsSearchSticky(true);
      } else {
        setIsSearchSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Hero Section */}
      <div className="pt-24 w-full bg-gradient-to-r from-purple-300 to-blue-200 text-center flex flex-col items-center justify-center" style={{ height: '100vh' }}>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Book local barbering services</h1>
        {/* Search Bar (Initial Position) */}
        {!isSearchSticky && (
          <div className="flex justify-center items-center mb-8">
            <form onSubmit={(e) => e.preventDefault()} className="flex items-center">
              <input
                type="text"
                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none"
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
        )}
        <p className="text-lg mb-8">1,221 appointments booked today</p>
      </div>

      {/* Sticky Header with Logo and Icons */}
      <div className={`fixed top-0 w-full bg-gradient-to-r from-purple-300 to-blue-200 p-4 z-50 flex justify-between items-center ${isSearchSticky ? 'shadow-md' : 'hidden'}`} style={{ height: '64px' }}>
        <div className="flex items-center space-x-4">
          {/* Logo Placeholder */}
          <div className="mr-4">
            <Image src="/logo/hairbrotherhoodLOGO.png" alt="Logo" width={200} height={80} />
          </div>
        </div>
        {/* Sticky Search Bar */}
        {isSearchSticky && (
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
        )}
        <div className="flex items-center space-x-4">
          {/* User Profile and Messaging Icons */}
          <span>👤</span>
          <span>✉️</span>
        </div>
      </div>

      {/* Barber Shop Cards Section */}
      <div className="w-full p-8">
        <h2 className="text-3xl font-bold text-center mb-8">Recommended Places</h2>
        <div className="relative">
          <button
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full"
            onClick={prevPage}
            disabled={currentIndex === 0}
          >
            &lt;
          </button>
          <div className="flex space-x-4 justify-center overflow-hidden">
            {filteredShops.slice(currentIndex, currentIndex + itemsPerPage).map((shop) => (
              <div key={shop.id} className="bg-white shadow-lg rounded-lg overflow-hidden w-80">
                <Image src={shop.imageUrl} alt={shop.name} width={400} height={300} />
                <div className="p-4">
                  <h3 className="text-xl font-bold">{shop.name}</h3>
                  <p className="text-gray-600">{shop.location}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-yellow-400 mr-2">★</span>
                    <span>{shop.rating}</span>
                  </div>
                  <p className="text-gray-800 mt-2">{shop.price}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full"
            onClick={nextPage}
            disabled={currentIndex + itemsPerPage >= filteredShops.length}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* New Shops Section */}
      <div className="w-full p-8">
        <h2 className="text-3xl font-bold text-center mb-8">New Places</h2>
        <div className="relative">
          <button
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full"
            onClick={prevPage}
            disabled={currentIndex === 0}
          >
            &lt;
          </button>
          <div className="flex space-x-4 justify-center overflow-hidden">
            {newShops.slice(currentIndex, currentIndex + itemsPerPage).map((shop) => (
              <div key={shop.id} className="bg-white shadow-lg rounded-lg overflow-hidden w-80">
                <Image src={shop.imageUrl} alt={shop.name} width={400} height={300} />
                <div className="p-4">
                  <h3 className="text-xl font-bold">{shop.name}</h3>
                  <p className="text-gray-600">{shop.location}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-yellow-400 mr-2">★</span>
                    <span>{shop.rating}</span>
                  </div>
                  <p className="text-gray-800 mt-2">{shop.price}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full"
            onClick={nextPage}
            disabled={currentIndex + itemsPerPage >= newShops.length}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* People's Favorite Section */}
      <div className="w-full p-8">
        <h2 className="text-3xl font-bold text-center mb-8">People's Favorite</h2>
        <div className="relative">
          <button
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full"
            onClick={prevPage}
            disabled={currentIndex === 0}
          >
            &lt;
          </button>
          <div className="flex space-x-4 justify-center overflow-hidden">
            {favoriteShops.slice(currentIndex, currentIndex + itemsPerPage).map((shop) => (
              <div key={shop.id} className="bg-white shadow-lg rounded-lg overflow-hidden w-80">
                <Image src={shop.imageUrl} alt={shop.name} width={400} height={300} />
                <div className="p-4">
                  <h3 className="text-xl font-bold">{shop.name}</h3>
                  <p className="text-gray-600">{shop.location}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-yellow-400 mr-2">★</span>
                    <span>{shop.rating}</span>
                  </div>
                  <p className="text-gray-800 mt-2">{shop.price}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full"
            onClick={nextPage}
            disabled={currentIndex + itemsPerPage >= favoriteShops.length}
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
