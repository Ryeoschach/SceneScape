"""媒体文件解析模块"""

import os
import re
import logging
from typing import Dict, List, Optional, Tuple, Union
from pathlib import Path
from dataclasses import dataclass

from .config import get_media_settings

logger = logging.getLogger(__name__)


@dataclass
class ParsedMedia:
    """解析后的媒体信息"""
    title: str
    year: Optional[int] = None
    season: Optional[int] = None
    episode: Optional[int] = None
    media_type: str = "unknown"  # movie, tv_episode, tv_show
    file_path: str = ""
    file_size: int = 0
    confidence: float = 0.0  # 解析置信度 0-1


class MediaFileParser:
    """媒体文件解析器"""
    
    def __init__(self):
        self.settings = get_media_settings()
        
        # 电影文件名正则表达式
        self.movie_patterns = [
            # Movie Title (YYYY)
            r"^(.*?)[\s\.\-_]*\((\d{4})\).*$",
            # Movie.Title.YYYY
            r"^(.*?)[\s\.\-_]+(\d{4})[\s\.\-_].*$",
            # Movie Title YYYY
            r"^(.*?)\s+(\d{4})\s*.*$",
            # 只有标题，没有年份
            r"^(.*?)[\s\.\-_]*\.[a-zA-Z0-9]{2,4}$",
        ]
        
        # 电视剧集正则表达式
        self.tv_episode_patterns = [
            # Show Name S01E02
            r"^(.*?)[\s\.\-_]+[Ss](\d+)[Ee](\d+).*$",
            # Show Name 1x02
            r"^(.*?)[\s\.\-_]+(\d+)x(\d+).*$",
            # Show Name Season 1 Episode 2
            r"^(.*?)[\s\.\-_]+[Ss]eason[\s\.\-_]*(\d+)[\s\.\-_]+[Ee]pisode[\s\.\-_]*(\d+).*$",
            # Show Name 102 (Season 1, Episode 2)
            r"^(.*?)[\s\.\-_]+(\d)(\d{2})[\s\.\-_].*$",
        ]
        
        # 清理标题的模式
        self.cleanup_patterns = [
            r"[\.\-_]+",  # 连续的点、横线、下划线
            r"\s+",       # 多个空格
            r"^\s+|\s+$", # 首尾空格
        ]
        
        # 质量标识符（用于识别和清理）
        self.quality_markers = [
            r"\b(720p|1080p|1440p|2160p|4K|UHD|HD|SD)\b",
            r"\b(BluRay|BRRip|DVDRip|WEBRip|HDTV|WEB-DL)\b",
            r"\b(x264|x265|H264|H265|HEVC|AVC)\b",
            r"\b(AAC|AC3|DTS|MP3|FLAC)\b",
            r"\b(EXTENDED|REMASTERED|DIRECTORS?\.CUT|UNCUT)\b",
        ]
    
    def is_video_file(self, file_path: str) -> bool:
        """判断是否为视频文件"""
        ext = Path(file_path).suffix.lower()
        return ext in self.settings.supported_video_extensions
    
    def is_audio_file(self, file_path: str) -> bool:
        """判断是否为音频文件"""
        ext = Path(file_path).suffix.lower()
        return ext in self.settings.supported_audio_extensions
    
    def clean_title(self, title: str) -> str:
        """清理标题字符串"""
        # 移除质量标识符
        for pattern in self.quality_markers:
            title = re.sub(pattern, "", title, flags=re.IGNORECASE)
        
        # 替换分隔符为空格
        title = re.sub(r"[\.\-_]+", " ", title)
        
        # 移除多余空格
        title = re.sub(r"\s+", " ", title).strip()
        
        return title
    
    def parse_movie_filename(self, filename: str) -> Optional[ParsedMedia]:
        """解析电影文件名"""
        base_name = Path(filename).stem
        
        for i, pattern in enumerate(self.movie_patterns):
            match = re.match(pattern, base_name, re.IGNORECASE)
            if match:
                groups = match.groups()
                
                if len(groups) >= 2 and groups[1].isdigit():
                    # 有年份
                    title = self.clean_title(groups[0])
                    year = int(groups[1])
                    confidence = 0.9 - (i * 0.1)  # 第一个模式置信度最高
                else:
                    # 只有标题
                    title = self.clean_title(groups[0])
                    year = None
                    confidence = 0.6 - (i * 0.1)
                
                if title:
                    return ParsedMedia(
                        title=title,
                        year=year,
                        media_type="movie",
                        file_path=filename,
                        confidence=confidence
                    )
        
        return None
    
    def parse_tv_episode_filename(self, filename: str) -> Optional[ParsedMedia]:
        """解析电视剧集文件名"""
        base_name = Path(filename).stem
        
        for i, pattern in enumerate(self.tv_episode_patterns):
            match = re.match(pattern, base_name, re.IGNORECASE)
            if match:
                groups = match.groups()
                
                title = self.clean_title(groups[0])
                season = int(groups[1])
                episode = int(groups[2])
                confidence = 0.95 - (i * 0.05)  # 电视剧模式识别置信度较高
                
                if title and season > 0 and episode > 0:
                    return ParsedMedia(
                        title=title,
                        season=season,
                        episode=episode,
                        media_type="tv_episode",
                        file_path=filename,
                        confidence=confidence
                    )
        
        return None
    
    def identify_media_type(self, file_path: str) -> str:
        """初步识别媒体类型"""
        if not self.is_video_file(file_path):
            return "unknown"
        
        filename = os.path.basename(file_path)
        
        # 检查是否包含剧集标识
        episode_indicators = [
            r"[Ss]\d+[Ee]\d+",  # S01E02
            r"\d+x\d+",         # 1x02
            r"[Ss]eason",       # Season
            r"[Ee]pisode",      # Episode
        ]
        
        for pattern in episode_indicators:
            if re.search(pattern, filename, re.IGNORECASE):
                return "tv_episode"
        
        return "movie"
    
    def parse_file(self, file_path: str) -> Optional[ParsedMedia]:
        """解析单个文件"""
        try:
            if not os.path.exists(file_path):
                logger.warning(f"文件不存在: {file_path}")
                return None
            
            if not self.is_video_file(file_path):
                return None
            
            # 获取文件信息
            stat_info = os.stat(file_path)
            file_size = stat_info.st_size
            
            filename = os.path.basename(file_path)
            media_type = self.identify_media_type(file_path)
            
            # 根据识别的类型选择解析方法
            if media_type == "tv_episode":
                parsed = self.parse_tv_episode_filename(filename)
            else:
                parsed = self.parse_movie_filename(filename)
            
            if parsed:
                parsed.file_path = file_path
                parsed.file_size = file_size
                logger.debug(f"成功解析文件: {filename} -> {parsed.title}")
                return parsed
            else:
                logger.warning(f"无法解析文件名: {filename}")
                return None
        
        except Exception as e:
            logger.error(f"解析文件时出错 {file_path}: {e}")
            return None
    
    def scan_directory(self, directory: str, recursive: bool = True) -> List[ParsedMedia]:
        """扫描目录中的媒体文件"""
        media_files = []
        
        try:
            directory_path = Path(directory)
            if not directory_path.exists():
                logger.error(f"目录不存在: {directory}")
                return media_files
            
            # 确定搜索模式
            pattern = "**/*" if recursive else "*"
            
            for file_path in directory_path.glob(pattern):
                if file_path.is_file():
                    # 跳过隐藏文件
                    if self.settings.skip_hidden_files and file_path.name.startswith('.'):
                        continue
                    
                    # 检查文件大小
                    if file_path.stat().st_size > self.settings.max_file_size_mb * 1024 * 1024:
                        logger.warning(f"文件过大，跳过: {file_path}")
                        continue
                    
                    parsed = self.parse_file(str(file_path))
                    if parsed:
                        media_files.append(parsed)
            
            logger.info(f"扫描完成: {directory}，找到 {len(media_files)} 个媒体文件")
            
        except Exception as e:
            logger.error(f"扫描目录时出错 {directory}: {e}")
        
        return media_files
    
    def group_tv_episodes(self, episodes: List[ParsedMedia]) -> Dict[str, List[ParsedMedia]]:
        """将电视剧集按剧名分组"""
        groups = {}
        
        for episode in episodes:
            if episode.media_type == "tv_episode":
                title = episode.title.lower()
                if title not in groups:
                    groups[title] = []
                groups[title].append(episode)
        
        # 按季数和集数排序
        for title, episode_list in groups.items():
            episode_list.sort(key=lambda x: (x.season or 0, x.episode or 0))
        
        return groups
    
    def suggest_corrections(self, parsed: ParsedMedia) -> List[str]:
        """为解析结果提供修正建议"""
        suggestions = []
        
        # 检查标题是否包含常见问题
        if parsed.title:
            title = parsed.title.lower()
            
            # 检查是否包含质量标识符
            for pattern in self.quality_markers:
                if re.search(pattern, title, re.IGNORECASE):
                    suggestions.append("标题中可能包含质量标识符，建议清理")
                    break
            
            # 检查是否过短
            if len(parsed.title.split()) < 2:
                suggestions.append("标题可能过短，建议检查")
            
            # 检查年份合理性
            if parsed.year:
                current_year = 2024
                if parsed.year < 1900 or parsed.year > current_year + 2:
                    suggestions.append(f"年份 {parsed.year} 可能不正确")
        
        return suggestions


# 创建全局解析器实例
media_parser = MediaFileParser()


# 便捷函数
def parse_media_file(file_path: str) -> Optional[ParsedMedia]:
    """解析媒体文件的便捷函数"""
    return media_parser.parse_file(file_path)


def scan_media_directory(directory: str, recursive: bool = True) -> List[ParsedMedia]:
    """扫描媒体目录的便捷函数"""
    return media_parser.scan_directory(directory, recursive)


def is_video_file(file_path: str) -> bool:
    """判断是否为视频文件的便捷函数"""
    return media_parser.is_video_file(file_path)


def clean_media_title(title: str) -> str:
    """清理媒体标题的便捷函数"""
    return media_parser.clean_title(title)
