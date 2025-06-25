import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Film, Tv, Search, Plus, Play } from 'lucide-react'
import { apiService } from '../services/api'
import LoadingSpinner from './ui/LoadingSpinner'
import Alert from './ui/Alert'

export default function HomePage() {
  const [stats, setStats] = useState({
    total_movies: 0,
    total_tv_shows: 0,
    total_episodes: 0,
    storage_used: '0 GB'
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiService.getStats()
        setStats(data)
      } catch (err: any) {
        setError(err.message || '获取统计信息失败')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner text="正在加载..." />
      </div>
    )
  }

  if (error) {
    return (
      <Alert 
        type="error" 
        title="加载失败"
        message={error}
      />
    )
  }

  return (
    <div className="space-y-8">
      {/* 欢迎横幅 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold mb-2">
            欢迎来到 SceneScape
          </h1>
          <p className="text-blue-100 mb-6">
            智能影视媒体库管理系统，让你的收藏更有条理
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/scan"
              className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              扫描媒体文件
            </Link>
            <Link 
              to="/movies"
              className="border border-blue-300 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors inline-flex items-center"
            >
              <Play className="w-4 h-4 mr-2" />
              浏览媒体库
            </Link>
          </div>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <Film className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total_movies}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                电影
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <Tv className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total_tv_shows}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                电视剧
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <Play className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total_episodes}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                剧集
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
              GB
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.storage_used}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                存储使用
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link 
          to="/movies" 
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group"
        >
          <Film className="w-12 h-12 mb-4 text-blue-500 group-hover:text-blue-600 transition-colors" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            电影收藏
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            浏览和管理你的电影收藏
          </p>
        </Link>

        <Link 
          to="/tv-shows" 
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group"
        >
          <Tv className="w-12 h-12 mb-4 text-green-500 group-hover:text-green-600 transition-colors" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            电视剧库
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            发现和追踪你喜爱的电视剧
          </p>
        </Link>

        <Link 
          to="/scan" 
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow group"
        >
          <Search className="w-12 h-12 mb-4 text-purple-500 group-hover:text-purple-600 transition-colors" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            媒体扫描
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            扫描并添加新的媒体文件
          </p>
        </Link>
      </div>
    </div>
  )
}
