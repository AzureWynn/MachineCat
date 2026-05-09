# 🐱 机械猫 Agent 跨链隐私支付 Demo - Solana 黑客松方案

> **黑客松主题**: Solana 链上 Agent 跨链隐私支付  
> **核心概念**: 自主 (x402) × 跨链 (LI.FI) × 私密 (MagicBlock PER) = Private Agentic Cross-chain Commerce

---

## 一、产品定位

### 1.1 为什么是 Solana？

```
Solana 优势:
├── 高速低费: 适合 Agent 频繁的小额支付
├── 生态成熟: 完善的 DeFi 和支付基础设施
├── 开发者友好: 丰富的 SDK 和工具链
└── 黑客松支持: 官方资源和奖金池
```

### 1.2 核心场景

```
用户输入: "我不想出门"
    ↓
机械猫 LLM 分析: 用户不想出门，需要买东西
    ↓
猫建议: "那我们先做一件很小的事，去楼下买瓶水，好吗？我帮你用 Solana 链上支付~"
    ↓
用户确认 → Agent 触发跨链隐私支付
    ↓
Ethereum (USDC) → Solana (USDC) 隐私转账
    ↓
链上状态更新 → 机械猫成长 (mood/bond/energy/streak)
    ↓
前端实时展示
```

### 1.3 技术原语组合

| 协议 | 能力 | 在本项目中的角色 |
|------|------|------------------|
| **x402** | Agent 自主支付 | 机械猫自主发起支付请求 |
| **LI.FI** | 跨链资产路由 | Ethereum → Solana 跨链桥接 |
| **MagicBlock PER** | 链上隐私支付 | Solana 端隐私保护，交易不可追踪 |

**三者叠加创造的新原语**:
```
自主 (x402) × 跨链 (LI.FI) × 私密 (MagicBlock PER)
= Private Agentic Cross-chain Commerce
```

---

## 二、状态设计

### 2.1 机器人状态字段

```javascript
// robot-state.js - MongoDB Schema
{
  robotId: { type: String, required: true, unique: true },
  
  // 核心状态
  mood: { type: Number, default: 50, min: 0, max: 100 },      // 心情值
  bond: { type: Number, default: 30, min: 0, max: 100 },      // 亲密度
  energy: { type: Number, default: 80, min: 0, max: 100 },    // 能量值
  streak: { type: Number, default: 0 },                        // 连续完成任务天数
  
  // 当前任务
  quest: {
    status: { type: String, enum: ['none', 'pending', 'active', 'completed', 'failed'], default: 'none' },
    type: { type: String },                                    // 任务类型: buy_water, buy_food, etc.
    description: { type: String },
    cost: { type: Number },                                    // 预计花费 (USDC)
    fromChain: { type: String },                               // 源链: ethereum
    toChain: { type: String },                                 // 目标链: solana
    createdAt: { type: Date },
    completedAt: { type: Date }
  },
  
  // 链上钱包地址
  wallet: {
    ethereum: { type: String },                                // ETH 钱包地址
    solana: { type: String }                                   // SOL 钱包地址
  }
}
```

### 2.2 支付记录

```javascript
// payment-record.js - MongoDB Schema
{
  robotId: { type: String, required: true },
  
  // 支付状态
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  
  // 支付详情
  amount: { type: Number },                                    // 支付金额
  currency: { type: String, default: 'USDC' },                 // 支付币种
  
  // 跨链信息
  fromChain: { type: String },                                 // 源链: ethereum
  toChain: { type: String },                                   // 目标链: solana
  fromTxHash: { type: String },                                // 源链交易哈希
  toTxHash: { type: String },                                  // 目标链交易哈希 (隐私交易)
  
  // 隐私保护
  isPrivate: { type: Boolean, default: true },                 // 是否启用隐私保护
  privacyProtocol: { type: String, default: 'MagicBlock-PER' },// 隐私协议
  
  // 时间戳
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
}
```

---

## 三、技术架构

### 3.1 后端架构

```
robot-server/
── src/
│   ├── core/
│   │   ├── robot-state/
│   │   │   ├── domain/
│   │   │   │   └── robot-state.js              # 状态模型
│   │   │   ── application/
│   │   │       ── state.service.js            # 状态管理服务
│   │   │
│   │   ├── quest-engine/
│   │   │   ├── domain/
│   │   │   │   └── quest.js                    # 任务模型
│   │   │   └── application/
│   │   │       └── quest.service.js            # 任务引擎
│   │   │
│   │   ├── ai-interaction/
│   │   │   ├── application/
│   │   │   │   ├── interaction.service.js      # [现有] 交互服务
│   │   │   │   ├── prompt-builder.js           # [增强] 添加任务生成
│   │   │   │   └── response-parser.js          # [增强] 解析任务响应
│   │   │   └── infrastructure/
│   │   │       └── llm.client.js               # [现有] LLM 客户端
│   │   │
│   │   └── blockchain/
│   │       ├── infrastructure/
│   │       │   ├── ethereum-client.js          # Ethereum RPC 客户端
│   │       │   ├── solana-client.js            # Solana RPC 客户端
│   │       │   ├── lifi-bridge.js              # LI.FI 跨链桥接器
│   │       │   └── magicblock-per.js           # MagicBlock 隐私支付
│   │       └── application/
│   │           └── payment.service.js          # 支付服务
│   │
│   └── infrastructure/
│       └── web/
│           └── routes/
│               ├── state.routes.js             # 状态 API
│               ├── quest.routes.js             # 任务 API
│               └── payment.routes.js           # 支付 API
```

### 3.2 前端架构

```
robot-app/
├── src/
│   ├── pages/
│   │   ├── QuestPage.js                        # 任务演示页 (主页面)
│   │   ├── ChatPage.js                         # [现有] 聊天页
│   │   └── Home.js                             # [现有] 首页
│   │
│   ├── components/
│   │   ├── RobotStateDisplay.js                # 状态展示组件
│   │   ├── QuestCard.js                        # 任务卡片组件
│   │   ├── PaymentStatus.js                    # 支付状态组件
│   │   ├── WalletConnect.js                    # 钱包连接组件
│   │   └── CrossChainAnimation.js              # 跨链动画组件
│   │
│   ├── services/
│   │   ├── api.js                              # [现有] API 服务
│   │   ├── blockchain.js                       # 区块链服务
│   │   ├── ethereum.js                         # Ethereum 钱包交互
│   │   └── solana.js                           # Solana 钱包交互
│   │
│   └── store/
│       └── store.js                            # [增强] 添加状态管理
```

### 3.3 数据流

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   用户输入   │────▶│   LLM 分析   │────▶│  任务生成    │
└─────────────┘     └──────────────┘     └──────────────┘
                                                │
                                                ▼
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  状态更新   │────│  链上写入    │◀────│  跨链支付    │
└─────────────┘     └──────────────┘     └──────────────
                                                │
                                                ▼
                                          ┌──────────────┐
                                          │  用户确认    │
                                          └──────────────┘
```

---

## 四、核心流程设计

### 4.1 完整交互流程

```
Step 1: 用户输入
├── 用户: "我不想出门"
└── 前端: 发送 POST /api/interaction/:robotId/chat

Step 2: LLM 分析 + 任务生成
├── Prompt Builder 构建增强 prompt
├── LLM 返回: 
│   {
│     "text": "外面太热了，我帮你从 Solana 链上买瓶水吧？只要 0.5 USDC",
│     "actions": [],
│     "quest": {
│       "type": "buy_water",
│       "description": "购买矿泉水",
│       "cost": 0.5,
│       "fromChain": "ethereum",
│       "toChain": "solana"
│     }
│   }
── 后端: 保存 quest 到数据库，状态设为 pending

Step 3: 前端展示任务卡片
├── 显示猫的文字回复
├── 显示任务卡片:
│   ┌─────────────────────────────┐
│   │ 🎯 任务: 购买矿泉水          │
│   │ 💰 花费: 0.5 USDC           │
│   │ 🔗 Ethereum → Solana        │
│   │ [确认支付] [取消]           │
│   └─────────────────────────────┘
└── 用户点击 "确认支付"

Step 4: 钱包连接 + 支付确认
├── 弹出钱包连接 (MetaMask / Phantom)
├── 显示支付详情:
│   - 源链: Ethereum
│   - 目标链: Solana
│   - 金额: 0.5 USDC
│   - 隐私保护: MagicBlock PER
└── 用户确认签名

Step 5: 跨链支付执行
├── 5.1 发起 LI.FI 跨链请求
│   └── Ethereum USDC → Solana USDC
├── 5.2 等待源链交易确认
├── 5.3 LI.FI 桥接处理
├── 5.4 Solana 端接收
└── 5.5 MagicBlock PER 隐私处理

Step 6: 链上状态更新
├── 更新 payment-record: status = success
├── 更新 robot-state:
│   ├── bond: +10 (亲密度提升)
│   ├── energy: -5 (消耗能量)
│   ├── mood: +5 (心情变好)
│   └── streak: +1 (连续任务)
└── quest 状态: completed

Step 7: 前端展示结果
├── 显示支付成功动画
├── 显示状态变化:
│   ┌───── ┌─────┐ ┌───── ┌─────┐
│   │Mood │ │Bond │ │Energy│ │Streak│
│   │ 55↑ │ │ 40↑ │ │ 75↓  │ │ 4↑   │
│   └─────┘ └─────┘ └─────┘ └─────┘
└── 猫回复: "水已经买好啦！我们的默契又增加了~"
```

### 4.2 支付状态机

```
pending ───────────────────────────────────────┐
   │                                           │
   │  用户确认 + 钱包签名                       │
   ▼                                           │
processing ── 跨链桥接处理 ──▶ success ◀────────┘
   │                          │
   │  错误/超时               │  状态更新
   ▼                          ▼
 failed                   completed
```

---

## 五、API 设计

### 5.1 状态 API

```
GET    /api/state/:robotId              # 获取机器人状态
PUT    /api/state/:robotId              # 更新机器人状态
GET    /api/state/:robotId/history      # 获取状态历史
```

### 5.2 任务 API

```
POST   /api/quest/:robotId              # 创建任务 (LLM 自动生成)
GET    /api/quest/:robotId/current      # 获取当前任务
PUT    /api/quest/:robotId/:questId/confirm  # 确认任务
PUT    /api/quest/:robotId/:questId/cancel   # 取消任务
GET    /api/quest/:robotId/history      # 获取任务历史
```

### 5.3 支付 API

```
POST   /api/payment/:robotId/initiate   # 发起支付
GET    /api/payment/:robotId/current    # 获取当前支付状态
GET    /api/payment/:robotId/history    # 获取支付历史
POST   /api/payment/:robotId/webhook    # LI.FI 回调 webhook
```

---

## 六、关键代码实现

### 6.1 Prompt Builder 增强

```javascript
// src/core/ai-interaction/application/prompt-builder.js

class PromptBuilder {
  buildPrompt(robotPersonality, userInput, robotState) {
    const { name, type, traits } = robotPersonality;
    const { mood, bond, energy, streak, quest } = robotState;

    const traitsDescription = this.formatTraits(traits);
    const stateDescription = this.formatState(robotState);

    const prompt = `你是一个名为 ${name} 的机器猫，你的种类是 ${type}。

你的性格特征：
${traitsDescription}

当前状态：
${stateDescription}

### 任务生成规则：
1. 当用户表达需求或困难时，生成一个帮助任务
2. 任务必须是合理的、可执行的
3. 任务花费应该在 0.1 - 5 USDC 之间
4. 跨链路径固定: Ethereum → Solana

### 情感与回复准则：
1. 情感识别：分析用户情绪并适当回应
2. 性格化反馈：回复风格符合性格特征
3. 绝对禁止：不说教、不批评、不冷漠

用户输入：${userInput}

你必须严格按照以下 JSON 格式回复：
{
  "text": "你的回复内容",
  "actions": [],
  "quest": {
    "type": "任务类型",
    "description": "任务描述",
    "cost": 0.5,
    "fromChain": "ethereum",
    "toChain": "solana"
  }
}

如果没有任务，quest 设为 null。
只返回 JSON，不要有其他内容。`;

    return prompt;
  }

  formatState(state) {
    return `- 心情: ${state.mood}/100
- 亲密度: ${state.bond}/100
- 能量: ${state.energy}/100
- 连续任务: ${state.streak} 天
- 当前任务: ${state.quest?.status || '无'}`;
  }

  formatTraits(traits) {
    if (!traits || Object.keys(traits).length === 0) {
      return '（未设定特殊性格特征）';
    }
    return Object.entries(traits)
      .map(([trait, value]) => `- ${trait}: ${value}%`)
      .join('\n');
  }
}

module.exports = PromptBuilder;
```

### 6.2 Response Parser 增强

```javascript
// src/core/ai-interaction/application/response-parser.js

class ResponseParser {
  parse(llmResponse) {
    // ... 现有解析逻辑 ...

    // 新增：解析 quest
    let quest = null;
    if (parsed.quest && parsed.quest !== null) {
      quest = {
        type: parsed.quest.type,
        description: parsed.quest.description,
        cost: parsed.quest.cost,
        fromChain: parsed.quest.fromChain || 'ethereum',
        toChain: parsed.quest.toChain || 'solana'
      };
    }

    return {
      text: parsed.text,
      actions: parsed.actions || [],
      quest: quest
    };
  }
}

module.exports = ResponseParser;
```

### 6.3 支付服务核心

```javascript
// src/core/blockchain/application/payment.service.js

const PaymentRecord = require('../domain/payment-record');
const RobotState = require('../../robot-state/domain/robot-state');
const LifiBridge = require('../infrastructure/lifi-bridge');
const MagicBlockPER = require('../infrastructure/magicblock-per');

class PaymentService {
  constructor() {
    this.lifiBridge = new LifiBridge();
    this.magicBlock = new MagicBlockPER();
  }

  async initiatePayment(robotId, quest) {
    console.log(`[Payment] 发起支付: robotId=${robotId}, quest=${quest.type}`);

    // 1. 创建支付记录
    const payment = await PaymentRecord.create({
      robotId,
      status: 'pending',
      amount: quest.cost,
      currency: 'USDC',
      fromChain: quest.fromChain,
      toChain: quest.toChain,
      isPrivate: true,
      privacyProtocol: 'MagicBlock-PER'
    });

    console.log(`[Payment] 支付记录已创建: ${payment._id}`);

    return {
      paymentId: payment._id,
      status: 'pending',
      amount: quest.cost,
      fromChain: quest.fromChain,
      toChain: quest.toChain
    };
  }

  async executePayment(paymentId, walletSignatures) {
    console.log(`[Payment] 执行支付: paymentId=${paymentId}`);

    const payment = await PaymentRecord.findById(paymentId);
    if (!payment) throw new Error('Payment not found');

    payment.status = 'processing';
    await payment.save();

    try {
      // 2. 通过 LI.FI 执行跨链
      console.log(`[Payment] 调用 LI.FI 跨链桥...`);
      const crossChainResult = await this.lifiBridge.execute({
        fromChain: payment.fromChain,
        toChain: payment.toChain,
        fromToken: 'USDC',
        toToken: 'USDC',
        amount: payment.amount,
        fromAddress: walletSignatures.ethereum,
        toAddress: walletSignatures.solana
      });

      payment.fromTxHash = crossChainResult.fromTxHash;
      console.log(`[Payment] 源链交易: ${crossChainResult.fromTxHash}`);

      // 3. Solana 端隐私处理
      console.log(`[Payment] 调用 MagicBlock PER 隐私处理...`);
      const privacyResult = await this.magicBlock.processPrivateTransfer({
        chain: 'solana',
        txHash: crossChainResult.toTxHash,
        amount: payment.amount,
        recipient: walletSignatures.solana
      });

      payment.toTxHash = privacyResult.privateTxHash;
      payment.status = 'success';
      payment.completedAt = new Date();
      await payment.save();

      console.log(`[Payment] 支付成功: ${payment._id}`);

      // 4. 更新机器人状态
      await this.updateRobotStateAfterPayment(payment.robotId, payment.amount);

      return {
        status: 'success',
        paymentId: payment._id,
        fromTxHash: payment.fromTxHash,
        toTxHash: payment.toTxHash
      };

    } catch (error) {
      console.error(`[Payment] 支付失败:`, error);
      payment.status = 'failed';
      await payment.save();
      throw error;
    }
  }

  async updateRobotStateAfterPayment(robotId, amount) {
    console.log(`[Payment] 更新机器人状态: robotId=${robotId}`);

    const state = await RobotState.findOne({ robotId });
    if (!state) throw new Error('Robot state not found');

    // 状态变化规则
    state.bond = Math.min(100, state.bond + 10);      // 亲密度 +10
    state.energy = Math.max(0, state.energy - 5);     // 能量 -5
    state.mood = Math.min(100, state.mood + 5);       // 心情 +5
    state.streak += 1;                                 // 连续任务 +1

    await state.save();

    console.log(`[Payment] 状态更新完成:`, {
      bond: state.bond,
      energy: state.energy,
      mood: state.mood,
      streak: state.streak
    });

    return state;
  }
}

module.exports = PaymentService;
```

### 6.4 LI.FI 跨链桥接器

```javascript
// src/core/blockchain/infrastructure/lifi-bridge.js

const axios = require('axios');

class LifiBridge {
  constructor() {
    this.apiUrl = process.env.LIFI_API_URL || 'https://li.quest/v1';
    this.apiKey = process.env.LIFI_API_KEY;
  }

  async getQuote(params) {
    const { fromChain, toChain, fromToken, toToken, amount, fromAddress, toAddress } = params;

    const response = await axios.get(`${this.apiUrl}/quote`, {
      params: {
        fromChain,
        toChain,
        fromToken,
        toToken,
        fromAmount: amount * 1e6, // USDC 6 decimals
        fromAddress,
        toAddress
      },
      headers: { 'x-api-key': this.apiKey }
    });

    return response.data;
  }

  async execute(params) {
    console.log(`[LI.FI] 获取跨链报价...`);
    const quote = await this.getQuote(params);

    console.log(`[LI.FI] 报价结果:`, {
      estimate: quote.estimate,
      tool: quote.tool,
      gasCosts: quote.gasCosts
    });

    // 实际执行需要前端钱包签名
    // 这里返回交易数据供前端签名
    return {
      quote,
      fromTxHash: null, // 前端签名后填入
      toTxHash: null,   // 桥接完成后填入
      status: 'awaiting_signature'
    };
  }
}

module.exports = LifiBridge;
```

### 6.5 MagicBlock PER 隐私支付

```javascript
// src/core/blockchain/infrastructure/magicblock-per.js

const axios = require('axios');

class MagicBlockPER {
  constructor() {
    this.apiUrl = process.env.MAGICBLOCK_API_URL;
    this.apiKey = process.env.MAGICBLOCK_API_KEY;
  }

  async processPrivateTransfer(params) {
    const { chain, txHash, amount, recipient } = params;

    console.log(`[MagicBlock] 处理隐私转账...`);
    console.log(`[MagicBlock] 链: ${chain}, 金额: ${amount}, 接收者: ${recipient}`);

    // 调用 MagicBlock PER API 进行隐私处理
    const response = await axios.post(`${this.apiUrl}/private-transfer`, {
      chain,
      originalTxHash: txHash,
      amount,
      recipient,
      privacyLevel: 'full'
    }, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`[MagicBlock] 隐私处理完成:`, response.data);

    return {
      privateTxHash: response.data.privateTxHash,
      status: response.data.status,
      privacyProof: response.data.proof
    };
  }
}

module.exports = MagicBlockPER;
```

### 6.6 前端状态展示组件

```javascript
// src/components/RobotStateDisplay.js

import { useStore } from '../store/store';

function RobotStateDisplay() {
  const { robotState } = useStore();

  if (!robotState) return null;

  const states = [
    { key: 'mood', label: '心情', icon: '😊', color: '#FFD93D' },
    { key: 'bond', label: '亲密度', icon: '❤️', color: '#FF6B6B' },
    { key: 'energy', label: '能量', icon: '⚡', color: '#4ECDC4' },
    { key: 'streak', label: '连续任务', icon: '🔥', color: '#FF8C42' }
  ];

  return (
    <div style={styles.container}>
      {states.map(({ key, label, icon, color }) => (
        <div key={key} style={styles.stateCard}>
          <div style={styles.icon}>{icon}</div>
          <div style={styles.label}>{label}</div>
          <div style={{ ...styles.value, color }}>
            {robotState[key]}
            {key !== 'streak' && <span style={styles.max}>/100</span>}
          </div>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${key === 'streak' ? Math.min(100, robotState[key] * 10) : robotState[key]}%`,
                backgroundColor: color
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    gap: '16px',
    padding: '16px',
    justifyContent: 'center'
  },
  stateCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    minWidth: '100px'
  },
  icon: { fontSize: '24px', marginBottom: '8px' },
  label: { fontSize: '12px', color: '#666', marginBottom: '4px' },
  value: { fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' },
  max: { fontSize: '12px', color: '#999' },
  progressBar: {
    height: '4px',
    backgroundColor: '#eee',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.5s ease'
  }
};

export default RobotStateDisplay;
```

### 6.7 任务卡片组件

```javascript
// src/components/QuestCard.js

function QuestCard({ quest, onConfirm, onCancel }) {
  if (!quest || quest.status === 'none') return null;

  const chainIcons = {
    ethereum: '⟠',
    solana: '◎'
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.icon}>🎯</span>
        <span style={styles.title}>任务建议</span>
      </div>

      <div style={styles.content}>
        <div style={styles.description}>{quest.description}</div>

        <div style={styles.details}>
          <div style={styles.detailRow}>
            <span style={styles.label}>花费:</span>
            <span style={styles.value}>{quest.cost} USDC</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.label}>跨链:</span>
            <span style={styles.value}>
              {chainIcons[quest.fromChain]} {quest.fromChain}
              <span style={styles.arrow}> → </span>
              {chainIcons[quest.toChain]} {quest.toChain}
            </span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.label}>隐私:</span>
            <span style={styles.value}>🔒 MagicBlock PER</span>
          </div>
        </div>
      </div>

      <div style={styles.actions}>
        <button style={styles.confirmBtn} onClick={onConfirm}>
          确认支付
        </button>
        <button style={styles.cancelBtn} onClick={onCancel}>
          取消
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '20px',
    margin: '16px 0',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    border: '2px solid #4ECDC4'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px'
  },
  icon: { fontSize: '24px' },
  title: { fontSize: '18px', fontWeight: 'bold' },
  content: { marginBottom: '16px' },
  description: { fontSize: '14px', color: '#333', marginBottom: '12px' },
  details: { backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '12px' },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 0'
  },
  label: { color: '#666', fontSize: '13px' },
  value: { color: '#333', fontSize: '13px', fontWeight: '500' },
  arrow: { color: '#4ECDC4', margin: '0 4px' },
  actions: { display: 'flex', gap: '12px' },
  confirmBtn: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#4ECDC4',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#fff',
    color: '#666',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer'
  }
};

export default QuestCard;
```

### 6.8 支付状态组件

```javascript
// src/components/PaymentStatus.js

function PaymentStatus({ payment }) {
  if (!payment) return null;

  const statusConfig = {
    pending: { icon: '', text: '等待确认', color: '#FFD93D' },
    processing: { icon: '🔄', text: '跨链处理中', color: '#4ECDC4' },
    success: { icon: '✅', text: '支付成功', color: '#4CAF50' },
    failed: { icon: '', text: '支付失败', color: '#FF6B6B' }
  };

  const { icon, text, color } = statusConfig[payment.status] || statusConfig.pending;

  return (
    <div style={{ ...styles.container, borderColor: color }}>
      <div style={styles.header}>
        <span style={styles.icon}>{icon}</span>
        <span style={{ ...styles.status, color }}>{text}</span>
      </div>

      {payment.status === 'processing' && (
        <div style={styles.progress}>
          <div style={styles.step}>
            <span style={styles.stepIcon}>⟠</span>
            <span>Ethereum</span>
          </div>
          <div style={styles.arrow}>→</div>
          <div style={styles.step}>
            <span style={styles.stepIcon}>◎</span>
            <span>Solana</span>
          </div>
          <div style={styles.arrow}>→</div>
          <div style={styles.step}>
            <span style={styles.stepIcon}></span>
            <span>隐私保护</span>
          </div>
        </div>
      )}

      <div style={styles.details}>
        <div>金额: {payment.amount} USDC</div>
        {payment.fromTxHash && (
          <div style={styles.hash}>
            源链交易: {payment.fromTxHash.slice(0, 10)}...{payment.fromTxHash.slice(-8)}
          </div>
        )}
        {payment.toTxHash && (
          <div style={styles.hash}>
            目标链交易: {payment.toTxHash.slice(0, 10)}...{payment.toTxHash.slice(-8)}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '16px',
    margin: '16px 0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '2px solid'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px'
  },
  icon: { fontSize: '20px' },
  status: { fontSize: '16px', fontWeight: 'bold' },
  progress: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    marginBottom: '12px'
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px'
  },
  stepIcon: { fontSize: '20px' },
  arrow: { fontSize: '16px', color: '#4ECDC4' },
  details: { fontSize: '13px', color: '#666' },
  hash: {
    fontFamily: 'monospace',
    backgroundColor: '#f0f0f0',
    padding: '4px 8px',
    borderRadius: '4px',
    marginTop: '4px'
  }
};

export default PaymentStatus;
```

---

## 七、开发实施计划

### Phase 1: 基础状态管理 (2-3 小时)

**目标**: 实现机器人状态存储和查询

- [ ] 创建 `robot-state.js` 数据模型
- [ ] 实现 `state.service.js` CRUD 操作
- [ ] 添加 `/api/state/:robotId` REST API
- [ ] 前端集成 `RobotStateDisplay` 组件
- [ ] 更新 store.js 添加 robotState 状态

### Phase 2: 任务引擎 (2-3 小时)

**目标**: 实现 LLM 驱动的任务生成和状态机

- [ ] 创建 `quest.js` 数据模型
- [ ] 实现 `quest.service.js` 任务生命周期管理
- [ ] 修改 `prompt-builder.js` 添加任务生成逻辑
- [ ] 修改 `response-parser.js` 解析任务响应
- [ ] 修改 `interaction.service.js` 处理任务
- [ ] 前端添加 `QuestCard` 组件
- [ ] 添加任务确认/取消 API

### Phase 3: 支付集成 (3-4 小时)

**目标**: 实现跨链支付流程

- [ ] 创建 `payment-record.js` 数据模型
- [ ] 实现 `payment.service.js` 支付服务
- [ ] 实现 `lifi-bridge.js` LI.FI 集成
- [ ] 实现 `magicblock-per.js` 隐私支付
- [ ] 添加支付 API routes
- [ ] 前端添加 `PaymentStatus` 组件
- [ ] 前端添加钱包连接功能 (MetaMask + Phantom)
- [ ] 实现支付流程端到端测试

### Phase 4: 完整链路打通 (2-3 小时)

**目标**: 端到端流程测试

- [ ] 串联完整流程: 输入 → LLM → 任务 → 确认 → 支付 → 状态更新
- [ ] 添加错误处理和重试机制
- [ ] 创建 `QuestPage.js` 主演示页面
- [ ] 添加跨链动画效果
- [ ] 完整测试和调试
- [ ] 准备演示脚本

---

## 八、环境变量配置

```bash
# .env

# 数据库
MONGODB_URI=mongodb://localhost:27017/robot-cat

# LLM
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4

# LI.FI
LIFI_API_URL=https://li.quest/v1
LIFI_API_KEY=your-lifi-api-key

# MagicBlock
MAGICBLOCK_API_URL=https://api.magicblock.gg
MAGICBLOCK_API_KEY=your-magicblock-api-key

# 区块链 RPC
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your-key
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# 服务器
PORT=3000
HTTPS_PORT=3002
ROBOT_IP=192.168.4.1
```

---

## 九、依赖包安装

### 后端新增依赖

```bash
cd robot-server
npm install @solana/web3.js ethers viem @lifi/sdk
```

### 前端新增依赖

```bash
cd robot-app
npm install @solana/wallet-adapter-react @solana/wallet-adapter-wallets @solana/wallet-adapter-react-ui @wagmi/core wagmi viem @rainbow-me/rainbowkit
```

---

## 十、演示脚本

### 10.1 演示流程

```
1. 打开应用，展示机械猫主页
   - 展示当前状态: mood/bond/energy/streak

2. 进入聊天页面
   - 输入: "我不想出门"
   - 展示 LLM 回复和任务卡片

3. 点击 "确认支付"
   - 弹出钱包连接
   - 展示跨链支付详情

4. 确认支付
   - 展示支付进度动画
   - Ethereum → Solana → 隐私保护

5. 支付成功
   - 展示状态变化动画
   - 猫回复感谢

6. 总结技术亮点
   - x402: Agent 自主发起支付
   - LI.FI: 跨链资产路由
   - MagicBlock PER: 链上隐私保护
```

### 10.2 技术亮点说明

```
 核心创新点:

1. Agent 自主支付 (x402)
   - 机械猫自主判断用户需求
   - 自主生成支付任务
   - 无需人工干预的支付决策

2. 跨链资产路由 (LI.FI)
   - Ethereum → Solana 无缝跨链
   - 最优路径自动选择
   - 多链资产统一管理

3. 链上隐私保护 (MagicBlock PER)
   - 交易金额隐私保护
   - 交易双方隐私保护
   - 符合 Solana 生态标准

4. 情感化交互
   - LLM 驱动的性格化回复
   - 状态系统增强用户粘性
   - 成长机制激励持续使用
```

---

## 十一、风险与应对

### 11.1 技术风险

| 风险 | 影响 | 应对方案 |
|------|------|----------|
| LI.FI API 不稳定 | 跨链失败 | 添加重试机制和降级方案 |
| MagicBlock PER 集成复杂 | 隐私功能无法实现 | 先用模拟数据，后期接入 |
| 钱包连接兼容性问题 | 用户无法支付 | 支持多种钱包，提供详细指引 |
| Solana 网络拥堵 | 交易延迟 | 添加超时处理和状态轮询 |

### 11.2 演示风险

| 风险 | 应对方案 |
|------|----------|
| 实时跨链太慢 | 准备录屏备用 |
| 钱包签名失败 | 准备测试账号 |
| LLM 回复不稳定 | 准备固定回复模板 |
| 网络问题 | 本地部署所有服务 |

---

## 十二、后续扩展方向

### 12.1 短期优化

- [ ] 支持更多任务类型
- [ ] 添加任务市场 (用户发布任务，Agent 接单)
- [ ] 优化 UI/UX 和动画效果
- [ ] 添加声音反馈

### 12.2 中期扩展

- [ ] 支持更多链 (Arbitrum, Optimism, BSC)
- [ ] 集成更多隐私协议
- [ ] 添加 Agent 技能市场
- [ ] 多机械猫协作

### 12.3 长期愿景

- [ ] 去中心化 Agent 网络
- [ ] Agent 经济系统
- [ ] 跨链隐私计算
- [ ] Agent DAO 治理

---

## 十三、项目文件结构总览

```
MachineCat/
├── robot-server/
│   ├── src/
│   │   ├── core/
│   │   │   ├── robot-state/                    # [新增] 状态管理
│   │   │   ├── quest-engine/                   # [新增] 任务引擎
│   │   │   ├── ai-interaction/                 # [增强] AI 交互
│   │   │   └── blockchain/                     # [新增] 区块链模块
│   │   └── infrastructure/
│   │       └── web/
│   │           └── routes/                     # [新增] API 路由
│   └── package.json                            # [更新] 新增依赖
│
├── robot-app/
│   ├── src/
│   │   ├── pages/
│   │   │   └── QuestPage.js                    # [新增] 任务演示页
│   │   ├── components/                         # [新增] 新组件
│   │   ├── services/                           # [新增] 区块链服务
│   │   └── store/
│   │       └── store.js                        # [增强] 状态管理
│   └── package.json                            # [更新] 新增依赖
│
└── PRODUCT_DESIGN.md                           # [本文档]
```

---

## 十四、总结

本方案为 Solana 黑客松设计了一个完整的 Agent 跨链隐私支付 Demo，核心特点：

✅ **聚焦单一场景**: "不想出门 → 买水 → 支付 → 成长"  
✅ **最小状态字段**: mood/bond/energy/streak/quest  
✅ **清晰支付路径**: Ethereum → Solana + MagicBlock PER 隐私  
✅ **完整技术闭环**: 输入 → LLM → 任务 → 确认 → 支付 → 状态更新  
✅ **突出黑客松主题**: x402 + LI.FI + MagicBlock PER 三者组合创新  

**核心价值主张**:
> 通过机械猫 Agent 展示 AI 自主支付的未来形态，结合跨链桥接和隐私保护技术，实现真正的 Private Agentic Cross-chain Commerce。

---

*文档版本: v1.0*  
*最后更新: 2026-05-09*  
*适用于: Solana 黑客松*
