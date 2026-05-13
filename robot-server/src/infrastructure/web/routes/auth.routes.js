const Router = require('@koa/router');
const authManager = require('../../../core/user/infrastructure/auth-manager');
const { generateToken } = require('../../../core/user/infrastructure/auth.service');

const router = new Router({ prefix: '/api/auth' });

router.get('/nonce', async (ctx) => {
  const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  ctx.status = 200;
  ctx.body = {
    success: true,
    data: {
      nonce,
      message: `Sign this message to login: ${nonce}`,
    },
  };
});

router.post('/:strategy', async (ctx) => {
  try {
    const { strategy } = ctx.params;
    const credentials = ctx.request.body;

    const user = await authManager.authenticate(strategy, credentials);

    const token = generateToken(user);

    ctx.status = 200;
    ctx.body = {
      success: true,
      data: {
        token,
        user: {
          id: user._id.toString(),
          nickname: user.nickname,
          email: user.email,
          avatar: user.avatar,
          authType: user.authIdentity.type,
          currentRobotId: user.currentRobotId,
        },
      },
    };
  } catch (error) {
    console.error(`Auth error (${ctx.params.strategy}):`, error);
    ctx.status = 401;
    ctx.body = {
      success: false,
      error: error.message || 'Authentication failed',
    };
  }
});

module.exports = { router };
