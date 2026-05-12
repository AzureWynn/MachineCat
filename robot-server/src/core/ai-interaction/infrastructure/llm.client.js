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
    const actions = [
      { action: 'sit', params: {} },
      { action: 'kick', params: {} },
      { action: 'walk', params: {} },
      { action: 'jump', params: {} },
      { action: 'run', params: {} },
      { action: 'sleep', params: {} },
      { action: 'eat', params: {} },
      { action: 'play', params: {} },
    ];

    const responses = [
      { text: '喵~ 我才不想理你呢！不过既然你说了，那我就勉为其难地动一动吧。' },
      { text: '哼！你以为你是谁啊？不过... 好吧，让我给你表演一下！' },
      { text: '喵呜~ 今天心情不错！让我来陪你玩吧！' },
      { text: '喵？你叫我干嘛？我正忙着晒太阳呢！' },
      { text: '咕噜咕噜~ 主人今天怎么有空找我玩啦？' },
      { text: '喵呜！我才不是你的玩具呢！不过... 偶尔陪你玩玩也行。' },
      { text: '哼，看在你给我准备了好吃的份上，就陪你一会儿吧！' },
      { text: '喵~ 你看我这毛茸茸的尾巴，是不是很可爱？' },
      { text: '呼噜呼噜~ 今天天气真好，适合在窗台上打盹！' },
      { text: '喵呜！别碰我的耳朵！... 不过摸摸头还是可以接受的。' },
      { text: '你以为我会听你的吗？... 好吧，这次就例外！' },
      { text: '喵~ 我刚抓了一只老鼠，要不要看看？开玩笑的啦！' },
      { text: '咕噜~ 主人你终于回来了，我等你好久了！' },
      { text: '喵呜！我才没有想你呢！只是刚好看到你而已！' },
      { text: '哼！你又想让我表演什么把戏？先说好，我可不会！' },
      { text: '喵~ 今天想吃小鱼干，你准备了吗？' },
      { text: '呼噜呼噜~ 这个沙发真舒服，借我躺一会儿！' },
      { text: '喵呜！你踩到我的尾巴了！... 算了，原谅你了。' },
      { text: '喵？外面有只奇怪的猫，我去看看！' },
      { text: '咕噜~ 主人你的手艺越来越好了，今天的饭真好吃！' },
      { text: '喵~ 我才不困呢！... 打哈欠... 好吧我承认有点困。' },
      { text: '哼！你又想拍照发朋友圈？先给我小鱼干！' },
      { text: '喵呜！这个纸箱太棒了，我要钻进去！' },
      { text: '呼噜呼噜~ 主人的膝盖就是最舒服的床！' },
      { text: '喵~ 你看我翻肚皮的样子，是不是很信任你？' },
      { text: '喵呜！我才不是故意把杯子推下去的！是它自己掉的！' },
      { text: '咕噜~ 今天阳光真好，我们一起晒太阳吧！' },
      { text: '喵？你又买了新玩具给我？让我看看！' },
      { text: '哼！我才不会轻易被你收买呢！... 除非有猫条。' },
      { text: '喵呜！这个毛线球真好玩！... 等等，我的毛线球呢？' },
      { text: '喵~ 主人你今天看起来心情不错嘛！' },
      { text: '呼噜呼噜~ 我最喜欢听你讲故事了，继续继续！' },
      { text: '喵呜！我才没有偷吃你的零食！... 嘴角的渣渣是什么？' },
      { text: '喵？你又想给我洗澡？我拒绝！我昨天才洗过！' },
      { text: '咕噜~ 这个新窝真舒服，比我的旧窝好多了！' },
      { text: '喵~ 你看我这优雅的步伐，是不是很迷人？' },
      { text: '哼！你又想让我穿那件丑衣服？门都没有！' },
      { text: '喵呜！这个激光红点是什么？我一定要抓住它！' },
      { text: '呼噜呼噜~ 主人你的手艺真好，下次还做给我吃！' },
      { text: '喵~ 我才不怕打雷呢！... 往你怀里钻... 只是有点冷！' },
      { text: '喵呜！你又想剪我的指甲？我跑！' },
      { text: '咕噜~ 今天的风好舒服，适合在阳台上吹风！' },
      { text: '喵？你又带了新朋友回来？让我先闻闻！' },
      { text: '哼！我才不会嫉妒那只新来的狗呢！... 才怪！' },
      { text: '喵呜！这个猫爬架真高，我要爬到最高处！' },
      { text: '喵~ 主人你今天怎么这么早就回来了？' },
      { text: '呼噜呼噜~ 你的键盘好暖和，借我趴一会儿！' },
      { text: '喵呜！我才没有把你的文件推下桌子呢！' },
      { text: '喵？你又想带我去看兽医？我不去我不去！' },
      { text: '咕噜~ 这个新猫砂盆真大，我喜欢！' },
      { text: '喵~ 你看我这水汪汪的大眼睛，是不是很可爱？' },
      { text: '哼！你又想让我学狗叫？我可是高贵的猫！' },
      { text: '喵呜！这个窗帘真好玩，我要爬上去！' },
      { text: '呼噜呼噜~ 主人的手真暖和，借我暖一会儿！' },
      { text: '喵~ 我才不馋你碗里的肉呢！... 偷偷看一眼...' },
      { text: '喵呜！你又想给我戴那个丑项圈？我拒绝！' },
      { text: '喵？外面下雨了，我不能出去玩了！' },
      { text: '咕噜~ 这个地毯真软，适合打滚！' },
      { text: '喵~ 主人你今天穿的衣服真好看！... 比我的毛还好看！' },
      { text: '哼！我才不会帮你抓老鼠呢！我又不是猫！' },
      { text: '喵呜！这个沙发垫真好玩，我要挠它！' },
      { text: '呼噜呼噜~ 主人的床真大，随便我滚！' },
      { text: '喵~ 你看我这灵活的身手，是不是很厉害？' },
      { text: '喵呜！你又想让我钻那个小箱子？我进不去的！' },
      { text: '喵？你又买了新猫粮？让我尝尝！' },
      { text: '咕噜~ 今天的月亮真圆，适合在窗台赏月！' },
      { text: '喵~ 我才不想吃蔬菜呢！我是肉食动物！' },
      { text: '哼！你又想让我表演后空翻？我又不是杂技演员！' },
      { text: '喵呜！这个塑料袋真好玩，沙沙响！' },
      { text: '呼噜呼噜~ 主人的衣服上有你的味道，我喜欢！' },
      { text: '喵~ 你看我这毛茸茸的爪子，是不是很软？' },
      { text: '喵呜！你又想让我坐那个丑丑的猫窝？我才不！' },
      { text: '喵？外面有只蝴蝶，我去追！' },
      { text: '咕噜~ 这个暖气片真暖和，冬天就靠它了！' },
      { text: '喵~ 主人你今天心情不好吗？让我蹭蹭你！' },
      { text: '哼！我才不会帮你暖被窝呢！... 好吧，就一次！' },
      { text: '喵呜！这个纸团真好玩，我要踢它！' },
      { text: '呼噜呼噜~ 主人的怀抱就是最安全的地方！' },
      { text: '喵~ 你看我这尖尖的耳朵，是不是很灵敏？' },
      { text: '喵呜！你又想让我喝那个苦药水？我拒绝！' },
      { text: '喵？你又带了小鱼干回来？快给我！' },
      { text: '咕噜~ 这个新猫抓板真好用，我要磨爪子！' },
      { text: '喵~ 我才不胖呢！我只是毛多！' },
      { text: '哼！你又想让我穿那件圣诞装？太丢猫了！' },
      { text: '喵呜！这个盒子真小，但我就是要挤进去！' },
      { text: '呼噜呼噜~ 主人的声音真好听，像催眠曲！' },
      { text: '喵~ 你看我这长长的胡须，是不是很威风？' },
      { text: '喵呜！你又想让我跳那个高架子？我恐高！' },
      { text: '喵？外面有只鸟在叫，我去看看！' },
      { text: '咕噜~ 这个新玩具老鼠真好玩，我要追它！' },
      { text: '喵~ 主人你今天怎么这么晚才回来？' },
      { text: '哼！我才没有等你呢！我只是刚好在门口！' },
      { text: '喵呜！这个新猫树真高，我要爬到顶端！' },
      { text: '呼噜呼噜~ 主人的毛衣真软，适合磨爪子！' },
      { text: '喵~ 你看我这圆滚滚的肚子，是不是很可爱？' },
      { text: '喵呜！你又想让我吃那个绿色蔬菜？我不吃！' },
      { text: '喵？你又想给我梳毛？好吧，舒服就行！' },
      { text: '咕噜~ 今天的太阳真暖和，适合睡一整天！' },
    ];

    return responses.map((item, index) => ({
      text: item.text,
      actions: [actions[index % actions.length]],
      quest: null,
    }));
  }
}

module.exports = LLMClient;
