# Devnet 部署指南

## 为什么需要 Devnet？

本地测试网无法对接真实的 LI.FI、MagicBlock PER 和 x402 协议，因为：
- LI.FI 跨链桥需要与真实链交互
- MagicBlock PER 隐私协议需要 Devnet/Mainnet 环境
- x402 自主代理支付需要真实网络

## 部署前准备

### 1. 获取 Devnet SOL

由于官方水龙头有限制，推荐使用以下方法：

#### 方法 A：使用 Helius 免费 RPC（推荐）

1. 访问 https://www.helius.dev/
2. 注册免费账号
3. 创建 Devnet 端点
4. 获取专属 RPC URL（例如：`https://devnet.helius-rpc.com/?api-key=YOUR_KEY`）
5. 配置 Solana CLI：
   ```bash
   solana config set --url https://devnet.helius-rpc.com/?api-key=YOUR_KEY
   solana airdrop 2
   solana airdrop 2
   solana airdrop 2
   ```

#### 方法 B：使用其他水龙头网站

- https://faucet.quicknode.com/solana/devnet
- https://www.solanafaucet.com/

### 2. 获取 API Keys

#### LI.FI API Key
1. 访问 https://li.fi/developers
2. 注册开发者账号
3. 创建应用获取 API Key
4. 免费额度：1000 次/天

#### MagicBlock PER API Key
1. 访问 https://www.magicblock.com/
2. 申请开发者权限
3. 获取 API Key

#### x402 API Key
1. 访问 https://x402.org/
2. 注册开发者账号
3. 获取 API Key

## 部署步骤

### 步骤 1：切换到 Devnet 模式

```bash
cd /Users/laters/work/web3/MachineCat

# 切换网络配置
./switch-network.sh devnet
```

### 步骤 2：配置环境变量

编辑 `robot-server/.env`：

```env
# 网络配置
SOLANA_NETWORK=DEVNET
SOLANA_RPC_URL=https://api.devnet.solana.com  # 或您的专属 RPC URL

# 支付模式
PAYMENT_MODE=real

# API Keys
LIFI_API_KEY=your_lifi_api_key_here
MAGIC_BLOCK_API_KEY=your_magicblock_api_key_here
X402_API_KEY=your_x402_api_key_here

# 支付接收地址
PAYMENT_RECEIVER_ADDRESS=your_solana_wallet_address
```

### 步骤 3：部署合约到 Devnet

```bash
cd robot-contract

# 构建合约
anchor build

# 部署到 Devnet
anchor deploy --provider.cluster devnet

# 记录输出的 Program ID
# 示例: Program Id: ABC123...XYZ
```

### 步骤 4：更新后端配置

将部署后的 Program ID 更新到 `.env`：

```env
ROBOT_STATE_PROGRAM_ID=your_deployed_program_id
```

### 步骤 5：启动服务

```bash
# 启动后端
cd ../robot-server
npm run start:http

# 启动前端
cd ../robot-app
npm start
```

## 验证部署

### 1. 检查支付模式

```bash
curl -sk https://localhost:3002/api/payment/mode
```

应该返回：
```json
{
  "success": true,
  "data": {
    "mode": "real",
    "network": "DEVNET",
    "hasLiFiKey": true,
    "hasMagicBlockKey": true,
    "hasX402Key": true
  }
}
```

### 2. 测试完整流程

1. 打开前端页面
2. 连接 Phantom 钱包（确保切换到 Devnet）
3. 输入 "我不想出门"
4. 确认任务并支付
5. 验证 LI.FI、MagicBlock、x402 真实调用

## 故障排除

### 问题 1：Devnet RPC 连接失败

**解决方案：**
- 使用 Helius、QuickNode 等专用 RPC
- 公共 RPC 经常被限流

### 问题 2：API 调用失败

**解决方案：**
- 检查 API Key 是否正确
- 确认网络环境（Devnet vs Mainnet）
- 查看后端日志确认错误信息

### 问题 3：合约部署失败

**解决方案：**
- 确认钱包有足够 SOL（至少 2 SOL）
- 检查 Program ID 是否正确
- 确认 Anchor.toml 配置

## 模式对比

| 特性 | 本地测试网 + Mock | Devnet + Real |
|------|------------------|---------------|
| 开发速度 | ✅ 快速 | ⚠️ 依赖网络 |
| LI.FI 跨链 | ❌ Mock | ✅ 真实 |
| MagicBlock PER | ❌ Mock | ✅ 真实 |
| x402 支付 | ❌ Mock | ✅ 真实 |
| 链上交易 | ✅ 真实 | ✅ 真实 |
| 演示稳定性 | ✅ 高 | ⚠️ 依赖网络 |
| 黑客松提交 | ❌ 不适合 | ✅ 适合 |

## 推荐工作流

1. **日常开发**：本地测试网 + Mock 模式
2. **功能测试**：本地测试网 + Mock 模式
3. **演示录制**：Devnet + Real 模式（或 Mock 备选）
4. **黑客松提交**：Devnet + Real 模式
