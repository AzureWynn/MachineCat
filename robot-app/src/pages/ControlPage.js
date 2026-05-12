import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { robotControlAPI } from '../services/api';

const COMMANDS = [
  { name: '前进', action: 'forward', icon: '⬆️', path: '/20/on' },
  { name: '后退', action: 'backward', icon: '⬇️', path: '/24/on' },
  { name: '左转', action: 'left', icon: '⬅️', path: '/21/on' },
  { name: '右转', action: 'right', icon: '➡️', path: '/23/on' },
  { name: '停止', action: 'stop', icon: '🛑', path: '/22/on' },
  { name: '步行', action: 'walk', icon: '🚶', path: '/25/on' },
  { name: '坐姿', action: 'sit', icon: '🪑', path: '/26/on' },
  { name: '握手', action: 'shakehand', icon: '🤝', path: '/27/on' },
  { name: '跟随', action: 'follow', icon: '👣', path: '/28/on' },
  { name: '踏步', action: 'step', icon: '🦶', path: '/29/on' },
  { name: '摇摆', action: 'swing', icon: '💃', path: '/30/on' },
  { name: '起卧', action: 'updown', icon: '🔄', path: '/31/on' },
  { name: '踢球', action: 'kick', icon: '⚽', path: '/32/on' },
  { name: '自动行走', action: 'auto_walk', icon: '🤖', path: '/33/on' },
  { name: '站立平衡', action: 'balance', icon: '⚖️', path: '/34/on' },
  { name: '舵机校对', action: 'calibration', icon: '🔧', path: '/35/on' },
];

function ControlPage() {
  const navigate = useNavigate();
  const { currentRobotId, setCurrentRobotId, personality } = useStore();
  const [robotId, setRobotId] = useState(currentRobotId || 'test-robot');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('unknown');

  useEffect(() => {
    const storedRobotId = localStorage.getItem('currentRobotId');
    if (!storedRobotId || storedRobotId === '') {
      navigate('/personality', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (currentRobotId) {
      setRobotId(currentRobotId);
    }
  }, [currentRobotId]);

  const handleRobotIdChange = (newRobotId) => {
    setRobotId(newRobotId);
    setCurrentRobotId(newRobotId);
  };

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  const sendCommand = async (command) => {
    setLoading(true);
    addLog(`发送指令: ${command.icon} ${command.name} (${command.action})`, 'send');

    try {
      const response = await robotControlAPI.sendCommand(robotId, command.action);
      
      if (response.data && response.data.actions) {
        addLog(`✅ 指令成功发送: ${command.name}`, 'success');
      } else {
        addLog(`⚠️ 响应异常: ${JSON.stringify(response.data)}`, 'warning');
      }
    } catch (error) {
      addLog(`❌ 发送失败: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    addLog('测试服务器连接...', 'info');
    try {
      await robotControlAPI.testConnection();
      setConnectionStatus('connected');
      addLog('✅ 服务器连接正常', 'success');
    } catch (error) {
      setConnectionStatus('disconnected');
      addLog(`❌ 服务器连接失败: ${error.message}`, 'error');
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>CONTROL</h1>
        <p style={styles.subtitle}>机器人指令控制面板</p>
      </div>
      
      <div style={styles.controlPanel}>
        <div style={styles.row}>
          <label style={styles.label}>ROBOT ID</label>
          <input
            type="text"
            value={robotId}
            onChange={(e) => handleRobotIdChange(e.target.value)}
            style={styles.input}
            placeholder="请输入机器人 ID"
          />
          {personality && (
            <span style={styles.robotName}>
              {personality.name}
            </span>
          )}
          <button
            onClick={testConnection}
            style={{
              ...styles.button,
              borderColor: connectionStatus === 'connected' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(234, 179, 8, 0.5)',
              color: connectionStatus === 'connected' ? '#22c55e' : '#eab308',
            }}
          >
            {connectionStatus === 'connected' ? '[ CONNECTED ]' : '[ TEST ]'}
          </button>
        </div>
      </div>

      <div style={styles.commandsGrid}>
        {COMMANDS.map((command) => (
          <button
            key={command.action}
            onClick={() => sendCommand(command)}
            disabled={loading}
            style={{
              ...styles.commandButton,
              opacity: loading ? 0.5 : 1,
            }}
          >
            <span style={styles.commandIcon}>{command.icon}</span>
            <span style={styles.commandName}>{command.name}</span>
            <span style={styles.commandAction}>{command.action}</span>
          </button>
        ))}
      </div>

      <div style={styles.logPanel}>
        <div style={styles.logHeader}>
          <h3 style={styles.logTitle}>[ LOGS ]</h3>
          <button onClick={clearLogs} style={styles.clearButton}>
            CLEAR
          </button>
        </div>
        <div style={styles.logContent}>
          {logs.length === 0 ? (
            <p style={styles.emptyLog}>[ NO LOGS ]</p>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                style={{
                  ...styles.logEntry,
                  color: log.type === 'error' ? '#ef4444' :
                         log.type === 'success' ? '#22c55e' :
                         log.type === 'warning' ? '#eab308' :
                         log.type === 'send' ? '#00ffff' : '#666',
                }}
              >
                <span style={styles.logTime}>{log.timestamp}</span>
                <span>{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '4px',
    marginBottom: '8px',
    textShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
  },
  subtitle: {
    fontSize: '13px',
    color: '#666',
    letterSpacing: '2px',
  },
  controlPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(0, 255, 255, 0.1)',
    padding: '20px',
    marginBottom: '20px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  label: {
    fontSize: '11px',
    color: '#00ffff',
    fontWeight: '600',
    letterSpacing: '2px',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid rgba(0, 255, 255, 0.2)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: '#ffffff',
    fontSize: '14px',
    fontFamily: 'Courier New, monospace',
    flex: '1',
    minWidth: '200px',
    outline: 'none',
  },
  robotName: {
    fontSize: '14px',
    color: '#00ffff',
    fontWeight: '600',
    padding: '0 10px',
    textShadow: '0 0 8px rgba(0, 255, 255, 0.3)',
  },
  button: {
    padding: '10px 16px',
    backgroundColor: 'transparent',
    border: '1px solid',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '2px',
    fontFamily: 'Courier New, monospace',
    transition: 'all 0.3s ease',
  },
  commandsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '15px',
    marginBottom: '20px',
  },
  commandButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(0, 255, 255, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  commandIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  commandName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '4px',
  },
  commandAction: {
    fontSize: '10px',
    color: '#666',
    fontFamily: 'Courier New, monospace',
  },
  logPanel: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(0, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  logHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    borderBottom: '1px solid rgba(0, 255, 255, 0.1)',
  },
  logTitle: {
    margin: 0,
    fontSize: '14px',
    color: '#00ffff',
    fontWeight: '600',
    letterSpacing: '2px',
    fontFamily: 'Courier New, monospace',
  },
  clearButton: {
    padding: '6px 12px',
    backgroundColor: 'transparent',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    cursor: 'pointer',
    fontSize: '11px',
    letterSpacing: '2px',
    fontFamily: 'Courier New, monospace',
    transition: 'all 0.3s ease',
  },
  logContent: {
    padding: '15px',
    maxHeight: '400px',
    overflowY: 'auto',
    fontFamily: 'Courier New, monospace',
    fontSize: '12px',
  },
  emptyLog: {
    color: '#555',
    textAlign: 'center',
    padding: '20px',
    fontFamily: 'Courier New, monospace',
  },
  logEntry: {
    padding: '5px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    gap: '10px',
  },
  logTime: {
    color: '#555',
    minWidth: '80px',
  },
};

export default ControlPage;
