// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getMovie } from '../lib/firebase/firestore';

const HomePage = () => {
  const [movie, setMovie] = useState<any>(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const movieData = await getMovie();
        console.log('Fetched Movie Data:', movieData); // Log the movie data
        setMovie(movieData);
      } catch (error) {
        console.error('Error fetching movie:', error); // Log any errors
      }
    };

    fetchMovie();
  }, []);

  if (!movie) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Movie Data</h1>
      <pre>{JSON.stringify(movie, null, 2)}</pre>
    </div>
  );
};

export default HomePage;