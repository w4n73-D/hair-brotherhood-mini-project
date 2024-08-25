"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import Image from 'next/image';
import BusinessHeader from '../header/business_header';

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
}

export default function DashboardPage() {
  const [businessData, setBusinessData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);
  const [user, setUser] = useState<{ uid: string } | null>(null);
  const [customerNames, setCustomerNames] = useState<{ [key: string]: string }>({});
  const [customers, setCustomers] = useState<{ id: string, name: string }[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
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

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          setUser({ uid: user.uid });
          const docRef = doc(db, 'businesses', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setBusinessData(docSnap.data());
            setNewBio(docSnap.data().bio || '');
            setPriceList(docSnap.data().priceList || []);
            setDaysOfOperation(docSnap.data().daysOfOperation || []);
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

  useEffect(() => {
    if (user && user.uid) {
      const customersQuery = query(
        collection(db, 'users'),
        where('isBusiness', '==', false) // Ensure this field correctly identifies non-business users
      );

      const unsubscribe = onSnapshot(customersQuery, async (snapshot) => {
        const customerList: { id: string, name: string }[] = [];

        snapshot.forEach(doc => {
          const data = doc.data();
          customerList.push({ id: doc.id, name: data.name });
        });

        setCustomers(customerList);
      });

      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCustomer && user && user.uid) {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('receiverId', 'in', [user.uid, selectedCustomer]),
        where('senderId', 'in', [user.uid, selectedCustomer]),
        orderBy('timestamp')
      );
  
      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const fetchedMessages = snapshot.docs.map(doc => doc.data());
        setMessages(fetchedMessages);
      });
  
      return () => unsubscribe();
    }
  }, [selectedCustomer, user]);

  useEffect(() => {
    if (user && user.uid) {
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('barberId', '==', user.uid),
        orderBy('time')
      );

      const unsubscribe = onSnapshot(appointmentsQuery, (snapshot) => {
        const fetchedAppointments = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Appointment[];
        setAppointments(fetchedAppointments);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleSendMessage = async () => {
    if (message.trim() && user && selectedCustomer) {
      try {
        await addDoc(collection(db, 'messages'), {
          senderId: user.uid,
          receiverId: selectedCustomer,
          content: message,
          timestamp: new Date(),
        });
        setMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleOpenChat = () => {
    setChatOpen(true);
  };

  const handleCloseChat = () => {
    setChatOpen(false);
    setSelectedCustomer(null);
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomer(customerId);
    setChatOpen(true);
  };

  const handleOpenAppointments = () => {
    setAppointmentsOpen(true);
  };

  const handleCloseAppointments = () => {
    setAppointmentsOpen(false);
  };

  const handleAddPrice = async () => {
    if (newPriceService.trim() && newPrice !== '' && typeof newPrice === 'number') {
      try {
        const updatedPriceList = [...priceList, { service: newPriceService, price: newPrice }];
        setPriceList(updatedPriceList);
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

  const handleAddDay = async () => {
    if (newDay.trim() && newOpening.trim() && newClosing.trim()) {
      try {
        const updatedDays = [...daysOfOperation, { day: newDay, opening: newOpening, closing: newClosing }];
        setDaysOfOperation(updatedDays);
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

  const handleBioChange = async () => {
    if (newBio.trim()) {
      try {
        if (user) {
          await updateDoc(doc(db, 'businesses', user.uid), { bio: newBio });
        }
      } catch (error) {
        console.error('Error updating bio:', error);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!businessData) {
    return <div>No business data found.</div>;
  }

  const { businessName, businessImageUrls = [], location } = businessData;

  return (
    <div className="min-h-screen bg-gray-100">
      <BusinessHeader show={true} />

      <div className="pt-16 p-8">

        <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <h1 className="text-4xl font-bold mr-4">{businessName}</h1>
            {location && (
              <p className="text-xl text-gray-600 font-bold">At: {location}</p>
            )}
          </div>

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
                placeholder="Service"
                value={newPriceService}
                onChange={(e) => setNewPriceService(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg mr-2"
              />
              <input
                type="number"
                placeholder="Price"
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value))}
                className="p-2 border border-gray-300 rounded-lg mr-2"
              />
              <button
                onClick={handleAddPrice}
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
              >
                Add Price
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Days of Operation</h2>
            <div>
              {daysOfOperation.map((day, index) => (
                <div key={index} className="flex justify-between p-2 border-b border-gray-300">
                  <span>{day.day}</span>
                  <span>{day.opening} - {day.closing}</span>
                </div>
              ))}
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Day"
                  value={newDay}
                  onChange={(e) => setNewDay(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg mr-2"
                />
                <input
                  type="text"
                  placeholder="Opening Time"
                  value={newOpening}
                  onChange={(e) => setNewOpening(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg mr-2"
                />
                <input
                  type="text"
                  placeholder="Closing Time"
                  value={newClosing}
                  onChange={(e) => setNewClosing(e.target.value)}
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
          </div>

          <div className="flex justify-between">
            <button
              onClick={handleOpenChat}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg"
            >
              Chat with Customers
            </button>
            <button
              onClick={handleOpenAppointments}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg"
            >
              View Appointments
            </button>
          </div>

          {chatOpen && (
            <div className="fixed top-0 right-0 w-full max-w-md bg-white shadow-lg rounded-lg p-6">
              <button onClick={handleCloseChat} className="absolute top-2 right-2 text-gray-500">&times;</button>
              <h3 className="text-xl font-bold mb-4">Chat</h3>
              <div className="mb-4">
                <select
                  onChange={(e) => handleSelectCustomer(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4 overflow-y-auto h-64">
                {messages.map((msg, index) => (
                  <div key={index} className={`mb-2 ${msg.senderId === user?.uid ? 'text-right' : 'text-left'}`}>
                    <p className={`p-2 rounded-lg ${msg.senderId === user?.uid ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
                      {msg.content}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  value={message}
                  onChange={handleMessageChange}
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={handleSendMessage}
                  className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {appointmentsOpen && (
            <div className="fixed top-0 right-0 w-full max-w-md bg-white shadow-lg rounded-lg p-6">
              <button onClick={handleCloseAppointments} className="absolute top-2 right-2 text-gray-500">&times;</button>
              <h3 className="text-xl font-bold mb-4">Appointments</h3>
              <div className="overflow-y-auto h-64">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="mb-4 p-4 border border-gray-300 rounded-lg">
                    <h4 className="text-lg font-semibold">{appointment.customerName}</h4>
                    <p>{appointment.service}</p>
                    <p>{appointment.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
