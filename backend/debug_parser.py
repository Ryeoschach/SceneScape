#!/usr/bin/env python3
"""调试媒体解析器"""

import sys
import os

# 添加当前目录到路径
sys.path.insert(0, os.path.dirname(__file__))

from app.media_parser import MediaFileParser
from app.config import get_media_settings

def test_media_parser():
    """测试媒体解析器"""
    
    # 测试目录
    test_dir = "/Users/creed/workspace/test_media"
    
    print(f"🔍 测试目录: {test_dir}")
    print("=" * 50)
    
    try:
        # 检查配置
        print("📋 检查配置...")
        try:
            settings = get_media_settings()
            print(f"✅ 媒体设置已加载")
            print(f"   支持的视频格式: {settings.supported_video_extensions}")
        except Exception as e:
            print(f"❌ 配置加载失败: {e}")
            return
        
        # 创建解析器
        print("\n🚀 创建解析器...")
        parser = MediaFileParser()
        print("✅ 解析器创建成功")
        
        # 手动检查测试文件
        print("\n📁 检查测试文件...")
        test_files = [
            "/Users/creed/workspace/test_media/movies/The Matrix (1999).mp4",
            "/Users/creed/workspace/test_media/movies/Inception (2010).mkv", 
            "/Users/creed/workspace/test_media/tv_shows/Breaking Bad S01E01.mp4",
            "/Users/creed/workspace/test_media/tv_shows/Game of Thrones S01E02.mkv"
        ]
        
        for file_path in test_files:
            print(f"\n🎬 测试文件: {os.path.basename(file_path)}")
            
            # 检查文件存在
            if not os.path.exists(file_path):
                print(f"   ❌ 文件不存在")
                continue
            print(f"   ✅ 文件存在")
            
            # 检查是否为视频文件
            is_video = parser.is_video_file(file_path)
            print(f"   📹 是视频文件: {is_video}")
            
            # 识别媒体类型
            media_type = parser.identify_media_type(file_path)
            print(f"   🎭 媒体类型: {media_type}")
            
            # 解析文件
            parsed = parser.parse_file(file_path)
            if parsed:
                print(f"   ✅ 解析成功:")
                print(f"      标题: {parsed.title}")
                print(f"      年份: {parsed.year}")
                print(f"      季数: {parsed.season}")
                print(f"      集数: {parsed.episode}")
                print(f"      类型: {parsed.media_type}")
                print(f"      置信度: {parsed.confidence}")
            else:
                print(f"   ❌ 解析失败")
        
        # 扫描整个目录
        print(f"\n🔍 扫描整个目录...")
        media_files = parser.scan_directory(test_dir, recursive=True)
        print(f"✅ 找到 {len(media_files)} 个媒体文件")
        
        for i, media in enumerate(media_files, 1):
            print(f"   {i}. {media.title} ({media.media_type})")
            if media.year:
                print(f"      年份: {media.year}")
            if media.season and media.episode:
                print(f"      S{media.season:02d}E{media.episode:02d}")
            print(f"      文件: {os.path.basename(media.file_path)}")
    
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_media_parser()
