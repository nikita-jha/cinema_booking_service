import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './config';

export const checkScheduleConflict = async (
    date: string,
    startTime: string,
    roomId: string
  ): Promise<boolean> => {
    try {
      const showsRef = collection(db, "Shows");
      const roomDateQuery = query(
        showsRef,
        where("date", "==", date),
        where("roomId", "==", roomId)
      );
  
      const scheduleSnapshot = await getDocs(roomDateQuery);
  
      const newScheduleStart = new Date(`${date}T${startTime}`);
      const newScheduleEnd = new Date(newScheduleStart.getTime() + 3 * 60 * 60 * 1000); // Assuming 3-hour duration
  
      // Iterate through existing schedules and check for conflicts
      for (const doc of scheduleSnapshot.docs) {
        const schedule = doc.data();
        const existingStart = new Date(`${schedule.date}T${schedule.time}`);
        const existingEnd = new Date(existingStart.getTime() + 3 * 60 * 60 * 1000);
  
        if (
          (newScheduleStart >= existingStart && newScheduleStart < existingEnd) || // Overlaps start
          (newScheduleEnd > existingStart && newScheduleEnd <= existingEnd) || // Overlaps end
          (newScheduleStart <= existingStart && newScheduleEnd >= existingEnd) // Fully overlaps
        ) {
          console.log("Scheduling conflict detected:", schedule);
          return true; // Conflict exists
        }
      }
  
      return false; // No conflict found
    } catch (error) {
      console.error("Error checking schedule conflict:", error);
      throw error;
    }
  };
  