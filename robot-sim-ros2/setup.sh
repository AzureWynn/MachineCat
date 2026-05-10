#!/bin/bash

echo "========================================="
echo "MachineCat ROS2 Sim - 环境安装脚本"
echo "========================================="

if [ "$(uname)" != "Linux" ]; then
    echo "警告: ROS 2 和 Gazebo 主要支持 Linux 系统"
    echo "当前系统: $(uname)"
    echo ""
    echo "如果你在 macOS 上，建议使用:"
    echo "1. Docker 容器运行"
    echo "2. 虚拟机 (Ubuntu 22.04)"
    echo "3. 远程 Linux 服务器"
    echo ""
    read -p "是否继续? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "步骤 1: 安装 ROS 2 Humble (Ubuntu 22.04)"
echo "-------------------------------------------"
echo "请参考官方文档: https://docs.ros.org/en/humble/Installation.html"
echo ""
echo "快速安装命令:"
echo "  sudo apt update && sudo apt install -y software-properties-common"
echo "  sudo add-apt-repository universe"
echo "  sudo apt update && sudo apt install -y curl"
echo "  sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg"
echo "  echo 'deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) main' | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null"
echo "  sudo apt update"
echo "  sudo apt install -y ros-humble-desktop"
echo ""

echo "步骤 2: 安装 Gazebo"
echo "-------------------------------------------"
echo "  sudo apt install -y ros-humble-gazebo-ros-pkgs"
echo ""

echo "步骤 3: 安装依赖"
echo "-------------------------------------------"
echo "  sudo apt install -y python3-pip"
echo "  pip3 install setuptools"
echo ""

echo "步骤 4: 构建项目"
echo "-------------------------------------------"
echo "  cd robot-sim-ros2"
echo "  source /opt/ros/humble/setup.bash"
echo "  colcon build"
echo ""

echo "步骤 5: 运行仿真"
echo "-------------------------------------------"
echo "  source install/setup.bash"
echo "  ros2 launch machinecat_robot gazebo.launch.py"
echo ""

echo "========================================="
echo "安装完成！"
echo "========================================="
