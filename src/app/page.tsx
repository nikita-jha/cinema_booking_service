'use client';

import { useEffect, useState } from 'react';
import { getMovies } from '../lib/firebase/firestore';
import MovieCard from '../components/MovieCard';
import AddMovie from '../components/AddMovie';
import Navbar from '../components/Navbar';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

const MovieCarousel = ({ title, movies }) => {
  const [startIndex, setStartIndex] = useState(0);

  const nextSlide = () => {
    setStartIndex((prevIndex) => 
      prevIndex + 4 >= movies.length ? 0 : prevIndex + 4
    );
  };

  const prevSlide = () => {
    setStartIndex((prevIndex) => 
      prevIndex - 4 < 0 ? Math.max(movies.length - 4, 0) : prevIndex - 4
    );
  };

  return (
    <div className="my-12">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">{title}</h2>
      <div className="relative">
        <div className="flex overflow-hidden">
          {movies.slice(startIndex, startIndex + 4).map((movie, index) => (
            <div key={index} className="w-1/4 px-2">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
        {movies.length > 4 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 p-2 rounded-full shadow-md"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 p-2 rounded-full shadow-md"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const HomePage = () => {
  const [currentlyScreeningMovies, setCurrentlyScreeningMovies] = useState([]);
  const [comingSoonMovies, setComingSoonMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchMovies = async () => {
    setIsLoading(true);
    try {
      const moviesData = await getMovies();
      setCurrentlyScreeningMovies(moviesData.filter(movie => movie.category === 'Currently Screening'));
      setComingSoonMovies(moviesData.filter(movie => movie.category === 'Coming Soon'));
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const filteredCurrentlyScreeningMovies = currentlyScreeningMovies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredComingSoonMovies = comingSoonMovies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">Cinema E-Booking</h1>
        
        <div className="relative mb-12">
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>

        <AddMovie onMovieAdded={fetchMovies} />

        <MovieCarousel title="Now Screening" movies={filteredCurrentlyScreeningMovies} />
        <MovieCarousel title="Coming Soon" movies={filteredComingSoonMovies} />
      </div>
    </div>
  );
};

export default HomePage;