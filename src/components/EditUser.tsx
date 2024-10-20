"use client";

import { useState, useEffect } from "react";
import { updateUser } from "../lib/firebase/firestore";
import { IUser } from "@/models/user.model";

interface EditUserProps {
  user: IUser;
  onUserUpdated: () => void;
}

const EditUser: React.FC<EditUserProps> = ({ user, onUserUpdated }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [userData, setUserData] = useState<IUser>(user);

  useEffect(() => {
    setUserData(user);
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setUserData({
        ...userData,
        address: { ...userData.address, [addressField]: value },
      });
    } else {
      setUserData({ ...userData, [name]: value });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setUserData({ ...userData, [name]: checked });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser(user.id, userData);
      console.log("User successfully updated!");
      onUserUpdated();
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
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
            <h3 className="text-lg font-bold mb-4">Edit User</h3>
            <form onSubmit={handleUpdateUser}>
              <input
                type="text"
                name="firstName"
                value={userData.firstName}
                onChange={handleInputChange}
                placeholder="First Name"
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
              <input
                type="text"
                name="lastName"
                value={userData.lastName}
                onChange={handleInputChange}
                placeholder="Last Name"
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
              <input
                type="text"
                name="address.street"
                value={userData.address.street}
                onChange={handleInputChange}
                placeholder="Street"
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
              <input
                type="text"
                name="address.city"
                value={userData.address.city}
                onChange={handleInputChange}
                placeholder="City"
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
              <input
                type="text"
                name="address.state"
                value={userData.address.state}
                onChange={handleInputChange}
                placeholder="State"
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
              <input
                type="text"
                name="address.zip"
                value={userData.address.zip}
                onChange={handleInputChange}
                placeholder="ZIP Code"
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
              <input
                type="tel"
                name="phone"
                value={userData.phone}
                onChange={handleInputChange}
                placeholder="Phone Number"
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
              <div className="mb-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="promotionalEmails"
                    checked={userData.promotionalEmails}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  <span className="text-gray-800">Receive Promotional Emails</span>
                </label>
              </div>
              <select
                name="userType"
                value={userData.userType}
                onChange={handleInputChange}
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              >
                <option value="">Select User Type</option>
                <option value="Customer">Customer</option>
                <option value="Admin">Admin</option>
              </select>
              <div className="flex justify-end mt-4"> 
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditUser;
