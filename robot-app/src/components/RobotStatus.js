import { useState, useEffect } from 'react';
import { useStore } from '../store/store';

function RobotStatus() {
  const { wsStatus, batteryLevel } = useStore();

  const getStatusText = () => {
    switch (wsStatus) {
      case 'connected':
        return '在线';
      case 'connecting':
        return '连接中...';
      default:
        return '离线';
    }
  };

  const getStatusColor = () => {
    switch (wsStatus) {
      case 'connected':
        return '#22c55e';
      case 'connecting':
        return '#eab308';
      default:
        return '#ef4444';
    }
  };

  return (
    <div style={styles.container}>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    gap: '20px',
    padding: '10px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(0, 255, 255, 0.1)',
    alignItems: 'center',
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  label: {
    fontWeight: '600',
    color: '#00ffff',
    fontSize: '11px',
    letterSpacing: '2px',
  },
  value: {
    color: '#e0e0e0',
    fontSize: '12px',
    fontFamily: 'Courier New, monospace',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    display: 'inline-block',
    boxShadow: '0 0 8px currentColor',
  },
  batteryBar: {
    width: '100px',
    height: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '0',
    overflow: 'hidden',
  },
  batteryFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    transition: 'width 0.3s ease',
    boxShadow: '0 0 8px rgba(34, 197, 94, 0.5)',
  },
};

export default RobotStatus;
