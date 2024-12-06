"use client";

import { useSearchParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { db, auth } from "../../application/firebase/config"; 
import { onAuthStateChanged } from "firebase/auth"; // Import this function
import { collection, query, where, getDocs } from "firebase/firestore";
import { fetchSeatsForShow, reserveSeats, validateSeatAvailability } from "../../application/firebase/firestore";
import Link from "next/link";

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
  const [seatData, setSeatData] = useState<{ seatNumber: number; isReserved: boolean; reservedBy: string | null }[]>([]);
  const [userId, setUserId] = useState<string | null>(null); // Store user ID
  const [roomId, setRoomId] = useState<string | null>(null); // Add state for room ID
  const [loading, setLoading] = useState(true); // Add loading state
  const [sessionState, setSessionState] = useState(null); // Add session state
  const [ticketPrices, setTicketPrices] = useState<{ adult: number; child: number; senior: number } | null>(null);


  const searchParams = useSearchParams();
  const title = searchParams.get("title");
  const router = useRouter();

  const currentDate = new Date();
  const currentDateString = currentDate.toISOString().split("T")[0]; // Format as yyyy-mm-dd
  
  useEffect(() => {
    // Monitor the logged-in user
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid); // Set user ID
      } else {
        setUserId(null); // Handle unauthenticated state
      }
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);


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
            //if (movieDoc.data().ticketPrices) {

            const ticketPrices = movieDoc.data().ticketPrices || {
              adult: 0,
              child: 0,
              senior: 0,
            };  

              //const ticketPrices = movieDoc.data().ticketPrices;
              setTicketPrices({
                adult: Number(ticketPrices.adult),
                child: Number(ticketPrices.child),
                senior: Number(ticketPrices.senior),
              });
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


  useEffect(() => {
    if (selectedShowtime) {
      // setSelectedSeats([]); // Clear selected seats when showtime changes
      fetchSeats(selectedShowtime); // Fetch seats for the selected showtime
      fetchRoomId(); // Fetch room ID when showtime is selected
    } else {
      setRoomId(null); // Clear room ID when no showtime is selected
    }
  }, [selectedShowtime]);

  useEffect(() => {
    const savedState = sessionStorage.getItem("bookingState");
    if (savedState) {
      const { selectedDate, selectedShowtime, selectedSeats, seatData, roomID, showtimes } = JSON.parse(savedState);
      console.log("seat data: ", seatData)
      setSelectedDate(selectedDate);
      setSelectedShowtime(selectedShowtime);
      setSelectedSeats(selectedSeats);
      setSeatData(seatData || []);
      setRoomId(roomID);
      setShowtimes(showtimes || []); 
    }
    setLoading(false); // Restoration is complete

  }, []);

  console.log("Selected Seats: ", selectedSeats);
  console.log("Age: ", selectedSeats.map((s) => s.age));
  console.log("Ticket Prices :", ticketPrices);


  const clearSavedState = () => {
    sessionStorage.removeItem("bookingState");
  };

  const fetchShowtimesForDate = async (date: string) => {
    if (!movieData || (showtimes.length && selectedDate === date)) return; // Skip fetching if already restored

    try {
      const showsRef = collection(db, "Shows");
      const q = query(showsRef, where("movieId", "==", movieData.id), where("date", "==", date));
      const snapshot = await getDocs(q);

      const times = snapshot.docs.map((doc) => doc.data().time);
      setShowtimes(times);
      setSelectedShowtime(null); // Reset selected showtime
      setRoomId(null); // Reset room ID when date changes
    } catch (error) {
      console.error("Error fetching showtimes:", error);
    }
  };

  const fetchRoomId = async () => {
    if (!movieData || !selectedDate || !selectedShowtime) return;
    
    try {
      const showsRef = collection(db, "Shows");
      const q = query(
        showsRef, 
        where("movieId", "==", movieData.id),
        where("date", "==", selectedDate),
        where("time", "==", selectedShowtime)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const showData = snapshot.docs[0].data();
        setRoomId(showData.roomId);
      }
    } catch (error) {
      console.error("Error fetching room ID:", error);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearSavedState(); // Clear previous state
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedSeats([]); // Clear selected seats when date changes
    fetchShowtimesForDate(date);
  };

  const fetchSeats = async (showtime: string) => {
    if (!movieData || !selectedDate) return;
  
    try {
      const showId = `${movieData.id}-${selectedDate}-${showtime}`; // Construct full showId
      console.log(`Fetching seats for showId: ${showId}`);
      const seats = await fetchSeatsForShow(showId);
      setSeatData(seats);
    } catch (error) {
      console.error("Error fetching seats:", error);
    }
  };

  const handleSeatClick = (seat: number) => {
    console.log("SELECTED SEATS: ",selectedSeats)
    console.log("SHOWTIME: ",selectedShowtime)
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

  const saveStateToSession = () => {
    
    const state = {
      selectedDate,
      selectedShowtime,
      selectedSeats,
      seatData,
      roomId,
      showtimes,
    };
    sessionStorage.setItem("bookingState", JSON.stringify(state));
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
                <div className="flex flex-wrap gap-2">
                  {showtimes.length > 0 ? (
                    showtimes.map((time, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          clearSavedState();
                          setSelectedShowtime(time);
                        }}
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
          </div>
  
          {/* Right Side: Seats */}
          <div className="w-full md:w-1/2">
            {loading ? (
            <p>Loading seat map...</p>
          ) : selectedShowtime && selectedDate ? (
            <>
              <h2 className="text-xl font-bold mb-4">Room ID: {roomId}</h2>
              <h3 className="text-lg font-semibold mb-4">Select Seats:</h3>
              <hr className="border-t-2 border-gray-300 mb-4" />
              <div className="text-center mb-4">Screen</div>
              <hr className="border-t-2 border-gray-300 mb-4" />
              <div className="grid grid-cols-10 gap-2 mb-4">
                {seatData.length > 0 ? (
                  seatData.map((seat) => (
                    <button
                      key={seat.seatNumber}
                      onClick={() => handleSeatClick(seat.seatNumber)}
                      disabled={seat.isReserved}
                      className={`w-8 h-8 rounded ${
                        seat.isReserved
                          ? "bg-red-500 text-white cursor-not-allowed"
                          : selectedSeats.some((s) => s.seat === seat.seatNumber)
                          ? "bg-green-500 text-white"
                          : "bg-gray-300"
                      }`}
                    >
                      {seat.seatNumber}
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500">No seats available for this showtime.</p>
                )}
              </div>
            </>
          ) : (
            <p>Please select a showtime to view the seat map.</p>
          )}

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
        {movieData && selectedDate && selectedShowtime ? (
          <Link
            href={{
              pathname: "/checkout",
              query: {
                title: movieData.title || "",
                showDate: selectedDate || "",
                showTime: selectedShowtime || "",
                numTickets: selectedSeats.length.toString(),
                selectedSeats: JSON.stringify(selectedSeats),
                showId: `${movieData.id}-${selectedDate}-${selectedShowtime}` || "",
                userId: userId || "",
                ticketPrices: JSON.stringify(ticketPrices),
              },
            }}
            onClick={saveStateToSession}
          >
            <button
              disabled={!selectedSeats.length || !selectedSeats.every((s) => s.age > 0 && s.age < 120)}
              className={`mt-6 px-4 py-2 rounded text-white font-bold ${
                selectedSeats.length && selectedSeats.every((s) => s.age > 0 && s.age < 120)
                  ? "bg-green-500"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Checkout
            </button>
          </Link>
        ) : (
          <button
            disabled
            className="mt-6 px-4 py-2 rounded text-white font-bold bg-gray-400 cursor-not-allowed"
          >
            Checkout
          </button>
        )}
      </div>
    </div>
  );
  
};

export default BookingPage;