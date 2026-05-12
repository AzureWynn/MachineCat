# 🤖 buzhai - 前端应用

机器猫跨链隐私支付平台的前端 React 应用。

## 快速链接

- 📄 [主项目 README](../README.md) - 项目总览和黑客松信息
- 📄 [合约文档](../robot-contract/README.md) - Solana 合约文档
- 📄 [后端服务](../robot-server/) - Node.js 后端代码

## 技术栈

- **UI 框架**: React 19
- **路由**: React Router v7
- **状态管理**: Zustand
- **HTTP 客户端**: Axios
- **构建工具**: Create React App
- **钱包集成**: Phantom Wallet
- **区块链**: @solana/web3.js

## 核心功能

- 机器猫状态展示（mood, bond, energy, streak）
- AI 对话界面
- Phantom 钱包连接（支持桌面和移动端）
- 跨链支付流程（LI.FI + MagicBlock + x402）
- 前端交易签名模式

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start
```

应用将在 http://localhost:3000 启动。

## 部署

```bash
# 构建生产版本
npm run build

# 部署到 Vercel
vercel --prod
```
