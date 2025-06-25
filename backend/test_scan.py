#!/usr/bin/env python3
"""测试扫描功能"""

import asyncio
import sys
sys.path.append('.')

from app.media_parser import MediaFileParser
from app.tmdb_api import TMDbService
from app.database import SessionLocal, Movie

async def test_scan():
    print("🔍 开始测试扫描功能...")
    
    # 测试媒体解析
    print("\n📹 测试媒体解析...")
    parser = MediaFileParser()
    media_files = parser.scan_directory('/Users/creed/workspace/test_media', recursive=True)
    print(f'✅ 找到 {len(media_files)} 个媒体文件:')
    for i, media in enumerate(media_files, 1):
        print(f'  {i}. {media.title} ({media.media_type})')
        print(f'     年份: {media.year}, 文件: {media.file_path}')
    
    # 测试TMDb API
    print(f"\n🎬 测试TMDb API...")
    tmdb = TMDbService()
    
    if media_files:
        # 测试第一个电影
        first_movie = next((m for m in media_files if m.media_type == 'movie'), None)
        if first_movie:
            print(f'搜索电影: "{first_movie.title}" ({first_movie.year})')
            try:
                results = await tmdb.search_movie(first_movie.title, first_movie.year)
                print(f'✅ TMDb搜索结果: {len(results)} 个结果')
                if results:
                    movie = results[0]
                    print(f'   第一个结果: "{movie.get("title", "未知")}" ({movie.get("release_date", "")[:4]})')
                    print(f'   概述: {movie.get("overview", "无")[:100]}...')
            except Exception as e:
                print(f'❌ TMDb搜索错误: {e}')
                import traceback
                traceback.print_exc()
        
        # 测试第一个电视剧
        first_tv = next((m for m in media_files if m.media_type == 'tv_episode'), None)
        if first_tv:
            print(f'\n搜索电视剧: "{first_tv.title}" S{first_tv.season:02d}E{first_tv.episode:02d}')
            try:
                results = await tmdb.search_tv_show(first_tv.title)
                print(f'✅ TMDb搜索结果: {len(results)} 个结果')
                if results:
                    show = results[0]
                    print(f'   第一个结果: "{show.get("name", "未知")}" ({show.get("first_air_date", "")[:4]})')
                    print(f'   概述: {show.get("overview", "无")[:100]}...')
            except Exception as e:
                print(f'❌ TMDb搜索错误: {e}')
                import traceback
                traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_scan())
