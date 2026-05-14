# 🤖 buzhai - 跨链隐私支付智能机器猫平台

[🇧 English Version](README_EN.md)

> 赋予每个物理机器猫独一无二的"灵魂"——能听、会说、会动，且所有行为和语言都与其设定的"人设"高度统一。
> 
> 集成 Solana 链上状态管理 + LI.FI 跨链桥 + MagicBlock 隐私交易 + x402 自主代理支付

## 🏆 黑客松提交信息

### 合约部署地址
- **网络：** Solana Devnet
- **Program ID：** `ARjXV5jAyB1t53WE4c3eEf6gftFnF7aiympwBCfSvVoY`
- **交易签名：** [查看交易](https://solscan.io/tx/4FGj6HfGyZzX9kAqUdvHBdFycYAKAt9QKQh1F6WXfU9zji8a7wcj9iBqsXvBhfE3JmWjwwe4DXXx7LXdvDHXffwf?cluster=devnet)

### 快速链接
- 📄 [合约文档](robot-contract/README.md) - Solana 合约功能、部署和 API 说明
- 📄 [合约 API 文档](robot-contract/CONTRACT_API.md) - 详细接口文档
- 📄 [后端服务](robot-server/) - Node.js 后端代码
- 📄 [前端应用](robot-app/) - React 前端代码
- 📄 [Devnet 部署指南](DEPLOY_DEVNET.md) - 部署步骤和配置

### 在线演示
🌐 **https://scuba-biblical-specified-distinguished.trycloudflare.com**

### 演示视频
🎬 **https://youtu.be/EfRvZO4WACY**

## 📖 项目简介

机器猫是一个高度个性化、可扩展的智能机器猫交互平台。通过软件定义，我们为机器猫赋予名字、种类、品种和可定制的性格特征，并结合大型语言模型（LLM）实现真正的情感化智能交互。

**黑客松亮点**：实现"AI 任务生成 → 用户确认 → 跨链支付 → 链上状态更新"的完整闭环，展示 Agent 跨链隐私支付的实际应用场景。

### ✨ 核心特性

- **🎭 个性化人设系统**：自定义机器猫的名字、种类、品种和性格特征图谱
- **🧠 LLM 智能对话**：基于大语言模型的自然语言交互，回复内容与机器猫性格高度匹配
- **🎬 动作编排**：LLM 自动生成动作指令，控制机器猫做出相应动作
- **📡 实时通信**：基于 WebSocket 的双向实时通信，支持状态监控和指令下发
- **🔋 状态监控**：实时显示机器猫在线状态、电池电量等信息
- **🎮 虚拟模拟器**：支持虚拟机器猫模拟，无需硬件即可完整开发和测试
- **⛓️ Solana 链上状态**：机器猫状态数据存储在 Solana 链上，支持多用户隔离
- **🌉 跨链支付**：集成 LI.FI 跨链桥，支持多链资产转移
- **🔒 隐私保护**：使用 MagicBlock PER 协议实现隐私交易
- **🤖 自主代理支付**：x402 协议支持 AI 代理自主执行支付

## 🏗️ 系统架构

项目采用**领域驱动设计（DDD）**和**六边形架构**，将系统划分为清晰、独立的限界上下文：

```
┌─────────────────────────────────────────────────────────────┐
│                     前端应用 (React)                         │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌─────────┐ │
│  │  首页    │  │ 个性设置     │  │ 聊天界面 │  │ 控制台  │ │
│  └──────────┘  └──────────────┘  └──────────┘  └─────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP / WebSocket
┌────────────────────────▼────────────────────────────────────┐
│                   后端服务 (Node.js + Koa)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              核心域 (Core Domain)                     │   │
│  │  ┌─────────────────┐  ┌──────────────┐  ┌─────────┐ │   │
│  │  │ 机器猫个性上下文 │  │ AI 交互上下文 │  │ 机器猫  │ │   │
│  │  │ RobotPersonality│  │ AIInteraction│  │ 控制    │ │   │
│  │  └─────────────────┘  └──────────────┘  └─────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────┬──────────────────────┬─────────────────────────┘
             │                      │
    ┌────────▼────────┐    ┌────────▼────────┐
    │   MongoDB       │    │     Redis       │
    │  持久化存储      │    │   实时缓存       │
    └─────────────────┘    └─────────────────┘
```

## 📁 项目结构

```
MachineCat/
├── robot-app/                    # 前端 React 应用
│   ├── src/
│   │   ├── components/          # 可复用组件
│   │   │   ├── Navbar.js        # 导航栏
│   │   │   └── RobotStatus.js   # 机器猫状态显示
│   │   ├── pages/               # 页面组件
│   │   │   ├── Home.js          # 首页
│   │   │   ├── PersonalityPage.js  # 个性设置页
│   │   │   ├── ChatPage.js      # 聊天页
│   │   │   ├── ControlPage.js   # 控制台页
│   │   │   └── DemoPage.js      # Demo（跨链支付）
│   │   ├── services/            # API 和 WebSocket 服务
│   │   └── store/               # Zustand 状态管理
│   └── package.json
│
├── robot-server/                 # 后端 Node.js 服务
│   ├── src/
│   │   ├── core/                # 核心业务域
│   │   │   ├── robot-personality/    # 机器猫个性上下文
│   │   │   │   ├── domain/           # 领域模型
│   │   │   │   └── application/      # 应用服务
│   │   │   ├── ai-interaction/       # AI 交互上下文
│   │   │   │   ├── application/      # 交互服务
│   │   │   │   └── infrastructure/   # LLM 客户端
│   │   │   ├── robot-control/        # 机器猫控制上下文
│   │   │   │   ├── domain/           # 机器猫聚合根
│   │   │   │   └── infrastructure/   # WebSocket/HTTP/蓝牙连接器
│   │   │   └── blockchain/           # 区块链服务
│   │   │       ├── solana.service.js     # Solana 合约交互
│   │   │       ├── payment.service.js    # 跨链支付服务
│   │   │       └── robot_contract.json   # 合约 IDL
│   │   └── infrastructure/      # 全局基础设施
│   │       ├── database/        # 数据库连接
│   │       └── web/             # Koa Web 服务
│   ├── scripts/                 # 数据库种子脚本
│   ├── virtual_robot.js         # 虚拟机器猫模拟器
│   └── package.json
│
── robot-contract/               # Solana 智能合约
│   ├── programs/
│   │   ── robot-contract/
│   │       ── src/
│   │           └── lib.rs        # 合约主代码（Rust/Anchor）
│   ├── tests/
│   │   └── robot-contract.ts     # 合约测试
│   ├── Anchor.toml               # Anchor 配置
│   └── README.md                 # 合约文档
│
├── robot-sim-ros2/               # ROS2 + Gazebo 仿真
│   ├── src/machinecat_robot/     # ROS2 机器人包
│   │   ├── urdf/                 # URDF 机器人模型
│   │   ├── launch/               # 启动文件
│   │   ├── scripts/              # Python 控制脚本
│   │   └── worlds/               # Gazebo 世界文件
│   ├── Dockerfile                # Docker 镜像
│   ├── docker-compose.yml        # 容器编排
│   └── README.md                 # 仿真文档
│
── complete_project_analysis_v4.md  # 技术实现蓝图
```

## 🛠️ 技术栈

### 后端 (robot-server)
- **运行时**: Node.js
- **Web 框架**: Koa.js
- **WebSocket**: ws
- **数据库**: MongoDB (Mongoose ODM)
- **缓存**: Redis (ioredis)
- **日志**: Winston
- **架构模式**: 领域驱动设计 (DDD)
- **区块链集成**: @solana/web3.js, @coral-xyz/anchor

### 前端 (robot-app)
- **UI 框架**: React 19
- **路由**: React Router v7
- **状态管理**: Zustand
- **HTTP 客户端**: Axios
- **构建工具**: Create React App
- **钱包集成**: Phantom Wallet

### 智能合约 (robot-contract)
- **语言**: Rust
- **框架**: Anchor
- **网络**: Solana Devnet
- **合约地址**: `ARjXV5jAyB1t53WE4c3eEf6gftFnF7aiympwBCfSvVoY`

### 区块链协议集成
- **LI.FI**: 跨链桥接协议，支持多链资产转移
- **MagicBlock PER**: 隐私交易协议，保护用户交易隐私
- **x402**: 自主代理支付协议，AI 代理自主执行支付

## 🚀 快速开始

### 环境要求

- Node.js >= 18.x
- MongoDB >= 6.0
- Redis >= 7.0
- Solana CLI >= 1.18.0（可选，用于合约开发）
- Anchor >= 0.30.0（可选，用于合约开发）
- Phantom 钱包（可选，用于前端交互）

### 后端启动

```bash
# 进入后端目录
cd robot-server

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置 MongoDB 和 Redis 连接信息

# 初始化示例数据（可选）
npm run seed

# 启动服务 使用 HTTP 模式
npm run start:http
```

### 前端启动

```bash
# 进入前端目录
cd robot-app

# 安装依赖
npm install

# 启动开发服务器
npm start
```

### 虚拟机器猫模拟器

```bash
# 在 robot-server 目录下运行
node virtual_robot.js
```

虚拟机器猫会模拟真实硬件的行为，包括：
- WebSocket 连接和心跳维持
- 接收并打印动作指令
- 模拟电池电量上报

## 📡 API 接口

### 个性管理
- `POST /api/personality` - 创建机器猫个性
- `GET /api/personality/:robotId` - 获取机器猫个性
- `PUT /api/personality/:robotId` - 更新机器猫个性

### AI 交互
- `POST /api/interaction` - 发送用户输入，获取 AI 回复和动作指令
- `POST /api/speech` - 语音输入处理

### 静态数据
- `GET /api/static-data/types` - 获取支持的机器猫类型
- `GET /api/static-data/breeds` - 获取品种列表
- `GET /api/static-data/traits` - 获取性格特征列表

### 健康检查
- `GET /health` - 服务健康检查

### Solana 区块链
- `GET /api/solana/state/:robotId` - 获取链上机器猫状态
- `POST /api/solana/state/init` - 初始化链上机器猫状态
- `POST /api/solana/state/update` - 更新链上机器猫状态
- `POST /api/solana/quest/complete` - 完成链上任务
- `POST /api/solana/transaction/build` - 构建前端签名交易
- `POST /api/solana/transaction/init` - 构建初始化交易

### 跨链支付
- `POST /api/payment/process` - 处理跨链支付
- `POST /api/payment/quote` - 获取跨链报价
- `GET /api/payment/mode` - 获取当前支付模式

## 🔗 跨链支付集成

### LI.FI 跨链桥（核心集成）

**集成方式：** REST API

**技术实现：**
- 使用 LI.FI `/v1/quote` 获取跨链报价，支持多链资产转移（Ethereum, Polygon, BSC → Solana）
- 使用 `/v1/transfer` 执行跨链转账，自动路由最优路径
- 支持 API Key 认证（`x-lifi-api-key` header）
- 完整的错误处理和 Mock 降级机制

**调用流程：**
```
用户确认任务 
  → 后端调用 LI.FI API 获取报价 
  → 前端签名交易 
  → LI.FI 执行跨链桥接 
  → Solana 链上状态更新
```

**代码位置：** [robot-server/src/core/blockchain/payment.service.js](robot-server/src/core/blockchain/payment.service.js)

**API 文档：** https://li.fi/developers

### MagicBlock PER 隐私交易

使用 MagicBlock PER 协议实现隐私保护交易：
- 增强隐私保护级别
- 大匿名集保护用户隐私（1000+）
- 适用于敏感支付场景

**代码位置：** [payment.service.js](robot-server/src/core/blockchain/payment.service.js) - `createPrivateTransaction()`

### x402 自主代理支付

使用 x402 协议实现 AI 代理自主支付：
- AI 代理可自主发起和执行支付
- 基于 Solana 链上状态触发
- 适用于自动化服务付费场景

**代码位置：** [payment.service.js](robot-server/src/core/blockchain/payment.service.js) - `createX402Payment()`

### 支付模式

系统支持双模式运行：
- **Mock 模式**（默认）：本地测试，无需 API Key，快速开发
- **Real 模式**：真实协议调用，需要配置 API Keys

切换模式：
```bash
# 切换到 Real 模式
./scripts/switch-network.sh devnet

# 配置 .env
PAYMENT_MODE=real
LIFI_API_KEY=your_key_here
```

## 🎯 用户流程

**完整闭环：** AI 任务生成 → 用户确认 → 跨链支付 → 链上状态更新

1. **用户输入需求**：例如"我不想出门"
2. **LLM 生成任务**：AI 建议"去楼下买瓶水"
3. **用户确认任务**：确认支付和执行
4. **连接 Phantom 钱包**：前端签名模式
5. **LI.FI 跨链支付**：从其他链转移资产到 Solana（真实 API 调用）
6. **MagicBlock 隐私保护**：保护交易隐私
7. **x402 自主代理支付**：完成支付流程
8. **Solana 链上状态更新**：更新机器猫 mood, bond, energy 等
9. **前端展示结果**：显示支付成功和状态变化

**Solana 在用户旅程中的核心作用：**
- 机器人状态存储在 Solana 链上（PDA 账户）
- 所有支付通过 Solana 完成
- 合约是 AI 代理和用户交互的核心基础设施

## 🎭 个性系统

### 机器猫类型
- `CAT` - 猫型机器猫
- `CUSTOM` - 自定义类型

### 性格特征
每个机器猫可以拥有多个性格特征，每个特征有 0-100 的百分比值：

```json
{
  "name": "小橘",
  "type": "CAT",
  "breed": "橘猫",
  "traits": {
    "活泼": 80,
    "傲娇": 50,
    "贪吃": 90
  }
}
```

### LLM 交互流程

1. 用户输入文本
2. 系统获取机器猫的个性配置
3. 动态构建包含个性信息的 Prompt
4. 调用 LLM 生成回复
5. 解析 LLM 回复，分离文本和动作指令
6. 将动作指令发送给机器猫执行
7. 返回文本回复给用户

## 📋 开发计划

项目采用**模拟驱动开发**策略，分阶段实施：

- ✅ **Sprint 0**: 环境搭建与后端基础
- ✅ **Sprint 1**: 核心上下文建模与模拟器开发
- ✅ **Sprint 2**: 个性化与 LLM 交互
- ✅ **Sprint 3**: 前端开发与完整流程联调
- ⏳ **Sprint 4+**: 硬件集成与 TTS 语音播报

详细开发计划请查看 [development_plan.md](development_plan.md)

## 📚 文档

- [技术实现蓝图](complete_project_analysis_v4.md) - 完整的架构设计和技术选型
- [开发计划](development_plan.md) - 详细的开发阶段和任务清单
- [合约文档](robot-contract/README.md) - Solana 合约部署地址和 API 文档
- [合约 API 文档](robot-contract/CONTRACT_API.md) - 合约接口详细说明
- [Devnet 部署指南](DEPLOY_DEVNET.md) - Devnet 部署步骤和配置

### 子项目文档
- [robot-contract/README.md](robot-contract/README.md) - Solana 智能合约文档
- [robot-server/](robot-server/) - 后端服务
- [robot-app/](robot-app/) - 前端应用
- [robot-sim-ros2/README.md](robot-sim-ros2/README.md) - ROS2 + Gazebo 仿真文档

## 🔐 安全注意事项

以下文件包含敏感信息，不应提交到版本控制系统：

- `.env` - 环境变量（包含数据库密码、API 密钥等）
- `certificates/` - SSL/TLS 证书文件
- `node_modules/` - 依赖包

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

ISC License

---

**让每个机器猫都有独特的灵魂** 🐱
