'use client';

import Image from 'next/image';
import { barberShops } from '../data/shops';


export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Barber Shops</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {barberShops.map(shop => (
          <div key={shop.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
            <Image src={shop.imageUrl} alt={shop.name} width={400} height={300} />
            <div className="p-4">
              <h2 className="text-2xl font-bold">{shop.name}</h2>
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
    </div>
  );
}
