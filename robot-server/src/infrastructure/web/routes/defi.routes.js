const Router = require('@koa/router');
const OKXDeFiService = require('../../../core/blockchain/okx-defi.service');
const WalletAdapter = require('../../../core/blockchain/wallet-adapter');

const router = new Router({ prefix: '/api/defi' });

const defiService = new OKXDeFiService();
const walletAdapter = new WalletAdapter();

router.get('/yield', async (ctx) => {
  try {
    const { chain = 'solana' } = ctx.query;
    const result = await defiService.getYieldOpportunities(chain);
    ctx.body = result;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, error: error.message };
  }
});

router.get('/staking', async (ctx) => {
  try {
    const { chain = 'solana' } = ctx.query;
    const result = await defiService.getStakingOptions(chain);
    ctx.body = result;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, error: error.message };
  }
});

router.get('/lending', async (ctx) => {
  try {
    const { chain = 'solana' } = ctx.query;
    const result = await defiService.getLendingRates(chain);
    ctx.body = result;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, error: error.message };
  }
});

router.get('/market', async (ctx) => {
  try {
    const { token = 'SOL' } = ctx.query;
    const result = await defiService.getMarketData(token);
    ctx.body = result;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, error: error.message };
  }
});

router.get('/smart-money', async (ctx) => {
  try {
    const { chain = 'solana' } = ctx.query;
    const result = await defiService.getSmartMoneySignals(chain);
    ctx.body = result;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, error: error.message };
  }
});

router.get('/portfolio/:address', async (ctx) => {
  try {
    const { address } = ctx.params;
    const result = await defiService.getPortfolioSummary(address);
    ctx.body = result;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, error: error.message };
  }
});

router.get('/balance/:address', async (ctx) => {
  try {
    const { address } = ctx.params;
    const result = await walletAdapter.getBalance(address);
    ctx.body = result;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, error: error.message };
  }
});

router.get('/tokens/:address', async (ctx) => {
  try {
    const { address } = ctx.params;
    const result = await walletAdapter.getTokenHoldings(address);
    ctx.body = result;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, error: error.message };
  }
});

router.post('/swap/quote', async (ctx) => {
  try {
    const { fromChain, toChain, fromToken, toToken, amount, slippage } = ctx.request.body;
    const result = await defiService.getSwapQuote({
      fromChain,
      toChain,
      fromToken,
      toToken,
      amount,
      slippage,
    });
    ctx.body = result;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, error: error.message };
  }
});

router.get('/status', async (ctx) => {
  ctx.body = {
    success: true,
    data: {
      provider: 'okx',
      apiKeyConfigured: !!process.env.OKX_API_KEY,
      projectIdConfigured: !!process.env.OKX_PROJECT_ID,
      walletProvider: process.env.WALLET_PROVIDER || 'phantom',
    },
  };
});

module.exports = router;
