"use client";

import { useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Link from "next/link";
import useRequireAuth from "../../components/RequireAuth";

const ConfirmationPage = () => {
  useRequireAuth();
  const searchParams = useSearchParams();
  const title = searchParams.get("title");
  const showDate = searchParams.get("showDate");
  const showTime = searchParams.get("showTime");
  const selectedSeats = JSON.parse(searchParams.get("selectedSeats") || "[]");
  const numTickets = parseInt(searchParams.get("numTickets") || "0", 10);
  const orderTotal = parseFloat(searchParams.get("orderTotal") || "0");

  const [orderNumber, setOrderNumber] = useState<string>("");

  // Add labels to below conole log to display the values
  console.log(title, showDate, showTime, selectedSeats, numTickets, orderTotal);

  useEffect(() => {
    // Generate the order number after the component mounts
    const generateOrderNumber = () => {
      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let orderNumber = "";
      for (let i = 0; i < 12; i++) {
        orderNumber += characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
      }
      return orderNumber;
    };
    setOrderNumber(generateOrderNumber());
  }, []);

  return (
    <div>
      <Navbar />
      <div className="mt-60"></div> {/* Add spacing */}
      <div className="container mx-auto flex justify-center items-center h-full bg-white-100">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-green-600 mb-4 text-center">
            Booking Confirmation
          </h1>
          <div className="border-t border-gray-200 mt-4 pt-4">
            <h2 className="text-xl font-semibold mb-2">Booking Details</h2>
            <p className="mb-2">
              <span className="font-semibold">Order Number:</span>{" "}
              <span className="text-blue-600 font-mono">{orderNumber}</span>
            </p>
            <p className="mb-2">
              <span className="font-semibold">Movie Title:</span> {title}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Show Date:</span> {showDate}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Show Time:</span> {showTime}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Number of Tickets:</span>{" "}
              {numTickets}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Seats:</span>{" "}
            {selectedSeats.map((seat) => seat.seat).join(", ")}
            </p>
            <p className="mb-2">
              <span className="font-semibold">Order Total:</span>{" "}
              ${orderTotal}
            </p>
          </div>
          <div className="text-center mt-6">
            <Link href="/">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Keep Browsing
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
