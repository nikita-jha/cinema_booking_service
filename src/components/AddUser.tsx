"use client";

import { useState } from "react";
import { addUser } from "../lib/firebase/firestore";

interface AddUserProps {
  onUserAdded: () => void; // Callback to notify when a user is added
}

const AddUser: React.FC<AddUserProps> = ({ onUserAdded }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [userData, setUserData] = useState({
    userID: "",
    email: "",
    firstName: "",
    lastName: "",
    userType: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addUser(userData); // Add the user to Firestore
      console.log("User successfully added!");
      onUserAdded(); // Notify parent to re-fetch users
      setIsFormOpen(false); // Close the form after adding
        setUserData({
        userID: "",
        email: "",
        firstName: "",
        lastName: "",
        userType: "",
      }); // Reset the form fields
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  return (
    <div className="mb-8 flex justify-center">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => setIsFormOpen(true)}
      >
        Add User
      </button>

      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">Add New User</h3>
            <form onSubmit={handleAddUser}>
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
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddUser;
