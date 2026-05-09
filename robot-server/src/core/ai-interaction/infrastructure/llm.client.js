const axios = require('axios');

class LLMClient {
  constructor() {
    this.apiUrl = process.env.LLM_API_URL || 'http://localhost:11434/api/generate';
    this.model = process.env.LLM_MODEL || 'gemma4:latest';
    this.useMock = process.env.USE_LLM_MOCK === 'true';
  }

  async generateResponse(prompt) {
    if (this.useMock) {
      return this.mockGenerateResponse(prompt);
    }

    try {
      const response = await axios.post(this.apiUrl, {
        model: this.model,
        prompt: prompt,
        stream: false,
      });

      return response.data.response;
    } catch (error) {
      console.error('LLM API Error:', error.message);
      console.log('Falling back to mock response...');
      return this.mockGenerateResponse(prompt);
    }
  }

  mockGenerateResponse(prompt) {
    const hasNegativeEmotion = /不想|无聊|没意思|烦|郁闷|难过|焦虑|生气|累/.test(prompt);

    if (hasNegativeEmotion) {
      return {
        text: '喵~ 不想出门也没关系，但宅着总会有点闷的！不如我们去小区附近的公园转转好不好？我带你看看有没有可爱的小鸟🐦？',
        actions: [
          { action: 'sit', params: {} },
        ],
        quest: {
          id: 'mock-quest-' + Date.now(),
          description: '去附近的公园散步',
          cost: 2,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      };
    }

    const mockResponses = [
      {
        text: '喵~ 我才不想理你呢！不过既然你说了，那我就勉为其难地动一动吧。',
        actions: [
          { action: 'sit', params: {} },
        ],
        quest: null,
      },
      {
        text: '哼！你以为你是谁啊？不过... 好吧，让我给你表演一下！',
        actions: [
          { action: 'kick', params: {} },
        ],
        quest: null,
      },
      {
        text: '喵呜~ 今天心情不错！让我来陪你玩吧！',
        actions: [
          { action: 'walk', params: {} },
        ],
        quest: null,
      },
    ];

    const randomIndex = Math.floor(Math.random() * mockResponses.length);
    return mockResponses[randomIndex];
  }
}

module.exports = LLMClient;
