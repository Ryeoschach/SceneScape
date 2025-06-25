import { Link, useLocation } from 'react-router-dom'
import { Search, Settings, ScanLine } from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle'
import { cn } from '../../utils'

interface HeaderProps {
  className?: string
}

export default function Header({ className }: HeaderProps) {
  const location = useLocation()

  return (
    <header className={cn(
      "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50",
      className
    )}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <ScanLine className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                SceneScape
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                影视媒体库
              </p>
            </div>
          </Link>

          {/* 搜索栏 */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索电影、电视剧..."
                className={cn(
                  'w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600',
                  'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white',
                  'placeholder-gray-500 dark:placeholder-gray-400',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                  'transition-all duration-200'
                )}
              />
            </div>
          </div>

          {/* 右侧操作 */}
          <div className="flex items-center space-x-4">
            {/* 设置按钮 */}
            <Link
              to="/settings"
              className={cn(
                'p-2 rounded-lg transition-colors',
                location.pathname === '/settings'
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
              title="设置"
            >
              <Settings className="w-5 h-5" />
            </Link>

            {/* 主题切换 */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
