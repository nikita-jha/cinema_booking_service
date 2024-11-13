export interface IMovie {
  id: string;
  category: string;
  director: string;
  mpaaRating: string;
  producer: string;
  cast: string;
  reviews: string;
  genre: string;
  synopsis: string;
  title: string;
  schedule: ISchedule[];
  trailerPictureUrl: string;
  trailerVideoUrl: string;
}

export interface ISchedule {
  id: string;
  time: string;
  date: string;
}

