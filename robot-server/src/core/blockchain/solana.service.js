const { Connection, Keypair, PublicKey, SystemProgram } = require('@solana/web3.js');
const { Program, AnchorProvider, BN } = require('@coral-xyz/anchor');
const anchor = require('@coral-xyz/anchor');
const IDL = require('./robot_contract.json');

class SolanaService {
  constructor() {
    this.connection = null;
    this.program = null;
    this.programId = new PublicKey(IDL.address);
    this.wallet = null;
    this.provider = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    const rpcUrl = process.env.SOLANA_RPC_URL || 'http://127.0.0.1:8899';
    this.connection = new Connection(rpcUrl, 'confirmed');

    try {
      const secretKeyString = process.env.SOLANA_WALLET_SECRET_KEY;
      if (!secretKeyString) {
        console.warn('⚠️ SOLANA_WALLET_SECRET_KEY 未设置，使用 Mock 模式');
        this.initialized = false;
        return;
      }

      const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
      this.wallet = Keypair.fromSecretKey(secretKey);

      const providerWallet = {
        publicKey: this.wallet.publicKey,
        signTransaction: async (tx) => {
          tx.sign(this.wallet);
          return tx;
        },
        signAllTransactions: async (txs) => {
          return txs.map((tx) => {
            tx.sign(this.wallet);
            return tx;
          });
        },
      };

      this.provider = new AnchorProvider(this.connection, providerWallet, {
        commitment: 'confirmed',
      });

      this.program = new Program(IDL, this.provider);
      this.initialized = true;

      console.log(`✅ Solana 服务初始化成功`);
      console.log(`   网络: ${rpcUrl}`);
      console.log(`   钱包: ${this.wallet.publicKey.toBase58()}`);
      console.log(`   程序: ${this.programId.toBase58()}`);
    } catch (error) {
      console.error('❌ Solana 服务初始化失败:', error.message);
      this.initialized = false;
    }
  }

  getStatePda(robotId, authority = null) {
    const auth = authority || this.provider.wallet.publicKey;
    const [pda, bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("state"), auth.toBuffer(), Buffer.from(robotId)],
      this.programId
    );
    return { pda, bump };
  }

  async initializeRobotState(robotId, authority = null) {
    if (!this.initialized) {
      return this.mockInitializeRobotState(robotId);
    }

    const auth = authority || this.provider.wallet.publicKey;
    const { pda } = this.getStatePda(robotId, auth);

    try {
      const tx = await this.program.methods
        .initialize(robotId)
        .accounts({
          state: pda,
          authority: auth,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log(`✅ 初始化机器人状态成功: ${robotId}`);
      console.log(`   交易签名: ${tx}`);

      return { success: true, tx, pda: pda.toBase58() };
    } catch (error) {
      if (error.message && error.message.includes('already in use')) {
        console.log(`ℹ️ 机器人状态已存在: ${robotId}`);
        return await this.getRobotState(robotId, auth);
      }
      console.error(`❌ 初始化机器人状态失败: ${error.message}`);
      throw error;
    }
  }

  async getRobotState(robotId, authority = null) {
    if (!this.initialized) {
      return this.mockGetRobotState(robotId);
    }

    const auth = authority || this.provider.wallet.publicKey;
    const { pda } = this.getStatePda(robotId, auth);

    try {
      const state = await this.program.account.robotState.fetch(pda);
      return {
        success: true,
        data: {
          robotId: state.robotId,
          mood: state.mood,
          bond: state.bond,
          energy: state.energy,
          streak: state.streak,
          authority: state.authority.toBase58(),
          lastUpdated: state.lastUpdated.toNumber ? state.lastUpdated.toNumber() : state.lastUpdated,
        },
      };
    } catch (error) {
      if (error.message && error.message.includes('Account does not exist')) {
        return { success: false, error: 'Robot state not found' };
      }
      throw error;
    }
  }

  async updateRobotState(robotId, moodDelta, bondDelta, energyDelta, streakDelta, authority = null) {
    if (!this.initialized) {
      return this.mockUpdateRobotState(robotId, moodDelta, bondDelta, energyDelta, streakDelta);
    }

    const auth = authority || this.provider.wallet.publicKey;
    const { pda } = this.getStatePda(robotId, auth);

    const tx = await this.program.methods
      .updateState(moodDelta, bondDelta, energyDelta, streakDelta)
      .accounts({
        state: pda,
        authority: auth,
      })
      .rpc();

    console.log(`✅ 更新机器人状态成功: ${robotId}`);
    console.log(`   交易签名: ${tx}`);

    return { success: true, tx };
  }

  async buildUpdateStateTransaction(robotId, moodDelta, bondDelta, energyDelta, streakDelta, userPublicKey) {
    if (!this.initialized) {
      return this.mockBuildUpdateStateTransaction();
    }

    const userPubkey = new PublicKey(userPublicKey);
    const { pda } = this.getStatePda(robotId, userPubkey);

    const transaction = await this.program.methods
      .updateState(moodDelta, bondDelta, energyDelta, streakDelta)
      .accounts({
        state: pda,
        authority: userPubkey,
      })
      .transaction();

    const blockhash = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash.blockhash;
    transaction.feePayer = userPubkey;

    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    }).toString('base64');

    return {
      success: true,
      transaction: serializedTransaction,
      blockhash: blockhash.blockhash,
    };
  }

  async buildInitializeTransaction(robotId, userPublicKey) {
    if (!this.initialized) {
      return this.mockBuildInitializeTransaction();
    }

    const userPubkey = new PublicKey(userPublicKey);
    const { pda } = this.getStatePda(robotId, userPubkey);

    const transaction = await this.program.methods
      .initialize(robotId)
      .accounts({
        state: pda,
        authority: userPubkey,
        systemProgram: SystemProgram.programId,
      })
      .transaction();

    const blockhash = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash.blockhash;
    transaction.feePayer = userPubkey;

    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    }).toString('base64');

    return {
      success: true,
      transaction: serializedTransaction,
      blockhash: blockhash.blockhash,
    };
  }

  async completeQuest(robotId) {
    if (!this.initialized) {
      return this.mockCompleteQuest(robotId);
    }

    const { pda } = this.getStatePda(robotId);

    const tx = await this.program.methods
      .completeQuest()
      .accounts({
        state: pda,
        authority: this.provider.wallet.publicKey,
      })
      .rpc();

    console.log(`✅ 完成任务成功: ${robotId}`);
    console.log(`   交易签名: ${tx}`);

    return { success: true, tx };
  }

  mockInitializeRobotState(robotId) {
    console.log(`[Mock] 初始化机器人状态: ${robotId}`);
    return {
      success: true,
      tx: 'mock-tx-' + Date.now(),
      pda: 'mock-pda',
      data: {
        robotId,
        mood: 50,
        bond: 30,
        energy: 80,
        streak: 0,
        authority: 'mock-authority',
        lastUpdated: Date.now(),
      },
    };
  }

  mockGetRobotState(robotId) {
    console.log(`[Mock] 获取机器人状态: ${robotId}`);
    return {
      success: true,
      data: {
        robotId,
        mood: 50,
        bond: 30,
        energy: 80,
        streak: 0,
        authority: 'mock-authority',
        lastUpdated: Date.now(),
      },
    };
  }

  mockUpdateRobotState(robotId, moodDelta, bondDelta, energyDelta, streakDelta) {
    console.log(`[Mock] 更新机器人状态: ${robotId}`, { moodDelta, bondDelta, energyDelta, streakDelta });
    return {
      success: true,
      tx: 'mock-tx-' + Date.now(),
    };
  }

  mockCompleteQuest(robotId) {
    console.log(`[Mock] 完成任务: ${robotId}`);
    return {
      success: true,
      tx: 'mock-tx-' + Date.now(),
    };
  }

  mockBuildUpdateStateTransaction() {
    console.log('[Mock] 构建状态更新交易');
    const mockTx = {
      instructions: [],
      recentBlockhash: 'mock-blockhash-' + Date.now(),
      feePayer: null,
      serialize: () => Buffer.from('mock-transaction'),
    };
    return {
      success: true,
      transaction: Buffer.from('mock-transaction-data-' + Date.now()).toString('base64'),
      blockhash: 'mock-blockhash-' + Date.now(),
    };
  }

  mockBuildInitializeTransaction() {
    console.log('[Mock] 构建初始化交易');
    return {
      success: true,
      transaction: Buffer.from('mock-init-transaction-data-' + Date.now()).toString('base64'),
      blockhash: 'mock-blockhash-' + Date.now(),
    };
  }
}

module.exports = new SolanaService();
