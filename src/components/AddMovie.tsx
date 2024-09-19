'use client';

import { useState } from 'react';
import { addMovie } from '../lib/firebase/firestore';

const AddMovie = () => {
  const [movieData, setMovieData] = useState({
    title: "Harry Potter and the Sorcerer's Stone",
    producer: 'David Heyman',
    director: 'Chris Columbus',
    synopsis:
      'An orphaned boy enrolls in a school of wizardry, where he learns the truth about himself, his family, and the evil that haunts the magical world.',
    trailerPictureUrl:
      'https://m.media-amazon.com/images/M/MV5BNmQ0ODBhMjUtNDRhOC00MGQzLTk5MTAtZDliODg5NmU5MjZhXkEyXkFqcGdeQXVyNDUyOTg3Njg@._V1_.jpg',
    mpaaRating: 'PG',
    reviews: {
      user: 'user123',
      rating: 8,
      comment: 'A magical start to a legendary series!',
    },
    showDatesTimes: [{ seconds: 1726832000, nanoseconds: 725000000 }],
    category: 'Classic',
    trailerVideoUrl: 'https://www.youtube.com/embed/VyHV0BRtdxo',
  });
  

  const handleAddMovie = async () => {
    try {
      await addMovie(movieData);
      console.log('Movie successfully added!');
    } catch (error) {
      console.error('Error adding movie:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleAddMovie}
      >
        Add Movie
      </button>
    </div>
  );
};

export default AddMovie;
