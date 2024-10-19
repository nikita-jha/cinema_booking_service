"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { auth, db } from '../../lib/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';

const EditProfilePage = () => {
    const [activeTab, setActiveTab] = useState('personal');
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        setUserData(userDoc.data());
                    } else {
                        setError('User data not found');
                    }
                } else {
                    setError('User not authenticated');
                }
            } catch (err) {
                setError('Error fetching user data');
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
        setUserData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = auth.currentUser;
            if (user) {
                await updateDoc(doc(db, 'users', user.uid), userData);
                if (userData.password) {
                    await updatePassword(user, userData.password);
                }
                alert('Profile updated successfully');
            }
        } catch (err) {
            setError('Error updating profile');
            console.error(err);
        }
    };

    const containerStyle = {
        maxWidth: '1400px',
        minHeight: '600px',
        display: "flex",
        margin: '0 auto',
        padding: '0px',
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
                            <button
                                type="button"
                                style={navButtonStyle(activeTab === 'personal')}
                                onClick={() => handleTabClick('personal')}
                            >
                                Personal Info
                            </button>
                            <button
                                type="button"
                                style={navButtonStyle(activeTab === 'payment')}
                                onClick={() => handleTabClick('payment')}
                            >
                                Payment Info
                            </button>
                            <button
                                type="button"
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
                                    <input style={inputStyle} type="text" id="firstName" name="firstName" value={userData.firstName} onChange={handleInputChange} />

                                    <label style={labelStyle} htmlFor="lastName">Last Name</label>
                                    <input style={inputStyle} type="text" id="lastName" name="lastName" value={userData.lastName} onChange={handleInputChange} />

                                    <label style={labelStyle} htmlFor="email">Email</label>
                                    <input style={inputStyle} type="email" id="email" value={userData.email} readOnly />

                                    <label style={labelStyle} htmlFor="password">New Password</label>
                                    <input style={inputStyle} type="password" id="password" name="password" placeholder="Enter new password" onChange={handleInputChange} />
                                </div>
                            )}

                            {activeTab === 'payment' && (
                                <div>
                                    <h2>Payment Information</h2>
                                    <div style={cardContainerStyle}>
                                        {userData.paymentCards.map((card, index) => (
                                            <div key={index} style={cardStyle}>
                                                <h3>Card {index + 1}</h3>

                                                <label style={labelStyle} htmlFor={`cardType${index}`}>Card Type</label>
                                                <select style={inputStyle} id={`cardType${index}`} name={`paymentCards.${index}.type`} value={card.type} onChange={handleInputChange}>
                                                    <option value="">Select Card Type</option>
                                                    <option value="visa">Visa</option>
                                                    <option value="mastercard">MasterCard</option>
                                                    <option value="amex">American Express</option>
                                                </select>

                                                <label style={labelStyle} htmlFor={`cardNumber${index}`}>Card Number</label>
                                                <input style={inputStyle} type="text" id={`cardNumber${index}`} name={`paymentCards.${index}.number`} value={card.number} onChange={handleInputChange} />

                                                <label style={labelStyle} htmlFor={`expiryDate${index}`}>Expiration Date</label>
                                                <input style={inputStyle} type="text" id={`expiryDate${index}`} name={`paymentCards.${index}.expiry`} value={card.expiry} onChange={handleInputChange} placeholder="MM/YY" />

                                                <label style={labelStyle} htmlFor={`billingAddress${index}`}>Billing Address</label>
                                                <input style={inputStyle} type="text" id={`billingAddress${index}`} name={`paymentCards.${index}.billingAddress`} value={card.billingAddress} onChange={handleInputChange} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'address' && (
                                <div>
                                    <h2>Home Address</h2>
                                    <label style={labelStyle} htmlFor="street">Street</label>
                                    <input style={inputStyle} type="text" id="street" name="address.street" value={userData.address.street} onChange={handleInputChange} />

                                    <label style={labelStyle} htmlFor="city">City</label>
                                    <input style={inputStyle} type="text" id="city" name="address.city" value={userData.address.city} onChange={handleInputChange} />

                                    <label style={labelStyle} htmlFor="state">State</label>
                                    <input style={inputStyle} type="text" id="state" name="address.state" value={userData.address.state} onChange={handleInputChange} />

                                    <label style={labelStyle} htmlFor="zip">ZIP Code</label>
                                    <input style={inputStyle} type="text" id="zip" name="address.zip" value={userData.address.zip} onChange={handleInputChange} />
                                </div>
                            )}
                        </div>
                    </div>
                    <button type="submit" className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditProfilePage;
