// src/app/header/page.tsx
'use client'

import Image from 'next/image';
import { FC } from 'react';

// Define the type for the props
interface HeaderNavProps {
  showLoginForm: boolean;
  onLoginClick: () => void;
}

// Apply the type to the component
const HeaderNav: FC<HeaderNavProps> = ({ showLoginForm, onLoginClick }) => {
  return (
    <div className="flex fixed top-0 w-full justify-between items-center px-10 bg-opacity-75 py-4 z-10">
      <div>
        <a href="#">
          <Image
            src="/logo/hairbrotherhoodLOGO.png"
            alt="Logo"
            width={300}
            height={100}
          />
        </a>
      </div>
      <div className="flex items-center hover:cursor-pointer">
        <ul className="flex space-x-8 text-white">
          {!showLoginForm && (
            <li onClick={onLoginClick}>Log In</li>
          )}
          <li><a href="#">Partners</a></li>
          <li><a href="#">Contact Us</a></li>
        </ul>
      </div>
    </div>
  );
};

export default HeaderNav;
