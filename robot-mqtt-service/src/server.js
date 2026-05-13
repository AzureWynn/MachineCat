const Koa = require('koa');
const koaBody = require('koa-bodyparser');
const Router = require('@koa/router');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const MQTTBroker = require('./broker/mqtt-broker');
const deviceRouter = require('./routes/devices.routes');
const logger = require('./broker/logger');

const app = new Koa();
const router = new Router();

app.use(koaBody());

app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (ctx.method === 'OPTIONS') {
    ctx.status = 204;
    return;
  }
  await next();
});

app.use(deviceRouter.routes()).use(deviceRouter.allowedMethods());

router.get('/health', (ctx) => {
  ctx.body = {
    status: 'ok',
    service: 'robot-mqtt-service',
    timestamp: Date.now(),
  };
});

app.use(router.routes()).use(router.allowedMethods());

const HTTP_PORT = process.env.HTTP_PORT || 3003;
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const MQTT_TOPIC_PREFIX = process.env.MQTT_TOPIC_PREFIX || 'robot';

const mqttBroker = new MQTTBroker({
  brokerUrl: MQTT_BROKER_URL,
  topicPrefix: MQTT_TOPIC_PREFIX,
});

mqttBroker.start().then(() => {
  app.listen(HTTP_PORT, () => {
    logger.info(`🚀 MQTT Service HTTP server listening on port ${HTTP_PORT}`);
    logger.info(`📡 MQTT Broker: ${MQTT_BROKER_URL}`);
  });
}).catch((error) => {
  logger.error('❌ MQTT Broker 启动失败:', error);
  process.exit(1);
});

process.on('SIGTERM', () => {
  logger.info('收到 SIGTERM 信号，正在关闭...');
  mqttBroker.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('收到 SIGINT 信号，正在关闭...');
  mqttBroker.stop();
  process.exit(0);
});

module.exports = { app, mqttBroker };
