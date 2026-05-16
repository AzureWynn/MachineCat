const { Connection, PublicKey } = require('@solana/web3.js');

class WalletAdapter {
  constructor(config = {}) {
    this.provider = config.provider || process.env.WALLET_PROVIDER || 'phantom';
    this.rpcUrl = config.rpcUrl || process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    this.connection = new Connection(this.rpcUrl, 'confirmed');
  }

  async getBalance(address) {
    try {
      const pubkey = new PublicKey(address);
      const balance = await this.connection.getBalance(pubkey);
      return { success: true, balance: balance / 1e9, address };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getTokenHoldings(address) {
    if (this.provider === 'okx') {
      return this._getTokenHoldingsOKX(address);
    }
    return this._getTokenHoldingsPhantom(address);
  }

  async executeSwap(params) {
    if (this.provider === 'okx') {
      return this._executeSwapOKX(params);
    }
    return this._executeSwapPhantom(params);
  }

  async signAndSendTransaction(transaction) {
    if (this.provider === 'okx') {
      return this._signAndSendTransactionOKX(transaction);
    }
    return this._signAndSendTransactionPhantom(transaction);
  }

  async _getTokenHoldingsOKX(address) {
    try {
      const axios = require('axios');
      const response = await axios.get('https://www.okx.com/api/v5/wallet/asset/all', {
        headers: {
          'OKX-ACCESS-KEY': process.env.OKX_API_KEY,
          'OKX-TIMESTAMP': Date.now().toString(),
          'OKX-PASSPHRASE': process.env.OKX_PASSPHRASE,
        },
        params: { chainType: 'sol' }
      });
      return { success: true, data: response.data.data, provider: 'okx' };
    } catch (error) {
      return { success: false, error: error.message, provider: 'okx' };
    }
  }

  async _getTokenHoldingsPhantom(address) {
    try {
      const pubkey = new PublicKey(address);
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(pubkey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      });

      const tokens = tokenAccounts.value
        .filter(account => account.account.data.parsed.info.tokenAmount.uiAmount > 0)
        .map(account => ({
          mint: account.account.data.parsed.info.mint,
          amount: account.account.data.parsed.info.tokenAmount.uiAmount,
          decimals: account.account.data.parsed.info.tokenAmount.decimals,
        }));

      return { success: true, data: tokens, provider: 'phantom' };
    } catch (error) {
      return { success: false, error: error.message, provider: 'phantom' };
    }
  }

  async _executeSwapOKX(params) {
    try {
      const axios = require('axios');
      const response = await axios.post('https://www.okx.com/api/v5/dex/aggregator/swap', {
        chainId: params.chainId || '501',
        fromTokenAddress: params.fromToken,
        toTokenAddress: params.toToken,
        amount: params.amount,
        slippage: params.slippage || '0.5',
      }, {
        headers: {
          'OKX-ACCESS-KEY': process.env.OKX_API_KEY,
          'OKX-TIMESTAMP': Date.now().toString(),
          'OKX-PASSPHRASE': process.env.OKX_PASSPHRASE,
        }
      });
      return { success: true, data: response.data.data, provider: 'okx' };
    } catch (error) {
      return { success: false, error: error.message, provider: 'okx' };
    }
  }

  async _executeSwapPhantom(params) {
    return {
      success: true,
      mock: true,
      message: 'Swap 功能即将上线，敬请期待',
      params,
      provider: 'phantom'
    };
  }

  async _signAndSendTransactionOKX(transaction) {
    return { success: false, error: 'OKX 交易签名需要前端配合', provider: 'okx' };
  }

  async _signAndSendTransactionPhantom(transaction) {
    return { success: false, error: 'Phantom 交易签名需要前端配合', provider: 'phantom' };
  }
}

module.exports = WalletAdapter;
