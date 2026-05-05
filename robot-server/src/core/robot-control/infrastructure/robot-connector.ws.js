const WebSocket = require('ws');

class RobotConnector {
  constructor(server) {
    this.wss = new WebSocket.Server({ 
      server,
      perMessageDeflate: false,
    });
    this.clients = new Map();
    this.init();
  }

  init() {
    this.wss.on('connection', (ws, req) => {
      const robotId = req.headers['sec-websocket-key'] || `client_${Date.now()}`;
      console.log(`[Connector] New virtual robot connected with ID: ${robotId}`);

      this.clients.set(robotId, ws);
      ws.robotId = robotId;

      ws.on('message', (message) => {
        console.log(`[Connector] Received message from [${robotId}]: ${message}`);
      });

      ws.on('close', () => {
        console.log(`[Connector] Robot [${robotId}] disconnected.`);
        this.clients.delete(robotId);
      });

      ws.on('error', (error) => {
        console.error(`[Connector] Error on connection [${robotId}]:`, error.message);
      });
    });

    console.log('🤖 Robot Connector (WebSocket Server) is running.');
  }

  sendCommand(robotId, command) {
    if (this.clients.has(robotId)) {
      const client = this.clients.get(robotId);
      if (client.readyState === WebSocket.OPEN) {
        console.log(`[Connector] Sending command to [${robotId}]:`, command);
        client.send(JSON.stringify(command));
      }
    } else {
      console.log(`[Connector] Robot [${robotId}] not found, broadcasting to all clients`);
      this.wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          console.log(`[Connector] Broadcasting command to client:`, command);
          client.send(JSON.stringify(command));
        }
      });
    }
  }
}

module.exports = RobotConnector;
