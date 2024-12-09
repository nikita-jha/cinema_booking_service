"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Link from 'next/link';
import useRequireAuth from '../../components/RequireAuth';
import { getSavedCardsForUser, reserveSeats, addBookingToUserHistory } from "../../application/firebase/firestore";
import { onAuthStateChanged } from "firebase/auth"; // Import for auth state monitoring
import { auth } from "../../application/firebase/config"; // Firebase Auth instance
import * as crypto from 'crypto';
import CryptoJS from 'crypto-js';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../application/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";

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
  const ticketPrice = JSON.parse(searchParams.get("ticketPrices") || "[]");

  const [userId, setUserId] = useState<string | null>(null); // Store user ID
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [loadingCards, setLoadingCards] = useState<boolean>(true);

  const [appliedPromotion, setAppliedPromotion] = useState<any>(null);
  const [promoCode, setPromoCode] = useState<string>("");
  const [useSavedCard, setUseSavedCard] = useState<boolean>(false);
  const [creditCardInfo, setCreditCardInfo] = useState({
    cardType: "",
    cardNumber: "",
    cvv: "",
    expirationDate: "",
    billingAddress: "",
  
  });

  console.log("Age: ", selectedSeats.map((s) => s.age));
  console.log("Checkout Ticket Price", ticketPrice);

  const fetchPromotionData = async (promoCode: string) => {
    const promotionsRef = collection(db, "promotions");
    const q = query(promotionsRef, where("discountCode", "==", promoCode));
    const querySnapshot = await getDocs(q);
  
    if (!querySnapshot.empty) {
      const promotionDoc = querySnapshot.docs[0];
      return promotionDoc.data();
    } else {
      return null;
    }
  };
  
  const handleApplyPromoCode = async () => {
    const promotionData = await fetchPromotionData(promoCode);
  
    if (promotionData) {
      const currentDate = new Date();
      const startDate = new Date(promotionData.startDate);
      const endDate = new Date(promotionData.endDate);
  
      if (currentDate >= startDate && currentDate <= endDate) {
        const discountPercentage = promotionData.value / 100;
        const discountedOrderTotal = initialOrderTotal * (1 - discountPercentage);
        const newTaxAmount = discountedOrderTotal * 0.07;
        const newOverallTotal = discountedOrderTotal + newTaxAmount;
        setOrderTotal(discountedOrderTotal);
        setTaxAmount(newTaxAmount);
        setOverallTotal(newOverallTotal);
        setIsDiscountApplied(true);
        setAppliedPromotion(promotionData);
      } else {
        setErrorMessage("Promo code is not valid for the current date.");
        setOrderTotal(initialOrderTotal);
        setTaxAmount(initialTaxAmount);
        setOverallTotal(initialOverallTotal);
        setIsDiscountApplied(false);
        setAppliedPromotion(null); 
      }
    } else {
      setErrorMessage("Invalid promo code.");
      setOrderTotal(initialOrderTotal);
      setTaxAmount(initialTaxAmount);
      setOverallTotal(initialOverallTotal);
      setIsDiscountApplied(false);
      setAppliedPromotion(null); 
    }
  };


  //const ticketPrice = 10; // Example: $10 per ticket

  const getAgeCategory = (age: number): string => {
    if (age < 13) {
      return "child"
    } else if (age >= 60) {
      return "senior"
    } else {
      return "adult";
    }
  };

  const calculateTotalPrice = () => {
    let total = 0;
    
    // Loop through the selected seats and calculate the total price
    selectedSeats.forEach((seat) => {
      const ageCategory = getAgeCategory(seat.age); // Determine the age category (child, adult, senior)
      const price = ticketPrice[ageCategory.toLowerCase()];  // Get the price based on the age category
      total += price; // Add the price for this seat to the total
    });
  
    return total;
  };
  
  // Now, use this function to set the total order price
   const initialOrderTotal = calculateTotalPrice();
  

  //const initialOrderTotal = numTickets * ticketPrice; 
  const initialTaxAmount = initialOrderTotal * 0.07; // 7% tax
  const initialOverallTotal = initialOrderTotal + initialTaxAmount;

  const [orderTotal, setOrderTotal] = useState<number>(initialOrderTotal);
  const [taxAmount, setTaxAmount] = useState<number>(initialTaxAmount);
  const [overallTotal, setOverallTotal] = useState<number>(initialOverallTotal);
  const [isDiscountApplied, setIsDiscountApplied] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string>(""); // Error message state
  const [isPaymentEnabled, setIsPaymentEnabled] = useState(false);

  const [errors, setErrors] = useState({
    cardNumber: "",
    cvv: "",
    expirationDate: "",
    billingAddress: "",
  });


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Logged-in user ID:", user.uid);
        setUserId(user.uid); // Set the logged-in user's ID
      } else {
        console.log("No user logged in");
        setUserId(null); // Clear user ID if not logged in
      }
    });
  
    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  useEffect(() => {
    setIsPaymentEnabled(isPaymentInfoComplete());
  }, [useSavedCard, creditCardInfo, savedCards]);

  useEffect(() => {
    const fetchCardData = async () => {
      if (userId) {
        console.log("Fetching card data for user:", userId);
        try {
          setLoadingCards(true);
          const cards = await getSavedCardsForUser(userId);
          console.log("CARD DATA:", cards);
  
          // Decrypt sensitive fields before displaying
          const decryptedCards = cards.map(card => ({
            ...card,
            cardNumber: decryptData(card.cardNumber),
            expirationDate: decryptData(card.expirationDate),
            billingAddress: decryptData(card.billingAddress),
            cvv: decryptData(card.cvv),
            // No decrypting CVV (leaving it out for security)
          })).filter(card => card.cardNumber && card.cardNumber.length >= 4);

          console.log("DECRYPTED CARD DATA:", decryptedCards);
  
          setSavedCards(decryptedCards);
          console.log("Fetched valid card data:", decryptedCards);
        } catch (error) {
          console.error("Error fetching card data:", error);
        } finally {
          setLoadingCards(false);
        }
      }
    };
  
    fetchCardData();
  }, [userId]); // Run this effect when `userId` changes
  
  
  const decryptData = (encryptedData: string): string => {
    const decryptionKey = process.env.NEXT_PUBLIC_CARD_ENCRYPTION_KEY || 'defaultKey';
    const bytes = CryptoJS.AES.decrypt(encryptedData, decryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  const handlePromoCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPromoCode(e.target.value);
  };
  
  const handleCreditCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
  
    setCreditCardInfo((prevInfo) => ({
      ...prevInfo,
      [name]: sanitizeInput(value),
    }));
  
    let error = "";
    setErrorMessage(
      ""
    );
  
    if (name === "cardNumber") {
      if (!creditCardInfo.cardType) {
        error = "Please select a card type before entering the card number.";
      } else if (creditCardInfo.cardType === "Amex") {
        if (!/^\d{15}$/.test(value)) {
          error = "Card number should have 15 digits for American Express and no spaces.";
        }
      } else if (creditCardInfo.cardType === "Visa" || creditCardInfo.cardType === "Mastercard") {
        if (!/^\d{16}$/.test(value)) {
          error = "Card number should have 16 digits for Visa or Mastercard and no spaces.";
        }
      } else {
        error = "Invalid card type selected.";
      }
    } else if (name === "cvv") {
      const isAmex = creditCardInfo.cardType === "Amex";
      const regex = new RegExp(`^\\d{${isAmex ? "4" : "3"}}$`);
      if (!regex.test(value)) {
        error = `CVV should be ${isAmex ? "4" : "3"} digits.`;
      }
    } else if (name === "expirationDate") {
      const expirationRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
      if (!expirationRegex.test(value)) {
        error = "Expiration date must be in MM/YY format.";
      } else {
        const [month, year] = value.split("/").map(Number);
        const currentDate = new Date();
        const expirationDate = new Date(`20${year}`, month - 1);
        if (expirationDate <= currentDate) {
          error = "Expiration date must be in the future.";
        }
      }
    } else if (name === "billingAddress") {
      if (value.trim().length === 0) {
        error = "Billing address cannot be empty.";
      }
    }
  
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };
  const handleUseSavedCardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCardIndex = e.target.value; // Index of the selected card
    if (selectedCardIndex === "") {
      // Reset all fields to blank if "Select a card" is chosen
      setCreditCardInfo({
        cardType: "",
        cardNumber: "",
        cvv: "",
        expirationDate: "",
        billingAddress: "",
      });
      setUseSavedCard(false); // Reset the saved card usage flag
    } else if (savedCards[selectedCardIndex]) {
      const selectedCard = savedCards[selectedCardIndex];
      setCreditCardInfo({
        cardType: selectedCard.cardType,
        cardNumber: selectedCard.cardNumber,
        cvv: selectedCard.cvv,
        expirationDate: selectedCard.expirationDate,
        billingAddress: selectedCard.billingAddress,
      });
      setUseSavedCard(true);
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
  const isPaymentInfoComplete = () => {
    if (useSavedCard) {
      const cardSelected = savedCards.findIndex(
        (card) => card.cardNumber === creditCardInfo.cardNumber
      ) !== -1;
      console.log("Saved card selected:", cardSelected);
      return cardSelected; // Ensure a saved card is selected
    }
  
    // Validate individual fields for manual entry
    const isValid = validateCreditCardInfo(creditCardInfo);
    console.log("Manual card info valid:", isValid);
    return isValid;
  };


const handleConfirmPayment = async () => {
  if (!isPaymentInfoComplete()) {
    setErrorMessage(
      "Please select a saved card or fill out all payment details."
    );
    return;
  }

  setErrorMessage("");

  if (!validateCreditCardInfo(creditCardInfo)) {
    setErrorMessage(
      "Invalid payment information. Please check your details and try again."
    );
    return;
  }

  try {
    // Reserve seats first
    if (!userId) throw new Error("User must be logged in to reserve seats.");
    await reserveSeats(showId, selectedSeats, userId);

    // Add booking to user history
    await addBookingToUserHistory(userId, {
      movieTitle: title,
      showDate,
      showTime,
      seats: selectedSeats,
      totalAmount: overallTotal,
      status: "confirmed",
    });

    sessionStorage.removeItem("bookingState");

    // Redirect to confirmation page
    const queryParams = new URLSearchParams({
      title,
      showDate,
      showTime,
      numTickets: numTickets.toString(),
      selectedSeats: JSON.stringify(selectedSeats),
    });

    router.push(`/confirmation?${queryParams.toString()}`);
  } catch (error) {
    setErrorMessage("Failed to process payment. Please try again.");
    console.error("Payment error:", error);
  }
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
            <div className="mb-2">
            {selectedSeats.map((seat, index) => {
              const ageCategory = getAgeCategory(seat.age);
              const price = ticketPrice[ageCategory.toLowerCase()];
              return (
                <p key={index}>
                  Ticket {index + 1} ({ageCategory.charAt(0).toUpperCase() + ageCategory.slice(1)}): $ {price.toFixed(2)}
                </p>
              );
            })}
            </div>
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
              {isDiscountApplied && appliedPromotion && <span className="text-red-500">({appliedPromotion.value}% Off)</span>}
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
                value={useSavedCard ? savedCards.findIndex(card => card.cardNumber === creditCardInfo.cardNumber) : ""}
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
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cardType">
                  Card Type
                </label>
              <select
                id="cardType"
                name="cardType"
                value={creditCardInfo.cardType}
                onChange={(e) => handleCreditCardChange(e)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">-- Select Card Type --</option>
                <option value="Visa">Visa</option>
                <option value="Mastercard">Mastercard</option>
                <option value="Amex">American Express</option>
              </select>
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
                className={`shadow appearance-none border ${
                  errors.cardNumber ? "border-red-500" : ""
                } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                placeholder="Enter card number"
              />
              {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}

              <label className="block text-gray-700 text-sm font-bold mb-2 mt-4" htmlFor="cvv">
                CVV
              </label>
              <input
                type="password"
                id="cvv"
                name="cvv"
                value={creditCardInfo.cvv}
                onChange={handleCreditCardChange}
                className={`shadow appearance-none border ${
                  errors.cvv ? "border-red-500" : ""
                } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                placeholder="Enter CVV"
              />
               {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}

              <label className="block text-gray-700 text-sm font-bold mb-2 mt-4" htmlFor="expirationDate">
                Expiration Date
              </label>
              <input
                type="text"
                id="expirationDate"
                name="expirationDate"
                value={creditCardInfo.expirationDate}
                onChange={handleCreditCardChange}
                className={`shadow appearance-none border ${
                  errors.expirationDate ? "border-red-500" : ""
                } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                placeholder="Enter expiration date"
              />
              {errors.expirationDate && <p className="text-red-500 text-xs mt-1">{errors.expirationDate}</p>}

              <label className="block text-gray-700 text-sm font-bold mb-2 mt-4" htmlFor="billingAddress">
                Billing Address
              </label>
              <input
                type="text"
                id="billingAddress"
                name="billingAddress"
                value={creditCardInfo.billingAddress}
                onChange={handleCreditCardChange}
                className={`shadow appearance-none border ${
                  errors.billingAddress ? "border-red-500" : ""
                } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                placeholder="Enter billing address"
              />
              {errors.billingAddress && <p className="text-red-500 text-xs mt-1">{errors.billingAddress}</p>}
            </div>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          </div>
        </div>
        <div className="flex justify-between w-full max-w-4xl mx-auto mt-4">
          <Link href="/">
            <button 
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => {
                sessionStorage.clear(); // Clears all session storage
                console.log("Session storage cleared");
              }}
            >
              Cancel
            </button>
          </Link>
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleConfirmPayment}
          >
          
            Confirm Payment
          </button>

        </div>
        
      </div>
    </div>
  );
};

export default CheckoutPage;