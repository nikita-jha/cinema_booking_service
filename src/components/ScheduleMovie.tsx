"use client";

import { useState, useEffect } from "react";
import { addMovieSchedule, getMovieSchedules } from "../lib/firebase/firestore";

interface ScheduleMovieProps {
  movie: { id: string }; // Movie object containing at least the movie ID
  onScheduleAdded: () => void; // Callback to notify when a schedule is added
}

const ScheduleMovie: React.FC<ScheduleMovieProps> = ({ movie, onScheduleAdded }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    date: "",
    time: "",
  });
  const [schedules, setSchedules] = useState<any[]>([]);

  useEffect(() => {
    if (isFormOpen) {
      fetchSchedules();
    }
  }, [isFormOpen]);

  const fetchSchedules = async () => {
    try {
      const schedulesData = await getMovieSchedules(movie.id);
      setSchedules(schedulesData);
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setScheduleData({ ...scheduleData, [name]: value });
  };

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMovieSchedule(movie.id, scheduleData); // Add the schedule to Firestore
      console.log("Schedule successfully added!");
      onScheduleAdded(); // Notify parent to re-fetch schedules
      setSchedules((prevSchedules) => [...prevSchedules, scheduleData]); // Add the new schedule to the list
      setScheduleData({
        date: "",
        time: "",
      }); // Reset the form fields
    } catch (error) {
      console.error("Error adding schedule:", error);
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
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b text-gray-800">{schedule.date}</td>
                    <td className="py-2 px-4 border-b text-gray-800">{schedule.time}</td>
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
