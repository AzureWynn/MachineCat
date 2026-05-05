const http = require('http');
const EventEmitter = require('events');

class RobotHTTPConnector extends EventEmitter {
  constructor(robotIP = '192.168.4.1') {
    super();
    this.robotIP = robotIP;
    this.port = 80;
    
    // 命令映射：将动作名称转换为 ESP32 Web 界面的路径
    this.commandMap = {
      'forward': '/20/on',      // 前进
      'left': '/21/on',         // 左转
      'stop': '/22/on',         // 停止
      'right': '/23/on',        // 右转
      'backward': '/24/on',     // 后退
      'walk': '/25/on',         // 步行
      'sit': '/26/on',          // 坐姿
      'shakehand': '/27/on',    // 握手
      'follow': '/28/on',       // 跟随
      'step': '/29/on',         // 踏步
      'swing': '/30/on',        // 摇摆
      'updown': '/31/on',       // 起卧
      'kick': '/32/on',         // 踢球
      'auto_walk': '/33/on',    // 自动行走
      'balance': '/34/on',      // 站立平衡
      'calibration': '/35/on'   // 舵机校对
    };
  }

  sendCommand(robotId, actionData) {
    // 支持两种格式：
    // 1. 对象格式: { action: 'sit', params: {} }
    // 2. 字符串格式: 'sit'
    let action;
    if (typeof actionData === 'string') {
      action = actionData;
    } else if (typeof actionData === 'object' && actionData.action) {
      action = actionData.action;
    } else {
      console.error(`[HTTP] 无效的指令格式: ${JSON.stringify(actionData)}`);
      this.emit('error', new Error(`无效的指令格式: ${JSON.stringify(actionData)}`));
      return false;
    }

    const path = this.commandMap[action];
    
    if (!path) {
      console.error(`[HTTP] 未知动作: ${action}`);
      this.emit('error', new Error(`未知动作: ${action}`));
      return false;
    }

    console.log(`[HTTP] 发送指令: ${action} -> ${path}`);

    const options = {
      hostname: this.robotIP,
      port: this.port,
      path: path,
      method: 'GET',
      timeout: 3000
    };

    const req = http.request(options, (res) => {
      console.log(`[HTTP] 指令 ${action} 已发送，状态码: ${res.statusCode}`);
      
      // 消耗响应数据，避免内存泄漏
      res.on('data', () => {});
      
      this.emit('command_sent', { action, path, statusCode: res.statusCode });
    });

    req.on('error', (error) => {
      console.error(`[HTTP] 发送指令失败: ${error.message}`);
      this.emit('error', error);
    });

    req.on('timeout', () => {
      req.destroy();
      console.error(`[HTTP] 请求超时: ${this.robotIP}`);
      this.emit('error', new Error('请求超时'));
    });

    req.end();
    return true;
  }

  async testConnection() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.robotIP,
        port: this.port,
        path: '/',
        method: 'GET',
        timeout: 3000
      };

      const req = http.request(options, (res) => {
        console.log(`[HTTP] ESP32 连接测试成功，状态码: ${res.statusCode}`);
        res.on('data', () => {});
        resolve(true);
      });

      req.on('error', (error) => {
        console.error(`[HTTP] ESP32 连接测试失败: ${error.message}`);
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('连接超时'));
      });

      req.end();
    });
  }
}

module.exports = RobotHTTPConnector;
