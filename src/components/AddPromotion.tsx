"use client";

import { useState } from "react";
import { addPromotion } from "../application/firebase/firestore";

interface AddPromotionProps {
  onPromotionAdded: () => void; // Callback to notify when a promotion is added
}

const AddPromotion: React.FC<AddPromotionProps> = ({ onPromotionAdded }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [promotionData, setPromotionData] = useState({
    discountCode: "",
    value: "",
    startDate: "",
    endDate: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPromotionData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleAddPromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addPromotion(promotionData); // Add the promotion to Firestore
      console.log("Promotion successfully added!");
      onPromotionAdded(); // Notify parent to re-fetch promotions
      setIsFormOpen(false); // Close the form after adding
      setPromotionData({
        discountCode: "",
        value: "",
        startDate: "",
        endDate: "",
      }); // Reset the form fields
    } catch (error) {
      console.error("Error adding promotion:", error);
    }
  };

  return (
    <div className="mb-8 flex justify-center">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => {
          console.log("Form is set to open");
          setIsFormOpen(true);
        }}
      >
        Add Promotion
      </button>

      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={() => setIsFormOpen(false)}
            >
              &#10005;
            </button>
            <h3 className="text-lg font-bold mb-4">Add New Promotion</h3>
            <form onSubmit={handleAddPromotion}>
              <input
                type="text"
                name="discountCode"
                value={promotionData.discountCode}
                onChange={handleInputChange}
                placeholder="Promotion Code *"
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
              <input
                type="number"
                name="value"
                value={promotionData.value}
                onChange={handleInputChange}
                placeholder="Discount Percentage *"
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
              <input
                type="date"
                name="startDate"
                value={promotionData.startDate}
                onChange={handleInputChange}
                placeholder="Start Date *"
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
              <input
                type="date"
                name="endDate"
                value={promotionData.endDate}
                onChange={handleInputChange}
                placeholder="End Date *"
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="mr-2 px-4 py-2 bg-gray-300 text-gray-800 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Add Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddPromotion;
