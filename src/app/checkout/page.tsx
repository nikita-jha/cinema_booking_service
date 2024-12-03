"use client";

import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Link from 'next/link';
import useRequireAuth from '../../components/RequireAuth';
import { getSavedCardsForUser } from "../../application/firebase/firestore";
import { onAuthStateChanged } from "firebase/auth"; // Import for auth state monitoring
import { auth } from "../../application/firebase/config"; // Firebase Auth instance


const CheckoutPage = () => {
  useRequireAuth();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState<string | null>(null); // Store user ID
  const [savedCards, setSavedCards] = useState<any[]>([]); // This will store the `cardData` array
  const [loadingCards, setLoadingCards] = useState<boolean>(true); // Track loading state
  const numTickets = searchParams.get('numTickets');
  const ages = searchParams.get('ages');
  const showTime = searchParams.get('showTime');
  const showDate = searchParams.get('showDate');
  const trailerPictureUrl = searchParams.get('trailerPictureUrl');
  const title = searchParams.get('title');
  const initialOrderTotal = parseFloat(searchParams.get('orderTotal') || '0');
  const initialTaxAmount = parseFloat(searchParams.get('taxAmount') || '0');
  const initialOverallTotal = parseFloat(searchParams.get('overallTotal') || '0');

  const [promoCode, setPromoCode] = useState<string>('');
  const [useSavedCard, setUseSavedCard] = useState<boolean>(false);
  const [creditCardInfo, setCreditCardInfo] = useState({
    cardNumber: '',
    cvv: '',
    expirationDate: '',
    billingAddress: '', // Changed "Name on Card" to "Billing Address"
  });
  const [orderTotal, setOrderTotal] = useState<number>(initialOrderTotal);
  const [taxAmount, setTaxAmount] = useState<number>(initialTaxAmount);
  const [overallTotal, setOverallTotal] = useState<number>(initialOverallTotal);
  const [isDiscountApplied, setIsDiscountApplied] = useState<boolean>(false);

  // Monitor user authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid); // Set the logged-in user's ID
      } else {
        setUserId(null); // Clear user ID if not logged in
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

    // Fetch saved card data when userId is available
  useEffect(() => {
    const fetchCardData = async () => {
      if (userId) {
        try {
          setLoadingCards(true);
          const cards = await getSavedCardsForUser(userId);
          setSavedCards(cards);
        } catch (error) {
          console.error("Error fetching card data:", error);
        } finally {
          setLoadingCards(false);
        }
      }
    };

    fetchCardData();
  }, [userId]); // Run this effect when `userId` changes

  // Fetch saved card data when userId is available
  useEffect(() => {
    const fetchCardData = async () => {
      if (userId) {
        try {
          setLoadingCards(true);
          const cards = await getSavedCardsForUser(userId);
          setSavedCards(cards);
        } catch (error) {
          console.error("Error fetching card data:", error);
        } finally {
          setLoadingCards(false);
        }
      }
    };

    fetchCardData();
  }, [userId]); // Run this effect when `userId` changes
  
  

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

  const handleUseSavedCardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCardIndex = e.target.value; // Index of the selected card
    if (savedCards[selectedCardIndex]) {
      const selectedCard = savedCards[selectedCardIndex];
      setCreditCardInfo({
        cardNumber: selectedCard.cardNumber,
        cvv: selectedCard.cvv,
        expirationDate: selectedCard.expirationDate,
        billingAddress: selectedCard.billingAddress,
      });
    }
    setUseSavedCard(true);
  };

  const handleApplyPromoCode = () => {
    if (promoCode === 'DISCOUNT') {
      const discountedOrderTotal = initialOrderTotal * 0.9;
      const newTaxAmount = discountedOrderTotal * 0.07;
      const newOverallTotal = discountedOrderTotal + newTaxAmount;
      setOrderTotal(discountedOrderTotal);
      setTaxAmount(newTaxAmount);
      setOverallTotal(newOverallTotal);
      setIsDiscountApplied(true);
    } else {
      setOrderTotal(initialOrderTotal);
      setTaxAmount(initialTaxAmount);
      setOverallTotal(initialOverallTotal);
      setIsDiscountApplied(false);
    }
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
            <div className="mb-4 flex items-center">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="promoCode">
                Promotion Code (Optional)
              </label>
              <input
                type="text"
                id="promoCode"
                value={promoCode}
                onChange={handlePromoCodeChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ml-2"
                placeholder="Enter promotion code"
              />
              <button
                onClick={handleApplyPromoCode}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
              >
                Apply
              </button>
            </div>
            <p className="mb-2">
              Order Total: ${orderTotal.toFixed(2)}{' '}
              {isDiscountApplied && <span className="text-red-500">(10% Off)</span>}
            </p>
            <p className="mb-2">Tax: ${taxAmount.toFixed(2)}</p>
            <p className="mb-4">Overall Total: ${overallTotal.toFixed(2)}</p>
          </div>
          <div className="w-1/2 p-4">
            <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Select Saved Card (Optional)
              </label>
              <select
                disabled={savedCards.length === 0}
                onChange={handleUseSavedCardChange}
                className="shadow border rounded w-full py-2 px-3 text-gray-700"
              >
                <option value="">-- Select a Card --</option>
                {savedCards.map((card, index) => (
                  <option key={index} value={index}>
                    {`${card.cardType} ending in ${card.cardNumber.slice(-4)}`}
                  </option>
                ))}
              </select>
              {loadingCards && <p>Loading saved cards...</p>}
              {!loadingCards && savedCards.length === 0 && <p>No saved cards found.</p>}
            </div>
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
              <label className="block text-gray-700 text-sm font-bold mb-2 mt-4" htmlFor="billingAddress">
                Billing Address
              </label>
              <input
                type="text"
                id="billingAddress"
                name="billingAddress"
                value={creditCardInfo.billingAddress}
                onChange={handleCreditCardChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter billing address"
              />
            </div>
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