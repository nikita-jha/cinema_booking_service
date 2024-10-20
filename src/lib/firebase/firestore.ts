import { getDocs, collection, addDoc, deleteDoc, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore'; // Ensure setDoc is imported
import { db } from './config';
import { auth } from './config'; // Add Firebase Auth import
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'; // Import auth functions
import { IMovie } from '@/models/movie.model';
import { IUser } from '@/models/user.model';
import { IPromotion } from '@/models/promotion.model';


// Function to create a new user in Firebase Authentication and Firestore
export const registerUser = async (userData: IUser) => {
  const { email, password, firstName, lastName, phone, street, city, state, zip, promotionalEmails } = userData;

  try {
    // Step 1: Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Step 2: Add user data to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email,
      firstName,
      lastName,
      phone,
      address: {
        street,
        city,
        state,
        zip,
      },
      status: 'active',
      promotionalEmails,
    });

    // Step 3: Send email verification
    await sendEmailVerification(user);
    console.log(`User created with ID: ${user.uid}, verification email sent.`);

  } catch (error) {
    console.error('Error during user registration:', error);
    throw error;
  }
};

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

export const addMovieSchedule = async (movieId: string, schedule: any) => {
  try {
    const movieDocRef = doc(db, 'movies', movieId);
    const movieDoc = await getDoc(movieDocRef);

    if (!movieDoc.exists()) {
      console.error('Movie does not exist');  
      return;
    }

    const movieData = movieDoc.data();
    if (!movieData.schedules) {
      movieData.schedules = [];
    }

    movieData.schedules.push(schedule);

    await updateDoc(movieDocRef, movieData);
    console.log('Schedule added to movie with ID:', movieId);
  } catch (error) {
    console.error('Error adding schedule:', error);
    throw error;
  }
};

export const getMovieSchedules = async (movieId: string): Promise<any[]> => {
  try {
    const movieDocRef = doc(db, 'movies', movieId);
    const movieDoc = await getDoc(movieDocRef);

    if (!movieDoc.exists()) {
      console.error('Movie does not exist');
      return [];
    }

    const movieData = movieDoc.data();
    return movieData.schedules || [];
  } catch (error) {
    console.error('Error fetching schedules:', error);
    throw error;
  }
};

export const getUsers = async (): Promise<IUser[]> => {
  const usersCollectionRef = collection(db, 'users');
  const usersSnapshot = await getDocs(usersCollectionRef);
  const users: IUser[] = usersSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data() as Omit<IUser, 'id'>,
  }));
  return users;
};

export const deleteUser = async (id: string) => {
  try {
    const userDocRef = doc(db, 'users', id);
    await deleteDoc(userDocRef);
    console.log('User deleted with ID:', id);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const addUser = async (user: any) => {
  try {
    const docRef = await addDoc(collection(db, 'users'), user);
    console.log('User added with ID:', docRef.id);
    return docRef.id;
  } catch (e) {
    console.error('Error adding user: ', e);
    throw e;
  }
};

export const updateUser = async (id: string, user: IUser) => {
  try {
    const userDocRef = doc(db, 'users', id);
    await updateDoc(userDocRef, user);
    console.log('User updated with ID:', id);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const getPromotions = async (): Promise<IPromotion[]> => {
  const promotionsCollectionRef = collection(db, 'promotions');
  const promotionsSnapshot = await getDocs(promotionsCollectionRef);
  const promotions: IPromotion[] = promotionsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data() as Omit<IPromotion, 'id'>,
  }));
  return promotions;
};

export const deletePromotion = async (id: string) => {
  try {
    const promotionDocRef = doc(db, 'promotions', id);
    await deleteDoc(promotionDocRef);
    console.log('Promotion deleted with ID:', id);
  } catch (error) {
    console.error('Error deleting promotion:', error);
    throw error;
  }
};

export const addPromotion = async (promotion: any) => {
  try {
    const docRef = await addDoc(collection(db, 'promotions'), promotion);
    console.log('Promotion added with ID:', docRef.id);
    return docRef.id;
  } catch (e) {
    console.error('Error adding promotion: ', e);
    throw e;
  }
};

export const updatePromotion = async (id: string, promotion: IPromotion) => {
  try {
    const promotionDocRef = doc(db, 'promotions', id);
    await updateDoc(promotionDocRef, promotion);
    console.log('Promotion updated with ID:', id);
  } catch (error) {
    console.error('Error updating promotion:', error);
    throw error;
  }
};

