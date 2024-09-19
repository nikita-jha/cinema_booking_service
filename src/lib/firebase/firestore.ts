// firebase/firestore.ts
import { doc, getDoc } from 'firebase/firestore';
import { db } from './config';

export const getMovie = async () => {
  console.log('Fetching movie from Firestore...'); // Log fetch operation start
  const movieDocRef = doc(db, 'movies', 'xydFTps2l2ghe2NZyWuk'); // Replace with your actual document ID
  const movieSnapshot = await getDoc(movieDocRef);

  if (movieSnapshot.exists()) {
    console.log('Movie data fetched:', movieSnapshot.data()); // Log the fetched movie data
    return movieSnapshot.data();
  } else {
    console.log('No such document!'); // Log if the document does not exist
    return null;
  }
};