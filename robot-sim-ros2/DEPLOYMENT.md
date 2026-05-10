# MachineCat ROS2 部署指南

> 完整的 Docker 部署步骤和常见问题解决方案

## 目录

- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [详细步骤](#详细步骤)
- [访问方式](#访问方式)
- [常见问题](#常见问题)
- [验证安装](#验证安装)

---

## 环境要求

### 必需软件

| 软件 | 版本 | 说明 |
|------|------|------|
| Docker Desktop | 最新版 | 容器运行环境 |
| Docker Compose | v2+ | 容器编排（通常随 Docker 一起安装） |

### 系统要求

- **操作系统**: macOS / Windows / Linux
- **内存**: 至少 4GB RAM（推荐 8GB）
- **磁盘空间**: 至少 10GB 可用空间
- **网络**: 稳定的网络连接（用于下载镜像）

---

## 快速开始

```bash
# 1. 进入项目目录
cd robot-sim-ros2

# 2. 启动容器（自动构建镜像）
docker-compose up -d

# 3. 查看日志
docker logs -f machinecat-ros2-sim
```

---

## 详细步骤

### 步骤 1: 安装 Docker Desktop

#### macOS

1. 下载 Docker Desktop for Mac
   - 访问: https://www.docker.com/products/docker-desktop/
   - 选择 Apple Silicon (M1/M2/M3) 或 Intel 版本

2. 安装
   ```bash
   # 双击下载的 .dmg 文件
   # 将 Docker 拖到 Applications 文件夹
   ```

3. 启动 Docker Desktop
   - 从 Applications 启动
   - 等待状态栏显示 Docker 图标（鲸鱼）

4. 验证安装
   ```bash
   docker --version
   docker compose version
   ```

#### Windows

1. 下载 Docker Desktop for Windows
   - 访问: https://www.docker.com/products/docker-desktop/

2. 安装
   - 运行安装程序
   - 确保启用 WSL 2 后端

3. 验证安装
   ```bash
   docker --version
   docker compose version
   ```

### 步骤 2: 配置代理（中国大陆用户）

如果你在中国大陆，需要配置代理才能拉取 Docker 镜像。

#### 方法 1: Docker Desktop 代理设置

1. 打开 Docker Desktop
2. 点击 Settings (⚙️) → Resources → Proxies
3. 配置代理:
   ```
   HTTP Proxy: http://host.docker.internal:10808
   HTTPS Proxy: http://host.docker.internal:10808
   ```
4. 点击 "Apply & restart"

#### 方法 2: 配置镜像加速器

1. 打开 Docker Desktop
2. 点击 Settings (⚙️) → Docker Engine
3. 添加镜像加速器:
   ```json
   {
     "registry-mirrors": [
       "https://docker.mirrors.ustc.edu.cn",
       "https://hub-mirror.c.163.com",
       "https://mirror.baidubce.com"
     ]
   }
   ```
4. 点击 "Apply & restart"

#### 方法 3: 命令行设置代理

```bash
# 在终端中设置代理环境变量
export http_proxy=http://127.0.0.1:10808
export https_proxy=http://127.0.0.1:10808

# 然后运行 docker-compose
docker-compose up -d
```

### 步骤 3: 构建和启动容器

#### 方式 1: 使用 docker-compose（推荐）

```bash
# 进入项目目录
cd /path/to/MachineCat/robot-sim-ros2

# 启动容器（如果镜像不存在会自动构建）
docker-compose up -d

# 查看构建进度
docker logs -f machinecat-ros2-sim
```

#### 方式 2: 手动构建镜像

```bash
# 进入项目目录
cd /path/to/MachineCat/robot-sim-ros2

# 手动构建镜像
DOCKER_BUILDKIT=0 docker build \
  --network=host \
  -f Dockerfile.alternative \
  -t machinecat-ros2-sim .

# 启动容器
docker-compose up -d
```

### 步骤 4: 验证容器运行

```bash
# 查看运行中的容器
docker ps

# 应该看到两个容器:
# machinecat-ros2-sim   (ROS2 + VNC)
# machinecat-ros2-web   (Nginx)
```

**预期输出:**
```
CONTAINER ID   IMAGE                    STATUS          PORTS
xxxxx          robot-sim-ros2-ros2-gazebo   Up   0.0.0.0:5901->5901/tcp, 0.0.0.0:6080->6080/tcp, 0.0.0.0:9090->9090/tcp
xxxxx          nginx:alpine               Up   0.0.0.0:8080->80/tcp
```

---

## 访问方式

### 1. VNC 远程桌面（推荐）

**使用 VNC 客户端:**

1. 下载 VNC Viewer
   - macOS: https://www.realvnc.com/en/connect/download/viewer/macos/
   - Windows: https://www.realvnc.com/en/connect/download/viewer/windows/

2. 连接信息:
   ```
   地址: localhost:5901
   密码: robot
   ```

3. 连接后，你可以看到 Ubuntu 桌面环境

### 2. noVNC Web 访问（无需安装客户端）

1. 打开浏览器
2. 访问: http://localhost:6080
3. 输入密码: `robot`
4. 点击 Connect

### 3. rosbridge WebSocket（用于开发）

```
地址: ws://localhost:9090
```

用于 Web 应用与 ROS2 通信。

### 4. Nginx Web 控制面板

```
地址: http://localhost:8080
```

---

## 常用命令

### 容器管理

```bash
# 启动容器
docker-compose up -d

# 停止容器
docker-compose down

# 重启容器
docker-compose restart

# 查看容器状态
docker ps

# 查看容器日志
docker logs machinecat-ros2-sim

# 实时查看日志
docker logs -f machinecat-ros2-sim
```

### 进入容器

```bash
# 进入容器终端
docker exec -it machinecat-ros2-sim bash

# 进入后，你可以运行 ROS2 命令
ros2 node list
ros2 topic list
```

### 运行 ROS2 命令

```bash
# 进入容器
docker exec -it machinecat-ros2-sim bash

# 查看 ROS2 节点
ros2 node list

# 查看 ROS2 话题
ros2 topic list

# 查看话题消息
ros2 topic echo /cmd_vel

# 发布速度命令
ros2 topic pub /cmd_vel geometry_msgs/msg/Twist "{linear: {x: 0.5}, angular: {z: 0.0}}"
```

### 重新构建镜像

```bash
# 停止并删除容器
docker-compose down

# 重新构建镜像（不使用缓存）
docker-compose build --no-cache

# 重新启动容器
docker-compose up -d
```

---

## 常见问题

### 问题 1: 镜像拉取超时

**错误信息:**
```
failed to solve: osrf/ros:humble-desktop: failed to authorize: i/o timeout
```

**解决方案:**

1. **检查代理设置**
   ```bash
   # 确认代理是否可用
   curl -I https://www.google.com
   ```

2. **配置 Docker 代理**
   - 打开 Docker Desktop → Settings → Resources → Proxies
   - 设置 HTTP/HTTPS Proxy 为 `http://host.docker.internal:10808`
   - 点击 Apply & restart

3. **使用镜像加速器**
   - 打开 Docker Desktop → Settings → Docker Engine
   - 添加 registry-mirrors（见步骤 2）

4. **手动拉取镜像**
   ```bash
   docker pull docker.mirrors.ustc.edu.cn/library/ubuntu:22.04
   docker tag docker.mirrors.ustc.edu.cn/library/ubuntu:22.04 ubuntu:22.04
   ```

### 问题 2: 构建失败 - 包找不到

**错误信息:**
```
E: Unable to locate package ros-humble-xxx
```

**解决方案:**

1. **检查网络连接**
   ```bash
   curl -I http://packages.ros.org
   ```

2. **使用代理构建**
   ```bash
   export http_proxy=http://127.0.0.1:10808
   export https_proxy=http://127.0.0.1:10808
   docker-compose build
   ```

3. **清理后重新构建**
   ```bash
   docker-compose down
   docker system prune -a
   docker-compose build --no-cache
   ```

### 问题 3: 容器启动后立即退出

**查看日志:**
```bash
docker logs machinecat-ros2-sim
```

**常见原因:**
- supervisord 配置错误
- VNC 启动失败
- 端口被占用

**解决方案:**
```bash
# 检查端口是否被占用
lsof -i :5901
lsof -i :6080
lsof -i :9090

# 停止占用端口的进程
kill -9 <PID>

# 重新启动容器
docker-compose up -d
```

### 问题 4: VNC 连接被拒绝

**解决方案:**

1. **检查容器是否运行**
   ```bash
   docker ps | grep machinecat-ros2-sim
   ```

2. **检查 VNC 服务**
   ```bash
   docker exec machinecat-ros2-sim ps aux | grep vnc
   ```

3. **重启容器**
   ```bash
   docker-compose restart
   ```

4. **查看 VNC 日志**
   ```bash
   docker exec machinecat-ros2-sim cat /tmp/vnc.log
   ```

### 问题 5: 端口被占用

**错误信息:**
```
Error starting userland proxy: listen tcp 0.0.0.0:5901: bind: address already in use
```

**解决方案:**

1. **查找占用端口的进程**
   ```bash
   lsof -i :5901
   ```

2. **停止占用进程**
   ```bash
   kill -9 <PID>
   ```

3. **或者修改 docker-compose.yml 中的端口映射**
   ```yaml
   ports:
     - "5902:5901"  # 将主机端口改为 5902
   ```

### 问题 6: Docker 磁盘空间不足

**解决方案:**

1. **清理未使用的镜像和容器**
   ```bash
   docker system prune -a
   ```

2. **清理 Docker 数据**
   ```bash
   docker volume prune
   docker network prune
   ```

3. **增加 Docker 磁盘限制**
   - macOS: Docker Desktop → Settings → Resources → Disk image size
   - Windows: Docker Desktop → Settings → Resources → Disk image size

---

## 验证安装

### 1. 检查容器状态

```bash
docker ps
```

应该看到两个容器正在运行。

### 2. 检查 ROS2 环境

```bash
# 进入容器
docker exec -it machinecat-ros2-sim bash

# 检查 ROS2 版本
ros2 --version

# 检查 ROS2 节点
ros2 node list

# 检查 ROS2 话题
ros2 topic list
```

### 3. 检查 VNC 服务

```bash
# 在容器内检查 VNC
docker exec machinecat-ros2-sim ps aux | grep vnc

# 应该看到 vncserver 进程
```

### 4. 测试 rosbridge

```bash
# 使用 wscat 测试 WebSocket
brew install wscat  # macOS
wscat -c ws://localhost:9090
```

### 5. 完整测试流程

```bash
# 1. 进入容器
docker exec -it machinecat-ros2-sim bash

# 2. 查看可用的 ROS2 包
ros2 pkg list | grep machinecat

# 3. 查看 launch 文件
ls /ros2_ws/src/machinecat_robot/launch/

# 4. 尝试启动（如果有 Gazebo）
# ros2 launch machinecat_robot gazebo.launch.py
```

---

## 架构说明

### 为什么使用 Dockerfile.alternative？

原始 Dockerfile 基于 `osrf/ros:humble-desktop` 镜像，但该镜像：
- 体积较大（>10GB）
- 在某些网络环境下难以拉取
- 在 Apple Silicon (arm64) 架构上可能不兼容

`Dockerfile.alternative` 的优势：
- 基于 `ubuntu:22.04`，体积更小
- 按需安装 ROS2 包，更灵活
- 支持 arm64 架构
- 构建速度更快

### 容器架构

```
┌─────────────────────────────────────────┐
│         machinecat-ros2-sim             │
│  ┌───────────────────────────────────┐  │
│  │  Ubuntu 22.04                     │  │
│  │  ├─ ROS2 Humble                   │  │
│  │  ├─ VNC Server (:5901)            │  │
│  │  ├─ rosbridge (:9090)             │  │
│  │  └─ machinecat_robot package      │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         machinecat-ros2-web             │
│  ┌───────────────────────────────────┐  │
│  │  Nginx                            │  │
│  │  ├─ noVNC (:6080)                 │  │
│  │  └─ Web Dashboard (:8080)         │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 端口映射

| 容器端口 | 主机端口 | 服务 | 说明 |
|----------|----------|------|------|
| 5901 | 5901 | VNC Server | 远程桌面访问 |
| 6080 | 6080 | noVNC | Web 版 VNC |
| 9090 | 9090 | rosbridge | WebSocket 通信 |
| 80 | 8080 | Nginx | Web 控制面板 |

---

## 下一步

### 学习 ROS2 基础

1. **ROS2 概念**
   - Nodes（节点）
   - Topics（话题）
   - Messages（消息）
   - Services（服务）

2. **常用命令**
   ```bash
   ros2 node list          # 列出节点
   ros2 topic list         # 列出话题
   ros2 topic echo <topic> # 查看话题消息
   ros2 service list       # 列出服务
   ```

3. **官方教程**
   - https://docs.ros.org/en/humble/Tutorials.html

### 扩展项目

- [ ] 添加 SLAM 导航
- [ ] 添加路径规划（Nav2）
- [ ] 添加计算机视觉
- [ ] 集成到 MachineCat 主项目

---

## 相关资源

- [ROS2 官方文档](https://docs.ros.org/en/humble/)
- [Docker 官方文档](https://docs.docker.com/)
- [VNC Viewer 下载](https://www.realvnc.com/en/connect/download/viewer/)
- [MachineCat 主项目](https://github.com/AzureWynn/MachineCat)

---

**最后更新**: 2026-05-10
