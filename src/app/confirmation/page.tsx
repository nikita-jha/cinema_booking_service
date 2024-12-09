"use client";

import { useSearchParams } from 'next/navigation';
import React from 'react';
import Navbar from '../../components/Navbar';
import Link from 'next/link';
import useRequireAuth from '../../components/RequireAuth';

const generateOrderNumber = () => {
  useRequireAuth();
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let orderNumber = '';
  for (let i = 0; i < 12; i++) {
    orderNumber += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return orderNumber;
};

const ConfirmationPage = () => {
  const searchParams = useSearchParams();
  const title = searchParams.get('title');
  const orderNumber = generateOrderNumber();

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4 flex justify-center items-center h-screen">
        <div className="bg-white shadow-md rounded p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-green-500 mb-4">Order Placed Successfully</h1>
          <p className="mb-4" style={{ color: 'black' }}>Thank you for ordering! Please enjoy {title}.</p>
          <p className="mb-4" style={{ color: 'black' }}>Check your email for your order receipt. Your confirmation order number is:</p>
          <p className="font-mono text-lg mb-8" style={{ color: 'black' }}>{orderNumber}</p>
          <Link href="/">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Keep Browsing
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;