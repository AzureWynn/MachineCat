const axios = require('axios');
const EventEmitter = require('events');
const logger = require('../../broker/logger');

class MQTTServiceClient extends EventEmitter {
  constructor(baseUrl) {
    super();
    this.baseUrl = baseUrl || 'http://localhost:3003';
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 5000,
    });
  }

  async sendCommand(robotId, actionData) {
    let action;
    let params = {};

    if (typeof actionData === 'string') {
      action = actionData;
    } else if (typeof actionData === 'object' && actionData.action) {
      action = actionData.action;
      params = actionData.params || {};
    } else {
      throw new Error(`无效的指令格式: ${JSON.stringify(actionData)}`);
    }

    try {
      const response = await this.client.post(`/api/devices/${robotId}/command`, {
        action,
        params,
      });

      logger.info(`[MQTT Service] 指令已发送: ${action}`);
      this.emit('command_sent', { robotId, action, params });
      return response.data;
    } catch (error) {
      logger.error(`[MQTT Service] 发送指令失败: ${error.message}`);
      this.emit('error', error);
      throw error;
    }
  }

  async getDevice(robotId) {
    try {
      const response = await this.client.get(`/api/devices/${robotId}`);
      return response.data.data;
    } catch (error) {
      logger.error(`[MQTT Service] 获取设备失败: ${error.message}`);
      throw error;
    }
  }

  async getAllDevices() {
    try {
      const response = await this.client.get('/api/devices');
      return response.data.data;
    } catch (error) {
      logger.error(`[MQTT Service] 获取设备列表失败: ${error.message}`);
      throw error;
    }
  }

  async testConnection() {
    try {
      const response = await this.client.get('/health');
      return response.data.status === 'ok';
    } catch (error) {
      logger.error(`[MQTT Service] 连接测试失败: ${error.message}`);
      throw error;
    }
  }
}

module.exports = MQTTServiceClient;
