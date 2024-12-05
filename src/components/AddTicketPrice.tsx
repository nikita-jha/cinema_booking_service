"use client";

import { useState } from "react";
import { addTicketPrice } from "../application/firebase/firestore";

interface AddTicketPriceProps {
  movieId: string;
  onClose: () => void;
  onTicketPriceAdded: () => void;
}

const AddTicketPrice: React.FC<AddTicketPriceProps> = ({ movieId, onTicketPriceAdded }) => {
  const [ticketPrices, setTicketPrices] = useState({
    child: "",
    adult: "",
    senior: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (Number(value) < 0) {
        setErrorMessage("Only positive numbers are allowed");
      } else {
        setErrorMessage(""); // Clear error if the input is valid
      }

    setTicketPrices({
      ...ticketPrices,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketPrices.child || !ticketPrices.adult || !ticketPrices.senior) {
      setErrorMessage("All fields are required");
      return;
    }
    setErrorMessage("");
    try {
      await addTicketPrice(movieId, ticketPrices);
      onTicketPriceAdded();
    } catch (error) {
      console.error('Error adding ticket prices:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
          onClick={onTicketPriceAdded} // Notify parent to close the form
        >
          &#10005;
        </button>
        <h3 className="text-lg font-bold mb-4">Add Ticket Prices</h3>
        {errorMessage && <p className="text-red-500 mb-2">{errorMessage}</p>}
        <form onSubmit={handleSubmit}>
        <label className="block mb-2">
            Child Ticket Price:
            <input
                type="number"
                name="child"
                value={ticketPrices.child}
                onChange={handleInputChange}
                className="mb-2 w-full p-2 border rounded text-gray-900"
            />
            </label>
          <label className="block mb-2">
            Adult Ticket Price:
            <input
              type="number"
              name="adult"
              value={ticketPrices.adult}
              onChange={handleInputChange}
              className="mb-2 w-full p-2 border rounded text-gray-900"
            />
          </label>
          <label>
            Senior Ticket Price:
            <input
              type="number"
              name="senior"
              value={ticketPrices.senior}
              onChange={handleInputChange}
              className="mb-2 w-full p-2 border rounded text-gray-900"
            />
          </label>
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Add Prices
          </button>
          <button type="button" onClick={onTicketPriceAdded} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-2">
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTicketPrice;
