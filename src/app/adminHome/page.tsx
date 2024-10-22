"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase/config"; // Import auth and db from Firebase config
import { onAuthStateChanged } from "firebase/auth"; // Firebase Auth
import { doc, getDoc } from "firebase/firestore"; // Firebase Firestore
import Navbar from "../../components/Navbar";
import Link from "next/link";
import useRequireAuth from '../../components/RequireAuth';

const AdminPortalHomePage = () => {
  useRequireAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false); // Track if user is an admin
  const [isLoading, setIsLoading] = useState(true); // Track loading state

  // Function to check if the user is an admin
  const checkAdminRole = async (userId: string) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.userType.toLowerCase() === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }
    } catch (error) {
      console.error("Error checking admin role:", error);
    } finally {
      setIsLoading(false); // Stop loading once the role is checked
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        checkAdminRole(user.uid); // Check if logged-in user is an admin
      } else {
        setIsAdmin(false); // User is not authenticated
        setIsLoading(false); // Stop loading if no user is logged in
        router.push("/login"); // Redirect to login if not authenticated
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAdmin) {
    // Redirect or show forbidden message if user is not an admin
    return (
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-3xl font-bold text-red-500">Access Forbidden</h1>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="header relative">
          <h1 className="text-4xl font-bold text-center mb-24 text-gray-800">
            Admin Dashboard
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center max-w-md mx-auto">
          <Link href="/admin/manage-movies">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Manage Movies
            </button>
          </Link>

          <Link href="/admin/manage-users">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Manage Users
            </button>
          </Link>

          <Link href="/admin/manage-promotions">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Manage Promotions
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminPortalHomePage;
