import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "../context/UserContext";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/application/firebase/config";
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
          if (firebaseUser.emailVerified) {
            // Only set the user if the email is verified
            setUser({
              id: firebaseUser.uid,
              name: userData.name || '',
              email: firebaseUser.email || '',
              userType: userData.userType,
              emailVerified: firebaseUser.emailVerified
            });
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

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
          {user && user.emailVerified ? (  // Add emailVerified check
            <>
              {user.userType === "Admin" && (
                <Link href="/adminHome" className="text-white mr-4">
                  Admin
                </Link>
              )}
              <Link href="/editprofile" className="text-white mr-4">
                My Account
              </Link>
              <button onClick={handleLogout} className="text-white">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-white mr-4">
                Login
              </Link>
              <Link href="/register" className="text-white">
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
