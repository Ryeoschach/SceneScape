import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tvAPI } from '../services/api';
import { TVShow } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Alert from '../components/ui/Alert';

interface TVShowCardProps {
  show: TVShow;
}

const TVShowCard: React.FC<TVShowCardProps> = ({ show }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'returning series':
      case 'continuing':
        return 'bg-green-500';
      case 'ended':
        return 'bg-red-500';
      case 'canceled':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'returning series':
      case 'continuing':
        return '更新中';
      case 'ended':
        return '已完结';
      case 'canceled':
        return '已取消';
      default:
        return status;
    }
  };

  return (
    <Link to={`/tv-shows/${show.id}`} className="group block">
      <div className="tv-show-card bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        {/* 海报 */}
        <div className="relative aspect-[2/3] bg-slate-200 dark:bg-slate-700">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <LoadingSpinner size="sm" />
            </div>
          )}
          
          {show.poster_path && !imageError ? (
            <img
              src={`${import.meta.env.VITE_API_BASE_URL}${show.poster_path}`}
              alt={show.title}
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
                <div className="text-4xl mb-2">📺</div>
                <div className="text-sm px-2">暂无海报</div>
              </div>
            </div>
          )}
          
          {/* 评分徽章 */}
          {show.vote_average > 0 && (
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
              ⭐ {show.vote_average.toFixed(1)}
            </div>
          )}
          
          {/* 状态徽章 */}
          {show.status && (
            <div className={`absolute bottom-2 left-2 ${getStatusColor(show.status)} text-white text-xs px-2 py-1 rounded`}>
              {getStatusText(show.status)}
            </div>
          )}
        </div>
        
        {/* 信息区域 */}
        <div className="p-4">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {show.name}
          </h3>
          
          {show.original_name !== show.name && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 line-clamp-1">
              {show.original_name}
            </p>
          )}
          
          {show.overview && (
            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 mb-3">
              {show.overview}
            </p>
          )}
          
          {/* 季和集数信息 */}
          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-3">
            <span>{show.number_of_seasons} 季</span>
            <span className="mx-2">•</span>
            <span>{show.number_of_episodes} 集</span>
          </div>
          
          {/* 类型标签 */}
          {show.genres && show.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {show.genres.slice(0, 2).map((genre, index) => (
                <span
                  key={index}
                  className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded"
                >
                  {genre.name}
                </span>
              ))}
              {show.genres.length > 2 && (
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  +{show.genres.length - 2}
                </span>
              )}
            </div>
          )}
          
          {/* 首播日期 */}
          {show.first_air_date && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              首播: {new Date(show.first_air_date).getFullYear()}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

interface TVShowFilters {
  search: string;
  genre: string;
  status: string;
  sortBy: 'title' | 'first_air_date' | 'rating';
  sortOrder: 'asc' | 'desc';
}

const TVShowsPage: React.FC = () => {
  const [shows, setShows] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<TVShowFilters>({
    search: '',
    genre: '',
    status: '',
    sortBy: 'title',
    sortOrder: 'asc'
  });

  const loadTVShows = async (pageNum: number = 1, reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: pageNum,
        limit: 20
      };

      if (filters.search) params.search = filters.search;
      if (filters.genre) params.genre = filters.genre;
      if (filters.status) params.status = filters.status;

      const response = await tvAPI.getTVShows(params);
      
      // 检查响应格式：可能是分页对象或简单数组
      let showList: TVShow[] = [];
      
      if (Array.isArray(response)) {
        // 如果返回的是简单数组
        showList = response;
      } else if (response && response.results) {
        // 如果返回的是分页对象
        showList = response.results;
      } else {
        console.warn('API response format unexpected:', response);
      }
      
      if (reset) {
        setShows(showList);
      } else {
        setShows(prev => [...prev, ...showList]);
      }
      
      // 对于简单数组，我们假设如果返回少于20条记录就没有更多了
      setHasMore(showList.length === 20);
      
    } catch (err) {
      setError('获取电视剧列表失败');
      console.error('Error loading TV shows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    loadTVShows(1, true);
  }, [filters]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadTVShows(nextPage, false);
  };

  const handleFilterChange = (key: keyof TVShowFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      genre: '',
      status: '',
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
            电视剧库
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            浏览您的电视剧收藏
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
              placeholder="电视剧名称..."
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
              <option value="Drama">剧情</option>
              <option value="Comedy">喜剧</option>
              <option value="Action">动作</option>
              <option value="Crime">犯罪</option>
              <option value="Sci-Fi">科幻</option>
              <option value="Fantasy">奇幻</option>
            </select>
          </div>

          {/* 状态 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              状态
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">全部状态</option>
              <option value="Returning Series">更新中</option>
              <option value="Ended">已完结</option>
              <option value="Canceled">已取消</option>
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

      {/* 电视剧网格 */}
      {!loading && (!shows || shows.length === 0) ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📺</div>
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
            还没有电视剧
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            开始扫描您的媒体文件夹来添加电视剧
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
            {shows.map((show) => (
              <TVShowCard key={show.id} show={show} />
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

export default TVShowsPage;
