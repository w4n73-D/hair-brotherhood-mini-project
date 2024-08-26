"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Image from 'next/image';
import Header from '@/app/header/header';

interface DayOfOperation {
  day: string;
  opening: string;
  closing: string;
}

interface PriceItem {
  service: string;
  price: string;
}

interface Shop {
  businessName: string;
  location: string;
  phoneNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  businessImageUrls: string[];
  daysOfOperation: DayOfOperation[];
  priceList: PriceItem[];
  bio: string;
}

const ShopPage = ({ params }: { params: { id: string } }) => {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<{ uid: string }>({ uid: 'testUserId' }); // Simulated user for testing
  const [appointmentOpen, setAppointmentOpen] = useState<boolean>(false);
  const [service, setService] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>(''); // Added state for customer name
  const [customerPhone, setCustomerPhone] = useState<string>(''); // Added state for customer phone number
  const router = useRouter();
  const shopId = params.id;

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        if (!shopId) throw new Error('Shop ID is missing');

        const docRef = doc(db, 'businesses', shopId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setShop(docSnap.data() as Shop);
        } else {
          console.error('No such document!');
        }
      } catch (error) {
        console.error('Error fetching shop data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [shopId]);

  const handleOpenAppointment = () => setAppointmentOpen(true);
  const handleCloseAppointment = () => {
    setAppointmentOpen(false);
    setService('');
    setTime('');
    setCustomerName(''); // Reset customer name
    setCustomerPhone(''); // Reset customer phone number
  };

  const handleBookAppointment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (service.trim() && time.trim() && customerName.trim() && customerPhone.trim()) {
      try {
        await addDoc(collection(db, 'appointments'), {
          shopId,
          userId: user.uid,
          service,
          time,
          customerName, // Include customer name in the document
          customerPhone, // Include customer phone number in the document
          timestamp: new Date(),
        });
        handleCloseAppointment();
      } catch (error) {
        console.error('Error booking appointment:', error);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!shop) return <div>No shop data found.</div>;

  return (
    <div className="min-h-screen flex flex-col items-center p-8">
      <Header show={true} />

      <div className="w-full max-w-screen-lg mx-auto mt-[60px]">
        <div className="text-center mb-[10px] flex space-x-6">
          <h1 className="text-3xl font-bold mb-2">{shop.businessName}</h1>
          <p className="text-lg mb-2">Location: {shop.location}</p>
          <p className="text-lg mb-2">Phone: {shop.phoneNumber}</p>
          <p className="text-lg mb-2">Email: {shop.email}</p>
        </div>

        <div className="w-full flex flex-col mb-8">
          <div className="w-full flex mb-4">
            <div className="w-full max-w-[700px] flex-1 mr-4">
              <Image src={shop.businessImageUrls[0]} alt={shop.businessName} width={600} height={450} className="w-full h-auto rounded-xl" />
            </div>
            <div className="flex flex-col space-y-4 w-full max-w-[300px] flex-shrink-0">
              {shop.businessImageUrls.length > 1 && (
                <>
                  <Image src={shop.businessImageUrls[1]} alt={`${shop.businessName} image 2`} width={200} height={150} className="w-full h-auto object-cover rounded-xl" />
                  {shop.businessImageUrls.length > 2 && (
                    <Image src={shop.businessImageUrls[2]} alt={`${shop.businessName} image 3`} width={200} height={150} className="w-full h-auto object-cover rounded-xl" />
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="text-center mb-[10px]">
          <p className="text-lg mb-2">Bio: {shop.bio}</p>
        </div>

        <div className="w-full mb-8">
          <h2 className="text-2xl font-bold mb-4">Days of Operation</h2>
          {shop.daysOfOperation.length > 0 ? (
            shop.daysOfOperation.map((day, index) => (
              <div key={index} className="mb-4">
                <p className="text-lg font-bold">{day.day}</p>
                <p>{day.opening} - {day.closing}</p>
              </div>
            ))
          ) : (
            <p>No days of operation available.</p>
          )}
        </div>

        <div className="w-full mb-8">
          <h2 className="text-2xl font-bold mb-4">Price List</h2>
          {shop.priceList.length > 0 ? (
            shop.priceList.map((item, index) => (
              <div key={index} className="mb-4">
                <p className="text-lg font-bold">{item.service}</p>
                <p>${item.price}</p>
              </div>
            ))
          ) : (
            <p>No price list available.</p>
          )}
        </div>

        <div className="w-[700px] flex justify-between mb-8">
          <button
            onClick={handleOpenAppointment}
            className="bg-orange-300 text-center rounded-xl h-[30px] w-[170px]"
          >
            Book an Appointment
          </button>
        </div>
      </div>

      {appointmentOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-xl font-bold mb-4">Book an Appointment</h3>
            <form onSubmit={handleBookAppointment}>
              <div className="mb-4">
                <label htmlFor="customerName" className="block text-sm font-medium mb-1">Name</label>
                <input
                  id="customerName"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="border border-gray-300 p-2 rounded-lg w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="customerPhone" className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  id="customerPhone"
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="border border-gray-300 p-2 rounded-lg w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="service" className="block text-sm font-medium mb-1">Service</label>
                <input
                  id="service"
                  type="text"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="border border-gray-300 p-2 rounded-lg w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="time" className="block text-sm font-medium mb-1">Preferred Time</label>
                <input
                  id="time"
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="border border-gray-300 p-2 rounded-lg w-full"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded-lg w-full"
              >
                Book Appointment
              </button>
              <button
                type="button"
                onClick={handleCloseAppointment}
                className="bg-red-500 text-white py-2 px-4 rounded-lg w-full mt-4"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
