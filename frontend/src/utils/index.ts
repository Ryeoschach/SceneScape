import { MediaItem, MediaType } from '../types'
import { REGEX_PATTERNS, PLACEHOLDER_IMAGES } from '../constants'

/**
 * 类名合并工具
 */
export function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 格式化日期
 */
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }

  return date.toLocaleDateString('zh-CN', options || defaultOptions)
}

/**
 * 格式化运行时间
 */
export function formatRuntime(minutes: number | null): string {
  if (!minutes) return ''
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0) {
    return `${hours}小时${mins > 0 ? `${mins}分钟` : ''}`
  }
  
  return `${mins}分钟`
}

/**
 * 格式化评分
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1)
}

/**
 * 获取评分颜色
 */
export function getRatingColor(rating: number): string {
  if (rating >= 8) return 'text-green-500'
  if (rating >= 7) return 'text-yellow-500'
  if (rating >= 6) return 'text-orange-500'
  return 'text-red-500'
}

/**
 * 解析电影文件名
 */
export function parseMovieFilename(filename: string): { title: string; year?: number } | null {
  const match = filename.match(REGEX_PATTERNS.MOVIE)
  if (match) {
    const title = match[1].replace(REGEX_PATTERNS.CLEAN_FILENAME, ' ').trim()
    const year = parseInt(match[2])
    return { title, year }
  }
  
  // 尝试没有年份的匹配
  const nameMatch = filename.match(/^(.*?)\.\w{2,4}$/)
  if (nameMatch) {
    const title = nameMatch[1].replace(REGEX_PATTERNS.CLEAN_FILENAME, ' ').trim()
    return { title }
  }
  
  return null
}

/**
 * 解析电视剧文件名
 */
export function parseTVFilename(filename: string): {
  title: string
  season?: number
  episode?: number
} | null {
  const match = filename.match(REGEX_PATTERNS.TV_EPISODE)
  if (match) {
    const title = match[1].replace(REGEX_PATTERNS.CLEAN_FILENAME, ' ').trim()
    let season: number | undefined
    let episode: number | undefined
    
    if (match[2] && match[3]) {
      season = parseInt(match[2])
      episode = parseInt(match[3])
    } else if (match[4] && match[5]) {
      season = parseInt(match[4])
      episode = parseInt(match[5])
    }
    
    return { title, season, episode }
  }
  
  return null
}

/**
 * 获取媒体类型
 */
export function getMediaType(media: MediaItem): MediaType {
  return 'title' in media ? MediaType.MOVIE : MediaType.TV
}

/**
 * 获取媒体标题
 */
export function getMediaTitle(media: MediaItem): string {
  return 'title' in media ? media.title || '' : media.name || ''
}

/**
 * 获取媒体发布日期
 */
export function getMediaReleaseDate(media: MediaItem): string {
  return 'release_date' in media ? media.release_date : media.first_air_date
}

/**
 * 获取媒体年份
 */
export function getMediaYear(media: MediaItem): number | null {
  const dateString = getMediaReleaseDate(media)
  if (!dateString) return null
  
  const year = new Date(dateString).getFullYear()
  return isNaN(year) ? null : year
}

/**
 * 生成媒体URL
 */
export function getMediaUrl(media: MediaItem): string {
  const mediaType = getMediaType(media)
  return `/${mediaType === MediaType.MOVIE ? 'movies' : 'tv'}/${media.id}`
}

/**
 * 获取占位符图片
 */
export function getPlaceholderImage(type: 'poster' | 'backdrop' | 'profile'): string {
  switch (type) {
    case 'poster':
      return PLACEHOLDER_IMAGES.POSTER
    case 'backdrop':
      return PLACEHOLDER_IMAGES.BACKDROP
    case 'profile':
      return PLACEHOLDER_IMAGES.PROFILE
    default:
      return PLACEHOLDER_IMAGES.NO_IMAGE
  }
}

/**
 * 处理图片错误
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement>,
  fallbackType: 'poster' | 'backdrop' | 'profile' = 'poster'
): void {
  const target = event.target as HTMLImageElement
  target.src = getPlaceholderImage(fallbackType)
}

/**
 * 生成随机ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * 深拷贝对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as any
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any
  if (typeof obj === 'object') {
    const copy: any = {}
    Object.keys(obj).forEach(key => {
      copy[key] = deepClone((obj as any)[key])
    })
    return copy
  }
  return obj
}

/**
 * 检查是否为移动设备
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * 检查是否支持触摸
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * 滚动到顶部
 */
export function scrollToTop(behavior: ScrollBehavior = 'smooth'): void {
  window.scrollTo({
    top: 0,
    behavior,
  })
}

/**
 * 滚动到元素
 */
export function scrollToElement(element: HTMLElement, behavior: ScrollBehavior = 'smooth'): void {
  element.scrollIntoView({
    behavior,
    block: 'start',
  })
}

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const result = document.execCommand('copy')
      document.body.removeChild(textArea)
      return result
    }
  } catch (error) {
    console.error('复制到剪贴板失败:', error)
    return false
  }
}

/**
 * 下载文件
 */
export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase()
}

/**
 * 检查是否为视频文件
 */
export function isVideoFile(filename: string): boolean {
  const ext = getFileExtension(filename)
  return ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v'].includes(`.${ext}`)
}

/**
 * 本地存储工具
 */
export const storage = {
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue || null
    } catch (error) {
      console.error(`从localStorage读取${key}失败:`, error)
      return defaultValue || null
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`写入localStorage ${key}失败:`, error)
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`从localStorage删除${key}失败:`, error)
    }
  },

  clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('清空localStorage失败:', error)
    }
  },
}
