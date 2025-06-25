import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  Film, 
  Tv, 
  Search, 
  FolderOpen,
  TrendingUp,
  Star,
  Clock
} from 'lucide-react'
import { cn } from '../../utils'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  current?: boolean
}

const navigation: NavItem[] = [
  { name: '首页', href: '/', icon: Home },
  { name: '电影', href: '/movies', icon: Film },
  { name: '电视剧', href: '/tv-shows', icon: Tv },
  { name: '扫描', href: '/scan', icon: Search },
]

const collections: NavItem[] = [
  { name: '最近添加', href: '/recent', icon: Clock },
  { name: '热门推荐', href: '/trending', icon: TrendingUp },
  { name: '我的收藏', href: '/favorites', icon: Star },
  { name: '本地文件', href: '/files', icon: FolderOpen },
]

interface SidebarProps {
  className?: string
}

export default function Sidebar({ className }: SidebarProps) {
  const location = useLocation()

  return (
    <aside className={cn("w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto", className)}>
      <nav className="p-4 space-y-6">
        {/* 主导航 */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            导航
          </h3>
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={cn(
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 w-5 h-5 flex-shrink-0',
                        isActive
                          ? 'text-primary-500'
                          : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                      )}
                    />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* 媒体收藏 */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            媒体收藏
          </h3>
          <ul className="space-y-1">
            {collections.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={cn(
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 w-5 h-5 flex-shrink-0',
                        isActive
                          ? 'text-primary-500'
                          : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                      )}
                    />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* 统计信息 */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            媒体库统计
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">电影</span>
              <span className="font-medium text-gray-900 dark:text-white">-</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">电视剧</span>
              <span className="font-medium text-gray-900 dark:text-white">-</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">剧集</span>
              <span className="font-medium text-gray-900 dark:text-white">-</span>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  )
}
