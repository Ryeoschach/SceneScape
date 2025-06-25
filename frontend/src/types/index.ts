// 基础类型定义
export interface BaseMedia {
  id: number
  title?: string
  name?: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average?: number
  rating?: number // 兼容字段
  genre_ids?: number[]
  genres?: Genre[] | string[] // 支持两种格式
  local_path?: string
  tmdb_id?: number
}

// 电影类型
export interface Movie extends BaseMedia {
  title: string
  original_title: string
  release_date: string
  runtime: number | null
  cast?: CastMember[]
  year?: number
}

// 电视剧类型
export interface TVShow extends BaseMedia {
  title: string
  name?: string // 兼容字段
  original_title: string
  original_name?: string // 兼容字段
  first_air_date: string
  last_air_date?: string
  number_of_seasons: number
  number_of_episodes: number
  seasons?: TVSeason[]
  status?: string
  rating?: number // 兼容vote_average
}

// 电视剧季度
export interface TVSeason {
  id: number
  season_number: number
  name: string
  overview: string
  poster_path: string | null
  air_date: string
  episode_count: number
  episodes?: TVEpisode[]
}

// 电视剧单集
export interface TVEpisode {
  id: number
  episode_number: number
  name: string
  overview: string
  still_path: string | null
  air_date: string
  runtime: number | null
  local_path: string
}

// 类型
export interface Genre {
  id: number
  name: string
  tmdb_id: number
}

// 演职人员
export interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
  tmdb_id: number
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// 分页响应
export interface PaginatedResponse<T> {
  results: T[]
  page: number
  total_pages: number
  total_results: number
}

// 搜索结果
export interface SearchResult {
  movies: Movie[]
  tv_shows: TVShow[]
  total: number
}

// 扫描请求
export interface ScanRequest {
  path: string
}

// 扫描状态
export interface ScanStatus {
  status: 'idle' | 'scanning' | 'completed' | 'error' | 'failed'
  progress: number
  current_file?: string
  total_files?: number
  processed_files?: number
  message?: string
  error_message?: string
}

// 扫描任务
export interface ScanTask {
  id: number
  path: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  created_at: string
  updated_at: string
  log?: string
}

// 媒体项目类型（用于统一显示）
export type MediaItem = Movie | TVShow

// 媒体类型枚举
export enum MediaType {
  MOVIE = 'movie',
  TV = 'tv'
}

// 主题类型
export type Theme = 'light' | 'dark'

// 主题上下文类型
export interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

// 筛选选项
export interface FilterOptions {
  genre?: string
  year?: number
  rating?: number
  sort_by?: 'title' | 'release_date' | 'vote_average' | 'popularity'
  sort_order?: 'asc' | 'desc'
}

// 用户偏好设置
export interface UserPreferences {
  theme: Theme
  default_view: 'grid' | 'list'
  items_per_page: number
  auto_scan: boolean
  scan_paths: string[]
}

// 加载状态
export interface LoadingState {
  isLoading: boolean
  error: string | null
  progress?: number
}

// 组件通用 Props
export interface ComponentProps {
  className?: string
  children?: React.ReactNode
}

// 媒体卡片 Props
export interface MediaCardProps extends ComponentProps {
  media: MediaItem
  mediaType: MediaType
  onClick?: (media: MediaItem) => void
}

// 搜索组件 Props
export interface SearchBarProps extends ComponentProps {
  onSearch: (query: string) => void
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
}

// 筛选组件 Props
export interface FilterBarProps extends ComponentProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  genres: Genre[]
}

// 分页组件 Props
export interface PaginationProps extends ComponentProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

// 模态框 Props
export interface ModalProps extends ComponentProps {
  isOpen: boolean
  onClose: () => void
  title?: string
}

// 确认对话框 Props
export interface ConfirmDialogProps extends ModalProps {
  message: string
  onConfirm: () => void
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}
