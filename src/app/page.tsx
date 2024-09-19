'use client';

import { useEffect, useState } from 'react';
import { getMovies } from '../lib/firebase/firestore'; // Fetch movies from Firestore
import MovieCard from '../components/MovieCard'; // Movie card component
import AddMovie from '../components/AddMovie'; // Movie card component

interface Movie {
  id: string;
  title: string;
  category: string;
  // ... other movie properties
}

const HomePage = () => {
  const [currentlyScreeningMovies, setCurrentlyScreeningMovies] = useState<Movie[]>([]);
  const [comingSoonMovies, setComingSoonMovies] = useState<Movie[]>([]);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const moviesData = await getMovies();
      const currentlyScreening = moviesData.filter(
        (movie) => movie.category === 'Currently Screening'
      );
      const comingSoon = moviesData.filter(
        (movie) => movie.category === 'Coming Soon'
      );
      setCurrentlyScreeningMovies(currentlyScreening);
      setComingSoonMovies(comingSoon);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const handleMovieAdded = (newMovie: Movie) => {
    if (newMovie.category === 'Currently Screening') {
      setCurrentlyScreeningMovies((prev) => [...prev, newMovie]);
    } else if (newMovie.category === 'Coming Soon') {
      setComingSoonMovies((prev) => [...prev, newMovie]);
    }
  };

  if (currentlyScreeningMovies.length === 0 && comingSoonMovies.length === 0) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AddMovie onMovieAdded={handleMovieAdded} />
      {/* Currently Screening Movies */}
      <h1 className="text-2xl font-bold text-center mb-6">Currently Screening</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentlyScreeningMovies.map((movie, index) => (
          <MovieCard key={index} movie={movie} />
        ))}
      </div>

      {/* Coming Soon Movies */}
      <h1 className="text-2xl font-bold text-center mt-12 mb-6">Coming Soon</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {comingSoonMovies.map((movie, index) => (
          <MovieCard key={index} movie={movie} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
