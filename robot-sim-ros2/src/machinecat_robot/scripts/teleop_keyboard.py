#!/usr/bin/env python3

import sys
import termios
import tty
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist

MSG = """
控制机器猫移动
---------------------------
   前进: w
   后退: s
   左转: a
   右转: d
   停止: 空格键

按 q 退出
---------------------------
"""

class TeleopNode(Node):
    def __init__(self):
        super().__init__('teleop_keyboard')
        self.publisher = self.create_publisher(Twist, '/cmd_vel', 10)
        self.get_logger().info('机器猫键盘控制节点已启动')
        self.get_logger().info('使用 w/a/s/d 控制移动')
    
    def run(self):
        settings = termios.tcgetattr(sys.stdin)
        
        try:
            print(MSG)
            while True:
                key = self.get_key(settings)
                
                twist = Twist()
                
                if key == 'w':
                    twist.linear.x = 0.5
                elif key == 's':
                    twist.linear.x = -0.5
                elif key == 'a':
                    twist.angular.z = 1.0
                elif key == 'd':
                    twist.angular.z = -1.0
                elif key == ' ':
                    twist.linear.x = 0.0
                    twist.angular.z = 0.0
                elif key == 'q':
                    break
                
                self.publisher.publish(twist)
        
        finally:
            termios.tcsetattr(sys.stdin, termios.TCSADRAIN, settings)
            twist = Twist()
            self.publisher.publish(twist)
    
    def get_key(self, settings):
        tty.setraw(sys.stdin.fileno())
        key = sys.stdin.read(1)
        termios.tcsetattr(sys.stdin, termios.TCSADRAIN, settings)
        return key

def main(args=None):
    rclpy.init(args=args)
    node = TeleopNode()
    
    try:
        node.run()
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
