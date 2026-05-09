import { useState, useEffect } from 'react';
import { useStore } from '../store/store';
import { Connection, Transaction } from '@solana/web3.js';
import { Buffer } from 'buffer';

const API_BASE = 'https://localhost:3002/api';
const SOLANA_RPC_URL = 'http://127.0.0.1:8899';

function DemoPage() {
  const currentRobotId = useStore((state) => state.currentRobotId);
  
  const [robotState, setRobotState] = useState(null);
  const [quest, setQuest] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [signMode, setSignMode] = useState('backend');
  const [paymentMode, setPaymentMode] = useState(null);
  const [paymentModeInfo, setPaymentModeInfo] = useState(null);

  useEffect(() => {
    if (currentRobotId) {
      fetchRobotState();
      fetchPaymentMode();
    }
    checkWalletConnection();
  }, [currentRobotId]);

  const fetchPaymentMode = async () => {
    try {
      const response = await fetch(`${API_BASE}/payment/mode`);
      const result = await response.json();
      if (result.success) {
        setPaymentMode(result.data.mode);
        setPaymentModeInfo(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch payment mode:', error);
    }
  };

  const checkWalletConnection = async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        const response = await window.solana.connect({ onlyIfTrusted: true });
        setWalletConnected(true);
        setWalletAddress(response.publicKey.toString());
      } catch (err) {
        // 用户未授权连接
      }
    }
  };

  const connectWallet = async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        const response = await window.solana.connect();
        setWalletConnected(true);
        setWalletAddress(response.publicKey.toString());
        setMessages((prev) => [...prev, { role: 'system', text: `✅ 钱包已连接: ${response.publicKey.toString().substring(0, 6)}...${response.publicKey.toString().substring(38)}` }]);
        
        // 连接钱包后获取该用户的机器人状态
        await fetchRobotState();
      } catch (error) {
        setMessages((prev) => [...prev, { role: 'system', text: '❌ 钱包连接失败' }]);
      }
    } else {
      window.open('https://phantom.app/', '_blank');
      setMessages((prev) => [...prev, { role: 'system', text: '⚠️ 请安装 Phantom 钱包' }]);
    }
  };

  const disconnectWallet = async () => {
    if (window.solana && window.solana.isPhantom) {
      await window.solana.disconnect();
      setWalletConnected(false);
      setWalletAddress('');
    }
  };

  const fetchRobotState = async () => {
    try {
      const url = walletAddress 
        ? `${API_BASE}/solana/state/${currentRobotId}?userAddress=${walletAddress}`
        : `${API_BASE}/solana/state/${currentRobotId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      if (result.success) {
        setRobotState(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch robot state:', error);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim() || !currentRobotId) return;

    setLoading(true);
    const userMessage = { role: 'user', text: chatInput };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch(`${API_BASE}/interaction/${currentRobotId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: chatInput,
        }),
      });

      const result = await response.json();
      const botMessage = { role: 'bot', text: result.responseText || '抱歉，我暂时无法回复' };
      setMessages((prev) => [...prev, botMessage]);

      if (result.quest) {
        setQuest(result.quest);
      }

      await fetchRobotState();
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, { role: 'bot', text: '请求失败，请稍后重试' }]);
    } finally {
      setLoading(false);
      setChatInput('');
    }
  };

  const handleConfirmQuest = async () => {
    if (!quest || !currentRobotId) return;

    if (!walletConnected) {
      setMessages((prev) => [...prev, { role: 'system', text: '⚠️ 请先连接钱包' }]);
      return;
    }

    setLoading(true);
    setMessages((prev) => [...prev, { role: 'system', text: '⏳ 正在处理跨链支付...' }]);

    try {
      let txHash;

      if (signMode === 'frontend') {
        const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
        
        // 先获取 mock 支付数据（用于展示）
        const paymentMockResponse = await fetch(`${API_BASE}/payment/process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            robotId: currentRobotId,
            paymentDetails: {
              amount: quest.cost.toString(),
              fromChain: quest.fromChain,
              toChain: quest.toChain,
              fromToken: 'USDC',
              toToken: 'USDC',
              userAddress: walletAddress,
            },
          }),
        });

        const paymentMockResult = await paymentMockResponse.json();
        
        // 先检查状态是否存在
        const stateResponse = await fetch(`${API_BASE}/solana/state/${currentRobotId}?userAddress=${walletAddress}`);
        const stateResult = await stateResponse.json();
        
        // 如果状态不存在，需要先初始化
        if (!stateResult.success) {
          setMessages((prev) => [...prev, { role: 'system', text: ' 正在初始化机器人状态...' }]);
          
          // 构建初始化交易
          const initResponse = await fetch(`${API_BASE}/solana/transaction/init`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              robotId: currentRobotId,
              userAddress: walletAddress,
            }),
          });

          const initResult = await initResponse.json();
          
          if (initResult.success) {
            const initTransaction = Transaction.from(Buffer.from(initResult.transaction, 'base64'));
            
            // 签名交易
            const signedInitTx = await window.solana.signTransaction(initTransaction);
            
            // 使用我们的 connection 发送到本地测试网
            const initTxHash = await connection.sendRawTransaction(signedInitTx.serialize());
            await connection.confirmTransaction(initTxHash, 'confirmed');
            
            console.log('✅ 初始化交易已发送:', initTxHash);
            setMessages((prev) => [...prev, { role: 'system', text: `✅ 机器人状态已初始化` }]);
          }
        }
        
        // 获取更新状态的交易
        const buildResponse = await fetch(`${API_BASE}/solana/transaction/build`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            robotId: currentRobotId,
            userAddress: walletAddress,
          }),
        });

        const buildResult = await buildResponse.json();
        
        if (!buildResult.success) {
          throw new Error(buildResult.error);
        }

        // 反序列化交易
        const transaction = Transaction.from(Buffer.from(buildResult.transaction, 'base64'));
        
        // 签名交易
        const signedTx = await window.solana.signTransaction(transaction);
        
        // 使用我们的 connection 发送到本地测试网
        txHash = await connection.sendRawTransaction(signedTx.serialize());
        await connection.confirmTransaction(txHash, 'confirmed');
        
        console.log('✅ 状态更新交易已发送:', txHash);
        
        // 展示 mock 支付数据
        if (paymentMockResult.success) {
          const { quote, privateTx, x402, mode } = paymentMockResult.data;
          const modeLabel = mode === 'real' ? '🔗 真实协议' : '🧪 Mock';
          setMessages((prev) => [
            ...prev,
            { role: 'system', text: `✅ 支付成功！[${modeLabel}]` },
            { role: 'system', text: `🌉 LI.FI 跨链: ${quote.fromChain} → ${quote.toChain}` },
            { role: 'system', text: `   报价: ${quote.fromAmount} → ${quote.toAmount}` },
            { role: 'system', text: `🔒 MagicBlock PER 隐私保护: ${privateTx.privacyLevel}` },
            { role: 'system', text: ` x402 自主代理支付` },
            { role: 'system', text: `用户钱包: ${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}` },
            { role: 'system', text: `链上交易: ${txHash?.substring(0, 20)}...` },
          ]);
        }
      } else {
        const paymentResult = await fetch(`${API_BASE}/payment/process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            robotId: currentRobotId,
            paymentDetails: {
              amount: quest.cost.toString(),
              fromChain: quest.fromChain,
              toChain: quest.toChain,
              fromToken: 'USDC',
              toToken: 'USDC',
              userAddress: walletAddress,
              questId: quest.id,
            },
          }),
        });

        const result = await paymentResult.json();
        
        if (!result.success) {
          throw new Error(result.error);
        }

        txHash = result.data.stateUpdate.tx;
        const { mode, quote, privateTx, x402 } = result.data;
        const modeLabel = mode === 'real' ? '🔗 真实协议' : '🧪 Mock';

        setMessages((prev) => [
          ...prev,
          { role: 'system', text: `✅ 支付成功！[${modeLabel}]` },
          { role: 'system', text: `🌉 LI.FI 跨链: ${quote.fromChain} → ${quote.toChain}` },
          { role: 'system', text: `   报价: ${quote.fromAmount} → ${quote.toAmount}` },
          { role: 'system', text: `🔒 MagicBlock PER 隐私保护: ${privateTx.privacyLevel}` },
          { role: 'system', text: ` x402 自主代理支付` },
          { role: 'system', text: `用户钱包: ${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}` },
          { role: 'system', text: `链上交易: ${txHash?.substring(0, 20)}...` },
        ]);
      }

      await fetchRobotState();
      setQuest(null);
    } catch (error) {
      console.error('Quest confirm error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'system', text: `❌ 支付失败: ${error.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelQuest = () => {
    setQuest(null);
    setMessages((prev) => [...prev, { role: 'system', text: '❌ 任务已取消' }]);
  };

  const stateCards = [
    { key: 'mood', label: '心情', icon: '😊', color: '#FFD93D' },
    { key: 'bond', label: '亲密度', icon: '❤️', color: '#FF6B6B' },
    { key: 'energy', label: '能量', icon: '⚡', color: '#4ECDC4' },
    { key: 'streak', label: '连续任务', icon: '🔥', color: '#FF8C42' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🎯 黑客松演示 - 跨链隐私支付</h1>
        <div style={styles.headerControls}>
          <div style={styles.networkInfo}>
            <span style={styles.networkBadge}>
              🌐 {paymentModeInfo?.network === 'DEVNET' ? 'Devnet' : '本地测试网'}
            </span>
            {/* <span style={styles.paymentModeBadge}>
              {paymentMode === 'real' ? '🔗 真实协议' : '🧪 Mock 模式'}
            </span> */}
            <span style={styles.networkHint}>Phantom 需切换到 {paymentModeInfo?.network === 'DEVNET' ? 'Devnet' : 'Localhost'}</span>
          </div>
          <select
            value={signMode}
            onChange={(e) => setSignMode(e.target.value)}
            style={styles.modeSelect}
          >
            <option value="backend">🤖 后端签名（演示模式）</option>
            <option value="frontend">👛 前端签名（真实支付）</option>
          </select>
          <button
            onClick={walletConnected ? disconnectWallet : connectWallet}
            style={{
              ...styles.walletBtn,
              backgroundColor: walletConnected ? '#4ECDC4' : '#FF6B6B',
            }}
          >
            {walletConnected ? `✅ ${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}` : '🔗 连接钱包'}
          </button>
        </div>
      </div>

      <div style={styles.stateContainer}>
        {stateCards.map(({ key, label, icon, color }) => (
          <div key={key} style={styles.stateCard}>
            <div style={styles.icon}>{icon}</div>
            <div style={styles.label}>{label}</div>
            <div style={{ ...styles.value, color }}>
              {robotState ? robotState[key] : '-'}
              {key !== 'streak' && <span style={styles.max}>/100</span>}
            </div>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${robotState ? (key === 'streak' ? Math.min(100, robotState[key] * 10) : robotState[key]) : 0}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {quest && (
        <div style={styles.questCard}>
          <div style={styles.questHeader}>
            <span style={styles.questIcon}>🎯</span>
            <span style={styles.questTitle}>任务建议</span>
          </div>
          <div style={styles.questContent}>
            <div style={styles.questDescription}>{quest.description}</div>
            <div style={styles.questDetails}>
              <div style={styles.detailRow}>
                <span style={styles.label}>花费:</span>
                <span style={styles.value}>{quest.cost} USDC</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.label}>跨链:</span>
                <span style={styles.value}>
                  ⟠ {quest.fromChain}
                  <span style={styles.arrow}> → </span>
                  ◎ {quest.toChain}
                </span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.label}>隐私:</span>
                <span style={styles.value}>MagicBlock PER</span>
              </div>
            </div>
          </div>
          <div style={styles.questActions}>
            <button style={styles.confirmBtn} onClick={handleConfirmQuest} disabled={loading}>
              确认支付
            </button>
            <button style={styles.cancelBtn} onClick={handleCancelQuest} disabled={loading}>
              取消
            </button>
          </div>
        </div>
      )}

      <div style={styles.chatContainer}>
        <div style={styles.chatMessages}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                ...styles.message,
                ...(msg.role === 'user' ? styles.userMessage : {}),
                ...(msg.role === 'system' ? styles.systemMessage : {}),
              }}
            >
              {msg.text}
            </div>
          ))}
          {loading && <div style={styles.loading}>...</div>}
        </div>
        <div style={styles.chatInput}>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleChat()}
            placeholder="输入消息..."
            style={styles.input}
            disabled={loading}
          />
          <button onClick={handleChat} disabled={loading || !chatInput.trim()} style={styles.sendBtn}>
            发送
          </button>
        </div>
      </div>

      {txHash && (
        <div style={styles.txHash}>
          <div style={styles.txHashTitle}>交易签名:</div>
          <div style={styles.txHashValue}>{txHash}</div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  headerControls: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  networkInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  networkBadge: {
    padding: '6px 12px',
    backgroundColor: '#E3F2FD',
    color: '#1976D2',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  paymentModeBadge: {
    padding: '6px 12px',
    backgroundColor: '#FFF3E0',
    color: '#F57C00',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  networkHint: {
    fontSize: '10px',
    color: '#999',
  },
  modeSelect: {
    padding: '10px 16px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  walletBtn: {
    padding: '10px 20px',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '30px',
  },
  stateContainer: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '30px',
  },
  stateCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    minWidth: '100px',
  },
  icon: { fontSize: '24px', marginBottom: '8px' },
  label: { fontSize: '12px', color: '#666', marginBottom: '4px' },
  value: { fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' },
  max: { fontSize: '12px', color: '#999' },
  progressBar: {
    height: '4px',
    backgroundColor: '#eee',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.5s ease',
  },
  questCard: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    border: '2px solid #4ECDC4',
  },
  questHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  questIcon: { fontSize: '24px' },
  questTitle: { fontSize: '18px', fontWeight: 'bold' },
  questContent: { marginBottom: '16px' },
  questDescription: { fontSize: '14px', color: '#333', marginBottom: '12px' },
  questDetails: { backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '12px' },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 0',
  },
  label: { color: '#666', fontSize: '13px' },
  value: { color: '#333', fontSize: '13px', fontWeight: '500' },
  arrow: { color: '#4ECDC4', margin: '0 4px' },
  questActions: { display: 'flex', gap: '12px' },
  confirmBtn: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#4ECDC4',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#fff',
    color: '#666',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  chatContainer: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  chatMessages: {
    height: '300px',
    overflowY: 'auto',
    marginBottom: '16px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  message: {
    padding: '10px 16px',
    marginBottom: '8px',
    borderRadius: '12px',
    backgroundColor: '#fff',
    maxWidth: '80%',
  },
  userMessage: {
    marginLeft: 'auto',
    backgroundColor: '#4ECDC4',
    color: '#fff',
  },
  systemMessage: {
    textAlign: 'center',
    backgroundColor: '#fff3cd',
    color: '#856404',
    maxWidth: '100%',
  },
  loading: {
    textAlign: 'center',
    color: '#666',
    padding: '10px',
  },
  chatInput: {
    display: 'flex',
    gap: '10px',
  },
  input: {
    flex: 1,
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
  },
  sendBtn: {
    padding: '12px 24px',
    backgroundColor: '#4ECDC4',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  txHash: {
    marginTop: '20px',
    padding: '16px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  txHashTitle: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '4px',
  },
  txHashValue: {
    fontSize: '12px',
    color: '#333',
    fontFamily: 'monospace',
    wordBreak: 'break-all',
  },
};

export default DemoPage;
