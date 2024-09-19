"use client";

import React, { useState } from "react";
import Navbar from '../../components/Navbar';

const RegisterPage = () => {
    const [activeTab, setActiveTab] = useState("personal");

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const containerStyle = {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    };

    const headerStyle = {
        textAlign: 'center',
        fontSize: '28px',
        color: '#333',
    };

    const navigationStyle = {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px',
    };

    const buttonStyle = (isActive) => ({
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: isActive ? '#002f6c' : '#4a90e2',
        color: '#fff',
        margin: '0 5px',
        cursor: 'pointer',
        fontSize: '16px',
    });

    const formStyle = {
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    };

    const inputStyle = {
        width: '100%',
        padding: '10px',
        marginBottom: '15px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '14px',
        color: '#333',
    };

    const labelStyle = {
        display: 'block',
        fontSize: '14px',
        color: '#666',
        marginBottom: '5px',
    };

    const cardContainerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '20px',
    };

    const cardStyle = {
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        padding: '15px',
        width: '100%',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
    };

    const submitButtonStyle = {
        width: '100%',
        padding: '12px',
        backgroundColor: '#4a90e2',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        cursor: 'pointer',
    };

    const addressStyle = {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
    };

    return (
        <div>
            <Navbar />
            <div style={containerStyle}>
            <h1 style={headerStyle}>Register</h1>

            {/* Navigation bar for the Register form */}
            <div style={navigationStyle}>
                <button
                    style={buttonStyle(activeTab === "personal")}
                    onClick={() => handleTabClick("personal")}
                >
                    Personal Info
                </button>
                <button
                    style={buttonStyle(activeTab === "payment")}
                    onClick={() => handleTabClick("payment")}
                >
                    Payment Info
                </button>
                <button
                    style={buttonStyle(activeTab === "address")}
                    onClick={() => handleTabClick("address")}
                >
                    Home Address
                </button>
            </div>

            {/* Fields for each page on Register */}
            <form style={formStyle}>
                {activeTab === "personal" && (
                    <div>
                        <h2>Personal Information</h2>
                        <label style={labelStyle} htmlFor="email">Email Address: *</label>
                        <input style={inputStyle} type="email" id="email" name="email" placeholder="Enter your email" required />

                        <label style={labelStyle} htmlFor="name">First Name: *</label>
                        <input style={inputStyle} type="text" id="name" name="name" placeholder="Enter your first name" required />

                        <label style={labelStyle} htmlFor="name">Last Name: *</label>
                        <input style={inputStyle} type="text" id="name" name="name" placeholder="Enter your last name" required />

                        <label style={labelStyle} htmlFor="password">Password: *</label>
                        <input style={inputStyle} type="password" id="password" name="password" placeholder="Enter your password" required />

                        <label style={labelStyle} htmlFor="phone">Phone Number: *</label>
                        <input style={inputStyle} type="text" id="phone" name="phone" placeholder="Enter your phone number" required />
                    </div>
                )}

                {activeTab === "payment" && (
                    <div>
                        <h2>Payment Information (Optional)</h2>
                        <div style={cardContainerStyle}>
                            {["Card 1", "Card 2", "Card 3"].map((cardLabel) => (
                                <div key={cardLabel} style={cardStyle}>
                                    <h3>{cardLabel}:</h3>
                                    <label style={labelStyle} htmlFor="cardType">Card Type:</label>
                                    <select style={inputStyle} id="cardType" name="cardType">
                                        <option value="">Select Card Type</option>
                                        <option value="visa">Visa</option>
                                        <option value="mastercard">MasterCard</option>
                                        <option value="amex">American Express</option>
                                    </select>

                                    <label style={labelStyle} htmlFor="cardName">Card Name:</label>
                                    <input style={inputStyle} type="text" id="cardName" name="cardName" placeholder="Enter the full name on your card" />

                                    <label style={labelStyle} htmlFor="cardNumber">Card Number:</label>
                                    <input style={inputStyle} type="text" id="cardNumber" name="cardNumber" placeholder="Enter the card number" />

                                    <label style={labelStyle} htmlFor="expiryDate">Expiration Date:</label>
                                    <input style={inputStyle} type="text" id="expiryDate" name="expiryDate" placeholder="MM/YY" />

                                    <label style={labelStyle} htmlFor="billingAddress">Billing Address:</label>
                                    <input style={inputStyle} type="text" id="billingAddress" name="billingAddress" placeholder="Enter your billing address" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "address" && (
                    <div>
                        <h2>Home Address (Optional)</h2>
                        <div style={addressStyle}>
                            <div>
                                <label style={labelStyle} htmlFor="street">Street:</label>
                                <input style={inputStyle} type="text" id="street" name="street" placeholder="Enter your street address" />
                            </div>

                            <div>
                                <label style={labelStyle} htmlFor="city">City:</label>
                                <input style={inputStyle} type="text" id="city" name="city" placeholder="Enter your city" />
                            </div>

                            <div>
                                <label style={labelStyle} htmlFor="state">State:</label>
                                <input style={inputStyle} type="text" id="state" name="state" placeholder="Enter your state" />
                            </div>

                            <div>
                                <label style={labelStyle} htmlFor="zip">ZIP Code:</label>
                                <input style={inputStyle} type="text" id="zip" name="zip" placeholder="Enter your zip code" />
                            </div>
                        </div>
                    </div>
                )}
            </form>
            <button type="submit" style={submitButtonStyle}>Submit</button>
        </div>
        </div>
    );
};

export default RegisterPage;
