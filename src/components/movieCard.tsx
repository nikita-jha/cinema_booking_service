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
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-sm mx-auto">
      {movie.trailerPictureUrl && (
        <img
          src={movie.trailerPictureUrl}
          alt={`${movie.title} Trailer Thumbnail`}
          className="w-full h-64 object-cover"
        />
      )}
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">{movie.title}</h1>
        <p className="text-gray-600 mb-4">Producer: {movie.producer}</p>
        <p className="text-gray-700 mb-4">Directed by: {movie.director}</p>
        {movie.reviews && (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Star className="text-yellow-400 mr-1" size={20} fill="currentColor" />
              <span className="text-gray-700 font-semibold">{movie.reviews.rating}/10</span>
              <span className="text-gray-500 ml-2">({movie.reviews.user})</span>
            </div>
            <p className="text-gray-700 italic">"{movie.reviews.comment}"</p>
          </div>
        )}
        <p className="text-gray-700">{movie.synopsis}</p>
      </div>
    </div>
  );
};

export default MovieCard;
