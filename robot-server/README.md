# 🤖 buzhai - 后端服务

机器猫跨链隐私支付平台的后端 Node.js 服务。

## 快速链接

- 📄 [主项目 README](../README.md) - 项目总览和黑客松信息
- 📄 [合约文档](../robot-contract/README.md) - Solana 合约文档
- 📄 [前端应用](../robot-app/) - React 前端代码
- 📄 [黑客松符合性分析](../HACKATHON_ANALYSIS.md) - 参赛要求分析
- 📄 [Devnet 部署指南](../DEPLOY_DEVNET.md) - 部署步骤

## 技术栈

- **运行时**: Node.js
- **Web 框架**: Koa.js
- **WebSocket**: ws
- **数据库**: MongoDB (Mongoose ODM)
- **缓存**: Redis (ioredis)
- **日志**: Winston
- **架构模式**: 领域驱动设计 (DDD)
- **区块链集成**: @solana/web3.js, @coral-xyz/anchor

## 核心模块

### 业务域
- **robot-personality** - 机器猫个性上下文
- **ai-interaction** - AI 交互上下文
- **robot-control** - 机器猫控制上下文
- **blockchain** - 区块链服务（Solana + 跨链支付）

### 区块链服务
- [solana.service.js](src/core/blockchain/solana.service.js) - Solana 合约交互
- [payment.service.js](src/core/blockchain/payment.service.js) - 跨链支付服务（LI.FI + MagicBlock + x402）
- [robot_contract.json](src/core/blockchain/robot_contract.json) - 合约 IDL

### API 路由
- [personality.routes.js](src/infrastructure/web/routes/personality.routes.js) - 个性管理
- [interaction.routes.js](src/infrastructure/web/routes/interaction.routes.js) - AI 交互
- [solana.routes.js](src/infrastructure/web/routes/solana.routes.js) - Solana 链上操作
- [payment.routes.js](src/infrastructure/web/routes/payment.routes.js) - 跨链支付

## 快速开始

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env

# 启动服务（HTTP 模式）
npm run start:http
```

## 环境变量

```env
# 数据库
MONGODB_URI=mongodb://localhost:27017/robot-cat
REDIS_URL=redis://localhost:6379

# Solana
SOLANA_NETWORK=DEVNET
SOLANA_RPC_URL=https://api.devnet.solana.com
ROBOT_STATE_PROGRAM_ID=ARjXV5jAyB1t53WE4c3eEf6gftFnF7aiympwBCfSvVoY

# 支付
PAYMENT_MODE=real
LIFI_API_KEY=your_key_here
```

## API 文档

详见 [主项目 README](../README.md#-api-接口)
