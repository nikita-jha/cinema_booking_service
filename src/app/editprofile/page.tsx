"use client";

import React, { useState } from 'react';
import Navbar from '../../components/Navbar';

const EditProfilePage = () => {
    const [activeTab, setActiveTab] = useState('personal');

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const containerStyle = {
        maxWidth: '1400px',  // Increased max width
        minHeight: '600px',
        display: "flex",
        margin: '0 auto',
        padding: '0px',    // Increased padding
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    };

    const sidebarStyle = {
        width: '250px',
        backgroundColor: '#f9f9f9',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        justifyContent: 'space-between',
    };

    const navButtonStyle = (isActive) => ({
        display: 'block',
        padding: '10px',
        marginBottom: '10px',
        backgroundColor: isActive ? '#002f6c' : '#4a90e2',
        color: '#fff',
        borderRadius: '4px',
        cursor: 'pointer',
        textAlign: 'center',
    });

    const contentStyle = {
        flex: '1',
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '8px',
    };

    const inputStyle = {
        width: '100%',
        padding: '10px',
        marginBottom: '15px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '14px',
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '5px',
        color: '#666',
    };

    const cardContainerStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
    };

    const cardStyle = {
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    };

    return (
        <div>
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-center">Edit Profile</h1>

                <div style={containerStyle}>
                    {/* Sidebar */}
                    <div style={sidebarStyle}>
                        <button
                            style={navButtonStyle(activeTab === 'personal')}
                            onClick={() => handleTabClick('personal')}
                        >
                            Personal Info
                        </button>
                        <button
                            style={navButtonStyle(activeTab === 'payment')}
                            onClick={() => handleTabClick('payment')}
                        >
                            Payment Info
                        </button>
                        <button
                            style={navButtonStyle(activeTab === 'address')}
                            onClick={() => handleTabClick('address')}
                        >
                            Home Address
                        </button>
                    </div>

                    {/* Content */}
                    <div style={contentStyle}>
                        {activeTab === 'personal' && (
                            <div>
                                <h2>Personal Information</h2>
                                <label style={labelStyle} htmlFor="firstName">First Name</label>
                                <input style={inputStyle} type="text" id="firstName" placeholder="Edit your first name" />

                                <label style={labelStyle} htmlFor="lastName">Last Name</label>
                                <input style={inputStyle} type="text" id="lastName" placeholder="Edit your last name" />

                                <label style={labelStyle} htmlFor="email">Email</label>
                                <input style={inputStyle} type="email" id="email" placeholder="Edit your email" />

                                <label style={labelStyle} htmlFor="password">Password</label>
                                <input style={inputStyle} type="password" id="password" placeholder="Edit your password" />
                            </div>
                        )}

                        {activeTab === 'payment' && (
                            <div>
                                <h2>Payment Information</h2>
                                <div style={cardContainerStyle}>
                                    {["Card 1", "Card 2", "Card 3"].map((cardLabel, index) => (
                                        <div key={index} style={cardStyle}>
                                            <h3>{cardLabel}</h3>

                                            <label style={labelStyle} htmlFor={`cardType${index}`}>Card Type</label>
                                            <select style={inputStyle} id={`cardType${index}`}>
                                                <option value="">Select Card Type</option>
                                                <option value="visa">Visa</option>
                                                <option value="mastercard">MasterCard</option>
                                                <option value="amex">American Express</option>
                                            </select>

                                            <label style={labelStyle} htmlFor={`cardNumber${index}`}>Card Number</label>
                                            <input style={inputStyle} type="text" id={`cardNumber${index}`} placeholder="Edit your card number" />

                                            <label style={labelStyle} htmlFor={`expiryDate${index}`}>Expiration Date</label>
                                            <input style={inputStyle} type="text" id={`expiryDate${index}`} placeholder="MM/YY" />

                                            <label style={labelStyle} htmlFor={`billingAddress${index}`}>Billing Address</label>
                                            <input style={inputStyle} type="text" id={`billingAddress${index}`} placeholder="Edit billing address" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'address' && (
                            <div>
                                <h2>Home Address</h2>
                                <label style={labelStyle} htmlFor="street">Street</label>
                                <input style={inputStyle} type="text" id="street" placeholder="Edit your street address" />

                                <label style={labelStyle} htmlFor="city">City</label>
                                <input style={inputStyle} type="text" id="city" placeholder="Edit your city" />

                                <label style={labelStyle} htmlFor="state">State</label>
                                <input style={inputStyle} type="text" id="state" placeholder="Edit your state" />

                                <label style={labelStyle} htmlFor="zip">ZIP Code</label>
                                <input style={inputStyle} type="text" id="zip" placeholder="Edit your zip code" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProfilePage;
