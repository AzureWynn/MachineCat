const mqtt = require('mqtt');
const { v4: uuidv4 } = require('uuid');
const logger = require('./logger');

class MQTTBroker {
  constructor(config) {
    this.brokerUrl = config.brokerUrl || 'mqtt://localhost:1883';
    this.topicPrefix = config.topicPrefix || 'robot';
    this.server = null;
    this.clients = new Map();
    this.deviceRegistry = new Map();
  }

  start() {
    return new Promise((resolve, reject) => {
      const options = {
        clientId: `mqtt-broker-${uuidv4()}`,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
      };

      logger.info(`[MQTT Broker] 启动中... ${this.brokerUrl}`);

      this.server = mqtt.connect(this.brokerUrl, options);

      this.server.on('connect', () => {
        logger.info('[MQTT Broker] 已连接');
        this.setupTopics();
        resolve();
      });

      this.server.on('error', (error) => {
        logger.error('[MQTT Broker] 错误:', error.message);
        reject(error);
      });

      this.server.on('close', () => {
        logger.warn('[MQTT Broker] 连接关闭');
      });

      this.server.on('message', (topic, message) => {
        this.handleMessage(topic, message);
      });
    });
  }

  setupTopics() {
    const topics = [
      `${this.topicPrefix}/+/command`,
      `${this.topicPrefix}/+/status`,
      `${this.topicPrefix}/+/telemetry`,
      `${this.topicPrefix}/+/response`,
    ];

    topics.forEach((topic) => {
      this.server.subscribe(topic, (err) => {
        if (err) {
          logger.error(`[MQTT Broker] 订阅失败 ${topic}:`, err.message);
        } else {
          logger.info(`[MQTT Broker] 已订阅: ${topic}`);
        }
      });
    });
  }

  handleMessage(topic, message) {
    try {
      const payload = JSON.parse(message.toString());
      const topicParts = topic.split('/');
      const robotId = topicParts[1];
      const messageType = topicParts[2];

      logger.debug(`[MQTT Broker] 收到消息 [${topic}]:`, payload);

      if (messageType === 'status') {
        this.updateDeviceStatus(robotId, payload);
      } else if (messageType === 'telemetry') {
        this.updateDeviceTelemetry(robotId, payload);
      }
    } catch (error) {
      logger.error('[MQTT Broker] 消息解析失败:', error.message);
    }
  }

  updateDeviceStatus(deviceId, status) {
    if (!this.deviceRegistry.has(deviceId)) {
      this.registerDevice(deviceId);
    }

    const device = this.deviceRegistry.get(deviceId);
    device.status = { ...status, lastUpdate: Date.now() };
    logger.info(`[设备状态] ${deviceId}:`, status);
  }

  updateDeviceTelemetry(deviceId, telemetry) {
    if (!this.deviceRegistry.has(deviceId)) {
      this.registerDevice(deviceId);
    }

    const device = this.deviceRegistry.get(deviceId);
    device.telemetry = { ...telemetry, lastUpdate: Date.now() };
  }

  registerDevice(deviceId) {
    const device = {
      id: deviceId,
      status: { online: false },
      telemetry: {},
      registeredAt: Date.now(),
      lastUpdate: Date.now(),
    };

    this.deviceRegistry.set(deviceId, device);
    logger.info(`[设备注册] 新设备: ${deviceId}`);
  }

  sendCommand(deviceId, action, params = {}) {
    if (!this.server || !this.server.connected) {
      throw new Error('MQTT Broker 未连接');
    }

    const topic = `${this.topicPrefix}/${deviceId}/command`;
    const payload = {
      action,
      params,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      this.server.publish(topic, JSON.stringify(payload), { qos: 1 }, (err) => {
        if (err) {
          logger.error(`[MQTT Broker] 发送失败:`, err.message);
          reject(err);
        } else {
          logger.info(`[MQTT Broker] 指令已发送 [${topic}]:`, payload);
          resolve();
        }
      });
    });
  }

  getDevice(deviceId) {
    return this.deviceRegistry.get(deviceId);
  }

  getAllDevices() {
    return Array.from(this.deviceRegistry.values());
  }

  stop() {
    if (this.server) {
      this.server.end(true, () => {
        logger.info('[MQTT Broker] 已关闭');
      });
    }
  }
}

module.exports = MQTTBroker;
