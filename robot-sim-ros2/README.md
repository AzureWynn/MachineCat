# 🤖 MachineCat ROS2 Sim - Simulated Mobile Robot

> **Beginner Track**: Build a simulated mobile robot in ROS 2 + Gazebo  
> **Theme**: Extend AI agents into the physical world alongside humans in real environments

## Project Description

MachineCat ROS2 Sim is a beginner-level simulated mobile robot platform built with ROS 2 and Gazebo. It demonstrates how intelligent agents can perceive, decide, and act in physical environments through:

- **Perception**: LiDAR sensor for environment scanning
- **Decision**: Obstacle avoidance algorithm
- **Action**: Differential drive movement control

This project is part of the larger MachineCat ecosystem, bridging AI agents with physical robot control through ROS 2.

## Features

- Differential drive mobile robot model (URDF)
- Gazebo simulation environment with obstacles
- Keyboard teleoperation control
- Automatic obstacle avoidance using LiDAR
- Ready for ROS bridge integration with web dashboards

## Project Structure

```
robot-sim-ros2/
├── src/
│   └── machinecat_robot/
│       ├── launch/              # ROS 2 launch files
│       │   └── gazebo.launch.py
│       ├── urdf/                # Robot description
│       │   └── machinecat.urdf
│       ├── config/              # Configuration files
│       ├── worlds/              # Gazebo world files
│       │   └── room.world
│       ├── scripts/             # Python control scripts
│       │   ├── teleop_keyboard.py
│       │   └── obstacle_avoidance.py
│       ├── CMakeLists.txt
│       └── package.xml
├── Dockerfile                   # Docker image definition
├── docker-compose.yml           # Docker Compose configuration
├── supervisord.conf             # Process manager config
├── nginx.conf                   # Nginx reverse proxy
├── setup.sh                     # Native installation script
└── README.md                    # This file
```

## Prerequisites

- **OS**: Ubuntu 22.04 (recommended)
- **ROS 2**: Humble Hawksbill
- **Gazebo**: Classic 11 (via gazebo_ros_pkgs)
- **Python**: 3.10+

## Setup Instructions

### Option 1: Docker (Recommended for macOS/Windows)

This is the easiest way to run the simulation on macOS or Windows without installing ROS 2 natively.

#### Prerequisites

- Docker Desktop installed and running
- VNC Viewer (optional, for better experience)

#### Quick Start

```bash
cd robot-sim-ros2
docker-compose up -d
```

This will:
1. Build the ROS 2 + Gazebo Docker image
2. Start VNC server (port 5901)
3. Start rosbridge WebSocket (port 9090)
4. Start nginx proxy (port 8080)

#### Access the Simulation

**Method 1: VNC Viewer (Recommended)**
- Open VNC Viewer
- Connect to: `localhost:5901`
- Password: `robot`
- Open terminal in VNC and run:
  ```bash
  ros2 launch machinecat_robot gazebo.launch.py
  ```

**Method 2: Web Browser (noVNC)**
- Open browser: `http://localhost:8080/vnc/`
- Password: `robot`
- Open terminal and run simulation

**Method 3: Execute commands directly**
```bash
docker exec -it machinecat-ros2-sim bash
ros2 launch machinecat_robot gazebo.launch.py
```

#### Run Control Scripts

In a new terminal:
```bash
docker exec -it machinecat-ros2-sim bash
ros2 run machinecat_robot teleop_keyboard.py
```

Or for obstacle avoidance:
```bash
docker exec -it machinecat-ros2-sim bash
ros2 run machinecat_robot obstacle_avoidance.py
```

#### Stop the Simulation

```bash
docker-compose down
```

### Option 2: Native Installation (Linux Only)

Follow the official installation guide: https://docs.ros.org/en/humble/Installation.html

Quick install:
```bash
sudo apt update && sudo apt install -y software-properties-common
sudo add-apt-repository universe
sudo apt update && sudo apt install -y curl
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null
sudo apt update
sudo apt install -y ros-humble-desktop
```

### 2. Install Gazebo ROS Packages

```bash
sudo apt install -y ros-humble-gazebo-ros-pkgs
```

### 3. Source ROS 2 Environment

```bash
source /opt/ros/humble/setup.bash
```

### 4. Build the Project

```bash
cd robot-sim-ros2
colcon build
source install/setup.bash
```

## Usage

### Launch Gazebo Simulation

```bash
ros2 launch machinecat_robot gazebo.launch.py
```

This will:
1. Start Gazebo with the room world
2. Spawn the robot model
3. Start robot state publisher

### Keyboard Teleoperation

In a new terminal:
```bash
source /opt/ros/humble/setup.bash
source install/setup.bash
ros2 run machinecat_robot teleop_keyboard.py
```

**Controls:**
- `w` - Move forward
- `s` - Move backward
- `a` - Turn left
- `d` - Turn right
- `Space` - Stop
- `q` - Quit

### Automatic Obstacle Avoidance

In a new terminal:
```bash
source /opt/ros/humble/setup.bash
source install/setup.bash
ros2 run machinecat_robot obstacle_avoidance.py
```

The robot will automatically navigate around obstacles using LiDAR data.

## Robot Model

### Specifications

| Component | Description |
|-----------|-------------|
| Base | 40cm x 30cm x 15cm box |
| Drive | Differential drive (2 wheels + 1 caster) |
| Sensors | LiDAR (front), Camera (front) |
| Mass | ~2.8 kg |

### URDF Structure

```
base_footprint
  └── base_link
        ├── left_wheel (continuous joint)
        ├── right_wheel (continuous joint)
        ├── caster_wheel (fixed)
        ├── lidar_link (fixed)
        └── camera_link (fixed)
```

## Topics

| Topic | Type | Description |
|-------|------|-------------|
| `/cmd_vel` | geometry_msgs/Twist | Velocity command input |
| `/scan` | sensor_msgs/LaserScan | LiDAR sensor data |
| `/joint_states` | sensor_msgs/JointState | Joint state information |

## Integration with MachineCat Ecosystem

This simulation can be integrated with the main MachineCat platform through:

1. **ROS Bridge**: Use `rosbridge_suite` to connect with the React frontend
2. **REST API**: Expose robot control through the Node.js backend
3. **WebSocket**: Real-time command and status streaming

### Example: Web Dashboard Control

```javascript
// Connect to rosbridge WebSocket
const ros = new ROSLIB.Ros({
  url: 'ws://localhost:9090'
});

// Send velocity command
const cmdVel = new ROSLIB.Topic({
  ros: ros,
  name: '/cmd_vel',
  messageType: 'geometry_msgs/Twist'
});

cmdVel.publish({
  linear: { x: 0.5, y: 0, z: 0 },
  angular: { x: 0, y: 0, z: 0 }
});
```

## Future Enhancements

- [ ] SLAM navigation (slam_toolbox)
- [ ] Path planning (Nav2)
- [ ] Computer vision with OpenCV
- [ ] Multi-robot coordination
- [ ] Web3 task integration (Solana blockchain)
- [ ] AI agent task planning

## Troubleshooting

### Docker Build Fails - Image Pull Timeout

If you see error like:
```
failed to solve: osrf/ros:humble-desktop: failed to authorize: i/o timeout
```

**Solution 1: Configure Docker Mirror (China)**

1. Open Docker Desktop
2. Go to Settings → Docker Engine
3. Add registry mirrors:
```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ]
}
```
4. Apply & restart

**Solution 2: Manual Pull**
```bash
docker pull docker.mirrors.ustc.edu.cn/osrf/ros:humble-desktop
docker tag docker.mirrors.ustc.edu.cn/osrf/ros:humble-desktop osrf/ros:humble-desktop
```

**Solution 3: Use Proxy**
```bash
export http_proxy=http://your-proxy:port
export https_proxy=http://your-proxy:port
docker-compose build
```

### Gazebo doesn't start

```bash
# Check if Gazebo is installed
gazebo --version

# Reinstall if needed
sudo apt install -y ros-humble-gazebo-ros-pkgs
```

### Robot not moving

```bash
# Check if topics are connected
ros2 topic echo /cmd_vel

# Verify teleop node is running
ros2 node list
```

### Build errors

```bash
# Clean and rebuild
rm -rf build/ install/ log/
colcon build
```

## Related Projects

- [MachineCat Main Repository](https://github.com/AzureWynn/MachineCat) - Full AI robot cat platform with blockchain integration
- [robot-server](../robot-server/) - Node.js backend service
- [robot-app](../robot-app/) - React frontend application
- [robot-contract](../robot-contract/) - Solana smart contracts

## License

ISC License

---

**Built with ROS 2 and Gazebo** 🤖
