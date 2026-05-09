const Router = require('@koa/router');
const koaBody = require('koa-bodyparser');
const paymentService = require('../../../core/blockchain/payment.service');

const router = new Router({ prefix: '/api/payment' });

router.post('/quote', koaBody(), async (ctx) => {
  try {
    const { fromChain, toChain, amount, fromToken, toToken, userAddress } = ctx.request.body;
    
    if (!fromChain || !toChain || !amount) {
      ctx.status = 400;
      ctx.body = { success: false, error: 'fromChain, toChain, and amount are required' };
      return;
    }

    const result = await paymentService.getQuote(fromChain, toChain, amount, fromToken, toToken, userAddress);
    
    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    console.error('Get quote error:', error);
    ctx.status = 500;
    ctx.body = { success: false, error: error.message };
  }
});

router.post('/transfer', koaBody(), async (ctx) => {
  try {
    const { quote, userAddress } = ctx.request.body;
    
    if (!quote || !userAddress) {
      ctx.status = 400;
      ctx.body = { success: false, error: 'quote and userAddress are required' };
      return;
    }

    const result = await paymentService.initiateTransfer(quote, userAddress);
    
    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    console.error('Initiate transfer error:', error);
    ctx.status = 500;
    ctx.body = { success: false, error: error.message };
  }
});

router.get('/status', async (ctx) => {
  try {
    const { txHash, chainId } = ctx.query;
    
    if (!txHash) {
      ctx.status = 400;
      ctx.body = { success: false, error: 'txHash is required' };
      return;
    }

    const result = await paymentService.getTransactionStatus(txHash, chainId);
    
    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    console.error('Get transaction status error:', error);
    ctx.status = 500;
    ctx.body = { success: false, error: error.message };
  }
});

router.post('/private', koaBody(), async (ctx) => {
  try {
    const { fromAddress, toAddress, amount } = ctx.request.body;
    
    if (!fromAddress || !toAddress || !amount) {
      ctx.status = 400;
      ctx.body = { success: false, error: 'fromAddress, toAddress, and amount are required' };
      return;
    }

    const result = await paymentService.createPrivateTransaction(fromAddress, toAddress, amount);
    
    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    console.error('Create private transaction error:', error);
    ctx.status = 500;
    ctx.body = { success: false, error: error.message };
  }
});

router.post('/process', koaBody(), async (ctx) => {
  try {
    const { robotId, paymentDetails } = ctx.request.body;
    
    if (!robotId || !paymentDetails) {
      ctx.status = 400;
      ctx.body = { success: false, error: 'robotId and paymentDetails are required' };
      return;
    }

    const result = await paymentService.processPayment(robotId, paymentDetails);
    
    ctx.status = 200;
    ctx.body = result;
  } catch (error) {
    console.error('Process payment error:', error);
    ctx.status = 500;
    ctx.body = { success: false, error: error.message };
  }
});

router.get('/mode', async (ctx) => {
  try {
    const modeInfo = paymentService.getMode();
    ctx.status = 200;
    ctx.body = { success: true, data: modeInfo };
  } catch (error) {
    console.error('Get payment mode error:', error);
    ctx.status = 500;
    ctx.body = { success: false, error: error.message };
  }
});

module.exports = router;
