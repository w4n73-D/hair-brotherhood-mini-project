'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db, storage } from '../firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';

export default function BusinessSignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [businessName, setBusinessName] = useState<string>('');
  const [businessImages, setBusinessImages] = useState<File[]>([]);
  const [location, setLocation] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [priceList, setPriceList] = useState<{ service: string; price: string }[]>([{ service: '', price: '' }]);
  const [daysOfOperation, setDaysOfOperation] = useState<{ day: string; opening: string; closing: string }[]>([{ day: '', opening: '', closing: '' }]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<number>(1); // Add step state

  const handlePriceChange = (index: number, field: 'service' | 'price', value: string) => {
    const updatedPrices = [...priceList];
    updatedPrices[index][field] = value;
    setPriceList(updatedPrices);
  };

  const handleAddPrice = () => {
    setPriceList([...priceList, { service: '', price: '' }]);
  };

  const handleDayChange = (index: number, field: 'day' | 'opening' | 'closing', value: string) => {
    const updatedDays = [...daysOfOperation];
    updatedDays[index][field] = value;
    setDaysOfOperation(updatedDays);
  };

  const handleAddDay = () => {
    setDaysOfOperation([...daysOfOperation, { day: '', opening: '', closing: '' }]);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setBusinessImages(files);
      if (files.length > 0) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageUrl(reader.result as string);
        };
        reader.readAsDataURL(files[0]);
      }
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);
  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value);
  const handleMobileNumberChange = (e: ChangeEvent<HTMLInputElement>) => setMobileNumber(e.target.value.replace(/\D/g, ''));
  const handleFirstNameChange = (e: ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value);
  const handleLastNameChange = (e: ChangeEvent<HTMLInputElement>) => setLastName(e.target.value);
  const handleBusinessNameChange = (e: ChangeEvent<HTMLInputElement>) => setBusinessName(e.target.value);

  const handleContinueClick = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() !== '' && emailRegex.test(email)) {
      setShowForm(true);
    } else {
      setError('Please enter a valid email address.');
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const imageUrls: string[] = [];
      for (const image of businessImages) {
        const imageRef = ref(storage, `business-images/${user.uid}/${image.name}`);
        await uploadBytes(imageRef, image);
        const url = await getDownloadURL(imageRef);
        imageUrls.push(url);
      }

      await setDoc(doc(db, 'businesses', user.uid), {
        firstName,
        lastName,
        email: user.email,
        phoneNumber: `${countryCode}${mobileNumber}`,
        businessName,
        businessImageUrls: imageUrls,
        location,
        bio,
        priceList,
        daysOfOperation,
      });

      router.push('/business-dashboard'); 
    } catch (error: any) {
      setError(`Error signing up: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-1/2 flex flex-col p-8 bg-white">
        <button
          className="flex items-center text-blue-500 mb-4"
          onClick={() => router.back()}
        >
          <Image src="/logo/backbtn.png" alt="Back" width={35} height={35} />
        </button>

        {!showForm ? (
          <div className="flex flex-col justify-center h-full">
            <h1 className="text-3xl font-bold mb-2">Join Hair-Brotherhood for Business</h1>
            <h3 className="text-xl mb-6">
              Create an account to manage your business profile and appointments
            </h3>

            <button className="bg-neutral-200 w-full text-center py-2 mb-4 rounded-lg shadow hover:bg-neutral-300 transition-colors">
              <span className="inline-flex items-center">
                <Image src="/logo/facebook.png" alt="Facebook Icon" width={24} height={24} />
                <span className="ml-2">Continue with Facebook</span>
              </span>
            </button>

            <button className="bg-neutral-200 w-full text-center py-2 mb-4 rounded-lg shadow hover:bg-neutral-300 transition-colors">
              <span className="inline-flex items-center">
                <Image src="/logo/google.png" alt="Google Icon" width={24} height={24} />
                <span className="ml-2">Continue with Google</span>
              </span>
            </button>

            <div className="w-full text-center my-4">OR</div>

            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-4 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Email Address"
            />

            <button
              className="bg-zinc-900 w-full text-white text-center py-2 rounded-lg shadow hover:bg-orange-500 transition-colors"
              onClick={handleContinueClick}
            >
              Continue
            </button>

            {error && <p className="text-red-500 mt-4">{error}</p>}
          </div>
        ) : (
          <div className="flex flex-col justify-center h-full">
            {step === 1 ? (
              <>
                <h1 className="text-3xl font-bold mb-2">Create account</h1>
                <h3 className="text-xl mb-6">You&apos;re almost there! Create your new account for {email}</h3>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
                      First name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={handleFirstNameChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="First Name"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
                      Last name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={handleLastNameChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Last Name"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                      Password *
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={handlePasswordChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Password"
                      required
                    />
                    <button
                      type="button"
                      className="text-blue-500 mt-2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 'Hide' : 'Show'} Password
                    </button>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                      Confirm Password *
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Confirm Password"
                      required
                    />
                  </div>

                  <div className="flex items-center mb-4">
                    <input
                      type="text"
                      value={mobileNumber}
                      onChange={handleMobileNumberChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Mobile Number"
                    />
                    <input
                      type="text"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ml-2"
                      placeholder="Country Code"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="businessName">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      id="businessName"
                      value={businessName}
                      onChange={handleBusinessNameChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="Business Name"
                      required
                    />
                  </div>

                  <button
                    type="button"
                    className="bg-gray-500 text-white py-2 px-4 rounded mr-4"
                    onClick={handlePrevStep}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="bg-blue-500 text-white py-2 px-4 rounded"
                    onClick={handleNextStep}
                  >
                    Next
                  </button>
                </form>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold mb-2">Business Details</h1>
                <h3 className="text-xl mb-6">Please provide the additional details for your business</h3>

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
                      placeholder="Describe your business"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="businessImages">
                      Upload Business Images
                    </label>
                    <input
                      type="file"
                      id="businessImages"
                      multiple
                      onChange={handleFileChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                    {imageUrl && (
                      <div className="mt-4">
                        <Image src={imageUrl} alt="Preview" width={100} height={100} />
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Price List</h3>
                    {priceList.map((price, index) => (
                      <div key={index} className="flex mb-4">
                        <input
                          type="text"
                          value={price.service}
                          onChange={(e) => handlePriceChange(index, 'service', e.target.value)}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                          placeholder="Service"
                        />
                        <input
                          type="text"
                          value={price.price}
                          onChange={(e) => handlePriceChange(index, 'price', e.target.value)}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          placeholder="Price"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      className="bg-blue-500 text-white py-2 px-4 rounded"
                      onClick={handleAddPrice}
                    >
                      Add Price
                    </button>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Days of Operation</h3>
                    {daysOfOperation.map((day, index) => (
                      <div key={index} className="flex mb-4">
                        <input
                          type="text"
                          value={day.day}
                          onChange={(e) => handleDayChange(index, 'day', e.target.value)}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                          placeholder="Day"
                        />
                        <input
                          type="text"
                          value={day.opening}
                          onChange={(e) => handleDayChange(index, 'opening', e.target.value)}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                          placeholder="Opening Time"
                        />
                        <input
                          type="text"
                          value={day.closing}
                          onChange={(e) => handleDayChange(index, 'closing', e.target.value)}
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          placeholder="Closing Time"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      className="bg-blue-500 text-white py-2 px-4 rounded"
                      onClick={handleAddDay}
                    >
                      Add Day
                    </button>
                  </div>

                  <button
                    type="button"
                    className="bg-gray-500 text-white py-2 px-4 rounded mr-4"
                    onClick={handlePrevStep}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white py-2 px-4 rounded"
                  >
                    Submit
                  </button>
                </form>
              </>
            )}
          </div>
        )}
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
