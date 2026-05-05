const Router = require('@koa/router');
const StaticDataService = require('../../../core/robot-personality/application/static-data.service');

const router = new Router({ prefix: '/api/static-data' });

router.get('/robot-types', async (ctx) => {
  try {
    const robotTypes = await StaticDataService.getAllRobotTypes();
    ctx.status = 200;
    ctx.body = robotTypes;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

router.get('/breeds', async (ctx) => {
  try {
    const { robotType } = ctx.query;
    const breeds = await StaticDataService.getAllBreeds(robotType);
    ctx.status = 200;
    ctx.body = breeds;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

router.get('/traits', async (ctx) => {
  try {
    const traits = await StaticDataService.getAllTraits();
    ctx.status = 200;
    ctx.body = traits;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

router.get('/all', async (ctx) => {
  try {
    const data = await StaticDataService.getStaticData();
    ctx.status = 200;
    ctx.body = data;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

module.exports = router;
