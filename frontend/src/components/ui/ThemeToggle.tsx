import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { cn } from '../../utils'

interface ThemeToggleProps {
  className?: string
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative p-2 rounded-full border border-gray-200 dark:border-gray-700',
        'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700',
        'transition-all duration-300 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'group overflow-hidden',
        className
      )}
      aria-label={`切换到${theme === 'light' ? '深色' : '浅色'}主题`}
      title={`切换到${theme === 'light' ? '深色' : '浅色'}主题`}
    >
      <div className="relative w-5 h-5">
        {/* 太阳图标 */}
        <Sun
          className={cn(
            'absolute inset-0 w-5 h-5 text-yellow-500 transition-all duration-300',
            theme === 'light' 
              ? 'rotate-0 scale-100 opacity-100' 
              : 'rotate-90 scale-0 opacity-0'
          )}
        />
        
        {/* 月亮图标 */}
        <Moon
          className={cn(
            'absolute inset-0 w-5 h-5 text-blue-400 transition-all duration-300',
            theme === 'dark' 
              ? 'rotate-0 scale-100 opacity-100' 
              : '-rotate-90 scale-0 opacity-0'
          )}
        />
      </div>
      
      {/* 悬停效果 */}
      <div className={cn(
        'absolute inset-0 rounded-full bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300',
        theme === 'light' 
          ? 'from-yellow-400 to-orange-400' 
          : 'from-blue-400 to-purple-400'
      )} />
    </button>
  )
}
