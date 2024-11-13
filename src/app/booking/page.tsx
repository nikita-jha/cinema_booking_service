"use client";

import { useSearchParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { db } from "../../lib/firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";

const formatTime = (time24) => {
  const [hour, minute] = time24.split(":").map(Number);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
};

const BookingPage = () => {
  const [movieData, setMovieData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showtimes, setShowtimes] = useState<string[]>([]);
  const [selectedShowtime, setSelectedShowtime] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<{ seat: number; age: number }[]>([]);
  const searchParams = useSearchParams();
  const title = searchParams.get("title");
  const router = useRouter();

  const currentDate = new Date();
  const currentDateString = currentDate.toISOString().split("T")[0]; // Format as yyyy-mm-dd


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

  const fetchShowtimesForDate = async (date: string) => {
    if (!movieData) return;

    try {
      const showsRef = collection(db, "Shows");
      const q = query(showsRef, where("movieId", "==", movieData.id), where("date", "==", date));
      const snapshot = await getDocs(q);

      const times = snapshot.docs.map((doc) => doc.data().time);
      setShowtimes(times);
      setSelectedShowtime(null); // reset selected showtime
    } catch (error) {
      console.error("Error fetching showtimes:", error);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    fetchShowtimesForDate(date);
  };

  const handleSeatClick = (seat: number) => {
    if (selectedShowtime) {
      const existingSeat = selectedSeats.find((s) => s.seat === seat);
      if (!existingSeat) {
        setSelectedSeats([...selectedSeats, { seat, age: 0 }]);
      } else {
        setSelectedSeats(selectedSeats.filter((s) => s.seat !== seat));
      }
    }
  };

  const handleAgeChange = (seat: number, age: number) => {
    setSelectedSeats(
      selectedSeats.map((s) => (s.seat === seat ? { ...s, age } : s))
    );
  };

  const handleCheckout = () => {
    if (selectedSeats.every((s) => s.age > 0)) {
      router.push("/checkout");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Book Tickets</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Side: Movie & Date/Showtime */}
          <div className="w-full md:w-1/2">
            <h2 className="text-xl font-bold mb-4">Selected Movie:</h2>
            <h2 className="text-2xl font-bold text-blue-600 mb-4">{title}</h2>

            <div className="mb-4">
              <label className="block text-lg font-semibold mb-1" htmlFor="date">
                Select Date:
              </label>
              <input
                type="date"
                id="date"
                className="p-2 border rounded w-full"
                value={selectedDate || ""}
                onChange={handleDateChange}
                min={currentDateString} // Restrict to future dates only
              />
            </div>

            {selectedDate && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Available Showtimes:</h3>
                <h3 className="text-sm mb-2">Please select one.</h3>
                <div className="flex flex-wrap gap-2">
                  {showtimes.length > 0 ? (
                    showtimes.map((time, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedShowtime(time)}
                        className={`px-4 py-2 rounded ${
                          selectedShowtime === time
                            ? "bg-blue-500 text-white"
                            : "bg-gray-300"
                        }`}
                      >
                        {formatTime(time)}
                      </button>
                    ))
                  ) : (
                    <p className="text-gray-500">No showtimes available.</p>
                  )}
                </div>
              </div>
            )}
          {selectedShowtime && (
            <p className="text-lg text-gray-700 mt-4">
              Ticket selection now available. Choose from the available seats on the right.
            </p>
          )}
        </div>

          {/* Right Side: Seats */}
          <div className="w-full md:w-1/2">
            <h3 className="text-lg font-semibold mb-4">Select Seats:</h3>
            <hr className="border-t-2 border-gray-300 mb-4" />
            <div className="text-center mb-4">Screen</div>
            <hr className="border-t-2 border-gray-300 mb-4" />
            <div className="grid grid-cols-10 gap-2 mb-4">
              {[...Array(100)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleSeatClick(index + 1)}
                  className={`w-8 h-8 rounded ${
                    selectedSeats.some((s) => s.seat === index + 1)
                      ? "bg-green-500 text-white"
                      : "bg-gray-300"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ticket Details and Age Entry */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Ticket Details</h3>
          <div className="space-y-2">
            {selectedSeats.map((seat) => (
              <div key={seat.seat} className="flex items-center space-x-4">
                <span className="font-bold">Seat {seat.seat}</span>
                <label>
                  Age:
                  <input
                    type="number"
                    min="1"
                    className="p-1 ml-2 border rounded"
                    value={seat.age || ""}
                    onChange={(e) => handleAgeChange(seat.seat, +e.target.value)}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={!selectedSeats.length || !selectedSeats.every((s) => s.age > 0)}
          className={`mt-6 px-4 py-2 rounded text-white font-bold ${
            selectedSeats.length && selectedSeats.every((s) => s.age > 0)
              ? "bg-green-500"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Checkout
        </button>
      </div>
    </div>
  );
};

export default BookingPage;
