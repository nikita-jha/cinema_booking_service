"use client";

import { useState, useEffect } from "react";
import { addMovieScheduleWithSeats, getRooms, getMovieSchedules } from "../lib/firebase/firestore";

interface ScheduleMovieProps {
  movie: { id: string };
  onScheduleAdded: () => void;
}

const ScheduleMovie: React.FC<ScheduleMovieProps> = ({ movie, onScheduleAdded }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    date: '',
    time: '',
    room: ''
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [allRooms, setAllRooms] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);

  useEffect(() => {
    if (isFormOpen) {
      fetchRooms();
    }
  }, [isFormOpen]);

  const fetchRooms = async () => {
    try {
      const rooms = await getRooms();
      setAllRooms(rooms);
      setAvailableRooms(rooms); // Initially, all rooms are available
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setScheduleData({ ...scheduleData, [name]: value });
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      // Attempt to add schedule with conflict check
      await addMovieScheduleWithSeats(
        movie.id,
        scheduleData.date,
        scheduleData.time,
        scheduleData.room
      );

      console.log("Schedule successfully added!");

      // Reset form and update parent component
      setScheduleData({ date: '', time: '', room: '' });
      setIsFormOpen(false);
      onScheduleAdded();
    } catch (error) {
      // Display conflict error message
      setErrorMessage(error.message || "Error adding schedule.");
    }
  };

  return (
    <div className="mb-8 flex justify-center">
      <button
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => setIsFormOpen(true)}
      >
        Schedule
      </button>

      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">Schedule Movie</h3>
            <form onSubmit={handleAddSchedule}>
              <label className="block mb-2">
                Date *
                <input
                  type="date"
                  name="date"
                  value={scheduleData.date}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 border rounded text-gray-800"
                  required
                />
              </label>
              <label className="block mb-2">
                Time *
                <input
                  type="time"
                  name="time"
                  value={scheduleData.time}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 border rounded text-gray-800"
                  required
                />
              </label>
              <label className="block mb-2">
                Room *
                <select
                  name="room"
                  value={scheduleData.room}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-2 border rounded text-gray-800"
                  required
                >
                  <option value="">Select a room</option>
                  {allRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name} (Seats: {room.seatsAvailable})
                    </option>
                  ))}
                </select>
              </label>
              {errorMessage && <p className="text-red-600 mt-2">{errorMessage}</p>}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="mr-2 px-4 py-2 bg-gray-300 text-gray-800 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Add Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleMovie;
