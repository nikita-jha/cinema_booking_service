import { Star } from 'lucide-react';
import Link from 'next/link';

type MovieCardProps = {
  movie: {
    title: string;
    mpaaRating: string;
    producer: string;
    director: string;
    synopsis: string;
    trailerPictureUrl?: string;
    trailerVideoUrl?: string;  // Ensure consistent casing here
    reviews?: string;
  };
};

const MovieCard = ({ movie }: MovieCardProps) => {
  console.log("In Movie Card movie: ", movie);  // Now this should work correctly
  console.log("In Movie Card: ", movie.trailerVideoUrl);  // Now this should work correctly

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full h-[400px] flex flex-col">
      {movie.trailerPictureUrl && (
        <img
          src={movie.trailerPictureUrl}
          alt={`${movie.title} Trailer Thumbnail`}
          className="w-full h-40 object-cover"
        />
      )}
      <div className="p-4 flex-grow flex flex-col overflow-hidden">
        <h1 className="text-lg font-bold mb-2 text-gray-800">{movie.title}</h1>
        <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <p className="text-gray-600 mb-1 text-xs">MPAA Rating: {movie.mpaaRating}</p>
          <p className="text-gray-600 mb-1 text-xs">Producer(s): {movie.producer}</p>
          <p className="text-gray-700 mb-1 text-xs">Directed by: {movie.director}</p>
          <p className="text-gray-700 text-xs">Synopsis: {movie.synopsis}</p>
        </div>
        <Link
          href={{
            pathname: '/viewdetails',
            query: {
              title: movie.title,
            },
          }}
        >
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm mt-4">
            View Details
          </button>
        </Link>
      </div>
    </div>
  );
};

export default MovieCard;
