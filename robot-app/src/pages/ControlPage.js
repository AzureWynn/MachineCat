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
      <h1 style={styles.title}>🎮 机器人控制调试</h1>
      
      <div style={styles.controlPanel}>
        <div style={styles.row}>
          <label style={styles.label}>机器人 ID:</label>
          <input
            type="text"
            value={robotId}
            onChange={(e) => handleRobotIdChange(e.target.value)}
            style={styles.input}
            placeholder="请输入机器人 ID"
          />
          {personality && (
            <span style={styles.robotName}>
              🤖 {personality.name}
            </span>
          )}
          <button
            onClick={testConnection}
            style={{
              ...styles.button,
              backgroundColor: connectionStatus === 'connected' ? '#4caf50' : '#ff9800',
            }}
          >
            {connectionStatus === 'connected' ? '✅ 已连接' : '🔍 测试连接'}
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
          <h3 style={styles.logTitle}>📋 日志</h3>
          <button onClick={clearLogs} style={styles.clearButton}>
            清空
          </button>
        </div>
        <div style={styles.logContent}>
          {logs.length === 0 ? (
            <p style={styles.emptyLog}>暂无日志</p>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                style={{
                  ...styles.logEntry,
                  color: log.type === 'error' ? '#f44336' :
                         log.type === 'success' ? '#4caf50' :
                         log.type === 'warning' ? '#ff9800' :
                         log.type === 'send' ? '#2196f3' : '#666',
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
  title: {
    fontSize: '28px',
    color: '#333',
    marginBottom: '20px',
    textAlign: 'center',
  },
  controlPanel: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  label: {
    fontSize: '14px',
    color: '#666',
    fontWeight: 'bold',
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    flex: '1',
    minWidth: '200px',
  },
  robotName: {
    fontSize: '14px',
    color: '#1976d2',
    fontWeight: 'bold',
    padding: '0 10px',
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
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
    backgroundColor: 'white',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  commandIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  commandName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '4px',
  },
  commandAction: {
    fontSize: '12px',
    color: '#999',
  },
  logPanel: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  logHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    backgroundColor: '#f5f5f5',
    borderBottom: '1px solid #e0e0e0',
  },
  logTitle: {
    margin: 0,
    fontSize: '16px',
    color: '#333',
  },
  clearButton: {
    padding: '6px 12px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  logContent: {
    padding: '15px',
    maxHeight: '400px',
    overflowY: 'auto',
    backgroundColor: '#fafafa',
    fontFamily: 'monospace',
    fontSize: '13px',
  },
  emptyLog: {
    color: '#999',
    textAlign: 'center',
    padding: '20px',
  },
  logEntry: {
    padding: '5px 0',
    borderBottom: '1px solid #f0f0f0',
    display: 'flex',
    gap: '10px',
  },
  logTime: {
    color: '#999',
    minWidth: '80px',
  },
};

export default ControlPage;
