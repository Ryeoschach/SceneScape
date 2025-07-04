# 🎬 SceneScape - 影视媒体库应用

> 🚀 类似 Infuse 的智能影视媒体库管理系统

本项目旨在开发一个现代化的影视媒体库应用，通过友好的图形化界面展示本地或网络存储的电影和电视剧，并自动从在线数据库（TMDb）获取丰富的元数据。

## ✨ 主要特性

- 🎥 **智能媒体扫描**: 自动识别电影和电视剧文件，支持多种命名格式
- 🖼️ **丰富元数据**: 自动获取 TMDb 数据库的海报、简介、演职人员信息
- 🎨 **现代化界面**: React + TypeScript + Tailwind CSS 构建的响应式界面
- 🔍 **智能搜索**: 支持标题、演员、导演等多维度搜索 (开发中)
- 📱 **跨平台支持**: Web 端部署，未来支持桌面和移动端
- 🌓 **主题切换**: 支持浅色/深色主题，提供个性化体验

## 🚀 当前状态

✅ **前端应用**: 运行在 http://localhost:5173  
✅ **后端服务**: 运行在 http://localhost:8000  
✅ **API 文档**: http://localhost:8000/docs  
✅ **数据库**: SQLite 本地存储  
✅ **主要功能**: 媒体扫描、元数据获取、界面展示  
🔧 **开发中**: 搜索功能、用户系统、高级功能

## 🛠️ 技术栈

### 前端
- **React 18**: 现代化前端框架
- **TypeScript**: 类型安全的 JavaScript
- **Vite**: 快速构建工具
- **Tailwind CSS**: 实用优先的 CSS 框架
- **React Router**: 单页面应用路由
- **Axios**: HTTP 请求库

### 后端
- **FastAPI**: 现代化 Python Web 框架
- **SQLAlchemy**: 强大的 Python ORM
- **SQLite**: 轻量级文件型数据库
- **Pydantic**: 数据验证和序列化
- **Asyncio**: 异步编程支持

### 外部服务
- **TMDb API**: 电影和电视剧元数据来源
- **FFmpeg**: 媒体文件处理（可选）

## 🏗️ 项目结构

```
SceneScape/
├── 📁 frontend/                 # React 前端应用
│   ├── src/
│   │   ├── components/          # React 组件
│   │   │   ├── ui/             # 基础 UI 组件
│   │   │   ├── layout/         # 布局组件
│   │   │   └── forms/          # 表单组件
│   │   ├── services/           # API 服务层
│   │   ├── hooks/              # 自定义 Hooks
│   │   ├── utils/              # 工具函数
│   │   ├── types/              # TypeScript 类型
│   │   ├── constants/          # 常量定义
│   │   └── styles/             # 样式文件
│   ├── public/                 # 静态资源
│   └── docs/                   # 前端文档
├── 📁 backend/                  # FastAPI 后端应用
│   ├── app/                    # 应用核心代码
│   │   ├── main.py            # FastAPI 应用入口
│   │   ├── database.py        # 数据库模型和配置
│   │   ├── tmdb_api.py        # TMDb API 集成
│   │   └── media_parser.py    # 媒体文件解析
│   ├── docs/                  # 后端文档
│   ├── scripts/               # 脚本工具
│   │   ├── deployment/        # 部署脚本
│   │   ├── development/       # 开发辅助脚本
│   │   └── testing/           # 测试脚本
│   ├── tests/                 # 测试代码
│   │   ├── units/             # 单元测试
│   │   └── integration/       # 集成测试
│   ├── static/                # 静态文件存储
│   │   ├── images/            # 图片缓存
│   │   │   ├── posters/       # 电影海报
│   │   │   ├── backdrops/     # 背景图
│   │   │   └── profiles/      # 演员头像
│   │   └── uploads/           # 用户上传文件
│   └── models/                # AI 模型文件（可选）
├── 📁 docs/                     # 项目文档
├── 📁 database/                 # 数据库文件存储
├── 🐳 docker-compose.yml       # Docker 编排配置
├── 📋 .gitignore               # Git 忽略规则
└── 📖 README.md                # 项目说明文档
```

## 🚀 快速开始

### 环境要求
- **Node.js**: 18.0+
- **Python**: 3.9+
- **Docker**: 20.0+ (可选)

### 1. 克隆项目
```bash
git clone <repository-url>
cd SceneScape
```

### 2. 后端环境设置
```bash
cd backend

# 创建并激活虚拟环境
python3 -m venv .venv
source .venv/bin/activate  # macOS/Linux
# .venv\Scripts\activate   # Windows

# 安装依赖
pip install fastapi uvicorn[standard] sqlalchemy requests python-dotenv httpx

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，添加 TMDb API Key
```

### 3. 前端环境设置
```bash
cd frontend

# 安装依赖
npm install
# 或使用 pnpm install
# 或使用 yarn install

# 启动开发服务器
npm run dev
```

### 4. 启动后端服务
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### 5. 访问应用
- **前端界面**: http://localhost:5173
- **后端 API**: http://localhost:8000
- **API 文档**: http://localhost:8000/docs

## 🎯 核心功能

### 媒体库管理 ✅
- 📁 **文件扫描**: 递归扫描指定目录，识别视频文件
- 🔍 **智能识别**: 基于文件名解析电影和电视剧信息
- 📊 **元数据刮削**: 自动从 TMDb 获取详细信息
- 🗂️ **数据管理**: SQLite 数据库存储完整关系模型

### TMDb 集成 ✅
- 🎬 **电影数据**: 标题、年份、评分、简介、海报
- 📺 **电视剧数据**: 标题、季集信息、状态、演员
- 🖼️ **图片缓存**: 海报、背景图、演员头像本地缓存
- 🏷️ **类型标签**: 自动获取并关联影片类型

### 用户界面 ✅
- 🏠 **主页**: 展示电影和电视剧的海报墙
- 🎬 **详情页**: 显示影片详细信息、演职人员、评分等
- 🎨 **主题切换**: 支持浅色/深色主题
- 📱 **响应式设计**: 适配桌面、平板、手机等设备
- ⚡ **现代化界面**: React + TypeScript + Tailwind CSS

### 数据管理 ✅
- 💾 **本地存储**: SQLite 数据库存储媒体信息
- 🖼️ **图片缓存**: 本地缓存海报、背景图等资源
- 🔄 **增量更新**: 支持媒体库的增量扫描和更新
- 🔧 **任务管理**: 后台异步任务处理系统

## 📋 开发计划

### Phase 1: 基础功能 ✅ (已完成)
- [x] 项目结构搭建
- [x] 基础数据库模型设计
- [x] TMDb API 集成
- [x] 文件扫描和解析功能
- [x] 基础前端界面

### Phase 2: 核心功能 ✅ (已完成)
- [x] 电影和电视剧展示界面
- [x] 详情页面开发
- [x] 图片缓存系统
- [x] 主题切换功能
- [x] 响应式设计
- [ ] 搜索功能实现

### Phase 3: 增强功能 (进行中)
- [ ] 用户偏好设置
- [ ] 观看历史记录
- [ ] 收藏和评分功能
- [ ] 高级搜索过滤
- [ ] 批量操作功能

### Phase 4: 部署和优化 (计划中)
- [x] Docker 容器化
- [x] 错误处理和日志
- [x] 文档完善
- [ ] 性能优化
- [ ] 单元测试覆盖
- [ ] 集成测试

## 🔧 配置说明

### TMDb API 配置
1. 访问 [TMDb 官网](https://www.themoviedb.org/) 注册账号
2. 申请 API Key (推荐使用 v4 Read Access Token)
3. 在 `backend/.env` 文件中配置:
```bash
TMDB_API_KEY=your_tmdb_api_key_here
```

### 媒体目录配置
在前端界面中设置要扫描的媒体文件夹路径，系统会自动扫描并识别其中的影视文件。

**支持的文件格式**: mp4, mkv, avi, mov, wmv, flv, webm

**推荐的文件命名格式**:
- 电影: `Movie Title (2023).mp4`
- 电视剧: `TV Show S01E01 - Episode Title.mp4`

### 环境变量说明
```bash
# 必需配置
TMDB_API_KEY=your_api_key_here

# 可选配置
DATABASE_URL=sqlite:///./scenescape.db
STATIC_FILES_PATH=./static
CORS_ORIGINS=http://localhost:5173
LOG_LEVEL=INFO
```

## 🤝 贡献指南

欢迎贡献代码和提出建议！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接

### 📚 项目文档
- [📚 文档索引](DOCS_INDEX.md) - 完整文档导航指南 **推荐首次阅读**
- [功能完成度报告](FEATURE_COMPLETION_STATUS.md) - 详细的功能实现状态
- [快速启动指南](QUICK_START.md) - 5分钟快速上手
- [更新日志](CHANGELOG.md) - 版本更新记录
- [项目状态报告](PROJECT_STATUS.md) - 技术细节和开发状态
- [功能演示指南](FEATURE_DEMO.md) - 详细的功能使用说明

### 🔧 技术文档
- [TMDb API 文档](https://developers.themoviedb.org/3) - 电影数据库 API
- [FastAPI 文档](https://fastapi.tiangolo.com/) - Python Web 框架
- [React 文档](https://react.dev/) - 前端框架
- [Tailwind CSS 文档](https://tailwindcss.com/) - CSS 框架

### 🚀 在线服务
- **前端应用**: http://localhost:5173
- **后端 API**: http://localhost:8000
- **API 文档**: http://localhost:8000/docs

---

*最后更新：2025年6月25日*  
*项目状态：Phase 2 核心功能已完成，Phase 3 增强功能开发中*
