# HTTP 直连方案使用指南

## 📋 方案概述

通过 Node.js 服务器发送 HTTP 请求到 ESP32 内置的 Web 服务器，模拟点击 Web 控制界面的按钮。

**架构**：
```
用户浏览器/手机
    ↓ HTTP/WebSocket
Node.js 服务器 (本地电脑)
    ↓ HTTP GET 请求
ESP32 Web 服务器 (192.168.4.1:80)
```

**优势**：
- ✅ **不需要修改任何硬件代码**
- ✅ 实现简单，立即可用
- ✅ 支持所有 ESP32 现有动作
- ✅ 低延迟（局域网内 < 100ms）

**限制**：
- ⚠️ 电脑必须连接 ESP32 热点
- ⚠️ 连接热点期间不能上网（除非配置双网卡）
- ⚠️ 仅支持本地网络

---

## 🚀 快速开始

### 第一步：连接 ESP32 热点

1. 确保机器猫 ESP32 已开机
2. 在电脑上连接 WiFi 热点：
   - **热点名称**: `catcontrol`
   - **密码**: `12345678`

3. 验证连接：
```bash
ping 192.168.4.1
```

应该看到类似输出：
```
PING 192.168.4.1 (192.168.4.1): 56 data bytes
64 bytes from 192.168.4.1: icmp_seq=0 ttl=255 time=2.345 ms
```

### 第二步：测试连接

```bash
cd /Users/laters/work/web3/机器猫程序源代码/robot-server
npm run test:http
```

**预期输出**：
```
🔍 测试 ESP32 连接...
[HTTP] ESP32 连接测试成功，状态码: 200
✅ ESP32 连接成功！

📤 开始发送测试指令...

1️⃣ 前进
[HTTP] 发送指令: forward -> /20/on
[HTTP] 指令 forward 已发送，状态码: 200
✅ 指令已发送: forward (状态码: 200)

2️⃣ 停止
[HTTP] 发送指令: stop -> /22/on
✅ 指令已发送: stop (状态码: 200)

3️⃣ 踢球
[HTTP] 发送指令: kick -> /32/on
✅ 指令已发送: kick (状态码: 200)

4️⃣ 坐下
[HTTP] 发送指令: sit -> /26/on
✅ 指令已发送: sit (状态码: 200)

✅ 测试完成
```

### 第三步：启动 HTTP 模式服务器

```bash
npm run start:http
```

**预期输出**：
```
🚀 Server listening on https://localhost:3002
🤖 机器人 IP: 192.168.4.1
📡 连接模式: HTTP (ESP32 Web 服务器)
```

### 第四步：通过 API 控制机器人

```bash
# 前进
curl -X POST https://localhost:3002/api/interaction/test-robot/chat \
  -H "Content-Type: application/json" \
  -d '{"userInput": "请前进"}' \
  -k

# 踢球
curl -X POST https://localhost:3002/api/interaction/test-robot/chat \
  -H "Content-Type: application/json" \
  -d '{"userInput": "踢个球"}' \
  -k
```

**响应示例**：
```json
{
  "robotId": "test-robot",
  "userInput": "请前进",
  "responseText": "好的，我前进！",
  "actions": [
    { "type": "move", "direction": "forward" }
  ]
}
```

---

## 📊 完整指令映射表

| 动作名称 | HTTP 路径 | ESP32 动作 | 说明 |
|---------|-----------|-----------|------|
| `forward` | `/20/on` | 前进 | 持续前进 |
| `left` | `/21/on` | 左转 | 原地左转 |
| `stop` | `/22/on` | 停止 | 停止所有动作 |
| `right` | `/23/on` | 右转 | 原地右转 |
| `backward` | `/24/on` | 后退 | 持续后退 |
| `walk` | `/25/on` | 步行 | 步行模式 |
| `sit` | `/26/on` | 坐姿 | 坐下 |
| `shakehand` | `/27/on` | 握手 | 握手动作 |
| `follow` | `/28/on` | 跟随 | 超声波跟随 |
| `step` | `/29/on` | 踏步 | 原地踏步 |
| `swing` | `/30/on` | 摇摆 | 左右摇摆 |
| `updown` | `/31/on` | 起卧 | 起卧动作 |
| `kick` | `/32/on` | 踢球 | 踢球动作 |
| `auto_walk` | `/33/on` | 自动行走 | 自动避障行走 |
| `balance` | `/34/on` | 站立平衡 | 站立平衡模式 |
| `calibration` | `/35/on` | 舵机校对 | 舵机校准模式 |

---

## 🔧 高级配置

### 自定义 ESP32 IP 地址

如果 ESP32 的 IP 不是默认的 `192.168.4.1`：

```bash
ROBOT_IP=192.168.4.100 npm run start:http
```

### 直接访问 ESP32 Web 界面

在浏览器中打开：
```
http://192.168.4.1
```

你会看到 ESP32 自带的控制界面，可以直接点击按钮控制。

---

## 🌐 让手机也能控制

### 方案 1：手机连接同一热点

1. 手机也连接 ESP32 热点 `catcontrol`
2. 手机浏览器访问：`https://你的电脑IP:3002`
3. 通过 API 控制机器人

### 方案 2：电脑共享网络

**macOS 网络共享**：
1. 系统设置 > 通用 > 共享 > 互联网共享
2. 从 WiFi 共享到 iPhone USB
3. 手机通过 USB 共享网络访问电脑

**这样手机可以上网，同时电脑连接 ESP32 热点**。

---

## 📝 代码结构

```
robot-server/
├── src/core/robot-control/infrastructure/
│   ├── robot-connector.ws.js          # WebSocket 连接器（原有）
│   ├── robot-connector.bluetooth.js   # 蓝牙连接器
│   └── robot-connector.http.js        # HTTP 连接器（新增）⭐
├── src/infrastructure/web/
│   ├── server.js                      # 原服务器（WebSocket）
│   ├── server.bluetooth.js            # 蓝牙模式服务器
│   └── server.http.js                 # HTTP 模式服务器（新增）⭐
├── test_http.js                       # HTTP 连接测试脚本
├── package.json                       # 添加了 start:http 脚本
└── HTTP_GUIDE.md                      # 本文档
```

---

## ❓ 常见问题

### Q1: 连接超时或无法访问 192.168.4.1
**A**: 
- 确认 ESP32 已开机
- 确认电脑已连接到 `catcontrol` 热点
- 尝试 `ping 192.168.4.1` 检查连通性

### Q2: 发送指令后机器人没有反应
**A**:
- 检查 ESP32 串口输出（通过 USB 连接电脑查看 Serial 输出）
- 确认指令映射正确
- 查看服务器日志中的状态码

### Q3: 连接热点后不能上网
**A**:
- 这是正常现象，ESP32 热点没有互联网接入
- 可以使用双网卡（WiFi 连接热点，以太网/手机 USB 共享上网）
- 或配置 macOS 网络共享

### Q4: 能否同时连接多个客户端？
**A**:
- ✅ 可以，多个客户端可以同时访问 Node.js 服务器
- ✅ Node.js 服务器会按顺序发送 HTTP 请求到 ESP32

---

## 🎯 下一步

HTTP 方案是最简单的起步方式，后续可以考虑：

1. **启用 BLE** - 支持手机直连，不需要连接热点
2. **MQTT 协议** - 支持远程控制
3. **开发手机 App** - 更好的用户体验
