const Router = require('@koa/router');
const router = new Router({ prefix: '/api/devices' });
const logger = require('../broker/logger');

let mqttBroker;

router.get('/', (ctx) => {
  const devices = mqttBroker.getAllDevices();
  ctx.body = {
    success: true,
    data: devices,
    count: devices.length,
  };
});

router.get('/:id', (ctx) => {
  const device = mqttBroker.getDevice(ctx.params.id);
  if (!device) {
    ctx.status = 404;
    ctx.body = {
      success: false,
      error: '设备不存在',
    };
    return;
  }

  ctx.body = {
    success: true,
    data: device,
  };
});

router.post('/:id/command', async (ctx) => {
  const { action, params } = ctx.request.body;

  if (!action) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      error: '缺少 action 参数',
    };
    return;
  }

  try {
    await mqttBroker.sendCommand(ctx.params.id, action, params || {});
    ctx.body = {
      success: true,
      data: {
        deviceId: ctx.params.id,
        action,
        params: params || {},
        timestamp: Date.now(),
      },
    };
  } catch (error) {
    logger.error('[API] 发送指令失败:', error.message);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: error.message,
    };
  }
});

router.post('/register', (ctx) => {
  const { deviceId } = ctx.request.body;

  if (!deviceId) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      error: '缺少 deviceId 参数',
    };
    return;
  }

  mqttBroker.registerDevice(deviceId);
  const device = mqttBroker.getDevice(deviceId);

  ctx.body = {
    success: true,
    data: device,
  };
});

function setMQTTBroker(broker) {
  mqttBroker = broker;
}

module.exports = { router, setMQTTBroker };
