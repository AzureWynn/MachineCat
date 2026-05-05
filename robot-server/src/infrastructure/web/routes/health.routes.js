const Router = require('@koa/router');

const router = new Router({ prefix: '/api/health' });

router.get('/', async (ctx) => {
  ctx.status = 200;
  ctx.body = {
    status: 'ok',
    timestamp: new Date().toISOString(),
  };
});

module.exports = router;
