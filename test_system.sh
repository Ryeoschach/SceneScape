#!/bin/bash

# SceneScape 系统功能测试脚本
# 测试前后端连接和基本API功能

echo "🎬 SceneScape 系统测试开始..."
echo "================================"

BASE_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:5173"

# 测试后端健康检查
echo "📡 测试后端健康检查..."
health_response=$(curl -s "$BASE_URL/api/health")
if echo "$health_response" | grep -q "healthy"; then
    echo "✅ 后端健康检查通过"
else
    echo "❌ 后端健康检查失败"
    exit 1
fi

# 测试统计信息接口
echo "📊 测试统计信息接口..."
stats_response=$(curl -s "$BASE_URL/api/stats")
if echo "$stats_response" | grep -q "total_movies"; then
    echo "✅ 统计信息接口正常"
    echo "📈 当前统计: $stats_response"
else
    echo "❌ 统计信息接口异常"
    exit 1
fi

# 测试电影列表接口
echo "🎬 测试电影列表接口..."
movies_response=$(curl -s "$BASE_URL/api/movies")
if [ $? -eq 0 ]; then
    echo "✅ 电影列表接口正常"
    echo "🎭 电影数量: $(echo "$movies_response" | jq length)"
else
    echo "❌ 电影列表接口异常"
fi

# 测试电视剧列表接口
echo "📺 测试电视剧列表接口..."
tv_response=$(curl -s "$BASE_URL/api/tv-shows")
if [ $? -eq 0 ]; then
    echo "✅ 电视剧列表接口正常"
    echo "📺 电视剧数量: $(echo "$tv_response" | jq length)"
else
    echo "❌ 电视剧列表接口异常"
fi

# 测试前端连接
echo "🎨 测试前端连接..."
frontend_response=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ "$frontend_response" = "200" ]; then
    echo "✅ 前端服务正常"
else
    echo "❌ 前端服务异常 (HTTP: $frontend_response)"
fi

# 测试API文档
echo "📚 测试API文档..."
docs_response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/docs")
if [ "$docs_response" = "200" ]; then
    echo "✅ API文档可访问"
else
    echo "❌ API文档无法访问"
fi

echo ""
echo "🎉 系统测试完成！"
echo "================================"
echo "🌐 前端地址: $FRONTEND_URL"
echo "🔙 后端地址: $BASE_URL"
echo "📚 API文档: $BASE_URL/docs"
echo ""
echo "💡 接下来可以尝试:"
echo "   1. 访问前端界面浏览应用"
echo "   2. 使用扫描功能添加媒体文件"
echo "   3. 查看API文档了解所有功能"
echo ""
echo "🎬 享受您的智能影视媒体库！"
