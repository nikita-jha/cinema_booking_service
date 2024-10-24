"use client";

import { useState, useEffect } from "react";
import { updatePromotion } from "../lib/firebase/firestore";
import { IPromotion } from "@/models/promotion.model";

interface EditPromotionProps {
  promotion: IPromotion;
  onPromotionUpdated: () => void;
}

const EditPromotion: React.FC<EditPromotionProps> = ({ promotion, onPromotionUpdated }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [promotionData, setPromotionData] = useState<IPromotion>(promotion);

  useEffect(() => {
    setPromotionData(promotion);
  }, [promotion]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPromotionData({ ...promotionData, [name]: value });
  };

  const handleUpdatePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePromotion(promotion.id, promotionData);
      console.log("Promotion successfully updated!");
      onPromotionUpdated();
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error updating promotion:", error);
    }
  };

  return (
    <div className="mb-8 flex flex-col items-center">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2"
        onClick={() => setIsFormOpen(true)}
      >
        Edit
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
            <h3 className="text-lg font-bold mb-4">Edit Promotion</h3>
            <form onSubmit={handleUpdatePromotion}>
              <input
                type="text"
                name="discountCode"
                value={promotionData.discountCode}
                onChange={handleInputChange}
                placeholder="Promotion Code"
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
              <input
                type="number"
                name="value"
                value={promotionData.value}
                onChange={handleInputChange}
                placeholder="Discount Percentage"
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
              <input
                type="date"
                name="startDate"
                value={promotionData.startDate}
                onChange={handleInputChange}
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
              <input
                type="date"
                name="endDate"
                value={promotionData.endDate}
                onChange={handleInputChange}
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Update Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditPromotion;
