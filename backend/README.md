# SceneScape Backend

智能影视媒体库管理系统后端服务

## 技术栈

- **FastAPI**: 高性能Python Web框架
- **SQLAlchemy**: 数据库ORM
- **SQLite**: 轻量级数据库
- **TMDb API**: 电影和电视剧元数据获取
- **asyncio**: 异步处理
- **aiofiles**: 异步文件操作
- **httpx**: 异步HTTP客户端
- **Pillow**: 图片处理

## 主要功能

- 🎬 电影和电视剧信息管理
- 📁 媒体文件自动扫描
- 🖼️ 海报和背景图片缓存
- 🔍 智能媒体文件解析
- 📊 媒体库统计信息
- 🎯 TMDb API集成

## 安装依赖

```bash
cd backend
uv sync
```

## 配置

复制环境配置文件：
```bash
cp .env.template .env
```

编辑 `.env` 文件，填入您的TMDb API密钥。

## 运行

开发模式：
```bash
python run.py --dev
```

生产模式：
```bash
python run.py --host 0.0.0.0 --port 8000
```

## API文档

启动服务后访问：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 项目结构

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI主应用
│   ├── config.py            # 配置管理
│   ├── database.py          # 数据库模型
│   ├── tmdb_api.py          # TMDb API集成
│   ├── media_parser.py      # 媒体文件解析
│   ├── image_service.py     # 图片缓存服务
│   └── task_manager.py      # 后台任务管理
├── cache/                   # 图片缓存目录
├── logs/                    # 日志目录
├── requirements.txt         # 项目依赖
├── pyproject.toml          # 项目配置
├── run.py                  # 启动脚本
└── .env                    # 环境配置
```
