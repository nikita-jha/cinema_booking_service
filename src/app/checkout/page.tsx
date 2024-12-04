"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Link from 'next/link';
import useRequireAuth from '../../components/RequireAuth';
import { getSavedCardsForUser } from "../../application/firebase/firestore";
import { onAuthStateChanged } from "firebase/auth"; // Import for auth state monitoring
import { auth } from "../../application/firebase/config"; // Firebase Auth instance
import * as crypto from 'crypto';


const CheckoutPage = () => {
  useRequireAuth();
  const searchParams = useSearchParams();
  const router = useRouter(); 

  // Retrieve query parameters from the URL
  const title = searchParams.get("title") || "";
  const showDate = searchParams.get("showDate") || "";
  const showTime = searchParams.get("showTime") || "";
  const numTickets = parseInt(searchParams.get("numTickets") || "0", 10);
  const selectedSeats = JSON.parse(searchParams.get("selectedSeats") || "[]");
  const showId = searchParams.get("showId") || "";

  const [userId, setUserId] = useState<string | null>(null); // Store user ID
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [loadingCards, setLoadingCards] = useState<boolean>(true);

  const [promoCode, setPromoCode] = useState<string>("");
  const [useSavedCard, setUseSavedCard] = useState<boolean>(false);
  const [creditCardInfo, setCreditCardInfo] = useState({
    cardNumber: "",
    cvv: "",
    expirationDate: "",
    billingAddress: "",
  });


  const ticketPrice = 10; // Example: $10 per ticket
  const initialOrderTotal = numTickets * ticketPrice; 
  const initialTaxAmount = initialOrderTotal * 0.07; // 7% tax
  const initialOverallTotal = initialOrderTotal + initialTaxAmount;

  const [orderTotal, setOrderTotal] = useState<number>(initialOrderTotal);
  const [taxAmount, setTaxAmount] = useState<number>(initialTaxAmount);
  const [overallTotal, setOverallTotal] = useState<number>(initialOverallTotal);
  const [isDiscountApplied, setIsDiscountApplied] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string>(""); // Error message state


  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Logged-in user ID:", user.uid);
        console.log("TITLE:", title);
        setUserId(user.uid); // Set the logged-in user's ID
      } else {
        console.log("No user logged in");
        setUserId(null); // Clear user ID if not logged in
      }
    });
  
    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);
  
  useEffect(() => {
    const fetchCardData = async () => {
      if (userId) {
        console.log("Fetching card data for user:", userId);
        try {
          setLoadingCards(true);
          const cards = await getSavedCardsForUser(userId);
  
          // Filter out invalid or incomplete cards
          const validCards = cards.filter((card) =>
            card.cardNumber?.trim().length > 0 &&
            card.cvv?.trim().length > 0 &&
            card.expirationDate?.trim().length > 0 &&
            card.billingAddress?.trim().length > 0 &&
            card.cardType?.trim().length > 0
          );
  
          setSavedCards(validCards);
          console.log("Fetched valid card data:", validCards);
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

  const encryptData = (data: string): string => {
    const algorithm = "aes-256-cbc";
    const key = crypto.randomBytes(32); // Replace with a securely stored key
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    // Combine IV and encrypted data for sending
    return `${iv.toString("hex")}:${encrypted}`;
  };
  

  const handleCreditCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCreditCardInfo((prevInfo) => ({
      ...prevInfo,
      [name]: sanitizeInput(value),
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

  const validateCreditCardInfo = ({ cardNumber, cvv, expirationDate, billingAddress }: typeof creditCardInfo): boolean => {
    const cardNumberRegex = /^\d{16}$/; // Ensure 16 digits
    const cvvRegex = /^\d{3,4}$/; // Ensure 3 or 4 digits
    const expirationRegex = /^(0[1-9]|1[0-2])\/\d{2}$/; // MM/YY format
    
    return (
      cardNumberRegex.test(cardNumber) &&
      cvvRegex.test(cvv) &&
      expirationRegex.test(expirationDate) &&
      billingAddress.trim().length > 0
    );
  };

  const handleConfirmPayment = () => {
    if (!validateCreditCardInfo(creditCardInfo)) {
      setErrorMessage("Invalid payment information. Please check your details.");
      return;
    }
    setErrorMessage("");
  
    const encryptedCardData = {
      cardNumber: encryptData(creditCardInfo.cardNumber),
      cvv: encryptData(creditCardInfo.cvv),
      expirationDate: encryptData(creditCardInfo.expirationDate),
      billingAddress: encryptData(creditCardInfo.billingAddress),
    };
  
    console.log("Encrypted card data ready for submission:", encryptedCardData);
    // Submit encrypted data to the server

    const queryParams = new URLSearchParams({
      title,
      showDate,
      showTime,
      numTickets: numTickets.toString(),
      selectedSeats: JSON.stringify(selectedSeats),
    });

    router.push(`/confirmation?${queryParams.toString()}`);
  };

  const sanitizeInput = (value: string): string => {
    return value.replace(/[^a-zA-Z0-9 /]/g, ""); // Allow alphanumeric and common characters
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
            <p className="mb-2">
              Selected Seats: {selectedSeats.map((seat) => seat.seat).join(", ")}
            </p>            
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
                type="password"
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
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          </div>
        </div>
        <div className="flex justify-between w-full max-w-4xl mx-auto mt-4">
          <Link href="/">
            <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
              Cancel
            </button>
          </Link>
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleConfirmPayment}>
            Confirm Payment
          </button>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;