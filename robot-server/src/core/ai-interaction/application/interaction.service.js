const PersonalityService = require('../../robot-personality/application/personality.service');
const LLMClient = require('../infrastructure/llm.client');
const PromptBuilder = require('./prompt-builder');
const ResponseParser = require('./response-parser');

class InteractionService {
  constructor(robotConnector) {
    this.robotConnector = robotConnector;
    this.llmClient = new LLMClient();
    this.promptBuilder = new PromptBuilder();
    this.responseParser = new ResponseParser();
  }

  async processInteraction(robotId, userInput) {
    console.log(`\n[Chat] ===== 开始处理聊天请求 =====`);
    console.log(`[Chat] 机器猫ID: ${robotId}`);
    console.log(`[Chat] 用户输入: ${userInput}`);

    const personality = await PersonalityService.getPersonalityByRobotId(robotId);

    if (!personality) {
      console.error(`[Chat] ❌ 未找到机器猫 ${robotId} 的性格配置`);
      throw new Error(`No personality found for robot: ${robotId}`);
    }

    console.log(`[Chat] ✅ 获取性格配置: ${personality.name} (${personality.type})`);

    const prompt = this.promptBuilder.buildPrompt(personality, userInput);
    console.log(`[Chat] 📝 构建 Prompt 完成 (长度: ${prompt.length} 字符)`);

    console.log(`[Chat] 🤖 调用 LLM...`);
    const llmResponse = await this.llmClient.generateResponse(prompt);
    console.log(`[Chat] 🤖 LLM 原始返回: ${JSON.stringify(llmResponse).substring(0, 200)}...`);

    const parsedResponse = this.responseParser.parse(llmResponse);
    console.log(`[Chat] 📋 解析结果:`);
    console.log(`[Chat]   - 文字回复: ${parsedResponse.text}`);
    console.log(`[Chat]   - 原始动作: ${JSON.stringify(parsedResponse.actions)}`);

    const validActions = this.responseParser.filterValidActions(parsedResponse.actions);
    console.log(`[Chat] ✅ 有效动作: ${JSON.stringify(validActions)}`);

    if (validActions.length === 0) {
      console.log(`[Chat] ⚠️ 无有效动作，使用默认动作: sit`);
      validActions.push({ action: 'sit', params: {} });
    }

    for (const action of validActions) {
      console.log(`[Chat] 📤 发送指令到机器猫: ${action.action}`);
      this.robotConnector.sendCommand(robotId, action);
      
      if (validActions.length > 1) {
        console.log(`[Chat] ⏱️ 等待 2 秒后执行下一个动作...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }


    console.log(`[Chat] ⏱️ 等待 10 秒让动作执行完成...`);
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log(`[Chat] 🛑 动作序列完成，发送 stop 指令`);
    this.robotConnector.sendCommand(robotId, { action: 'stop', params: {} });

    console.log(`[Chat] ===== 聊天请求处理完成 =====\n`);

    return {
      robotId,
      userInput,
      responseText: parsedResponse.text,
      actions: validActions,
      quest: parsedResponse.quest,
    };
  }
}

module.exports = InteractionService;
