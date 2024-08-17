'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { db, auth } from '../firebase/config';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [filteredShops, setFilteredShops] = useState<any[]>([]);
  const [currentIndexRecommended, setCurrentIndexRecommended] = useState(0);
  const [currentIndexNew, setCurrentIndexNew] = useState(0);
  const [currentIndexFavorite, setCurrentIndexFavorite] = useState(0);
  const [itemsPerPage] = useState(3);
  const [isSearchSticky, setIsSearchSticky] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userName, setUserName] = useState(''); // For displaying user name
  const [userImage, setUserImage] = useState(''); // For displaying user image

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const shopsCollection = collection(db, 'businesses');
        const shopsSnapshot = await getDocs(shopsCollection);
        const shopsList = shopsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFilteredShops(shopsList);
        setCurrentIndexRecommended(0);
        setCurrentIndexNew(0);
        setCurrentIndexFavorite(0);
      } catch (error) {
        console.error('Error fetching shops:', error);
      }
    };

    fetchShops();
  }, []);

  useEffect(() => {
    // Fetch user data from Firestore
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = doc(collection(db, 'users'), user.uid);
          const docSnap = await getDoc(userDoc);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserName(`${data.firstName} ${data.lastName}`);
            setUserImage(data.profileImageUrl); // Assuming you store the profile image URL
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
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
    const filtered = filteredShops.filter(shop =>
      shop.businessName.toLowerCase().includes(query.toLowerCase()) ||
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
            {filteredShops.slice(currentIndexRecommended, currentIndexRecommended + itemsPerPage).map((shop) => (
              <Link key={shop.id} href={`/shop/${shop.id}`} className="flex-none w-64 bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="relative">
                  <Image
                    src={shop.businessImageUrls[0]} // Assuming images is an array of image URLs
                    alt={shop.businessName}
                    width={256}
                    height={160}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-0 left-0 p-2 bg-gray-800 text-white text-xs rounded-br-lg">
                    {shop.location}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{shop.businessName}</h3>
                  <p className="text-gray-600">{shop.location}</p>
                </div>
              </Link>
            ))}
          </div>
          <button
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full"
            onClick={() => nextPage(setCurrentIndexRecommended, currentIndexRecommended, filteredShops.length)}
            disabled={currentIndexRecommended + itemsPerPage >= filteredShops.length}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* New Places Section */}
      <div className="w-full p-8">
        <h2 className="text-3xl font-bold text-center mb-8">New Places</h2>
        <div className="relative flex justify-center">
          <button
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full"
            onClick={() => prevPage(setCurrentIndexNew, currentIndexNew)}
            disabled={currentIndexNew === 0}
          >
            &lt;
          </button>
          <div className="flex space-x-4 overflow-x-auto">
            {filteredShops.slice(currentIndexNew, currentIndexNew + itemsPerPage).map((shop) => (
              <Link key={shop.id} href={`/shop/${shop.id}`} className="flex-none w-64 bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="relative">
                  <Image
                    src={shop.businessImageUrls[0]} // Assuming images is an array of image URLs
                    alt={shop.businessName}
                    width={256}
                    height={160}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-0 left-0 p-2 bg-gray-800 text-white text-xs rounded-br-lg">
                    {shop.location}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{shop.businessName}</h3>
                  <p className="text-gray-600">{shop.location}</p>
                </div>
              </Link>
            ))}
          </div>
          <button
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full"
            onClick={() => nextPage(setCurrentIndexNew, currentIndexNew, filteredShops.length)}
            disabled={currentIndexNew + itemsPerPage >= filteredShops.length}
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
            {filteredShops.slice(currentIndexFavorite, currentIndexFavorite + itemsPerPage).map((shop) => (
              <Link key={shop.id} href={`/shop/${shop.id}`} className="flex-none w-64 bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="relative">
                  <Image
                    src={shop.businessImageUrls[0]} // Assuming images is an array of image URLs
                    alt={shop.businessName}
                    width={256}
                    height={160}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-0 left-0 p-2 bg-gray-800 text-white text-xs rounded-br-lg">
                    {shop.location}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{shop.businessName}</h3>
                  <p className="text-gray-600">{shop.location}</p>
                </div>
              </Link>
            ))}
          </div>
          <button
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full"
            onClick={() => nextPage(setCurrentIndexFavorite, currentIndexFavorite, filteredShops.length)}
            disabled={currentIndexFavorite + itemsPerPage >= filteredShops.length}
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
