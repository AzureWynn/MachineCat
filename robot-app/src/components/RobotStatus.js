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
        return '#4caf50';
      case 'connecting':
        return '#ff9800';
      default:
        return '#f44336';
    }
  };

  return (
    <div style={styles.container}>
      {/* <div style={styles.statusItem}>
        <span style={styles.label}>状态:</span>
        <span style={{ ...styles.dot, backgroundColor: getStatusColor() }}></span>
        <span style={styles.value}>{getStatusText()}</span>
      </div>
      {batteryLevel !== null && (
        <div style={styles.statusItem}>
          <span style={styles.label}>电量:</span>
          <span style={styles.value}>{batteryLevel}%</span>
          <div style={styles.batteryBar}>
            <div style={{ ...styles.batteryFill, width: `${batteryLevel}%` }}></div>
          </div>
        </div>
      )} */}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    gap: '20px',
    padding: '10px 20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    alignItems: 'center',
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  label: {
    fontWeight: 'bold',
    color: '#666',
  },
  value: {
    color: '#333',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  batteryBar: {
    width: '100px',
    height: '10px',
    backgroundColor: '#ddd',
    borderRadius: '5px',
    overflow: 'hidden',
  },
  batteryFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    transition: 'width 0.3s ease',
  },
};

export default RobotStatus;
