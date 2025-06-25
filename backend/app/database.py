"""数据库模型和配置"""

import os
from datetime import datetime
from typing import List, Optional

from sqlalchemy import (
    Boolean, Column, Integer, String, Float, Text, DateTime, 
    ForeignKey, Table, create_engine
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session
from sqlalchemy.sql import func

from .config import get_database_settings

# 获取数据库设置
db_settings = get_database_settings()

# 创建数据库引擎
engine = create_engine(
    db_settings.url,
    echo=db_settings.echo,
    pool_size=db_settings.pool_size,
    max_overflow=db_settings.max_overflow,
    pool_timeout=db_settings.pool_timeout,
    pool_recycle=db_settings.pool_recycle,
    connect_args={"check_same_thread": False} if "sqlite" in db_settings.url else {}
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基础模型类
Base = declarative_base()


# 多对多关系表
movie_genre_association = Table(
    'movie_genre_association',
    Base.metadata,
    Column('movie_id', Integer, ForeignKey('movies.id')),
    Column('genre_id', Integer, ForeignKey('genres.id'))
)

tv_show_genre_association = Table(
    'tv_show_genre_association',
    Base.metadata,
    Column('tv_show_id', Integer, ForeignKey('tv_shows.id')),
    Column('genre_id', Integer, ForeignKey('genres.id'))
)


class TimestampMixin:
    """时间戳混入类"""
    created_at = Column(DateTime, default=datetime.utcnow, server_default=func.now())
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Movie(Base, TimestampMixin):
    """电影模型"""
    __tablename__ = "movies"
    
    id = Column(Integer, primary_key=True, index=True)
    tmdb_id = Column(Integer, unique=True, index=True, nullable=False)
    imdb_id = Column(String, index=True)
    
    # 基本信息
    title = Column(String, index=True, nullable=False)
    original_title = Column(String)
    overview = Column(Text)
    tagline = Column(String)
    
    # 发布信息
    release_date = Column(String)
    status = Column(String)  # Released, In Production, etc.
    
    # 评分和人气
    vote_average = Column(Float, default=0.0)
    vote_count = Column(Integer, default=0)
    popularity = Column(Float, default=0.0)
    
    # 技术信息
    runtime = Column(Integer)  # 运行时间（分钟）
    budget = Column(Integer, default=0)
    revenue = Column(Integer, default=0)
    
    # 媒体文件信息
    poster_path = Column(String)
    backdrop_path = Column(String)
    local_path = Column(String, unique=True, nullable=False)  # 本地文件路径
    file_size = Column(Integer)  # 文件大小（字节）
    
    # 语言和地区
    original_language = Column(String)
    spoken_languages = Column(Text)  # JSON字符串
    production_countries = Column(Text)  # JSON字符串
    production_companies = Column(Text)  # JSON字符串
    
    # 其他标记
    adult = Column(Boolean, default=False)
    video = Column(Boolean, default=False)
    
    # 关系
    genres = relationship("Genre", secondary=movie_genre_association, back_populates="movies")
    cast = relationship("CastMember", back_populates="movie", cascade="all, delete-orphan")
    crew = relationship("CrewMember", back_populates="movie", cascade="all, delete-orphan")


class TVShow(Base, TimestampMixin):
    """电视剧模型"""
    __tablename__ = "tv_shows"
    
    id = Column(Integer, primary_key=True, index=True)
    tmdb_id = Column(Integer, unique=True, index=True, nullable=False)
    imdb_id = Column(String, index=True)
    
    # 基本信息
    name = Column(String, index=True, nullable=False)
    original_name = Column(String)
    overview = Column(Text)
    tagline = Column(String)
    
    # 发布信息
    first_air_date = Column(String)
    last_air_date = Column(String)
    status = Column(String)  # Returning Series, Ended, etc.
    type = Column(String)  # Scripted, Reality, etc.
    
    # 评分和人气
    vote_average = Column(Float, default=0.0)
    vote_count = Column(Integer, default=0)
    popularity = Column(Float, default=0.0)
    
    # 剧集信息
    number_of_seasons = Column(Integer, default=0)
    number_of_episodes = Column(Integer, default=0)
    episode_run_time = Column(Text)  # JSON数组，每集运行时间
    
    # 媒体文件信息
    poster_path = Column(String)
    backdrop_path = Column(String)
    local_path = Column(String, nullable=False)  # 本地目录路径（电视剧可以有多个集数文件）
    
    # 语言和地区
    original_language = Column(String)
    spoken_languages = Column(Text)  # JSON字符串
    production_countries = Column(Text)  # JSON字符串
    production_companies = Column(Text)  # JSON字符串
    networks = Column(Text)  # JSON字符串，播出网络
    
    # 其他信息
    adult = Column(Boolean, default=False)
    in_production = Column(Boolean, default=False)
    homepage = Column(String)
    
    # 关系
    genres = relationship("Genre", secondary=tv_show_genre_association, back_populates="tv_shows")
    seasons = relationship("TVSeason", back_populates="tv_show", cascade="all, delete-orphan")
    created_by = relationship("Creator", back_populates="tv_show", cascade="all, delete-orphan")


class TVSeason(Base, TimestampMixin):
    """电视剧季度模型"""
    __tablename__ = "tv_seasons"
    
    id = Column(Integer, primary_key=True, index=True)
    tmdb_id = Column(Integer, unique=True, index=True)
    tv_show_id = Column(Integer, ForeignKey('tv_shows.id'), nullable=False)
    
    season_number = Column(Integer, nullable=False)
    name = Column(String)
    overview = Column(Text)
    
    air_date = Column(String)
    episode_count = Column(Integer, default=0)
    
    poster_path = Column(String)
    
    # 关系
    tv_show = relationship("TVShow", back_populates="seasons")
    episodes = relationship("TVEpisode", back_populates="season", cascade="all, delete-orphan")


class TVEpisode(Base, TimestampMixin):
    """电视剧单集模型"""
    __tablename__ = "tv_episodes"
    
    id = Column(Integer, primary_key=True, index=True)
    tmdb_id = Column(Integer, unique=True, index=True)
    season_id = Column(Integer, ForeignKey('tv_seasons.id'), nullable=False)
    
    episode_number = Column(Integer, nullable=False)
    name = Column(String)
    overview = Column(Text)
    
    air_date = Column(String)
    runtime = Column(Integer)  # 运行时间（分钟）
    
    vote_average = Column(Float, default=0.0)
    vote_count = Column(Integer, default=0)
    
    still_path = Column(String)  # 剧集截图
    local_path = Column(String, unique=True, nullable=False)  # 本地文件路径
    file_size = Column(Integer)  # 文件大小（字节）
    
    # 关系
    season = relationship("TVSeason", back_populates="episodes")


class Genre(Base, TimestampMixin):
    """类型模型"""
    __tablename__ = "genres"
    
    id = Column(Integer, primary_key=True, index=True)
    tmdb_id = Column(Integer, unique=True, nullable=False)
    name = Column(String, unique=True, nullable=False)
    
    # 关系
    movies = relationship("Movie", secondary=movie_genre_association, back_populates="genres")
    tv_shows = relationship("TVShow", secondary=tv_show_genre_association, back_populates="genres")


class CastMember(Base, TimestampMixin):
    """演员模型"""
    __tablename__ = "cast_members"
    
    id = Column(Integer, primary_key=True, index=True)
    tmdb_id = Column(Integer, nullable=False)
    movie_id = Column(Integer, ForeignKey('movies.id'), nullable=True)
    
    name = Column(String, nullable=False)
    character = Column(String)
    credit_id = Column(String, unique=True)
    order = Column(Integer)  # 演员排序
    
    profile_path = Column(String)
    
    # 个人信息
    gender = Column(Integer)  # 0=未知, 1=女性, 2=男性
    popularity = Column(Float, default=0.0)
    
    # 关系
    movie = relationship("Movie", back_populates="cast")


class CrewMember(Base, TimestampMixin):
    """工作人员模型"""
    __tablename__ = "crew_members"
    
    id = Column(Integer, primary_key=True, index=True)
    tmdb_id = Column(Integer, nullable=False)
    movie_id = Column(Integer, ForeignKey('movies.id'), nullable=True)
    
    name = Column(String, nullable=False)
    job = Column(String)  # 工作职位
    department = Column(String)  # 部门
    credit_id = Column(String, unique=True)
    
    profile_path = Column(String)
    
    # 个人信息
    gender = Column(Integer)
    popularity = Column(Float, default=0.0)
    
    # 关系
    movie = relationship("Movie", back_populates="crew")


class Creator(Base, TimestampMixin):
    """电视剧创作者模型"""
    __tablename__ = "creators"
    
    id = Column(Integer, primary_key=True, index=True)
    tmdb_id = Column(Integer, nullable=False)
    tv_show_id = Column(Integer, ForeignKey('tv_shows.id'), nullable=False)
    
    name = Column(String, nullable=False)
    credit_id = Column(String)
    
    profile_path = Column(String)
    
    # 个人信息
    gender = Column(Integer)
    popularity = Column(Float, default=0.0)
    
    # 关系
    tv_show = relationship("TVShow", back_populates="created_by")


class ScanTask(Base, TimestampMixin):
    """扫描任务模型"""
    __tablename__ = "scan_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(String, unique=True, nullable=False)
    
    path = Column(String, nullable=False)
    status = Column(String, default="pending")  # pending, running, completed, failed
    progress = Column(Float, default=0.0)
    
    total_files = Column(Integer, default=0)
    processed_files = Column(Integer, default=0)
    found_movies = Column(Integer, default=0)
    found_tv_shows = Column(Integer, default=0)
    found_episodes = Column(Integer, default=0)
    
    current_file = Column(String)
    error_message = Column(Text)
    
    started_at = Column(DateTime)
    completed_at = Column(DateTime)


# 数据库会话依赖
def get_db() -> Session:
    """获取数据库会话"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 创建所有表
def create_tables():
    """创建所有数据库表"""
    Base.metadata.create_all(bind=engine)


# 删除所有表（仅用于开发）
def drop_tables():
    """删除所有数据库表"""
    Base.metadata.drop_all(bind=engine)


# 数据库初始化
def init_db():
    """初始化数据库"""
    create_tables()
    
    # 可以在这里添加初始数据
    # 例如：创建默认类型数据等


if __name__ == "__main__":
    # 直接运行此文件时初始化数据库
    init_db()
    print("数据库初始化完成")
