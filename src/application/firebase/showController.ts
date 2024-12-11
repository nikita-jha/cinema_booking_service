import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  setDoc, 
  updateDoc, 
  where, 
  writeBatch 
} from "firebase/firestore";
import { db } from "./config";

export class ShowController {
  async addMovieScheduleWithSeats(
    movieId: string, 
    date: string, 
    startTime: string, 
    roomId: string, 
    totalSeats = 100
  ): Promise<void> {
    try {
      const newShowId = `${movieId}-${date}-${startTime}`;
      const newShowRef = doc(db, "Shows", newShowId);

      await setDoc(newShowRef, {
        movieId,
        date,
        time: startTime,
        roomId,
      });

      await this.initializeSeatsForShow(newShowId, totalSeats);
      console.log(`Show and seats created successfully for ${newShowId}.`);
    } catch (error) {
      console.error("Error adding movie schedule with seats:", error);
      throw new Error("Failed to add movie schedule. Please try again.");
    }
  }

  async initializeSeatsForShow(showId: string, totalSeats: number): Promise<void> {
    try {
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
      console.log(`Initialized ${totalSeats} seats for show: ${showId}`);
    } catch (error) {
      console.error("Error initializing seats:", error);
      throw new Error("Failed to initialize seats. Please try again.");
    }
  }

  async reserveSeats(
    showId: string, 
    seats: { seat: number; age: number }[], 
    userId: string
  ): Promise<void> {
    try {
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
      console.log(`Seats reserved successfully for show: ${showId}`);
    } catch (error) {
      console.error("Error reserving seats:", error);
      throw new Error("Failed to reserve seats. Please try again.");
    }
  }

  async fetchSeatsForShow(showId: string): Promise<any[]> {
    try {
      const seatsRef = collection(db, "Shows", showId, "Seats");
      const seatsSnapshot = await getDocs(seatsRef);

      return seatsSnapshot.docs
        .map((doc) => ({
          seatNumber: doc.data().seatNumber,
          isReserved: doc.data().isReserved,
          reservedBy: doc.data().reservedBy,
        }))
        .sort((a, b) => a.seatNumber - b.seatNumber);
    } catch (error) {
      console.error("Error fetching seats:", error);
      throw new Error("Failed to fetch seats. Please try again.");
    }
  }

  async validateSeatAvailability(showId: string, seatNumbers: number[]): Promise<number[]> {
    try {
      const seats = await this.fetchSeatsForShow(showId);
      const unavailableSeats = seatNumbers.filter(
        (seat) => seats.find((s) => s.seatNumber === seat)?.isReserved
      );
      return unavailableSeats;
    } catch (error) {
      console.error("Error validating seat availability:", error);
      throw new Error("Failed to validate seat availability.");
    }
  }

  async getShowsByDate(date: string): Promise<any[]> {
    try {
      const showsRef = collection(db, "Shows");
      const dateQuery = query(showsRef, where("date", "==", date));
      const snapshot = await getDocs(dateQuery);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching shows by date:", error);
      throw new Error("Failed to fetch shows for the selected date.");
    }
  }

  async releaseSeats(showId: string, seatNumbers: number[]): Promise<void> {
    try {
      const seatsRef = collection(db, "Shows", showId, "Seats");

      for (const seat of seatNumbers) {
        const seatDocRef = doc(seatsRef, `seat${seat}`);
        await updateDoc(seatDocRef, {
          isReserved: false,
          reservedBy: null,
          reservationTimestamp: null,
        });
      }
      console.log(`Released seats ${seatNumbers.join(", ")} for show: ${showId}`);
    } catch (error) {
      console.error("Error releasing seats:", error);
      throw new Error("Failed to release seats.");
    }
  }
}
