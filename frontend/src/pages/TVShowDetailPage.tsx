import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tvAPI } from '../services/api';
import { TVShow } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Alert from '../components/ui/Alert';
import { ArrowLeft, Calendar, Tv, Star } from 'lucide-react';

const TVShowDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [show, setShow] = useState<TVShow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadTVShow = async () => {
      if (!id) {
        setError('无效的电视剧ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const showData = await tvAPI.getTVShowById(parseInt(id));
        setShow(showData);
      } catch (err) {
        setError('获取电视剧详情失败');
        console.error('Error loading TV show:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTVShow();
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
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
    switch (status?.toLowerCase()) {
      case 'returning series':
      case 'continuing':
        return '更新中';
      case 'ended':
        return '已完结';
      case 'canceled':
        return '已取消';
      default:
        return status || '未知';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner text="正在加载电视剧详情..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert type="error" title="加载失败" message={error} />
        <div className="mt-6">
          <Link
            to="/tv-shows"
            className="inline-flex items-center text-primary hover:text-primary-dark"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回电视剧列表
          </Link>
        </div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert type="warning" title="未找到" message="未找到指定的电视剧" />
        <div className="mt-6">
          <Link
            to="/tv-shows"
            className="inline-flex items-center text-primary hover:text-primary-dark"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回电视剧列表
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
          to="/tv-shows"
          className="inline-flex items-center text-primary hover:text-primary-dark"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回电视剧列表
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
              
              {show.poster_path && !imageError ? (
                <img
                  src={`${import.meta.env.VITE_API_BASE_URL}${show.poster_path}`}
                  alt={show.title || show.name}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700">
                  <div className="text-center text-slate-500 dark:text-slate-400">
                    <div className="text-6xl mb-4">📺</div>
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
                {show.title || show.name}
              </h1>
              
              {(show.original_title || show.original_name) !== (show.title || show.name) && (
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
                  {show.original_title || show.original_name}
                </p>
              )}

              {/* 状态和评分 */}
              <div className="flex flex-wrap items-center gap-4 mb-4">
                {show.status && (
                  <span className={`${getStatusColor(show.status)} text-white text-sm px-3 py-1 rounded-full`}>
                    {getStatusText(show.status)}
                  </span>
                )}
                
                {(show.rating && show.rating > 0) && (
                  <div className="flex items-center text-slate-600 dark:text-slate-400">
                    <Star className="w-4 h-4 mr-1 text-yellow-500" />
                    <span className="font-medium">{show.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {/* 基本信息 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {show.first_air_date && (
                  <div className="flex items-center text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>首播: {new Date(show.first_air_date).getFullYear()}</span>
                  </div>
                )}

                <div className="flex items-center text-slate-600 dark:text-slate-400">
                  <Tv className="w-4 h-4 mr-2" />
                  <span>{show.number_of_seasons} 季 • {show.number_of_episodes} 集</span>
                </div>
              </div>
            </div>

            {/* 类型标签 */}
            {show.genres && show.genres.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">类型</h3>
                <div className="flex flex-wrap gap-2">
                  {show.genres.map((genre, index) => (
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
            {show.overview && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">剧情简介</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {show.overview}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TVShowDetailPage;
