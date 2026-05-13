#!/bin/bash

# Cloudflared 后台启动脚本
# 使用 nohup 让进程在 SSH 断开后继续运行

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANAGER_SCRIPT="${PROJECT_DIR}/cloudflared-manager.sh"
PID_FILE="${PROJECT_DIR}/cloudflared-manager.pid"
LOG_FILE="${PROJECT_DIR}/cloudflared-manager.log"

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

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') $1"
}

# 检查是否已经在运行
if [ -f "$PID_FILE" ]; then
    pid=$(cat "$PID_FILE")
    if kill -0 "$pid" 2>/dev/null; then
        log_error "cloudflared-manager 已在运行 (PID: $pid)"
        log_info "停止旧进程..."
        kill "$pid" 2>/dev/null
        sleep 2
        rm -f "$PID_FILE"
    else
        rm -f "$PID_FILE"
    fi
fi

# 启动后台进程
log_info "启动 cloudflared-manager 后台进程..."
log_info "日志文件: $LOG_FILE"

nohup bash "$MANAGER_SCRIPT" monitor >> "$LOG_FILE" 2>&1 &
pid=$!

echo "$pid" > "$PID_FILE"

log_info "已启动 (PID: $pid)"
log_info ""
log_info "常用命令："
log_info "  查看日志: tail -f $LOG_FILE"
log_info "  停止服务: bash stop-cloudflared.sh"
log_info "  查看状态: bash $MANAGER_SCRIPT status"
log_info ""
log_info "等待 5 秒获取域名..."
sleep 5

# 从日志中获取 URL
if [ -f "${PROJECT_DIR}/cloudflared.log" ]; then
    url=$(grep -oP 'https://[a-zA-Z0-9.-]+\.trycloudflare\.com' "${PROJECT_DIR}/cloudflared.log" | tail -1)
    if [ -n "$url" ]; then
        log_info "Tunnel URL: $url"
        
        # 自动更新 redirect-app 的域名配置
        REDIRECT_DIR="${PROJECT_DIR}/redirect-app"
        URL_FILE="${REDIRECT_DIR}/public/latest-url.txt"
        
        if [ -f "$URL_FILE" ]; then
            log_info "更新 Vercel 重定向域名..."
            echo "$url" > "$URL_FILE"
            
            # Git 提交并推送
            cd "$REDIRECT_DIR"
            git add public/latest-url.txt
            git commit -m "chore: update cloudflared URL to $url"
            git push
            
            log_info "✅ 已自动更新并推送，Vercel 将自动重新部署"
            log_info "固定访问地址: https://your-project.vercel.app"
        else
            log_warn "未找到 redirect-app/public/latest-url.txt，跳过自动更新"
        fi
    fi
fi
