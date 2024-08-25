"use client";

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config'; // Adjust the path as needed
import Image from 'next/image';
import Header from '@/app/header/header'; // Adjust the path as needed'

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
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);
  const [user, setUser] = useState<{ uid: string }>({ uid: 'testUserId' }); // Replace with actual user state
  const router = useRouter();
  const shopId = params.id;

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        if (!shopId) {
          throw new Error('Shop ID is missing');
        }
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

  useEffect(() => {
    if (shopId && user && user.uid) {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('receiverId', 'in', [shopId, user.uid]),
        where('senderId', 'in', [shopId, user.uid]),
        orderBy('timestamp')
      );
  
      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const fetchedMessages = snapshot.docs.map(doc => doc.data());
        setMessages(fetchedMessages);
      });
  
      return () => unsubscribe();
    }
  }, [shopId, user]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      try {
        await addDoc(collection(db, 'messages'), {
          senderId: user.uid,
          receiverId: shopId,
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
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!shop) {
    return <div>No shop data found.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-8">
      <Header show={true} /> {/* Adjust header visibility if needed */}

      {/* Main Container */}
      <div className="w-full max-w-screen-lg mx-auto mt-[60px]">

        {/* Shop Name and Contact */}
        <div className="text-center mb-[10px] flex space-x-6">
          <h1 className="text-3xl font-bold mb-2">{shop.businessName}</h1>
          <p className="text-lg mb-2">Location: {shop.location}</p>
          <p className="text-lg mb-2">Phone: {shop.phoneNumber}</p>
          <p className="text-lg mb-2">Email: {shop.email}</p>
        </div>

        {/* Gallery */}
        <div className="w-full flex flex-col mb-8">
          <div className="w-full flex mb-4">
            {/* Main large image */}
            <div className="w-full max-w-[700px] flex-1 mr-4">
              <Image src={shop.businessImageUrls[0]} alt={shop.businessName} width={600} height={450} className="w-full h-auto rounded-xl" />
            </div>
            {/* Two smaller images */}
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

        {/* Days of Operation */}
        <div className="w-full mb-8">
          <h2 className="text-2xl font-bold mb-4">Days of Operation</h2>
          {shop.daysOfOperation.length > 0 ? (
            <div>
              {shop.daysOfOperation.map((day, index) => (
                <div key={index} className="mb-4">
                  <p className="text-lg font-bold">{day.day}</p>
                  <p>{day.opening} - {day.closing}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No days of operation available.</p>
          )}
        </div>

        {/* Price List */}
        <div className="w-full mb-8">
          <h2 className="text-2xl font-bold mb-4">Price List</h2>
          {shop.priceList.length > 0 ? (
            <div>
              {shop.priceList.map((item, index) => (
                <div key={index} className="mb-4">
                  <p className="text-lg font-bold">{item.service}</p>
                  <p>${item.price}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No price list available.</p>
          )}
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
          <div className="flex flex-col mb-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">{shop.firstName} {shop.lastName}</h3>
              <button onClick={handleCloseChat} className="text-red-500">✖️</button>
            </div>
          </div>
          <div className="overflow-y-auto h-64">
            {messages.map((msg, index) => (
              <div key={index} className={`mb-2 ${msg.senderId === user.uid ? 'text-right' : 'text-left'}`}>
                <p className={`p-2 rounded ${msg.senderId === user.uid ? 'bg-blue-200' : 'bg-gray-200'}`}>
                  {msg.content}
                </p>
                <span className="text-sm text-gray-500">
                  {new Date(msg.timestamp.toDate()).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
          <div className="flex mt-2">
            <input
              type="text"
              value={message}
              onChange={handleMessageChange}
              className="w-full p-2 border border-gray-300 rounded-tl-lg rounded-bl-lg"
              placeholder="Type your message..."
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-500 text-white p-2 rounded-tr-lg rounded-br-lg ml-2"
              style={{ height: '2.5rem', width: '3rem' }} // Resize button
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
