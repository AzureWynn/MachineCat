const EventEmitter = require('events');

class RobotBluetoothConnector extends EventEmitter {
  constructor() {
    super();
    this.deviceName = 'ESP32CAT';
    this.connected = false;
    
    // 命令映射：将动作名称转换为 ESP32 识别的单字符
    this.commandMap = {
      'forward': 'f',
      'backward': 'b',
      'left': 'l',
      'right': 'r',
      'stop': 'x',
      'walk': 'w',
      'sit': 't',
      'shakehand': 'h',
      'follow': 'm',
      'step': 's',
      'swing': 'y',
      'updown': 'u',
      'kick': 'k',
      'auto_walk': 'a',
      'balance': 'i',
      'calibration': 'c',
      'dance': 'd',
      'greeting': 'g'
    };

    // 尝试加载蓝牙串口库
    this.bluetoothSerial = null;
    try {
      this.bluetoothSerial = require('bluetooth-serial-port');
    } catch (error) {
      console.warn('[蓝牙] 未安装 bluetooth-serial-port 库');
      console.warn('[蓝牙] 运行: npm install bluetooth-serial-port');
    }
  }

  async connect() {
    console.log(`[蓝牙] 开始搜索设备: ${this.deviceName}`);
    
    if (!this.bluetoothSerial) {
      throw new Error('请先安装依赖: npm install bluetooth-serial-port');
    }

    return new Promise((resolve, reject) => {
      const btSerial = new this.bluetoothSerial.BluetoothSerialPort();

      btSerial.on('found', (address, name) => {
        console.log(`[蓝牙] 发现设备: ${name} (${address})`);
        
        if (name === this.deviceName) {
          btSerial.connect(address, () => {
            this.connected = true;
            this.deviceAddress = address;
            this.btSerial = btSerial;
            
            console.log(`[蓝牙] 成功连接到 ${this.deviceName}`);
            this.emit('connected');
            resolve();
          }, (error) => {
            console.error(`[蓝牙] 连接失败: ${error.message}`);
            reject(error);
          });
        }
      });

      btSerial.on('failure', (error) => {
        console.error('[蓝牙] 搜索失败:', error.message);
        reject(error);
      });

      btSerial.inquire();

      // 设置超时
      setTimeout(() => {
        if (!this.connected) {
          reject(new Error(`未找到设备 ${this.deviceName}，请确保设备已开机`));
        }
      }, 10000);
    });
  }

  sendCommand(action, params = {}) {
    if (!this.connected) {
      console.error('[蓝牙] 未连接，请先调用 connect()');
      return false;
    }

    const commandChar = this.commandMap[action];
    if (!commandChar) {
      console.error(`[蓝牙] 未知动作: ${action}`);
      return false;
    }

    console.log(`[蓝牙] 发送指令: ${action} -> '${commandChar}'`);

    this.btSerial.write(Buffer.from(commandChar, 'utf-8'), (error) => {
      if (error) {
        console.error(`[蓝牙] 发送失败: ${error.message}`);
        this.emit('error', error);
      } else {
        console.log(`[蓝牙] 指令已发送: ${action}`);
        this.emit('command_sent', { action, char: commandChar });
      }
    });

    return true;
  }

  disconnect() {
    if (this.btSerial) {
      this.btSerial.close();
    }
    this.connected = false;
    console.log('[蓝牙] 已断开连接');
    this.emit('disconnected');
  }
}

module.exports = RobotBluetoothConnector;
