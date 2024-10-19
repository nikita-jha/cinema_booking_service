"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../../components/Navbar";
import { auth, db } from "../../lib/firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updatePassword, signOut, sendEmailVerification } from "firebase/auth";
import { useRouter } from "next/navigation";
import ChangePassword from "../../components/ChangePassword";

const EditProfilePage = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [originalUserData, setOriginalUserData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setOriginalUserData(data);
            setUserData(data);
          } else {
            setError("User data not found");
          }
        } else {
          setError("User not authenticated");
        }
      } catch (err) {
        setError("Error fetching user data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const isProfileChanged = useCallback(() => {
    if (!originalUserData || !userData) return false;
    return JSON.stringify(originalUserData) !== JSON.stringify(userData);
  }, [originalUserData, userData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, "users", user.uid), userData);
        if (userData.password) {
          await updatePassword(user, userData.password);
        }
      }
    } catch (err) {
      setError("Error updating profile");
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Redirect to home page or login page after logout
      window.location.href = "/";
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
      alert(data.message);
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
    color: "#999",
  };

  const readOnlyInputStyle = {
    ...inputStyle,
    backgroundColor: "#f0f0f0",
    color: "#999", // Changed from '#ccc' to '#999' for a lighter text color
    cursor: "not-allowed",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "5px",
    color: "#666", // Changed from '#666' to '#333' for darker text
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
    backgroundColor: "#dc3545", // Red color
    color: "#fff",
    padding: "10px",
    borderRadius: "4px",
    cursor: "pointer",
    textAlign: "center",
    marginTop: "auto", // Push the button to the bottom
  };

  const saveAndExitButtonStyle = {
    backgroundColor: "#28a745", // Green color
    color: "#fff",
    padding: "10px",
    borderRadius: "4px",
    cursor: "pointer",
    textAlign: "center",
    marginBottom: "10px", // Add some space between buttons
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <Navbar isLoggedIn={true} />
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
                  style={{ ...saveAndExitButtonStyle, marginBottom: "10px" }}
                  onClick={handleSaveAndExit}
                >
                  {isProfileChanged() ? "Save and Exit" : "Cancel"}
                </button>
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
                    value={userData.firstName}
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
                    value={userData.lastName}
                    onChange={handleInputChange}
                  />

                  <label style={labelStyle} htmlFor="email">
                    Email
                  </label>
                  <input
                    style={readOnlyInputStyle}
                    type="email"
                    id="email"
                    value={userData.email}
                    readOnly
                  />

                  <ChangePassword />
                </div>
              )}

              {activeTab === "payment" && (
                <div>
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

                            <label
                              style={labelStyle}
                              htmlFor={`cardType${index}`}
                            >
                              Card Type
                            </label>
                            <select
                              style={inputStyle}
                              id={`cardType${index}`}
                              name={`cardData.${cardId}.type`}
                              value={card.type}
                              onChange={handleInputChange}
                            >
                              <option value="">Select Card Type</option>
                              <option value="visa">Visa</option>
                              <option value="mastercard">MasterCard</option>
                              <option value="amex">American Express</option>
                            </select>

                            <label
                              style={labelStyle}
                              htmlFor={`cardNumber${index}`}
                            >
                              Card Number
                            </label>
                            <input
                              style={inputStyle}
                              type="text"
                              id={`cardNumber${index}`}
                              name={`cardData.${cardId}.number`}
                              value={card.number}
                              onChange={handleInputChange}
                            />

                            <label
                              style={labelStyle}
                              htmlFor={`expiryDate${index}`}
                            >
                              Expiration Date
                            </label>
                            <input
                              style={inputStyle}
                              type="text"
                              id={`expiryDate${index}`}
                              name={`cardData.${cardId}.expiry`}
                              value={card.expiry}
                              onChange={handleInputChange}
                              placeholder="MM/YY"
                            />

                            <label
                              style={labelStyle}
                              htmlFor={`billingAddress${index}`}
                            >
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
                  <h2 style={{ color: "#333", fontWeight: "bold" }}>
                    Home Address
                  </h2>
                  <label style={labelStyle} htmlFor="street">
                    Street
                  </label>
                  <input
                    style={inputStyle}
                    type="text"
                    id="street"
                    name="address.street"
                    value={userData.address.street}
                    onChange={handleInputChange}
                  />

                  <label style={labelStyle} htmlFor="city">
                    City
                  </label>
                  <input
                    style={inputStyle}
                    type="text"
                    id="city"
                    name="address.city"
                    value={userData.address.city}
                    onChange={handleInputChange}
                  />

                  <label style={labelStyle} htmlFor="state">
                    State
                  </label>
                  <input
                    style={inputStyle}
                    type="text"
                    id="state"
                    name="address.state"
                    value={userData.address.state}
                    onChange={handleInputChange}
                  />

                  <label style={labelStyle} htmlFor="zip">
                    ZIP Code
                  </label>
                  <input
                    style={inputStyle}
                    type="text"
                    id="zip"
                    name="address.zip"
                    value={userData.address.zip}
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
