"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../../components/Navbar";
import { auth, db } from "../../lib/firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updatePassword, signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import ChangePassword from "../../components/ChangePassword";
import { useUser } from "../../context/UserContext";
import CryptoJS from 'crypto-js';

const EditProfilePage = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [originalUserData, setOriginalUserData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { setUser } = useUser();

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
              userType: data.userType
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
  const decryptCardData = (encryptedCard) => {
    const encryptionKey = process.env.NEXT_PUBLIC_CARD_ENCRYPTION_KEY || 'defaultKey';
    return {
      cardType: encryptedCard.cardType,
      cardNumber: CryptoJS.AES.decrypt(encryptedCard.cardNumber, encryptionKey).toString(CryptoJS.enc.Utf8),
      expirationDate: CryptoJS.AES.decrypt(encryptedCard.expirationDate, encryptionKey).toString(CryptoJS.enc.Utf8),
      cvv: CryptoJS.AES.decrypt(encryptedCard.cvv, encryptionKey).toString(CryptoJS.enc.Utf8)
    };
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Modify the handleInputChange function to handle nested cardData changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => {
      if (name.startsWith('cardData.')) {
        const [_, cardId, field] = name.split('.');
        return {
          ...prevData,
          cardData: {
            ...prevData.cardData,
            [cardId]: {
              ...prevData.cardData[cardId],
              [field]: value
            }
          }
        };
      }
      return {
        ...prevData,
        [name]: value,
      };
    });
  };

  const isProfileChanged = useCallback(() => {
    if (!originalUserData || !userData) return false;
    return JSON.stringify(originalUserData) !== JSON.stringify(userData);
  }, [originalUserData, userData]);

  // Modify handleSubmit to encrypt card data before saving
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (user) {
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

  // Add this function to encrypt card data
  const encryptCardData = (card) => {
    const encryptionKey = process.env.NEXT_PUBLIC_CARD_ENCRYPTION_KEY || 'defaultKey';
    return {
      cardType: card.cardType,
      cardNumber: CryptoJS.AES.encrypt(card.cardNumber, encryptionKey).toString(),
      expirationDate: CryptoJS.AES.encrypt(card.expirationDate, encryptionKey).toString(),
      cvv: CryptoJS.AES.encrypt(card.cvv, encryptionKey).toString()
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

  const sendProfileUpdateEmail = async (user) => {
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
    if (isProfileChanged()) {
      try {
        const user = auth.currentUser;
        if (user) {
          await updateDoc(doc(db, "users", user.uid), userData);
          if (userData.password) {
            await updatePassword(user, userData.password);
          }
          await sendProfileUpdateEmail(user);
          router.push("/"); // Redirect to home page
        }
      } catch (err) {
        setError("Error updating profile");
        console.error(err);
      }
    } else {
      router.push("/"); // Just exit without saving if no changes
    }
  };

  const handleCancel = () => {
    router.push("/"); // Exit without saving
  };

  const containerStyle = {
    maxWidth: "1400px",
    minHeight: "600px",
    display: "flex",
    margin: "0 auto",
    padding: "0px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  };

  const sidebarStyle = {
    width: "250px",
    backgroundColor: "#f9f9f9",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    justifyContent: "space-between",
    display: "flex",
    flexDirection: "column",
  };

  const navButtonStyle = (isActive) => ({
    display: "block",
    padding: "10px",
    marginBottom: "10px",
    backgroundColor: isActive ? "#002f6c" : "#4a90e2",
    color: "#fff",
    borderRadius: "4px",
    cursor: "pointer",
    textAlign: "center",
  });

  const contentStyle = {
    flex: "1",
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "8px",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
    color: "#333",
  };

  const readOnlyInputStyle = {
    ...inputStyle,
    backgroundColor: "#f0f0f0",
    color: "#999",
    cursor: "not-allowed",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "5px",
    color: "#666",
  };

  const cardContainerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
  };

  const cardStyle = {
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  };

  const logoutButtonStyle = {
    backgroundColor: "#dc3545",
    color: "#fff",
    padding: "10px",
    borderRadius: "4px",
    cursor: "pointer",
    textAlign: "center",
    marginTop: "auto",
  };

  const saveAndExitButtonStyle = {
    backgroundColor: "#28a745",
    color: "#fff",
    padding: "10px",
    borderRadius: "4px",
    cursor: "pointer",
    textAlign: "center",
    marginBottom: "10px",
  };

  const cancelButtonStyle = {
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
                {isProfileChanged() && (
                  <button
                    type="button"
                    style={saveAndExitButtonStyle}
                    onClick={handleSaveAndExit}
                  >
                    Save and Exit
                  </button>
                )}
                <button
                  type="button"
                  style={logoutButtonStyle}
                  onClick={handleLogout}
                >
                  Logout
                </button>
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
                              name={`cardData.${cardId}.cardType`}
                              value={card.cardType.toLowerCase()} // Convert to lowercase for comparison
                              onChange={handleInputChange}
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
                              name={`cardData.${cardId}.cardNumber`}
                              value={card.cardNumber}
                              onChange={handleInputChange}
                            />

                            <label style={labelStyle} htmlFor={`expiryDate${index}`}>
                              Expiration Date
                            </label>
                            <input
                              style={inputStyle}
                              type="text"
                              id={`expiryDate${index}`}
                              name={`cardData.${cardId}.expirationDate`}
                              value={card.expirationDate}
                              onChange={handleInputChange}
                              placeholder="MM/YY"
                            />

                            <label style={labelStyle} htmlFor={`cvv${index}`}>
                              CVV
                            </label>
                            <input
                              style={inputStyle}
                              type="text"
                              id={`cvv${index}`}
                              name={`cardData.${cardId}.cvv`}
                              value={card.cvv}
                              onChange={handleInputChange}
                            />

                            <label style={labelStyle} htmlFor={`billingAddress${index}`}>
                              Billing Address
                            </label>
                            <input
                              style={inputStyle}
                              type="text"
                              id={`billingAddress${index}`}
                              name={`cardData.${cardId}.billingAddress`}
                              value={card.billingAddress}
                              onChange={handleInputChange}
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
                  <input
                    style={inputStyle}
                    type="text"
                    id="state"
                    name="address.state"
                    value={userData?.address?.state || ""}
                    onChange={handleInputChange}
                  />

                  <label style={labelStyle} htmlFor="zip">ZIP Code</label>
                  <input
                    style={inputStyle}
                    type="text"
                    id="zip"
                    name="address.zip"
                    value={userData?.address?.zip || ""}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
