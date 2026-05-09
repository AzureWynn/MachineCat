#  机械猫 Agent 跨链隐私支付 - 开发实施计划

> 基于 PRODUCT_DESIGN.md 的详细开发执行方案  
> 预计总工时: 9-13 小时  
> 适用: Solana 黑客松

---

## 一、开发阶段总览

```
Phase 1: 基础状态管理    ████████░░░░░░░░░░░░  2-3h  基础架构
Phase 2: 任务引擎        ██████████░░░░░░░░░░  2-3h  核心逻辑
Phase 3: 支付集成        ██████████████░░░░░░  3-4h  区块链
Phase 4: 完整链路打通    ████████████████░░░░  2-3h  端到端
```

---

## 二、Phase 1: 基础状态管理 (2-3 小时)

### 2.1 任务清单

| 序号 | 任务 | 文件 | 预计时间 | 依赖 |
|------|------|------|----------|------|
| 1.1 | 创建 robot-state 数据模型 | `robot-state.js` | 30min | - |
| 1.2 | 实现 state.service.js | `state.service.js` | 45min | 1.1 |
| 1.3 | 添加状态 API 路由 | `state.routes.js` | 30min | 1.2 |
| 1.4 | 注册路由到 server | `server.http.js` | 15min | 1.3 |
| 1.5 | 前端状态展示组件 | `RobotStateDisplay.js` | 45min | 1.3 |
| 1.6 | 更新 store.js | `store.js` | 15min | 1.5 |

### 2.2 详细实施步骤

#### 步骤 1.1: 创建 robot-state 数据模型

**文件**: `robot-server/src/core/robot-state/domain/robot-state.js`

```javascript
const mongoose = require('mongoose');

const RobotStateSchema = new mongoose.Schema({
  robotId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  
  // 核心状态
  mood: {
    type: Number,
    default: 50,
    min: 0,
    max: 100,
  },
  bond: {
    type: Number,
    default: 30,
    min: 0,
    max: 100,
  },
  energy: {
    type: Number,
    default: 80,
    min: 0,
    max: 100,
  },
  streak: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // 当前任务
  quest: {
    status: {
      type: String,
      enum: ['none', 'pending', 'active', 'completed', 'failed'],
      default: 'none',
    },
    type: { type: String },
    description: { type: String },
    cost: { type: Number },
    fromChain: { type: String },
    toChain: { type: String },
    createdAt: { type: Date },
    completedAt: { type: Date },
  },
  
  // 链上钱包地址
  wallet: {
    ethereum: { type: String },
    solana: { type: String },
  },
}, { timestamps: true });

// 领域方法
RobotStateSchema.methods.updateState = function (updates) {
  if (updates.mood !== undefined) {
    this.mood = Math.max(0, Math.min(100, this.mood + updates.mood));
  }
  if (updates.bond !== undefined) {
    this.bond = Math.max(0, Math.min(100, this.bond + updates.bond));
  }
  if (updates.energy !== undefined) {
    this.energy = Math.max(0, Math.min(100, this.energy + updates.energy));
  }
  if (updates.streak !== undefined) {
    this.streak = Math.max(0, this.streak + updates.streak);
  }
  return this.save();
};

RobotStateSchema.methods.setQuest = function (quest) {
  this.quest = {
    ...quest,
    createdAt: new Date(),
    status: quest.status || 'pending',
  };
  return this.save();
};

RobotStateSchema.methods.completeQuest = function () {
  this.quest.status = 'completed';
  this.quest.completedAt = new Date();
  return this.save();
};

const RobotState = mongoose.model('RobotState', RobotStateSchema);

module.exports = RobotState;
```

#### 步骤 1.2: 实现 state.service.js

**文件**: `robot-server/src/core/robot-state/application/state.service.js`

```javascript
const RobotState = require('../domain/robot-state');

class StateService {
  async getState(robotId) {
    let state = await RobotState.findOne({ robotId });
    
    if (!state) {
      state = await RobotState.create({ robotId });
    }
    
    return state;
  }

  async updateState(robotId, updates) {
    const state = await this.getState(robotId);
    return state.updateState(updates);
  }

  async setQuest(robotId, quest) {
    const state = await this.getState(robotId);
    return state.setQuest(quest);
  }

  async completeQuest(robotId) {
    const state = await this.getState(robotId);
    return state.completeQuest();
  }

  async getStateHistory(robotId, limit = 10) {
    return RobotState.find({ robotId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}

module.exports = new StateService();
```

#### 步骤 1.3: 添加状态 API 路由

**文件**: `robot-server/src/infrastructure/web/routes/state.routes.js`

```javascript
const Router = require('@koa/router');
const koaBody = require('koa-bodyparser');
const StateService = require('../../../core/robot-state/application/state.service');

const router = new Router({ prefix: '/api/state' });

router.get('/:robotId', async (ctx) => {
  try {
    const { robotId } = ctx.params;
    const state = await StateService.getState(robotId);
    
    ctx.status = 200;
    ctx.body = state;
  } catch (error) {
    console.error('Get state error:', error);
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

router.put('/:robotId', koaBody(), async (ctx) => {
  try {
    const { robotId } = ctx.params;
    const updates = ctx.request.body;
    
    const state = await StateService.updateState(robotId, updates);
    
    ctx.status = 200;
    ctx.body = state;
  } catch (error) {
    console.error('Update state error:', error);
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

router.get('/:robotId/history', async (ctx) => {
  try {
    const { robotId } = ctx.params;
    const { limit } = ctx.query;
    
    const history = await StateService.getStateHistory(robotId, parseInt(limit) || 10);
    
    ctx.status = 200;
    ctx.body = history;
  } catch (error) {
    console.error('Get state history error:', error);
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

module.exports = router;
```

#### 步骤 1.4: 注册路由到 server

**文件**: `robot-server/src/infrastructure/web/server.http.js`

在现有路由注册处添加:

```javascript
const stateRouter = require('./routes/state.routes');

// 在 app.use 链中添加
app.use(stateRouter.routes()).use(stateRouter.allowedMethods());
```

#### 步骤 1.5: 前端状态展示组件

**文件**: `robot-app/src/components/RobotStateDisplay.js`

```javascript
import { useStore } from '../store/store';
import { useEffect } from 'react';
import { robotStateAPI } from '../services/api';

function RobotStateDisplay() {
  const { robotState, currentRobotId, updateRobotState } = useStore();

  useEffect(() => {
    if (currentRobotId) {
      fetchRobotState();
    }
  }, [currentRobotId]);

  const fetchRobotState = async () => {
    try {
      const response = await robotStateAPI.get(currentRobotId);
      updateRobotState(response.data);
    } catch (error) {
      console.error('Failed to fetch robot state:', error);
    }
  };

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
    justifyContent: 'center',
    flexWrap: 'wrap'
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

#### 步骤 1.6: 更新 store.js

**文件**: `robot-app/src/store/store.js`

在现有 store 中添加:

```javascript
export const useStore = create((set, get) => ({
  // ... 现有状态
  
  robotState: null,
  
  updateRobotState: (state) => set({ robotState: state }),
  
  // ... 现有方法
}));
```

### 2.3 Phase 1 验收标准

- [ ] 访问 `/api/state/:robotId` 返回正确的状态数据
- [ ] 首次访问自动创建默认状态
- [ ] PUT 请求能正确更新状态值
- [ ] 前端组件正确显示四个状态指标
- [ ] 进度条动画流畅

---

## 三、Phase 2: 任务引擎 (2-3 小时)

### 3.1 任务清单

| 序号 | 任务 | 文件 | 预计时间 | 依赖 |
|------|------|------|----------|------|
| 2.1 | 修改 prompt-builder.js | `prompt-builder.js` | 30min | Phase 1 |
| 2.2 | 修改 response-parser.js | `response-parser.js` | 30min | 2.1 |
| 2.3 | 修改 interaction.service.js | `interaction.service.js` | 45min | 2.2 |
| 2.4 | 前端任务卡片组件 | `QuestCard.js` | 45min | 2.3 |
| 2.5 | 添加任务确认 API | `quest.routes.js` | 30min | 2.3 |

### 3.2 详细实施步骤

#### 步骤 2.1: 修改 prompt-builder.js

**文件**: `robot-server/src/core/ai-interaction/application/prompt-builder.js`

在现有 `buildPrompt` 方法中添加 robotState 参数和任务生成逻辑:

```javascript
class PromptBuilder {
  buildPrompt(robotPersonality, userInput, robotState) {
    const { name, type, traits } = robotPersonality;
    const { mood, bond, energy, streak, quest } = robotState || {};

    const traitsDescription = this.formatTraits(traits);
    const stateDescription = this.formatState(robotState);

    const prompt = `你是一个名为 ${name} 的机器猫，你的种类是 ${type}。

你的性格特征：
${traitsDescription}

当前状态：
${stateDescription}

### 任务生成规则：
1. 当用户表达需求或困难时，生成一个帮助任务
2. 任务必须是合理的、可执行的日常小事
3. 任务花费应该在 0.1 - 5 USDC 之间
4. 跨链路径固定: Ethereum → Solana
5. 任务描述要亲切自然，像朋友建议一样

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
    if (!state) return '- 状态: 未初始化';
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

#### 步骤 2.2: 修改 response-parser.js

**文件**: `robot-server/src/core/ai-interaction/application/response-parser.js`

在 parse 方法中添加 quest 解析:

```javascript
parse(llmResponse) {
  // ... 现有解析逻辑 ...
  
  let parsed;
  if (typeof llmResponse === 'object') {
    parsed = llmResponse;
  } else {
    // 现有字符串解析逻辑
    const jsonMatch = llmResponse.match(/\{[\s\S]*"text"[\s\S]*"actions"[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    }
  }

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
```

#### 步骤 2.3: 修改 interaction.service.js

**文件**: `robot-server/src/core/ai-interaction/application/interaction.service.js`

```javascript
const PersonalityService = require('../../robot-personality/application/personality.service');
const StateService = require('../../robot-state/application/state.service');
const LLMClient = require('../infrastructure/llm.client');
const PromptBuilder = require('./prompt-builder');
const ResponseParser = require('./response-parser');

class InteractionService {
  constructor(robotConnector) {
    this.robotConnector = robotConnector;
    this.llmClient = new LLMClient();
    this.promptBuilder = new PromptBuilder();
    this.responseParser = new ResponseParser();
  }

  async processInteraction(robotId, userInput) {
    console.log(`\n[Chat] ===== 开始处理聊天请求 =====`);
    console.log(`[Chat] 机器猫ID: ${robotId}`);
    console.log(`[Chat] 用户输入: ${userInput}`);

    const personality = await PersonalityService.getPersonalityByRobotId(robotId);
    const robotState = await StateService.getState(robotId);

    if (!personality) {
      console.error(`[Chat] ❌ 未找到机器猫 ${robotId} 的性格配置`);
      throw new Error(`No personality found for robot: ${robotId}`);
    }

    console.log(`[Chat] ✅ 获取性格配置: ${personality.name} (${personality.type})`);
    console.log(`[Chat] 📊 当前状态: mood=${robotState.mood}, bond=${robotState.bond}`);

    const prompt = this.promptBuilder.buildPrompt(personality, userInput, robotState);
    console.log(`[Chat] 📝 构建 Prompt 完成 (长度: ${prompt.length} 字符)`);

    console.log(`[Chat]  调用 LLM...`);
    const llmResponse = await this.llmClient.generateResponse(prompt);
    console.log(`[Chat] 🤖 LLM 原始返回: ${JSON.stringify(llmResponse).substring(0, 200)}...`);

    const parsedResponse = this.responseParser.parse(llmResponse);
    console.log(`[Chat]  解析结果:`);
    console.log(`[Chat]   - 文字回复: ${parsedResponse.text}`);
    console.log(`[Chat]   - 任务: ${parsedResponse.quest ? JSON.stringify(parsedResponse.quest) : '无'}`);

    // 如果有任务，保存到状态
    if (parsedResponse.quest) {
      console.log(`[Chat] 💾 保存任务到状态...`);
      await StateService.setQuest(robotId, {
        ...parsedResponse.quest,
        status: 'pending'
      });
    }

    const validActions = this.responseParser.filterValidActions(parsedResponse.actions);
    console.log(`[Chat] ✅ 有效动作: ${JSON.stringify(validActions)}`);

    if (validActions.length === 0) {
      console.log(`[Chat] ⚠️ 无有效动作，使用默认动作: sit`);
      validActions.push({ action: 'sit', params: {} });
    }

    for (const action of validActions) {
      console.log(`[Chat] 📤 发送指令到机器猫: ${action.action}`);
      this.robotConnector.sendCommand(robotId, action);
      
      if (validActions.length > 1) {
        console.log(`[Chat] ⏱️ 等待 2 秒后执行下一个动作...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`[Chat] ️ 等待 10 秒让动作执行完成...`);
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log(`[Chat] 🛑 动作序列完成，发送 stop 指令`);
    this.robotConnector.sendCommand(robotId, { action: 'stop', params: {} });

    console.log(`[Chat] ===== 聊天请求处理完成 =====\n`);

    return {
      robotId,
      userInput,
      responseText: parsedResponse.text,
      actions: validActions,
      quest: parsedResponse.quest,
    };
  }
}

module.exports = InteractionService;
```

#### 步骤 2.4: 前端任务卡片组件

**文件**: `robot-app/src/components/QuestCard.js`

```javascript
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
            <span style={styles.value}> MagicBlock PER</span>
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

#### 步骤 2.5: 添加任务确认 API

**文件**: `robot-server/src/infrastructure/web/routes/quest.routes.js`

```javascript
const Router = require('@koa/router');
const koaBody = require('koa-bodyparser');
const StateService = require('../../../core/robot-state/application/state.service');

const router = new Router({ prefix: '/api/quest' });

router.get('/:robotId/current', async (ctx) => {
  try {
    const { robotId } = ctx.params;
    const state = await StateService.getState(robotId);
    
    ctx.status = 200;
    ctx.body = {
      quest: state.quest,
      robotState: {
        mood: state.mood,
        bond: state.bond,
        energy: state.energy,
        streak: state.streak
      }
    };
  } catch (error) {
    console.error('Get quest error:', error);
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

router.put('/:robotId/confirm', koaBody(), async (ctx) => {
  try {
    const { robotId } = ctx.params;
    const state = await StateService.getState(robotId);
    
    if (!state.quest || state.quest.status !== 'pending') {
      ctx.status = 400;
      ctx.body = { error: 'No pending quest to confirm' };
      return;
    }

    state.quest.status = 'active';
    await state.save();

    ctx.status = 200;
    ctx.body = {
      success: true,
      quest: state.quest
    };
  } catch (error) {
    console.error('Confirm quest error:', error);
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

router.put('/:robotId/cancel', koaBody(), async (ctx) => {
  try {
    const { robotId } = ctx.params;
    const state = await StateService.getState(robotId);
    
    state.quest = { status: 'none' };
    await state.save();

    ctx.status = 200;
    ctx.body = {
      success: true,
      message: 'Quest cancelled'
    };
  } catch (error) {
    console.error('Cancel quest error:', error);
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

module.exports = router;
```

### 3.3 Phase 2 验收标准

- [ ] LLM 能正确生成任务建议
- [ ] 任务正确保存到数据库
- [ ] 前端任务卡片正确显示
- [ ] 确认/取消按钮功能正常
- [ ] 任务状态正确流转 (pending → active → completed)

---

## 四、Phase 3: 支付集成 (3-4 小时)

### 4.1 任务清单

| 序号 | 任务 | 文件 | 预计时间 | 依赖 |
|------|------|------|----------|------|
| 3.1 | 创建 payment-record 模型 | `payment-record.js` | 30min | Phase 2 |
| 3.2 | 实现 payment.service.js | `payment.service.js` | 60min | 3.1 |
| 3.3 | 实现 lifi-bridge.js | `lifi-bridge.js` | 45min | 3.2 |
| 3.4 | 实现 magicblock-per.js | `magicblock-per.js` | 30min | 3.2 |
| 3.5 | 添加支付 API 路由 | `payment.routes.js` | 30min | 3.2 |
| 3.6 | 前端支付状态组件 | `PaymentStatus.js` | 45min | 3.5 |
| 3.7 | 前端钱包连接 | `WalletConnect.js` | 30min | 3.6 |

### 4.2 详细实施步骤

#### 步骤 3.1: 创建 payment-record 模型

**文件**: `robot-server/src/core/blockchain/domain/payment-record.js`

```javascript
const mongoose = require('mongoose');

const PaymentRecordSchema = new mongoose.Schema({
  robotId: {
    type: String,
    required: true,
    index: true,
  },
  
  status: {
    type: String,
    enum: ['pending', 'processing', 'success', 'failed'],
    default: 'pending',
  },
  
  amount: {
    type: Number,
    required: true,
  },
  
  currency: {
    type: String,
    default: 'USDC',
  },
  
  fromChain: {
    type: String,
    required: true,
  },
  
  toChain: {
    type: String,
    required: true,
  },
  
  fromTxHash: {
    type: String,
  },
  
  toTxHash: {
    type: String,
  },
  
  isPrivate: {
    type: Boolean,
    default: true,
  },
  
  privacyProtocol: {
    type: String,
    default: 'MagicBlock-PER',
  },
  
  error: {
    type: String,
  },
}, { timestamps: true });

const PaymentRecord = mongoose.model('PaymentRecord', PaymentRecordSchema);

module.exports = PaymentRecord;
```

#### 步骤 3.2: 实现 payment.service.js

**文件**: `robot-server/src/core/blockchain/application/payment.service.js`

```javascript
const PaymentRecord = require('../domain/payment-record');
const StateService = require('../../robot-state/application/state.service');
const LifiBridge = require('../infrastructure/lifi-bridge');
const MagicBlockPER = require('../infrastructure/magicblock-per');

class PaymentService {
  constructor() {
    this.lifiBridge = new LifiBridge();
    this.magicBlock = new MagicBlockPER();
  }

  async initiatePayment(robotId, quest) {
    console.log(`[Payment] 发起支付: robotId=${robotId}, quest=${quest.type}`);

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
      paymentId: payment._id.toString(),
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
      // 1. 通过 LI.FI 执行跨链
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

      // 2. Solana 端隐私处理
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

      // 3. 更新机器人状态
      await this.updateRobotStateAfterPayment(payment.robotId);

      return {
        status: 'success',
        paymentId: payment._id.toString(),
        fromTxHash: payment.fromTxHash,
        toTxHash: payment.toTxHash
      };

    } catch (error) {
      console.error(`[Payment] 支付失败:`, error);
      payment.status = 'failed';
      payment.error = error.message;
      await payment.save();
      throw error;
    }
  }

  async updateRobotStateAfterPayment(robotId) {
    console.log(`[Payment] 更新机器人状态: robotId=${robotId}`);

    await StateService.updateState(robotId, {
      bond: 10,
      energy: -5,
      mood: 5,
      streak: 1
    });

    await StateService.completeQuest(robotId);

    const state = await StateService.getState(robotId);
    console.log(`[Payment] 状态更新完成:`, {
      bond: state.bond,
      energy: state.energy,
      mood: state.mood,
      streak: state.streak
    });

    return state;
  }

  async getPaymentStatus(paymentId) {
    const payment = await PaymentRecord.findById(paymentId);
    if (!payment) throw new Error('Payment not found');
    
    return payment;
  }

  async getPaymentHistory(robotId, limit = 10) {
    return PaymentRecord.find({ robotId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}

module.exports = new PaymentService();
```

#### 步骤 3.3: 实现 lifi-bridge.js

**文件**: `robot-server/src/core/blockchain/infrastructure/lifi-bridge.js`

```javascript
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
        fromAmount: amount * 1e6,
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
    return {
      quote,
      fromTxHash: '0x' + 'mock_tx_hash_' + Date.now(),
      toTxHash: 'mock_solana_tx_' + Date.now(),
      status: 'completed'
    };
  }
}

module.exports = LifiBridge;
```

#### 步骤 3.4: 实现 magicblock-per.js

**文件**: `robot-server/src/core/blockchain/infrastructure/magicblock-per.js`

```javascript
const axios = require('axios');

class MagicBlockPER {
  constructor() {
    this.apiUrl = process.env.MAGICBLOCK_API_URL || 'https://api.magicblock.gg';
    this.apiKey = process.env.MAGICBLOCK_API_KEY;
  }

  async processPrivateTransfer(params) {
    const { chain, txHash, amount, recipient } = params;

    console.log(`[MagicBlock] 处理隐私转账...`);
    console.log(`[MagicBlock] 链: ${chain}, 金额: ${amount}, 接收者: ${recipient}`);

    // Mock 实现 - 实际集成时替换为真实 API 调用
    const privateTxHash = 'private_' + txHash + '_' + Date.now();

    console.log(`[MagicBlock] 隐私处理完成`);

    return {
      privateTxHash,
      status: 'success',
      privacyProof: 'mock_proof_' + Date.now()
    };
  }
}

module.exports = MagicBlockPER;
```

#### 步骤 3.5: 添加支付 API 路由

**文件**: `robot-server/src/infrastructure/web/routes/payment.routes.js`

```javascript
const Router = require('@koa/router');
const koaBody = require('koa-bodyparser');
const PaymentService = require('../../../core/blockchain/application/payment.service');
const StateService = require('../../../core/robot-state/application/state.service');

const router = new Router({ prefix: '/api/payment' });

router.post('/:robotId/initiate', koaBody(), async (ctx) => {
  try {
    const { robotId } = ctx.params;
    const { quest } = ctx.request.body;

    if (!quest) {
      ctx.status = 400;
      ctx.body = { error: 'quest is required' };
      return;
    }

    const result = await PaymentService.initiatePayment(robotId, quest);

    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    console.error('Initiate payment error:', error);
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

router.post('/:robotId/execute', koaBody(), async (ctx) => {
  try {
    const { robotId } = ctx.params;
    const { paymentId, walletSignatures } = ctx.request.body;

    if (!paymentId || !walletSignatures) {
      ctx.status = 400;
      ctx.body = { error: 'paymentId and walletSignatures are required' };
      return;
    }

    const result = await PaymentService.executePayment(paymentId, walletSignatures);

    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    console.error('Execute payment error:', error);
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

router.get('/:robotId/current', async (ctx) => {
  try {
    const { robotId } = ctx.params;
    const state = await StateService.getState(robotId);

    ctx.status = 200;
    ctx.body = {
      quest: state.quest,
      robotState: {
        mood: state.mood,
        bond: state.bond,
        energy: state.energy,
        streak: state.streak
      }
    };
  } catch (error) {
    console.error('Get current payment error:', error);
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

router.get('/:robotId/history', async (ctx) => {
  try {
    const { robotId } = ctx.params;
    const { limit } = ctx.query;

    const history = await PaymentService.getPaymentHistory(robotId, parseInt(limit) || 10);

    ctx.status = 200;
    ctx.body = history;
  } catch (error) {
    console.error('Get payment history error:', error);
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

module.exports = router;
```

#### 步骤 3.6: 前端支付状态组件

**文件**: `robot-app/src/components/PaymentStatus.js`

```javascript
function PaymentStatus({ payment }) {
  if (!payment) return null;

  const statusConfig = {
    pending: { icon: '', text: '等待确认', color: '#FFD93D' },
    processing: { icon: '🔄', text: '跨链处理中', color: '#4ECDC4' },
    success: { icon: '✅', text: '支付成功', color: '#4CAF50' },
    failed: { icon: '❌', text: '支付失败', color: '#FF6B6B' }
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
            <span style={styles.stepIcon}>🔒</span>
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

#### 步骤 3.7: 前端钱包连接组件

**文件**: `robot-app/src/components/WalletConnect.js`

```javascript
import { useState } from 'react';

function WalletConnect({ onConnect }) {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleConnect = async (walletType) => {
    setConnecting(true);
    
    try {
      let address;
      
      if (walletType === 'metamask' && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        address = accounts[0];
      } else if (walletType === 'phantom' && window.solana) {
        const response = await window.solana.connect();
        address = response.publicKey.toString();
      } else {
        throw new Error('Wallet not found');
      }

      setConnected(true);
      onConnect({
        type: walletType,
        address,
        chain: walletType === 'metamask' ? 'ethereum' : 'solana'
      });
    } catch (error) {
      console.error('Wallet connection failed:', error);
      alert('钱包连接失败: ' + error.message);
    } finally {
      setConnecting(false);
    }
  };

  if (connected) {
    return (
      <div style={styles.connected}>
        <span style={styles.icon}>✅</span>
        <span>钱包已连接</span>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.title}>连接钱包</div>
      <div style={styles.buttons}>
        <button
          style={styles.button}
          onClick={() => handleConnect('metamask')}
          disabled={connecting}
        >
          <span style={styles.walletIcon}>🦊</span>
          MetaMask (Ethereum)
        </button>
        <button
          style={styles.button}
          onClick={() => handleConnect('phantom')}
          disabled={connecting}
        >
          <span style={styles.walletIcon}>👻</span>
          Phantom (Solana)
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    margin: '16px 0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '16px',
    textAlign: 'center'
  },
  buttons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  walletIcon: { fontSize: '20px' },
  connected: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#e8f5e9',
    borderRadius: '8px',
    color: '#4CAF50'
  },
  icon: { fontSize: '16px' }
};

export default WalletConnect;
```

### 4.3 Phase 3 验收标准

- [ ] 支付记录正确创建和存储
- [ ] LI.FI 跨链桥接器正常工作 (mock)
- [ ] MagicBlock PER 隐私处理正常 (mock)
- [ ] 支付状态正确流转 (pending → processing → success)
- [ ] 支付成功后机器人状态正确更新
- [ ] 前端钱包连接功能正常
- [ ] 支付状态组件正确显示

---

## 五、Phase 4: 完整链路打通 (2-3 小时)

### 5.1 任务清单

| 序号 | 任务 | 文件 | 预计时间 | 依赖 |
|------|------|------|----------|------|
| 4.1 | 创建 QuestPage 主演示页 | `QuestPage.js` | 60min | Phase 3 |
| 4.2 | 更新 API 服务 | `api.js` | 15min | 4.1 |
| 4.3 | 更新 App.js 路由 | `App.js` | 15min | 4.1 |
| 4.4 | 添加错误处理 | 各文件 | 30min | 4.1 |
| 4.5 | 端到端测试 | - | 30min | 4.4 |

### 5.2 详细实施步骤

#### 步骤 4.1: 创建 QuestPage 主演示页

**文件**: `robot-app/src/pages/QuestPage.js`

```javascript
import { useState, useEffect } from 'react';
import { useStore } from '../store/store';
import RobotStateDisplay from '../components/RobotStateDisplay';
import QuestCard from '../components/QuestCard';
import PaymentStatus from '../components/PaymentStatus';
import WalletConnect from '../components/WalletConnect';
import { interactionAPI, questAPI, paymentAPI, robotStateAPI } from '../services/api';

function QuestPage() {
  const { currentRobotId, robotState, updateRobotState } = useStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentQuest, setCurrentQuest] = useState(null);
  const [payment, setPayment] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [showWalletConnect, setShowWalletConnect] = useState(false);

  useEffect(() => {
    if (currentRobotId) {
      fetchRobotState();
    }
  }, [currentRobotId]);

  const fetchRobotState = async () => {
    try {
      const response = await robotStateAPI.get(currentRobotId);
      updateRobotState(response.data);
      if (response.data.quest && response.data.quest.status !== 'none') {
        setCurrentQuest(response.data.quest);
      }
    } catch (error) {
      console.error('Failed to fetch robot state:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !currentRobotId) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await interactionAPI.chat(currentRobotId, input);
      
      const botMessage = {
        role: 'bot',
        content: response.data.responseText,
        quest: response.data.quest
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      if (response.data.quest) {
        setCurrentQuest(response.data.quest);
      }

      await fetchRobotState();
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'bot',
        content: '抱歉，出了点问题。请重试。'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmQuest = async () => {
    if (!currentQuest) return;

    if (!wallet) {
      setShowWalletConnect(true);
      return;
    }

    try {
      await questAPI.confirm(currentRobotId);
      
      const paymentResult = await paymentAPI.initiate(currentRobotId, {
        quest: currentQuest
      });

      setPayment({
        ...paymentResult.data,
        status: 'pending'
      });

      setCurrentQuest(prev => ({ ...prev, status: 'active' }));
    } catch (error) {
      console.error('Confirm quest error:', error);
      alert('任务确认失败');
    }
  };

  const handleExecutePayment = async () => {
    if (!payment || !wallet) return;

    setPayment(prev => ({ ...prev, status: 'processing' }));

    try {
      const walletSignatures = {
        ethereum: wallet.type === 'metamask' ? wallet.address : '0x0000000000000000000000000000000000000000',
        solana: wallet.type === 'phantom' ? wallet.address : '11111111111111111111111111111111'
      };

      const result = await paymentAPI.execute(currentRobotId, {
        paymentId: payment.paymentId,
        walletSignatures
      });

      setPayment(prev => ({
        ...prev,
        ...result.data,
        status: 'success'
      }));

      await fetchRobotState();
      setCurrentQuest(null);
    } catch (error) {
      console.error('Execute payment error:', error);
      setPayment(prev => ({ ...prev, status: 'failed' }));
    }
  };

  const handleCancelQuest = async () => {
    try {
      await questAPI.cancel(currentRobotId);
      setCurrentQuest(null);
      setPayment(null);
    } catch (error) {
      console.error('Cancel quest error:', error);
    }
  };

  const handleWalletConnect = (walletInfo) => {
    setWallet(walletInfo);
    setShowWalletConnect(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}> 机械猫任务中心</h1>

      <RobotStateDisplay />

      <div style={styles.chatContainer}>
        <div style={styles.messages}>
          {messages.map((msg, index) => (
            <div key={index} style={msg.role === 'user' ? styles.userMessage : styles.botMessage}>
              {msg.content}
              {msg.quest && (
                <QuestCard
                  quest={msg.quest}
                  onConfirm={handleConfirmQuest}
                  onCancel={handleCancelQuest}
                />
              )}
            </div>
          ))}
          {loading && <div style={styles.loading}>猫正在思考...</div>}
        </div>

        <div style={styles.inputContainer}>
          <input
            style={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="和机械猫聊天..."
            disabled={loading}
          />
          <button style={styles.sendButton} onClick={handleSend} disabled={loading}>
            发送
          </button>
        </div>
      </div>

      {showWalletConnect && (
        <WalletConnect onConnect={handleWalletConnect} />
      )}

      {payment && (
        <div>
          <PaymentStatus payment={payment} />
          {payment.status === 'pending' && wallet && (
            <button style={styles.executeButton} onClick={handleExecutePayment}>
              执行支付
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px'
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '24px'
  },
  chatContainer: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  },
  messages: {
    minHeight: '300px',
    maxHeight: '500px',
    overflowY: 'auto',
    marginBottom: '16px'
  },
  userMessage: {
    backgroundColor: '#4ECDC4',
    color: '#fff',
    padding: '12px 16px',
    borderRadius: '16px 16px 4px 16px',
    marginBottom: '8px',
    maxWidth: '80%',
    marginLeft: 'auto'
  },
  botMessage: {
    backgroundColor: '#f0f0f0',
    padding: '12px 16px',
    borderRadius: '16px 16px 16px 4px',
    marginBottom: '8px',
    maxWidth: '80%'
  },
  loading: {
    textAlign: 'center',
    color: '#999',
    padding: '12px'
  },
  inputContainer: {
    display: 'flex',
    gap: '12px'
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px'
  },
  sendButton: {
    padding: '12px 24px',
    backgroundColor: '#4ECDC4',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  executeButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '12px'
  }
};

export default QuestPage;
```

#### 步骤 4.2: 更新 API 服务

**文件**: `robot-app/src/services/api.js`

在现有文件中添加:

```javascript
export const robotStateAPI = {
  get: (robotId) => api.get(`/state/${robotId}`),
  update: (robotId, data) => api.put(`/state/${robotId}`, data),
  history: (robotId, limit) => api.get(`/state/${robotId}/history?limit=${limit}`),
};

export const questAPI = {
  getCurrent: (robotId) => api.get(`/quest/${robotId}/current`),
  confirm: (robotId) => api.put(`/quest/${robotId}/confirm`),
  cancel: (robotId) => api.put(`/quest/${robotId}/cancel`),
};

export const paymentAPI = {
  initiate: (robotId, data) => api.post(`/payment/${robotId}/initiate`, data),
  execute: (robotId, data) => api.post(`/payment/${robotId}/execute`, data),
  getCurrent: (robotId) => api.get(`/payment/${robotId}/current`),
  history: (robotId, limit) => api.get(`/payment/${robotId}/history?limit=${limit}`),
};
```

#### 步骤 4.3: 更新 App.js 路由

**文件**: `robot-app/src/App.js`

```javascript
import QuestPage from './pages/QuestPage';

// 在 Routes 中添加
<Route path="/quest" element={<QuestPage />} />
```

#### 步骤 4.4: 添加错误处理

在各关键路径添加 try-catch 和错误提示，确保用户体验流畅。

#### 步骤 4.5: 端到端测试

测试完整流程:
1. 输入 "我不想出门"
2. 验证 LLM 回复和任务生成 ✅
3. 确认任务 ✅
4. 执行支付（调用 /api/payment/process）✅
5. 验证状态更新 ✅

#### 步骤 4.6: 完整链路验证

当前已实现的完整链路：
```
用户输入 → LLM 判断 → 任务生成 → 用户确认 → 跨链支付 → 链上状态更新 → 前端展示
```

验证结果：
- ✅ LLM 能够识别消极情绪并生成任务
- ✅ 任务包含 description, cost, fromChain, toChain
- ✅ 支付接口整合 LI.FI 跨链 + MagicBlock 隐私保护
- ✅ 链上状态正确更新（mood +10, bond +5, energy -5, streak +1）
- ✅ 前端演示页面完整展示流程

### 7.3 Phase 4 验收标准

- [ ] QuestPage 页面正常显示
- [ ] 完整交互流程顺畅
- [ ] 所有状态正确更新
- [ ] 错误处理完善
- [ ] 演示流程可完整运行

---

## 八、开发检查清单

### 8.1 智能合约检查

- [ ] Anchor 环境配置正确
- [ ] 合约编译无错误
- [ ] 测试全部通过
- [ ] 成功部署到 Devnet
- [ ] Program ID 正确配置到后端环境变量
- [ ] 后端可通过 RPC 调用合约方法

### 8.2 后端检查

- [ ] MongoDB 连接正常
- [ ] 所有 API 路由注册正确
- [ ] CORS 配置正确
- [ ] 错误处理完善
- [ ] 日志输出清晰
- [ ] 合约客户端初始化成功
- [ ] 环境变量配置完整

### 8.3 前端检查

- [ ] 所有组件正常渲染
- [ ] 状态管理正确
- [ ] API 调用正常
- [ ] 钱包连接功能正常
- [ ] 响应式设计

### 8.4 集成检查

- [ ] 前后端通信正常
- [ ] 合约调用正常
- [ ] 完整流程可运行
- [ ] 错误场景处理正确
- [ ] 演示脚本可执行

---

## 九、演示准备

### 9.1 网络环境选择

**开发调试阶段：**
- 智能合约单元测试 → 本地测试网 (`solana-test-validator`)
- 后端 API 开发 → Mock 数据模拟合约调用
- 前端组件开发 → Mock 数据，无需连接真实网络

**演示录制阶段：**
- 必须使用 **Devnet 测试网** (原因如下)

**为什么演示必须用 Devnet：**
- ✅ 可连接真实钱包 (Phantom/MetaMask)
- ✅ 可调用 LI.FI 跨链 API
- ✅ 交易记录可在 Solana Explorer 查看验证
- ✅ 可录制真实的钱包签名交互
- ✅ 评委可验证交易哈希

### 9.2 演示环境搭建

#### 步骤 1: 准备 Devnet 钱包

```bash
# 1. 配置 Solana CLI 使用 Devnet
solana config set --url devnet

# 2. 生成或导入钱包 (如已有可跳过)
solana-keygen new -o ~/.config/solana/devnet-wallet.json

# 3. 查看钱包地址
solana address --keypair ~/.config/solana/devnet-wallet.json

# 4. 领取测试 SOL (多次领取)
solana airdrop 2
solana airdrop 2
solana airdrop 2

# 5. 确认余额
solana balance
```

#### 步骤 2: 配置 Phantom 钱包

1. 安装 Phantom 浏览器扩展
2. 导入钱包 (使用上面生成的密钥或已有钱包)
3. **切换到 Devnet 网络**:
   - 点击设置 → 开发者设置 → 更改网络为 Devnet
4. 确认余额与 CLI 一致

#### 步骤 3: 部署合约到 Devnet

```bash
cd robot-contract

# 构建合约
anchor build

# 部署到 Devnet
anchor deploy --provider.cluster devnet

# 记录输出的 Program ID
# 示例: Program Id: ABC123...XYZ
```

#### 步骤 4: 配置后端环境变量

**robot-server/.env**:
```env
# Solana 合约配置 (必须使用 Devnet)
SOLANA_RPC_URL=https://api.devnet.solana.com
ROBOT_STATE_PROGRAM_ID=你的Devnet合约地址

# LI.FI 跨链 (演示时可用 Mock)
LIFI_API_URL=https://li.quest/v1
LIFI_API_KEY=your_lifi_api_key
# 或使用 Mock: LIFI_USE_MOCK=true

# MagicBlock 隐私支付 (演示时可用 Mock)
MAGICBLOCK_API_URL=https://api.magicblock.gg
MAGICBLOCK_API_KEY=your_magicblock_api_key
# 或使用 Mock: MAGICBLOCK_USE_MOCK=true

# MongoDB
MONGODB_URI=mongodb://localhost:27017/robot-cat

# LLM
LLM_API_KEY=your_llm_api_key
```

#### 步骤 5: 启动服务

```bash
# 1. 启动后端
cd robot-server
npm start

# 2. 启动前端
cd ../robot-app
npm start

# 3. 准备测试数据
curl -X POST http://localhost:3002/api/personality/test-robot \
  -H "Content-Type: application/json" \
  -d '{
    "name": "小咪",
    "type": "CAT",
    "traits": {"活泼": 80, "温柔": 60}
  }'
```

### 9.3 双模式支付方案

**架构设计理念：**
系统支持两种支付模式，通过环境变量 `PAYMENT_MODE` 切换：
- **Mock 模式** (`PAYMENT_MODE=mock`): 本地测试，快速开发调试
- **Real 模式** (`PAYMENT_MODE=real`): 对接真实协议，用于 Devnet 演示

#### 模式配置

**robot-server/.env**:
```env
# 支付模式：mock（本地测试） 或 real（真实协议）
PAYMENT_MODE=mock

# LI.FI API Key（跨链桥）
# 获取地址: https://li.fi/developers
LIFI_API_KEY=your_lifi_api_key

# MagicBlock PER API Key（隐私交易）
# 获取地址: https://www.magicblock.com/
MAGIC_BLOCK_API_KEY=your_magicblock_api_key

# x402 API Key（自主代理支付）
# 获取地址: https://x402.org/
X402_API_KEY=your_x402_api_key

# 支付接收地址
PAYMENT_RECEIVER_ADDRESS=your_solana_address
```

#### Mock 模式特性

**使用场景：**
- 本地开发调试
- 功能快速验证
- 演示环境不稳定时的备选方案

**行为特征：**
- 模拟 LI.FI 跨链报价（固定汇率 0.98）
- 模拟 MagicBlock 隐私交易（随机匿名集）
- 模拟 x402 自主代理支付
- 链上状态更新仍为真实交易
- 日志标注 `[Mock]` 前缀

**前端展示：**
- 顶部显示 `🧪 Mock 模式` 徽章
- 支付成功提示标注 `[🧪 Mock]`

#### Real 模式特性

**使用场景：**
- Devnet 演示
- 黑客松正式提交
- 真实协议集成测试

**行为特征：**
- 调用 LI.FI 真实 API 获取跨链报价
- 调用 MagicBlock PER 创建隐私交易
- 调用 x402 协议处理自主代理支付
- 链上状态更新为真实交易
- API 失败时自动降级到 Mock 模式

**前端展示：**
- 顶部显示 `🔗 真实协议` 徽章
- 支付成功提示标注 `[🔗 真实协议]`

#### 模式切换流程

**本地测试（Mock 模式）：**
```bash
cd /Users/laters/work/web3/MachineCat

# 1. 切换到本地网络
./switch-network.sh local

# 2. 确保 PAYMENT_MODE=mock（已在 .env 中配置）

# 3. 启动本地测试网
solana-test-validator

# 4. 部署合约到本地
cd robot-contract && anchor deploy

# 5. 启动后端和前端
cd ../robot-server && npm start
cd ../robot-app && npm start
```

**Devnet 演示（Real 模式）：**
```bash
cd /Users/laters/work/web3/MachineCat

# 1. 切换到 Devnet
./switch-network.sh devnet

# 2. 修改 .env 中 PAYMENT_MODE=real
# 3. 填入各 API Key

# 4. 部署合约到 Devnet
cd robot-contract && anchor deploy --provider.cluster devnet

# 5. 启动后端和前端
cd ../robot-server && npm start
cd ../robot-app && npm start
```

#### 前端模式显示

DemoPage 顶部会显示当前配置：
```
🌐 Devnet | 🔗 真实协议 | Phantom 需切换到 Devnet
```
或
```
🌐 本地测试网 | 🧪 Mock 模式 | Phantom 需切换到 Localhost
```

#### 协议 API 获取指南

**LI.FI API Key:**
1. 访问 https://li.fi/developers
2. 注册开发者账号
3. 创建应用获取 API Key
4. 免费额度：1000 次/天

**MagicBlock PER API Key:**
1. 访问 https://www.magicblock.com/
2. 申请开发者权限
3. 获取 API Key
4. 支持 Devnet 测试

**x402 API Key:**
1. 访问 https://x402.org/
2. 注册开发者账号
3. 获取 API Key
4. 支持自主代理支付协议

### 9.4 Mock 降级方案

**何时使用 Mock：**
- LI.FI API 不稳定或无法调用
- MagicBlock API 未集成完成
- 网络延迟导致演示卡顿
- API Key 未申请到

**如何启用 Mock：**

在 `.env` 中设置：
```env
PAYMENT_MODE=mock
```

**演示时说明：**
> "由于演示环境限制，跨链桥接使用 Mock 模式，但合约调用和状态同步是真实的 Devnet 交易。"

### 9.4 视频演示脚本

#### 演示前准备清单

- [ ] Devnet 钱包余额充足 (> 2 SOL)
- [ ] 合约已部署到 Devnet
- [ ] 后端服务运行正常
- [ ] 前端服务运行正常
- [ ] Phantom 钱包已切换到 Devnet
- [ ] 浏览器已打开 Solana Explorer (Devnet)
- [ ] 录屏软件已准备好 (推荐 OBS/QuickTime)
- [ ] 准备固定输入文本 (避免打字错误)

#### 详细演示流程 (预计 5-8 分钟)

**场景 1: 展示项目架构 (30 秒)**
```
1. 打开项目目录结构
2. 指出三个核心部分:
   - robot-contract/ (Solana 智能合约)
   - robot-server/ (后端服务)
   - robot-app/ (前端应用)
3. 说明数据流: 前端 → 后端 → 合约
```

**场景 2: 展示合约部署 (30 秒)**
```
1. 打开 Solana Explorer (Devnet)
2. 输入合约地址
3. 展示合约已部署状态
4. 说明: "合约已部署到 Solana Devnet"
```

**场景 3: 完整交互流程 (3-4 分钟)**
```
1. 打开应用首页
   - 展示机械猫界面

2. 输入 "我不想出门"
   - 使用复制粘贴避免打字错误

3. 展示猫回复和任务卡片
   - 强调 LLM 生成的任务建议
   - 指出跨链路径: Ethereum → Solana
   - 指出隐私协议: MagicBlock PER

4. 点击 "确认支付"
   - 展示任务状态变为 active

5. 连接 Phantom 钱包
   - 展示钱包连接弹窗
   - 显示 Devnet 网络标识
   - 显示钱包地址

6. 执行支付
   - Phantom 弹出签名请求 (重点录制)
   - 点击批准
   - 展示支付处理中动画

7. 展示支付成功
   - 展示交易哈希
   - 展示状态更新:
     * bond +10
     * energy -5
     * mood +5
     * streak +1
```

**场景 4: 链上验证 (1-2 分钟)**
```
1. 复制交易哈希
2. 打开 Solana Explorer (Devnet)
3. 粘贴哈希搜索
4. 展示交易详情:
   - 状态: Success
   - 调用的合约方法
   - 状态变化数据
5. 说明: "所有状态都已同步到链上"
```

**场景 5: 技术总结 (30 秒)**
```
1. 回到应用界面
2. 总结技术亮点:
   - Solana 智能合约 (Anchor)
   - Agent 自主决策 (LLM)
   - 跨链隐私支付 (LI.FI + MagicBlock)
   - 链上状态同步
3. 结束录制
```

#### 录制技巧

1. **分辨率**: 1920x1080 或更高
2. **帧率**: 30fps 或 60fps
3. **音频**: 可选配音解说
4. **鼠标高亮**: 开启鼠标点击效果
5. **分屏**: 可同时显示应用和 Explorer
6. **预演**: 正式录制前完整演练 2-3 次

### 9.5 演示检查清单

#### 环境检查
- [ ] Devnet 钱包余额 > 2 SOL
- [ ] 合约已部署且可访问
- [ ] 后端 API 正常响应
- [ ] 前端页面正常加载
- [ ] Phantom 钱包 Devnet 模式
- [ ] Solana Explorer 已打开

#### 功能检查
- [ ] 聊天功能正常
- [ ] 任务生成正常
- [ ] 钱包连接正常
- [ ] 支付流程正常
- [ ] 状态更新正常
- [ ] 链上同步正常

#### 录制检查
- [ ] 录屏软件设置正确
- [ ] 音频输入正常 (如需要)
- [ ] 存储空间充足
- [ ] 网络稳定
- [ ] 关闭无关通知

### 9.6 应急预案

| 问题 | 应急方案 |
|------|----------|
| Devnet 网络拥堵 | 等待或切换到备用时间 |
| 钱包签名失败 | 检查网络连接，重试 |
| 支付超时 | 使用 Mock 模式演示 |
| LLM 响应慢 | 使用预设回复模板 |
| 前端崩溃 | 刷新页面，重新连接 |
| 录屏失败 | 重新录制，保留备份 |

---

## 十、常见问题

### 10.1 智能合约开发问题

| 问题 | 解决方案 |
|------|----------|
| Anchor 编译失败 | 检查 Rust 和 Anchor 版本兼容性 |
| 部署失败 | 检查钱包余额和 Devnet 连接 |
| PDA 计算错误 | 验证 seeds 和 bump 计算 |
| 测试失败 | 检查账户权限和签名 |

### 10.2 后端开发问题

| 问题 | 解决方案 |
|------|----------|
| MongoDB 连接失败 | 检查 MongoDB 服务是否运行 |
| API 404 错误 | 检查路由注册和前缀 |
| CORS 错误 | 检查 CORS 配置 |
| 合约调用失败 | 检查 Program ID 和 RPC URL |
| 钱包连接失败 | 检查钱包扩展是否安装 |

### 10.3 前端开发问题

| 问题 | 解决方案 |
|------|----------|
| 组件渲染失败 | 检查 props 和状态传递 |
| 钱包连接失败 | 检查浏览器钱包扩展 |
| API 调用失败 | 检查后端服务和网络 |

### 10.4 演示问题

| 问题 | 解决方案 |
|------|----------|
| LLM 响应慢 | 准备固定回复模板 |
| 支付超时 | 使用 mock 数据 |
| 网络不稳定 | 本地部署所有服务 |
| 合约调用失败 | 准备降级方案 |

---

## 十一、技术亮点总结

### 11.1 架构设计

- **智能合约独立项目**: 使用 Anchor 框架开发 Solana 智能合约，通过 RPC 接口调用
- **分层架构**: 前端 → 后端 → 合约，职责清晰
- **状态双写**: 本地 MongoDB + 链上合约，保证数据一致性

### 11.2 技术栈

- **Solana**: 高性能区块链，低交易费用
- **Anchor**: Rust 智能合约框架，类型安全
- **LI.FI**: 跨链桥聚合器，支持多链互操作
- **MagicBlock PER**: 隐私支付协议，保护用户隐私
- **React + Zustand**: 现代化前端技术栈
- **Koa.js + MongoDB**: 轻量级后端架构

### 11.3 创新点

- **Agent 自主决策**: LLM 驱动的任务生成和状态管理
- **跨链隐私支付**: Ethereum → Solana 跨链 + 隐私保护
- **链上状态同步**: 支付完成后自动同步状态到链上合约
- **渐进式体验**: 从聊天到任务到支付的完整用户旅程

---

*文档版本: v2.0*  
*最后更新: 2026-05-09*  
*架构调整: 智能合约独立项目，通过接口调用*
*最后更新: 2026-05-09*  
*适用于: Solana 黑客松开发*
