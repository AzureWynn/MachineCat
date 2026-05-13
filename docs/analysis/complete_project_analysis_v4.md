# 机器人个性化智能交互平台：最终技术实现蓝图 (v4)

## **1. 项目愿景与核心价值**

本项目旨在构建一个超越简单远程控制的、高度个性化、可扩展的智能机器人交互平台。其核心价值在于，通过软件定义，赋予每个物理机器人（无论是猫、狗还是其他形态）独一无二的“灵魂”——即名字、种类、品种和可定制的性格特征。平台将通过与大型语言模型（LLM）的深度结合，实现机器人能听、会说、会动，且其所有行为和语言都与其设定的“人设”高度统一的终极目标。

本文档是该项目的最终技术实现蓝图，它融合了对硬件能力的分析、领域驱动设计（DDD）的深度建模，以及具体的项目结构和技术栈选型，为整个开发过程提供全面的指导。

## **2. 硬件能力分析与改造要求 (基于 Arduino C++ 版)**

对 `catAI.ino` 固件的分析是所有软件设计的基础。

*   **现有能力**:
    *   **动作执行**: 固件已提供一套完整的单字符指令集（`f`, `b`, `l`, `r` 等），可通过 Wi-Fi (HTTP)、蓝牙等多种方式调用。**这是我们二次开发的基础**。
    *   **语音识别 (STT)**: **部分支持**。通过 `Serial2` 与一个**外部 AI 语音模块**通信，能接收该模块识别后的文本。但**固件本身不会将此文本上报**。

*   **核心改造要求 (硬性前提)**:
    1.  **实现 STT 文本上报**: **必须修改固件**。在 `catAI.ino` 中增加逻辑，将从 `Serial2` 接收到的语音文本，通过 WebSocket **实时发送**到 Node.js 服务器。
    2.  **实现 TTS 文本接收与播报**: **必须修改固件**。增加逻辑，能接收来自 Node.js 服务器的文本，并通过 `Serial2` 将其转发给外部 AI 语音模块进行播报（此方案依赖于对该模块 TTS 功能的验证）。

## **3. 领域驱动设计 (DDD) 深度模型**

我们采用 DDD 来管理项目的复杂性，将系统划分为清晰、独立的限界上下文。

### **3.1 核心域：智能交互与个性化**

#### **3.1.1 机器人个性上下文 (Robot Personality Context)**

*   **核心职责**: **“灵魂”的塑造与管理**。这是实现差异化和情感化交互的基石。
*   **核心聚合**: `RobotPersonality`
    *   **属性**: `name` (自定义名字), `type` (机器人类型：`CAT`, `DOG`, `SNAKE`), `breed` (品种：`Siamese`, `Husky`), `traits` (性格特征图谱，如 `{"活泼": 80, "傲娇": 50}`)
    *   **行为**: `changeName`, `adjustTrait`, `applyPresetForBreed` (应用品种的预设性格)。
    *   **持久化**: `RobotPersonality` 聚合将通过仓储模式存储在 **MongoDB** 中，保证其持久性。

#### **3.1.2 AI 交互上下文 (AI Interaction Context)**

*   **核心职责**: **“语义”的理解与生成**，并注入“个性”的色彩。
*   **核心流程**: 
    1.  接收用户输入的文本。
    2.  从“机器人个性上下文”获取 `RobotPersonality` 数据。
    3.  **动态构建 Prompt**: 将个性数据（名字、种类、品种、性格）注入到一个预设的 Prompt 模板中。
    4.  调用 LLM 并解析其回复，分离出**待播报文本**和**括号内的动作描述**。
    5.  生成标准化的 `Command` 对象。

#### **3.1.3 机器控制上下文 (Robot Control Context)**

*   **核心职责**: **“物理世界”的数字孪生**，处理所有与物理硬件的实时交互。
*   **核心聚合**: `Robot`
    *   **生命周期**: 其生命周期与 WebSocket 连接绑定，通过**心跳机制**确保连接健康。实例存在于**内存**中。
    *   **职责**: 管理连接、翻译并执行 `Command`、同步实时状态（如电池电量）。
    *   **状态缓存**: `Robot` 的实时状态（如 `isOnline`, `batteryLevel`）应缓存在 **Redis** 中，以支持多进程/多服务器架构。

### **3.2 支撑子域**

*   **动作编排上下文 (Choreography Context)**: 负责将原子 `Action` 组合成时间序列。
*   **用户上下文 (User Context)**: 负责用户账户、认证和授权。

## **4. 最终项目结构与技术框架**

基于 DDD 和六边形架构，我们设计了以下可落地的高内聚、低耦合项目结构。

```
/robot-interaction-platform
|-- /backend
|   |-- /src
|   |   |-- /core                     # 核心域
|   |   |   |-- /robot-personality    # 机器人个性上下文
|   |   |   |   |-- /domain
|   |   |   |   |   |-- robot-personality.js        # RobotPersonality 聚合根
|   |   |   |   |   |-- value-objects.js            # Type, Breed, TraitMap 等值对象
|   |   |   |   |   `-- personality-repository.interface.js
|   |   |   |   |-- /application
|   |   |   |   |   `-- personality.service.js      # 应用服务 (修改名字, 调整性格等)
|   |   |   |   `-- /infrastructure
|   |   |   |       `-- personality-repository.mongo.js # 仓储的 MongoDB 实现
|   |   |   |
|   |   |   |-- /ai-interaction       # AI 交互上下文
|   |   |   |   |-- /domain
|   |   |   |   |   |-- prompt-builder.js           # 动态 Prompt 构建器
|   |   |   |   |   `-- response-parser.js          # LLM 响应解析器
|   |   |   |   |-- /application
|   |   |   |   |   `-- interaction.service.js      # 核心交互流程服务
|   |   |   |   `-- /infrastructure
|   |   |   |       `-- llm.client.js               # LLM API 客户端
|   |   |   |
|   |   |   |-- /robot-control        # 机器控制上下文
|   |   |   |   |-- /domain
|   |   |   |   |   |-- robot.js                    # Robot 聚合根
|   |   |   |   |   `-- robot-repository.interface.js
|   |   |   |   |-- /application
|   |   |   |   |   |-- control.service.js          # 动作执行服务
|   |   |   |   |   `-- heartbeat.service.js        # 心跳管理服务
|   |   |   |   `-- /infrastructure
|   |   |   |       |-- robot-repository.in-memory.js # 连接管理器的内存实现
|   |   |   |       |-- robot-state.redis.js        # 状态缓存的 Redis 实现
|   |   |   |       `-- robot-connector.ws.js       # WebSocket 通信连接器
|   |   |   `-- ... (其他核心上下文)
|   |   |
|   |   |-- /supporting               # 支撑子域 (如用户管理)
|   |   |-- /shared                   # 共享内核 (如领域事件总线)
|   |   `-- /infrastructure         # 全局基础设施
|   |       |-- /web                  # Koa Web 服务 (路由, 中间件, 服务器启动)
|   |       `-- /database             # 数据库连接 (MongoDB, Redis)
|   |
|   |-- package.json
|   `-- .env
|
|-- /frontend
|   |-- ... (React 项目结构)
|
|-- /firmware
|   |-- /cat-ai-v2                # 改造后的固件项目
|   |   |-- cat-ai-v2.ino
|   |   `-- ...
|
`-- README.md
```

### **技术栈详解**

*   **后端 (Node.js)**
    *   **Web 框架**: **Koa.js** - 轻量、现代，基于 `async/await`。
    *   **WebSocket**: **`ws`** - 高性能、无额外封装，完美契合后端与硬件的底层通信需求。
    *   **数据库 ORM/ODM**: **Mongoose** - 用于与 MongoDB 交互，定义 `RobotPersonality` 等持久化模型。
    *   **缓存/状态存储**: **`ioredis`** - 高性能 Redis 客户端，用于管理 `Robot` 的实时状态和心跳。
    *   **环境变量**: **`dotenv`** - 管理配置文件。
    *   **日志**: **`winston`** 或 **`pino`** - 用于生产环境的结构化日志。

*   **前端**
    *   **UI 框架**: **React** (或 Vue/Svelte)。
    *   **HTTP 客户端**: **Axios** - 用于与后端进行非实时通信。
    *   **WebSocket 客户端**: 原生 `WebSocket` API 或 `socket.io-client`。
    *   **状态管理**: **Zustand** 或 **Redux Toolkit** - 管理复杂的前端状态。

*   **数据库**
    *   **MongoDB**: 存储需要持久化的核心业务数据，如 `RobotPersonality`、用户信息、编排的动作序列等。
    *   **Redis**: 存储短暂的、需要高速访问的实时数据，如 `Robot` 的在线状态、电池电量、会话信息等。

*   **硬件 (ESP32)**
    *   **环境**: **Arduino IDE** (推荐 `1.8.19`) + **`esp32 by Espressif Systems`** 支持包 (推荐 `v2.0.14`)。
    *   **核心库**: `ArduinoWebsockets` (或类似库) 用于实现 WebSocket 客户端，以及固件自带的 `WiFi`, `ESP32Servo` 等。

## **5. 结论**

这份蓝图为您提供了一个从宏观愿景到微观代码结构的完整路线图。它通过 DDD 的思想，将一个极具挑战性的复杂项目，分解为一系列清晰、可管理、可独立开发的限界上下文。项目的成功关键在于：

1.  **优先完成固件改造**: 这是打通数据链路、让软件“感知”和“发声”的前提。
2.  **严格遵守限界上下文的边界**: 确保不同领域的逻辑不被耦合在一起，保证系统的长期健康。
3.  **分阶段实施**: 先实现核心的“机器控制”和“个性化 AI 交互”流程，再逐步完善“动作编排”等支撑功能。

遵循此蓝图，您将能构建一个技术上健壮、功能上强大、体验上充满乐趣的个性化智能机器人平台。
