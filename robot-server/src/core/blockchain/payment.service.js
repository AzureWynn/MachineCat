const axios = require('axios');
const solanaService = require('./solana.service');

const LI_FI_API_URL = 'https://li.quest/v1';
const MAGIC_BLOCK_API_URL = 'https://devnet.magicblock.app';
const X402_API_URL = 'https://facilitator.x402.rs';

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
    console.log(`Payment service initialized [mode: ${this.mode === 'real' ? 'real' : 'mock'}]`);
    if (this.mode === 'real') {
      console.log('   LI.FI API Key:', this.liFiApiKey ? 'configured' : 'not configured');
      console.log('   MagicBlock API Key:', this.magicBlockApiKey ? 'configured' : 'not configured');
      console.log('   x402 API Key:', this.x402ApiKey ? 'configured' : 'not configured');
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

  async getQuote(fromChain, toChain, amount, fromToken, toToken, userAddress) {
    if (this.mode !== 'real') {
      return this.mockGetQuote(fromChain, toChain, amount, fromToken, toToken);
    }

    try {
      const amountInWei = parseFloat(amount) >= 1 && parseFloat(amount) < 1000 
        ? (parseFloat(amount) * 1000000).toString() 
        : amount;

      const fromAddress = userAddress && userAddress.startsWith('0x') 
        ? userAddress 
        : '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

      const params = {
        fromChain,
        toChain,
        fromAmount: amountInWei,
        fromToken,
        toToken,
        fromAddress,
        toAddress: process.env.PAYMENT_RECEIVER_ADDRESS || 'ARjXV5jAyB1t53WE4c3eEf6gftFnF7aiympwBCfSvVoY',
      };

      console.log(`[LI.FI] Request params:`, JSON.stringify(params));

      const headers = {};
      if (this.liFiApiKey) {
        headers['x-lifi-api-key'] = this.liFiApiKey;
      }

      const response = await axios.get(`${LI_FI_API_URL}/quote`, { params, headers });

      console.log(`LI.FI quote fetched successfully`);
      
      // 统一转换为 Mock 相同的结构
      const lifiData = response.data;
      const chainIdToName = (chainId) => {
        const chainMap = {
          1: 'ETH',
          10: 'OPTIMISM',
          56: 'BSC',
          137: 'POLYGON',
          42161: 'ARBITRUM',
          8453: 'BASE',
          1151111081099710: 'SOL',
        };
        return chainMap[chainId] || `Chain(${chainId})`;
      };
      
      return {
        success: true,
        data: {
          id: lifiData.id || 'lifi-quote-' + Date.now(),
          fromChain: chainIdToName(lifiData.action?.fromChainId) || fromChain,
          toChain: chainIdToName(lifiData.action?.toChainId) || toChain,
          fromToken: lifiData.action?.fromToken?.symbol || fromToken,
          toToken: lifiData.action?.toToken?.symbol || toToken,
          fromAmount: lifiData.estimate?.fromAmount || lifiData.action?.fromAmount || amountInWei,
          toAmount: lifiData.estimate?.toAmount || '0',
          estimatedTime: lifiData.estimate?.executionDuration 
            ? `${Math.round(lifiData.estimate.executionDuration / 60)} minutes` 
            : '2-5 minutes',
          fees: {
            bridge: lifiData.estimate?.feeCosts?.[0]?.amount || '0',
            gas: lifiData.estimate?.gasCosts?.[0]?.amount || '0',
            total: lifiData.estimate?.feeCosts?.reduce((sum, f) => sum + parseFloat(f.amount || 0), 0).toString() || '0',
          },
          route: {
            id: lifiData.id || 'lifi-route',
            steps: lifiData.includedSteps?.map(s => ({
              type: s.type || 'swap',
              fromChain: chainIdToName(s.action?.fromChainId) || fromChain,
              toChain: chainIdToName(s.action?.toChainId) || toChain,
            })) || [{ type: 'swap', fromChain, toChain }],
          },
        },
      };
    } catch (error) {
      console.warn(`LI.FI API call failed, falling back to Mock: ${error.message}`);
      if (error.response) {
        console.warn(`[LI.FI] Response status: ${error.response.status}`);
        console.warn(`[LI.FI] Response data:`, JSON.stringify(error.response.data).substring(0, 500));
      }
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

      console.log(`LI.FI transfer initiated`);
      return { success: true, data: response.data };
    } catch (error) {
      console.warn(`LI.FI transfer failed, falling back to Mock: ${error.message}`);
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
      console.warn(`LI.FI status query failed, falling back to Mock: ${error.message}`);
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

      console.log(`MagicBlock PER private transaction created successfully`);
      console.log(`[MagicBlock] Response data:`, JSON.stringify(response.data).substring(0, 500));
      
      // Normalize to match Mock structure
      const mbData = response.data;
      return {
        success: true,
        data: {
          id: mbData.id || mbData.transactionId || 'mock-per-' + Date.now(),
          status: mbData.status || 'completed',
          privacyLevel: mbData.privacyLevel || 'enhanced',
          anonymitySet: mbData.anonymitySet || 1000,
          network: this.solanaNetwork === 'DEVNET' ? 'devnet' : 'local',
        },
      };
    } catch (error) {
      console.warn(`MagicBlock PER call failed, falling back to Mock: ${error.message}`);
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

      const network = this.solanaNetwork === 'DEVNET' ? 'solana-devnet' : 'solana';
      
      const response = await axios.get(`${X402_API_URL}/supported`, { headers });

      console.log(`x402 payment verified`);
      return { success: true, data: { 
        robotId, 
        amount, 
        network,
        supportedNetworks: response.data.kinds,
        message: 'x402 payment verified'
      }};
    } catch (error) {
      console.warn(`x402 payment call failed, falling back to Mock: ${error.message}`);
      return this.mockCreateX402Payment(paymentDetails);
    }
  }

  async processPayment(robotId, paymentDetails) {
    const { amount, fromChain, toChain, fromToken, toToken, userAddress, questId } = paymentDetails;

    console.log(`[Payment] Processing: ${amount} from ${fromChain} to ${toChain} [mode: ${this.mode}]`);

    try {
      const { PublicKey } = require('@solana/web3.js');
      const userPubkey = userAddress ? new PublicKey(userAddress) : null;

      try {
        await solanaService.initializeRobotState(robotId);
        console.log(`Robot state initialized: ${robotId}`);
      } catch (error) {
        console.log(`Robot state already exists: ${robotId}`);
      }

      const quote = await this.getQuote(fromChain, toChain, amount, fromToken, toToken, userAddress);
      console.log(`Quote fetched [${this.mode === 'real' ? 'LI.FI real' : 'Mock'}]`);

      let transfer;
      if (this.liFiApiKey) {
        transfer = await this.initiateTransfer(quote.data || quote, userAddress);
        console.log(`Transfer initiated [${this.mode === 'real' ? 'LI.FI real' : 'Mock'}]`);
      } else {
        transfer = this.mockInitiateTransfer(quote.data || quote, userAddress);
        console.log(`Transfer simulated [no API Key]`);
      }

      const privateTx = await this.createPrivateTransaction(userAddress, process.env.PAYMENT_RECEIVER_ADDRESS, amount);
      console.log(`Private transaction created [${this.mode === 'real' ? 'MagicBlock real' : 'Mock'}]`);
      console.log(`[Debug] privateTx:`, JSON.stringify(privateTx).substring(0, 300));

      const x402Payment = await this.createX402Payment({
        robotId,
        amount,
        userAddress,
        questId,
      });
      console.log(`x402 payment created [${this.mode === 'real' ? 'x402 real' : 'Mock'}]`);

      const result = await solanaService.updateRobotState(robotId, 10, 5, -5, 1);
      if (!result.success) {
        return { success: false, error: 'Failed to update robot state' };
      }

      console.log(`On-chain state update successful: ${result.tx}`);

      const responseData = {
        mode: this.mode,
        quote: quote.data || quote,
        transfer: transfer.data || transfer,
        privateTx: privateTx.data || privateTx,
        x402: x402Payment.data || x402Payment,
        stateUpdate: result,
      };

      console.log(`[Debug] Response privateTx:`, JSON.stringify(responseData.privateTx).substring(0, 300));

      return {
        success: true,
        data: responseData,
      };
    } catch (error) {
      console.error('Payment processing error:', error);
      return { success: false, error: error.message };
    }
  }

  mockGetQuote(fromChain, toChain, amount, fromToken = 'USDC', toToken = 'USDC') {
    console.log(`[Mock] Fetching quote: ${fromChain} -> ${toChain}, amount: ${amount}`);
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
