#!/bin/bash

# 更新 redirect-app 的域名配置
# 用法: ./update-redirect-url.sh <new-cloudflared-url>

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REDIRECT_DIR="${PROJECT_DIR}/redirect-app"
URL_FILE="${REDIRECT_DIR}/public/latest-url.txt"

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

# 检查参数
if [ -z "$1" ]; then
    log_error "请提供 Cloudflared URL"
    log_info "用法: $0 <https://xxx.trycloudflare.com>"
    exit 1
fi

NEW_URL="$1"

# 验证 URL 格式
if [[ ! "$NEW_URL" =~ ^https://[a-zA-Z0-9.-]+\.trycloudflare\.com$ ]]; then
    log_error "无效的 URL 格式: $NEW_URL"
    log_info "期望格式: https://xxx.trycloudflare.com"
    exit 1
fi

# 更新 URL 文件
log_info "更新域名: $NEW_URL"
echo "$NEW_URL" > "$URL_FILE"

# Git 提交
cd "$REDIRECT_DIR"
git add public/latest-url.txt
git commit -m "chore: update cloudflared URL to $NEW_URL"
git push

log_info "✅ 已更新并推送，Vercel 将自动重新部署"
log_info "固定访问地址: https://your-project.vercel.app"
