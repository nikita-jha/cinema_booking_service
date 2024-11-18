export interface IShow {
    id: string;
    movieId: string;
    date: string;
    time: string;
    roomId: string;
    seats: ISeat[];
  }
  
  export interface ISeat {
    seatNumber: number;
    isReserved: boolean;
    reservedBy: string | null;
    reservationTimestamp: string | null;
    age: number | null;
  }