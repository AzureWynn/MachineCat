const Router = require('@koa/router');
const PersonalityService = require('../../../core/robot-personality/application/personality.service');

const router = new Router({ prefix: '/api/personalities' });

// 创建或更新机器人个性
router.post('/:robotId', async (ctx) => {
  try {
    const { robotId } = ctx.params;
    const personalityData = ctx.request.body;
    const personality = await PersonalityService.createOrUpdatePersonality(robotId, personalityData);
    ctx.status = 200;
    ctx.body = personality;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

// 获取机器人个性
router.get('/:robotId', async (ctx) => {
  try {
    const { robotId } = ctx.params;
    const personality = await PersonalityService.getPersonalityByRobotId(robotId);
    if (personality) {
      ctx.status = 200;
      ctx.body = personality;
    } else {
      ctx.status = 404;
      ctx.body = { message: 'Personality not found for this robot.' };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

module.exports = router;
