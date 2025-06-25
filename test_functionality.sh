#!/bin/bash

echo "🧪 SceneScape 功能测试"
echo "====================="

# 检查后端健康状态
echo "1. 检查后端API健康状态..."
if curl -s http://localhost:8000/api/health | grep -q "healthy"; then
    echo "✅ 后端API正常运行"
else
    echo "❌ 后端API未运行"
    exit 1
fi

# 测试电影列表API
echo "2. 测试电影列表API..."
if curl -s "http://localhost:8000/api/movies" | grep -q "title"; then
    echo "✅ 电影列表API正常"
else
    echo "❌ 电影列表API异常"
fi

# 测试电视剧列表API
echo "3. 测试电视剧列表API..."
if curl -s "http://localhost:8000/api/tv-shows" | grep -q "title"; then
    echo "✅ 电视剧列表API正常"
else
    echo "❌ 电视剧列表API异常"
fi

# 测试电影详情API
echo "4. 测试电影详情API..."
if curl -s "http://localhost:8000/api/movies/1" | grep -q "title"; then
    echo "✅ 电影详情API正常"
else
    echo "❌ 电影详情API异常"
fi

# 测试电视剧详情API
echo "5. 测试电视剧详情API..."
if curl -s "http://localhost:8000/api/tv-shows/1" | grep -q "title"; then
    echo "✅ 电视剧详情API正常"
else
    echo "❌ 电视剧详情API异常"
fi

# 检查前端是否运行
echo "6. 检查前端开发服务器..."
if curl -s http://localhost:5173 | grep -q "SceneScape"; then
    echo "✅ 前端开发服务器正常运行"
else
    echo "❌ 前端开发服务器未运行"
fi

echo ""
echo "🎯 测试完成！"
echo ""
echo "📋 手动测试步骤："
echo "1. 打开 http://localhost:5173"
echo "2. 导航到电影页面 (/movies)"
echo "3. 点击任意电影查看详情页面"
echo "4. 导航到电视剧页面 (/tv-shows)"
echo "5. 点击任意电视剧查看详情页面"
echo "6. 测试返回按钮功能"
echo "7. 检查图片是否正常加载"
echo ""
echo "🔗 快速测试链接："
echo "- 详细测试页面: http://localhost:5173/detail-test"
echo "- 电影详情示例: http://localhost:5173/movies/1"
echo "- 电视剧详情示例: http://localhost:5173/tv-shows/1"
