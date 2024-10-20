import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "../context/UserContext";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";

const Navbar: React.FC = () => {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            id: firebaseUser.uid,
            name: userData.name || '',
            email: firebaseUser.email || '',
            userType: userData.userType
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser]);

  if (loading) {
    return <div>Loading...</div>; // Or any loading indicator
  }

  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-2xl font-bold">
          Cinema E-Booking
        </Link>
        <div>
          <Link href="/" className="text-white mr-4">
            Home
          </Link>
          {user ? (
            <>
              {user.userType === "Admin" && (
                <Link href="/adminHome" className="text-white mr-4">
                  Admin
                </Link>
              )}
              <Link href="/editprofile" className="text-white mr-4">
                My Account
              </Link>
            </>
          ) : (
            <Link href="/login" className="text-white">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
