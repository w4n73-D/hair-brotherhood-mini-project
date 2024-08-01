'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../firebase/config';
import Image from 'next/image';

export default function BusinessDetailsPage() {
  const router = useRouter();
  const [location, setLocation] = useState<string>('');
  const [priceList, setPriceList] = useState<{ service: string; price: string }[]>([]);
  const [daysOfOperation, setDaysOfOperation] = useState<{ day: string; opening: string; closing: string }[]>([]);
  const [bio, setBio] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleDayChange = (index: number, field: 'day' | 'opening' | 'closing', value: string) => {
    const newDays = [...daysOfOperation];
    newDays[index] = { ...newDays[index], [field]: value };
    setDaysOfOperation(newDays);
  };

  const handleAddDay = () => {
    if (daysOfOperation.length < 7) {
      setDaysOfOperation([...daysOfOperation, { day: '', opening: '', closing: '' }]);
    }
  };

  const handleAddPrice = () => {
    setPriceList([...priceList, { service: '', price: '' }]);
  };

  const handlePriceChange = (index: number, field: 'service' | 'price', value: string) => {
    const newPriceList = [...priceList];
    newPriceList[index] = { ...newPriceList[index], [field]: value };
    setPriceList(newPriceList);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (user) {
        let imageUrl = '';
        if (file) {
          const storageRef = ref(storage, `businesses/${user.uid}/${file.name}`);
          await uploadBytes(storageRef, file);
          imageUrl = await getDownloadURL(storageRef);
        }

        await setDoc(doc(db, "businesses", user.uid), {
          location,
          bio,
          priceList,
          daysOfOperation,
          imageUrl
        });
        router.push('/business-dashboard'); // Redirect to the business dashboard after submission
      }
    } catch (error: any) {
      setError(`Error updating details: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-1/2 flex flex-col p-8 bg-white">
        <button
          className="flex items-center text-blue-500 mb-4"
          onClick={() => router.push('/signup')} // Change this to direct to the specific sign-up page
        >
          <Image src="/logo/backbtn.png" alt="Back" width={35} height={35} />
        </button>

        <h1 className="text-3xl font-bold mb-2">Business Details</h1>
        <h3 className="text-xl mb-6">Provide more details about your business</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
              Location *
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Location"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bio">
              Bio *
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Tell us about your business"
              rows={4}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Prices for Services *
            </label>
            {priceList.map((price, index) => (
              <div key={index} className="flex mb-2 space-x-2">
                <input
                  type="text"
                  value={price.service}
                  onChange={(e) => handlePriceChange(index, 'service', e.target.value)}
                  className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Service"
                  required
                />
                <input
                  type="text"
                  value={price.price}
                  onChange={(e) => handlePriceChange(index, 'price', e.target.value)}
                  className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Price"
                  required
                />
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddPrice}
              className="bg-zinc-900 text-white py-2 px-4 rounded-lg shadow hover:bg-orange-500 transition-colors"
            >
              Add Service
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Days of Operation *
            </label>
            <div className="space-y-4 mb-4">
              {daysOfOperation.map((day, index) => (
                <div key={index} className="flex items-center space-x-4 mb-2">
                  <input
                    type="text"
                    value={day.day}
                    onChange={(e) => handleDayChange(index, 'day', e.target.value)}
                    className="shadow appearance-none border rounded w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder={index === 0 ? "Monday" : index === 1 ? "Tuesday" : index === 2 ? "Wednesday" : index === 3 ? "Thursday" : index === 4 ? "Friday" : index === 5 ? "Saturday" : "Sunday"}
                    required
                  />
                  <input
                    type="text"
                    value={day.opening}
                    onChange={(e) => handleDayChange(index, 'opening', e.target.value)}
                    className="shadow appearance-none border rounded w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Opening Hours"
                    required
                  />
                  <input
                    type="text"
                    value={day.closing}
                    onChange={(e) => handleDayChange(index, 'closing', e.target.value)}
                    className="shadow appearance-none border rounded w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Closing Hours"
                    required
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddDay}
              className="bg-zinc-900 text-white py-2 px-4 rounded-lg shadow hover:bg-orange-500 transition-colors"
            >
              Add Day
            </button>
          </div>

          <button
            type="submit"
            className="bg-zinc-900 w-full text-white text-center py-2 rounded-lg shadow hover:bg-orange-500 transition-colors"
          >
            Save and Continue
          </button>

          {error && <p className="text-red-500 mt-4">{error}</p>}
        </form>
      </div>

      <div className="w-1/2 relative">
        <Image
          src="/signupbgwallpaper.jpg"
          alt="signup-bgwallpaper"
          layout="fill"
          objectFit="cover"
          quality={100}
        />
      </div>
    </div>
  );
}
