"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { auth, db } from '../firebase/config'; // Ensure the path is correct
import { doc, getDoc, collection, query, where, orderBy, onSnapshot, addDoc } from 'firebase/firestore';

const BusinessHeader = ({ show }: { show: boolean }) => {
  const [isSearchSticky, setIsSearchSticky] = useState(false);
  const [search, setSearch] = useState('');
  const [userDetails, setUserDetails] = useState<{ firstName: string; lastName: string } | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [businessName, setBusinessName] = useState<string>(''); // Initialize state for businessName
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);
  const [customers, setCustomers] = useState<{ id: string, name: string }[]>([]); // List of customers who sent messages
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null); // ID of the selected customer
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

  useEffect(() => {
    const fetchCustomerMessages = () => {
      const user = auth.currentUser;
      if (user && user.uid) {
        const messagesQuery = query(
          collection(db, 'messages'),
          where('receiverId', '==', user.uid),
          orderBy('timestamp')
        );

        const unsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
          const fetchedMessages = snapshot.docs.map(doc => doc.data());
          const customerIds = Array.from(new Set(fetchedMessages.map((msg: any) => msg.senderId)));

          const customerList: { id: string, name: string }[] = [];
          for (const customerId of customerIds) {
            const customerDocRef = doc(db, 'customers', customerId); // Adjust collection name if needed
            const customerDocSnap = await getDoc(customerDocRef);
            if (customerDocSnap.exists()) {
              const name = customerDocSnap.data().name; // Adjust field name if needed
              customerList.push({ id: customerId, name });
            }
          }

          setCustomers(customerList);
        });

        return () => unsubscribe();
      }
    };

    fetchCustomerMessages();
  }, []);

  useEffect(() => {
    if (selectedCustomer && auth.currentUser) {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('receiverId', '==', auth.currentUser.uid),
        where('senderId', '==', selectedCustomer),
        orderBy('timestamp')
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const fetchedMessages = snapshot.docs.map(doc => doc.data());
        setMessages(fetchedMessages);
      });

      return () => unsubscribe();
    }
  }, [selectedCustomer]);

  const handleSendMessage = async () => {
    if (message.trim() && auth.currentUser && selectedCustomer) {
      try {
        await addDoc(collection(db, 'messages'), {
          senderId: auth.currentUser.uid,
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

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomer(customerId);
    setChatOpen(true);
  };

  const handleMessagingIconClick = () => {
    setChatOpen(true);
  };

  const handleCloseChat = () => {
    setChatOpen(false);
    setSelectedCustomer(null);
  };

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
        <span
          className="cursor-pointer"
          onClick={handleMessagingIconClick}
        >
          ✉️
        </span>
      </div>

      {/* Chat Window */}
      {chatOpen && (
        <div className="fixed bottom-0 right-0 m-4 p-4 bg-white shadow-lg rounded-lg w-80">
          <div className="flex flex-col mb-2">
            <div className="flex justify-between items-center mb-2">
              {selectedCustomer ? (
                <h3 className="font-bold">{customers.find(c => c.id === selectedCustomer)?.name || 'Unknown Customer'}</h3>
              ) : (
                <h3 className="font-bold">Select a Customer</h3>
              )}
              <button onClick={handleCloseChat} className="text-red-500">✖️</button>
            </div>
            {!selectedCustomer && (
              <ul className="list-none p-0">
                {customers.map(customer => (
                  <li key={customer.id} className="p-2 cursor-pointer hover:bg-gray-200" onClick={() => handleSelectCustomer(customer.id)}>
                    {customer.name}
                  </li>
                ))}
              </ul>
            )}
            {selectedCustomer && (
              <>
                <div className="overflow-y-auto h-64">
                  {messages.map((msg, index) => (
                    <div key={index} className={`mb-2 ${msg.senderId === auth.currentUser?.uid ? 'text-right' : 'text-left'}`}>
                      <p className={`p-2 rounded ${msg.senderId === auth.currentUser?.uid ? 'bg-blue-200' : 'bg-gray-200'}`}>
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
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Type your message..."
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-blue-500 text-white py-2 px-4 rounded ml-2"
                    style={{ width: 'auto' }}
                  >
                    Send
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessHeader;
