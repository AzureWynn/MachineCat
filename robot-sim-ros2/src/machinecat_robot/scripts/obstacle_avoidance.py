#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from sensor_msgs.msg import LaserScan
import math

class ObstacleAvoidanceNode(Node):
    def __init__(self):
        super().__init__('obstacle_avoidance')
        self.publisher = self.create_publisher(Twist, '/cmd_vel', 10)
        self.subscription = self.create_subscription(
            LaserScan,
            '/scan',
            self.laser_callback,
            10
        )
        
        self.safe_distance = 1.0
        self.forward_speed = 0.3
        self.turn_speed = 0.8
        
        self.get_logger().info('自动避障节点已启动')
        self.get_logger().info(f'安全距离: {self.safe_distance}m')
    
    def laser_callback(self, msg):
        twist = Twist()
        
        ranges = msg.ranges
        min_range = len(ranges)
        
        front_ranges = ranges[min_range//4:3*min_range//4]
        front_ranges = [r for r in front_ranges if r > msg.range_min and r < msg.range_max]
        
        if not front_ranges:
            return
        
        min_front_distance = min(front_ranges)
        
        if min_front_distance < self.safe_distance:
            twist.linear.x = 0.0
            
            left_ranges = ranges[3*min_range//4:]
            left_ranges = [r for r in left_ranges if r > msg.range_min and r < msg.range_max]
            
            right_ranges = ranges[:min_range//4]
            right_ranges = [r for r in right_ranges if r > msg.range_min and r < msg.range_max]
            
            left_min = min(left_ranges) if left_ranges else float('inf')
            right_min = min(right_ranges) if right_ranges else float('inf')
            
            if left_min > right_min:
                twist.angular.z = self.turn_speed
                self.get_logger().info('检测到障碍物，向左转')
            else:
                twist.angular.z = -self.turn_speed
                self.get_logger().info('检测到障碍物，向右转')
        else:
            twist.linear.x = self.forward_speed
            twist.angular.z = 0.0
        
        self.publisher.publish(twist)

def main(args=None):
    rclpy.init(args=args)
    node = ObstacleAvoidanceNode()
    
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        twist = Twist()
        node.publisher.publish(twist)
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
