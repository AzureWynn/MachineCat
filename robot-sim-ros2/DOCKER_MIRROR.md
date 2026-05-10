# Docker 镜像加速配置指南

## macOS Docker Desktop 配置

1. 打开 Docker Desktop
2. 点击设置图标（齿轮）
3. 选择 "Docker Engine"
4. 添加以下镜像加速器配置：

```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
```

5. 点击 "Apply & restart"

## 验证配置

```bash
docker info | grep -A 10 "Registry Mirrors"
```

## 重新构建

```bash
cd robot-sim-ros2
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 如果仍然失败

尝试手动拉取镜像：

```bash
# 使用代理或镜像
docker pull docker.mirrors.ustc.edu.cn/osrf/ros:humble-desktop
docker tag docker.mirrors.ustc.edu.cn/osrf/ros:humble-desktop osrf/ros:humble-desktop
```
