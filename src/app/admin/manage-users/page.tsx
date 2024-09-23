"use client";

import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Link from "next/link";
import AddMovie from "../../../components/AddMovie";
import { getMovies } from "../../../lib/firebase/firestore"; // Assuming this is the correct path to your firestore utility

const AdminPortalHomePage = () => {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMovies = async () => {
    setIsLoading(true);
    try {
      const moviesData = await getMovies();
      setMovies(moviesData);
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="header relative">
          <h1 className="text-4xl font-bold text-center mb-24 text-gray-800">
            Manage Users
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {/* Add Movie Button with fetchMovies */}
          <div>
            <AddMovie onMovieAdded={fetchMovies} />
          </div>

          {/* Edit Movies Button */}
          <Link href="/admin/manage-users">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Edit Movies
            </button>
          </Link>

          {/* Manage Promotions Button */}
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
