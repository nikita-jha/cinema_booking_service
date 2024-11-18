"use client";

import { useState, useEffect } from "react";
import { updateMovie } from "../controller/firebase/firestore";
import { IMovie } from "@/models/movie.model";

interface EditMovieProps {
  movie: IMovie;
  onMovieUpdated: () => void;
}

const EditMovie: React.FC<EditMovieProps> = ({ movie, onMovieUpdated }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [movieData, setMovieData] = useState<IMovie>(movie);

  useEffect(() => {
    setMovieData(movie);
  }, [movie]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMovieData({ ...movieData, [name]: value });
  };

  const handleUpdateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMovie(movie.id, movieData);
      console.log("Movie successfully updated!");
      onMovieUpdated();
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error updating movie:", error);
    }
  };

  return (
    <div className="mb-8 flex justify-center">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => setIsFormOpen(true)}
      >
        Edit
      </button>

      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={() => setIsFormOpen(false)}
            >
              &#10005;
            </button>
            <h3 className="text-lg font-bold mb-4">Edit Movie</h3>
            <form onSubmit={handleUpdateMovie}>
              <input
                type="text"
                name="title"
                value={movieData.title}
                onChange={handleInputChange}
                placeholder="Title"
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
              <input
                type="text"
                name="producer"
                value={movieData.producer}
                onChange={handleInputChange}
                placeholder="Producer"
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
              <input
                type="text"
                name="director"
                value={movieData.director}
                onChange={handleInputChange}
                placeholder="Director"
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
              <input
                type="text"
                name="cast"
                value={movieData.cast}
                onChange={handleInputChange}
                placeholder="Cast"
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
              <input
                type="text"
                name="genre"
                value={movieData.genre}
                onChange={handleInputChange}
                placeholder="Genre"
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
              <textarea
                name="synopsis"
                value={movieData.synopsis}
                onChange={handleInputChange}
                placeholder="Synopsis"
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
              <textarea
                name="reviews"
                value={movieData.reviews}
                onChange={handleInputChange}
                placeholder="Reviews"
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
              <input
                type="text"
                name="trailerPictureUrl"
                value={movieData.trailerPictureUrl}
                onChange={handleInputChange}
                placeholder="Trailer Picture URL"
                className="mb-2 w-full p-2 border rounded text-gray-800"
              />
              <input
                type="text"
                name="mpaaRating"
                value={movieData.mpaaRating}
                onChange={handleInputChange}
                placeholder="MPAA Rating"
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              />
              <select
                name="category"
                value={movieData.category}
                onChange={handleInputChange}
                className="mb-2 w-full p-2 border rounded text-gray-800"
                required
              >
                <option value="">Select Category</option>
                <option value="Currently Screening">Currently Screening</option>
                <option value="Coming Soon">Coming Soon</option>
              </select>
              <input
                type="text"
                name="trailerVideoUrl"
                value={movieData.trailerVideoUrl}
                onChange={handleInputChange}
                placeholder="Trailer Video URL"
                className="mb-2 w-full p-2 border rounded"
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
                  Update Movie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditMovie;