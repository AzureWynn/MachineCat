const axios = require('axios');

class LLMClient {
  constructor() {
    this.apiUrl = process.env.LLM_API_URL || 'http://localhost:11434/api/generate';
    // this.model = process.env.LLM_MODEL || 'gemma4:e2b';
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
    const mockResponses = [
      {
        text: '喵~ 我才不想理你呢！不过既然你说了，那我就勉为其难地动一动吧。',
        actions: [
          { action: 'move', params: { direction: 'forward', distance: 2 } },
          { action: 'turn', params: { direction: 'left', angle: 45 } },
        ],
      },
      {
        text: '哼！你以为你是谁啊？不过... 好吧，让我给你表演一下！',
        actions: [
          { action: 'kick', params: { leg: 'right', power: 50 } },
          { action: 'move', params: { direction: 'backward', distance: 1 } },
        ],
      },
      {
        text: '喵呜~ 今天心情不错！让我来陪你玩吧！',
        actions: [
          { action: 'move', params: { direction: 'forward', distance: 3 } },
          { action: 'turn', params: { direction: 'right', angle: 90 } },
          { action: 'move', params: { direction: 'forward', distance: 2 } },
        ],
      },
    ];

    const randomIndex = Math.floor(Math.random() * mockResponses.length);
    return mockResponses[randomIndex];
  }
}

module.exports = LLMClient;
