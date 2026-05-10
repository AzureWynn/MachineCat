cmake_minimum_required(VERSION 3.8)
project(machinecat_robot)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

find_package(ament_cmake REQUIRED)
find_package(rclpy REQUIRED)
find_package(geometry_msgs REQUIRED)
find_package(sensor_msgs REQUIRED)
find_package(robot_state_publisher REQUIRED)
find_package(gazebo_ros REQUIRED)
find_package(joint_state_publisher REQUIRED)

install(
  DIRECTORY launch urdf config worlds scripts
  DESTINATION share/${PROJECT_NAME}
)

install(PROGRAMS
  scripts/teleop_keyboard.py
  scripts/obstacle_avoidance.py
  DESTINATION lib/${PROJECT_NAME}
)

ament_package()
