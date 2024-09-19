import { doc, getDocs, collection, addDoc } from 'firebase/firestore';
import { db } from './config';

export const getMovies = async () => {
  console.log('Fetching all movies from Firestore...');
  const moviesCollectionRef = collection(db, 'movies');
  const moviesSnapshot = await getDocs(moviesCollectionRef);

  const movies = moviesSnapshot.docs.map(doc => ({
    id: doc.id,       // Optionally, get the document ID
    ...doc.data(),     // Spread the document data
  }));

  console.log('Movies data fetched:', movies);
  return movies;
};

export const addMovie = async (movie) => {
  try {
    const docRef = await addDoc(collection(db, 'movies'), movie);
    console.log('Movie added with ID:', docRef.id);
  } catch (e) {
    console.error('Error adding movie: ', e);
  }
};