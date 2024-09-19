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
    <div className="bg-white rounded-lg shadow-lg overflow-hidden w-64 mx-auto flex flex-col justify-between">
      {movie.trailerPictureUrl && (
        <img
          src={movie.trailerPictureUrl}
          alt={`${movie.title} Trailer Thumbnail`}
          className="w-full h-36 object-cover"
        />
      )}
      <div className="p-3 flex-grow">
        <h1 className="text-lg font-bold mb-2 text-gray-800 line-clamp-2">{movie.title}</h1>
        <p className="text-gray-600 mb-1 text-xs">Producer: {movie.producer}</p>
        <p className="text-gray-700 mb-1 text-xs">Directed by: {movie.director}</p>
        {movie.reviews && (
          <div className="mb-2">
            <div className="flex items-center mb-1">
              <Star className="text-yellow-400 mr-1" size={12} fill="currentColor" />
              <span className="text-gray-700 font-semibold text-xs">{movie.reviews.rating}/10</span>
              <span className="text-gray-500 ml-1 text-xs">({movie.reviews.user})</span>
            </div>
            <p className="text-gray-700 italic text-xs line-clamp-2">"{movie.reviews.comment}"</p>
          </div>
        )}
        <p className="text-gray-700 text-xs line-clamp-3">{movie.synopsis}</p>
      </div>
      <div className="p-3">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 w-full rounded text-sm">
          Book Now
        </button>
      </div>
    </div>
  );
};

export default MovieCard;