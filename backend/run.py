#!/usr/bin/env python3
"""
SceneScape Backend - 启动脚本
用于启动开发服务器和生产服务器
"""

import os
import sys
import argparse
import asyncio
import logging
from pathlib import Path
from dotenv import load_dotenv

# 添加项目根目录到 Python 路径
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# 加载环境变量
load_dotenv()

# 导入应用模块
from app.main import app
from app.task_manager import task_manager
from app.config import settings

def setup_logging(level: str = "INFO"):
    """设置日志配置"""
    log_level = getattr(logging, level.upper(), logging.INFO)
    
    # 创建日志目录
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # 配置日志格式
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # 配置根日志器
    logging.basicConfig(
        level=log_level,
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(log_dir / "scenescape.log", encoding="utf-8")
        ]
    )
    
    # 设置第三方库的日志级别
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

async def start_background_workers():
    """启动后台工作进程"""
    try:
        await task_manager.start_workers()
    except KeyboardInterrupt:
        logging.info("收到中断信号，正在停止后台工作进程...")
        await task_manager.stop_workers()
    except Exception as e:
        logging.error(f"后台工作进程出错: {e}")
        raise

def create_directories():
    """创建必要的目录"""
    directories = [
        settings.DATABASE_PATH.parent,  # 数据库目录
        Path(settings.POSTER_PATH),     # 海报缓存目录
        Path(settings.BACKDROP_PATH),   # 背景图片缓存目录
        Path("logs"),                   # 日志目录
    ]
    
    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)
        logging.info(f"确保目录存在: {directory}")

def check_environment():
    """检查环境配置"""
    required_env_vars = ["TMDB_API_KEY"]
    missing_vars = []
    
    for var in required_env_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        logging.error(f"缺少必需的环境变量: {', '.join(missing_vars)}")
        logging.error("请检查 .env 文件或系统环境变量")
        return False
    
    return True

def main():
    """主函数"""
    parser = argparse.ArgumentParser(
        description="SceneScape Backend Server",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
使用示例:
  # 开发模式启动
  python run.py --dev
  
  # 生产模式启动
  python run.py --host 0.0.0.0 --port 8000
  
  # 启用调试模式
  python run.py --dev --debug
  
  # 指定工作进程数
  python run.py --workers 4
        """
    )
    
    parser.add_argument(
        "--host", 
        default="127.0.0.1", 
        help="绑定的主机地址 (默认: 127.0.0.1)"
    )
    
    parser.add_argument(
        "--port", 
        type=int, 
        default=8000, 
        help="监听端口 (默认: 8000)"
    )
    
    parser.add_argument(
        "--dev", 
        action="store_true", 
        help="开发模式 (启用热重载)"
    )
    
    parser.add_argument(
        "--debug", 
        action="store_true", 
        help="调试模式 (详细日志)"
    )
    
    parser.add_argument(
        "--workers", 
        type=int, 
        default=1, 
        help="工作进程数 (仅生产模式, 默认: 1)"
    )
    
    parser.add_argument(
        "--log-level", 
        default="INFO", 
        choices=["DEBUG", "INFO", "WARNING", "ERROR"], 
        help="日志级别 (默认: INFO)"
    )
    
    parser.add_argument(
        "--no-access-log", 
        action="store_true", 
        help="禁用访问日志"
    )
    
    args = parser.parse_args()
    
    # 设置日志
    log_level = "DEBUG" if args.debug else args.log_level
    setup_logging(log_level)
    
    logger = logging.getLogger(__name__)
    logger.info("=" * 60)
    logger.info("🎬 SceneScape Backend Starting...")
    logger.info("=" * 60)
    
    # 检查环境
    if not check_environment():
        sys.exit(1)
    
    # 创建必要目录
    create_directories()
    
    # 显示配置信息
    logger.info(f"🏠 Host: {args.host}")
    logger.info(f"🔌 Port: {args.port}")
    logger.info(f"🔧 Mode: {'Development' if args.dev else 'Production'}")
    logger.info(f"📊 Log Level: {log_level}")
    logger.info(f"💾 Database: {settings.DATABASE_PATH}")
    logger.info(f"🖼️  Poster Cache: {settings.POSTER_PATH}")
    logger.info(f"🌄 Backdrop Cache: {settings.BACKDROP_PATH}")
    
    try:
        if args.dev:
            # 开发模式 - 使用 uvicorn 直接运行
            import uvicorn
            
            logger.info("🚀 启动开发服务器...")
            
            # 在后台启动任务管理器
            import threading
            def start_task_manager():
                asyncio.run(start_background_workers())
            
            task_thread = threading.Thread(target=start_task_manager, daemon=True)
            task_thread.start()
            
            uvicorn.run(
                "app.main:app",
                host=args.host,
                port=args.port,
                reload=True,
                reload_dirs=["app"],
                log_level=log_level.lower(),
                access_log=not args.no_access_log,
                reload_excludes=["*.pyc", "__pycache__", "logs/*", "cache/*"]
            )
        else:
            # 生产模式 - 使用 gunicorn 或直接运行
            try:
                import uvicorn
                
                logger.info("🚀 启动生产服务器...")
                
                # 在后台启动任务管理器
                import threading
                def start_task_manager():
                    asyncio.run(start_background_workers())
                
                task_thread = threading.Thread(target=start_task_manager, daemon=True)
                task_thread.start()
                
                uvicorn.run(
                    "app.main:app",
                    host=args.host,
                    port=args.port,
                    workers=args.workers if args.workers > 1 else None,
                    log_level=log_level.lower(),
                    access_log=not args.no_access_log,
                    loop="asyncio"
                )
            except ImportError:
                logger.error("未找到 uvicorn，请安装: pip install uvicorn")
                sys.exit(1)
                
    except KeyboardInterrupt:
        logger.info("👋 收到中断信号，正在关闭服务器...")
    except Exception as e:
        logger.error(f"❌ 服务器启动失败: {e}")
        sys.exit(1)
    finally:
        logger.info("🛑 SceneScape Backend 已停止")

if __name__ == "__main__":
    main()
