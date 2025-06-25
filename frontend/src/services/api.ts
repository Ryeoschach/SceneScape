import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { 
  Movie, 
  TVShow, 
  TVSeason, 
  TVEpisode, 
  Genre, 
  SearchResult, 
  ScanRequest, 
  ScanStatus,
  ApiResponse,
  PaginatedResponse,
  FilterOptions
} from '../types'
import { API_BASE_URL, API_ENDPOINTS, HTTP_STATUS } from '../constants'

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30秒超时
    })

    // 请求拦截器
    this.api.interceptors.request.use(
      (config) => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        console.error('❌ API Request Error:', error)
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`)
        return response
      },
      (error) => {
        console.error('❌ API Response Error:', error)
        return Promise.reject(this.handleError(error))
      }
    )
  }

  private handleError(error: any): Error {
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response
      switch (status) {
        case HTTP_STATUS.BAD_REQUEST:
          return new Error(data.message || '请求参数错误')
        case HTTP_STATUS.UNAUTHORIZED:
          return new Error('未授权访问')
        case HTTP_STATUS.FORBIDDEN:
          return new Error('禁止访问')
        case HTTP_STATUS.NOT_FOUND:
          return new Error('资源未找到')
        case HTTP_STATUS.INTERNAL_SERVER_ERROR:
          return new Error('服务器内部错误')
        default:
          return new Error(data.message || `HTTP错误: ${status}`)
      }
    } else if (error.request) {
      // 网络错误
      return new Error('网络连接失败，请检查网络设置')
    } else {
      // 其他错误
      return new Error(error.message || '未知错误')
    }
  }

  // 电影相关API
  async getMovies(page: number = 1, filters?: FilterOptions): Promise<PaginatedResponse<Movie> | Movie[]> {
    const params = { page, ...filters }
    const response = await this.api.get<PaginatedResponse<Movie> | Movie[]>(API_ENDPOINTS.MOVIES, { params })
    return response.data
  }

  async getMovieById(id: number): Promise<Movie> {
    const response = await this.api.get<Movie>(`${API_ENDPOINTS.MOVIES}/${id}`)
    return response.data
  }

  // 电视剧相关API
  async getTVShows(page: number = 1, filters?: FilterOptions): Promise<PaginatedResponse<TVShow> | TVShow[]> {
    const params = { page, ...filters }
    const response = await this.api.get<PaginatedResponse<TVShow> | TVShow[]>(API_ENDPOINTS.TV_SHOWS, { params })
    return response.data
  }

  async getTVShowById(id: number): Promise<TVShow> {
    const response = await this.api.get<TVShow>(`${API_ENDPOINTS.TV_SHOWS}/${id}`)
    return response.data
  }

  async getTVSeasons(tvId: number): Promise<TVSeason[]> {
    const response = await this.api.get<TVSeason[]>(`${API_ENDPOINTS.TV_SHOWS}/${tvId}/seasons`)
    return response.data
  }

  async getTVEpisodes(tvId: number, seasonNumber: number): Promise<TVEpisode[]> {
    const response = await this.api.get<TVEpisode[]>(
      `${API_ENDPOINTS.TV_SHOWS}/${tvId}/seasons/${seasonNumber}/episodes`
    )
    return response.data
  }

  // 搜索API
  async searchMedia(query: string, page: number = 1): Promise<SearchResult> {
    const params = { query, page }
    const response = await this.api.get<SearchResult>(API_ENDPOINTS.SEARCH, { params })
    return response.data
  }

  // 扫描相关API
  async startScan(scanRequest: ScanRequest): Promise<ApiResponse<{ task_id: string }>> {
    const response = await this.api.post<ApiResponse<{ task_id: string }>>(
      API_ENDPOINTS.SCAN, 
      scanRequest
    )
    return response.data
  }

  async getScanStatus(taskId?: string): Promise<ScanStatus> {
    const url = taskId ? `${API_ENDPOINTS.SCAN_STATUS}/${taskId}` : API_ENDPOINTS.SCAN_STATUS
    const response = await this.api.get<ScanStatus>(url)
    return response.data
  }

  // 类型相关API
  async getGenres(): Promise<Genre[]> {
    const response = await this.api.get<Genre[]>(API_ENDPOINTS.GENRES)
    return response.data
  }

  // 统计API
  async getStats(): Promise<{
    total_movies: number
    total_tv_shows: number
    total_episodes: number
    storage_used: string
  }> {
    const response = await this.api.get(API_ENDPOINTS.STATS)
    const data = response.data
    // 转换后端返回的数据格式
    return {
      total_movies: data.total_movies,
      total_tv_shows: data.total_tv_shows,
      total_episodes: data.total_episodes,
      storage_used: `${(data.total_size / (1024 * 1024 * 1024)).toFixed(2)} GB` // 转换为 GB
    }
  }

  // 健康检查
  async healthCheck(): Promise<{ status: string; version: string }> {
    const response = await this.api.get(API_ENDPOINTS.HEALTH)
    return response.data
  }

  // 配置API
  async getConfig(): Promise<any> {
    const response = await this.api.get('/config')
    return response.data
  }

  async updateConfig(config: any): Promise<ApiResponse<any>> {
    const response = await this.api.put<ApiResponse<any>>('/config', config)
    return response.data
  }

  // 图片相关API
  async getImageUrl(path: string | null, size: string = 'w500'): Promise<string | null> {
    if (!path) return null
    
    // 如果是本地路径，直接返回
    if (path.startsWith('/') || path.startsWith('http')) {
      return `${API_BASE_URL}${path}`
    }
    
    // TMDb图片URL
    return `https://image.tmdb.org/t/p/${size}${path}`
  }

  // 文件下载
  async downloadFile(url: string, filename: string): Promise<void> {
    const response = await this.api.get(url, { responseType: 'blob' })
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    window.URL.revokeObjectURL(downloadUrl)
  }
}

// 创建单例实例
export const apiService = new ApiService()

// 导出便捷方法
export const {
  getMovies,
  getMovieById,
  getTVShows,
  getTVShowById,
  getTVSeasons,
  getTVEpisodes,
  searchMedia,
  startScan,
  getScanStatus,
  getGenres,
  getStats,
  healthCheck,
  getConfig,
  updateConfig,
  getImageUrl,
  downloadFile,
} = apiService

// 兼容性API导出（为新页面提供）
export const movieAPI = {
  getMovies: async (params?: any) => {
    const filters = params ? { 
      search: params.search,
      genre: params.genre,
      year: params.year 
    } : undefined;
    const response = await apiService.getMovies(params?.page || 1, filters);
    return response; // 直接返回响应
  },
  getMovie: (id: number) => apiService.getMovieById(id),
  getMovieById: (id: number) => apiService.getMovieById(id),
};

export const tvAPI = {
  getTVShows: async (params?: any) => {
    const filters = params ? { 
      search: params.search,
      genre: params.genre,
      status: params.status 
    } : undefined;
    const response = await apiService.getTVShows(params?.page || 1, filters);
    return response; // 直接返回响应
  },
  getTVShow: (id: number) => apiService.getTVShowById(id),
  getTVShowById: (id: number) => apiService.getTVShowById(id),
};

export const scanAPI = {
  startScan: async (data: { path: string; recursive: boolean }) => {
    const response = await apiService.startScan(data);
    return response.data || response; // 兼容不同的响应格式
  },
  getScanStatus: (taskId: string) => apiService.getScanStatus(taskId),
};

export const statsAPI = {
  getStats: () => apiService.getStats(),
};

export default apiService
