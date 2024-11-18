import { collection, doc, getDocs, query, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore';
import { db } from './config';

export const addMovieScheduleWithSeats = async (
  movieId: string,
  date: string,
  startTime: string,
  roomId: string,
  totalSeats = 100
) => {
  const newShowId = `${movieId}-${date}-${startTime}`;
  const newShowRef = doc(db, "Shows", newShowId);

  await setDoc(newShowRef, {
    movieId,
    date,
    time: startTime,
    roomId,
  });

  await initializeSeatsForShow(newShowId, totalSeats);
};

export const initializeSeatsForShow = async (showId: string, totalSeats: number) => {
  const seatsRef = collection(db, "Shows", showId, "Seats");
  const batch = writeBatch(db);

  for (let i = 1; i <= totalSeats; i++) {
    const seatDocRef = doc(seatsRef, `seat${i}`);
    batch.set(seatDocRef, {
      seatNumber: i,
      isReserved: false,
      reservedBy: null,
    });
  }

  await batch.commit();
};

export const reserveSeats = async (
  showId: string,
  seats: { seat: number; age: number }[],
  userId: string
) => {
  const seatsRef = collection(db, "Shows", showId, "Seats");

  for (const { seat, age } of seats) {
    const seatDocRef = doc(seatsRef, `seat${seat}`);
    await updateDoc(seatDocRef, {
      isReserved: true,
      reservedBy: userId,
      reservationTimestamp: new Date().toISOString(),
      age,
    });
  }
};

export const fetchSeatsForShow = async (showId: string) => {
  const seatsRef = collection(db, "Shows", showId, "Seats");
  const seatsSnapshot = await getDocs(seatsRef);

  return seatsSnapshot.docs.map((doc) => ({
    seatNumber: doc.data().seatNumber,
    isReserved: doc.data().isReserved,
    reservedBy: doc.data().reservedBy,
  })).sort((a, b) => a.seatNumber - b.seatNumber);
};
