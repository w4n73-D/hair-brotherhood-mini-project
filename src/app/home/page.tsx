'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { db, auth } from '../firebase/config';
import { barberShops, newBarberShops, favBarberShops } from '../data/shops';
import { reviews } from '../data/reviews';
import { collection, doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [filteredShops, setFilteredShops] = useState(barberShops);
  const [currentIndexRecommended, setCurrentIndexRecommended] = useState(0);
  const [currentIndexNew, setCurrentIndexNew] = useState(0);
  const [currentIndexFavorite, setCurrentIndexFavorite] = useState(0);
  const [itemsPerPage] = useState(3);
  const [isSearchSticky, setIsSearchSticky] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userName, setUserName] = useState(''); // For displaying user name
  const [userImage, setUserImage] = useState(''); // For displaying user image

  useEffect(() => {
    // Fetch user data from Firestore
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = doc(collection(db, 'users'), user.uid);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserName(`${data.firstName} ${data.lastName}`);
          setUserImage(data.profileImageUrl); // Assuming you store the profile image URL
        }
      }
    };

    fetchUserData();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    filterShops(e.target.value);
  };

  const filterShops = (query: string) => {
    const filtered = barberShops.filter(shop =>
      shop.name.toLowerCase().includes(query.toLowerCase()) ||
      shop.location.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredShops(filtered);
    setCurrentIndexRecommended(0);
  };

  const nextPage = (setCurrentIndex: React.Dispatch<React.SetStateAction<number>>, currentIndex: number, listLength: number) => {
    if (currentIndex + itemsPerPage < listLength) {
      setCurrentIndex(currentIndex + itemsPerPage);
    }
  };

  const prevPage = (setCurrentIndex: React.Dispatch<React.SetStateAction<number>>, currentIndex: number) => {
    if (currentIndex - itemsPerPage >= 0) {
      setCurrentIndex(currentIndex - itemsPerPage);
    }
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

  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/'; // Redirect to homepage
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Hero Section */}
      <div className="pt-24 w-full bg-gradient-to-r from-purple-300 to-blue-200 text-center flex flex-col items-center justify-center" style={{ height: '100vh' }}>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Book local barbering services</h1>
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
          <div className="mr-4">
            <Image src="/logo/hairbrotherhoodLOGO.png" alt="Logo" width={200} height={80} />
          </div>
        </div>
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
          <button onClick={toggleUserMenu} className="relative">
            <span>👤</span>
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg w-48">
                <div className="p-4 flex flex-col items-center">
                  {userImage && (
                    <Image src={userImage} alt="User Image" width={50} height={50} className="rounded-full mb-2" />
                  )}
                  <h3 className="text-lg font-bold">{userName}</h3>
                </div>
                <ul className="text-gray-800">
                  <li className="p-2 border-t border-gray-200 hover:bg-gray-100 pl-4">
                    <Link href="/favorites">Favorites</Link>
                  </li>
                  <li className="p-2 border-t border-gray-200 hover:bg-gray-100 pl-4">
                    <Link href="/saved-places">Saved Places</Link>
                  </li>
                  <li className="p-2 border-t border-gray-200 hover:bg-gray-100 pl-4">
                    <Link href="/account-settings">Account Settings</Link>
                  </li>
                  <li className="p-2 border-t border-gray-200 hover:bg-gray-100 pl-4">
                    <button onClick={handleLogout} className="w-full text-left">Log Out</button>
                  </li>
                </ul>
              </div>
            )}
          </button>
          <span>✉️</span>
        </div>
      </div>

      {/* Remaining Sections */}
      {/* Recommended Places Section */}
      <div className="w-full p-8">
        <h2 className="text-3xl font-bold text-center mb-8">Recommended Places</h2>
        <div className="relative flex justify-center">
          <button
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full"
            onClick={() => prevPage(setCurrentIndexRecommended, currentIndexRecommended)}
            disabled={currentIndexRecommended === 0}
          >
            &lt;
          </button>
          <div className="flex space-x-4 overflow-x-auto">
            {barberShops.slice(currentIndexRecommended, currentIndexRecommended + itemsPerPage).map((shop) => (
              <Link key={shop.id} href={`/shops/${shop.id}`} className="bg-white shadow-lg rounded-lg overflow-hidden w-80 cursor-pointer">
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
              </Link>
            ))}
          </div>
          <button
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full"
            onClick={() => nextPage(setCurrentIndexRecommended, currentIndexRecommended, barberShops.length)}
            disabled={currentIndexRecommended + itemsPerPage >= barberShops.length}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* New Barbershops Section */}
      <div className="w-full p-8">
        <h2 className="text-3xl font-bold text-center mb-8">New Barbershops</h2>
        <div className="relative flex justify-center">
          <button
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full"
            onClick={() => prevPage(setCurrentIndexNew, currentIndexNew)}
            disabled={currentIndexNew === 0}
          >
            &lt;
          </button>
          <div className="flex space-x-4 overflow-x-auto">
            {newBarberShops.slice(currentIndexNew, currentIndexNew + itemsPerPage).map((shop) => (
              <Link key={shop.id} href={`/shops/${shop.id}`} className="bg-white shadow-lg rounded-lg overflow-hidden w-80 cursor-pointer">
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
              </Link>
            ))}
          </div>
          <button
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full"
            onClick={() => nextPage(setCurrentIndexNew, currentIndexNew, newBarberShops.length)}
            disabled={currentIndexNew + itemsPerPage >= newBarberShops.length}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* People's Favorite Section */}
      <div className="w-full p-8">
        <h2 className="text-3xl font-bold text-center mb-8">People's Favorite</h2>
        <div className="relative flex justify-center">
          <button
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full"
            onClick={() => prevPage(setCurrentIndexFavorite, currentIndexFavorite)}
            disabled={currentIndexFavorite === 0}
          >
            &lt;
          </button>
          <div className="flex space-x-4 overflow-x-auto">
            {favBarberShops.slice(currentIndexFavorite, currentIndexFavorite + itemsPerPage).map((shop) => (
              <Link key={shop.id} href={`/shops/${shop.id}`} className="bg-white shadow-lg rounded-lg overflow-hidden w-80 cursor-pointer">
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
              </Link>
            ))}
          </div>
          <button
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full"
            onClick={() => nextPage(setCurrentIndexFavorite, currentIndexFavorite, favBarberShops.length)}
            disabled={currentIndexFavorite + itemsPerPage >= favBarberShops.length}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="w-full p-8">
        <h2 className="text-3xl font-bold text-center mb-8">Reviews</h2>
        <div className="relative flex justify-center">
          <button
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full"
            onClick={() => prevPage(setCurrentIndexRecommended, currentIndexRecommended)}
            disabled={currentIndexRecommended === 0}
          >
            &lt;
          </button>
          <div className="flex space-x-4 overflow-x-auto">
            {reviews.slice(currentIndexRecommended, currentIndexRecommended + itemsPerPage).map((review) => (
              <div key={review.id} className="bg-white shadow-lg rounded-lg overflow-hidden w-80">
                <div className="p-4">
                  <h3 className="text-xl font-bold">{review.reviewerName}</h3>
                  <p className="text-gray-800 mt-2">{review.reviewText}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-yellow-400 mr-2">★</span>
                    <span>{review.rating}</span>
                  </div>
                  <p className="text-gray-600 mt-2">{review.shopName}</p>
                </div>
                <Image src={review.shopImageUrl} alt={review.shopName} width={400} height={300} />
              </div>
            ))}
          </div>
          <button
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full"
            onClick={() => nextPage(setCurrentIndexRecommended, currentIndexRecommended, reviews.length)}
            disabled={currentIndexRecommended + itemsPerPage >= reviews.length}
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
