# 🤖 机器猫 Solana 合约

机器猫机器人状态管理智能合约，用于在 Solana 链上存储和管理机器人的状态数据。

## 📍 合约部署地址

- **Devnet:** `ARjXV5jAyB1t53WE4c3eEf6gftFnF7aiympwBCfSvVoY`
- **交易签名:** `4FGj6HfGyZzX9kAqUdvHBdFycYAKAt9QKQh1F6WXfU9zji8a7wcj9iBqsXvBhfE3JmWjwwe4DXXx7LXdvDHXffwf`

## 📋 功能

合约实现了多用户机器人状态管理系统，支持以下功能：

### 状态字段
- **mood** - 心情值
- **bond** - 亲密度
- **energy** - 能量值
- **streak** - 连续天数
- **quest** - 当前任务

### 指令

| 指令 | 功能 |
|------|------|
| `initialize(robot_id)` | 初始化机器人状态（每个用户独立 PDA 账户） |
| `update_state(mood_delta, bond_delta, energy_delta, streak_delta)` | 更新机器人状态 |
| `complete_quest()` | 完成当前任务 |

### PDA 账户设计

每个用户拥有独立的 PDA 账户，确保多用户状态隔离：
```
seeds = [b"state", authority.key(), robot_id.as_bytes()]
```

## 🛠️ 开发环境

### 环境要求
- Rust >= 1.84.0
- Solana CLI >= 1.18.0
- Anchor >= 0.30.0
- Node.js >= 18.x

### 安装依赖
```bash
# 安装 Rust 依赖
cargo build

# 安装 Node.js 依赖
yarn install
```

## 🚀 部署

### 部署到 Devnet
```bash
cd robot-contract
anchor deploy --provider.cluster devnet
```

### 部署到本地测试网
```bash
# 启动本地测试网
solana-test-validator &

# 部署合约
anchor deploy
```

## 🧪 测试

```bash
# 运行所有测试
anchor test

# 运行单个测试
anchor test -- --grep "initializes robot state"
```

## 📡 API 接口

合约通过 Anchor IDL 提供类型安全的接口调用：

```typescript
// 初始化机器人状态
await program.methods.initialize("robot-001").rpc();

// 更新状态
await program.methods.updateState(10, 5, -5, 1).rpc();

// 完成任务
await program.methods.completeQuest().rpc();

// 查询状态
const state = await program.account.robotState.fetch(pda);
```

## 📁 项目结构

```
robot-contract/
├── programs/
│   └── robot-contract/
│       └── src/
│           └── lib.rs          # 合约主代码
├── tests/
│   └── robot-contract.ts       # 测试文件
├── target/
│   └── deploy/                 # 编译产物
│       ├── robot_contract.so   # 合约二进制
│       └── robot_contract.json # IDL 文件
├── Anchor.toml                 # Anchor 配置
└── Cargo.toml                  # Rust 依赖配置
```

## 🔗 相关文档

- [CONTRACT_API.md](./CONTRACT_API.md) - 详细 API 文档
- [PRODUCT_DESIGN.md](../PRODUCT_DESIGN.md) - 产品设计文档
- [DEVELOPMENT_PLAN.md](../DEVELOPMENT_PLAN.md) - 开发计划
