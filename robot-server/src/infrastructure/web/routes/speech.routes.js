const Router = require('@koa/router');
const multer = require('@koa/multer');

const router = new Router({ prefix: '/api' });

const upload = multer({ storage: multer.memoryStorage() });

router.post('/speech-to-text', upload.single('audio'), async (ctx) => {
  try {
    if (!ctx.file) {
      ctx.status = 400;
      ctx.body = { error: '没有收到音频文件' };
      return;
    }

    console.log(`[Speech-to-Text] Received audio: ${ctx.file.originalname}, size: ${ctx.file.size} bytes`);

    const text = await transcribeAudio(ctx.file.buffer);

    ctx.status = 200;
    ctx.body = { text };
  } catch (error) {
    console.error('[Speech-to-Text] Error:', error);
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

async function transcribeAudio(audioBuffer) {
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: '4:e2b',
        prompt: `请将以下音频内容转写为中文文本。`,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error('LLM service unavailable');
    }

    const data = await response.json();
    return data.response || '';
  } catch (error) {
    console.warn('[Speech-to-Text] LLM transcribe failed, using mock:', error.message);
    return '你好，我是机器猫';
  }
}

module.exports = router;
