# 机械猫智能合约接口文档

> 版本: v0.1.0  
> 程序地址: `Hv3ojWiVyua8RycfbvPhgYsY5cPUjY4QGyL6F9FrcJkz`  
> 网络: Solana Devnet  
> 框架: Anchor 0.32.1

---

## 一、合约概述

机械猫状态管理合约，用于在链上存储和更新机器人的状态数据。

### 核心功能
- 初始化机器人状态
- 更新机器人状态（心情、亲密度、能量、连续任务）
- 完成任务

### 数据结构

```rust
pub struct RobotState {
    pub robot_id: String,      // 机器人ID (最大64字符)
    pub mood: u8,              // 心情 (0-100)
    pub bond: u8,              // 亲密度 (0-100)
    pub energy: u8,            // 能量 (0-100)
    pub streak: u32,           // 连续任务数
    pub authority: Pubkey,     // 管理员公钥
    pub last_updated: i64,     // 最后更新时间戳
}
```

---

## 二、指令 (Instructions)

### 2.1 initialize - 初始化机器人状态

创建新的机器人状态账户。

#### 参数

| 名称 | 类型 | 说明 |
|------|------|------|
| robot_id | String | 机器人唯一标识 |

#### 账户

| 名称 | 类型 | 说明 |
|------|------|------|
| state | Account (writable) | 状态账户 (PDA) |
| authority | Signer (writable) | 管理员签名账户 |
| system_program | Program | 系统程序 |

#### PDA 种子

```
["state", robot_id.as_bytes()]
```

#### 初始值

| 字段 | 值 |
|------|-----|
| mood | 50 |
| bond | 30 |
| energy | 80 |
| streak | 0 |

#### 示例代码

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RobotContract } from "../target/types/robot_contract";

const program = anchor.workspace.robotContract as Program<RobotContract>;
const robotId = "my-robot-001";

const [statePda, stateBump] = anchor.web3.PublicKey.findProgramAddressSync(
  [Buffer.from("state"), Buffer.from(robotId)],
  program.programId
);

const tx = await program.methods
  .initialize(robotId)
  .accounts({
    state: statePda,
    authority: provider.wallet.publicKey,
    systemProgram: anchor.web3.SystemProgram.programId,
  })
  .rpc();

console.log("Transaction signature:", tx);
```

---

### 2.2 updateState - 更新机器人状态

更新机器人的心情、亲密度、能量和连续任务数。

#### 参数

| 名称 | 类型 | 说明 |
|------|------|------|
| moodDelta | i32 | 心情变化值 (正数增加，负数减少) |
| bondDelta | i32 | 亲密度变化值 |
| energyDelta | i32 | 能量变化值 |
| streakDelta | u32 | 连续任务变化值 |

#### 账户

| 名称 | 类型 | 说明 |
|------|------|------|
| state | Account (writable) | 状态账户 (PDA) |
| authority | Signer | 管理员签名账户 |

#### 边界处理

所有状态值会自动限制在 0-100 范围内：
- `mood = clamp(mood + moodDelta, 0, 100)`
- `bond = clamp(bond + bondDelta, 0, 100)`
- `energy = clamp(energy + energyDelta, 0, 100)`
- `streak = streak + streakDelta` (最小为 0)

#### 示例代码

```typescript
const [statePda, stateBump] = anchor.web3.PublicKey.findProgramAddressSync(
  [Buffer.from("state"), Buffer.from(robotId)],
  program.programId
);

const tx = await program.methods
  .updateState(10, 5, -5, 1)  // mood+10, bond+5, energy-5, streak+1
  .accounts({
    state: statePda,
    authority: provider.wallet.publicKey,
  })
  .rpc();
```

---

### 2.3 completeQuest - 完成任务

完成任务并增加连续任务计数。

#### 参数

无

#### 账户

| 名称 | 类型 | 说明 |
|------|------|------|
| state | Account (writable) | 状态账户 (PDA) |
| authority | Signer | 管理员签名账户 |

#### 效果

- `streak += 1`
- 更新 `last_updated` 时间戳

#### 示例代码

```typescript
const [statePda, stateBump] = anchor.web3.PublicKey.findProgramAddressSync(
  [Buffer.from("state"), Buffer.from(robotId)],
  program.programId
);

const tx = await program.methods
  .completeQuest()
  .accounts({
    state: statePda,
    authority: provider.wallet.publicKey,
  })
  .rpc();
```

---

## 三、后端调用封装

### 3.1 SolanaService 封装示例

```javascript
const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const { Program, AnchorProvider, Wallet } = require('@coral-xyz/anchor');
const IDL = require('./robot_contract.json');

class SolanaService {
  constructor() {
    this.connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );
    
    this.programId = new PublicKey(IDL.address);
    this.wallet = this.loadWallet();
    this.provider = new AnchorProvider(this.connection, this.wallet, {
      commitment: 'confirmed',
    });
    this.program = new Program(IDL, this.programId, this.provider);
  }

  loadWallet() {
    const keypair = Keypair.fromSecretKey(
      Buffer.from(JSON.parse(process.env.SOLANA_WALLET_SECRET_KEY))
    );
    return new Wallet(keypair);
  }

  getStatePda(robotId) {
    const [pda, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from('state'), Buffer.from(robotId)],
      this.programId
    );
    return { pda, bump };
  }

  async initializeRobotState(robotId) {
    const { pda } = this.getStatePda(robotId);
    
    try {
      const tx = await this.program.methods
        .initialize(robotId)
        .accounts({
          state: pda,
          authority: this.provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      
      return { success: true, tx, pda: pda.toBase58() };
    } catch (error) {
      if (error.message.includes('already in use')) {
        return { success: false, error: 'Robot state already exists' };
      }
      throw error;
    }
  }

  async getRobotState(robotId) {
    const { pda } = this.getStatePda(robotId);
    
    try {
      const state = await this.program.account.robotState.fetch(pda);
      return {
        success: true,
        data: {
          robotId: state.robotId,
          mood: state.mood,
          bond: state.bond,
          energy: state.energy,
          streak: state.streak,
          authority: state.authority.toBase58(),
          lastUpdated: state.lastUpdated.toNumber(),
        },
      };
    } catch (error) {
      return { success: false, error: 'Robot state not found' };
    }
  }

  async updateRobotState(robotId, moodDelta, bondDelta, energyDelta, streakDelta) {
    const { pda } = this.getStatePda(robotId);
    
    const tx = await this.program.methods
      .updateState(moodDelta, bondDelta, energyDelta, streakDelta)
      .accounts({
        state: pda,
        authority: this.provider.wallet.publicKey,
      })
      .rpc();
    
    return { success: true, tx };
  }

  async completeQuest(robotId) {
    const { pda } = this.getStatePda(robotId);
    
    const tx = await this.program.methods
      .completeQuest()
      .accounts({
        state: pda,
        authority: this.provider.wallet.publicKey,
      })
      .rpc();
    
    return { success: true, tx };
  }
}

module.exports = new SolanaService();
```

---

## 四、REST API 对接

### 4.1 获取机器人状态

```
GET /api/solana/state/:robotId
```

**响应:**
```json
{
  "success": true,
  "data": {
    "robotId": "my-robot-001",
    "mood": 60,
    "bond": 35,
    "energy": 75,
    "streak": 1,
    "authority": "xxx",
    "lastUpdated": 1715270400
  }
}
```

### 4.2 初始化机器人状态

```
POST /api/solana/state/init
```

**请求体:**
```json
{
  "robotId": "my-robot-001"
}
```

### 4.3 更新机器人状态

```
POST /api/solana/state/update
```

**请求体:**
```json
{
  "robotId": "my-robot-001",
  "moodDelta": 10,
  "bondDelta": 5,
  "energyDelta": -5,
  "streakDelta": 1
}
```

### 4.4 完成任务

```
POST /api/solana/quest/complete
```

**请求体:**
```json
{
  "robotId": "my-robot-001"
}
```

---

## 五、错误处理

### 常见错误

| 错误 | 原因 | 处理方式 |
|------|------|----------|
| Account does not exist | 状态未初始化 | 调用 initialize |
| Already in use | 状态已存在 | 直接读取 |
| Constraint violation | 权限错误 | 检查 authority |
| Transaction failed | 交易失败 | 重试或检查参数 |

---

## 六、注意事项

1. **PDA 地址计算**: 所有状态账户都是 PDA，种子为 `["state", robot_id]`
2. **权限控制**: 只有 authority 可以更新状态
3. **边界值**: mood/bond/energy 自动限制在 0-100
4. **网络**: 开发使用 Devnet，演示需要连接真实钱包
5. **交易确认**: 建议使用 `confirmed` 级别确认
