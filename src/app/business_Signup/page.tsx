'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
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
  const [error, setError] = useState<string>(''); // Add error state

  // Handlers for input changes
  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);
  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value);
  const handleMobileNumberChange = (e: ChangeEvent<HTMLInputElement>) => setMobileNumber(e.target.value.replace(/\D/g, ''));
  const handleFirstNameChange = (e: ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value);
  const handleLastNameChange = (e: ChangeEvent<HTMLInputElement>) => setLastName(e.target.value);

  // Validate email and show form
  const handleContinueClick = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() !== '' && emailRegex.test(email)) {
      setShowForm(true);
    } else {
      setError('Please enter a valid email address.'); // Set error message
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.'); // Set error message
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "businesses", user.uid), {
        firstName,
        lastName,
        email: user.email,
        phoneNumber: `${countryCode}${mobileNumber}`,
      });
      router.push('/home'); // Redirect after successful sign-up
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Please try signing in or use a different email.'); // Set error message
      } else {
        setError(`Error signing up: ${error.message}`); // Set error message
      }
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

            {error && <p className="text-red-500 mt-4">{error}</p>} {/* Display error messages */}
          </div>
        ) : (
          <div className="flex flex-col justify-center h-full">
            <h1 className="text-3xl font-bold mb-2">Create account</h1>
            <h3 className="text-xl mb-6">You're almost there! Create your new account for {email}</h3>

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
                  placeholder="First name"
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
                  placeholder="Last name"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Password"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="countryCode">
                  Country Code *
                </label>
                <div className="flex">
                  <select
                    id="countryCode"
                    className="shadow appearance-none border rounded-l w-1/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    required
                  >
                    <option value="">Select Code</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    {/* Add other country codes here */}
                  </select>
                  <input
                    type="text"
                    value={mobileNumber}
                    onChange={handleMobileNumberChange}
                    className="shadow appearance-none border rounded-r w-3/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Mobile Number"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-zinc-900 w-full text-white text-center py-2 rounded-lg shadow hover:bg-orange-500 transition-colors"
              >
                Create Account
              </button>
            </form>

            {error && <p className="text-red-500 mt-4">{error}</p>} {/* Display error messages */}
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
