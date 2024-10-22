"use client";

import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Link from 'next/link';
import useRequireAuth from '../../components/RequireAuth';

const CHILD_PRICE = 10.00;
const ADULT_PRICE = 20.00;
const SENIOR_PRICE = 12.00;
const TAX_RATE = 0.07;

const OrderSummaryPage = () => {
  useRequireAuth();
  const searchParams = useSearchParams();
  const numTickets = searchParams.get('numTickets');
  const ages = searchParams.get('ages');
  const showTime = searchParams.get('showTime');
  const showDate = searchParams.get('showDate');
  const trailerPictureUrl = searchParams.get('trailerPictureUrl');
  const title = searchParams.get('title');
  const trailerVideoUrl = searchParams.get('trailerVideoUrl'); 

  const [ticketList, setTicketList] = useState<string[]>([]);
  const [totalTickets, setTotalTickets] = useState<number>(0);
  const [selectedShowTime, setSelectedShowTime] = useState<string>('');
  const [selectedShowDate, setSelectedShowDate] = useState<string>('');
  const [trailerImageUrl, setTrailerImageUrl] = useState<string>('');

  useEffect(() => {
    if (numTickets) setTotalTickets(parseInt(numTickets, 10));
    if (ages) setTicketList(JSON.parse(ages));
    if (showTime) setSelectedShowTime(showTime);
    if (showDate) setSelectedShowDate(showDate);
    if (trailerPictureUrl) setTrailerImageUrl(trailerPictureUrl);
  }, [numTickets, ages, showTime, showDate, trailerPictureUrl]);

  const handleDeleteTicket = (index: number) => {
    const newTicketList = [...ticketList];
    newTicketList.splice(index, 1);
    setTicketList(newTicketList);
    setTotalTickets(newTicketList.length);
  };

  const handleCancel = () => {
    window.location.href = '/';
  };

  const handleConfirm = () => {
    window.location.href = '/checkout';
  };

  const getTicketPrice = (age: string) => {
    const ageNum = parseInt(age, 10);
    if (ageNum <= 13) return CHILD_PRICE;
    if (ageNum >= 65) return SENIOR_PRICE;
    return ADULT_PRICE;
  };

  const getTicketType = (age: string) => {
    const ageNum = parseInt(age, 10);
    if (ageNum <= 13) return 'CHILD';
    if (ageNum >= 65) return 'SENIOR';
    return 'ADULT';
  };

  const orderTotal = ticketList.reduce((total, age) => total + getTicketPrice(age), 0);
  const taxAmount = orderTotal * TAX_RATE;
  const overallTotal = orderTotal + taxAmount;

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <Link
          href={{
            pathname: '/booking',
            query: {
              title,
              trailerPictureUrl,
              trailerVideoUrl
            },
          }}
        >
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
            Return to Update Tickets
          </button>
        </Link>
        <h1 className="text-2xl font-bold mb-4 text-center">Order Summary</h1>
        <div className="flex">
          {trailerImageUrl && (
            <div className="w-1/2 p-4">
              <img
                src={trailerImageUrl}
                alt="Trailer"
                className="w-full max-w-md max-h-96 mb-4 object-contain"
              />
            </div>
          )}
          <div className="w-1/2 p-4">
            <h2 className="text-xl font-semibold mb-4">Ticket Details</h2>
            <p className="mb-2">Show Date: {selectedShowDate}</p>
            <p className="mb-4">Show Time: {selectedShowTime}</p>
            {ticketList.length > 0 ? (
              <ul className="mb-4">
                {ticketList.map((age, index) => (
                  <li key={index} className="flex justify-between items-center mb-2">
                    <span>Ticket {index + 1}: {getTicketType(age)} (Age {age})</span>
                    <span>${getTicketPrice(age).toFixed(2)}</span>
                    <button
                      onClick={() => handleDeleteTicket(index)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No tickets added.</p>
            )}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Ticket Total:</span>
                <span className="text-lg font-semibold">${orderTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Tax (7%):</span>
                <span className="text-lg font-semibold">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Order Total:</span>
                <span className="text-lg font-semibold">${overallTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between w-full max-w-4xl mx-auto mt-4">
          <button
            onClick={handleCancel}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
          <Link
            href={{
              pathname: '/checkout',
              query: {
                numTickets,
                ages,
                showTime,
                showDate,
                trailerPictureUrl,
                title,
                orderTotal: orderTotal.toFixed(2),
                taxAmount: taxAmount.toFixed(2),
                overallTotal: overallTotal.toFixed(2),
              },
            }}
          >
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Checkout
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryPage;