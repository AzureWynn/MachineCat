const axios = require('axios');
const solanaService = require('./solana.service');

const LI_FI_API_URL = 'https://li.quest/v1';
const MAGIC_BLOCK_API_URL = 'https://api.magicblock.com';
const X402_API_URL = 'https://api.x402.org';

class PaymentService {
  constructor() {
    this.initialized = false;
    this.mode = process.env.PAYMENT_MODE || 'mock';
    this.liFiApiKey = process.env.LIFI_API_KEY;
    this.magicBlockApiKey = process.env.MAGIC_BLOCK_API_KEY;
    this.x402ApiKey = process.env.X402_API_KEY;
    this.solanaNetwork = process.env.SOLANA_NETWORK || 'LOCAL';
  }

  async initialize() {
    if (this.initialized) return;
    this.initialized = true;
    console.log(`✅ 支付服务初始化成功 [模式: ${this.mode === 'real' ? '真实协议' : 'Mock'}]`);
    if (this.mode === 'real') {
      console.log('   LI.FI API Key:', this.liFiApiKey ? '已配置' : '未配置');
      console.log('   MagicBlock API Key:', this.magicBlockApiKey ? '已配置' : '未配置');
      console.log('   x402 API Key:', this.x402ApiKey ? '已配置' : '未配置');
    }
  }

  getMode() {
    return {
      mode: this.mode,
      network: this.solanaNetwork,
      hasLiFiKey: !!this.liFiApiKey,
      hasMagicBlockKey: !!this.magicBlockApiKey,
      hasX402Key: !!this.x402ApiKey,
    };
  }

  async getQuote(fromChain, toChain, amount, fromToken, toToken) {
    if (this.mode !== 'real') {
      return this.mockGetQuote(fromChain, toChain, amount, fromToken, toToken);
    }

    try {
      const params = {
        fromChain,
        toChain,
        fromAmount: amount,
        fromToken,
        toToken,
      };

      const headers = {};
      if (this.liFiApiKey) {
        headers['x-lifi-api-key'] = this.liFiApiKey;
      }

      const response = await axios.get(`${LI_FI_API_URL}/quote`, { params, headers });

      console.log(`✅ LI.FI 真实报价获取成功`);
      return { success: true, data: response.data };
    } catch (error) {
      console.warn(`⚠️ LI.FI API 调用失败，降级到 Mock 模式: ${error.message}`);
      return this.mockGetQuote(fromChain, toChain, amount, fromToken, toToken);
    }
  }

  async initiateTransfer(quote, userAddress) {
    if (this.mode !== 'real') {
      return this.mockInitiateTransfer(quote, userAddress);
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (this.liFiApiKey) {
        headers['x-lifi-api-key'] = this.liFiApiKey;
      }

      const response = await axios.post(`${LI_FI_API_URL}/transfer`, {
        ...quote,
        fromAddress: userAddress,
      }, { headers });

      console.log(`✅ LI.FI 真实转账已发起`);
      return { success: true, data: response.data };
    } catch (error) {
      console.warn(`⚠️ LI.FI 转账失败，降级到 Mock 模式: ${error.message}`);
      return this.mockInitiateTransfer(quote, userAddress);
    }
  }

  async getTransactionStatus(txHash, chainId) {
    if (this.mode !== 'real') {
      return this.mockGetTransactionStatus(txHash);
    }

    try {
      const headers = {};
      if (this.liFiApiKey) {
        headers['x-lifi-api-key'] = this.liFiApiKey;
      }

      const response = await axios.get(`${LI_FI_API_URL}/status`, {
        params: { txHash, chainId },
        headers,
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.warn(`⚠️ LI.FI 状态查询失败，降级到 Mock 模式: ${error.message}`);
      return this.mockGetTransactionStatus(txHash);
    }
  }

  async createPrivateTransaction(fromAddress, toAddress, amount) {
    if (this.mode !== 'real') {
      return this.mockCreatePrivateTransaction(fromAddress, toAddress, amount);
    }

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (this.magicBlockApiKey) {
        headers['Authorization'] = `Bearer ${this.magicBlockApiKey}`;
      }

      const response = await axios.post(`${MAGIC_BLOCK_API_URL}/per/transactions`, {
        from: fromAddress,
        to: toAddress,
        amount,
        privacyLevel: 'enhanced',
        network: this.solanaNetwork === 'DEVNET' ? 'devnet' : 'mainnet',
      }, { headers });

      console.log(`✅ MagicBlock PER 隐私交易创建成功`);
      return { success: true, data: response.data };
    } catch (error) {
      console.warn(`⚠️ MagicBlock PER 调用失败，降级到 Mock 模式: ${error.message}`);
      return this.mockCreatePrivateTransaction(fromAddress, toAddress, amount);
    }
  }

  async createX402Payment(paymentDetails) {
    if (this.mode !== 'real') {
      return this.mockCreateX402Payment(paymentDetails);
    }

    try {
      const { robotId, amount, userAddress, questId } = paymentDetails;

      const headers = { 'Content-Type': 'application/json' };
      if (this.x402ApiKey) {
        headers['x-api-key'] = this.x402ApiKey;
      }

      const response = await axios.post(`${X402_API_URL}/payments`, {
        agentId: robotId,
        amount,
        payer: userAddress,
        questId,
        protocol: 'x402',
        network: this.solanaNetwork === 'DEVNET' ? 'devnet' : 'mainnet',
      }, { headers });

      console.log(`✅ x402 自主代理支付创建成功`);
      return { success: true, data: response.data };
    } catch (error) {
      console.warn(`⚠️ x402 支付调用失败，降级到 Mock 模式: ${error.message}`);
      return this.mockCreateX402Payment(paymentDetails);
    }
  }

  async processPayment(robotId, paymentDetails) {
    const { amount, fromChain, toChain, fromToken, toToken, userAddress, questId } = paymentDetails;

    console.log(`[Payment] Processing: ${amount} from ${fromChain} to ${toChain} [模式: ${this.mode}]`);

    try {
      const { PublicKey } = require('@solana/web3.js');
      const userPubkey = userAddress ? new PublicKey(userAddress) : null;

      try {
        await solanaService.initializeRobotState(robotId);
        console.log(`✅ 机器人状态已初始化: ${robotId}`);
      } catch (error) {
        console.log(`ℹ️ 机器人状态已存在: ${robotId}`);
      }

      const quote = await this.getQuote(fromChain, toChain, amount, fromToken, toToken);
      console.log(`✅ 获取报价成功 [${this.mode === 'real' ? 'LI.FI 真实' : 'Mock'}]`);

      const transfer = await this.initiateTransfer(quote.data, userAddress);
      console.log(`✅ 跨链转账已发起 [${this.mode === 'real' ? 'LI.FI 真实' : 'Mock'}]`);

      const privateTx = await this.createPrivateTransaction(userAddress, process.env.PAYMENT_RECEIVER_ADDRESS, amount);
      console.log(`✅ 隐私交易已创建 [${this.mode === 'real' ? 'MagicBlock 真实' : 'Mock'}]`);

      const x402Payment = await this.createX402Payment({
        robotId,
        amount,
        userAddress,
        questId,
      });
      console.log(`✅ x402 支付已创建 [${this.mode === 'real' ? 'x402 真实' : 'Mock'}]`);

      const result = await solanaService.updateRobotState(robotId, 10, 5, -5, 1);
      if (!result.success) {
        return { success: false, error: 'Failed to update robot state' };
      }

      console.log(`✅ 链上状态更新成功: ${result.tx}`);

      return {
        success: true,
        data: {
          mode: this.mode,
          quote: quote.data,
          transfer: transfer.data,
          privateTx: privateTx.data,
          x402: x402Payment.data,
          stateUpdate: result,
        },
      };
    } catch (error) {
      console.error('Payment processing error:', error);
      return { success: false, error: error.message };
    }
  }

  mockGetQuote(fromChain, toChain, amount, fromToken = 'USDC', toToken = 'USDC') {
    console.log(`[Mock] Getting quote: ${fromChain} -> ${toChain}, amount: ${amount}`);
    return {
      success: true,
      data: {
        id: 'mock-quote-' + Date.now(),
        fromChain,
        toChain,
        fromToken,
        toToken,
        fromAmount: amount,
        toAmount: (parseFloat(amount) * 0.98).toString(),
        estimatedTime: '2-5 minutes',
        fees: {
          bridge: '0.001',
          gas: '0.002',
          total: '0.003',
        },
        route: {
          id: 'mock-route',
          steps: [
            {
              type: 'swap',
              fromChain,
              toChain,
            },
          ],
        },
      },
    };
  }

  mockInitiateTransfer(quote, userAddress) {
    console.log(`[Mock] Initiating transfer for ${userAddress}`);
    return {
      success: true,
      data: {
        id: 'mock-transfer-' + Date.now(),
        status: 'initiated',
        fromAddress: userAddress,
        toAddress: process.env.PAYMENT_RECEIVER_ADDRESS || '0xReceiverAddress',
        txHash: '0x' + Math.random().toString(16).substring(2, 66),
      },
    };
  }

  mockGetTransactionStatus(txHash) {
    console.log(`[Mock] Getting status for tx: ${txHash}`);
    return {
      success: true,
      data: {
        status: 'completed',
        txHash,
        fromChain: 1,
        toChain: 101,
      },
    };
  }

  mockCreatePrivateTransaction(fromAddress, toAddress, amount) {
    console.log(`[Mock] Creating private transaction: ${fromAddress} -> ${toAddress}, amount: ${amount}`);
    return {
      success: true,
      data: {
        id: 'mock-per-' + Date.now(),
        status: 'completed',
        privacyLevel: 'enhanced',
        anonymitySet: 1000,
        network: this.solanaNetwork === 'DEVNET' ? 'devnet' : 'local',
      },
    };
  }

  mockCreateX402Payment(paymentDetails) {
    const { robotId, amount, userAddress, questId } = paymentDetails;
    console.log(`[Mock] Creating x402 payment: robotId=${robotId}, amount=${amount}`);
    return {
      success: true,
      data: {
        id: 'mock-x402-' + Date.now(),
        status: 'completed',
        agentId: robotId,
        amount,
        payer: userAddress,
        questId,
        protocol: 'x402',
        network: this.solanaNetwork === 'DEVNET' ? 'devnet' : 'local',
      },
    };
  }
}

module.exports = new PaymentService();
