"use client";

import { useEffect, useState } from "react";
import { getMovies } from "../controller/firebase/firestore";
import MovieCard from "../components/movieCard";
import Navbar from "../components/Navbar";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Link from 'next/link';
import { auth, db } from '../controller/firebase/config'; // Firebase Auth and Firestore
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

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
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false); // Define isAdvancedSearch state
  const [advancedSearch, setAdvancedSearch] = useState({
    title: '',
    category: '',
    showDate: '',
  });
  const [showtimes, setShowtimes] = useState<{ [movieId: string]: string[] }>({});

  const fetchMovies = async () => {
    setIsLoading(true);
    try {
      const moviesData = await getMovies();
      console.log(moviesData); // Check if image URLs are being retrieved
      setCurrentlyScreeningMovies(
        moviesData.filter((movie) => movie.category === "Currently Screening"),
      );
      setComingSoonMovies(
        moviesData.filter((movie) => movie.category === "Coming Soon"),
      );
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
    setIsLoading(false);
  };

  const fetchShowtimesForMovies = async (date: string, movies: any[]) => {
    const newShowtimes: { [movieId: string]: string[] } = {};

    for (const movie of movies) {
      try {
        const showsRef = collection(db, "Shows");
        const q = query(
          showsRef,
          where("movieId", "==", movie.id),
          where("date", "==", date)
        );
        const snapshot = await getDocs(q);

        const times = snapshot.docs.map((doc) => doc.data().time);
        newShowtimes[movie.id] = times;
      } catch (error) {
        console.error("Error fetching showtimes:", error);
      }
    }

    setShowtimes(newShowtimes);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    fetchMovies();

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (advancedSearch.showDate) {
      fetchShowtimesForMovies(advancedSearch.showDate, [...currentlyScreeningMovies, ...comingSoonMovies]);
    }
  }, [advancedSearch.showDate, currentlyScreeningMovies, comingSoonMovies]);

  const filteredCurrentlyScreeningMovies = currentlyScreeningMovies.filter(
    (movie) => {
      const matchesTitle = isAdvancedSearch
        ? movie.title.toLowerCase().includes(advancedSearch.title.toLowerCase())
        : movie.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = advancedSearch.category
        ? movie.genre?.toLowerCase().includes(advancedSearch.category.toLowerCase())
        : true;
      const matchesShowDate = advancedSearch.showDate
        ? showtimes[movie.id]?.length > 0
        : true;
      return matchesTitle && matchesCategory && matchesShowDate;
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
        ? showtimes[movie.id]?.length > 0
        : true;
      return matchesTitle && matchesCategory && matchesShowDate;
    }
  );

  const handleAdvancedSearchChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAdvancedSearch((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSearchToggle = () => {
    if (isAdvancedSearch) {
      window.location.reload(); // Reload the page when switching from advanced search to basic search
    } else {
      setIsAdvancedSearch(true);
    }
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
            onClick={handleSearchToggle}
            className="absolute top-0 right-0 mt-4 mr-4 px-4 py-2 bg-blue-500 text-white rounded-full"
          >
            {isAdvancedSearch ? 'Basic Search' : 'Advanced Search'}
          </button>
        </div>
  
        {isAdvancedSearch ? (
          <>
            <p className="text-center text-gray-600 mb-4">
              Search by title, genre/category, or show date.
            </p>
            <div className="flex space-x-4 mb-12">
              <input
                type="text"
                placeholder="Search by title..."
                name="title"
                value={advancedSearch.title}
                onChange={handleAdvancedSearchChange}
                className="flex-grow px-4 py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Search by category..."
                name="category"
                value={advancedSearch.category}
                onChange={handleAdvancedSearchChange}
                className="flex-grow px-4 py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                placeholder="Search by show date..."
                name="showDate"
                value={advancedSearch.showDate}
                onChange={handleAdvancedSearchChange}
                className="w-40 px-4 py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        ) : (
          <div className="relative mb-12">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
        )}
  
        {filteredCurrentlyScreeningMovies.length === 0 && filteredComingSoonMovies.length === 0 ? (
          <div className="text-center text-gray-800 text-xl mt-12">
            No results found with current search criteria.
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