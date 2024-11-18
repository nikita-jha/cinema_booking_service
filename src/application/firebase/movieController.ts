import { collection, doc, getDocs, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './config';
import { IMovie } from '@/domain/movie.model';

export const getMovies = async (): Promise<IMovie[]> => {
  const moviesCollectionRef = collection(db, 'movies');
  const moviesSnapshot = await getDocs(moviesCollectionRef);
  return moviesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data() as Omit<IMovie, 'id'>,
  }));
};

export const addMovie = async (movie: IMovie) => {
  try {
    const docRef = await addDoc(collection(db, 'movies'), movie);
    console.log('Movie added with ID:', docRef.id);
    return docRef.id;
  } catch (e) {
    console.error('Error adding movie: ', e);
    throw e;
  }
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
