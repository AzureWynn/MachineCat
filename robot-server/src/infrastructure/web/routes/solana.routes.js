const Router = require('@koa/router');
const koaBody = require('koa-bodyparser');
const solanaService = require('../../../core/blockchain/solana.service');

const router = new Router({ prefix: '/api/solana' });

router.get('/state/:robotId', async (ctx) => {
  try {
    const { robotId } = ctx.params;
    const { userAddress } = ctx.query;
    const authority = userAddress ? new (require('@solana/web3.js').PublicKey)(userAddress) : null;
    const result = await solanaService.getRobotState(robotId, authority);
    
    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    console.error('Get robot state error:', error);
    ctx.status = 500;
    ctx.body = { success: false, error: error.message };
  }
});

router.post('/state/init', koaBody(), async (ctx) => {
  try {
    const { robotId, userAddress } = ctx.request.body;
    
    if (!robotId) {
      ctx.status = 400;
      ctx.body = { success: false, error: 'robotId is required' };
      return;
    }

    const authority = userAddress ? new (require('@solana/web3.js').PublicKey)(userAddress) : null;
    const result = await solanaService.initializeRobotState(robotId, authority);
    
    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    console.error('Initialize robot state error:', error);
    ctx.status = 500;
    ctx.body = { success: false, error: error.message };
  }
});

router.post('/state/update', koaBody(), async (ctx) => {
  try {
    const { robotId, moodDelta, bondDelta, energyDelta, streakDelta } = ctx.request.body;
    
    if (!robotId) {
      ctx.status = 400;
      ctx.body = { success: false, error: 'robotId is required' };
      return;
    }

    const result = await solanaService.updateRobotState(
      robotId,
      moodDelta || 0,
      bondDelta || 0,
      energyDelta || 0,
      streakDelta || 0
    );
    
    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    console.error('Update robot state error:', error);
    ctx.status = 500;
    ctx.body = { success: false, error: error.message };
  }
});

router.post('/quest/complete', koaBody(), async (ctx) => {
  try {
    const { robotId } = ctx.request.body;
    
    if (!robotId) {
      ctx.status = 400;
      ctx.body = { success: false, error: 'robotId is required' };
      return;
    }

    const result = await solanaService.completeQuest(robotId);
    
    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    console.error('Complete quest error:', error);
    ctx.status = 500;
    ctx.body = { success: false, error: error.message };
  }
});

router.post('/transaction/build', koaBody(), async (ctx) => {
  try {
    const { robotId, userAddress } = ctx.request.body;
    
    if (!robotId || !userAddress) {
      ctx.status = 400;
      ctx.body = { success: false, error: 'robotId and userAddress are required' };
      return;
    }

    const result = await solanaService.buildUpdateStateTransaction(
      robotId,
      10,
      5,
      -5,
      1,
      userAddress
    );
    
    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    console.error('Build transaction error:', error);
    ctx.status = 500;
    ctx.body = { success: false, error: error.message };
  }
});

router.post('/transaction/init', koaBody(), async (ctx) => {
  try {
    const { robotId, userAddress } = ctx.request.body;
    
    if (!robotId || !userAddress) {
      ctx.status = 400;
      ctx.body = { success: false, error: 'robotId and userAddress are required' };
      return;
    }

    const result = await solanaService.buildInitializeTransaction(
      robotId,
      userAddress
    );
    
    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    console.error('Build init transaction error:', error);
    ctx.status = 500;
    ctx.body = { success: false, error: error.message };
  }
});

module.exports = router;
