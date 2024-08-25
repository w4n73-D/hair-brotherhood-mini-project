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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!businessData) {
    return <div>No business data found.</div>;
  }

  const { businessName, businessImageUrls = [], bio, priceList = [], daysOfOperation = [], location } = businessData;

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
            <p className="text-gray-700">{bio}</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Price List</h2>
            <ul className="list-disc list-inside">
              {priceList.map((price: PriceItem, index: number) => (
                <li key={index} className="mb-2">
                  <span className="font-semibold">{price.service}:</span> ${price.price}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Days of Operation</h2>
            <ul className="list-disc list-inside">
              {daysOfOperation.map((day: DayOfOperation, index: number) => (
                <li key={index} className="mb-2">
                  <span className="font-semibold">{day.day}:</span> {day.opening} - {day.closing}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-8">
            <button
              onClick={handleOpenChat}
              className="bg-orange-300 text-center rounded-xl h-[30px] w-[170px]"
            >
              Check Bookings
            </button>
          </div>
        </div>

        {/* Chat Box Section */}
        {chatOpen && (
          <div className="fixed bottom-0 right-0 w-96 bg-white p-4 rounded-t-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Chat</h3>
              <button onClick={handleCloseChat} className="text-gray-600">
                Close
              </button>
            </div>

            <div className="flex flex-col mb-4">
              {customers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => handleSelectCustomer(customer.id)}
                  className={`p-2 text-left ${
                    selectedCustomer === customer.id ? 'bg-gray-200' : 'bg-gray-100'
                  } rounded-lg mb-2`}
                >
                  {customer.name}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto h-64 border-t border-b mb-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2 my-1 rounded-lg ${
                    msg.senderId === user?.uid ? 'bg-blue-100 ml-auto' : 'bg-gray-100 mr-auto'
                  }`}
                >
                  {msg.content}
                </div>
              ))}
            </div>

            <div className="flex items-center">
              <input
                type="text"
                value={message}
                onChange={handleMessageChange}
                className="flex-1 border rounded-lg p-2 mr-2"
                placeholder="Type a message..."
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-500 text-white rounded-lg px-4 py-2"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
