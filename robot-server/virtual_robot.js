const WebSocket = require('ws');
const https = require('https');
const fs = require('fs');
const path = require('path');

const SERVER_URL = 'wss://localhost:3002';

const certPath = path.join(__dirname, 'certificates');
const agent = new https.Agent({
  cert: fs.readFileSync(path.join(certPath, 'localhost.pem')),
  key: fs.readFileSync(path.join(certPath, 'localhost-key.pem')),
  rejectUnauthorized: false,
});

function connect() {
  const ws = new WebSocket(SERVER_URL, { agent });

  ws.on('open', () => {
    console.log('[Virtual Robot] Successfully connected to the server.');

    // 模拟心跳和状态上报
    setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        const batteryLevel = Math.floor(Math.random() * (100 - 80 + 1)) + 80; // 模拟 80-100 的电量
        const message = JSON.stringify({ type: 'pong', payload: { battery: batteryLevel } });
        console.log(`[Virtual Robot] Sending pong with battery: ${batteryLevel}%`);
        ws.send(message);
      }
    }, 10000); // 每 10 秒发送一次
  });

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('[Virtual Robot] Received command from server:', message);

      if (message.type === 'ping') {
        // 收到 ping, 立即回复 pong (虽然我们的定时器也在发，但这是标准做法)
        const pongMessage = JSON.stringify({ type: 'pong', payload: { status: 'ok' } });
        ws.send(pongMessage);
        return;
      }

      // 模拟执行动作
      if (message.action) {
        console.log(`[Virtual Robot] >>> Executing action: ${message.action}, params: ${JSON.stringify(message.params)} <<<`);
      }

    } catch (error) {
      console.error('[Virtual Robot] Error parsing message from server:', error);
    }
  });

  ws.on('close', () => {
    console.log('[Virtual Robot] Disconnected from the server. Reconnecting in 5 seconds...');
    setTimeout(connect, 5000);
  });

  ws.on('error', (error) => {
    console.error('[Virtual Robot] WebSocket error:', error.message);
    // close 事件会自动触发，所以重连逻辑会执行
  });
}

console.log('Starting Virtual Robot...');
connect();
