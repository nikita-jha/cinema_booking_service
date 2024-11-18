"use client";

import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Link from "next/link";
import AddMovie from "../../../components/AddMovie";
import EditMovie from "../../../components/EditMovie";
import ScheduleMovie from "../../../components/ScheduleMovie";
import { IMovie } from "../../../models/movie.model";
import { deleteMovie, getMovies } from "../../../controller/firebase/firestore"; // Assuming this is the correct path to your firestore utility
import useRequireAuth from '../../../components/RequireAuth';

const AdminPortalHomePage = () => {
  useRequireAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [movies, setMovies] = useState<IMovie[]>([]);

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

  const deleteCallback = async (id: string) => {
    console.log(
      "%c🚨 Deleting movie with ID: " + id,
      "color: red; font-size: 20px; font-weight: bold; background-color: yellow; padding: 10px;"
    );
    try {
      await deleteMovie(id);
      console.log("Deleting movie with id:", id);
      await fetchMovies();
    } catch (error) {
      console.error("Error deleting movie:", error);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-semibold mb-4 text-gray-800">
            Manage Movies
          </h1>
          <table className="min-w-full bg-white border border-gray-300 rounded-md shadow-sm">
            <thead className="bg-blue-100">
              <tr>
                <th className="py-2 px-4 text-left border-b text-gray-700">
                  Title
                </th>
                <th className="py-2 px-4 text-left border-b text-gray-700">
                  Category
                </th>
                <th className="py-2 px-4 text-left border-b text-gray-700">
                  Director
                </th>
                <th className="py-2 px-4 text-left border-b text-gray-700">
                  MPAA Rating
                </th>
                <th className="py-2 px-4 text-left border-b text-gray-700">
                  Producer
                </th>
                <th className="py-2 px-4 text-left border-b text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {movies.map((movie) => (
                <tr key={movie.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b text-gray-800">
                    {movie.title}
                  </td>
                  <td className="py-2 px-4 border-b text-gray-800">
                    {movie.category}
                  </td>
                  <td className="py-2 px-4 border-b text-gray-800">
                    {movie.director}
                  </td>
                  <td className="py-2 px-4 border-b text-gray-800">
                    {movie.mpaaRating}
                  </td>
                  <td className="py-2 px-4 border-b text-gray-800">
                    {movie.producer}
                  </td>
                  <td className="py-2 px-4 border-b text-gray-800">
                    <div className="flex space-x-2">
                      <EditMovie movie={movie} onMovieUpdated={fetchMovies} />
                      <ScheduleMovie
                        movie={movie}
                        onScheduleAdded={fetchMovies}
                      />
                      <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => deleteCallback(movie.id)}
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
            <AddMovie onMovieAdded={fetchMovies} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPortalHomePage;
