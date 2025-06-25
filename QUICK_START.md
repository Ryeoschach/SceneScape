# 🚀 SceneScape 快速启动指南

## 📋 前置要求

- Python 3.9+ (推荐使用 uv 管理)
- Node.js 18+ 
- pnpm (推荐) 或 npm
- TMDb API 密钥 (可选，演示模式不需要)

## 🎯 5分钟快速启动

### 1. 克隆项目
```bash
git clone <repository>
cd SceneScape
```

### 2. 启动后端服务
```bash
cd backend

# 安装依赖 (使用 uv，推荐)
uv sync

# 或者使用 pip
pip install -r requirements.txt

# 配置环境变量 (可选)
cp .env.example .env
# 编辑 .env 文件，添加您的 TMDb API 密钥

# 启动开发服务器
uv run python run.py --dev
# 或者: python run.py --dev
```

### 3. 启动前端服务
```bash
# 新开终端窗口
cd frontend

# 安装依赖
pnpm install
# 或者: npm install

# 启动开发服务器
pnpm dev
# 或者: npm run dev
```

### 4. 访问应用
- 🎬 **前端应用**: http://localhost:5173
- 🔌 **后端 API**: http://localhost:8000
- 📚 **API 文档**: http://localhost:8000/docs

## 🎮 基本使用

### 界面导航
- **主页**: 概览和统计信息
- **电影库**: 浏览和管理电影
- **电视剧库**: 浏览和管理电视剧
- **扫描**: 添加新的媒体文件

### 媒体扫描
1. 点击 "扫描媒体库" 按钮
2. 输入媒体文件夹路径，例如:
   - `/Users/your-name/Movies`
   - `/home/user/Videos`
   - `D:\Movies` (Windows)
3. 选择是否递归扫描子文件夹
4. 点击 "开始扫描"

### 支持的文件格式
- **视频**: mp4, mkv, avi, mov, wmv, flv, webm, m4v, mpg, mpeg, 3gp, ts, m2ts
- **音频**: mp3, wav, flac, aac, ogg, wma, m4a

## 🔧 配置选项

### 后端配置 (backend/.env)
```bash
# TMDb API 配置
TMDB_API_KEY=your_api_key_here

# 数据库配置
DATABASE_URL=sqlite:///./scenescape.db

# 文件存储路径
POSTER_PATH=./cache/posters
BACKDROP_PATH=./cache/backdrops

# 开发配置
DEBUG=true
LOG_LEVEL=INFO
```

### 前端配置 (frontend/.env)
```bash
# API 连接配置
VITE_API_BASE_URL=http://localhost:8000

# 应用信息
VITE_APP_NAME=SceneScape
VITE_APP_VERSION=1.0.0
```

## 🎨 主题切换
- 点击右上角的主题切换按钮 🌙/☀️
- 支持浅色和深色主题
- 自动保存用户偏好

## 📡 API 端点

### 健康检查
```bash
curl http://localhost:8000/api/health
```

### 获取统计信息
```bash
curl http://localhost:8000/api/stats
```

### 开始扫描
```bash
curl -X POST http://localhost:8000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"path": "/path/to/media", "recursive": true}'
```

### 获取电影列表
```bash
curl http://localhost:8000/api/movies?page=1&limit=20
```

## 🔍 故障排除

### 后端启动失败
1. 检查 Python 版本: `python --version`
2. 检查依赖安装: `uv sync` 或 `pip install -r requirements.txt`
3. 检查端口占用: `lsof -i :8000`

### 前端启动失败
1. 检查 Node.js 版本: `node --version`
2. 清除缓存: `pnpm store prune` 或 `npm cache clean --force`
3. 重新安装依赖: `rm -rf node_modules && pnpm install`

### API 连接失败
1. 确认后端服务正在运行
2. 检查 CORS 配置
3. 验证前端 .env 文件中的 API 地址

### TMDb API 问题
1. 获取 API 密钥: https://www.themoviedb.org/settings/api
2. 检查 API 密钥格式 (32位字符串)
3. 确认网络连接正常

## 🧪 演示模式

即使没有 TMDb API 密钥，您也可以：
- 浏览应用界面
- 测试主题切换
- 查看组件和布局
- 使用本地数据模拟功能

## 📞 获取帮助

- 📖 查看完整文档: `PROJECT_STATUS.md`
- 🐛 报告问题: 创建 GitHub Issue
- 💬 讨论功能: 使用 GitHub Discussions

---

祝您使用愉快！🎉
