import { writeBatch, getDocs, collection, addDoc, deleteDoc, doc, updateDoc, getDoc, setDoc, deleteField, query, where } from 'firebase/firestore'; // Ensure setDoc is imported
import { db } from './config';
import { auth } from './config'; // Add Firebase Auth import
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'; // Import auth functions
import { IMovie } from '@/domain/movie.model';
import { IUser } from '@/domain/user.model';
import { IPromotion } from '@/domain/promotion.model';


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

export const addBooking = async (roomId: string, movieName: string, date: string, time: string) => {
  try {
    const roomRef = doc(db, 'rooms', roomId);
    
    // Create a unique key for the booking using movie name and time
    const bookingKey = `${movieName}_${date}_${time}`;
    
    // Update the bookings map in the room document
    await updateDoc(roomRef, {
      [`bookings.${bookingKey}`]: {
        movie: movieName,
        time: new Date(`${date}T${time}`)
      }
    });

    console.log('Booking added for room:', roomId);
    return true;
  } catch (error) {
    console.error('Error adding booking:', error);
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



export const getRooms = async (): Promise<any[]> => {
  const roomsCollectionRef = collection(db, 'rooms');
  const roomsSnapshot = await getDocs(roomsCollectionRef);
  return roomsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};


export const addMovieScheduleWithSeats = async (
  movieId: string,
  date: string,
  startTime: string,
  roomId: string,
  totalSeats = 100 // Default total seats
) => {
  try {
    // Reference top-level "Shows" collection
    const showsRef = collection(db, "Shows");

    // Query for existing schedules with the same date and room
    const roomDateQuery = query(
      showsRef,
      where("date", "==", date),
      where("roomId", "==", roomId)
    );
    const scheduleSnapshot = await getDocs(roomDateQuery);

    // Convert the new schedule's start and end times to Date objects
    const newScheduleStart = new Date(`${date}T${startTime}`);
    const newScheduleEnd = new Date(newScheduleStart.getTime() + 3 * 60 * 60 * 1000); // Assuming 3-hour duration

    // Check for conflicts with existing schedules
    let conflictExists = false;

    scheduleSnapshot.forEach((doc) => {
      const schedule = doc.data();
      const existingStart = new Date(`${schedule.date}T${schedule.time}`);
      const existingEnd = new Date(existingStart.getTime() + 3 * 60 * 60 * 1000);

      if (
        (newScheduleStart >= existingStart && newScheduleStart < existingEnd) || // Overlaps start
        (newScheduleEnd > existingStart && newScheduleEnd <= existingEnd) || // Overlaps end
        (newScheduleStart <= existingStart && newScheduleEnd >= existingEnd) // Fully overlaps
      ) {
        conflictExists = true;
      }
    });

    if (conflictExists) {
      throw new Error("Scheduling conflict detected. Please choose a different time or room.");
    }

    // Add the new Show document if no conflict
    const newShowRef = doc(db, "Shows", `${movieId}-${date}-${startTime}`);
    await setDoc(newShowRef, {
      movieId,
      date,
      time: startTime,
      roomId,
    });

    // Initialize seats for this show
    await initializeSeatsForShow(`${movieId}-${date}-${startTime}`, totalSeats);

    console.log("Show and seats added successfully!");
  } catch (error) {
    console.error("Error adding show and seats:", error);
    throw error;
  }
};



export const fetchSeatsForShow = async (showId: string) => {
  const seatsRef = collection(db, "Shows", showId, "Seats");
  const seatsSnapshot = await getDocs(seatsRef);

  const seats = seatsSnapshot.docs.map((doc) => ({
    seatNumber: doc.data().seatNumber,
    isReserved: doc.data().isReserved,
    reservedBy: doc.data().reservedBy,
  }));

  // Sort seats numerically by seatNumber
  seats.sort((a, b) => a.seatNumber - b.seatNumber);

  console.log("Fetched and sorted seats:", seats);
  return seats;
};

export const reserveSeats = async (
  showId: string,
  seats: { seat: number; age: number }[],
  userId: string
) => {
  try {
    const seatsRef = collection(db, "Shows", showId, "Seats");

    for (const { seat, age } of seats) {
      const seatDocRef = doc(seatsRef, `seat${seat}`);
      await updateDoc(seatDocRef, {
        isReserved: true,
        reservedBy: userId,
        reservationTimestamp: new Date().toISOString(),
        age, // Ensure age is included
      });
    }

    // console.log("Seats reserved successfully!");
  } catch (error) {
    console.error("Error reserving seats:", error);
    throw error;
  }
};



export const initializeSeatsForShow = async (showId: string, totalSeats: number) => {
  try {
    const seatsRef = collection(db, "Shows", showId, "Seats");
    const batch = writeBatch(db); // Correct usage of writeBatch

    for (let i = 1; i <= totalSeats; i++) {
      const seatDocRef = doc(seatsRef, `seat${i}`);
      batch.set(seatDocRef, {
        seatNumber: i,
        isReserved: false,
        reservedBy: null,
        reservationTimestamp: null,
      });
    }

    await batch.commit(); // Commit the batch
    console.log(`Initialized ${totalSeats} seats for show: ${showId}`);
  } catch (error) {
    console.error("Error initializing seats:", error);
    throw error;
  }
};

export const validateSeatAvailability = async (showId: string, seats: number[]) => {
  try {
    const seatsRef = collection(db, "Shows", showId, "Seats");
    const snapshot = await getDocs(seatsRef);

    const unavailableSeats = seats.filter((seatNumber) => {
      const seatDoc = snapshot.docs.find((doc) => doc.id === `seat${seatNumber}`);
      return seatDoc?.data()?.isReserved;
    });

    if (unavailableSeats.length > 0) {
      console.error("Some seats are already reserved:", unavailableSeats);
      return unavailableSeats;
    }

    return [];
  } catch (error) {
    console.error("Error validating seat availability:", error);
    throw error;
  }
};
