"use client";

import { useState } from "react";
import { addMovie } from "../application/firebase/firestore";

interface AddMovieProps {
  onMovieAdded: () => void; // Callback to notify when a movie is added
}

const AddMovie: React.FC<AddMovieProps> = ({ onMovieAdded }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [movieData, setMovieData] = useState({
    title: "",
    producer: "",
    director: "",
    synopsis: "",
    trailerPictureUrl: "",
    mpaaRating: "",
    category: "",
    trailerVideoUrl: "",
    cast: "",
    reviews: "",
    genre: "",
  });
  const [validationMessages, setValidationMessages] = useState({
    mpaaRating: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMovieData({ ...movieData, [name]: value });

    if (name === "mpaaRating") {
      validateMpaaRating(value);
    }
  };

  const validateMpaaRating = (value) => {
    const validMpaaRatings = ["G", "PG", "PG-13", "R", "NC-17"];
    let message = "";
    if (!validMpaaRatings.includes(value)) {
      message = "Invalid MPAA rating. Please enter a valid rating (G, PG, PG-13, R, NC-17).";
    }
    setValidationMessages((prevMessages) => ({
      ...prevMessages,
      mpaaRating: message,
    }));
  };

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate MPAA rating
    if (validationMessages.mpaaRating) {
      alert(validationMessages.mpaaRating);
      return;
    }

    try {
      await addMovie(movieData); // Add the movie to Firestore
      console.log("Movie successfully added!");
      onMovieAdded(); // Notify parent to re-fetch movies
      setIsFormOpen(false); // Close the form after adding
      setMovieData({
        title: "",
        producer: "",
        director: "",
        synopsis: "",
        trailerPictureUrl: "",
        mpaaRating: "",
        category: "",
        trailerVideoUrl: "",
        cast: "",
        reviews: "",
        genre: "",
      }); // Reset the form fields
    } catch (error) {
      console.error("Error adding movie:", error);
    }
  };

  return (
    <div className="mb-8 flex justify-center">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => setIsFormOpen(true)}
      >
        Add Movie
      </button>

      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">Add New Movie</h3>
            <form onSubmit={handleAddMovie}>
              <input
                type="text"
                name="title"
                value={movieData.title}
                onChange={handleInputChange}
                placeholder="Title *"
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
              <input
                type="text"
                name="producer"
                value={movieData.producer}
                onChange={handleInputChange}
                placeholder="Producer *"
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
              <input
                type="text"
                name="director"
                value={movieData.director}
                onChange={handleInputChange}
                placeholder="Director *"
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
              <input
                type="text"
                name="cast"
                value={movieData.cast}
                onChange={handleInputChange}
                placeholder="Cast *"
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
               <input
                type="text"
                name="genre"
                value={movieData.genre}
                onChange={handleInputChange}
                placeholder="Genre *"
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
              <textarea
                name="synopsis"
                value={movieData.synopsis}
                onChange={handleInputChange}
                placeholder="Synopsis *"
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
              <textarea
                name="reviews"
                value={movieData.reviews}
                onChange={handleInputChange}
                placeholder="Reviews *"
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
              <input
                type="text"
                name="trailerPictureUrl"
                value={movieData.trailerPictureUrl}
                onChange={handleInputChange}
                placeholder="Trailer Picture URL *"
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
              <label htmlFor="mpaaRating">MPAA Rating:</label>
              <input
                type="text"
                id="mpaaRating"
                name="mpaaRating"
                value={movieData.mpaaRating}
                onChange={handleInputChange}
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
              {validationMessages.mpaaRating && <p className="text-red-500 text-sm mt-1">{validationMessages.mpaaRating}</p>}
              <select
                name="category"
                value={movieData.category}
                onChange={handleInputChange}
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              >
                <option value="">Select Category *</option>
                <option value="Currently Screening">Currently Screening</option>
                <option value="Coming Soon">Coming Soon</option>
              </select>
              <input
                type="text"
                name="trailerVideoUrl"
                value={movieData.trailerVideoUrl}
                onChange={handleInputChange}
                placeholder="Trailer Video URL *"
                className="mb-2 w-full p-2 border rounded"
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
                  Add Movie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddMovie;
