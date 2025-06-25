import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { movieAPI } from '../services/api';
import { Movie } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Alert from '../components/ui/Alert';

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <Link to={`/movies/${movie.id}`} className="group block">
      <div className="movie-card bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        {/* 海报 */}
        <div className="relative aspect-[2/3] bg-slate-200 dark:bg-slate-700">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <LoadingSpinner size="sm" />
            </div>
          )}
          
          {movie.poster_path && !imageError ? (
            <img
              src={`${import.meta.env.VITE_API_BASE_URL}${movie.poster_path}`}
              alt={movie.title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700">
              <div className="text-center text-slate-500 dark:text-slate-400">
                <div className="text-4xl mb-2">🎬</div>
                <div className="text-sm px-2">暂无海报</div>
              </div>
            </div>
          )}
          
          {/* 评分徽章 */}
          {movie.vote_average > 0 && (
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
              ⭐ {movie.vote_average.toFixed(1)}
            </div>
          )}
          
          {/* 年份徽章 */}
          <div className="absolute bottom-2 left-2 bg-primary/90 text-white text-xs px-2 py-1 rounded">
            {new Date(movie.release_date).getFullYear()}
          </div>
        </div>
        
        {/* 信息区域 */}
        <div className="p-4">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
          
          {movie.original_title !== movie.title && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 line-clamp-1">
              {movie.original_title}
            </p>
          )}
          
          {movie.overview && (
            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 mb-3">
              {movie.overview}
            </p>
          )}
          
          {/* 类型标签 */}
          {movie.genres && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {movie.genres.slice(0, 2).map((genre, index) => (
                <span
                  key={index}
                  className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded"
                >
                  {genre.name}
                </span>
              ))}
              {movie.genres.length > 2 && (
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  +{movie.genres.length - 2}
                </span>
              )}
            </div>
          )}
          
          {/* 时长 */}
          {movie.runtime && (
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              时长: {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

interface MovieFilters {
  search: string;
  genre: string;
  year: string;
  sortBy: 'title' | 'year' | 'rating';
  sortOrder: 'asc' | 'desc';
}

const MoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<MovieFilters>({
    search: '',
    genre: '',
    year: '',
    sortBy: 'title',
    sortOrder: 'asc'
  });

  const loadMovies = async (pageNum: number = 1, reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: pageNum,
        limit: 20
      };

      if (filters.search) params.search = filters.search;
      if (filters.genre) params.genre = filters.genre;
      if (filters.year) params.year = parseInt(filters.year);

      const response = await movieAPI.getMovies(params);
      
      // 检查响应格式：可能是分页对象或简单数组
      let movieList: Movie[] = [];
      
      if (Array.isArray(response)) {
        // 如果返回的是简单数组
        movieList = response;
      } else if (response && response.results) {
        // 如果返回的是分页对象
        movieList = response.results;
      } else {
        console.warn('API response format unexpected:', response);
      }
      
      if (reset) {
        setMovies(movieList);
      } else {
        setMovies(prev => [...prev, ...movieList]);
      }
      
      // 对于简单数组，我们假设如果返回少于20条记录就没有更多了
      setHasMore(movieList.length === 20);
      
    } catch (err) {
      setError('获取电影列表失败');
      console.error('Error loading movies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    loadMovies(1, true);
  }, [filters]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadMovies(nextPage, false);
  };

  const handleFilterChange = (key: keyof MovieFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      genre: '',
      year: '',
      sortBy: 'title',
      sortOrder: 'asc'
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 头部 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            电影库
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            浏览您的电影收藏
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Link
            to="/scan"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <span className="mr-2">📁</span>
            扫描媒体库
          </Link>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 搜索 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              搜索
            </label>
            <input
              type="text"
              placeholder="电影名称..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* 类型 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              类型
            </label>
            <select
              value={filters.genre}
              onChange={(e) => handleFilterChange('genre', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">全部类型</option>
              <option value="Action">动作</option>
              <option value="Comedy">喜剧</option>
              <option value="Drama">剧情</option>
              <option value="Horror">恐怖</option>
              <option value="Sci-Fi">科幻</option>
              <option value="Romance">爱情</option>
            </select>
          </div>

          {/* 年份 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              年份
            </label>
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">全部年份</option>
              {Array.from({ length: 30 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>

          {/* 清除筛选 */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-3 py-2 text-sm text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              清除筛选
            </button>
          </div>
        </div>
      </div>

      {/* 错误信息 */}
      {error && (
        <Alert type="error" message={error} className="mb-6" />
      )}

      {/* 电影网格 */}
      {!loading && (!movies || movies.length === 0) ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
            还没有电影
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            开始扫描您的媒体文件夹来添加电影
          </p>
          <Link
            to="/scan"
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <span className="mr-2">📁</span>
            开始扫描
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          {/* 加载更多 */}
          {hasMore && !loading && (
            <div className="text-center">
              <button
                onClick={handleLoadMore}
                className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                加载更多
              </button>
            </div>
          )}

          {/* 加载中 */}
          {loading && (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MoviesPage;
