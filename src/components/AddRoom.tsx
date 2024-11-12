"use client";

import { useState } from "react";
import { addRoom } from "../lib/firebase/firestore";

interface AddRoomProps {
    onRoomAdded: () => void; // Callback to notify when a room is added
}

const AddRoom: React.FC<AddRoomProps> = ({ onRoomAdded }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [roomData, setRoomData] = useState({
        name: "",
        seatsAvailable: "",
        booked: "",
        id: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRoomData({ ...roomData, [name]: value });
    };

    const handleAddRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addRoom(roomData); // Add the room to Firestore
            console.log("Room successfully added!");
            onRoomAdded(); // Notify parent to re-fetch rooms
            setIsFormOpen(false); // Close the form after adding
            setRoomData({
                name: "",
                seatsAvailable: "",
                booked: "",
                id: "",
            }); // Reset the form fields
        } catch (error) {
            console.error("Error adding room:", error);
        }
    };

    return (
        <div className="mb-8 flex justify-center">
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => setIsFormOpen(true)}
            >
                Add Room
            </button>

            {isFormOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <h3 className="text-lg font-bold mb-4">Add New Room</h3>
                        <form onSubmit={handleAddRoom}>
                            <input
                                type="text"
                                name="name"
                                value={roomData.name}
                                onChange={handleInputChange}
                                placeholder="Name *"
                                className="mb-2 w-full p-2 border rounded text-gray-800"
                                required
                            />
                            <input
                                type="number"
                                name="seatsAvailable"
                                value={roomData.seatsAvailable}
                                onChange={handleInputChange}
                                placeholder="Seats Available *"
                                className="mb-2 w-full p-2 border rounded text-gray-800"
                                required
                            />
                            <input
                                type="datetime-local"
                                name="booked"
                                value={roomData.booked}
                                onChange={handleInputChange}
                                placeholder="Booked *"
                                className="mb-2 w-full p-2 border rounded text-gray-800"
                            />
                            <input
                                type="text"
                                name="id"
                                value={roomData.id}
                                onChange={handleInputChange}
                                placeholder="ID *"
                                className="mb-2 w-full p-2 border rounded text-gray-800"
                                required
                            />
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
                                    Add Room
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddRoom;
