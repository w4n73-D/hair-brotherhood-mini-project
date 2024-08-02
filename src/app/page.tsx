'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase/config'; // Correct path for Firebase config
import HeaderNav from './header/page';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [isBusinessLogin, setIsBusinessLogin] = useState(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const toggleLoginForm = () => {
    setShowLoginForm(prev => !prev);
  };

  const toggleBusinessLogin = () => {
    setIsBusinessLogin(prev => !prev);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (isBusinessLogin) {
        router.push('/business-dashboard'); // Redirect to business dashboard
      } else {
        router.push('/home'); // Redirect to regular home page
      }
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(`Error: ${error.message}`);
      }
    }
  };

  const handleSignUpRedirect = () => {
    if (isBusinessLogin) {
      router.push('/business_Signup'); // Redirect to business signup page
    } else {
      router.push('/signup'); // Redirect to regular signup page
    }
  };

  return (
    <div className="relative min-h-screen flex">
      <HeaderNav showLoginForm={showLoginForm} onLoginClick={toggleLoginForm} />
      <div className="w-1/2 bg-gradient-to-r from-purple-200 to-blue-200 p-10 flex items-center justify-center">
        <div>
          <h1 className="text-4xl font-bold mb-4">Welcome To <br />Hair-Brotherhood</h1>
          <p className="mb-4">
            Our aim is to connect people to their favorite barbers or any barber around them with ease.
          </p>
          <p className="mb-4">
            Look up your preferred shop using the search bar below:
          </p>
          <div className="flex">
            <input
              type="text"
              placeholder="Enter name of preferred shop"
              className="border p-2 rounded-l"
              aria-label="Search for preferred shop"
            />
            <button className="bg-orange-500 text-white p-2 rounded-r">Search</button>
          </div>
        </div>
      </div>

      <div className={`w-1/2 relative ${showLoginForm ? 'backdrop-blur-md' : ''}`}>
        <Image
          src="/halfbackground.jpg"
          alt="Background Image"
          layout="fill"
          objectFit="cover"
          quality={100}
          className="h-full"
        />
        {showLoginForm && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className={`p-8 rounded-lg shadow-lg w-full max-w-md ${isBusinessLogin ? 'bg-gray-900 text-white' : 'bg-white bg-opacity-75'}`}>
              <div className="flex justify-between mb-4">
                <h2 className="text-2xl font-bold">Log In</h2>
                <label className="flex items-center">
                  <span className="mr-2">{isBusinessLogin ? 'Business' : 'User'}</span>
                  <input
                    type="checkbox"
                    className="toggle-checkbox"
                    checked={isBusinessLogin}
                    onChange={toggleBusinessLogin}
                    aria-label="Switch between business and user login"
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label className={`block ${isBusinessLogin ? 'text-white' : 'text-gray-700'} text-sm font-bold mb-2`} htmlFor="email">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${isBusinessLogin ? 'bg-gray-800 text-white' : 'text-gray-700'}`}
                    placeholder="Email"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className={`block ${isBusinessLogin ? 'text-white' : 'text-gray-700'} text-sm font-bold mb-2`} htmlFor="password">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline ${isBusinessLogin ? 'bg-gray-800 text-white' : 'text-gray-700'}`}
                    placeholder="Password"
                    required
                  />
                </div>
                {error && (
                  <div className="mb-4 text-red-500">
                    {error}
                  </div>
                )}
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Log In
                  </button>
                </div>
                <div className="text-left">
                  <p className={`text-sm ${isBusinessLogin ? 'text-white' : 'text-gray-700'}`}>
                    If you don't have an account,{' '}
                    <span
                      className="text-blue-500 hover:text-blue-700 font-bold underline cursor-pointer"
                      onClick={handleSignUpRedirect}
                    >
                      Sign Up
                    </span>
                  </p>   
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
