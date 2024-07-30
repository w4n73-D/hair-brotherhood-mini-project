// src/app/shops/[id]/page.tsx

"use client";

import { useState } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { barberShops, newBarberShops, favBarberShops } from '../../data/shops'; // Ensure the path is correct

interface Shop {
  id: number;
  name: string;
  location: string;
  rating: number;
  price: string;
  description: string;
  imageUrl: string;
}

const findShopById = (id: number) => {
  return (
    barberShops.find(shop => shop.id === id) ||
    newBarberShops.find(shop => shop.id === id) ||
    favBarberShops.find(shop => shop.id === id) ||
    null
  );
};

const ShopPage = ({ params }: { params: { id: string } }) => {
  const shopId = parseInt(params.id, 10);
  const shop = findShopById(shopId);

  if (!shop) {
    notFound();
  }

  const [chatOpen, setChatOpen] = useState(false);

  const handleOpenChat = () => {
    setChatOpen(true);
  };

  const handleCloseChat = () => {
    setChatOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-4">{shop.name}</h1>
      <Image src={shop.imageUrl} alt={shop.name} width={800} height={600} className="mb-4" />
      <p className="text-lg mb-4">{shop.location}</p>
      <p className="text-lg mb-4">{shop.description}</p>
      <p className="text-lg mb-4">Rating: {shop.rating}</p>
      <p className="text-lg mb-4">Price: {shop.price}</p>
      <div className='w-[400px] flex justify-between'>
        <span className='bg-orange-300 text-center rounded-xl h-[30px] w-[170px]'>Book an Appointment</span>
        <button
          onClick={handleOpenChat}
          className='bg-orange-300 text-center rounded-xl h-[30px] w-[170px]'
        >
          Send a message
        </button>
      </div>

      {chatOpen && (
        <div className="fixed bottom-0 right-0 m-4 p-4 bg-white shadow-lg rounded-lg w-80">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">Chat with Barber</h3>
            <button onClick={handleCloseChat} className="text-red-500">✖️</button>
          </div>
          <div className="overflow-y-auto h-64">
            {/* Chat messages will appear here */}
          </div>
          <input
            type="text"
            className="w-full mt-2 p-2 border border-gray-300 rounded"
            placeholder="Type your message..."
          />
        </div>
      )}
    </div>
  );
};

export default ShopPage;
