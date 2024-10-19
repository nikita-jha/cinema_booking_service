import React from 'react';
import Link from 'next/link';

interface NavbarProps {
  user: any | null;
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-2xl font-bold">
          Cinema Booking
        </Link>
        <div>
          <Link href="/" className="text-white mr-4">
            Home
          </Link>
          {user ? (
            <Link href="/editprofile" className="text-white">
              Account
            </Link>
          ) : (
            <Link href="/login" className="text-white">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
