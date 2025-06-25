#!/usr/bin/env python3
"""
SceneScape Backend - 图片下载和缓存服务
处理TMDb图片的下载、缓存和优化
"""

import asyncio
import hashlib
import logging
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse

import aiofiles
import aiohttp
from PIL import Image

from .config import settings

logger = logging.getLogger(__name__)

class ImageCacheService:
    """图片缓存服务"""
    
    def __init__(self):
        self.poster_dir = Path(settings.POSTER_PATH)
        self.backdrop_dir = Path(settings.BACKDROP_PATH)
        self.poster_dir.mkdir(parents=True, exist_ok=True)
        self.backdrop_dir.mkdir(parents=True, exist_ok=True)
        
        # TMDb图片基础URL
        self.tmdb_image_base_url = "https://image.tmdb.org/t/p/"
        
        # 图片尺寸配置
        self.poster_sizes = ["w185", "w342", "w500", "w780", "original"]
        self.backdrop_sizes = ["w300", "w780", "w1280", "original"]
        
        # 默认使用的尺寸
        self.default_poster_size = "w500"
        self.default_backdrop_size = "w1280"
    
    def _get_cache_filename(self, image_path: str, size: str = None) -> str:
        """生成缓存文件名"""
        # 移除路径开头的斜杠
        clean_path = image_path.lstrip('/')
        
        # 生成唯一文件名
        if size:
            hash_input = f"{clean_path}_{size}"
        else:
            hash_input = clean_path
        
        file_hash = hashlib.md5(hash_input.encode()).hexdigest()
        
        # 保持原文件扩展名
        original_ext = Path(clean_path).suffix or '.jpg'
        return f"{file_hash}{original_ext}"
    
    def _get_cache_path(self, image_type: str, filename: str) -> Path:
        """获取缓存文件路径"""
        if image_type == "poster":
            return self.poster_dir / filename
        elif image_type == "backdrop":
            return self.backdrop_dir / filename
        else:
            raise ValueError(f"Unknown image type: {image_type}")
    
    async def download_image(
        self, 
        image_path: str, 
        image_type: str, 
        size: str = None
    ) -> Optional[str]:
        """
        下载并缓存图片
        
        Args:
            image_path: TMDb图片路径
            image_type: 图片类型 (poster/backdrop)
            size: 图片尺寸
            
        Returns:
            缓存文件的相对路径，失败时返回None
        """
        if not image_path:
            return None
        
        # 确定使用的尺寸
        if not size:
            size = self.default_poster_size if image_type == "poster" else self.default_backdrop_size
        
        # 生成缓存文件名和路径
        cache_filename = self._get_cache_filename(image_path, size)
        cache_path = self._get_cache_path(image_type, cache_filename)
        
        # 如果文件已存在，直接返回
        if cache_path.exists():
            return f"/{image_type}s/{cache_filename}"
        
        # 构建完整的图片URL
        image_url = f"{self.tmdb_image_base_url}{size}{image_path}"
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(image_url) as response:
                    if response.status == 200:
                        # 下载图片
                        image_data = await response.read()
                        
                        # 保存原始图片
                        async with aiofiles.open(cache_path, 'wb') as f:
                            await f.write(image_data)
                        
                        # 生成缩略图（可选）
                        await self._generate_thumbnails(cache_path, image_type)
                        
                        logger.info(f"成功下载图片: {image_url} -> {cache_path}")
                        return f"/{image_type}s/{cache_filename}"
                    else:
                        logger.warning(f"下载图片失败 {image_url}: HTTP {response.status}")
                        return None
                        
        except Exception as e:
            logger.error(f"下载图片时出错 {image_url}: {e}")
            return None
    
    async def _generate_thumbnails(self, image_path: Path, image_type: str):
        """生成不同尺寸的缩略图"""
        try:
            # 定义缩略图尺寸
            thumbnail_sizes = {
                "poster": [(150, 225), (300, 450)],  # 2:3 比例
                "backdrop": [(300, 169), (600, 338)]  # 16:9 比例
            }
            
            if image_type not in thumbnail_sizes:
                return
            
            # 使用线程池处理图片操作
            await asyncio.get_event_loop().run_in_executor(
                None, 
                self._create_thumbnails_sync, 
                image_path, 
                thumbnail_sizes[image_type]
            )
            
        except Exception as e:
            logger.error(f"生成缩略图失败 {image_path}: {e}")
    
    def _create_thumbnails_sync(self, image_path: Path, sizes: list):
        """同步创建缩略图"""
        try:
            with Image.open(image_path) as img:
                # 转换为RGB模式（处理RGBA等格式）
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                for width, height in sizes:
                    # 计算缩略图路径
                    thumb_filename = f"{image_path.stem}_thumb_{width}x{height}{image_path.suffix}"
                    thumb_path = image_path.parent / thumb_filename
                    
                    # 创建缩略图
                    img.thumbnail((width, height), Image.Resampling.LANCZOS)
                    img.save(thumb_path, "JPEG", quality=85, optimize=True)
                    
        except Exception as e:
            logger.error(f"创建缩略图时出错: {e}")
    
    async def download_poster(self, poster_path: str, size: str = None) -> Optional[str]:
        """下载海报图片"""
        return await self.download_image(poster_path, "poster", size)
    
    async def download_backdrop(self, backdrop_path: str, size: str = None) -> Optional[str]:
        """下载背景图片"""
        return await self.download_image(backdrop_path, "backdrop", size)
    
    async def batch_download_images(self, images: list) -> dict:
        """
        批量下载图片
        
        Args:
            images: 图片信息列表，格式: [{"path": str, "type": str, "size": str}, ...]
            
        Returns:
            下载结果字典
        """
        tasks = []
        for img_info in images:
            task = self.download_image(
                img_info["path"], 
                img_info["type"], 
                img_info.get("size")
            )
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        download_results = {
            "success": [],
            "failed": [],
            "total": len(images)
        }
        
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                download_results["failed"].append({
                    "image": images[i],
                    "error": str(result)
                })
            elif result:
                download_results["success"].append({
                    "image": images[i],
                    "cached_path": result
                })
            else:
                download_results["failed"].append({
                    "image": images[i],
                    "error": "Download failed"
                })
        
        return download_results
    
    def get_cached_image_path(self, image_path: str, image_type: str, size: str = None) -> Optional[str]:
        """获取缓存图片路径（如果存在）"""
        if not image_path:
            return None
        
        if not size:
            size = self.default_poster_size if image_type == "poster" else self.default_backdrop_size
        
        cache_filename = self._get_cache_filename(image_path, size)
        cache_path = self._get_cache_path(image_type, cache_filename)
        
        if cache_path.exists():
            return f"/{image_type}s/{cache_filename}"
        
        return None
    
    def cleanup_cache(self, max_age_days: int = 30) -> dict:
        """
        清理过期的缓存文件
        
        Args:
            max_age_days: 最大保存天数
            
        Returns:
            清理结果统计
        """
        import time
        from datetime import datetime, timedelta
        
        max_age = datetime.now() - timedelta(days=max_age_days)
        max_age_timestamp = max_age.timestamp()
        
        cleanup_stats = {
            "posters_deleted": 0,
            "backdrops_deleted": 0,
            "total_size_freed": 0
        }
        
        # 清理海报缓存
        for poster_file in self.poster_dir.iterdir():
            if poster_file.is_file():
                file_mtime = poster_file.stat().st_mtime
                if file_mtime < max_age_timestamp:
                    file_size = poster_file.stat().st_size
                    poster_file.unlink()
                    cleanup_stats["posters_deleted"] += 1
                    cleanup_stats["total_size_freed"] += file_size
        
        # 清理背景图片缓存
        for backdrop_file in self.backdrop_dir.iterdir():
            if backdrop_file.is_file():
                file_mtime = backdrop_file.stat().st_mtime
                if file_mtime < max_age_timestamp:
                    file_size = backdrop_file.stat().st_size
                    backdrop_file.unlink()
                    cleanup_stats["backdrops_deleted"] += 1
                    cleanup_stats["total_size_freed"] += file_size
        
        logger.info(f"缓存清理完成: {cleanup_stats}")
        return cleanup_stats
    
    def get_cache_stats(self) -> dict:
        """获取缓存统计信息"""
        poster_stats = self._get_directory_stats(self.poster_dir)
        backdrop_stats = self._get_directory_stats(self.backdrop_dir)
        
        return {
            "posters": poster_stats,
            "backdrops": backdrop_stats,
            "total_files": poster_stats["count"] + backdrop_stats["count"],
            "total_size": poster_stats["size"] + backdrop_stats["size"]
        }
    
    def _get_directory_stats(self, directory: Path) -> dict:
        """获取目录统计信息"""
        total_size = 0
        file_count = 0
        
        for file_path in directory.iterdir():
            if file_path.is_file():
                total_size += file_path.stat().st_size
                file_count += 1
        
        return {
            "count": file_count,
            "size": total_size,
            "size_mb": round(total_size / (1024 * 1024), 2)
        }

# 全局图片缓存服务实例
image_cache_service = ImageCacheService()

# 便捷函数
async def download_poster(poster_path: str, size: str = None) -> Optional[str]:
    """下载海报的便捷函数"""
    return await image_cache_service.download_poster(poster_path, size)

async def download_backdrop(backdrop_path: str, size: str = None) -> Optional[str]:
    """下载背景图片的便捷函数"""
    return await image_cache_service.download_backdrop(backdrop_path, size)

async def batch_download_images(images: list) -> dict:
    """批量下载图片的便捷函数"""
    return await image_cache_service.batch_download_images(images)
