import { Star } from 'lucide-react';
import Link from 'next/link';

type MovieCardProps = {
  movie: {
    title: string;
    producer: string;
    director: string;
    synopsis: string;
    trailerPictureUrl?: string;
    trailerVideoUrl?: string;  // Ensure consistent casing here
    reviews?: {
      user: string;
      rating: number;
      comment: string;
    };
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
          <p className="text-gray-600 mb-1 text-xs">Producer: {movie.producer}</p>
          <p className="text-gray-700 mb-1 text-xs">Directed by: {movie.director}</p>
          {movie.reviews && (
            <div className="mb-2">
              <div className="flex items-center mb-1">
                <Star className="text-yellow-400 mr-1" size={12} fill="currentColor" />
                <span className="text-gray-700 font-semibold text-xs">{movie.reviews.rating}/10</span>
                <span className="text-gray-500 ml-1 text-xs">({movie.reviews.user})</span>
              </div>
              <p className="text-gray-700 italic text-xs mb-2">"{movie.reviews.comment}"</p>
            </div>
          )}
          <p className="text-gray-700 text-xs">{movie.synopsis}</p>
        </div>
        <Link
          href={{
            pathname: '/viewdetails',
            query: {
              title: movie.title,
              trailerPictureUrl: movie.trailerPictureUrl,
              trailerVideoUrl: movie.trailerVideoUrl,  // Ensure consistent casing here
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
