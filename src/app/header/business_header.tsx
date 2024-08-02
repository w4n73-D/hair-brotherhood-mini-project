"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { auth, db } from '../firebase/config'; // Ensure the path is correct
import { doc, getDoc } from 'firebase/firestore';

const BusinessHeader = ({ show }: { show: boolean }) => {
  const [isSearchSticky, setIsSearchSticky] = useState(false);
  const [search, setSearch] = useState('');
  const [userDetails, setUserDetails] = useState<{ firstName: string; lastName: string } | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [businessName, setBusinessName] = useState<string>(''); // Initialize state for businessName
  const router = useRouter(); // Use Next.js router for navigation

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

  useEffect(() => {
    const fetchUserDetails = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDoc);
          if (userSnap.exists()) {
            setUserDetails(userSnap.data() as { firstName: string; lastName: string });
          } else {
            console.error('No such document!');
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      }
    };

    const fetchBusinessName = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const businessDoc = doc(db, 'businesses', user.uid);
          const businessSnap = await getDoc(businessDoc);
          if (businessSnap.exists()) {
            setBusinessName(businessSnap.data()?.businessName || '');
          }
        } catch (error) {
          console.error('Error fetching business name:', error);
        }
      }
    };

    fetchUserDetails();
    fetchBusinessName();
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push('/'); // Redirect to homepage after sign out
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className={`fixed top-0 w-full bg-gradient-to-r from-purple-300 to-blue-200 p-4 z-50 flex justify-between items-center ${show ? '' : 'hidden'}`} style={{ height: '64px' }}>
      <div className="flex items-center space-x-4">
        <div className="mr-4">
          <Image src="/logo/hairbrotherhoodLOGO.png" alt="Logo" width={200} height={80} />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <span
            className="cursor-pointer"
            onClick={() => setShowPopup(!showPopup)}
          >
            👤
          </span>
          {showPopup && (
            <div className="absolute top-full right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-48">
              {userDetails && (
                <>
                  <p className="font-bold text-lg">{userDetails.firstName} {userDetails.lastName}</p>
                  <p className="text-gray-700">Business: {businessName}</p>
                  <button
                    onClick={handleSignOut}
                    className="mt-2 w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        <span>✉️</span>
      </div>
    </div>
  );
};

export default BusinessHeader;
