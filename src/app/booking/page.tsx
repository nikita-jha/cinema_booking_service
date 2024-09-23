"use client";

import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Link from "next/link";

const BookingPage = () => {
  const searchParams = useSearchParams();
  const title = searchParams.get("title");
  const trailerPictureUrl = searchParams.get("trailerPictureUrl");
  const trailerVideoUrl = searchParams.get("trailerVideoUrl"); // Add trailer video URL
  const embedUrl = trailerVideoUrl.replace("watch?v=", "embed/");

  console.log("Trailer:", embedUrl)

  const [showTime, setShowTime] = useState("");
  const [showDate, setShowDate] = useState("");
  const [numTickets, setNumTickets] = useState(0);
  const [ages, setAges] = useState<string[]>([]);
  const [error, setError] = useState("");

  const handleNumTicketsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setNumTickets(value);
    setAges(Array(value).fill(""));
  };

  const handleAgeChange = (index: number, value: string) => {
    const newAges = [...ages];
    newAges[index] = value;
    setAges(newAges);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
  };

  const validateForm = () => {
    if (!showDate) {
      setError("Please select a show date.");
      return false;
    }

    const selectedDate = new Date(showDate);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set to start of the day

    if (selectedDate < currentDate) {
      setError("The selected date has already passed.");
      return false;
    }

    if (!showTime) {
      setError("Please select a show time.");
      return false;
    }

    if (numTickets <= 0) {
      setError("Please select at least one ticket.");
      return false;
    }

    if (ages.some((age) => age === "")) {
      setError("Please specify the ages for all tickets.");
      return false;
    }

    setError("");
    return true;
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Buy Tickets for {title}
        </h1>
        {trailerPictureUrl && (
          <img
            src={trailerPictureUrl}
            alt={`${title} Trailer`}
            className="w-full max-w-md max-h-96 mb-4 object-contain"
          />
        )}

        {/* Embedded YouTube video */}
        {embedUrl && (
          <div className="mb-4 w-full max-w-md">
            <iframe
              width="100%"
              height="315"
              src={embedUrl}
              title={`${title} Trailer`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}

        <div className="mb-4 w-full max-w-md">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="showDate"
          >
            Select Show Date
          </label>
          <input
            type="date"
            id="showDate"
            value={showDate}
            onChange={(e) => setShowDate(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4 w-full max-w-md text-center">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Select Show Time
          </label>
          {showTime && <p className="text-lg font-semibold mb-2">{showTime}</p>}
          <div className="flex justify-center space-x-4">
            {["10AM", "2PM", "5PM"].map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => setShowTime(time)}
                className={`w-12 h-12 rounded-full border-2 ${
                  showTime === time
                    ? "bg-blue-500 text-white"
                    : "bg-white text-blue-500"
                } border-blue-500 hover:bg-blue-500 hover:text-white font-bold`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="numTickets"
            >
              Number of Tickets
            </label>
            <input
              type="number"
              id="numTickets"
              value={numTickets}
              onChange={handleNumTicketsChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              min="0"
            />
          </div>
          {numTickets > 0 && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Enter Ages
              </label>
              {ages.map((age, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder={`Age for Ticket ${index + 1}`}
                  value={age}
                  onChange={(e) => handleAgeChange(index, e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                />
              ))}
            </div>
          )}
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex justify-center">
            <Link
              href={{
                pathname: "/summary",
                query: {
                  numTickets,
                  ages: JSON.stringify(ages),
                  showTime,
                  showDate,
                  trailerPictureUrl,
                  title,
                },
              }}
            >
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                onClick={(e) => {
                  if (!validateForm()) {
                    e.preventDefault();
                  }
                }}
              >
                Proceed to Confirmation
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;
