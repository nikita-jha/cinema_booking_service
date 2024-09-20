"use client";

import { useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

const CheckoutPage = () => {
  const searchParams = useSearchParams();
  const numTickets = searchParams.get('numTickets');
  const ages = searchParams.get('ages');
  const showTime = searchParams.get('showTime');
  const showDate = searchParams.get('showDate');
  const trailerPictureUrl = searchParams.get('trailerPictureUrl');
  const title = searchParams.get('title');
  const orderTotal = searchParams.get('orderTotal');
  const taxAmount = searchParams.get('taxAmount');
  const overallTotal = searchParams.get('overallTotal');

  const [promoCode, setPromoCode] = useState<string>('');
  const [useSavedCard, setUseSavedCard] = useState<boolean>(false);
  const [creditCardInfo, setCreditCardInfo] = useState({
    cardNumber: '',
    cvv: '',
    expirationDate: '',
    nameOnCard: '',
  });

  const handlePromoCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPromoCode(e.target.value);
  };

  const handleCreditCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCreditCardInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };

  const handleUseSavedCardChange = () => {
    setUseSavedCard(!useSavedCard);
  };

  const handleConfirmPayment = () => {
    // Handle payment confirmation logic here
    console.log('Payment confirmed');
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-center">Checkout</h1>
        <div className="flex">
          <div className="w-1/2 p-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <p className="mb-2">Movie Title: {title}</p>
            <p className="mb-2">Show Date: {showDate}</p>
            <p className="mb-2">Show Time: {showTime}</p>
            <p className="mb-2">Number of Tickets: {numTickets}</p>
            <p className="mb-2">Order Total: ${orderTotal}</p>
            <p className="mb-2">Tax: ${taxAmount}</p>
            <p className="mb-4">Overall Total: ${overallTotal}</p>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="promoCode">
                Promotion Code (Optional)
              </label>
              <input
                type="text"
                id="promoCode"
                value={promoCode}
                onChange={handlePromoCodeChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter promotion code"
              />
            </div>
          </div>
          <div className="w-1/2 p-4">
            <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="useSavedCard">
                <input
                  type="checkbox"
                  id="useSavedCard"
                  checked={useSavedCard}
                  onChange={handleUseSavedCardChange}
                  className="mr-2 leading-tight"
                />
                Use Saved Card
              </label>
            </div>
            {!useSavedCard && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cardNumber">
                  Card Number
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={creditCardInfo.cardNumber}
                  onChange={handleCreditCardChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter card number"
                />
                <label className="block text-gray-700 text-sm font-bold mb-2 mt-4" htmlFor="cvv">
                  CVV
                </label>
                <input
                  type="text"
                  id="cvv"
                  name="cvv"
                  value={creditCardInfo.cvv}
                  onChange={handleCreditCardChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter CVV"
                />
                <label className="block text-gray-700 text-sm font-bold mb-2 mt-4" htmlFor="expirationDate">
                  Expiration Date
                </label>
                <input
                  type="text"
                  id="expirationDate"
                  name="expirationDate"
                  value={creditCardInfo.expirationDate}
                  onChange={handleCreditCardChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter expiration date"
                />
                <label className="block text-gray-700 text-sm font-bold mb-2 mt-4" htmlFor="nameOnCard">
                  Name on Card
                </label>
                <input
                  type="text"
                  id="nameOnCard"
                  name="nameOnCard"
                  value={creditCardInfo.nameOnCard}
                  onChange={handleCreditCardChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter name on card"
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between w-full max-w-4xl mx-auto mt-4">
          <Link href="/">
            <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
              Cancel
            </button>
          </Link>
          <Link
            href={{
              pathname: '/confirmation',
              query: {
                title,
              },
            }}
          >
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Confirm Payment
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;