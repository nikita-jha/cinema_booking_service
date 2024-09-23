import { getDocs, collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from './config';
import { IMovie } from '@/models/movie.model';

export const getMovies = async (): Promise<IMovie[]> => {
  console.log('Fetching all movies from Firestore...');
  const moviesCollectionRef = collection(db, 'movies');
  const moviesSnapshot = await getDocs(moviesCollectionRef);
  const movies: IMovie[] = moviesSnapshot.docs.map(doc => {
    console.log('%c🔥 DOCUMENT ID: ' + doc.id + ' 🔥', 'color: red; font-size: 24px; font-weight: bold; background-color: yellow; padding: 10px;');
    return {
      id: doc.id,
      ...doc.data() as Omit<IMovie, 'id'>,
    };
  });

  console.log('%c🎬 MOVIES FETCHED SUCCESSFULLY! 🎬', 'color: green; font-size: 20px; font-weight: bold; background-color: yellow; padding: 10px;');
  console.table(movies.map(movie => ({ id: movie.id, title: movie.title })));
  return movies;
};

export const deleteMovie = async (id: string) => {
  try {
    const movieDocRef = doc(db, 'movies', id);
    await deleteDoc(movieDocRef);
    console.log('Movie deleted with ID:', id);
  } catch (error) {
    console.error('Error deleting movie:', error);
    throw error;
  }
};

export const addMovie = async (movie: any) => {
  try {
    const docRef = await addDoc(collection(db, 'movies'), movie);
    console.log('Movie added with ID:', docRef.id);
    return docRef.id;
  } catch (e) {
    console.error('Error adding movie: ', e);
    throw e;
  }
};

export const updateMovie = async (id: string, movie: IMovie) => {
  try {
    const movieDocRef = doc(db, 'movies', id);
    await updateDoc(movieDocRef, movie);
    console.log('Movie updated with ID:', id);
  } catch (error) {
    console.error('Error updating movie:', error);
    throw error;
  }
};