"use client";

import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Link from "next/link";
import AddUser from "../../../components/AddUser";
import EditUser from "../../../components/EditUser";
import { IUser } from "../../../domain/user.model";
import { deleteUser, getUsers } from "../../../application/firebase/firestore"; 
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../application/firebase/config";
import useRequireAuth from '../../../components/RequireAuth';

const AdminPortalHomePage = () => {
  useRequireAuth();
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

  const toggleStatus = async (user: IUser) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    const userRef = doc(db, "users", user.id); 

    try {
      await updateDoc(userRef, { status: newStatus });
      console.log(`User status updated to: ${newStatus}`);
      await fetchUsers(); // Refresh the user list after status change
    } catch (error) {
      console.error("Error updating user status:", error);
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
          <h1 className="text-2xl font-semibold mb-4 text-gray-800">Manage Users</h1>
          <table className="min-w-full bg-white border border-gray-300 rounded-md shadow-sm">
            <thead className="bg-blue-100">
              <tr>
                <th className="py-2 px-4 text-left border-b text-gray-700">Email</th>
                <th className="py-2 px-4 text-left border-b text-gray-700">First Name</th>
                <th className="py-2 px-4 text-left border-b text-gray-700">Last Name</th>
                <th className="py-2 px-4 text-left border-b text-gray-700">Address</th>
                <th className="py-2 px-4 text-left border-b text-gray-700">Phone Number</th>
                <th className="py-2 px-4 text-left border-b text-gray-700">Promotional Emails</th>
                <th className="py-2 px-4 text-left border-b text-gray-700">User Type</th>
                <th className="py-2 px-4 text-left border-b text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b text-gray-800">{user.email}</td>
                  <td className="py-2 px-4 border-b text-gray-800">{user.firstName}</td>
                  <td className="py-2 px-4 border-b text-gray-800">{user.lastName}</td>
                  <td className="py-2 px-4 border-b text-gray-800">
                    {user.address?.street}, {user.address?.city}, {user.address?.state} {user.address?.zip}
                  </td>
                  <td className="py-2 px-4 border-b text-gray-800">{user.phone}</td>
                  <td className="py-2 px-4 border-b text-gray-800">{user.promotionalEmails ? 'Yes' : 'No'}</td>
                  <td className="py-2 px-4 border-b text-gray-800">{user.userType}</td>
                  <td className="py-2 px-4 border-b text-gray-800">
                    <div className="flex space-x-2">
                      <EditUser user={user} onUserUpdated={fetchUsers} />
                      <button
                        className={`${
                          user.status === "active" ? "bg-red-500 hover:bg-red-700" : "bg-green-500 hover:bg-green-700"
                        } text-white font-bold py-2 px-4 rounded`}
                        onClick={() => toggleStatus(user)}
                      >
                        {user.status === "active" ? "Deactivate" : "Activate"}
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