"""应用配置模块"""

import os
from typing import List, Optional
from pathlib import Path
from pydantic import BaseModel
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """应用程序设置"""
    
    # 应用基础配置
    app_name: str = "SceneScape Backend"
    app_version: str = "0.1.0"
    debug: bool = False
    host: str = "127.0.0.1"
    port: int = 8000
    log_level: str = "INFO"
    
    # 数据库配置
    database_url: str = "sqlite:///./media.db"
    
    # TMDb API 配置
    tmdb_api_key: str = ""
    tmdb_base_url: str = "https://api.themoviedb.org/3"
    tmdb_image_base_url: str = "https://image.tmdb.org/t/p/"
    
    # 文件存储配置
    static_files_path: str = "./static"
    upload_path: str = "./static/uploads"
    images_path: str = "./static/images"
    poster_path: str = "./cache/posters"
    backdrop_path: str = "./cache/backdrops"
    
    # API配置
    api_host: str = "127.0.0.1"
    api_port: int = 8000
    
    # 任务配置
    max_concurrent_tasks: int = 3
    
    # 安全配置
    secret_key: str = "your-secret-key-here"
    access_token_expire_minutes: int = 30
    
    # 媒体扫描配置
    auto_scan_enabled: bool = False
    scan_interval_hours: int = 24
    max_concurrent_scans: int = 1
    
    # 图片处理配置
    poster_sizes: List[str] = ["w185", "w342", "w500", "w780"]
    backdrop_sizes: List[str] = ["w300", "w780", "w1280", "original"]
    profile_sizes: List[str] = ["w45", "w185", "h632"]
    
    # 性能配置
    max_workers: int = 4
    request_timeout: int = 30
    batch_size: int = 50
    
    # 缓存配置
    enable_cache: bool = True
    cache_ttl: int = 3600
    
    # CORS配置
    cors_origins: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"  # 忽略额外的环境变量
    
    @property
    def DATABASE_PATH(self):
        """获取数据库路径"""
        if self.database_url.startswith("sqlite:///"):
            return Path(self.database_url[10:])  # 移除 sqlite:/// 前缀
        return Path("./media.db")
    
    @property
    def POSTER_PATH(self):
        """获取海报缓存路径"""
        return self.poster_path
    
    @property
    def BACKDROP_PATH(self):
        """获取背景图片缓存路径"""
        return self.backdrop_path


class DatabaseSettings(BaseModel):
    """数据库连接设置"""
    
    url: str
    echo: bool = False
    pool_size: int = 5
    max_overflow: int = 10
    pool_timeout: int = 30
    pool_recycle: int = 3600


class TMDbSettings(BaseModel):
    """TMDb API 设置"""
    
    api_key: str
    base_url: str
    image_base_url: str
    language: str = "zh-CN"
    timeout: int = 30
    
    @property
    def headers(self) -> dict:
        """获取API请求头"""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json;charset=utf-8"
        }


class MediaSettings(BaseModel):
    """媒体文件设置"""
    
    supported_video_extensions: List[str] = [
        ".mp4", ".mkv", ".avi", ".mov", ".wmv", 
        ".flv", ".webm", ".m4v", ".mpg", ".mpeg",
        ".3gp", ".ts", ".m2ts"
    ]
    
    supported_audio_extensions: List[str] = [
        ".mp3", ".wav", ".flac", ".aac", ".ogg",
        ".wma", ".m4a"
    ]
    
    max_file_size_mb: int = 10240  # 10GB
    scan_recursive: bool = True
    skip_hidden_files: bool = True


# 创建全局设置实例
settings = Settings()

# 根据环境变量创建子配置
database_settings = DatabaseSettings(
    url=settings.database_url,
    echo=settings.debug
)

tmdb_settings = TMDbSettings(
    api_key=settings.tmdb_api_key,
    base_url=settings.tmdb_base_url,
    image_base_url=settings.tmdb_image_base_url
)

media_settings = MediaSettings()


def get_settings() -> Settings:
    """获取应用设置"""
    return settings


def get_database_settings() -> DatabaseSettings:
    """获取数据库设置"""
    return database_settings


def get_tmdb_settings() -> TMDbSettings:
    """获取TMDb设置"""
    return tmdb_settings


def get_media_settings() -> MediaSettings:
    """获取媒体设置"""
    return media_settings


# 确保必要的目录存在
def ensure_directories():
    """确保必要的目录存在"""
    directories = [
        settings.static_files_path,
        settings.upload_path,
        settings.images_path,
        os.path.join(settings.images_path, "posters"),
        os.path.join(settings.images_path, "backdrops"),
        os.path.join(settings.images_path, "profiles"),
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)


# 验证配置
def validate_settings():
    """验证关键配置是否正确设置"""
    errors = []
    
    if not settings.tmdb_api_key or settings.tmdb_api_key == "your_tmdb_api_key_here":
        errors.append("TMDb API Key 未正确配置")
    
    if not settings.secret_key or settings.secret_key == "your-secret-key-here":
        errors.append("Secret Key 未正确配置")
    
    if errors:
        raise ValueError(f"配置验证失败: {'; '.join(errors)}")


# 在导入时执行初始化
ensure_directories()
