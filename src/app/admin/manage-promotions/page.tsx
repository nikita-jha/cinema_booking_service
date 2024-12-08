"use client";

import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import AddPromotion from "../../../components/AddPromotion";
import EditPromotion from "../../../components/EditPromotion";
import { IPromotion } from "../../../domain/promotion.model";
import { deletePromotion, getPromotions, updatePromotion, sendPromotionEmails } from "../../../application/firebase/firestore";
import useRequireAuth from '../../../components/RequireAuth';

const ManagePromotionsPage = () => {
  useRequireAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [promotions, setPromotions] = useState<IPromotion[]>([]);

  const fetchPromotions = async () => {
    setIsLoading(true);
    try {
      const promotionsData = await getPromotions();
      setPromotions(promotionsData);
    } catch (error) {
      console.error("Error fetching promotions:", error);
    }
    setIsLoading(false);
  };

  const deleteCallback = async (id: string) => {
    console.log(
      "%c🚨 Deleting promotion with ID: " + id,
      "color: red; font-size: 20px; font-weight: bold; background-color: yellow; padding: 10px;"
    );
    try {
      await deletePromotion(id);
      console.log("Deleting promotion with id:", id);
      await fetchPromotions();
    } catch (error) {
      console.error("Error deleting promotion:", error);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-semibold mb-4 text-gray-800">
            Manage Promotions
          </h1>
          <table className="min-w-full bg-white border border-gray-300 rounded-md shadow-sm">
            <thead className="bg-blue-100">
              <tr>
                <th className="py-2 px-4 text-left border-b text-gray-700">
                  Discount Code
                </th>
                <th className="py-2 px-4 text-left border-b text-gray-700">
                  Value
                </th>
                <th className="py-2 px-4 text-left border-b text-gray-700">
                  Start Date
                </th>
                <th className="py-2 px-4 text-left border-b text-gray-700">
                  End Date
                </th>
                <th className="py-2 px-4 text-left border-b text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promotion) => (
                <tr key={promotion.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b text-gray-800">
                    {promotion.discountCode}
                  </td>
                  <td className="py-2 px-4 border-b text-gray-800">
                    {promotion.value}
                  </td>
                  <td className="py-2 px-4 border-b text-gray-800">
                    {promotion.startDate}
                  </td>
                  <td className="py-2 px-4 border-b text-gray-800">
                    {promotion.endDate}
                  </td>
                  <td className="py-2 px-4 border-b text-gray-800">
                    <div className="flex space-x-2">
                      <EditPromotion
                        promotion={promotion}
                        onPromotionUpdated={fetchPromotions}
                        disabled={promotion.emailSent}
                      />
                      <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => deleteCallback(promotion.id)}
                      >
                        Delete
                      </button>
                      {!promotion.emailSent && (
                        <button
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                          onClick={async () => {
                            try {
                              await sendPromotionEmails(promotion);
                              await updatePromotion(promotion.id, { emailSent: true });
                              await fetchPromotions();
                            } catch (error) {
                              console.error("Error sending emails:", error);
                            }
                          }}
                        >
                          Send Email
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4">
            <AddPromotion onPromotionAdded={fetchPromotions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagePromotionsPage;
