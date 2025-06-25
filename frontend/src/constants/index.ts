// API 配置
export const API_BASE_URL = 'http://localhost:8000'

// API 端点
export const API_ENDPOINTS = {
  MOVIES: '/api/movies',
  TV_SHOWS: '/api/tv-shows',
  SEARCH: '/api/search',
  SCAN: '/api/scan',
  SCAN_STATUS: '/api/scan',
  GENRES: '/api/genres',
  STATS: '/api/stats',
  HEALTH: '/api/health',
} as const

// 图片配置
export const IMAGE_SIZES = {
  POSTER: {
    SMALL: 'w185',
    MEDIUM: 'w342',
    LARGE: 'w500',
    XLARGE: 'w780',
  },
  BACKDROP: {
    SMALL: 'w300',
    MEDIUM: 'w780',
    LARGE: 'w1280',
    ORIGINAL: 'original',
  },
  PROFILE: {
    SMALL: 'w45',
    MEDIUM: 'w185',
    LARGE: 'h632',
  },
} as const

// 支持的文件格式
export const SUPPORTED_VIDEO_FORMATS = [
  '.mp4',
  '.mkv',
  '.avi',
  '.mov',
  '.wmv',
  '.flv',
  '.webm',
  '.m4v',
  '.mpg',
  '.mpeg',
  '.3gp',
  '.ts',
  '.m2ts',
] as const

export const SUPPORTED_AUDIO_FORMATS = [
  '.mp3',
  '.wav',
  '.flac',
  '.aac',
  '.ogg',
  '.wma',
  '.m4a',
] as const

// 默认配置
export const DEFAULT_CONFIG = {
  THEME: 'dark' as const,
  VIEW_MODE: 'grid' as const,
  ITEMS_PER_PAGE: 20,
  AUTO_SCAN: false,
  SCAN_INTERVAL: 24 * 60 * 60 * 1000, // 24小时（毫秒）
} as const

// 排序选项
export const SORT_OPTIONS = [
  { value: 'title', label: '标题' },
  { value: 'release_date', label: '上映日期' },
  { value: 'vote_average', label: '评分' },
  { value: 'popularity', label: '热度' },
] as const

// 筛选选项
export const FILTER_OPTIONS = {
  YEARS: Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i),
  RATINGS: [
    { value: 9, label: '9.0+' },
    { value: 8, label: '8.0+' },
    { value: 7, label: '7.0+' },
    { value: 6, label: '6.0+' },
    { value: 5, label: '5.0+' },
  ],
} as const

// 媒体类型
export const MEDIA_TYPES = {
  MOVIE: 'movie',
  TV: 'tv',
  ALL: 'all',
} as const

// 状态文本
export const STATUS_MESSAGES = {
  LOADING: '加载中...',
  NO_RESULTS: '未找到相关内容',
  SCAN_IN_PROGRESS: '正在扫描媒体文件...',
  SCAN_COMPLETED: '媒体扫描完成',
  SCAN_ERROR: '扫描过程中出现错误',
  NETWORK_ERROR: '网络连接错误',
  SERVER_ERROR: '服务器错误',
} as const

// 主题配置
export const THEME_CONFIG = {
  STORAGE_KEY: 'scenescape-theme',
  DEFAULT: 'dark',
} as const

// 本地存储键
export const STORAGE_KEYS = {
  THEME: 'scenescape-theme',
  USER_PREFERENCES: 'scenescape-preferences',
  SCAN_PATHS: 'scenescape-scan-paths',
  VIEW_MODE: 'scenescape-view-mode',
  FILTER_STATE: 'scenescape-filter-state',
} as const

// 动画配置
export const ANIMATION_CONFIG = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  EASING: {
    EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
    EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
    EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const

// 响应式断点
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const

// 网格配置
export const GRID_CONFIG = {
  COLUMNS: {
    SM: 2,
    MD: 3,
    LG: 4,
    XL: 5,
    '2XL': 6,
  },
  GAP: {
    SM: '1rem',
    MD: '1.5rem',
    LG: '2rem',
  },
} as const

// 错误代码
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SCAN_ERROR: 'SCAN_ERROR',
} as const

// HTTP 状态码
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const

// 正则表达式
export const REGEX_PATTERNS = {
  // 电影文件名解析：Movie Title (YYYY)
  MOVIE: /^(.*?)(?:[.\s-_]|\()(\d{4})(?:\)|[\s-_]|\.).*$/i,
  // 电视剧文件名解析：Show Name S01E02
  TV_EPISODE: /^(.*?)(?:[sS](\d+)[eE](\d+)|(\d+)x(\d+)).*$/i,
  // 年份提取
  YEAR: /\b(19|20)\d{2}\b/g,
  // 清理文件名
  CLEAN_FILENAME: /[._-]/g,
} as const

// 图片占位符
export const PLACEHOLDER_IMAGES = {
  POSTER: '/placeholder-poster.jpg',
  BACKDROP: '/placeholder-backdrop.jpg',
  PROFILE: '/placeholder-profile.jpg',
  NO_IMAGE: '/no-image.svg',
} as const

// 外部链接
export const EXTERNAL_LINKS = {
  TMDB: 'https://www.themoviedb.org',
  GITHUB: 'https://github.com/your-username/scenescape',
  DOCUMENTATION: 'https://docs.scenescape.app',
} as const
