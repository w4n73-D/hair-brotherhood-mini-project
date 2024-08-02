'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import Image from 'next/image';

export default function DashboardPage() {
  const [businessData, setBusinessData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, 'businesses', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setBusinessData(docSnap.data());
          } else {
            console.error('No such document!');
          }
        }
      } catch (error) {
        console.error('Error fetching business data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!businessData) {
    return <div>No business data found.</div>;
  }

  const { businessName, businessImageUrls = [], bio, priceList = [], daysOfOperation = [] } = businessData;

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <button
        className="text-blue-500 mb-4"
        onClick={() => router.push('/')}
      >
        Go to Homepage
      </button>

      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-4xl font-bold mb-4">{businessName}</h1>

        <div className="flex justify-center mb-8">
          <div className="relative">
            {businessImageUrls.length > 0 && (
              <Image
                src={businessImageUrls[0]}
                alt="Business Image"
                width={800}
                height={400}
                className="w-full rounded-lg"
              />
            )}
            <div className="absolute top-0 right-0 flex flex-col space-y-2">
              {businessImageUrls.slice(1).map((url: string, index: number) => (
                <Image
                  key={index}
                  src={url}
                  alt={`Additional Business Image ${index + 1}`}
                  width={200}
                  height={200}
                  className="w-48 h-48 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Business Bio</h2>
          <p className="text-gray-700">{bio}</p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Price List</h2>
          <ul className="list-disc list-inside">
            {priceList.map((price, index) => (
              <li key={index} className="mb-2">
                <span className="font-semibold">{price.service}:</span> ${price.price}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Days of Operation</h2>
          <ul className="list-disc list-inside">
            {daysOfOperation.map((day, index) => (
              <li key={index} className="mb-2">
                <span className="font-semibold">{day.day}:</span> {day.opening} - {day.closing}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
