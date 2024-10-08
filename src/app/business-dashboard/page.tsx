"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import Image from 'next/image';
import BusinessHeader from '../header/business_header';

// Define interfaces for the data structures used
interface PriceItem {
  service: string;
  price: number;
}

interface DayOfOperation {
  day: string;
  opening: string;
  closing: string;
}

interface Appointment {
  id: string;
  customerName: string;
  service: string;
  time: string;
  customerPhone: string;
  shopId: string; // Added shopId to match appointments to shops
}

export default function DashboardPage() {
  const [businessData, setBusinessData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [appointmentsOpen, setAppointmentsOpen] = useState<boolean>(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [newBio, setNewBio] = useState<string>('');
  const [newPriceService, setNewPriceService] = useState<string>('');
  const [newPrice, setNewPrice] = useState<number | ''>('');
  const [newDay, setNewDay] = useState<string>('');
  const [newOpening, setNewOpening] = useState<string>('');
  const [newClosing, setNewClosing] = useState<string>('');
  const [priceList, setPriceList] = useState<PriceItem[]>([]);
  const [daysOfOperation, setDaysOfOperation] = useState<DayOfOperation[]>([]);
  const router = useRouter();

  // Fetch business data from Firestore when the component mounts
  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, 'businesses', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setBusinessData(data);
            setNewBio(data.bio || '');
            setPriceList(data.priceList || []);
            setDaysOfOperation(data.daysOfOperation || []);
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

  // Fetch appointments for the specific shop and set up a real-time listener
  useEffect(() => {
    const fetchAppointments = async () => {
      const user = auth.currentUser;
      if (user && user.uid) {
        try {
          const shopId = user.uid; // Assuming the shopId is the same as user.uid

          // Query appointments for the specific shopId
          const appointmentsQuery = query(
            collection(db, 'appointments'),
            where('shopId', '==', shopId),
            orderBy('timestamp') // Use timestamp for sorting
          );

          const unsubscribe = onSnapshot(appointmentsQuery, (snapshot) => {
            const fetchedAppointments = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Appointment[];
            setAppointments(fetchedAppointments);
          });

          return () => unsubscribe();
        } catch (error) {
          console.error('Error fetching appointments:', error);
        }
      }
    };

    fetchAppointments();
  }, []);

  // Handle the opening of the appointments list
  const handleOpenAppointments = () => {
    setAppointmentsOpen(true);
  };

  // Handle the closing of the appointments list
  const handleCloseAppointments = () => {
    setAppointmentsOpen(false);
  };

  // Handle adding a new price to the price list
  const handleAddPrice = async () => {
    if (newPriceService.trim() && newPrice !== '' && typeof newPrice === 'number') {
      try {
        const updatedPriceList = [...priceList, { service: newPriceService, price: newPrice }];
        setPriceList(updatedPriceList);
        const user = auth.currentUser;
        if (user) {
          await updateDoc(doc(db, 'businesses', user.uid), { priceList: updatedPriceList });
        }
        setNewPriceService('');
        setNewPrice('');
      } catch (error) {
        console.error('Error updating price list:', error);
      }
    }
  };

  // Handle adding a new day to the days of operation
  const handleAddDay = async () => {
    if (newDay.trim() && newOpening.trim() && newClosing.trim()) {
      try {
        const updatedDays = [...daysOfOperation, { day: newDay, opening: newOpening, closing: newClosing }];
        setDaysOfOperation(updatedDays);
        const user = auth.currentUser;
        if (user) {
          await updateDoc(doc(db, 'businesses', user.uid), { daysOfOperation: updatedDays });
        }
        setNewDay('');
        setNewOpening('');
        setNewClosing('');
      } catch (error) {
        console.error('Error updating days of operation:', error);
      }
    }
  };

  // Handle updating the business bio
  const handleBioChange = async () => {
    if (newBio.trim()) {
      try {
        const user = auth.currentUser;
        if (user) {
          await updateDoc(doc(db, 'businesses', user.uid), { bio: newBio });
        }
      } catch (error) {
        console.error('Error updating bio:', error);
      }
    }
  };

  // Display loading message while fetching data
  if (loading) {
    return <div>Loading...</div>;
  }

  // Display message if no business data is found
  if (!businessData) {
    return <div>No business data found.</div>;
  }

  const { businessName, businessImageUrls = [], location } = businessData;

  return (
    <div className="min-h-screen bg-gray-100">
      <BusinessHeader show={true} />

      <div className="pt-16 p-8">
        <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow">
          {/* Display business name and location */}
          <div className="flex items-center mb-4">
            <h1 className="text-4xl font-bold mr-4">{businessName}</h1>
            {location && (
              <p className="text-xl text-gray-600 font-bold">At: {location}</p>
            )}
          </div>

          {/* Display main business image and additional images */}
          <div className="flex mb-8">
            <div className="flex-1 relative">
              {businessImageUrls.length > 0 && (
                <Image
                  src={businessImageUrls[0]}
                  alt="Business Image"
                  width={800}
                  height={400}
                  className="w-full rounded-lg"
                />
              )}
            </div>
            <div className="flex flex-col justify-between space-y-2 ml-4">
              {businessImageUrls.slice(1, 3).map((url: string, index: number) => (
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

          {/* Business bio section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Business Bio</h2>
            <textarea
              value={newBio}
              onChange={(e) => setNewBio(e.target.value)}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="Write a bio about your business..."
            />
            <button
              onClick={handleBioChange}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Update Bio
            </button>
          </div>

          {/* Price list section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Price List</h2>
            {priceList.map((item, index) => (
              <div key={index} className="flex justify-between p-2 border-b border-gray-300">
                <span>{item.service}</span>
                <span>${(typeof item.price === 'number' ? item.price.toFixed(2) : '0.00')}</span>
              </div>
            ))}
            <div className="mt-4">
              <input
                type="text"
                value={newPriceService}
                onChange={(e) => setNewPriceService(e.target.value)}
                placeholder="Service name"
                className="p-2 border border-gray-300 rounded-lg mr-2"
              />
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value))}
                placeholder="Price"
                className="p-2 border border-gray-300 rounded-lg mr-2"
              />
              <button
                onClick={handleAddPrice}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Add Price
              </button>
            </div>
          </div>

          {/* Days of operation section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Days of Operation</h2>
            {daysOfOperation.map((item, index) => (
              <div key={index} className="flex justify-between p-2 border-b border-gray-300">
                <span>{item.day}</span>
                <span>{item.opening} - {item.closing}</span>
              </div>
            ))}
            <div className="mt-4">
              <input
                type="text"
                value={newDay}
                onChange={(e) => setNewDay(e.target.value)}
                placeholder="Day"
                className="p-2 border border-gray-300 rounded-lg mr-2"
              />
              <input
                type="text"
                value={newOpening}
                onChange={(e) => setNewOpening(e.target.value)}
                placeholder="Opening time"
                className="p-2 border border-gray-300 rounded-lg mr-2"
              />
              <input
                type="text"
                value={newClosing}
                onChange={(e) => setNewClosing(e.target.value)}
                placeholder="Closing time"
                className="p-2 border border-gray-300 rounded-lg mr-2"
              />
              <button
                onClick={handleAddDay}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Add Day
              </button>
            </div>
          </div>

          {/* Appointments section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">
              Appointments
              <button
                onClick={handleOpenAppointments}
                className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Show Appointments
              </button>
            </h2>
            {appointmentsOpen && (
              <div>
                <button
                  onClick={handleCloseAppointments}
                  className="mb-4 px-4 py-2 bg-red-500 text-white rounded-lg"
                >
                  Close
                </button>
                <ul>
                  {appointments.map((appointment) => (
                    <li key={appointment.id} className="mb-2 p-2 border border-gray-300 rounded-lg">
                      <p><strong>Customer Name:</strong> {appointment.customerName}</p>
                      <p><strong>Service:</strong> {appointment.service}</p>
                      <p><strong>Time:</strong> {appointment.time}</p>
                      <p><strong>Phone:</strong> {appointment.customerPhone}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
