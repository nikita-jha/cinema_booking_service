'use client';

import { useEffect, useState } from 'react';
import { getMovies } from '../lib/firebase/firestore'; // Fetch movies from Firestore
import MovieCard from '../components/MovieCard'; // Movie card component
import AddMovie from '../components/AddMovie'; // Movie card component

const HomePage = () => {
  const [currentlyScreeningMovies, setCurrentlyScreeningMovies] = useState([]);
  const [comingSoonMovies, setComingSoonMovies] = useState([]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const moviesData = await getMovies();

        // Filter movies based on category
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

    fetchMovies();
  }, []);

  if (currentlyScreeningMovies.length === 0 && comingSoonMovies.length === 0) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AddMovie />
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
