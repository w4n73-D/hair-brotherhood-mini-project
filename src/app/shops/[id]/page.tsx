"use client";

import { useState } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { barberShops, newBarberShops, favBarberShops } from '../../data/shops'; // Ensure the path is correct
import Header from '@/app/header/header'; // Adjust the path as needed

interface Shop {
  id: number;
  name: string;
  location: string;
  rating: number;
  price: string;
  description: string;
  imageUrl: string;
  images: string[];
  services: { name: string; duration: string; price: string; }[];
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
  const shop: Shop | null = findShopById(shopId);

  if (!shop) {
    notFound();
  }

  const [chatOpen, setChatOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true); // Initialize based on the user's action

  const handleOpenChat = () => {
    setChatOpen(true);
  };

  const handleCloseChat = () => {
    setChatOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-8">
      <Header show={showHeader} /> {/* Pass state to show/hide the header */}

      {/* Main Container */}
      <div className="w-full max-w-screen-lg mx-auto mt-[60px]">

        {/* Shop Name and Reviews */}
        <div className="text-center mb-[10px] flex justify-between">
          <h1 className="text-3xl font-bold mb-2">{shop.name}</h1>
          <p className="text-xl mb-2">{shop.rating} ★ (39 reviews)</p>
          <p className={`text-lg ${shop.open ? 'text-green-500' : 'text-red-500'}`}>
            {shop.open ? 'Open now' : 'Closed'}
          </p>
        </div>

        {/* Gallery */}
        <div className="w-full flex flex-col mb-8">
          <div className="w-full flex mb-4">
            {/* Main large image */}
            <div className="w-full max-w-[700px] flex-1 mr-4">
              <Image src={shop.imageUrl} alt={shop.name} width={600} height={450} className="w-full h-auto rounded-xl" />
            </div>
            {/* Two smaller images */}
            <div className="flex flex-col space-y-4 w-full max-w-[300px] flex-shrink-0">
              {shop.images && shop.images.length > 1 ? (
                <>
                  <Image src={shop.images[1]} alt={`${shop.name} image 2`} width={200} height={150} className="w-full h-auto object-cover rounded-xl" />
                  <Image src={shop.images[2]} alt={`${shop.name} image 3`} width={200} height={150} className="w-full h-auto object-cover rounded-xl" />
                </>
              ) : (
                <p>No additional images available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="w-full mb-8">
          <p className="text-lg mb-4">Location: {shop.location}</p>
          <p className="text-lg mb-4">{shop.description}</p>
          <p className="text-lg mb-4">Price Range: {shop.price}</p>
        </div>

        {/* Services */}
        <div className="w-full mb-8">
          <h2 className="text-2xl font-bold mb-4">Services</h2>
          <div>
            {shop.services && shop.services.length > 0 ? (
              shop.services.map((service, index) => (
                <div key={index} className="mb-4">
                  <h3 className="text-lg font-bold">{service.name}</h3>
                  <p>{service.duration} | {service.price}</p>
                </div>
              ))
            ) : (
              <p>No services available.</p>
            )}
          </div>
        </div>

        {/* Booking and Chat */}
        <div className="w-[700px] flex justify-between mb-8">
          <button className="bg-orange-300 text-center rounded-xl h-[30px] w-[170px]">
            Book an Appointment
          </button>
          <button
            onClick={handleOpenChat}
            className="bg-orange-300 text-center rounded-xl h-[30px] w-[170px]"
          >
            Send a message
          </button>
        </div>

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
