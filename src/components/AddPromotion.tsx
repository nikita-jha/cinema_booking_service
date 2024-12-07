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
    emailSent: false
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPromotionData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleAddPromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const newPromotion = {
        ...promotionData,
        emailSent: sendEmail
      };

      await addPromotion(newPromotion);
      onPromotionAdded(); // Refresh promotions list
      setIsFormOpen(false);
      setPromotionData({
        discountCode: "",
        value: "",
        startDate: "",
        endDate: "",
        emailSent: false
      });
    } catch (err) {
      setError("Failed to add promotion. Please try again.");
      console.error("Error adding promotion:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSendEmail(e.target.checked);
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
                  disabled={isSubmitting}
                  className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded
                    ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Adding...' : 'Add Promotion'}
                </button>
              </div>
            </form>
            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                id="sendEmail"
                checked={sendEmail}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600"
              />
              <label htmlFor="sendEmail" className="ml-2 text-gray-700">
                Send email to subscribers
              </label>
            </div>
            {error && <div className="text-red-500 mt-2">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddPromotion;
