import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { Connection, Transaction } from '@solana/web3.js';
import { Buffer } from 'buffer';

const API_BASE = '/api';
const SOLANA_RPC_URL = 'https://devnet.helius-rpc.com/?api-key=d4f1dbe4-60c7-4b9d-bada-17cfac55e1c1';

function DemoPage() {
  const navigate = useNavigate();
  const currentRobotId = useStore((state) => state.currentRobotId);
  const chatMessagesRef = useRef(null);
  const [robotState, setRobotState] = useState(null);
  const [quest, setQuest] = useState(null);
  const [questVisible, setQuestVisible] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [signMode, setSignMode] = useState('frontend');
  const [paymentMode, setPaymentMode] = useState(null);
  const [paymentModeInfo, setPaymentModeInfo] = useState(null);

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
        // User not authorized
      }
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

  useEffect(() => {
    const robotId = localStorage.getItem('currentRobotId');
    if (!robotId || robotId === '') {
      navigate('/personality', { replace: true });
    } else if (robotId !== currentRobotId) {
      useStore.getState().setCurrentRobotId(robotId);
    }
  }, [currentRobotId, navigate]);

  useEffect(() => {
    if (currentRobotId) {
      fetchRobotState();
      fetchPaymentMode();
    }
    checkWalletConnection();
  }, [currentRobotId]);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  if (!currentRobotId) {
    return null;
  }

  const connectWallet = async () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const currentUrl = window.location.href;

    if (window.solana && window.solana.isPhantom) {
      try {
        const response = await window.solana.connect();
        setWalletConnected(true);
        setWalletAddress(response.publicKey.toString());
        setMessages((prev) => [...prev, { role: 'system', text: `Wallet connected: ${response.publicKey.toString().substring(0, 6)}...${response.publicKey.toString().substring(38)}` }]);
        
        await fetchRobotState();
      } catch (error) {
        setMessages((prev) => [...prev, { role: 'system', text: 'Wallet connection failed' }]);
      }
    } else if (isMobile && !isLocalhost) {
      const encodedUrl = encodeURIComponent(currentUrl);
      window.location.href = `https://phantom.app/ul/browse/${encodedUrl}`;
      setMessages((prev) => [...prev, { role: 'system', text: 'Opening Phantom App...' }]);
    } else {
      window.open('https://phantom.app/', '_blank');
      setMessages((prev) => [...prev, { role: 'system', text: isLocalhost ? 'Please use desktop browser or deploy to public domain' : 'Please install Phantom wallet' }]);
    }
  };

  const disconnectWallet = async () => {
    if (window.solana && window.solana.isPhantom) {
      await window.solana.disconnect();
      setWalletConnected(false);
      setWalletAddress('');
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim() || !currentRobotId) return;

    if (!walletConnected) {
      setMessages((prev) => [...prev, { role: 'system', text: 'Please connect wallet first' }]);
      return;
    }

    const userInput = chatInput.trim();

    const specialResponses = [
      {
        keywords: ['天气', '出去走走', '陪我', '外面'],
        minMatch: 2,
        response: '天气正好，23度，西风轻吹，门开着，风在等你。',
        quest: null,
      },
      {
        keywords: ['饮料', '喝的', '买', '推荐', '奶茶', '布丁'],
        minMatch: 2,
        response: '外面23度，微风，冰奶茶加布丁，刚好，蓝牙已就绪，我陪你走。',
        quest: '去附近买一杯冰奶茶加布丁',
      },
    ];

    for (const rule of specialResponses) {
      const matchCount = rule.keywords.filter((kw) => userInput.includes(kw)).length;
      if (matchCount >= rule.minMatch) {
        setLoading(true);
        const userMessage = { role: 'user', text: userInput };
        setMessages((prev) => [...prev, userMessage]);
        setChatInput('');

        await new Promise((resolve) => setTimeout(resolve, 5000));

        const botMessage = { role: 'bot', text: rule.response };
        setMessages((prev) => [...prev, botMessage]);

        if (rule.quest) {
          setQuest({ description: rule.quest });
        }

        await fetchRobotState();
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    const userMessage = { role: 'user', text: userInput };
    setMessages((prev) => [...prev, userMessage]);
    setChatInput('');

    try {
      const response = await fetch(`${API_BASE}/interaction/${currentRobotId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: userInput, userAddress: walletAddress }),
      });

      const result = await response.json();

      if (result.responseText) {
        const botMessage = { role: 'bot', text: result.responseText };
        setMessages((prev) => [...prev, botMessage]);

        if (result.quest) {
          setQuest(result.quest);
        }

        await fetchRobotState();
      } else {
        setMessages((prev) => [...prev, { role: 'bot', text: result.error || 'Request failed, please try again later' }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, { role: 'bot', text: 'Request failed, please try again later' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmQuest = async () => {
    if (!quest || !currentRobotId) return;

    if (!walletConnected) {
      setMessages((prev) => [...prev, { role: 'system', text: 'Please connect wallet first' }]);
      return;
    }

    setLoading(true);
    setMessages((prev) => [...prev, { role: 'system', text: 'Processing cross-chain payment...' }]);

    try {
      let txHash;

      if (signMode === 'frontend') {
        const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
        
        const paymentMockResponse = await fetch(`${API_BASE}/payment/process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            robotId: currentRobotId,
            paymentDetails: {
              amount: quest.cost.toString(),
              fromChain: quest.fromChain === 'Ethereum' ? 'ETH' : quest.fromChain,
              toChain: quest.toChain === 'Solana' ? 'SOL' : quest.toChain,
              fromToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
              toToken: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
              userAddress: walletAddress,
            },
          }),
        });

        const paymentMockResult = await paymentMockResponse.json();
        
        const stateResponse = await fetch(`${API_BASE}/solana/state/${currentRobotId}?userAddress=${walletAddress}`);
        const stateResult = await stateResponse.json();
        
        if (!stateResult.success) {
          setMessages((prev) => [...prev, { role: 'system', text: 'Initializing robot state...' }]);
          
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
            const signedInitTx = await window.solana.signTransaction(initTransaction);
            const initTxHash = await connection.sendRawTransaction(signedInitTx.serialize());
            await connection.confirmTransaction(initTxHash, 'confirmed');
            
            console.log('Init transaction sent:', initTxHash);
            setMessages((prev) => [...prev, { role: 'system', text: 'Robot state initialized' }]);
          }
        }
        
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

        const transaction = Transaction.from(Buffer.from(buildResult.transaction, 'base64'));
        const signedTx = await window.solana.signTransaction(transaction);
        txHash = await connection.sendRawTransaction(signedTx.serialize());
        await connection.confirmTransaction(txHash, 'confirmed');
        
        console.log('State update transaction sent:', txHash);
        
        if (paymentMockResult.success) {
          const { quote, privateTx, x402, mode } = paymentMockResult.data;
          const modeLabel = mode === 'real' ? 'Real Protocol' : 'Mock';
          
          const logs = [
            `Payment successful! [${modeLabel}]`,
            `LI.FI Cross-Chain: ${quote.fromChain} -> ${quote.toChain}`,
            `Quote: ${quote.fromAmount} -> ${quote.toAmount}`,
            `MagicBlock PER Privacy: ${privateTx.privacyLevel}`,
            `x402 Agentic Payment`,
            `Wallet: ${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`,
            `Tx: ${txHash?.substring(0, 20)}...`,
          ];
          
          logs.forEach((log, index) => {
            setTimeout(() => {
              setMessages((prev) => [...prev, { role: 'system', text: log }]);
            }, index * 400);
          });
          
          setTimeout(() => {
            setQuestVisible(false);
            setTimeout(() => {
              setQuest(null);
              setQuestVisible(true);
            }, 500);
          }, logs.length * 400 + 300);
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
        const modeLabel = mode === 'real' ? 'Real Protocol' : 'Mock';

        const logs = [
          `Payment successful! [${modeLabel}]`,
          `LI.FI Cross-Chain: ${quote.fromChain} -> ${quote.toChain}`,
          `Quote: ${quote.fromAmount} -> ${quote.toAmount}`,
          `MagicBlock PER Privacy: ${privateTx.privacyLevel}`,
          `x402 Agentic Payment`,
          `Wallet: ${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`,
          `Tx: ${txHash?.substring(0, 20)}...`,
        ];
        
        logs.forEach((log, index) => {
          setTimeout(() => {
            setMessages((prev) => [...prev, { role: 'system', text: log }]);
          }, index * 400);
        });
        
        setTimeout(() => {
          setQuestVisible(false);
          setTimeout(() => {
            setQuest(null);
            setQuestVisible(true);
          }, 500);
        }, logs.length * 400 + 300);
      }

      await fetchRobotState();
      setQuest(null);
    } catch (error) {
      console.error('Quest confirm error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'system', text: `Payment failed: ${error.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelQuest = () => {
    setQuest(null);
    setMessages((prev) => [...prev, { role: 'system', text: 'Quest cancelled' }]);
  };

  const stateCards = [
    { key: 'mood', label: 'Mood', icon: '', color: '#FFD93D' },
    { key: 'bond', label: 'Bond', icon: '', color: '#FF6B6B' },
    { key: 'energy', label: 'Energy', icon: '', color: '#4ECDC4' },
    { key: 'streak', label: 'Streak', icon: '', color: '#FF8C42' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerControls}>
          <button
            onClick={walletConnected ? disconnectWallet : connectWallet}
            style={{
              ...styles.walletBtn,
              backgroundColor: walletConnected ? 'rgba(0, 255, 255, 0.1)' : 'transparent',
              borderColor: walletConnected ? 'rgba(0, 255, 255, 0.5)' : 'rgba(0, 255, 255, 0.3)',
              color: walletConnected ? '#00ffff' : '#00ffff',
            }}
          >
            {walletConnected ? `[ ${walletAddress.substring(0, 6)}...${walletAddress.substring(38)} ]` : '[ CONNECT WALLET ]'}
          </button>
        </div>
      </div>

      <div style={styles.stateContainer}>
        {stateCards.map(({ key, label, icon, color }) => (
          <div key={key} style={styles.stateCard}>
            <div style={styles.stateLabel}>{label}</div>
            <div style={{ ...styles.stateValue, color }}>
              {robotState ? robotState[key] : '-'}
              {key !== 'streak' && <span style={styles.stateMax}>/100</span>}
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
        <div style={{
          ...styles.questCard,
          ...(!questVisible ? styles.questCardExit : {}),
        }}>
          <div style={styles.questHeader}>
            <span style={styles.questIcon}>◆</span>
            <span style={styles.questTitle}>Quest Suggestion</span>
          </div>
          <div style={styles.questContent}>
            <div style={styles.questDescription}>{quest.description}</div>
            <div style={styles.questDetails}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Cost</span>
                <span style={styles.detailValue}>{quest.cost} USDC</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Cross-Chain</span>
                <span style={styles.detailValue}>
                  {quest.fromChain}
                  <span style={styles.arrow}> → </span>
                  {quest.toChain}
                </span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Privacy</span>
                <span style={styles.detailValue}>MagicBlock PER</span>
              </div>
            </div>
          </div>
          <div style={styles.questActions}>
            <button style={styles.confirmBtn} onClick={handleConfirmQuest} disabled={loading}>
              {loading ? (
                <span style={styles.btnLoading}>
                  <span style={{ ...styles.btnDot, animationDelay: '0s' }}></span>
                  <span style={{ ...styles.btnDot, animationDelay: '0.15s' }}></span>
                  <span style={{ ...styles.btnDot, animationDelay: '0.3s' }}></span>
                </span>
              ) : (
                '[ CONFIRM & PAY ]'
              )}
            </button>
            <button style={styles.cancelBtn} onClick={handleCancelQuest} disabled={loading}>
              [ CANCEL ]
            </button>
          </div>
        </div>
      )}

      <div style={styles.chatContainer}>
        <div style={styles.chatMessages} ref={chatMessagesRef}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                ...styles.message,
                ...(msg.role === 'user' ? styles.userMessage : {}),
                ...(msg.role === 'system' ? styles.systemMessage : {}),
                ...(msg.role === 'system' ? styles.systemMessageAnim : {}),
              }}
            >
              {msg.text}
            </div>
          ))}
          {loading && (
            <div style={styles.loading}>
              <div style={styles.loadingDots}>
                <span style={{ ...styles.dot, animationDelay: '0s' }}></span>
                <span style={{ ...styles.dot, animationDelay: '0.2s' }}></span>
                <span style={{ ...styles.dot, animationDelay: '0.4s' }}></span>
              </div>
              <div style={styles.loadingText}>[ THINKING... ]</div>
            </div>
          )}
        </div>
        <div style={styles.chatInput}>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleChat()}
            placeholder="Type a message..."
            style={styles.input}
            disabled={loading}
          />
          <button onClick={handleChat} disabled={loading || !chatInput.trim()} style={styles.sendBtn}>
            [ SEND ]
          </button>
        </div>
      </div>

      {txHash && (
        <div style={styles.txHash}>
          <div style={styles.txHashTitle}>Transaction:</div>
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
    padding: '24px',
    minHeight: '100vh',
    color: '#e0e0e0',
  },
  header: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: '32px',
    paddingBottom: '16px',
    borderBottom: '1px solid rgba(0, 255, 255, 0.1)',
  },
  headerControls: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  walletBtn: {
    padding: '10px 20px',
    border: '1px solid',
    borderRadius: '0',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Courier New, monospace',
    transition: 'all 0.2s ease',
    letterSpacing: '2px',
  },
  stateContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0',
    marginBottom: '32px',
    border: '1px solid rgba(0, 255, 255, 0.1)',
  },
  stateCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRight: '1px solid rgba(0, 255, 255, 0.1)',
    borderRadius: '0',
    padding: '20px',
    textAlign: 'center',
  },
  stateLabel: {
    fontSize: '10px',
    color: '#00ffff',
    marginBottom: '8px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  },
  stateValue: {
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '12px',
  },
  stateMax: {
    fontSize: '14px',
    color: '#666',
  },
  progressBar: {
    height: '2px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '0',
    transition: 'width 0.5s ease',
  },
  questCard: {
    backgroundColor: 'rgba(0, 255, 255, 0.03)',
    border: '1px solid rgba(0, 255, 255, 0.15)',
    borderRadius: '0',
    padding: '20px',
    marginBottom: '32px',
    transition: 'all 0.5s ease',
    opacity: 1,
    transform: 'translateY(0)',
    animation: 'questSlideIn 0.8s ease-out forwards',
  },
  questCardExit: {
    opacity: 0,
    transform: 'translateY(-20px)',
  },
  questHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid rgba(0, 255, 255, 0.1)',
  },
  questIcon: {
    fontSize: '14px',
    color: '#00ffff',
  },
  questTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#00ffff',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  },
  questContent: {
    marginBottom: '16px',
  },
  questDescription: {
    fontSize: '14px',
    color: '#e0e0e0',
    marginBottom: '16px',
    lineHeight: '1.6',
  },
  questDetails: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '0',
    padding: '12px',
    border: '1px solid rgba(0, 255, 255, 0.1)',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  detailLabel: {
    color: '#00ffff',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  detailValue: {
    color: '#e0e0e0',
    fontSize: '13px',
    fontWeight: '600',
    fontFamily: 'Courier New, monospace',
  },
  arrow: {
    color: '#00ffff',
    margin: '0 4px',
  },
  questActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
  },
  confirmBtn: {
    flex: 1,
    padding: '14px',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    color: '#00ffff',
    border: '1px solid rgba(0, 255, 255, 0.4)',
    borderRadius: '0',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    fontFamily: 'Courier New, monospace',
  },
  cancelBtn: {
    flex: 1,
    padding: '14px',
    backgroundColor: 'transparent',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '0',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    fontFamily: 'Courier New, monospace',
  },
  btnLoading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '6px',
  },
  btnDot: {
    width: '6px',
    height: '6px',
    backgroundColor: '#00ffff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'bounce 1.4s infinite ease-in-out both',
  },
  chatContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(0, 255, 255, 0.1)',
    borderRadius: '0',
    padding: '20px',
  },
  chatMessages: {
    height: '300px',
    overflowY: 'auto',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '0',
    border: '1px solid rgba(0, 255, 255, 0.1)',
  },
  message: {
    padding: '10px 16px',
    marginBottom: '8px',
    borderRadius: '0',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    maxWidth: '80%',
    fontSize: '13px',
    lineHeight: '1.5',
    border: '1px solid rgba(0, 255, 255, 0.1)',
    color: '#e0e0e0',
  },
  userMessage: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
    borderColor: 'rgba(0, 255, 255, 0.2)',
    color: '#ffffff',
  },
  systemMessage: {
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: '#00ffff',
    maxWidth: '100%',
    fontSize: '12px',
    border: '1px dashed rgba(0, 255, 255, 0.2)',
    opacity: 0,
  },
  systemMessageAnim: {
    animation: 'slideIn 1.2s ease-out forwards',
  },
  loading: {
    textAlign: 'center',
    color: '#00ffff',
    padding: '20px',
  },
  loadingDots: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  dot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#00ffff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'bounce 1.4s infinite ease-in-out both',
  },
  loadingText: {
    fontSize: '12px',
    color: '#00ffff',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    fontWeight: '600',
  },
  chatInput: {
    display: 'flex',
    gap: '12px',
  },
  input: {
    flex: 1,
    padding: '12px',
    border: '1px solid rgba(0, 255, 255, 0.2)',
    borderRadius: '0',
    fontSize: '13px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: '#ffffff',
    outline: 'none',
    fontFamily: 'Courier New, monospace',
  },
  sendBtn: {
    padding: '12px 24px',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    color: '#00ffff',
    border: '1px solid rgba(0, 255, 255, 0.4)',
    borderRadius: '0',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    fontFamily: 'Courier New, monospace',
  },
  txHash: {
    marginTop: '24px',
    padding: '16px',
    backgroundColor: 'rgba(0, 255, 255, 0.03)',
    border: '1px solid rgba(0, 255, 255, 0.1)',
    borderRadius: '0',
  },
  txHashTitle: {
    fontSize: '10px',
    color: '#00ffff',
    marginBottom: '8px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  },
  txHashValue: {
    fontSize: '11px',
    color: '#e0e0e0',
    fontFamily: 'Courier New, monospace',
    wordBreak: 'break-all',
  },
};

export default DemoPage;
