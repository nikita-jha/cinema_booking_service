"use client";

import { useSearchParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { db } from "../../application/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FaStar, FaClock, FaFilm, FaUser, FaPlayCircle, FaUsers } from "react-icons/fa";
import { IoCalendarOutline } from "react-icons/io5";
import Link from 'next/link';

// Helper function to format time to 12-hour format with AM/PM
const formatTime = (time24) => {
  const [hour, minute] = time24.split(":").map(Number);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12; // Convert 0 or 12-hour to 12-hour format
  return `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
};

const MovieDetailsPage = () => {
  const [movieData, setMovieData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showtimes, setShowtimes] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const title = searchParams.get("title");
  const router = useRouter();

  // Fetch movie data based on title
  useEffect(() => {
    const fetchMovieData = async () => {
      if (title) {
        try {
          const moviesRef = collection(db, "movies");
          const q = query(moviesRef, where("title", "==", title));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const movieDoc = querySnapshot.docs[0];
            setMovieData({ id: movieDoc.id, ...movieDoc.data() });
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

  // Fetch showtimes for selected date
  const fetchShowtimesForDate = async (date: string) => {
    if (!movieData) return;

    try {
      const showsRef = collection(db, "Shows");
      const q = query(
        showsRef,
        where("movieId", "==", movieData.id),
        where("date", "==", date)
      );
      const snapshot = await getDocs(q);

      const times = snapshot.docs.map((doc) => doc.data().time);
      setShowtimes(times);
    } catch (error) {
      console.error("Error fetching showtimes:", error);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    fetchShowtimesForDate(date);
  };

  const handleProceedToBooking = () => {
    if (movieData && movieData.id) {
      router.push(`/booking?movieId=${movieData.id}`);
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!movieData) {
    return <div>Loading...</div>;
  }

  const { category, director, mpaaRating, producer, cast, synopsis, trailerPictureUrl, trailerVideoUrl, runtime, releaseDate, reviews: rawReviews = [], showDates = [] } = movieData;

  const reviews = typeof rawReviews === 'string' ? [rawReviews] : rawReviews;

  let embedUrl = "";
  if (trailerVideoUrl) {
    embedUrl = trailerVideoUrl.replace("watch?v=", "embed/");
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">{title}</h1>
        
        <div className="flex flex-col md:flex-row gap-6 mb-10">
          <img
            src={trailerPictureUrl}
            alt={`${title} Poster`}
            className="w-full md:w-1/4 rounded-lg shadow-lg"
          />
          
          <div className="w-full md:w-3/4">
            <h2 className="text-2xl font-bold">{title}</h2>
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
          <p className="text-gray-500">Please enter a future date.</p>
          <div className="flex items-center mb-4">
            <input
              type="date"
              className="p-2 border rounded w-48"
              value={selectedDate || ""}
              onChange={handleDateChange}
              min={new Date().toISOString().split("T")[0]} // Restrict to current date or future dates
            />
          </div>

          <h3 className="text-lg font-medium mb-2">
            Available Showtimes on {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }) : "Selected Date"}:
          </h3>
          <div className="flex flex-wrap space-x-2">
            {showtimes.length > 0 ? (
              showtimes.map((time, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full bg-teal-500 text-white text-lg font-semibold mb-2"
                >
                  {formatTime(time)}
                </span>
              ))
            ) : (
              <p className="text-gray-500">No showtimes available for this date.</p>
            )}
          </div>
          <div className="mb-8 border-t pt-4">
        <h2 className="text-xl font-semibold mb-3">Reviews</h2>
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div key={index} className="mb-2 p-2 border rounded">
              <p>{review}</p>
            </div>
          ))
        ) : (
          <p>No reviews available.</p>
        )}
        </div>
          <Link
            href={{
              pathname: '/booking',
              query: {
                title: title,
              },
            }}
          >
            <button
              onClick={handleProceedToBooking}
              className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
            >
              Proceed to Booking
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsPage;