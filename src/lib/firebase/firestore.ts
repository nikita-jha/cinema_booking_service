import { doc, getDoc } from 'firebase/firestore';
import { db } from './config';

export const getMovie = async () => {
  console.log('Fetching movie from Firestore...');
  const movieDocRef = doc(db, 'movies', 'xydFTps2l2ghe2NZyWuk'); 
  const movieSnapshot = await getDoc(movieDocRef);

  if (movieSnapshot.exists()) {
    console.log('Movie data fetched:', movieSnapshot.data());
    return movieSnapshot.data();
  } else {
    console.log('No such document!');
    return null;
  }
};
