# 🎬 SceneScape 演示指南

## 🚀 快速演示

### 1. 访问应用
- **前端界面**: http://localhost:5173
- **后端API**: http://localhost:8000
- **API文档**: http://localhost:8000/docs

### 2. 测试媒体扫描功能

#### 方法1: 通过前端界面
1. 访问 http://localhost:5173
2. 点击"扫描媒体库"按钮
3. 输入您的媒体文件夹路径
4. 开始扫描并查看结果

#### 方法2: 通过API测试
```bash
# 测试扫描功能 (使用测试路径)
curl -X POST http://localhost:8000/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/Users/你的用户名/Movies",
    "recursive": true
  }'

# 查看扫描任务状态 (将task_id替换为实际返回的ID)
curl http://localhost:8000/api/scan/1

# 查看统计信息
curl http://localhost:8000/api/stats
```

### 3. 支持的文件格式和命名规范

#### 电影文件命名示例
```
✅ 正确格式:
- Avatar (2009).mp4
- The Matrix (1999).mkv
- Inception.2010.1080p.BluRay.mp4
- 阿凡达 (2009).mp4

❌ 不推荐格式:
- movie.mp4 (缺少年份)
- random_video_file.avi (无法识别)
```

#### 电视剧文件命名示例
```
✅ 正确格式:
- Game of Thrones S01E01.mp4
- Breaking Bad S02E05 - Breakage.mkv
- 权力的游戏 1x01.mp4
- Friends S10E18 The Last One.avi

❌ 不推荐格式:
- episode1.mp4 (缺少剧集信息)
- show_episode.mkv (无法识别季集)
```

### 4. TMDb API配置

如果您有TMDb API密钥，可以获得更准确的媒体信息：

1. 访问: https://www.themoviedb.org/settings/api
2. 注册并获取API密钥
3. 在 `backend/.env` 文件中设置:
   ```
   TMDB_API_KEY=你的API密钥
   ```
4. 重启后端服务

### 5. 功能演示步骤

#### 第一步: 准备测试文件
```bash
# 在您的系统中创建测试媒体文件夹
mkdir -p ~/TestMedia/Movies
mkdir -p ~/TestMedia/TVShows

# 创建示例文件 (空文件仅用于测试文件名解析)
touch "~/TestMedia/Movies/Avatar (2009).mp4"
touch "~/TestMedia/Movies/The Matrix (1999).mkv"
touch "~/TestMedia/TVShows/Game of Thrones S01E01.mp4"
touch "~/TestMedia/TVShows/Breaking Bad S01E01.mkv"
```

#### 第二步: 执行扫描
```bash
# 扫描电影文件夹
curl -X POST http://localhost:8000/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "path": "'$HOME'/TestMedia",
    "recursive": true
  }'
```

#### 第三步: 查看结果
```bash
# 查看解析到的电影
curl http://localhost:8000/api/movies | jq

# 查看解析到的电视剧
curl http://localhost:8000/api/tv-shows | jq

# 查看更新后的统计信息
curl http://localhost:8000/api/stats | jq
```

### 6. 前端功能演示

1. **主页**: 查看媒体库概览和统计信息
2. **电影页**: 浏览电影收藏，支持搜索和筛选
3. **电视剧页**: 管理电视剧和剧集
4. **扫描页**: 添加新的媒体文件夹
5. **主题切换**: 支持浅色/深色模式

### 7. 故障排除

#### 后端启动问题
```bash
# 检查依赖安装
cd backend && uv sync

# 检查环境变量
cat backend/.env

# 查看详细日志
cd backend && uv run python run.py --dev --debug
```

#### 前端启动问题
```bash
# 检查依赖
cd frontend && pnpm install

# 重新启动
pnpm dev
```

#### 扫描无结果
1. 确认文件路径正确
2. 检查文件命名格式
3. 查看后端日志信息
4. 确认支持的文件格式

### 8. 高级功能

#### 批量操作
- 支持递归扫描子目录
- 自动跳过已处理的文件
- 后台任务处理，不阻塞界面

#### 元数据增强
- 自动从TMDb获取详细信息
- 下载海报和背景图片
- 获取评分、简介、演员信息

#### 智能匹配
- 支持多种文件命名格式
- 容错匹配算法
- 手动纠正功能

---

🎬 **开始探索您的智能影视媒体库吧！** 🍿
