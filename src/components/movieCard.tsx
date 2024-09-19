import { Star } from 'lucide-react';

type MovieCardProps = {
  movie: {
    title: string;
    producer: string;
    director: string;
    synopsis: string;
    trailerPictureUrl?: string;
    reviews?: {
      user: string;
      rating: number;
      comment: string;
    };
  };
};

const MovieCard = ({ movie }: MovieCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-sm mx-auto scale-90 flex flex-col justify-between min-h-[450px]"> {/* Set flex container, min height */}
      {movie.trailerPictureUrl && (
        <img
          src={movie.trailerPictureUrl}
          alt={`${movie.title} Trailer Thumbnail`}
          className="w-full h-40 object-cover" /* Adjust image height */
        />
      )}
      <div className="p-3 flex-grow"> {/* Flex-grow added to main content */}
        <h1 className="text-base font-bold mb-2 text-gray-800">{movie.title}</h1> {/* Increased title size */}
        <p className="text-gray-600 mb-1 text-sm">Producer: {movie.producer}</p> {/* Increased text size */}
        <p className="text-gray-700 mb-1 text-sm">Directed by: {movie.director}</p> {/* Increased text size */}
        {movie.reviews && (
          <div className="mb-2">
            <div className="flex items-center mb-1">
              <Star className="text-yellow-400 mr-1" size={14} fill="currentColor" /> {/* Increased icon size */}
              <span className="text-gray-700 font-semibold text-sm">{movie.reviews.rating}/10</span>
              <span className="text-gray-500 ml-1 text-sm">({movie.reviews.user})</span>
            </div>
            <p className="text-gray-700 italic text-sm">"{movie.reviews.comment}"</p> {/* Increased review text size */}
          </div>
        )}
        <p className="text-gray-700 text-sm">{movie.synopsis}</p> {/* Increased synopsis text size */}
      </div>
      {/* Button always at the bottom */}
      <div className="p-3">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 w-full rounded">
          Book Now
        </button>
      </div>
    </div>
  );
};

export default MovieCard;
