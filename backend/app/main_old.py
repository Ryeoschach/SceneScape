#!/usr/bin/env python3
"""
SceneScape Backend - FastAPI Main Application
智能影视媒体库管理系统主应用
"""

import asyncio
import logging
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Dict, Any

from fastapi import FastAPI, HTTPException, BackgroundTasks, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel

from .config import settings
from .database import get_db, init_db, SessionLocal, Movie, TVShow, TVSeason, TVEpisode, Genre, ScanTask
from . import tmdb_api, media_parser

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 创建必要的目录
poster_dir = Path(settings.POSTER_PATH)
backdrop_dir = Path(settings.BACKDROP_PATH)
poster_dir.mkdir(parents=True, exist_ok=True)
backdrop_dir.mkdir(parents=True, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    logger.info("启动 SceneScape 后端服务...")
    
    # 初始化数据库
    init_db()
    logger.info("数据库初始化完成")
    
    # 初始化TMDb服务
    tmdb_service = tmdb_api.TMDbService()
    app.state.tmdb_service = tmdb_service
    logger.info("TMDb服务初始化完成")
    
    yield
    
    logger.info("关闭 SceneScape 后端服务...")

# 创建FastAPI应用
app = FastAPI(
    title="SceneScape API",
    description="智能影视媒体库管理系统",
    version="1.0.0",
    lifespan=lifespan
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 静态文件服务
app.mount("/posters", StaticFiles(directory=str(poster_dir)), name="posters")
app.mount("/backdrops", StaticFiles(directory=str(backdrop_dir)), name="backdrops")

# Pydantic模型
class ScanRequest(BaseModel):
    path: str
    recursive: bool = True

class ScanResponse(BaseModel):
    task_id: str
    message: str

class MovieResponse(BaseModel):
    id: int
    title: str
    original_title: str
    year: int
    overview: str
    poster_path: str | None
    backdrop_path: str | None
    rating: float
    release_date: str | None
    runtime: int | None
    genres: list[str]
    
class TVShowResponse(BaseModel):
    id: int
    title: str
    original_title: str
    first_air_date: str | None
    last_air_date: str | None
    overview: str
    poster_path: str | None
    backdrop_path: str | None
    rating: float
    status: str
    number_of_seasons: int
    number_of_episodes: int
    genres: list[str]

class StatsResponse(BaseModel):
    total_movies: int
    total_tv_shows: int
    total_episodes: int
    total_size: int
    recent_additions: int

# API路由

@app.get("/")
async def root():
    """根路径健康检查"""
    return {"message": "SceneScape API is running", "version": "1.0.0"}

@app.get("/api/health")
async def health_check():
    """健康检查接口"""
    return {"status": "healthy", "service": "SceneScape API"}

# 媒体库扫描
@app.post("/api/scan", response_model=ScanResponse)
async def scan_media_library(
    scan_request: ScanRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """扫描媒体库"""
    scan_path = Path(scan_request.path)
    
    if not scan_path.exists():
        raise HTTPException(status_code=400, detail="指定的路径不存在")
    
    if not scan_path.is_dir():
        raise HTTPException(status_code=400, detail="指定的路径不是目录")
    
    # 创建扫描任务
    scan_task = ScanTask(
        path=str(scan_path),
        status="pending",
        total_files=0,
        processed_files=0
    )
    db.add(scan_task)
    db.commit()
    db.refresh(scan_task)
    
    # 添加后台任务
    background_tasks.add_task(
        perform_media_scan,
        scan_task.id,
        str(scan_path),
        scan_request.recursive
    )
    
    return ScanResponse(
        task_id=str(scan_task.id),
        message=f"开始扫描 {scan_path}"
    )

@app.get("/api/scan/{task_id}")
async def get_scan_status(task_id: int, db: Session = Depends(get_db)):
    """获取扫描任务状态"""
    task = db.query(models.ScanTask).filter(models.ScanTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="扫描任务不存在")
    
    return {
        "id": task.id,
        "status": task.status,
        "path": task.path,
        "total_files": task.total_files,
        "processed_files": task.processed_files,
        "progress": (task.processed_files / task.total_files * 100) if task.total_files > 0 else 0,
        "error_message": task.error_message,
        "created_at": task.created_at,
        "updated_at": task.updated_at
    }

# 电影相关接口
@app.get("/api/movies", response_model=list[MovieResponse])
async def get_movies(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    genre: str = Query(None),
    year: int = Query(None),
    db: Session = Depends(get_db)
):
    """获取电影列表"""
    query = db.query(models.Movie)
    
    if search:
        query = query.filter(models.Movie.title.contains(search))
    
    if year:
        query = query.filter(models.Movie.year == year)
    
    if genre:
        query = query.join(models.Movie.genres).filter(models.Genre.name == genre)
    
    total = query.count()
    movies = query.offset((page - 1) * limit).limit(limit).all()
    
    result = []
    for movie in movies:
        result.append(MovieResponse(
            id=movie.id,
            title=movie.title,
            original_title=movie.original_title,
            year=movie.year,
            overview=movie.overview or "",
            poster_path=movie.poster_path,
            backdrop_path=movie.backdrop_path,
            rating=movie.rating or 0.0,
            release_date=movie.release_date.isoformat() if movie.release_date else None,
            runtime=movie.runtime,
            genres=[g.name for g in movie.genres]
        ))
    
    return result

@app.get("/api/movies/{movie_id}", response_model=MovieResponse)
async def get_movie(movie_id: int, db: Session = Depends(get_db)):
    """获取电影详情"""
    movie = db.query(models.Movie).filter(models.Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="电影不存在")
    
    return MovieResponse(
        id=movie.id,
        title=movie.title,
        original_title=movie.original_title,
        year=movie.year,
        overview=movie.overview or "",
        poster_path=movie.poster_path,
        backdrop_path=movie.backdrop_path,
        rating=movie.rating or 0.0,
        release_date=movie.release_date.isoformat() if movie.release_date else None,
        runtime=movie.runtime,
        genres=[g.name for g in movie.genres]
    )

# 电视剧相关接口
@app.get("/api/tv-shows", response_model=list[TVShowResponse])
async def get_tv_shows(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    genre: str = Query(None),
    status: str = Query(None),
    db: Session = Depends(get_db)
):
    """获取电视剧列表"""
    query = db.query(models.TVShow)
    
    if search:
        query = query.filter(models.TVShow.title.contains(search))
    
    if status:
        query = query.filter(models.TVShow.status == status)
    
    if genre:
        query = query.join(models.TVShow.genres).filter(models.Genre.name == genre)
    
    tv_shows = query.offset((page - 1) * limit).limit(limit).all()
    
    result = []
    for show in tv_shows:
        result.append(TVShowResponse(
            id=show.id,
            title=show.title,
            original_title=show.original_title,
            first_air_date=show.first_air_date.isoformat() if show.first_air_date else None,
            last_air_date=show.last_air_date.isoformat() if show.last_air_date else None,
            overview=show.overview or "",
            poster_path=show.poster_path,
            backdrop_path=show.backdrop_path,
            rating=show.rating or 0.0,
            status=show.status or "",
            number_of_seasons=show.number_of_seasons or 0,
            number_of_episodes=show.number_of_episodes or 0,
            genres=[g.name for g in show.genres]
        ))
    
    return result

@app.get("/api/tv-shows/{show_id}", response_model=TVShowResponse)
async def get_tv_show(show_id: int, db: Session = Depends(get_db)):
    """获取电视剧详情"""
    show = db.query(models.TVShow).filter(models.TVShow.id == show_id).first()
    if not show:
        raise HTTPException(status_code=404, detail="电视剧不存在")
    
    return TVShowResponse(
        id=show.id,
        title=show.title,
        original_title=show.original_title,
        first_air_date=show.first_air_date.isoformat() if show.first_air_date else None,
        last_air_date=show.last_air_date.isoformat() if show.last_air_date else None,
        overview=show.overview or "",
        poster_path=show.poster_path,
        backdrop_path=show.backdrop_path,
        rating=show.rating or 0.0,
        status=show.status or "",
        number_of_seasons=show.number_of_seasons or 0,
        number_of_episodes=show.number_of_episodes or 0,
        genres=[g.name for g in show.genres]
    )

# 统计信息
@app.get("/api/stats", response_model=StatsResponse)
async def get_stats(db: Session = Depends(get_db)):
    """获取媒体库统计信息"""
    total_movies = db.query(models.Movie).count()
    total_tv_shows = db.query(models.TVShow).count()
    total_episodes = db.query(models.TVEpisode).count()
    
    # 计算总文件大小（简化版本）
    total_size = 0
    
    # 计算最近添加的数量（最近7天）
    from datetime import datetime, timedelta
    recent_date = datetime.now() - timedelta(days=7)
    recent_movies = db.query(models.Movie).filter(models.Movie.created_at >= recent_date).count()
    recent_shows = db.query(models.TVShow).filter(models.TVShow.created_at >= recent_date).count()
    recent_additions = recent_movies + recent_shows
    
    return StatsResponse(
        total_movies=total_movies,
        total_tv_shows=total_tv_shows,
        total_episodes=total_episodes,
        total_size=total_size,
        recent_additions=recent_additions
    )

# 后台任务函数
async def perform_media_scan(task_id: int, scan_path: str, recursive: bool = True):
    """执行媒体扫描的后台任务"""
    db = SessionLocal()
    try:
        # 更新任务状态
        task = db.query(models.ScanTask).filter(models.ScanTask.id == task_id).first()
        task.status = "running"
        db.commit()
        
        logger.info(f"开始扫描路径: {scan_path}")
        
        # 获取TMDb服务
        tmdb_service = tmdb_api.TMDbService()
        
        # 扫描媒体文件
        parser = media_parser.MediaParser()
        media_files = parser.scan_directory(scan_path, recursive)
        
        task.total_files = len(media_files)
        db.commit()
        
        processed = 0
        for media_file in media_files:
            try:
                # 解析媒体信息
                media_info = parser.parse_media_file(media_file)
                
                if media_info.media_type == "movie":
                    await process_movie(db, tmdb_service, media_info)
                elif media_info.media_type == "tv":
                    await process_tv_show(db, tmdb_service, media_info)
                
                processed += 1
                task.processed_files = processed
                db.commit()
                
                # 避免API请求过快
                await asyncio.sleep(0.1)
                
            except Exception as e:
                logger.error(f"处理文件 {media_file} 时出错: {e}")
                continue
        
        task.status = "completed"
        db.commit()
        logger.info(f"扫描完成，处理了 {processed} 个文件")
        
    except Exception as e:
        logger.error(f"扫描任务失败: {e}")
        task.status = "failed"
        task.error_message = str(e)
        db.commit()
    finally:
        db.close()

async def process_movie(db: Session, tmdb_service: tmdb_api.TMDbService, media_info: media_parser.MediaInfo):
    """处理电影信息"""
    # 检查是否已存在
    existing = db.query(models.Movie).filter(
        models.Movie.title == media_info.title,
        models.Movie.year == media_info.year
    ).first()
    
    if existing:
        # 更新文件路径
        existing.file_path = str(media_info.file_path)
        existing.file_size = media_info.file_size
        db.commit()
        return existing
    
    # 搜索TMDb
    search_results = await tmdb_service.search_movie(media_info.title, media_info.year)
    if not search_results:
        logger.warning(f"未找到电影: {media_info.title} ({media_info.year})")
        return None
    
    # 获取详细信息
    tmdb_movie = search_results[0]
    movie_details = await tmdb_service.get_movie_details(tmdb_movie['id'])
    
    # 创建电影记录
    movie = models.Movie(
        tmdb_id=movie_details['id'],
        title=movie_details['title'],
        original_title=movie_details['original_title'],
        year=media_info.year,
        overview=movie_details.get('overview'),
        release_date=movie_details.get('release_date'),
        runtime=movie_details.get('runtime'),
        rating=movie_details.get('vote_average'),
        poster_path=movie_details.get('poster_path'),
        backdrop_path=movie_details.get('backdrop_path'),
        file_path=str(media_info.file_path),
        file_size=media_info.file_size
    )
    
    db.add(movie)
    db.commit()
    db.refresh(movie)
    
    # 添加类型
    for genre_data in movie_details.get('genres', []):
        genre = db.query(models.Genre).filter(models.Genre.name == genre_data['name']).first()
        if not genre:
            genre = models.Genre(name=genre_data['name'])
            db.add(genre)
            db.commit()
            db.refresh(genre)
        
        movie.genres.append(genre)
    
    db.commit()
    return movie

async def process_tv_show(db: Session, tmdb_service: tmdb_api.TMDbService, media_info: media_parser.MediaInfo):
    """处理电视剧信息"""
    # 搜索或创建电视剧记录
    show = db.query(models.TVShow).filter(
        models.TVShow.title == media_info.title
    ).first()
    
    if not show:
        # 搜索TMDb
        search_results = await tmdb_service.search_tv_show(media_info.title)
        if not search_results:
            logger.warning(f"未找到电视剧: {media_info.title}")
            return None
        
        # 获取详细信息
        tmdb_show = search_results[0]
        show_details = await tmdb_service.get_tv_show_details(tmdb_show['id'])
        
        # 创建电视剧记录
        show = models.TVShow(
            tmdb_id=show_details['id'],
            title=show_details['name'],
            original_title=show_details['original_name'],
            overview=show_details.get('overview'),
            first_air_date=show_details.get('first_air_date'),
            last_air_date=show_details.get('last_air_date'),
            status=show_details.get('status'),
            number_of_seasons=show_details.get('number_of_seasons'),
            number_of_episodes=show_details.get('number_of_episodes'),
            rating=show_details.get('vote_average'),
            poster_path=show_details.get('poster_path'),
            backdrop_path=show_details.get('backdrop_path')
        )
        
        db.add(show)
        db.commit()
        db.refresh(show)
        
        # 添加类型
        for genre_data in show_details.get('genres', []):
            genre = db.query(models.Genre).filter(models.Genre.name == genre_data['name']).first()
            if not genre:
                genre = models.Genre(name=genre_data['name'])
                db.add(genre)
                db.commit()
                db.refresh(genre)
            
            show.genres.append(genre)
        
        db.commit()
    
    # 处理剧集信息（如果有季和集信息）
    if media_info.season and media_info.episode:
        # 查找或创建季
        season = db.query(models.TVSeason).filter(
            models.TVSeason.tv_show_id == show.id,
            models.TVSeason.season_number == media_info.season
        ).first()
        
        if not season:
            season_details = await tmdb_service.get_tv_season_details(show.tmdb_id, media_info.season)
            season = models.TVSeason(
                tv_show_id=show.id,
                season_number=media_info.season,
                name=season_details.get('name', f"Season {media_info.season}"),
                overview=season_details.get('overview'),
                air_date=season_details.get('air_date'),
                episode_count=season_details.get('episode_count')
            )
            db.add(season)
            db.commit()
            db.refresh(season)
        
        # 查找或创建剧集
        episode = db.query(models.TVEpisode).filter(
            models.TVEpisode.season_id == season.id,
            models.TVEpisode.episode_number == media_info.episode
        ).first()
        
        if not episode:
            # 获取剧集详情
            season_details = await tmdb_service.get_tv_season_details(show.tmdb_id, media_info.season)
            episode_data = None
            for ep in season_details.get('episodes', []):
                if ep['episode_number'] == media_info.episode:
                    episode_data = ep
                    break
            
            if episode_data:
                episode = models.TVEpisode(
                    season_id=season.id,
                    episode_number=media_info.episode,
                    title=episode_data.get('name'),
                    overview=episode_data.get('overview'),
                    air_date=episode_data.get('air_date'),
                    runtime=episode_data.get('runtime'),
                    rating=episode_data.get('vote_average'),
                    file_path=str(media_info.file_path),
                    file_size=media_info.file_size
                )
                db.add(episode)
                db.commit()
    
    return show

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
