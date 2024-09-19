'use client';

import { useEffect, useState } from 'react';
import { getMovies } from '../lib/firebase/firestore'; // Fetch movies from Firestore
import MovieCard from '../components/MovieCard'; // Movie card component
import AddMovie from '../components/AddMovie'; // Add movie component
import Navbar from '../components/Navbar'; // Navbar component

const HomePage = () => {
  const [currentlyScreeningMovies, setCurrentlyScreeningMovies] = useState([]);
  const [comingSoonMovies, setComingSoonMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query

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

  // Fetch movies on component mount
  useEffect(() => {
    fetchMovies();
  }, []);

  // Filter movies based on the search query (case-insensitive)
  const filteredCurrentlyScreeningMovies = currentlyScreeningMovies.filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredComingSoonMovies = comingSoonMovies.filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (currentlyScreeningMovies.length === 0 && comingSoonMovies.length === 0) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div>
      <Navbar />

      {/* Main content container */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Cinema E-Booking System</h1>

        {/* Add a search bar */}
        <div className="flex justify-center mb-8">
          <input
            type="text"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} // Update search query
            className="border rounded-lg px-4 py-2 w-full max-w-md"
          />
        </div>

        {/* Pass the fetchMovies function to AddMovie to trigger re-fetch */}
        <AddMovie onMovieAdded={fetchMovies} />

        {/* Currently Screening Movies */}
        <h2 className="text-xl font-bold text-center mb-6">Currently Screening</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredCurrentlyScreeningMovies.map((movie, index) => (
            <MovieCard key={index} movie={movie} />
          ))}
        </div>

        {/* Coming Soon Movies */}
        <h2 className="text-xl font-bold text-center mt-12 mb-6">Coming Soon</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredComingSoonMovies.map((movie, index) => (
            <MovieCard key={index} movie={movie} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
