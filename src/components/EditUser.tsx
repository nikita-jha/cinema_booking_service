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
    setUserData({ ...userData, [name]: value });
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
    <div className="mb-8 flex justify-center">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => setIsFormOpen(true)}
      >
        Edit
      </button>

      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">Edit User</h3>
            <form onSubmit={handleUpdateUser}>
              <input
                type="text"
                name="userID"
                value={userData.userID}
                onChange={handleInputChange}
                placeholder="User ID"
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
                placeholder="Email"
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
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
