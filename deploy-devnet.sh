#!/bin/bash

# 机器猫合约 Devnet 部署脚本

echo "========================================="
echo "🚀 机器猫合约 Devnet 部署"
echo "========================================="
echo ""

# 检查是否已配置 Helius RPC
echo "📋 当前 Solana 配置:"
solana config get
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
    
    echo ""
    echo "💰 当前余额:"
    solana balance
else
    echo "✅ 钱包已有余额，跳过领取"
fi

echo ""
echo "========================================="
echo "📦 开始部署合约..."
echo "========================================="
echo ""

# 进入合约目录
cd /Users/laters/work/web3/MachineCat/robot-contract

# 构建合约
echo "🔨 构建合约..."
anchor build

echo ""
echo "📤 部署合约到 Devnet..."
anchor deploy --provider.cluster devnet

echo ""
echo "========================================="
echo "✅ 部署完成！"
echo "========================================="
echo ""

# 获取合约地址
echo "📋 合约部署信息:"
echo "   程序 ID: $(cat target/deploy/robot_contract-keypair.json | python3 -c 'import sys,json; print(json.load(sys.stdin)[0:32])' | python3 -c 'import sys; import base58; print(base58.b58encode(bytes(eval(sys.stdin.read()))).decode())' 2>/dev/null || echo '请查看部署输出')"
echo ""
echo "下一步："
echo "1. 更新 .env 文件中的合约地址"
echo "2. 配置 LI.FI API Key"
echo "3. 切换到 Real 模式测试"
echo ""
