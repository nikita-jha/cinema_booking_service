"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../../components/Navbar";
import { auth, db } from "../../lib/firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updatePassword, signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import ChangePassword from "../../components/ChangePassword";
import { useUser} from "../../context/UserContext";
import CryptoJS from 'crypto-js';
import { User } from "firebase/auth";


const EditProfilePage = () => {
  interface UserData {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    password?: string;
    userType?: string; // e.g., admin, regular user, etc.
    promotionalEmails?: boolean; // for the checkbox
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zip?: string;
    };
    cardData?: {
      [cardId: string]: {
        cardType?: string; // e.g., Visa, MasterCard, etc.
        cardNumber?: string;
        expirationDate?: string;
        cvv?: string;
        billingAddress?: string;
      };
    };
  }
  
  const [activeTab, setActiveTab] = useState("personal");
  const [originalUserData, setOriginalUserData] = useState(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setUser } = useUser();

  const [validationMessages, setValidationMessages] = useState({
    firstName: "",
    lastName: "",
    password: "",
    phone: "",
    cardNumber: "",
    expirationDate: "",
    cvv: "",
    "address.zip": "",
  });
  
  const [isFormValid, setIsFormValid] = useState(false);

  const validateField = (name: string, value: string) => {
    let message = "";
    switch (name) {
      case "firstName":
      case "lastName":
        if (!/^[a-zA-Z]+$/.test(value)) {
          message = "Only letters are allowed.";
        }
        break;
      case "password":
        if (!/(?=.*[0-9])(?=.*[a-zA-Z])/.test(value)) {
          message = "Password should contain letters and at least one number.";
        } else if (value.length < 6) {
          message = "Password should be at least 6 characters long.";
        }
        break;
      case "phone":
        if (!/^\d{10}$/.test(value)) {
          message = "Phone number should be exactly 10 digits.";
        }
        break;
      case "address.zip":
        if (!/^\d{5}$/.test(value)) {
          message = "ZIP code should be exactly 5 digits.";
        }
        break;
      default:
        break;
    }
    setValidationMessages((prevMessages) => ({
      ...prevMessages,
      [name]: message,
    }));
    validateForm();
  };
  
  const validateCardField = (index: number, name: string, value: string) => {
    let message = "";
    switch (name) {
      case "cardNumber":
        if (userData?.cardData?.[index]?.cardType === "visa" || userData?.cardData?.[index]?.cardType === "mastercard") {
          if (!/^\d{16}$/.test(value)) {
            message = "Card number should have 16 digits.";
          }
        } else if (userData?.cardData?.[index]?.cardType === "amex") {
          if (!/^\d{15}$/.test(value)) {
            message = "Card number should have 15 digits.";
          }
        }
        break;
      case "expirationDate":
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) {
          message = "Expiration date should be in MM/YY format.";
        } else {
          const [month, year] = value.split("/").map(Number);
          const currentDate = new Date();
          const expirationDate = new Date(`20${year}`, month - 1);
          if (expirationDate <= currentDate) {
            message = "Expiration date should be in the future.";
          }
        }
        break;
      case "cvv":
        if (userData?.cardData?.[index]?.cardType === "visa" || userData?.cardData?.[index]?.cardType === "mastercard") {
          if (!/^\d{3}$/.test(value)) {
            message = "CVV should have 3 digits.";
          }
        } else if (userData?.cardData?.[index]?.cardType === "amex") {
          if (!/^\d{4}$/.test(value)) {
            message = "CVV should have 4 digits.";
          }
        }
        break;
      default:
        break;
    }
    setValidationMessages((prevMessages) => ({
      ...prevMessages,
      [`card${index}_${name}`]: message,
    }));
    validateForm();
  };

  const validateForm = () => {
    const isValid = Object.values(validationMessages).every((message) => message === "");
    setIsFormValid(isValid);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            // Decrypt card data
            if (data.cardData) {
              const decryptedCardData = Object.fromEntries(
                Object.entries(data.cardData).map(([cardId, encryptedCard]) => [
                  cardId,
                  decryptCardData(encryptedCard)
                ])
              );
              data.cardData = decryptedCardData;
            }
            setOriginalUserData(data);
            setUserData(data);
            setUser({
              id: firebaseUser.uid,
              name: data.name || '',
              email: firebaseUser.email || '',
              userType: data.userType,
              phone: data.phone || ''
            });
          } else {
            setError("User data not found");
          }
        } catch (err) {
          setError("Error fetching user data");
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setError("User not authenticated");
        setLoading(false);
        router.push('/login'); // Redirect to login if not authenticated
      }
    });

    return () => unsubscribe();
  }, [setUser, router]);

  // Add this function to decrypt card data
  interface EncryptedCardData {
    cardType: string;
    cardNumber: string;
    expirationDate: string;
    cvv: string;
  }
  
  const decryptCardData = (encryptedCard: EncryptedCardData) => {
    const encryptionKey = process.env.NEXT_PUBLIC_CARD_ENCRYPTION_KEY || 'defaultKey';
    return {
      cardType: encryptedCard.cardType,
      cardNumber: CryptoJS.AES.decrypt(encryptedCard.cardNumber, encryptionKey).toString(CryptoJS.enc.Utf8),
      expirationDate: CryptoJS.AES.decrypt(encryptedCard.expirationDate, encryptionKey).toString(CryptoJS.enc.Utf8),
      cvv: CryptoJS.AES.decrypt(encryptedCard.cvv, encryptionKey).toString(CryptoJS.enc.Utf8),
    };
  };
  
  type TabType = "personal" | "payment" | "address";

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prevData) => {
      if (!prevData) {
        prevData = {};
      }
  
      const keys = name.split('.');
      if (keys.length === 2) {
        const [parentKey, childKey] = keys;
        return {
          ...prevData,
          [parentKey]: {
            ...prevData[parentKey],
            [childKey]: value,
          },
        };
      }
  
      return {
        ...prevData,
        [name]: value,
      };
    });
    validateField(name, value);
  };

  const handleCardInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData((prevData) => {
      if (!prevData) {
        prevData = {};
      }
  
      const updatedCardData = { ...prevData.cardData };
      updatedCardData[index] = { ...updatedCardData[index], [name]: value };
      return {
        ...prevData,
        cardData: updatedCardData,
      };
    });
    validateCardField(index, name, value);
  };

  const isProfileChanged = useCallback(() => {
    if (!originalUserData || !userData) return false;
    return JSON.stringify(originalUserData) !== JSON.stringify(userData);
  }, [originalUserData, userData]);

  // Modify handleSubmit to encrypt card data before saving
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isFormValid) {
      console.log('Form is not valid');
      return;
    }

    try {
      const user = auth.currentUser;
      if (user && userData) {  // Check if userData is not null
        const updatedUserData = { ...userData };
  
        if (updatedUserData.cardData) {
          updatedUserData.cardData = Object.fromEntries(
            Object.entries(updatedUserData.cardData).map(([cardId, card]) => [
              cardId,
              encryptCardData(card)
            ])
          );
        }
  
        await updateDoc(doc(db, "users", user.uid), updatedUserData);
  
        if (userData.password) {
          await updatePassword(user, userData.password);
        }
      }
    } catch (err) {
      setError("Error updating profile");
      console.error(err);
    }
  };
  
  

  
  interface CardData {
    cardType?: string;
    cardNumber?: string;
    expirationDate?: string;
    cvv?: string;
    billingAddress?: string; // If necessary
  }
  // Add this function to encrypt card data
  const encryptCardData = (card: CardData) => {
    const encryptionKey = process.env.NEXT_PUBLIC_CARD_ENCRYPTION_KEY || 'defaultKey';
    return {
      cardType: card.cardType,
      cardNumber: CryptoJS.AES.encrypt(card.cardNumber || '', encryptionKey).toString(),
      expirationDate: CryptoJS.AES.encrypt(card.expirationDate || '', encryptionKey).toString(),
      cvv: CryptoJS.AES.encrypt(card.cvv || '', encryptionKey).toString(),
    };
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("user");
      setUser(null); // Update the user context
      router.push('/'); // Redirect to login page after logout
    } catch (error) {
      console.error("Error logging out:", error);
      setError("Failed to log out");
    }
  };
  
  const sendProfileUpdateEmail = async (user: User) => {
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          subject: "Profile Update Confirmation - Cinema E-Booking System",
          message: "Your profile has been updated.",
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
    } catch (error) {
      setError("Failed to send email");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndExit = async () => {
  if (isProfileChanged() && userData) {  // Check if userData is not null
    try {
      const user = auth.currentUser;
      if (user) {
        // Ensure userData is in the correct format
        const updatedUserData = { ...userData };

        if (userData.cardData) {
          updatedUserData.cardData = Object.fromEntries(
            Object.entries(userData.cardData).map(([cardId, card]) => [
              cardId,
              encryptCardData(card) // Assume encryptCardData returns a plain object
            ])
          );
        }

        await updateDoc(doc(db, "users", user.uid), updatedUserData); // Update Firestore

        if (userData.password) {
          await updatePassword(user, userData.password);
        }

        await sendProfileUpdateEmail(user);
        router.push("/");  // Redirect to home page
      }
    } catch (err) {
      setError("Error updating profile");
      console.error(err);
    }
  } else {
    router.push("/");  // Just exit without saving if no changes or userData is null
  }
};

  

  const handleCancel = () => {
    router.push("/"); // Exit without saving
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: "1400px",
    minHeight: "600px",
    display: "flex",
    margin: "0 auto",
    padding: "0px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  };

  const sidebarStyle: React.CSSProperties = {
    width: "250px",
    backgroundColor: "#f9f9f9",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    justifyContent: "space-between",
    display: "flex",
    flexDirection: "column",
  };

  const navButtonStyle = (isActive: boolean): React.CSSProperties => ({
    display: "block",
    padding: "10px",
    marginBottom: "10px",
    backgroundColor: isActive ? "#002f6c" : "#4a90e2",
    color: "#fff",
    borderRadius: "4px",
    cursor: "pointer",
    textAlign: "center",
  });

  const contentStyle: React.CSSProperties = {
    flex: "1",
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "8px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
    color: "#333",
  };

  const readOnlyInputStyle: React.CSSProperties = {
    ...inputStyle,
    backgroundColor: "#f0f0f0",
    color: "#999",
    cursor: "not-allowed",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "5px",
    color: "#666",
  };

  const cardContainerStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  };

  const logoutButtonStyle: React.CSSProperties = {
    backgroundColor: "#dc3545",
    color: "#fff",
    padding: "10px",
    borderRadius: "4px",
    cursor: "pointer",
    textAlign: "center",
    marginTop: "auto",
  };

  const saveAndExitButtonStyle: React.CSSProperties = {
    backgroundColor: "#28a745",
    color: "#fff",
    padding: "10px",
    borderRadius: "4px",
    cursor: "pointer",
    textAlign: "center",
    marginBottom: "10px",
  };

  const cancelButtonStyle: React.CSSProperties = {
    backgroundColor: "#6c757d",
    color: "#fff",
    padding: "10px",
    borderRadius: "4px",
    cursor: "pointer",
    textAlign: "center",
    marginBottom: "10px",
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Edit Profile</h1>

        <form onSubmit={handleSubmit}>
          <div style={containerStyle}>
            {/* Sidebar */}
            <div style={sidebarStyle}>
              <div style={{ width: "100%" }}>
                <button
                  type="button"
                  style={{
                    ...navButtonStyle(activeTab === "personal"),
                    width: "100%",
                  }}
                  onClick={() => handleTabClick("personal")}
                >
                  Personal Info
                </button>
                <button
                  type="button"
                  style={{
                    ...navButtonStyle(activeTab === "payment"),
                    width: "100%",
                  }}
                  onClick={() => handleTabClick("payment")}
                >
                  Payment Info
                </button>
                <button
                  type="button"
                  style={{
                    ...navButtonStyle(activeTab === "address"),
                    width: "100%",
                  }}
                  onClick={() => handleTabClick("address")}
                >
                  Home Address
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <button
                  type="button"
                  style={cancelButtonStyle}
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                {isProfileChanged() && isFormValid && (
                  <button
                    type="button"
                    style={saveAndExitButtonStyle}
                    onClick={handleSaveAndExit}
                  >
                    Save and Exit
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div style={contentStyle}>
              {activeTab === "personal" && (
                <div>
                  <h1
                    style={{
                      color: "#333",
                      fontSize: "2rem",
                      fontWeight: "bold",
                    }}
                  >
                    {" "}
                    Hey {userData?.firstName}!
                  </h1>
                  <h2 style={{ color: "#333", fontWeight: "bold" }}>
                    Personal Information
                  </h2>
                  <label style={labelStyle} htmlFor="firstName">
                    First Name
                  </label>
                  <input
                    style={inputStyle}
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={userData?.firstName || ""}
                    onChange={handleInputChange}
                  />
                  {validationMessages.firstName && <p className="text-red-500 text-sm mt-1">{validationMessages.firstName}</p>}

                  <label style={labelStyle} htmlFor="lastName">
                    Last Name
                  </label>
                  <input
                    style={inputStyle}
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={userData?.lastName || ""}
                    onChange={handleInputChange}
                  />
                  {validationMessages.lastName && <p className="text-red-500 text-sm mt-1">{validationMessages.lastName}</p>}

                  <label style={labelStyle} htmlFor="phone">
                    Phone Number
                  </label>
                  <input
                    style={inputStyle}
                    type="text"
                    id="phone"
                    name="phone"
                    value={userData?.phone || ""}
                    onChange={handleInputChange}
                  />
                  {validationMessages.phone && <p className="text-red-500 text-sm mt-1">{validationMessages.phone}</p>}

                  <label style={labelStyle} htmlFor="email">
                    Email
                  </label>
                  <input
                    style={readOnlyInputStyle}
                    type="email"
                    id="email"
                    value={userData?.email || ""}
                    readOnly
                  />

                  <div style={{ marginTop: "20px" }}>
                    <label
                      style={{
                        ...labelStyle,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="checkbox"
                        id="promotionalEmails"
                        name="promotionalEmails"
                        checked={userData?.promotionalEmails || false}
                        onChange={(e) => {
                          setUserData((prevData) => ({
                            ...prevData,
                            promotionalEmails: e.target.checked,
                          }));
                        }}
                      />
                      <span style={{ marginLeft: "8px" }}>
                        Sign up for promotional emails
                      </span>
                    </label>
                  </div>

                  <ChangePassword />
                </div>
              )}

              {activeTab === "payment" && (
                <div>
                  <h1 style={{ color: "#333", fontSize: "2rem", fontWeight: "bold" }}>
                    Hey {userData?.firstName}!
                  </h1>

                  <h2 style={{ color: "#333", fontWeight: "bold" }}>
                    Payment Information
                  </h2>
                  <div style={cardContainerStyle}>
                    {userData?.cardData &&
                      Object.entries(userData.cardData).map(
                        ([cardId, card], index) => (
                          <div key={cardId} style={cardStyle}>
                            <h3 style={{ color: "#333", fontWeight: "bold" }}>
                              Card {index + 1}
                            </h3>

                            <label style={labelStyle} htmlFor={`cardType${index}`}>
                              Card Type
                            </label>
                            <select
                              style={inputStyle}
                              id={`cardType${index}`}
                              name="cardType"
                              value={card.cardType ? card.cardType.toLowerCase() : ""} // Convert to lowercase for comparison
                              onChange={(e) => handleCardInputChange(index, e)}
                              >
                              <option value="">Select Card Type</option>
                              <option value="visa">Visa</option>
                              <option value="mastercard">MasterCard</option>
                              <option value="amex">American Express</option>
                            </select>

                            <label style={labelStyle} htmlFor={`cardNumber${index}`}>
                              Card Number
                            </label>
                            <input
                              style={inputStyle}
                              type="text"
                              id={`cardNumber${index}`}
                              name="cardNumber"
                              value={card.cardNumber}
                              onChange={(e) => handleCardInputChange(index, e)}
                              />
                             {validationMessages[`card${index}_cardNumber`] && <p className="text-red-500 text-sm mt-1">{validationMessages[`card${index}_cardNumber`]}</p>}

                            <label style={labelStyle} htmlFor={`expiryDate${index}`}>
                              Expiration Date
                            </label>
                            <input
                              style={inputStyle}
                              type="text"
                              id={`expiryDate${index}`}
                              name="expirationDate"
                              value={card.expirationDate}
                              onChange={(e) => handleCardInputChange(index, e)}
                              placeholder="MM/YY"
                            />
                            {validationMessages[`card${index}_expirationDate`] && <p className="text-red-500 text-sm mt-1">{validationMessages[`card${index}_expirationDate`]}</p>}

                            <label style={labelStyle} htmlFor={`cvv${index}`}>
                              CVV
                            </label>
                            <input
                              style={inputStyle}
                              type="text"
                              id={`cvv${index}`}
                              name="cvv"
                              value={card.cvv}
                              onChange={(e) => handleCardInputChange(index, e)}
                              />
                              {validationMessages[`card${index}_cvv`] && <p className="text-red-500 text-sm mt-1">{validationMessages[`card${index}_cvv`]}</p>}

                            <label style={labelStyle} htmlFor={`billingAddress${index}`}>
                              Billing Address
                            </label>
                            <input
                              style={inputStyle}
                              type="text"
                              id={`billingAddress${index}`}
                              name={`cardData.${cardId}.billingAddress`}
                              value={card.billingAddress}
                              onChange={(e) => handleCardInputChange(index, e)}
                              />
                          </div>
                        )
                      )}
                  </div>
                </div>
              )}

              {activeTab === "address" && (
                <div>
                  <h1 style={{ color: "#333", fontSize: "2rem", fontWeight: "bold" }}>
                    Hey {userData?.firstName}!
                  </h1>

                  <h2 style={{ color: "#333", fontWeight: "bold" }}>Home Address</h2>
                  <label style={labelStyle} htmlFor="street">Street</label>
                  <input
                    style={inputStyle}
                    type="text"
                    id="street"
                    name="address.street"
                    value={userData?.address?.street || ""}
                    onChange={handleInputChange}
                  />

                  <label style={labelStyle} htmlFor="city">City</label>
                  <input
                    style={inputStyle}
                    type="text"
                    id="city"
                    name="address.city"
                    value={userData?.address?.city || ""}
                    onChange={handleInputChange}
                  />

                  <label style={labelStyle} htmlFor="state">State</label>
                  <select
                    style={inputStyle}
                    id="state"
                    name="address.state"
                    value={userData?.address?.state || ""}
                    onChange={handleInputChange}
                  >
                    <option value="">Select State</option>
                    {[
                      "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
                      "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
                      "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
                      "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
                      "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
                    ].map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>

                  <label style={labelStyle} htmlFor="zip">ZIP Code</label>
                  <input
                    style={inputStyle}
                    type="text"
                    id="zip"
                    name="address.zip"
                    value={userData?.address?.zip || ""}
                    onChange={handleInputChange}
                  />
                  {validationMessages["address.zip"] && <p className="text-red-500 text-sm mt-1">{validationMessages["address.zip"]}</p>}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
