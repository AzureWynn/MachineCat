const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const Koa = require('koa');
const koaBody = require('koa-bodyparser');
const http = require('http');
const https = require('https');
const fs = require('fs');
const connectDB = require('../database/connect');
const RobotHTTPConnector = require('../../core/robot-control/infrastructure/robot-connector.http');
const InteractionService = require('../../core/ai-interaction/application/interaction.service');
const LLMClient = require('../../core/ai-interaction/infrastructure/llm.client');
const healthRouter = require('./routes/health.routes');
const personalityRouter = require('./routes/personality.routes');
const { router: interactionRouter, setInteractionService, setRobotConnector } = require('./routes/interaction.routes');
const staticDataRouter = require('./routes/static-data.routes');
const speechRouter = require('./routes/speech.routes');
const solanaRouter = require('./routes/solana.routes');
const solanaService = require('../../core/blockchain/solana.service');
const paymentRouter = require('./routes/payment.routes');
const paymentService = require('../../core/blockchain/payment.service');
const { router: authRouter } = require('./routes/auth.routes');

console.log('[Env] LLM_API_URL:', process.env.LLM_API_URL);
console.log('[Env] LLM_MODEL:', process.env.LLM_MODEL);
console.log('[Env] USE_LLM_MOCK:', process.env.USE_LLM_MOCK);

const app = new Koa();

app.use(koaBody());

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
app.use(authRouter.routes()).use(authRouter.allowedMethods());
app.use(personalityRouter.routes()).use(personalityRouter.allowedMethods());
app.use(staticDataRouter.routes()).use(staticDataRouter.allowedMethods());
app.use(speechRouter.routes()).use(speechRouter.allowedMethods());
app.use(solanaRouter.routes()).use(solanaRouter.allowedMethods());
app.use(paymentRouter.routes()).use(paymentRouter.allowedMethods());

const PORT = process.env.PORT || 3002;
const ROBOT_IP = process.env.ROBOT_IP || '192.168.4.1';

const server = http.createServer(app.callback());

const robotConnector = new RobotHTTPConnector(ROBOT_IP);

robotConnector.on('command_sent', (data) => {
  console.log(`📤 指令已发送到机器人: ${data.action}`);
});

robotConnector.on('error', (error) => {
  console.error(`❌ 机器人通信错误: ${error.message}`);
});

const interactionService = new InteractionService(robotConnector);
setInteractionService(interactionService);
setRobotConnector(robotConnector);

app.use(interactionRouter.routes()).use(interactionRouter.allowedMethods());

connectDB().then(async () => {
  await solanaService.initialize();
  await paymentService.initialize();
  server.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
    console.log(`🤖 机器人 IP: ${ROBOT_IP}`);
    console.log(`📡 连接模式: HTTP (ESP32 Web 服务器)`);
  });
}).catch((error) => {
  console.error('数据库连接失败:', error);
  Promise.all([solanaService.initialize(), paymentService.initialize()]).then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server listening on http://localhost:${PORT} (无数据库)`);
      console.log(` 机器人 IP: ${ROBOT_IP}`);
    });
  });
});
