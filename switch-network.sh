#!/bin/bash

# 网络切换脚本
# 用法: ./switch-network.sh [local|devnet]

ENV_FILE="robot-server/.env"

if [ "$1" == "devnet" ]; then
    echo "🔄 切换到 Devnet..."
    sed -i '' 's/^SOLANA_NETWORK=.*/SOLANA_NETWORK=DEVNET/' "$ENV_FILE"
    sed -i '' 's|^SOLANA_RPC_URL=.*|SOLANA_RPC_URL=https://api.devnet.solana.com|' "$ENV_FILE"
    echo "✅ 已切换到 Devnet"
    echo "   RPC: https://api.devnet.solana.com"
    echo "   交易可在 Solana Explorer 查看: https://explorer.solana.com/?cluster=devnet"
elif [ "$1" == "local" ]; then
    echo "🔄 切换到本地测试网..."
    sed -i '' 's/^SOLANA_NETWORK=.*/SOLANA_NETWORK=LOCAL/' "$ENV_FILE"
    sed -i '' 's|^SOLANA_RPC_URL=.*|SOLANA_RPC_URL=http://127.0.0.1:8899|' "$ENV_FILE"
    echo "✅ 已切换到本地测试网"
    echo "   RPC: http://127.0.0.1:8899"
else
    echo "用法: ./switch-network.sh [local|devnet]"
    echo ""
    echo "当前配置:"
    grep "SOLANA_NETWORK=" "$ENV_FILE" | head -1
    grep "^SOLANA_RPC_URL=" "$ENV_FILE" | head -1
fi
