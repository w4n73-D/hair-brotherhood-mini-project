'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleContinueClick = () => {
    if (email.trim() !== '') {
      setShowForm(true);
    } else {
      alert('Please enter a valid email address.');
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
            <h1 className="text-3xl font-bold mb-2">Join Hair-Brotherhood for Customers</h1>
            <h3 className="text-xl mb-6">
              Create an account to book and manage appointments
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
          </div>
        ) : (
          <div className="flex flex-col justify-center h-full">
            <h1 className="text-3xl font-bold mb-2">Create account</h1>
            <h3 className="text-xl mb-6">You're almost there! Create your new account for {email}</h3>

            <form>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
                  First name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="First name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
                  Last name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Last name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Password"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mobileNumber">
                  Mobile number *
                </label>
                <input
                  type="text"
                  id="mobileNumber"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Mobile number"
                />
              </div>
              <div className="mb-4">
                <input
                  type="checkbox"
                  id="terms"
                  className="mr-2"
                />
                <label className="text-gray-700 text-sm font-bold" htmlFor="terms">
                  I agree to the Privacy Policy, Terms of Use, and Terms of Service
                </label>
              </div>
              <div className="mb-4">
                <input
                  type="checkbox"
                  id="marketing"
                  className="mr-2"
                />
                <label className="text-gray-700 text-sm font-bold" htmlFor="marketing">
                  I agree to receive marketing notifications with offers and news
                </label>
              </div>
              <button
                type="submit"
                className="bg-zinc-900 text-white py-2 px-4 rounded-lg shadow w-full"
              >
                Continue
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="w-1/2 relative">
        <Image
          src="/storeprofile.jpg"
          alt="Right side image"
          layout="fill"
          objectFit="cover"
          quality={100}
        />
      </div>
    </div>
  );
}
