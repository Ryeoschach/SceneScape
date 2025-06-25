import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { movieAPI } from '../services/api';
import { Movie } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Alert from '../components/ui/Alert';
import { ArrowLeft, Calendar, Clock, Star } from 'lucide-react';

const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadMovie = async () => {
      if (!id) {
        setError('无效的电影ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const movieData = await movieAPI.getMovieById(parseInt(id));
        setMovie(movieData);
      } catch (err) {
        setError('获取电影详情失败');
        console.error('Error loading movie:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMovie();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner text="正在加载电影详情..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert type="error" title="加载失败" message={error} />
        <div className="mt-6">
          <Link
            to="/movies"
            className="inline-flex items-center text-primary hover:text-primary-dark"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回电影列表
          </Link>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert type="warning" title="未找到" message="未找到指定的电影" />
        <div className="mt-6">
          <Link
            to="/movies"
            className="inline-flex items-center text-primary hover:text-primary-dark"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回电影列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 返回按钮 */}
      <div className="mb-6">
        <Link
          to="/movies"
          className="inline-flex items-center text-primary hover:text-primary-dark"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回电影列表
        </Link>
      </div>

      {/* 主要内容 */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* 海报 */}
          <div className="md:w-1/3 lg:w-1/4">
            <div className="relative aspect-[2/3] bg-slate-200 dark:bg-slate-700">
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              )}
              
              {movie.poster_path && !imageError ? (
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL}${movie.poster_path}`}
                  alt={movie.title}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700">
                  <div className="text-center text-slate-500 dark:text-slate-400">
                    <div className="text-6xl mb-4">🎬</div>
                    <div className="text-sm px-4">暂无海报</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 详情信息 */}
          <div className="md:w-2/3 lg:w-3/4 p-6">
            {/* 标题和基本信息 */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {movie.title}
              </h1>
              
              {movie.original_title !== movie.title && (
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
                  {movie.original_title}
                </p>
              )}

              {/* 评分 */}
              {((movie.vote_average && movie.vote_average > 0) || (movie.rating && movie.rating > 0)) && (
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center text-slate-600 dark:text-slate-400">
                    <Star className="w-5 h-5 mr-1 text-yellow-500" />
                    <span className="font-medium text-lg">{(movie.vote_average || movie.rating)?.toFixed(1)}</span>
                  </div>
                </div>
              )}

              {/* 基本信息 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {movie.release_date && (
                  <div className="flex items-center text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>上映: {new Date(movie.release_date).getFullYear()}</span>
                  </div>
                )}

                {movie.runtime && (
                  <div className="flex items-center text-slate-600 dark:text-slate-400">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>时长: {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                  </div>
                )}
              </div>
            </div>

            {/* 类型标签 */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">类型</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre, index) => (
                    <span
                      key={index}
                      className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg text-sm"
                    >
                      {typeof genre === 'string' ? genre : genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 剧情简介 */}
            {movie.overview && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">剧情简介</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {movie.overview}
                </p>
              </div>
            )}

            {/* 演员信息 */}
            {movie.cast && movie.cast.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">主要演员</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {movie.cast.slice(0, 6).map((actor, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-700">
                      {actor.profile_path ? (
                        <img
                          src={`${import.meta.env.VITE_API_BASE_URL}${actor.profile_path}`}
                          alt={actor.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center">
                          <span className="text-slate-500 text-sm">👤</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{actor.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{actor.character}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;
