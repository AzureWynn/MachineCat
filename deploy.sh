#!/bin/bash

echo "🚀 机器猫项目 Docker 部署脚本"
echo "=============================="

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查 docker-compose 版本，自动处理兼容性问题
COMPOSE_CMD=""
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version | grep -oP '\d+' | head -1)
    if [ "$COMPOSE_VERSION" -ge 2 ]; then
        COMPOSE_CMD="docker-compose"
    else
        echo "⚠️  检测到旧版 docker-compose v1.x，尝试使用 docker compose v2..."
        if docker compose version &> /dev/null; then
            COMPOSE_CMD="docker compose"
            echo "✅ 使用 docker compose v2"
        else
            echo "❌ docker-compose 版本过旧 (v1.x) 且无 v2，请升级："
            echo "   sudo curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose"
            echo "   sudo chmod +x /usr/local/bin/docker-compose"
            exit 1
        fi
    fi
elif docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

echo " 使用命令: $COMPOSE_CMD"

# 检查 .env 文件是否存在
if [ ! -f .env ]; then
    echo "⚠️  .env 文件不存在，正在从 .env.example 创建..."
    cp .env.example .env
    echo "✅ 已创建 .env 文件，请编辑并配置必要的环境变量"
    echo "   至少需要配置：OPENAI_API_KEY"
    exit 1
fi

# 拉取最新代码
echo " 拉取最新代码..."
git pull

# 停止并删除旧容器（避免 v1/v2 兼容性问题）
echo " 清理旧容器..."
$COMPOSE_CMD down -v

# 停止旧的独立 ollama 容器（如果存在）
echo " 停止旧的 ollama 容器..."
docker stop ollama 2>/dev/null && docker rm ollama 2>/dev/null || true

# 构建并启动服务
echo " 构建 Docker 镜像..."
$COMPOSE_CMD build

echo " 启动服务..."
$COMPOSE_CMD up -d

# 等待服务启动
echo " 等待服务启动..."
sleep 15

# 拉取 Ollama 模型
echo " 拉取 Ollama 模型 (qwen2.5:0.5b)..."
docker exec robot-ollama ollama pull qwen2.5:0.5b

# 检查服务状态
echo " 服务状态："
$COMPOSE_CMD ps

echo ""
echo " 部署完成！"
echo " 前端访问地址: http://你的服务器IP"
echo " 后端 API 地址: http://你的服务器IP:3002"
echo ""
echo " 常用命令："
echo "  查看日志: $COMPOSE_CMD logs -f"
echo "  停止服务: $COMPOSE_CMD down"
echo "  重启服务: $COMPOSE_CMD restart"
echo "  更新代码: git pull && bash deploy.sh"
