'use client';

import { useState } from 'react';
import { addMovie } from '../lib/firebase/firestore';

interface AddMovieProps {
  onMovieAdded: (newMovie: any) => void;
}

const AddMovie: React.FC<AddMovieProps> = ({ onMovieAdded }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [movieData, setMovieData] = useState({
    title: '',
    producer: '',
    director: '',
    synopsis: '',
    trailerPictureUrl: '',
    mpaaRating: '',
    category: '',
    trailerVideoUrl: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMovieData({ ...movieData, [name]: value });
  };

  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newMovieId = await addMovie(movieData);
      console.log('Movie successfully added!');
      onMovieAdded({ id: newMovieId, ...movieData });
      setIsFormOpen(false);
      setMovieData({
        title: '',
        producer: '',
        director: '',
        synopsis: '',
        trailerPictureUrl: '',
        mpaaRating: '',
        category: '',
        trailerVideoUrl: '',
      });
    } catch (error) {
      console.error('Error adding movie:', error);
    }
  };

  return (
    <div className="mb-8">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => setIsFormOpen(true)}
      >
        Add Movie
      </button>

      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">Add New Movie</h3>
            <form onSubmit={handleAddMovie}>
              <input
                type="text"
                name="title"
                value={movieData.title}
                onChange={handleInputChange}
                placeholder="Title"
                className="mb-2 w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                name="producer"
                value={movieData.producer}
                onChange={handleInputChange}
                placeholder="Producer"
                className="mb-2 w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                name="director"
                value={movieData.director}
                onChange={handleInputChange}
                placeholder="Director"
                className="mb-2 w-full p-2 border rounded"
                required
              />
              <textarea
                name="synopsis"
                value={movieData.synopsis}
                onChange={handleInputChange}
                placeholder="Synopsis"
                className="mb-2 w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                name="trailerPictureUrl"
                value={movieData.trailerPictureUrl}
                onChange={handleInputChange}
                placeholder="Trailer Picture URL"
                className="mb-2 w-full p-2 border rounded"
              />
              <input
                type="text"
                name="mpaaRating"
                value={movieData.mpaaRating}
                onChange={handleInputChange}
                placeholder="MPAA Rating"
                className="mb-2 w-full p-2 border rounded"
                required
              />
              <select
                name="category"
                value={movieData.category}
                onChange={handleInputChange}
                className="mb-2 w-full p-2 border rounded"
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
