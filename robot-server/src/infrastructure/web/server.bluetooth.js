const Koa = require('koa');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const connectDB = require('../database/connect');
const RobotConnector = require('../../core/robot-control/infrastructure/robot-connector.ws');
const RobotBluetoothConnector = require('../../core/robot-control/infrastructure/robot-connector.bluetooth');
const InteractionService = require('../../core/ai-interaction/application/interaction.service');
const healthRouter = require('./routes/health.routes');
const personalityRouter = require('./routes/personality.routes');
const { router: interactionRouter, setInteractionService } = require('./routes/interaction.routes');
const staticDataRouter = require('./routes/static-data.routes');
const speechRouter = require('./routes/speech.routes');

const app = new Koa();

app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (ctx.method === 'OPTIONS') {
    ctx.status = 204;
    return;
  }
  await next();
});

app.use(healthRouter.routes()).use(healthRouter.allowedMethods());
app.use(personalityRouter.routes()).use(personalityRouter.allowedMethods());
app.use(staticDataRouter.routes()).use(staticDataRouter.allowedMethods());
app.use(speechRouter.routes()).use(speechRouter.allowedMethods());

const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3002;
const USE_BLUETOOTH = process.env.USE_BLUETOOTH === 'true';

const certPath = path.join(__dirname, '../../..', 'certificates');
const httpsOptions = {
  key: fs.readFileSync(path.join(certPath, 'localhost-key.pem')),
  cert: fs.readFileSync(path.join(certPath, 'localhost.pem')),
};

const server = https.createServer(httpsOptions, app.callback());

let robotConnector;

if (USE_BLUETOOTH) {
  robotConnector = new RobotBluetoothConnector();
  
  robotConnector.on('connected', () => {
    console.log('✅ 蓝牙机器人已连接');
  });
  
  robotConnector.on('error', (error) => {
    console.error('❌ 蓝牙错误:', error.message);
  });
  
  robotConnector.connect().catch((error) => {
    console.error('蓝牙连接失败，回退到 WebSocket 模式:', error.message);
    robotConnector = new RobotConnector(server);
  });
} else {
  robotConnector = new RobotConnector(server);
}

const interactionService = new InteractionService(robotConnector);
setInteractionService(interactionService);

app.use(interactionRouter.routes()).use(interactionRouter.allowedMethods());

connectDB().then(() => {
  server.listen(HTTPS_PORT, () => {
    console.log(`🚀 Server listening on https://localhost:${HTTPS_PORT}`);
    console.log(`📡 连接模式: ${USE_BLUETOOTH ? '蓝牙直连' : 'WebSocket'}`);
  });
});
