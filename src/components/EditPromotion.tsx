"use client";

import { useState } from "react";
import { updatePromotion } from "../application/firebase/firestore";
import { IPromotion } from "@/domain/promotion.model";

interface EditPromotionProps {
  promotion: IPromotion;
  onPromotionUpdated: () => void;
  disabled?: boolean;
}

const EditPromotion: React.FC<EditPromotionProps> = ({
  promotion,
  onPromotionUpdated,
  disabled = false
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editData, setEditData] = useState(promotion);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePromotion(promotion.id, editData);
      onPromotionUpdated();
      setIsFormOpen(false);
    } catch (err) {
      setError("Failed to update promotion");
      console.error(err);
    }
  };

  return (
    <div className="mb-8 flex flex-col items-center">
      <div className="group relative inline-block">
        <button
          className={`bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded 
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => setIsFormOpen(true)}
          disabled={disabled}
        >
          Edit
        </button>
        {disabled && (
          <div className="invisible group-hover:visible absolute z-10 w-48 p-2 mt-2 text-sm 
            text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 
            transition-opacity duration-300">
            Cannot edit: Emails have been sent
          </div>
        )}
      </div>

      {isFormOpen && !disabled && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">Edit Promotion</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="discountCode"
                value={editData.discountCode}
                onChange={handleInputChange}
                className="mb-2 w-full p-2 border rounded"
                placeholder="Discount Code"
                required
              />
              <input
                type="text"
                name="value"
                value={editData.value}
                onChange={handleInputChange}
                className="mb-2 w-full p-2 border rounded"
                placeholder="Value"
                required
              />
              <input
                type="date"
                name="startDate"
                value={editData.startDate}
                onChange={handleInputChange}
                className="mb-2 w-full p-2 border rounded"
                required
              />
              <input
                type="date"
                name="endDate"
                value={editData.endDate}
                onChange={handleInputChange}
                className="mb-2 w-full p-2 border rounded"
                required
              />
              {error && <p className="text-red-500 mb-2">{error}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Save
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
