"use client";

import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

const TICKET_PRICE = 20.00;

const OrderConfirmationPage = () => {
  const searchParams = useSearchParams();
  const numTickets = searchParams.get('numTickets');
  const ages = searchParams.get('ages');
  const showTime = searchParams.get('showTime');
  const showDate = searchParams.get('showDate');
  const trailerPictureUrl = searchParams.get('trailerPictureUrl');

  const [ticketList, setTicketList] = useState<string[]>([]);
  const [totalTickets, setTotalTickets] = useState<number>(0);
  const [selectedShowTime, setSelectedShowTime] = useState<string>('');
  const [selectedShowDate, setSelectedShowDate] = useState<string>('');
  const [trailerUrl, setTrailerUrl] = useState<string>('');

  useEffect(() => {
    if (numTickets) setTotalTickets(parseInt(numTickets, 10));
    if (ages) setTicketList(JSON.parse(ages));
    if (showTime) setSelectedShowTime(showTime);
    if (showDate) setSelectedShowDate(showDate);
    if (trailerPictureUrl) setTrailerUrl(trailerPictureUrl);
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

  const orderTotal = ticketList.length * TICKET_PRICE;

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4 text-center">Order Confirmation</h1>
        {trailerUrl && (
          <img
            src={trailerUrl}
            alt="Trailer"
            className="w-full max-w-md max-h-96 mb-4 object-contain"
          />
        )}
        <div className="w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">Ticket Details</h2>
          <p className="mb-2">Show Date: {selectedShowDate}</p>
          <p className="mb-4">Show Time: {selectedShowTime}</p>
          {ticketList.length > 0 ? (
            <ul className="mb-4">
              {ticketList.map((ticket, index) => (
                <li key={index} className="flex justify-between items-center mb-2">
                  <span>Ticket {index + 1}: Age {ticket}</span>
                  <span>${TICKET_PRICE.toFixed(2)}</span>
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
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Order Total:</span>
            <span className="text-lg font-semibold">${orderTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <button
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;