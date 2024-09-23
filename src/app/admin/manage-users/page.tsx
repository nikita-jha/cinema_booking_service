"use client";

import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Link from "next/link";
import AddUser from "../../../components/AddUser";
import EditUser from "../../../components/EditUser";
import { IUser } from "../../../models/user.model";
import { deleteUser, getUsers } from "../../../lib/firebase/firestore"; // Assuming this is the correct path to your firestore utility

const AdminPortalHomePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<IUser[]>([]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setIsLoading(false);
  };

  const deleteCallback = async (id: string) => {
    console.log(
      "%c🚨 Deleting user with ID: " + id,
      "color: red; font-size: 20px; font-weight: bold; background-color: yellow; padding: 10px;"
    );
    try {
      await deleteUser(id);
      console.log("Deleting user with id:", id);
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-semibold mb-4 text-gray-800">
            Manage Users
          </h1>
          <table className="min-w-full bg-white border border-gray-300 rounded-md shadow-sm">
            <thead className="bg-blue-100">
              <tr>
                <th className="py-2 px-4 text-left border-b text-gray-700">
                  UserID
                </th>
                <th className="py-2 px-4 text-left border-b text-gray-700">
                  First Name
                </th>
                <th className="py-2 px-4 text-left border-b text-gray-700">
                  Last Name
                </th>
                <th className="py-2 px-4 text-left border-b text-gray-700">
                  Email
                </th>
                <th className="py-2 px-4 text-left border-b text-gray-700">
                  User Type
                </th>
                <th className="py-2 px-4 text-left border-b text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b text-gray-800">
                    {user.userID}
                  </td>
                  <td className="py-2 px-4 border-b text-gray-800">
                    {user.firstName}
                  </td>
                  <td className="py-2 px-4 border-b text-gray-800">
                    {user.lastName}
                  </td>
                  <td className="py-2 px-4 border-b text-gray-800">
                    {user.email}
                  </td>
                  <td className="py-2 px-4 border-b text-gray-800">
                    {user.userType}
                  </td>
                  <td className="py-2 px-4 border-b text-gray-800">
                    <div className="flex space-x-2">
                      <EditUser user={user} onUserUpdated={fetchUsers} />
                      <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => deleteCallback(user.id)}
                      >
                        Delete
                      </button>
                      <button className="text-red-500 hover:text-red-700">
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4">
            <AddUser onUserAdded={fetchUsers} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPortalHomePage;
