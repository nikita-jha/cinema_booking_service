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
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
  const [advancedSearch, setAdvancedSearch] = useState({
    title: '',
    category: '',
    showDate: null,
    showDateRange: false,
    endDate: null,
  });
  const [shows, setShows] = useState<IShow[]>([]);
  const [filteredCurrentlyScreeningMovies, setFilteredCurrentlyScreeningMovies] = useState([]);
  const [filteredComingSoonMovies, setFilteredComingSoonMovies] = useState([]);

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

  useEffect(() => {
    const filterMovies = async () => {
      if (isAdvancedSearch && (advancedSearch.showDate || advancedSearch.showDateRange)) {
        // Advanced search with date or date range
        const selectedStartDate = advancedSearch.showDate
          ? new Date(advancedSearch.showDate).toISOString().split('T')[0]
          : null;
        const selectedEndDate =
          advancedSearch.showDateRange && advancedSearch.endDate
            ? new Date(advancedSearch.endDate).toISOString().split('T')[0]
            : null;

        // Filter shows based on date
        const filteredShows = shows.filter((show) => {
          const showDateStr = show.date; // 'YYYY-MM-DD'

          if (selectedStartDate && selectedEndDate) {
            return showDateStr >= selectedStartDate && showDateStr <= selectedEndDate;
          } else if (selectedStartDate) {
            return showDateStr === selectedStartDate;
          }
          return true;
        });

        // Get unique movie IDs from filtered shows
        const movieIds = Array.from(new Set(filteredShows.map((show) => show.movieId)));

        // Fetch movies corresponding to filtered shows
        const movies = [];
        for (const movieId of movieIds) {
          const movie = await getMovieById(movieId);
          if (movie) {
            movies.push(movie);
          }
        }

        // Now apply title and category filters
        const filteredMovies = movies.filter((movie) => {
          const matchesTitle = advancedSearch.title
            ? movie.title.toLowerCase().includes(advancedSearch.title.toLowerCase())
            : true;
          const matchesCategory = advancedSearch.category
            ? movie.genre?.toLowerCase().includes(advancedSearch.category.toLowerCase())
            : true;
          return matchesTitle && matchesCategory;
        });

        // Separate movies into currently screening and coming soon
        setFilteredCurrentlyScreeningMovies(
          filteredMovies.filter((movie) => movie.category === "Currently Screening"),
        );
        setFilteredComingSoonMovies(
          filteredMovies.filter((movie) => movie.category === "Coming Soon"),
        );
      } else {
        // Basic search or advanced search without date
        const filterFunction = (movie) => {
          const query = isAdvancedSearch ? advancedSearch.title : searchQuery;
          const category = isAdvancedSearch ? advancedSearch.category : '';
          const matchesTitle = movie.title.toLowerCase().includes(query.toLowerCase());
          const matchesCategory = category
            ? movie.genre?.toLowerCase().includes(category.toLowerCase())
            : true;
          return matchesTitle && matchesCategory;
        };

        setFilteredCurrentlyScreeningMovies(
          currentlyScreeningMovies.filter(filterFunction),
        );
        setFilteredComingSoonMovies(
          comingSoonMovies.filter(filterFunction),
        );
      }
    };

    filterMovies();
  }, [isAdvancedSearch, advancedSearch, searchQuery, currentlyScreeningMovies, comingSoonMovies, shows]);

  const handleAdvancedSearchChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAdvancedSearch((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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
              <DatePicker
                selected={
                  advancedSearch.showDate ? new Date(advancedSearch.showDate) : null
                }
                onChange={(date) =>
                  setAdvancedSearch((prev) => ({ ...prev, showDate: date }))
                }
                dateFormat="yyyy-MM-dd"
                placeholderText="Search by show date..."
                className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
                <DatePicker
                  selected={
                    advancedSearch.endDate ? new Date(advancedSearch.endDate) : null
                  }
                  onChange={(date) =>
                    setAdvancedSearch((prev) => ({ ...prev, endDate: date }))
                  }
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select end date"
                  className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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

        {filteredCurrentlyScreeningMovies.length === 0 &&
        filteredComingSoonMovies.length === 0 ? (
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
