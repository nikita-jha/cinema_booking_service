"use client";

import React, { useState, useEffect } from "react";
import Navbar from '../../components/Navbar';
import { registerUser } from '../../lib/firebase/firestore'; // Import the registration function

const RegisterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    promotionalEmails: false,
  });
  const [cardData, setCardData] = useState([
    { cardType: "", cardNumber: "", expirationDate: "", cvv: "" },
    { cardType: "", cardNumber: "", expirationDate: "", cvv: "" },
    { cardType: "", cardNumber: "", expirationDate: "", cvv: "" },
  ]);
  const [validationMessages, setValidationMessages] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    cardNumber: "",
    expirationDate: "",
    cvv: "",
  });
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    validateForm();
  }, [formData, cardData]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
    validateField(name, value);
  };

  const handleCardInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedCardData = [...cardData];
    updatedCardData[index] = { ...updatedCardData[index], [name]: value };
    setCardData(updatedCardData);
    validateCardField(index, name, value);
  };

  const validateField = (name: string, value: string) => {
    let message = "";
    switch (name) {
      case "firstName":
      case "lastName":
        if (!/^[a-zA-Z]+$/.test(value)) {
          message = "Only letters are allowed.";
        }
        break;
      case "email":
        if (!/@/.test(value)) {
          message = "Email should contain the @ sign.";
        }
        break;
      case "password":
        if (!/(?=.*[0-9])(?=.*[a-zA-Z])/.test(value)) {
          message = "Password should contain letters and at least one number.";
        } else if (value.length < 6) {            
          message = "Password should be at least 6 characters long.";
        }
        break;
      case "zip":
        if (!/^\d{5}$/.test(value)) {
          message = "ZIP code should be exactly 5 digits.";
        }
          break;
      case "phone":
        if (!/^\d{10}$/.test(value)) {
          message = "Phone number should be exactly 10 digits.";
        }
        break;
      default:
        break;
    }
    setValidationMessages((prevMessages) => ({
      ...prevMessages,
      [name]: message,
    }));
  };

  const validateCardField = (index: number, name: string, value: string) => {
    let message = "";
    switch (name) {
      case "cardNumber":
        if (cardData[index].cardType === "visa" || cardData[index].cardType === "mastercard") {
          if (!/^\d{16}$/.test(value)) {
            message = "Card number should have 16 digits.";
          }
        } else if (cardData[index].cardType === "amex") {
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
        if (cardData[index].cardType === "visa" || cardData[index].cardType === "mastercard") {
          if (!/^\d{3}$/.test(value)) {
            message = "CVV should have 3 digits.";
          }
        } else if (cardData[index].cardType === "amex") {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!isFormValid) {
      console.log('Form is not valid');
      return;
    }

    // Call registerUser from firestore.ts and pass formData
    try {
      await registerUser({ ...formData, cardData });
      console.log('User registered successfully!');
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  const validateForm = () => {
    const { email, firstName, lastName, password, phone } = formData;
    const isValid = email && firstName && lastName && password && phone &&
      !validationMessages.email && !validationMessages.firstName &&
      !validationMessages.lastName && !validationMessages.password &&
      !validationMessages.phone;
    setIsFormValid(isValid);
  };

  const handleNext = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (isFormValid) {
      if (activeTab === "personal") {
        setActiveTab("payment");
      } else if (activeTab === "payment") {
        setActiveTab("address");
      }
    }
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

  const buttonStyle = (isActive: boolean) => ({
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

  const nextButtonStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: isFormValid ? '#4a90e2' : '#ccc',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: isFormValid ? 'pointer' : 'not-allowed',
  };

  const submitButtonStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: isFormValid ? '#4a90e2' : '#ccc',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: isFormValid ? 'pointer' : 'not-allowed',
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
        <form style={formStyle} onSubmit={handleSubmit}>
          {activeTab === "personal" && (
            <div>
              <h2>Personal Information</h2>
              <label style={labelStyle} htmlFor="email">Email Address: *</label>
              <input
                style={inputStyle}
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              {validationMessages.email && <p className="text-red-500 text-sm mt-1">{validationMessages.email}</p>}

              <label style={labelStyle} htmlFor="firstName">First Name: *</label>
              <input
                style={inputStyle}
                type="text"
                id="firstName"
                name="firstName"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
              {validationMessages.firstName && <p className="text-red-500 text-sm mt-1">{validationMessages.firstName}</p>}

              <label style={labelStyle} htmlFor="lastName">Last Name: *</label>
              <input
                style={inputStyle}
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
              {validationMessages.lastName && <p className="text-red-500 text-sm mt-1">{validationMessages.lastName}</p>}

              <label style={labelStyle} htmlFor="password">Password: *</label>
              <input
                style={inputStyle}
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              {validationMessages.password && <p className="text-red-500 text-sm mt-1">{validationMessages.password}</p>}

              <label style={labelStyle} htmlFor="phone">Phone Number: *</label>
              <input
                style={inputStyle}
                type="text"
                id="phone"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
              {validationMessages.phone && <p className="text-red-500 text-sm mt-1">{validationMessages.phone}</p>}

              <button type="button" style={nextButtonStyle} onClick={handleNext} disabled={!isFormValid}>
                Next
              </button>
            </div>
          )}

          {activeTab === "payment" && (
            <div>
              <h2>Payment Information (Optional)</h2>
              <div style={cardContainerStyle}>
                {cardData.map((card, index) => (
                  <div key={index} style={cardStyle}>
                    <h3>Card {index + 1}:</h3>
                    <label style={labelStyle} htmlFor={`cardType${index}`}>Card Type:</label>
                    <select
                      style={inputStyle}
                      id={`cardType${index}`}
                      name="cardType"
                      value={card.cardType}
                      onChange={(e) => handleCardInputChange(index, e)}
                    >
                      <option value="">Select Card Type</option>
                      <option value="visa">Visa</option>
                      <option value="mastercard">MasterCard</option>
                      <option value="amex">American Express</option>
                    </select>

                    <label style={labelStyle} htmlFor={`cardNumber${index}`}>Card Number:</label>
                    <input
                      style={inputStyle}
                      type="text"
                      id={`cardNumber${index}`}
                      name="cardNumber"
                      placeholder="Enter the card number"
                      value={card.cardNumber}
                      onChange={(e) => handleCardInputChange(index, e)}
                    />
                    {validationMessages[`card${index}_cardNumber`] && <p className="text-red-500 text-sm mt-1">{validationMessages[`card${index}_cardNumber`]}</p>}

                    <label style={labelStyle} htmlFor={`expirationDate${index}`}>Expiration Date:</label>
                    <input
                      style={inputStyle}
                      type="text"
                      id={`expirationDate${index}`}
                      name="expirationDate"
                      placeholder="MM/YY"
                      value={card.expirationDate}
                      onChange={(e) => handleCardInputChange(index, e)}
                    />
                    {validationMessages[`card${index}_expirationDate`] && <p className="text-red-500 text-sm mt-1">{validationMessages[`card${index}_expirationDate`]}</p>}

                    <label style={labelStyle} htmlFor={`cvv${index}`}>CVV:</label>
                    <input
                      style={inputStyle}
                      type="text"
                      id={`cvv${index}`}
                      name="cvv"
                      placeholder="Enter CVV"
                      value={card.cvv}
                      onChange={(e) => handleCardInputChange(index, e)}
                    />
                    {validationMessages[`card${index}_cvv`] && <p className="text-red-500 text-sm mt-1">{validationMessages[`card${index}_cvv`]}</p>}

                    <label style={labelStyle} htmlFor={`billingAddress${index}`}>Billing Address:</label>
                    <input
                      style={inputStyle}
                      type="text"
                      id={`billingAddress${index}`}
                      name="billingAddress"
                      placeholder="Enter your billing address"
                    />
                  </div>
                ))}
              </div>
              <button type="button" style={nextButtonStyle} onClick={handleNext}>
                Next
              </button>
            </div>
          )}

          {activeTab === "address" && (
            <div>
              <h2>Home Address (Optional)</h2>
              <div style={addressStyle}>
                <div>
                  <label style={labelStyle} htmlFor="street">Street:</label>
                  <input
                    style={inputStyle}
                    type="text"
                    id="street"
                    name="street"
                    placeholder="Enter your street address"
                    value={formData.street}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label style={labelStyle} htmlFor="city">City:</label>
                  <input
                    style={inputStyle}
                    type="text"
                    id="city"
                    name="city"
                    placeholder="Enter your city"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label style={labelStyle} htmlFor="state">State:</label>
                  <select
                    style={inputStyle}
                    id="state"
                    name="state"
                    value={formData.state}
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
                </div>

                <div>
                  <label style={labelStyle} htmlFor="zip">ZIP Code:</label>
                  <input
                    style={inputStyle}
                    type="text"
                    id="zip"
                    name="zip"
                    placeholder="Enter your zip code"
                    value={formData.zip}
                    onChange={handleInputChange}
                  />
                  {validationMessages.zip && <p className="text-red-500 text-sm mt-1">{validationMessages.zip}</p>}
                </div>
              </div>
              <div style={{ marginTop: '20px' }}>
                <label style={labelStyle} htmlFor="promotionalEmails">
                  <input
                    type="checkbox"
                    id="promotionalEmails"
                    name="promotionalEmails"
                    checked={formData.promotionalEmails}
                    onChange={handleInputChange}
                  />
                  <span style={{ marginLeft: '8px' }}>Sign up for promotional emails</span>
                </label>
              </div>
              <button type="submit" style={submitButtonStyle} disabled={!isFormValid}>
                Submit
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;