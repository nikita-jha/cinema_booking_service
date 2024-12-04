import validator from 'validator';

// Credit card validation functions
export const validateCreditCardInfo = (cardInfo: {
  cardNumber: string;
  cvv: string;
  expirationDate: string;
  billingAddress: string;
}) => {
  const errors: string[] = [];

  // Card Number Validation
  if (!validator.isCreditCard(cardInfo.cardNumber)) {
    errors.push("Invalid credit card number");
  }

  // CVV Validation (3-4 digits)
  if (!/^\d{3,4}$/.test(cardInfo.cvv)) {
    errors.push("Invalid CVV");
  }

  // Expiration Date Validation (MM/YY format)
  const currentDate = new Date();
  const [month, year] = cardInfo.expirationDate.split('/').map(Number);
  const expirationDate = new Date(2000 + year, month - 1);
  
  if (
    !/^\d{2}\/\d{2}$/.test(cardInfo.expirationDate) || 
    expirationDate <= currentDate
  ) {
    errors.push("Invalid or expired card");
  }

  // Billing Address Validation
  if (!validator.isLength(cardInfo.billingAddress, { min: 5, max: 100 })) {
    errors.push("Invalid billing address");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input: string) => {
  return validator.escape(input.trim());
};