"use client";

import { useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { FaStar, FaClock, FaFilm, FaUser, FaPlayCircle, FaUsers } from "react-icons/fa";
import { IoCalendarOutline } from "react-icons/io5";
import { db } from "../../lib/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";

const MovieDetailsPage = () => {
  const [movieData, setMovieData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const title = searchParams.get("title");

  useEffect(() => {
    const fetchMovieData = async () => {
      if (title) {
        try {
          // Query the 'movies' collection where 'title' matches the title from searchParams
          const moviesRef = collection(db, "movies");
          const q = query(moviesRef, where("title", "==", title));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            // Assuming the first document is the movie you're looking for
            const movieDoc = querySnapshot.docs[0];
            setMovieData(movieDoc.data());
          } else {
            setError("Movie not found");
          }
        } catch (err) {
          setError("Error fetching movie data");
          console.error(err);
        }
      } else {
        setError("Movie title is required");
      }
    };

    fetchMovieData();
  }, [title]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!movieData) {
    return <div>Loading...</div>;
  }

  // Destructure movieData fields
  const { category, director, mpaaRating, producer, cast, synopsis, trailerPictureUrl, trailerVideoUrl, runtime, releaseDate, reviews = [], showDates = [] } = movieData;

  let embedUrl = "";
  if (trailerVideoUrl) {
    embedUrl = trailerVideoUrl.replace("watch?v=", "embed/");
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        {/* Movie Header */}
        <h1 className="text-3xl font-bold mb-6">{title}</h1>
        
        {/* Movie Details Section */}
        <div className="flex flex-col md:flex-row gap-6 mb-10">
          <img
            src={trailerPictureUrl}
            alt={`${title} Poster`}
            className="w-full md:w-1/4 rounded-lg shadow-lg"
          />
          
          <div className="w-full md:w-3/4">
            <h2 className="text-2xl font-bold">{title}</h2>
            <br />
            <p className="text-gray-700 italic mb-4">{synopsis}</p>
            <div className="flex items-center mb-2">
            <FaFilm className="text-gray-600 mr-2" /> 
                <strong className="mr-2">Director:</strong> {director}
            </div>
            <div className="flex items-center mb-2">
            <FaUser className="text-gray-600 mr-2" /> 
                <strong className="mr-2">Producer:</strong> {producer}
            </div>
            <div className="flex items-center mb-2">
            <FaUsers className="text-gray-600 mr-2" /> 
                <strong className="mr-2">Cast:</strong> {cast}
            </div>
            <div className="flex items-center mb-2">
              <FaStar className="text-yellow-500 mr-2" /> 
                <strong className="mr-2">Rating: </strong> {mpaaRating}
            </div>
            <div className="flex items-center mb-2">
              <FaPlayCircle className="text-gray-600 mr-2" /> 
                <strong className="mr-2">Category: </strong> {category}
            </div>
            <div className="flex items-center mb-2">
              <IoCalendarOutline className="text-gray-600 mr-2" /> 
                <strong className="mr-2">Released On:</strong> {releaseDate}
            </div>
            <a
              href={trailerVideoUrl}
              className="text-blue-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Trailer: Watch on YouTube
            </a>
          </div>

          {embedUrl && (
            <iframe
              className="w-full md:w-1/2 h-64 mt-6 md:mt-0 rounded-lg shadow-lg"
              src={embedUrl}
              title={`${title} Trailer`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}
        </div>

        {/* Showtime Section */}
        <div className="mb-10 border-t pt-4">
          <h2 className="text-xl font-semibold mb-3">View Showtimes</h2>
          <div className="flex items-center mb-4">
            <input type="date" className="p-2 border rounded w-48" placeholder="mm/dd/yyyy" />
            <button className="bg-blue-600 text-white px-4 py-2 rounded ml-3 flex items-center">
              <IoCalendarOutline className="mr-2" /> Update Showtimes
            </button>
          </div>
          
          <h3 className="text-lg font-medium mb-2">Showtimes on [Selected Date]:</h3>
          <div className="flex space-x-4">
            {showDates.map((dateInfo, index) => (
              <button
                key={index}
                className="px-4 py-2 rounded bg-blue-500 text-white"
              >
                {dateInfo.time}
              </button>
            ))}
          </div>
          <p className="text-gray-500 text-sm mt-2">Select a showtime above to book your tickets</p>
        </div>

        {/* Reviews Section */}
        <div className="mb-8 border-t pt-4">
        <h2 className="text-xl font-semibold mb-3">Reviews</h2>
        {reviews ? (
            <div className="border p-4 rounded-lg mb-4 shadow-md">
            <p className="text-gray-700">{reviews}</p>
            </div>
        ) : (
            <p>No reviews available for this movie.</p>
        )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsPage;
