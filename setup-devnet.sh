#!/bin/bash

# Devnet 部署准备脚本
# 帮助配置 Helius RPC 并领取测试 SOL

echo "========================================="
echo "🚀 Devnet 部署准备"
echo "========================================="
echo ""

# 检查是否已配置 Helius RPC
echo "📋 当前 Solana 配置:"
solana config get
echo ""

echo "⚠️  由于公共 Devnet RPC 不稳定，建议使用 Helius 免费 RPC"
echo ""
echo "📝 请按以下步骤操作："
echo ""
echo "1️⃣  访问 https://www.helius.dev/"
echo "2️⃣  注册免费账号"
echo "3️⃣  创建 Devnet 端点"
echo "4️⃣  复制您的 RPC URL（格式：https://devnet.helius-rpc.com/?api-key=xxx）"
echo ""

# 读取用户输入的 Helius RPC URL
read -p "🔗 请输入您的 Helius Devnet RPC URL: " HELIUS_RPC_URL

if [ -z "$HELIUS_RPC_URL" ]; then
    echo "❌ 未输入 RPC URL，退出"
    exit 1
fi

echo ""
echo "⚙️  配置 Solana CLI 使用 Helius RPC..."
solana config set --url "$HELIUS_RPC_URL"

echo ""
echo "✅ Solana CLI 配置完成！"
echo ""

# 检查钱包余额
echo "💰 检查钱包余额..."
BALANCE=$(solana balance 2>&1)
echo "   $BALANCE"
echo ""

# 判断是否需要领取 SOL
if [[ $BALANCE == *"0 SOL"* ]] || [[ $BALANCE == *"Error"* ]]; then
    echo "🎁 开始领取 Devnet 测试 SOL..."
    echo "   第 1 次..."
    solana airdrop 2
    sleep 2
    
    echo "   第 2 次..."
    solana airdrop 2
    sleep 2
    
    echo "   第 3 次..."
    solana airdrop 2
    sleep 2
    
    echo ""
    echo "💰 当前余额:"
    solana balance
else
    echo "✅ 钱包已有余额，跳过领取"
fi

echo ""
echo "========================================="
echo "✅ Devnet 准备完成！"
echo "========================================="
echo ""
echo "下一步："
echo "1. 部署合约: cd robot-contract && anchor deploy --provider.cluster devnet"
echo "2. 更新 .env: 设置 PAYMENT_MODE=real 并填入 API Keys"
echo "3. 启动服务: cd robot-server && npm run start:http"
echo ""
