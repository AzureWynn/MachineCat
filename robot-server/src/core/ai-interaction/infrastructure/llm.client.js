const axios = require('axios');

class LLMClient {
  constructor() {
    this.apiUrl = process.env.LLM_API_URL || 'http://ollama:11434/api/generate';
    this.model = process.env.LLM_MODEL || 'qwen2.5:0.5b';
    this.useMock = process.env.USE_LLM_MOCK === 'true';

    console.log(`[LLM] API URL: ${this.apiUrl}`);
    console.log(`[LLM] Model: ${this.model}`);
    console.log(`[LLM] Use Mock: ${this.useMock}`);
  }

  async generateResponse(prompt) {
    if (this.useMock) {
      console.log('[LLM] Using mock mode (USE_LLM_MOCK=true)');
      return this.mockGenerateResponse(prompt);
    }

    try {
      console.log(`[LLM] Calling API: ${this.apiUrl} with model: ${this.model}`);
      const response = await axios.post(this.apiUrl, {
        model: this.model,
        prompt: prompt,
        stream: false,
      }, { timeout: 120000 });

      console.log(`[LLM] Response received, length: ${response.data.response?.length || 0}`);
      return response.data.response;
    } catch (error) {
      console.error(`[LLM] API Error: ${error.message}`);
      if (error.response) {
        console.error(`[LLM] Response status: ${error.response.status}`);
        console.error(`[LLM] Response data: ${JSON.stringify(error.response.data)}`);
      }
      console.log('[LLM] Falling back to mock response...');
      return this.mockGenerateResponse(prompt);
    }
  }

  mockGenerateResponse(prompt) {
    const hasNegativeEmotion = /^(.*(?:不想出门|不想动|好无聊|太无聊|无聊死了|烦死了|郁闷死了|难过死了|焦虑死了|不想活了|没意思透了|累死了|好累啊|真烦|烦得很|郁闷得很|焦虑得很|难过得很))+$/i.test(prompt);

    if (hasNegativeEmotion) {
      const questResponses = this.mockResponses.filter(r => r.quest !== null);
      if (questResponses.length > 0) {
        return questResponses[Math.floor(Math.random() * questResponses.length)];
      }
    }

    if (!this.mockResponses || this.mockUsedIndices.size >= this.mockResponses.length) {
      this.mockUsedIndices = new Set();
      this.mockResponses = this.generateMockResponses();
    }

    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * this.mockResponses.length);
    } while (this.mockUsedIndices.has(randomIndex));

    this.mockUsedIndices.add(randomIndex);
    return this.mockResponses[randomIndex];
  }

  generateMockResponses() {
    const responses = [
      {
        text: '喵~ 我才不想理你呢！不过既然你说了，那我就勉为其难地动一动吧。',
        actions: [
          { action: 'sit', params: {} },
          { action: 'swing', params: {} },
        ],
        quest: {
          description: '去楼下便利店买瓶水',
          cost: 1.5,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '哼！你以为你是谁啊？不过... 好吧，让我给你表演一下！',
        actions: [
          { action: 'kick', params: {} },
          { action: 'swing', params: {} },
        ],
        quest: {
          description: '去小区门口拿快递',
          cost: 2.0,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵呜~ 今天心情不错！让我来陪你玩吧！',
        actions: [
          { action: 'walk', params: {} },
          { action: 'swing', params: {} },
        ],
        quest: {
          description: '去公园散步十分钟',
          cost: 1.0,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵？你叫我干嘛？我正忙着晒太阳呢！',
        actions: [
          { action: 'sit', params: {} },
          { action: 'balance', params: {} },
        ],
        quest: null,
      },
      {
        text: '咕噜咕噜~ 主人今天怎么有空找我玩啦？',
        actions: [
          { action: 'follow', params: {} },
          { action: 'sit', params: {} },
        ],
        quest: {
          description: '去阳台浇花',
          cost: 0.5,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵呜！我才不是你的玩具呢！不过... 偶尔陪你玩玩也行。',
        actions: [
          { action: 'jump', params: {} },
          { action: 'balance', params: {} },
        ],
        quest: null,
      },
      {
        text: '哼，看在你给我准备了好吃的份上，就陪你一会儿吧！',
        actions: [
          { action: 'eat', params: {} },
          { action: 'sit', params: {} },
        ],
        quest: {
          description: '去厨房倒杯水喝',
          cost: 0.5,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵~ 你看我这毛茸茸的尾巴，是不是很可爱？',
        actions: [
          { action: 'swing', params: {} },
          { action: 'walk', params: {} },
        ],
        quest: null,
      },
      {
        text: '呼噜呼噜~ 今天天气真好，适合在窗台上打盹！',
        actions: [
          { action: 'walk', params: {} },
          { action: 'sit', params: {} },
          { action: 'sleep', params: {} },
        ],
        quest: {
          description: '去窗台晒晒太阳',
          cost: 0.5,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵呜！别碰我的耳朵！... 不过摸摸头还是可以接受的。',
        actions: [
          { action: 'sit', params: {} },
          { action: 'shakehand', params: {} },
        ],
        quest: null,
      },
      {
        text: '你以为我会听你的吗？... 好吧，这次就例外！',
        actions: [
          { action: 'forward', params: {} },
          { action: 'stop', params: {} },
        ],
        quest: {
          description: '去门口拿个外卖',
          cost: 2.5,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵~ 我刚抓了一只老鼠，要不要看看？开玩笑的啦！',
        actions: [
          { action: 'run', params: {} },
          { action: 'kick', params: {} },
        ],
        quest: null,
      },
      {
        text: '咕噜~ 主人你终于回来了，我等你好久了！',
        actions: [
          { action: 'follow', params: {} },
          { action: 'sit', params: {} },
          { action: 'shakehand', params: {} },
        ],
        quest: {
          description: '去玄关换拖鞋',
          cost: 0.5,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵呜！我才没有想你呢！只是刚好看到你而已！',
        actions: [
          { action: 'sit', params: {} },
          { action: 'swing', params: {} },
        ],
        quest: null,
      },
      {
        text: '哼！你又想让我表演什么把戏？先说好，我可不会！',
        actions: [
          { action: 'balance', params: {} },
          { action: 'sit', params: {} },
        ],
        quest: {
          description: '去书架上拿本书',
          cost: 1.0,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵~ 今天想吃小鱼干，你准备了吗？',
        actions: [
          { action: 'eat', params: {} },
          { action: 'sit', params: {} },
        ],
        quest: {
          description: '去超市买包小鱼干',
          cost: 3.0,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '呼噜呼噜~ 这个沙发真舒服，借我躺一会儿！',
        actions: [
          { action: 'walk', params: {} },
          { action: 'sit', params: {} },
          { action: 'sleep', params: {} },
        ],
        quest: null,
      },
      {
        text: '喵呜！你踩到我的尾巴了！... 算了，原谅你了。',
        actions: [
          { action: 'sit', params: {} },
          { action: 'backward', params: {} },
        ],
        quest: null,
      },
      {
        text: '喵？外面有只奇怪的猫，我去看看！',
        actions: [
          { action: 'walk', params: {} },
          { action: 'stop', params: {} },
        ],
        quest: {
          description: '去阳台看看外面的风景',
          cost: 0.5,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '咕噜~ 主人你的手艺越来越好了，今天的饭真好吃！',
        actions: [
          { action: 'eat', params: {} },
          { action: 'swing', params: {} },
        ],
        quest: {
          description: '去厨房洗个碗',
          cost: 1.0,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵~ 我才不困呢！... 打哈欠... 好吧我承认有点困。',
        actions: [
          { action: 'sleep', params: {} },
          { action: 'sit', params: {} },
        ],
        quest: null,
      },
      {
        text: '哼！你又想拍照发朋友圈？先给我小鱼干！',
        actions: [
          { action: 'sit', params: {} },
          { action: 'balance', params: {} },
        ],
        quest: {
          description: '去手机店买个新手机壳',
          cost: 5.0,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵呜！这个纸箱太棒了，我要钻进去！',
        actions: [
          { action: 'forward', params: {} },
          { action: 'sit', params: {} },
        ],
        quest: null,
      },
      {
        text: '呼噜呼噜~ 主人的膝盖就是最舒服的床！',
        actions: [
          { action: 'walk', params: {} },
          { action: 'sit', params: {} },
          { action: 'sleep', params: {} },
        ],
        quest: {
          description: '去沙发上休息一会儿',
          cost: 0.5,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵~ 你看我翻肚皮的样子，是不是很信任你？',
        actions: [
          { action: 'sit', params: {} },
          { action: 'swing', params: {} },
        ],
        quest: null,
      },
      {
        text: '喵呜！我才不是故意把杯子推下去的！是它自己掉的！',
        actions: [
          { action: 'kick', params: {} },
          { action: 'run', params: {} },
        ],
        quest: {
          description: '去厨房拿抹布擦桌子',
          cost: 1.0,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '咕噜~ 今天阳光真好，我们一起晒太阳吧！',
        actions: [
          { action: 'walk', params: {} },
          { action: 'sit', params: {} },
        ],
        quest: {
          description: '去阳台晒十分钟太阳',
          cost: 0.5,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵？你又买了新玩具给我？让我看看！',
        actions: [
          { action: 'run', params: {} },
          { action: 'play', params: {} },
        ],
        quest: null,
      },
      {
        text: '哼！我才不会轻易被你收买呢！... 除非有猫条。',
        actions: [
          { action: 'eat', params: {} },
          { action: 'sit', params: {} },
        ],
        quest: {
          description: '去便利店买根猫条',
          cost: 2.0,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵呜！这个毛线球真好玩！... 等等，我的毛线球呢？',
        actions: [
          { action: 'run', params: {} },
          { action: 'kick', params: {} },
        ],
        quest: null,
      },
      {
        text: '喵~ 主人你今天看起来心情不错嘛！',
        actions: [
          { action: 'sit', params: {} },
          { action: 'swing', params: {} },
        ],
        quest: {
          description: '去楼下买杯咖啡',
          cost: 3.5,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '呼噜呼噜~ 我最喜欢听你讲故事了，继续继续！',
        actions: [
          { action: 'sit', params: {} },
          { action: 'follow', params: {} },
        ],
        quest: null,
      },
      {
        text: '喵呜！我才没有偷吃你的零食！... 嘴角的渣渣是什么？',
        actions: [
          { action: 'eat', params: {} },
          { action: 'run', params: {} },
        ],
        quest: {
          description: '去厨房把零食收拾好',
          cost: 1.5,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵？你又想给我洗澡？我拒绝！我昨天才洗过！',
        actions: [
          { action: 'run', params: {} },
          { action: 'stop', params: {} },
        ],
        quest: null,
      },
      {
        text: '咕噜~ 这个新窝真舒服，比我的旧窝好多了！',
        actions: [
          { action: 'walk', params: {} },
          { action: 'sit', params: {} },
          { action: 'sleep', params: {} },
        ],
        quest: {
          description: '去卧室整理一下床铺',
          cost: 1.0,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵~ 你看我这优雅的步伐，是不是很迷人？',
        actions: [
          { action: 'walk', params: {} },
          { action: 'balance', params: {} },
        ],
        quest: null,
      },
      {
        text: '哼！你又想让我穿那件丑衣服？门都没有！',
        actions: [
          { action: 'run', params: {} },
          { action: 'stop', params: {} },
        ],
        quest: {
          description: '去衣柜挑件好看的衣服',
          cost: 4.0,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵呜！这个激光红点是什么？我一定要抓住它！',
        actions: [
          { action: 'run', params: {} },
          { action: 'kick', params: {} },
        ],
        quest: null,
      },
      {
        text: '呼噜呼噜~ 主人你的手艺真好，下次还做给我吃！',
        actions: [
          { action: 'eat', params: {} },
          { action: 'sit', params: {} },
        ],
        quest: {
          description: '去菜市场买点新鲜蔬菜',
          cost: 5.0,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵~ 我才不怕打雷呢！... 往你怀里钻... 只是有点冷！',
        actions: [
          { action: 'follow', params: {} },
          { action: 'sit', params: {} },
        ],
        quest: null,
      },
      {
        text: '喵呜！你又想剪我的指甲？我跑！',
        actions: [
          { action: 'run', params: {} },
          { action: 'stop', params: {} },
        ],
        quest: {
          description: '去宠物店买指甲剪',
          cost: 3.0,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '咕噜~ 今天的风好舒服，适合在阳台上吹风！',
        actions: [
          { action: 'walk', params: {} },
          { action: 'sit', params: {} },
        ],
        quest: {
          description: '去阳台呼吸新鲜空气',
          cost: 0.5,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵？你又带了新朋友回来？让我先闻闻！',
        actions: [
          { action: 'walk', params: {} },
          { action: 'sit', params: {} },
        ],
        quest: null,
      },
      {
        text: '哼！我才不会嫉妒那只新来的狗呢！... 才怪！',
        actions: [
          { action: 'sit', params: {} },
          { action: 'swing', params: {} },
        ],
        quest: {
          description: '去宠物店买点零食讨好新朋友',
          cost: 4.5,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵呜！这个猫爬架真高，我要爬到最高处！',
        actions: [
          { action: 'walk', params: {} },
          { action: 'balance', params: {} },
        ],
        quest: null,
      },
      {
        text: '喵~ 主人你今天怎么这么早就回来了？',
        actions: [
          { action: 'follow', params: {} },
          { action: 'sit', params: {} },
        ],
        quest: {
          description: '去门口迎接主人回家',
          cost: 0.5,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '呼噜呼噜~ 你的键盘好暖和，借我趴一会儿！',
        actions: [
          { action: 'walk', params: {} },
          { action: 'sit', params: {} },
          { action: 'sleep', params: {} },
        ],
        quest: null,
      },
      {
        text: '喵呜！我才没有把你的文件推下桌子呢！',
        actions: [
          { action: 'kick', params: {} },
          { action: 'run', params: {} },
        ],
        quest: {
          description: '去书桌整理一下文件',
          cost: 1.0,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵？你又想带我去看兽医？我不去我不去！',
        actions: [
          { action: 'run', params: {} },
          { action: 'stop', params: {} },
        ],
        quest: null,
      },
      {
        text: '咕噜~ 这个新猫砂盆真大，我喜欢！',
        actions: [
          { action: 'walk', params: {} },
          { action: 'sit', params: {} },
        ],
        quest: {
          description: '去超市买包新猫砂',
          cost: 3.5,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵~ 你看我这水汪汪的大眼睛，是不是很可爱？',
        actions: [
          { action: 'sit', params: {} },
          { action: 'swing', params: {} },
        ],
        quest: null,
      },
      {
        text: '哼！你又想让我学狗叫？我可是高贵的猫！',
        actions: [
          { action: 'sit', params: {} },
          { action: 'balance', params: {} },
        ],
        quest: {
          description: '去公园学三种动物叫声',
          cost: 2.0,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵呜！这个窗帘真好玩，我要爬上去！',
        actions: [
          { action: 'walk', params: {} },
          { action: 'balance', params: {} },
        ],
        quest: null,
      },
      {
        text: '呼噜呼噜~ 主人的手真暖和，借我暖一会儿！',
        actions: [
          { action: 'sit', params: {} },
          { action: 'shakehand', params: {} },
        ],
        quest: {
          description: '去厨房泡杯热茶',
          cost: 1.5,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵~ 我才不馋你碗里的肉呢！... 偷偷看一眼...',
        actions: [
          { action: 'eat', params: {} },
          { action: 'sit', params: {} },
        ],
        quest: null,
      },
      {
        text: '喵呜！你又想给我戴那个丑项圈？我拒绝！',
        actions: [
          { action: 'run', params: {} },
          { action: 'stop', params: {} },
        ],
        quest: {
          description: '去宠物店挑个好看的项圈',
          cost: 4.0,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵？外面下雨了，我不能出去玩了！',
        actions: [
          { action: 'sit', params: {} },
          { action: 'sleep', params: {} },
        ],
        quest: null,
      },
      {
        text: '咕噜~ 这个地毯真软，适合打滚！',
        actions: [
          { action: 'walk', params: {} },
          { action: 'sit', params: {} },
          { action: 'sleep', params: {} },
        ],
        quest: {
          description: '去客厅地毯上躺十分钟',
          cost: 0.5,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵~ 主人你今天穿的衣服真好看！... 比我的毛还好看！',
        actions: [
          { action: 'sit', params: {} },
          { action: 'follow', params: {} },
        ],
        quest: null,
      },
      {
        text: '哼！我才不会帮你抓老鼠呢！我又不是猫！',
        actions: [
          { action: 'sit', params: {} },
          { action: 'kick', params: {} },
        ],
        quest: {
          description: '去厨房检查有没有老鼠',
          cost: 2.0,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵呜！这个沙发垫真好玩，我要挠它！',
        actions: [
          { action: 'kick', params: {} },
          { action: 'swing', params: {} },
        ],
        quest: null,
      },
      {
        text: '呼噜呼噜~ 主人的床真大，随便我滚！',
        actions: [
          { action: 'walk', params: {} },
          { action: 'sit', params: {} },
          { action: 'sleep', params: {} },
        ],
        quest: {
          description: '去卧室整理被子',
          cost: 1.0,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵~ 你看我这灵活的身手，是不是很厉害？',
        actions: [
          { action: 'jump', params: {} },
          { action: 'balance', params: {} },
        ],
        quest: null,
      },
      {
        text: '喵呜！你又想让我钻那个小箱子？我进不去的！',
        actions: [
          { action: 'sit', params: {} },
          { action: 'backward', params: {} },
        ],
        quest: {
          description: '去储物间找个大箱子',
          cost: 1.5,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵？你又买了新猫粮？让我尝尝！',
        actions: [
          { action: 'eat', params: {} },
          { action: 'sit', params: {} },
        ],
        quest: null,
      },
      {
        text: '咕噜~ 今天的月亮真圆，适合在窗台赏月！',
        actions: [
          { action: 'walk', params: {} },
          { action: 'sit', params: {} },
        ],
        quest: {
          description: '去阳台赏月十分钟',
          cost: 0.5,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵~ 我才不想吃蔬菜呢！我是肉食动物！',
        actions: [
          { action: 'sit', params: {} },
          { action: 'swing', params: {} },
        ],
        quest: null,
      },
      {
        text: '哼！你又想让我表演后空翻？我又不是杂技演员！',
        actions: [
          { action: 'jump', params: {} },
          { action: 'balance', params: {} },
        ],
        quest: {
          description: '去客厅表演三个杂技动作',
          cost: 3.0,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵呜！这个塑料袋真好玩，沙沙响！',
        actions: [
          { action: 'kick', params: {} },
          { action: 'play', params: {} },
        ],
        quest: null,
      },
      {
        text: '呼噜呼噜~ 主人的衣服上有你的味道，我喜欢！',
        actions: [
          { action: 'sit', params: {} },
          { action: 'follow', params: {} },
        ],
        quest: {
          description: '去衣柜整理一下衣服',
          cost: 1.0,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵~ 你看我这毛茸茸的爪子，是不是很软？',
        actions: [
          { action: 'shakehand', params: {} },
          { action: 'sit', params: {} },
        ],
        quest: null,
      },
      {
        text: '喵呜！你又想让我坐那个丑丑的猫窝？我才不！',
        actions: [
          { action: 'run', params: {} },
          { action: 'stop', params: {} },
        ],
        quest: {
          description: '去宠物店换个新猫窝',
          cost: 5.0,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵？外面有只蝴蝶，我去追！',
        actions: [
          { action: 'run', params: {} },
          { action: 'kick', params: {} },
        ],
        quest: null,
      },
      {
        text: '咕噜~ 这个暖气片真暖和，冬天就靠它了！',
        actions: [
          { action: 'walk', params: {} },
          { action: 'sit', params: {} },
          { action: 'sleep', params: {} },
        ],
        quest: {
          description: '去客厅暖气片旁暖手',
          cost: 0.5,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵~ 主人你今天心情不好吗？让我蹭蹭你！',
        actions: [
          { action: 'follow', params: {} },
          { action: 'sit', params: {} },
        ],
        quest: null,
      },
      {
        text: '哼！我才不会帮你暖被窝呢！... 好吧，就一次！',
        actions: [
          { action: 'walk', params: {} },
          { action: 'sit', params: {} },
          { action: 'sleep', params: {} },
        ],
        quest: {
          description: '去卧室暖被窝十分钟',
          cost: 1.0,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵呜！这个纸团真好玩，我要踢它！',
        actions: [
          { action: 'kick', params: {} },
          { action: 'run', params: {} },
        ],
        quest: null,
      },
      {
        text: '呼噜呼噜~ 主人的怀抱就是最安全的地方！',
        actions: [
          { action: 'follow', params: {} },
          { action: 'sit', params: {} },
        ],
        quest: {
          description: '去沙发上陪主人坐一会儿',
          cost: 0.5,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵~ 你看我这尖尖的耳朵，是不是很灵敏？',
        actions: [
          { action: 'sit', params: {} },
          { action: 'balance', params: {} },
        ],
        quest: null,
      },
      {
        text: '喵呜！你又想让我喝那个苦药水？我拒绝！',
        actions: [
          { action: 'run', params: {} },
          { action: 'stop', params: {} },
        ],
        quest: {
          description: '去药店买瓶甜的药水',
          cost: 3.5,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵？你又带了小鱼干回来？快给我！',
        actions: [
          { action: 'eat', params: {} },
          { action: 'follow', params: {} },
        ],
        quest: null,
      },
      {
        text: '咕噜~ 这个新猫抓板真好用，我要磨爪子！',
        actions: [
          { action: 'kick', params: {} },
          { action: 'balance', params: {} },
        ],
        quest: {
          description: '去客厅磨爪子五分钟',
          cost: 1.0,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵~ 我才不胖呢！我只是毛多！',
        actions: [
          { action: 'sit', params: {} },
          { action: 'swing', params: {} },
        ],
        quest: null,
      },
      {
        text: '哼！你又想让我穿那件圣诞装？太丢猫了！',
        actions: [
          { action: 'run', params: {} },
          { action: 'stop', params: {} },
        ],
        quest: {
          description: '去衣柜挑件好看的衣服',
          cost: 4.0,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵呜！这个盒子真小，但我就是要挤进去！',
        actions: [
          { action: 'forward', params: {} },
          { action: 'sit', params: {} },
        ],
        quest: null,
      },
      {
        text: '呼噜呼噜~ 主人的声音真好听，像催眠曲！',
        actions: [
          { action: 'sit', params: {} },
          { action: 'sleep', params: {} },
        ],
        quest: {
          description: '去卧室听主人讲故事',
          cost: 0.5,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵~ 你看我这长长的胡须，是不是很威风？',
        actions: [
          { action: 'sit', params: {} },
          { action: 'balance', params: {} },
        ],
        quest: null,
      },
      {
        text: '喵呜！你又想让我跳那个高架子？我恐高！',
        actions: [
          { action: 'sit', params: {} },
          { action: 'backward', params: {} },
        ],
        quest: {
          description: '去客厅练习跳远',
          cost: 2.0,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵？外面有只鸟在叫，我去看看！',
        actions: [
          { action: 'walk', params: {} },
          { action: 'stop', params: {} },
        ],
        quest: null,
      },
      {
        text: '咕噜~ 这个新玩具老鼠真好玩，我要追它！',
        actions: [
          { action: 'run', params: {} },
          { action: 'kick', params: {} },
        ],
        quest: {
          description: '去客厅追玩具老鼠十分钟',
          cost: 1.5,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵~ 主人你今天怎么这么晚才回来？',
        actions: [
          { action: 'follow', params: {} },
          { action: 'sit', params: {} },
        ],
        quest: null,
      },
      {
        text: '哼！我才没有等你呢！我只是刚好在门口！',
        actions: [
          { action: 'sit', params: {} },
          { action: 'swing', params: {} },
        ],
        quest: {
          description: '去门口等主人回家',
          cost: 0.5,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵呜！这个新猫树真高，我要爬到顶端！',
        actions: [
          { action: 'walk', params: {} },
          { action: 'balance', params: {} },
        ],
        quest: null,
      },
      {
        text: '呼噜呼噜~ 主人的毛衣真软，适合磨爪子！',
        actions: [
          { action: 'kick', params: {} },
          { action: 'sit', params: {} },
        ],
        quest: {
          description: '去衣柜整理毛衣',
          cost: 1.0,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵~ 你看我这圆滚滚的肚子，是不是很可爱？',
        actions: [
          { action: 'sit', params: {} },
          { action: 'swing', params: {} },
        ],
        quest: null,
      },
      {
        text: '喵呜！你又想让我吃那个绿色蔬菜？我不吃！',
        actions: [
          { action: 'sit', params: {} },
          { action: 'backward', params: {} },
        ],
        quest: {
          description: '去厨房把蔬菜藏起来',
          cost: 1.5,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
      {
        text: '喵？你又想给我梳毛？好吧，舒服就行！',
        actions: [
          { action: 'sit', params: {} },
          { action: 'shakehand', params: {} },
        ],
        quest: null,
      },
      {
        text: '咕噜~ 今天的太阳真暖和，适合睡一整天！',
        actions: [
          { action: 'walk', params: {} },
          { action: 'sit', params: {} },
          { action: 'sleep', params: {} },
        ],
        quest: {
          description: '去阳台晒太阳睡午觉',
          cost: 0.5,
          fromChain: 'ETH',
          toChain: 'SOL',
        },
      },
    ];

    return responses;
  }
}

module.exports = LLMClient;
