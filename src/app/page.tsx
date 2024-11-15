"use client";

import { useEffect, useState } from "react";
import { getMovies, getShows, getMovieById } from "../lib/firebase/firestore";
import MovieCard from "../components/movieCard";
import Navbar from "../components/Navbar";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Link from 'next/link';
import { auth } from '../lib/firebase/config'; // Firebase Auth
import { onAuthStateChanged } from 'firebase/auth';
import ShowCard from "../components/showCard"; 
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface IShow {
  date: string;
  movieId: string;
  roomId: string;
  time: string;
}

const MovieCarousel = ({ title, movies }) => {
  const [startIndex, setStartIndex] = useState(0);

  const nextSlide = () => {
    setStartIndex((prevIndex) =>
      prevIndex + 4 >= movies.length ? 0 : prevIndex + 4,
    );
  };

  const prevSlide = () => {
    setStartIndex((prevIndex) =>
      prevIndex - 4 < 0 ? Math.max(movies.length - 4, 0) : prevIndex - 4,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [advancedSearch, setAdvancedSearch] = useState({
    title: '',
    category: '',
    showDate: '',
    showDateRange: false,
    endDate: '',
  });
  const [shows, setShows] = useState<IShow[]>([]);

  const fetchMoviesAndShows = async () => {
    setIsLoading(true);
    try {
      const moviesData = await getMovies();
      setCurrentlyScreeningMovies(
        moviesData.filter((movie) => movie.category === "Currently Screening"),
      );
      setComingSoonMovies(
        moviesData.filter((movie) => movie.category === "Coming Soon"),
      );

      const showsData = await getShows();
      setShows(showsData);
    } catch (error) {
      console.error("Error fetching movies or shows:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    fetchMoviesAndShows();

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const matchesShowDate = async () => {
    let filteredMovies = [];
  
    try {
      // Filter shows based on the selected date or date range
      const filteredShows = shows.filter(show => {
        if (advancedSearch.showDateRange && advancedSearch.endDate) {
          const showDate = new Date(show.date);
          const startDate = new Date(advancedSearch.showDate);
          const endDate = new Date(advancedSearch.endDate);
          return showDate >= startDate && showDate <= endDate;
        } else if (advancedSearch.showDate) {
          return new Date(show.date).toDateString() === new Date(advancedSearch.showDate).toDateString();
        }
        return true;
      });
  
      // For each filtered show, fetch the corresponding movie
      for (const show of filteredShows) {
        const movie = await getMovieById(show.movieId);
        if (movie) {
          filteredMovies.push(movie);
        }
      }
    } catch (error) {
      console.error('Error fetching shows or movies:', error);
    }
  
    return filteredMovies;
  };

  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
  const [filteredMovies, setFilteredMovies] = useState([]);

  useEffect(() => {
    if (isAdvancedSearch && (advancedSearch.showDate || advancedSearch.showDateRange)) {
      matchesShowDate().then(setFilteredMovies);
    } else {
      setFilteredMovies(currentlyScreeningMovies);
    }
  }, [isAdvancedSearch, advancedSearch, currentlyScreeningMovies, shows]);

  const filteredCurrentlyScreeningMovies = filteredMovies.filter(
    (movie) => {
      const matchesTitle = isAdvancedSearch
        ? movie.title.toLowerCase().includes(advancedSearch.title.toLowerCase())
        : movie.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = advancedSearch.category
        ? movie.genre?.toLowerCase().includes(advancedSearch.category.toLowerCase())
        : true;
      const matchesShowDate = advancedSearch.showDate
        ? new Date(movie.showDate).toDateString() === new Date(advancedSearch.showDate).toDateString()
        : true;
      const matchesDateRange = advancedSearch.showDateRange && advancedSearch.endDate
        ? new Date(movie.showDate) >= new Date(advancedSearch.showDate) && new Date(movie.showDate) <= new Date(advancedSearch.endDate)
        : true;
      return matchesTitle && matchesCategory && (advancedSearch.showDateRange ? matchesDateRange : matchesShowDate);
    }
  );
  
  
  const filteredComingSoonMovies = comingSoonMovies.filter(
    (movie) => {
      const matchesTitle = isAdvancedSearch
        ? movie.title.toLowerCase().includes(advancedSearch.title.toLowerCase())
        : movie.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = advancedSearch.category
        ? movie.genre?.toLowerCase().includes(advancedSearch.category.toLowerCase())
        : true;
      const matchesShowDate = advancedSearch.showDate
        ? new Date(movie.showDate).toDateString() === new Date(advancedSearch.showDate).toDateString()
        : true;
      const matchesDateRange = advancedSearch.showDateRange && advancedSearch.endDate
        ? new Date(movie.showDate) >= new Date(advancedSearch.showDate) && new Date(movie.showDate) <= new Date(advancedSearch.endDate)
        : true;
      return matchesTitle && matchesCategory && (advancedSearch.showDateRange ? matchesDateRange : matchesShowDate);
    }
  );

  const handleAdvancedSearchChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAdvancedSearch((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleDateChange = (date) => {
    setAdvancedSearch((prev) => ({
      ...prev,
      showDate: date,
    }));
  };

  const handleAdvancedSearch = () => {
    setIsAdvancedSearchOpen(false);
  };

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
        <div className="header relative">
          <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
            Cinema E-Booking
          </h1>
          <button
            onClick={() => setIsAdvancedSearch(!isAdvancedSearch)}
            className="absolute top-0 right-0 mt-4 mr-4 px-4 py-2 bg-blue-500 text-white rounded-full"
          >
            {isAdvancedSearch ? 'Basic Search' : 'Advanced Search'}
          </button>
        </div>
  
        {isAdvancedSearch ? (
          <>
            <div className="relative mb-12">
              <input
                type="text"
                placeholder="Search by title..."
                name="title"
                value={advancedSearch.title}
                onChange={handleAdvancedSearchChange}
                className="w-full px-4 py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>
            <div className="relative mb-12">
              <input
                type="text"
                placeholder="Search by category..."
                name="category"
                value={advancedSearch.category}
                onChange={handleAdvancedSearchChange}
                className="w-full px-4 py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>
            <div className="relative mb-12">
              <input
                type="date"
                placeholder="Search by show date..."
                name="showDate"
                value={advancedSearch.showDate}
                onChange={handleAdvancedSearchChange}
                className="w-full px-4 py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>
            <div className="relative mb-12">
              <label className="block mb-2">
                <input
                  type="checkbox"
                  name="showDateRange"
                  checked={advancedSearch.showDateRange}
                  onChange={handleAdvancedSearchChange}
                  className="mr-2"
                />
                Show Date Range
              </label>
              {advancedSearch.showDateRange && (
                <input
                  type="date"
                  name="endDate"
                  value={advancedSearch.endDate}
                  onChange={handleAdvancedSearchChange}
                  className="w-full px-4 py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              )}
            </div>
          </>
        ) : (
          <div className="relative mb-12">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
        )}
  
        {filteredCurrentlyScreeningMovies.length === 0 && filteredComingSoonMovies.length === 0 ? (
          <div className="text-center text-gray-800 text-xl mt-12">
            No results found
          </div>
        ) : (
          <>
            {filteredCurrentlyScreeningMovies.length > 0 && (
              <MovieCarousel
                title="Now Screening"
                movies={filteredCurrentlyScreeningMovies}
              />
            )}
            {filteredComingSoonMovies.length > 0 && (
              <MovieCarousel 
                title="Coming Soon" 
                movies={filteredComingSoonMovies} 
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
