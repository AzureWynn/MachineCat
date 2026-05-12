const Router = require('@koa/router');
const koaBody = require('koa-bodyparser');

const router = new Router({ prefix: '/api/interaction' });

let interactionService;
let robotConnector;

function setInteractionService(service) {
  interactionService = service;
}

function setRobotConnector(connector) {
  robotConnector = connector;
}

const checkWalletMiddleware = async (ctx, next) => {
  const { userAddress } = ctx.request.body;
  
  if (!userAddress) {
    ctx.status = 401;
    ctx.body = { error: 'Wallet not connected. Please connect wallet first.' };
    return;
  }
  
  console.log(`[Wallet] 用户钱包地址: ${userAddress}`);
  await next();
};

router.post('/:robotId/chat', koaBody(), checkWalletMiddleware, async (ctx) => {
  try {
    const { robotId } = ctx.params;
    const { userInput, userAddress } = ctx.request.body;

    if (!userInput) {
      ctx.status = 400;
      ctx.body = { error: 'userInput is required' };
      return;
    }

    const result = await interactionService.processInteraction(robotId, userInput, userAddress);

    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    console.error('Interaction error:', error);
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

router.post('/:robotId/command', koaBody(), async (ctx) => {
  try {
    const { robotId } = ctx.params;
    const { action } = ctx.request.body;

    if (!action) {
      ctx.status = 400;
      ctx.body = { error: 'action is required' };
      return;
    }

    if (!robotConnector) {
      ctx.status = 500;
      ctx.body = { error: 'Robot connector not initialized' };
      return;
    }

    robotConnector.sendCommand(robotId, { action, params: {} });

    ctx.status = 200;
    ctx.body = {
      success: true,
      robotId,
      action,
      message: `指令 ${action} 已发送`,
    };
  } catch (error) {
    console.error('Command error:', error);
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

module.exports = { router, setInteractionService, setRobotConnector };
