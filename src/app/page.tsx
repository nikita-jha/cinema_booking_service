'use client';

import { useEffect, useState } from 'react';
import { getMovie } from '../lib/firebase/firestore';
import MovieCard from '../components/MovieCard';  // Adjust the path as necessary

const HomePage = () => {
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const movieData = await getMovie();
        setMovie(movieData);
      } catch (error) {
        console.error('Error fetching movie:', error);
      }
    };

    fetchMovie();
  }, []);

  if (!movie) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <MovieCard movie={movie} />
    </div>
  );
};

export default HomePage;
