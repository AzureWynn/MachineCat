# 用户系统 - 产品计划与开发文档

## 1. 产品概述

### 1.1 目标
构建一个兼容 Web2 和 Web3 的用户系统，支持：
- Google 账号登录（Web2）
- Solana 钱包登录（Web3）
- 用户与机器人的关联管理
- 统一的身份认证和授权

### 1.2 核心功能
| 功能 | 描述 |
|------|------|
| 用户注册/登录 | 支持 Google OAuth 和钱包签名验证 |
| 用户资料管理 | 昵称、头像、偏好设置 |
| 机器猫绑定 | 用户可绑定多个机器猫 |
| 机器猫管理 | 查看、解绑、切换当前机器猫 |
| 会话管理 | JWT Token 管理 |

---

## 2. 技术架构

### 2.1 技术栈
| 层级 | 技术 |
|------|------|
| 后端框架 | Koa.js |
| 数据库 | MongoDB (Mongoose) |
| 认证 | JWT (jsonwebtoken) |
| Web2 登录 | 策略模式（支持 Google、GitHub、邮箱等） |
| Web3 登录 | Solana 钱包签名验证 (@solana/web3.js, tweetnacl) |
| 前端状态管理 | Zustand |
| 前端路由 | React Router |

### 2.2 可扩展认证架构

#### 设计原则：策略模式 + 插件化
采用策略模式设计认证系统，新增登录方式只需：
1. 创建新的认证策略类
2. 注册到认证管理器
3. 添加对应的前端组件

**无需修改现有代码**，符合开闭原则（Open-Closed Principle）。

#### 认证策略接口
```javascript
// 所有认证策略必须实现的接口
interface AuthStrategy {
  // 验证用户身份
  authenticate(credentials: object): Promise<UserInfo>;
  
  // 获取策略名称
  getStrategyName(): string;
  
  // 策略类型：'oauth' | 'wallet' | 'email'
  getType(): string;
  
  // 是否需要额外配置
  requiresConfig(): boolean;
}
```

#### 认证管理器
```javascript
class AuthManager {
  constructor() {
    this.strategies = new Map();
  }
  
  // 注册认证策略
  registerStrategy(name: string, strategy: AuthStrategy) {
    this.strategies.set(name, strategy);
  }
  
  // 执行认证
  async authenticate(strategyName: string, credentials: object) {
    const strategy = this.strategies.get(strategyName);
    if (!strategy) {
      throw new Error(`Unknown auth strategy: ${strategyName}`);
    }
    return await strategy.authenticate(credentials);
  }
  
  // 获取所有可用的认证策略
  getAvailableStrategies() {
    return Array.from(this.strategies.keys());
  }
  
  // 按类型获取策略（oauth / wallet / email）
  getStrategiesByType(type: string) {
    return Array.from(this.strategies.values())
      .filter(s => s.getType() === type);
  }
}
```

#### 扩展示例：添加 GitHub 登录
```javascript
// 1. 创建 GitHub 认证策略
class GitHubAuthStrategy {
  async authenticate({ githubToken }) {
    // 验证 GitHub OAuth token
    // 返回用户信息
  }
  
  getStrategyName() {
    return 'github';
  }
  
  getType() {
    return 'oauth';
  }
}

// 2. 注册策略
authManager.registerStrategy('github', new GitHubAuthStrategy());

// 3. 前端添加 GitHub 登录按钮
// 无需修改后端认证逻辑
```

#### 扩展示例：添加邮箱注册
```javascript
// 1. 创建邮箱认证策略
class EmailAuthStrategy {
  async authenticate({ email, password }) {
    // 验证邮箱密码
    // 支持注册和登录
  }
  
  getStrategyName() {
    return 'email';
  }
  
  getType() {
    return 'email';
  }
}

// 2. 注册策略
authManager.registerStrategy('email', new EmailAuthStrategy());
```

#### 扩展示例：添加 Ethereum 钱包登录
```javascript
// 1. 创建 Ethereum 钱包认证策略
class EthereumAuthStrategy {
  async authenticate({ address, signature, message }) {
    // 使用 ethers.js 验证签名
    // 返回用户信息
  }
  
  getStrategyName() {
    return 'ethereum';
  }
  
  getType() {
    return 'wallet';
  }
}

// 2. 注册策略
authManager.registerStrategy('ethereum', new EthereumAuthStrategy());
```

#### 扩展示例：添加 TON 钱包登录
```javascript
// 1. 创建 TON 钱包认证策略
class TONAuthStrategy {
  async authenticate({ address, signature, message }) {
    // 使用 tonweb 验证签名
    // 返回用户信息
  }
  
  getStrategyName() {
    return 'ton';
  }
  
  getType() {
    return 'wallet';
  }
}

// 2. 注册策略
authManager.registerStrategy('ton', new TONAuthStrategy());
```

#### 扩展示例：添加 SUI 钱包登录
```javascript
// 1. 创建 SUI 钱包认证策略
class SUIAuthStrategy {
  async authenticate({ address, signature, message }) {
    // 使用 @mysten/sui.js 验证签名
    // 返回用户信息
  }
  
  getStrategyName() {
    return 'sui';
  }
  
  getType() {
    return 'wallet';
  }
}

// 2. 注册策略
authManager.registerStrategy('sui', new SUIAuthStrategy());
```

### 2.3 架构图
```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Google Login │  │ Wallet Login │  │  More Strategies │   │
│  │              │  │              │  │  (GitHub, Email) │   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘   │
│         └─────────────────┴───────────────────┘              │
│                           │                                  │
│                    JWT Token                                 │
└───────────────────────────┼──────────────────────────────────┘
                            │
┌───────────────────────────┼──────────────────────────────────┐
│                        Backend (Koa)                          │
│  ┌───────────────────────┴──────────────────────────────┐    │
│  │              Auth Middleware                          │    │
│  │         (JWT Verify + User Resolve)                   │    │
│  └───────────────────────┬──────────────────────────────┘    │
│                           │                                  │
│  ┌────────────────────────┴──────────────────────────────┐   │
│  │                   Auth Manager                         │   │
│  │  ┌──────────────────────────────────────────────────┐ │   │
│  │  │  Strategy Registry (插件化注册)                   │ │   │
│  │  │  - GoogleAuthStrategy                            │ │   │
│  │  │  - WalletAuthStrategy                            │ │   │
│  │  │  - GitHubAuthStrategy (可扩展)                    │ │   │
│  │  │  - EmailAuthStrategy (可扩展)                     │ │   │
│  │  │  - More Strategies... (可扩展)                    │ │   │
│  │  └──────────────────────────────────────────────────┘ │   │
│  └───────────────────────────────────────────────────────┘   │
│                           │                                  │
│                    MongoDB                                    │
└───────────────────────────────────────────────────────────────┘
```
```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Google Login │  │ Wallet Login │  │  Robot Binding   │   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘   │
│         └─────────────────┴───────────────────┘              │
│                           │                                  │
│                    JWT Token                                 │
└───────────────────────────┼──────────────────────────────────┘
                            │
┌───────────────────────────┼──────────────────────────────────┐
│                        Backend (Koa)                          │
│  ┌───────────────────────┴──────────────────────────────┐    │
│  │              Auth Middleware                          │    │
│  │         (JWT Verify + User Resolve)                   │    │
│  └───────────────────────┬──────────────────────────────┘    │
│                           │                                  │
│  ┌────────────────────────┴──────────────────────────────┐   │
│  │                   User Service                         │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │   │
│  │  │ Google Auth  │  │ Wallet Auth  │  │ Robot Mgmt  │ │   │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │   │
│  └───────────────────────────────────────────────────────┘   │
│                           │                                  │
│                    MongoDB                                    │
└───────────────────────────────────────────────────────────────┘
```

---

## 3. 数据库设计

### 3.1 User 模型
```javascript
{
  _id: ObjectId,
  
  // 主要身份标识（当前使用的登录方式）
  authIdentity: {
    type: String,           // 'google' | 'solana' | 'ethereum' | 'email' | ...
    providerId: String,     // Google ID / 钱包地址 / 邮箱
    email: String,          // 邮箱（可选）
    avatar: String,         // 头像（可选）
    username: String,       // 用户名（可选）
  },
  
  // 关联的其他登录方式（预留，用于未来多登录方式绑定）
  linkedIdentities: [{
    type: String,           // 'google' | 'solana' | 'ethereum' | 'email' | ...
    providerId: String,     // Google ID / 钱包地址 / 邮箱
    email: String,          // 邮箱（可选）
    avatar: String,         // 头像（可选）
    username: String,       // 用户名（可选）
    linkedAt: Date,         // 关联时间
  }],
  
  // 用户资料
  nickname: String,           // 昵称
  avatar: String,             // 头像 URL
  email: String,              // 邮箱（用于通知）
  
  // 当前绑定的机器人
  currentRobotId: String,
  
  // 时间戳
  createdAt: Date,
  updatedAt: Date,
}
```

#### 设计说明

**核心概念：一个用户 = 一个主登录方式 + 可关联其他方式**

```
用户 A (userId: 123)
├── authIdentity: { type: 'google', providerId: 'google-123' }  // 主登录方式
└── linkedIdentities: []  // 暂未关联其他方式

用户 B (userId: 456)
├── authIdentity: { type: 'solana', providerId: '5FHneW46...' }  // 主登录方式
└── linkedIdentities: [
      { type: 'google', providerId: 'google-789' }  // 关联了 Google
    ]
```

**登录流程：**
1. 用户用 Google 登录 → 创建用户 A，authIdentity = google
2. 用户用 Solana 钱包登录 → 创建用户 B，authIdentity = solana
3. 两个账号默认独立，数据不共享

**未来扩展：关联其他登录方式**
- 用户登录后，可以在设置中关联其他登录方式
- 关联后存入 `linkedIdentities` 数组
- 下次用任意关联的方式登录，都进入同一个账号
- 支持解绑（至少保留一种登录方式）

**数据结构优势：**
- 默认独立账号，概念简单
- `linkedIdentities` 数组预留多登录方式能力
- 新增链只需添加新的 `type` 值，无需修改表结构
- 兼容未来账号迁移/合并功能

### 3.2 UserRobot 模型（用户-机器人关联）
```javascript
{
  _id: ObjectId,
  
  userId: ObjectId (ref: 'User'),
  robotId: String,            // 机器人 ID
  
  // 绑定信息
  boundAt: Date,              // 绑定时间
  isPrimary: Boolean,         // 是否为主机器人
  
  // 机器人配置（用户级别）
  nickname: String,           // 用户给机器人起的昵称
  personality: Object,        // 用户自定义的性格配置
  
  createdAt: Date,
  updatedAt: Date,
}
```

### 3.3 索引设计
```javascript
// User 模型
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });
userSchema.index({ walletAddress: 1 }, { unique: true, sparse: true });
userSchema.index({ email: 1 }, { sparse: true });

// UserRobot 模型
userRobotSchema.index({ userId: 1, robotId: 1 }, { unique: true });
userRobotSchema.index({ userId: 1 });
```

---

## 4. API 设计

### 4.1 认证相关

#### POST /api/auth/:strategy
通用认证端点（支持所有策略）

**路径参数：**
- `strategy`: `google` | `wallet` | `github` | `email`

**请求体（根据策略不同）：**

Google:
```json
{
  "googleToken": "Google OAuth ID Token"
}
```

Wallet:
```json
{
  "walletAddress": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
  "signature": "base64 encoded signature",
  "message": "Sign this message to login: nonce123"
}
```

GitHub:
```json
{
  "githubCode": "GitHub OAuth authorization code",
  "redirectUri": "http://localhost:3000/auth/github/callback"
}
```

Email (登录):
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Email (注册):
```json
{
  "email": "user@example.com",
  "password": "password123",
  "nickname": "MyNickname"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "token": "JWT Token",
    "user": {
      "id": "...",
      "nickname": "...",
      "email": "...",
      "loginMethods": ["google", "wallet"],
      "currentRobotId": "..."
    }
  }
}
```

#### POST /api/auth/wallet
Solana 钱包登录

**请求体：**
```json
{
  "walletAddress": "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
  "signature": "base64 encoded signature",
  "message": "Sign this message to login: nonce123"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "token": "JWT Token",
    "user": {
      "id": "...",
      "walletAddress": "...",
      "loginMethods": ["wallet"],
      "currentRobotId": "..."
    }
  }
}
```

#### GET /api/auth/wallet-nonce
获取钱包登录的随机 nonce

**响应：**
```json
{
  "success": true,
  "data": {
    "nonce": "random-string-123",
    "message": "Sign this message to login: random-string-123"
  }
}
```

#### POST /api/auth/link-wallet
关联钱包到当前用户

**请求头：** `Authorization: Bearer <JWT>`

**请求体：**
```json
{
  "walletAddress": "...",
  "signature": "...",
  "message": "..."
}
```

#### POST /api/auth/link-google
关联 Google 账号到当前用户

**请求头：** `Authorization: Bearer <JWT>`

**请求体：**
```json
{
  "googleToken": "..."
}
```

### 4.2 用户相关

#### GET /api/users/me
获取当前用户信息

**请求头：** `Authorization: Bearer <JWT>`

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "nickname": "...",
    "email": "...",
    "authType": "google",
    "currentRobotId": "...",
    "createdAt": "..."
  }
}
```

#### PUT /api/users/me
更新用户资料

**请求头：** `Authorization: Bearer <JWT>`

**请求体：**
```json
{
  "nickname": "新昵称",
  "avatar": "新头像URL"
}
```

### 4.3 账号迁移相关（为未来功能预留）

#### POST /api/users/migrate
请求账号迁移（将当前账号数据迁移到目标账号）

**请求头：** `Authorization: Bearer <JWT>`

**请求体：**
```json
{
  "targetAuthType": "solana",
  "targetProviderId": "5FHneW46...",
  "signature": "..."  // 目标账号的签名验证
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "message": "迁移成功，请使用新账号登录",
    "newToken": "新的 JWT Token"
  }
}
```

#### GET /api/users/migration-history
获取账号迁移历史

**请求头：** `Authorization: Bearer <JWT>`

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "fromUserId": "...",
      "fromAuthType": "google",
      "mergedAt": "...",
      "mergedMethods": ["google"]
    }
  ]
}
```

### 4.3 机器人绑定相关

#### GET /api/users/me/robots
获取用户绑定的所有机器人

**请求头：** `Authorization: Bearer <JWT>`

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "robotId": "...",
      "nickname": "我的小猫",
      "isPrimary": true,
      "boundAt": "...",
      "personality": {...}
    }
  ]
}
```

#### POST /api/users/me/robots
绑定机器人

**请求头：** `Authorization: Bearer <JWT>`

**请求体：**
```json
{
  "robotId": "robot-123",
  "nickname": "我的小猫",
  "isPrimary": true
}
```

#### DELETE /api/users/me/robots/:robotId
解绑机器人

**请求头：** `Authorization: Bearer <JWT>`

#### PUT /api/users/me/robots/:robotId/primary
设置主机器人

**请求头：** `Authorization: Bearer <JWT>`

#### PUT /api/users/me/current-robot
切换当前机器人

**请求头：** `Authorization: Bearer <JWT>`

**请求体：**
```json
{
  "robotId": "robot-123"
}
```

---

## 5. 认证流程

### 5.1 Google OAuth 登录流程
```
1. 前端点击 "Google 登录"
2. 跳转到 Google OAuth 授权页面
3. 用户授权后，Google 返回 ID Token
4. 前端将 ID Token 发送到后端 /api/auth/google
5. 后端验证 ID Token，获取用户信息
6. 查找或创建用户记录
7. 生成 JWT Token 返回给前端
8. 前端存储 JWT Token，后续请求携带
```

### 5.2 Solana 钱包登录流程
```
1. 前端点击 "钱包登录"
2. 请求后端 /api/auth/wallet-nonce 获取随机 nonce
3. 前端使用钱包对 nonce 消息进行签名
4. 前端将 walletAddress、signature、message 发送到后端 /api/auth/wallet
5. 后端使用公钥验证签名
6. 查找或创建用户记录
7. 生成 JWT Token 返回给前端
8. 前端存储 JWT Token，后续请求携带
```

### 5.3 JWT Token 结构
```javascript
{
  "userId": "ObjectId",
  "loginMethod": "google|wallet",
  "iat": 1234567890,
  "exp": 1234567890 + 7 * 24 * 60 * 60  // 7天过期
}
```

---

## 6. 前端设计

### 6.1 状态管理 (Zustand)
```javascript
// store/authStore.js
{
  // 状态
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: false,
  
  // 操作
  loginWithGoogle: async (googleToken) => {},
  loginWithWallet: async () => {},
  logout: () => {},
  linkWallet: async () => {},
  linkGoogle: async () => {},
  updateProfile: async (data) => {},
  
  // 机器人相关
  robots: [],
  currentRobotId: null,
  bindRobot: async (robotId, data) => {},
  unbindRobot: async (robotId) => {},
  switchRobot: async (robotId) => {},
}
```

### 6.2 页面组件
| 页面 | 路径 | 描述 |
|------|------|------|
| 登录页 | /login | 选择登录方式 |
| 首页 | / | 重定向到聊天或机器人列表 |
| 聊天页 | /chat | 需要登录，使用当前机器人 |
| 机器人管理 | /robots | 管理绑定的机器人 |
| 个人资料 | /profile | 编辑用户资料 |

### 6.3 登录页面设计
```
┌─────────────────────────────────────┐
│           MachineCat Login          │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  🐱  MachineCat             │   │
│   │  Your AI Robot Companion    │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  🔵  Continue with Google   │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  🟣  Connect Wallet         │   │
│   └─────────────────────────────┘   │
│                                     │
│   Already have an account? Login    │
└─────────────────────────────────────┘
```

---

## 7. 开发计划

### Phase 1: 后端基础 (2-3 天)
- [ ] 创建 User 和 UserRobot 模型
- [ ] 实现 JWT 认证中间件
- [ ] 实现 Google OAuth 登录
- [ ] 实现 Solana 钱包登录
- [ ] 实现用户资料 API
- [ ] 实现机器人绑定 API

### Phase 2: 前端基础 (2-3 天)
- [ ] 创建 authStore (Zustand)
- [ ] 实现登录页面
- [ ] 实现 Google 登录流程
- [ ] 实现钱包登录流程
- [ ] 实现用户资料页面
- [ ] 实现机器人管理页面

### Phase 3: 集成与优化 (1-2 天)
- [ ] 将现有 API 与用户系统关联
- [ ] 更新 ChatPage 使用用户绑定的机器人
- [ ] 更新 DemoPage 使用用户绑定的机器人
- [ ] 添加路由守卫（需要登录的页面）
- [ ] 测试与调试

---

## 8. 安全考虑

### 8.1 JWT 安全
- 使用强密钥（环境变量 JWT_SECRET）
- 设置合理的过期时间（7 天）
- 支持 Token 刷新机制

### 8.2 钱包登录安全
- 使用随机 nonce 防止重放攻击
- nonce 存储在 Redis 中，设置过期时间（5 分钟）
- 验证签名后删除 nonce

### 8.3 数据保护
- 密码不需要存储（使用 OAuth 和钱包签名）
- 敏感信息不存储在 JWT 中
- API 请求需要携带 JWT Token

### 8.4 CORS 配置
- 配置允许的域名
- 支持 credentials

---

## 9. 环境变量

```env
# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Redis (用于 nonce 存储)
REDIS_URL=redis://localhost:6379

# MongoDB
MONGODB_URI=mongodb://localhost:27017/robot-platform
```

---

## 10. 文件结构

### 后端新增文件
```
robot-server/
├── src/
│   ├── core/
│   │   └── auth/
│   │       ├── application/
│   │       │   ├── auth.service.js
│   │       │   ├── google-auth.service.js
│   │       │   └── wallet-auth.service.js
│   │       └── infrastructure/
│   │           ├── jwt.service.js
│   │           └── nonce.service.js
│   ├── infrastructure/
│   │   ├── database/
│   │   │   └── models/
│   │   │       ├── user.model.js
│   │   │       └── user-robot.model.js
│   │   └── web/
│   │       ├── middleware/
│   │       │   └── auth.middleware.js
│   │       └── routes/
│   │           ├── auth.routes.js
│   │           └── user.routes.js
```

### 前端新增文件
```
robot-app/
├── src/
│   ├── store/
│   │   └── authStore.js
│   ├── services/
│   │   └── auth.js
│   ├── pages/
│   │   ├── LoginPage.js
│   │   ├── ProfilePage.js
│   │   └── RobotManagementPage.js
│   └── components/
│       ├── GoogleLoginButton.js
│       └── WalletLoginButton.js
```

---

## 11. 后续扩展

### 11. 后续扩展

### 11.1 新增认证策略（以 GitHub 为例）
只需 3 步，无需修改现有代码：

**Step 1: 创建策略类**
```javascript
// src/core/auth/application/strategies/github-auth.strategy.js
class GitHubAuthStrategy {
  async authenticate({ githubCode, redirectUri }) {
    // 1. 用 code 换 access_token
    // 2. 用 access_token 获取用户信息
    // 3. 返回 { providerId, email, nickname, avatar }
  }
  
  getStrategyName() {
    return 'github';
  }
}
```

**Step 2: 注册策略**
```javascript
// src/core/auth/application/auth-manager.js
authManager.registerStrategy('github', new GitHubAuthStrategy());
```

**Step 3: 添加前端组件**
```javascript
// src/components/GitHubLoginButton.js
const GitHubLoginButton = () => {
  const handleLogin = () => {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}`;
  };
  return <button onClick={handleLogin}>GitHub Login</button>;
};
```

### 11.2 多链钱包支持
所有钱包登录方式都使用相同的策略模式，新增链只需：

**已支持的链：**
- Solana (@solana/web3.js)
- Ethereum (ethers.js)
- TON (tonweb)
- SUI (@mysten/sui.js)

**扩展新链示例（以 Polygon 为例）：**
```javascript
// 1. 创建策略
class PolygonAuthStrategy {
  async authenticate({ address, signature, message }) {
    // 使用 ethers.js 验证签名（Polygon 是 EVM 兼容链）
  }
  
  getStrategyName() { return 'polygon'; }
  getType() { return 'wallet'; }
}

// 2. 注册
authManager.registerStrategy('polygon', new PolygonAuthStrategy());

// 3. 前端添加按钮
// 无需修改后端逻辑
```

**其他可扩展的链：**
- Arbitrum
- Optimism
- BSC (Binance Smart Chain)
- Avalanche
- Cosmos
- Near
- 等等...

### 11.3 社交功能
- 用户好友系统
- 机器人分享

### 11.4 数据同步
- 跨设备同步机器人配置
- 聊天记录云存储

### 11.5 订阅系统
- 高级功能订阅
- 机器人皮肤市场
