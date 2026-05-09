#!/bin/bash

echo "🚀 机器猫项目 Docker 部署脚本"
echo "=============================="

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 检查 .env 文件是否存在
if [ ! -f .env ]; then
    echo "⚠️  .env 文件不存在，正在从 .env.example 创建..."
    cp .env.example .env
    echo "✅ 已创建 .env 文件，请编辑并配置必要的环境变量"
    echo "   至少需要配置：OPENAI_API_KEY"
    exit 1
fi

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull

# 构建并启动服务
echo "🔨 构建 Docker 镜像..."
docker-compose build

echo "🚀 启动服务..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "📊 服务状态："
docker-compose ps

echo ""
echo "✅ 部署完成！"
echo "🌐 前端访问地址: http://你的服务器IP"
echo "🔌 后端 API 地址: http://你的服务器IP:3002"
echo ""
echo "📝 常用命令："
echo "  查看日志: docker-compose logs -f"
echo "  停止服务: docker-compose down"
echo "  重启服务: docker-compose restart"
echo "  更新代码: git pull && docker-compose up -d --build"
