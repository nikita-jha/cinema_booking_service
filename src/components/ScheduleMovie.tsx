"use client";

import { useState, useEffect } from "react";
import { addMovieSchedule, getMovieSchedules, getBookingsForRoom, getRooms, deleteMovieSchedule } from "../lib/firebase/firestore";

interface ScheduleMovieProps {
  movie: { id: string }; // Movie object containing at least the movie ID
  onScheduleAdded: () => void; // Callback to notify when a schedule is added
}

interface Room {
  id: string;
  name: string;
  seatsAvailable: number;
  booked?: { date: string; time: string }[]; // Optional property
}

interface Schedule {
  date: string;
  time: string;
  room: string;
  roomName: string;
}

const ScheduleMovie: React.FC<ScheduleMovieProps> = ({ movie, onScheduleAdded }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    date: '',
    time: '',
    room: '',
  });
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);

  useEffect(() => {
    if (isFormOpen) {
      const initializeForm = async () => {
        await fetchRooms();
        await fetchSchedules();
        setDefaultScheduleData();
      };
      initializeForm();
    }
  }, [isFormOpen]);

  const setDefaultScheduleData = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultDate = tomorrow.toISOString().split('T')[0];
    const defaultTime = '12:00';

    setScheduleData({
      date: defaultDate,
      time: defaultTime,
      room: '',
    });

    // Trigger available rooms update with default date and time
    updateAvailableRooms(defaultDate, defaultTime);
  };

  const fetchRooms = async () => {
    try {
      const roomsData = await getRooms();
      setAllRooms(roomsData);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const fetchSchedules = async () => {
    try {
      const schedulesData = await getMovieSchedules(movie.id);
      setSchedules(schedulesData);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  const isRoomAvailable = async (room: Room, date: string, time: string) => {
    try {
      const bookings = await getBookingsForRoom(room.id);
      
      const selectedDateTime = new Date(`${date}T${time}`);
      const selectedEndTime = new Date(selectedDateTime.getTime() + 3 * 60 * 60 * 1000);

      const isBooked = bookings.some(booking => {
        const bookingStart = new Date(`${booking.date}T${booking.time}`);
        const bookingEnd = new Date(bookingStart.getTime() + 3 * 60 * 60 * 1000);

        return (
          (selectedDateTime >= bookingStart && selectedDateTime < bookingEnd) ||
          (selectedEndTime > bookingStart && selectedEndTime <= bookingEnd) ||
          (selectedDateTime <= bookingStart && selectedEndTime >= bookingEnd)
        );
      });

      console.log(`Room ${room.id} availability check:`, {
        room: room.id,
        date,
        time,
        isAvailable: !isBooked,
        existingBookings: bookings
      });

      return !isBooked;
    } catch (error) {
      console.error('Error checking room availability:', error);
      return false;
    }
  };

  const updateAvailableRooms = async (date: string, time: string) => {
    if (!date || !time) {
      setAvailableRooms([]);
      return;
    }

    try {
      const availableRoomsPromises = allRooms.map(async (room) => {
        const isAvailable = await isRoomAvailable(room, date, time);
        return isAvailable ? room : null;
      });

      const availableRoomsResults = await Promise.all(availableRoomsPromises);
      const filteredRooms = availableRoomsResults.filter((room): room is Room => room !== null);
      
      console.log('Available rooms for selected time:', {
        date,
        time,
        availableRooms: filteredRooms.map(room => room.id)
      });
      
      setAvailableRooms(filteredRooms);
    } catch (error) {
      console.error('Error updating available rooms:', error);
      setAvailableRooms([]);
    }
  };

  const handleInputChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updatedScheduleData = { ...scheduleData, [name]: value };
    setScheduleData(updatedScheduleData);

    if ((name === 'date' || name === 'time') && updatedScheduleData.date && updatedScheduleData.time) {
      await updateAvailableRooms(updatedScheduleData.date, updatedScheduleData.time);
    }
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!scheduleData.date || !scheduleData.time || !scheduleData.room) {
        console.error('All fields are required');
        return;
      }

      const selectedRoom = allRooms.find(room => room.id === scheduleData.room);
      if (!selectedRoom) {
        console.error('Selected room not found');
        return;
      }

      // Create the new schedule object
      const newSchedule = {
        date: scheduleData.date,
        time: scheduleData.time,
        room: scheduleData.room,
        roomName: selectedRoom.name
      };

      // Update database first
      await addMovieSchedule(movie.id, {
        date: scheduleData.date,
        time: scheduleData.time,
        room: scheduleData.room
      });

      // Update local state after successful database update
      setSchedules(prevSchedules => [...prevSchedules, newSchedule]);

      console.log("Schedule successfully added!");
      
      // Reset form
      setScheduleData({
        date: "",
        time: "",
        room: "",
      });

    } catch (error) {
      console.error("Error adding schedule:", error);
    }
  };

  const handleDeleteSchedule = async (scheduleToDelete: Schedule) => {
    try {
      console.log("Attempting to delete schedule:", scheduleToDelete); // Debug log

      // Update local state first for immediate UI feedback
      setSchedules(prevSchedules => 
        prevSchedules.filter(schedule => 
          !(schedule.date === scheduleToDelete.date && 
            schedule.time === scheduleToDelete.time && 
            schedule.room === scheduleToDelete.room)
        )
      );

      // Then update the database
      await deleteMovieSchedule(movie.id, scheduleToDelete);
      console.log("Schedule successfully deleted!");
    } catch (error) {
      console.error("Error deleting schedule:", error);
      // If the database update fails, revert the local state
      fetchSchedules();
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
                  <option value="" disabled>
                    {scheduleData.date && scheduleData.time 
                      ? availableRooms.length === 0 
                        ? "No rooms available for selected time"
                        : "Select a room" 
                      : "First select date and time"}
                  </option>
                  {availableRooms
                    .sort((a, b) => a.id.localeCompare(b.id))
                    .map((room, index) => (
                      <option key={index} value={room.id}>
                        Room {room.id}: {room.name}
                      </option>
                    ))}
                </select>
              </label>
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
            <h3 className="text-lg font-bold mt-4 mb-2">Scheduled Times</h3>
            <table className="min-w-full bg-white border border-gray-300 rounded-md shadow-sm">
              <thead className="bg-blue-100">
                <tr>
                  <th className="py-2 px-4 text-left border-b text-gray-700">Date</th>
                  <th className="py-2 px-4 text-left border-b text-gray-700">Time</th>
                  <th className="py-2 px-4 text-left border-b text-gray-700">Room</th>
                  <th className="py-2 px-4 text-left border-b text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-gray-800">{schedule.date}</td>
                    <td className="py-2 px-4 border-b text-gray-800">{schedule.time}</td>
                    <td className="py-2 px-4 border-b text-gray-800">
                      Room {schedule.room}: {schedule.roomName}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => handleDeleteSchedule(schedule)}
                        className="text-red-600 hover:text-red-800 focus:outline-none"
                        title="Delete Schedule"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-5 w-5" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleMovie;
