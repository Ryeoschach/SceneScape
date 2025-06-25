"""TMDb API 集成模块"""

import asyncio
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime

import httpx
from .config import get_tmdb_settings

logger = logging.getLogger(__name__)


class TMDbAPIError(Exception):
    """TMDb API 错误"""
    pass


class TMDbAPIClient:
    """TMDb API 客户端"""
    
    def __init__(self):
        self.settings = get_tmdb_settings()
        self.client: Optional[httpx.AsyncClient] = None
    
    async def __aenter__(self):
        """异步上下文管理器入口"""
        self.client = httpx.AsyncClient(
            base_url=self.settings.base_url,
            headers=self.settings.headers,
            timeout=self.settings.timeout,
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """异步上下文管理器出口"""
        if self.client:
            await self.client.aclose()
    
    async def _make_request(self, endpoint: str, params: Optional[Dict] = None) -> Dict:
        """发起API请求"""
        if not self.client:
            raise TMDbAPIError("客户端未初始化")
        
        try:
            # 添加默认参数
            default_params = {"language": self.settings.language}
            if params:
                default_params.update(params)
            
            response = await self.client.get(endpoint, params=default_params)
            response.raise_for_status()
            
            data = response.json()
            logger.debug(f"TMDb API 请求成功: {endpoint}")
            return data
            
        except httpx.HTTPStatusError as e:
            logger.error(f"TMDb API HTTP 错误: {e.response.status_code} - {endpoint}")
            raise TMDbAPIError(f"API请求失败: {e.response.status_code}")
        except httpx.RequestError as e:
            logger.error(f"TMDb API 请求错误: {e} - {endpoint}")
            raise TMDbAPIError(f"网络请求失败: {e}")
        except Exception as e:
            logger.error(f"TMDb API 未知错误: {e} - {endpoint}")
            raise TMDbAPIError(f"未知错误: {e}")
    
    async def search_movie(self, query: str, year: Optional[int] = None, page: int = 1) -> Dict:
        """搜索电影"""
        params = {
            "query": query,
            "page": page,
        }
        if year:
            params["year"] = year
        
        return await self._make_request("/search/movie", params)
    
    async def search_tv(self, query: str, year: Optional[int] = None, page: int = 1) -> Dict:
        """搜索电视剧"""
        params = {
            "query": query,
            "page": page,
        }
        if year:
            params["first_air_date_year"] = year
        
        return await self._make_request("/search/tv", params)
    
    async def get_movie_details(self, movie_id: int, append_to_response: Optional[str] = None) -> Dict:
        """获取电影详情"""
        params = {}
        if append_to_response:
            params["append_to_response"] = append_to_response
        
        return await self._make_request(f"/movie/{movie_id}", params)
    
    async def get_tv_details(self, tv_id: int, append_to_response: Optional[str] = None) -> Dict:
        """获取电视剧详情"""
        params = {}
        if append_to_response:
            params["append_to_response"] = append_to_response
        
        return await self._make_request(f"/tv/{tv_id}", params)
    
    async def get_tv_season_details(self, tv_id: int, season_number: int) -> Dict:
        """获取电视剧季度详情"""
        return await self._make_request(f"/tv/{tv_id}/season/{season_number}")
    
    async def get_tv_episode_details(self, tv_id: int, season_number: int, episode_number: int) -> Dict:
        """获取电视剧单集详情"""
        return await self._make_request(f"/tv/{tv_id}/season/{season_number}/episode/{episode_number}")
    
    async def get_genres_movie(self) -> Dict:
        """获取电影类型列表"""
        return await self._make_request("/genre/movie/list")
    
    async def get_genres_tv(self) -> Dict:
        """获取电视剧类型列表"""
        return await self._make_request("/genre/tv/list")
    
    async def get_popular_movies(self, page: int = 1) -> Dict:
        """获取热门电影"""
        return await self._make_request("/movie/popular", {"page": page})
    
    async def get_popular_tv(self, page: int = 1) -> Dict:
        """获取热门电视剧"""
        return await self._make_request("/tv/popular", {"page": page})
    
    async def get_trending(self, media_type: str = "all", time_window: str = "day") -> Dict:
        """获取趋势内容"""
        return await self._make_request(f"/trending/{media_type}/{time_window}")
    
    def get_image_url(self, path: str, size: str = "w500") -> str:
        """获取图片完整URL"""
        if not path:
            return ""
        return f"{self.settings.image_base_url}{size}{path}"
    
    def get_poster_url(self, path: str, size: str = "w500") -> str:
        """获取海报URL"""
        return self.get_image_url(path, size)
    
    def get_backdrop_url(self, path: str, size: str = "w1280") -> str:
        """获取背景图URL"""
        return self.get_image_url(path, size)
    
    def get_profile_url(self, path: str, size: str = "w185") -> str:
        """获取演员头像URL"""
        return self.get_image_url(path, size)


class TMDbService:
    """TMDb 服务类"""
    
    def __init__(self):
        self.client = TMDbAPIClient()
    
    async def search_movie(self, query: str, year: Optional[int] = None) -> List[Dict]:
        """搜索电影"""
        async with self.client as api:
            result = await api.search_movie(query, year)
            return result.get("results", [])
    
    async def search_tv_show(self, query: str, year: Optional[int] = None) -> List[Dict]:
        """搜索电视剧"""
        async with self.client as api:
            result = await api.search_tv(query, year)
            return result.get("results", [])
    
    async def search_tv(self, query: str, year: Optional[int] = None) -> List[Dict]:
        """搜索电视剧（别名方法）"""
        return await self.search_tv_show(query, year)
    
    async def get_movie_details(self, movie_id: int) -> Dict:
        """获取电影详细信息"""
        async with self.client as api:
            return await api.get_movie_details(movie_id)
    
    async def get_tv_details(self, tv_id: int) -> Dict:
        """获取电视剧详细信息"""
        async with self.client as api:
            return await api.get_tv_details(tv_id)
    
    async def get_tv_season_details(self, tv_id: int, season_number: int) -> Dict:
        """获取电视剧季度详细信息"""
        async with self.client as api:
            return await api.get_tv_season_details(tv_id, season_number)
    
    async def get_tv_episode_details(self, tv_id: int, season_number: int, episode_number: int) -> Dict:
        """获取电视剧单集详细信息"""
        async with self.client as api:
            return await api.get_tv_episode_details(tv_id, season_number, episode_number)

    async def get_all_genres(self) -> Dict[str, List[Dict]]:
        """获取所有类型"""
        async with self.client as api:
            movie_genres = await api.get_genres_movie()
            tv_genres = await api.get_genres_tv()
            
            return {
                "movie_genres": movie_genres.get("genres", []),
                "tv_genres": tv_genres.get("genres", []),
            }
    
    async def download_image(self, image_url: str, save_path: str) -> bool:
        """下载图片到本地"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(image_url, timeout=30)
                response.raise_for_status()
                
                # 确保目录存在
                import os
                os.makedirs(os.path.dirname(save_path), exist_ok=True)
                
                # 写入文件
                with open(save_path, 'wb') as f:
                    f.write(response.content)
                
                logger.info(f"图片下载成功: {save_path}")
                return True
                
        except Exception as e:
            logger.error(f"图片下载失败 {image_url}: {e}")
            return False
    
    async def batch_download_images(self, image_tasks: List[Dict]) -> Dict[str, bool]:
        """批量下载图片"""
        results = {}
        
        async def download_task(task):
            url = task["url"]
            path = task["path"]
            success = await self.download_image(url, path)
            return task["key"], success
        
        # 使用信号量限制并发数
        semaphore = asyncio.Semaphore(5)  # 最多5个并发下载
        
        async def bounded_download(task):
            async with semaphore:
                return await download_task(task)
        
        # 执行所有下载任务
        download_results = await asyncio.gather(
            *[bounded_download(task) for task in image_tasks],
            return_exceptions=True
        )
        
        # 处理结果
        for result in download_results:
            if isinstance(result, Exception):
                logger.error(f"批量下载任务失败: {result}")
            else:
                key, success = result
                results[key] = success
        
        return results


# 创建全局服务实例
tmdb_service = TMDbService()


# 便捷函数
async def search_movie(query: str, year: Optional[int] = None) -> Dict:
    """搜索电影的便捷函数"""
    return await tmdb_service.search_media(query, "movie", year)


async def search_tv(query: str, year: Optional[int] = None) -> Dict:
    """搜索电视剧的便捷函数"""
    return await tmdb_service.search_media(query, "tv", year)


async def get_movie_details(movie_id: int) -> Dict:
    """获取电影详情的便捷函数"""
    return await tmdb_service.get_movie_metadata(movie_id)


async def get_tv_details(tv_id: int) -> Dict:
    """获取电视剧详情的便捷函数"""
    return await tmdb_service.get_tv_metadata(tv_id)


def get_image_url(path: str, size: str = "w500") -> str:
    """获取图片URL的便捷函数"""
    if not path:
        return ""
    
    tmdb_settings = get_tmdb_settings()
    return f"{tmdb_settings.image_base_url}{size}{path}"
