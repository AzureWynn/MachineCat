const mongoose = require('mongoose');
const RobotType = require('../src/core/robot-personality/domain/robot-type');
const Breed = require('../src/core/robot-personality/domain/breed');
const Trait = require('../src/core/robot-personality/domain/trait');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/robot-platform';

const robotTypes = [
  { code: 'CAT', name: '猫', icon: '🐱', description: '灵活可爱的猫型机器人', sortOrder: 1 },
  { code: 'DOG', name: '狗', icon: '🐶', description: '忠诚活泼的狗型机器人', sortOrder: 2 },
  { code: 'SNAKE', name: '蛇', icon: '🐍', description: '神秘优雅的蛇型机器人', sortOrder: 3 },
  { code: 'CUSTOM', name: '自定义', icon: '🤖', description: '自由定制的特殊机器人', sortOrder: 4 },
];

const breeds = [
  { code: 'BRITISH_SHORTHAIR', name: '英短蓝猫', robotType: 'CAT', description: '圆润可爱，性格温顺', sortOrder: 1 },
  { code: 'SIAMESE', name: '暹罗猫', robotType: 'CAT', description: '聪明活泼，叫声独特', sortOrder: 2 },
  { code: 'PERSIAN', name: '波斯猫', robotType: 'CAT', description: '高贵优雅，毛发浓密', sortOrder: 3 },
  { code: 'RAGDOLL', name: '布偶猫', robotType: 'CAT', description: '温柔粘人，体型较大', sortOrder: 4 },
  { code: 'TABBY', name: '狸花猫', robotType: 'CAT', description: '独立勇敢，适应力强', sortOrder: 5 },
  { code: 'GOLDEN_RETRIEVER', name: '金毛', robotType: 'DOG', description: '友善聪明，适合家庭', sortOrder: 1 },
  { code: 'HUSKY', name: '哈士奇', robotType: 'DOG', description: '精力充沛，表情丰富', sortOrder: 2 },
  { code: 'POODLE', name: '贵宾犬', robotType: 'DOG', description: '聪明优雅，不掉毛', sortOrder: 3 },
  { code: 'CORG', name: '柯基', robotType: 'DOG', description: '短腿大屁股，活泼可爱', sortOrder: 4 },
  { code: 'SHIBA', name: '柴犬', robotType: 'DOG', description: '忠诚独立，表情丰富', sortOrder: 5 },
  { code: 'PYTHON', name: '蟒蛇', robotType: 'SNAKE', description: '体型庞大，行动缓慢', sortOrder: 1 },
  { code: 'COBRA', name: '眼镜蛇', robotType: 'SNAKE', description: '敏捷灵活，威慑力强', sortOrder: 2 },
  { code: 'VIPER', name: '蝰蛇', robotType: 'SNAKE', description: '小巧敏捷，反应迅速', sortOrder: 3 },
  { code: 'GENERIC', name: '通用型', robotType: 'CUSTOM', description: '标准配置的通用机器人', sortOrder: 1 },
];

const traits = [
  { code: 'LIVELY', name: '活泼', description: '充满活力，喜欢运动和互动', defaultValue: 50, sortOrder: 1 },
  { code: 'TSUNDERE', name: '傲娇', description: '表面冷淡内心热情，口是心非', defaultValue: 50, sortOrder: 2 },
  { code: 'CURIOUS', name: '好奇', description: '对新鲜事物充满探索欲', defaultValue: 50, sortOrder: 3 },
  { code: 'GENTLE', name: '温柔', description: '性格温和，善解人意', defaultValue: 50, sortOrder: 4 },
  { code: 'BRAVE', name: '勇敢', description: '不畏困难，敢于冒险', defaultValue: 50, sortOrder: 5 },
  { code: 'LAZY', name: '懒惰', description: '喜欢休息，行动缓慢', defaultValue: 50, sortOrder: 6 },
  { code: 'SMART', name: '聪明', description: '学习能力强，反应敏捷', defaultValue: 50, sortOrder: 7 },
  { code: 'SHY', name: '害羞', description: '容易紧张，需要时间熟悉', defaultValue: 50, sortOrder: 8 },
  { code: 'PLAYFUL', name: '调皮', description: '喜欢恶作剧，充满活力', defaultValue: 50, sortOrder: 9 },
  { code: 'LOYAL', name: '忠诚', description: '对主人忠心耿耿', defaultValue: 50, sortOrder: 10 },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🍃 MongoDB connected');

    console.log('\n📦 Seeding Robot Types...');
    for (const type of robotTypes) {
      await RobotType.findOneAndUpdate(
        { code: type.code },
        type,
        { upsert: true, new: true }
      );
      console.log(`  ✅ ${type.icon} ${type.name} (${type.code})`);
    }

    console.log('\n Seeding Breeds...');
    for (const breed of breeds) {
      await Breed.findOneAndUpdate(
        { code: breed.code },
        breed,
        { upsert: true, new: true }
      );
      console.log(`  ✅ ${breed.name} (${breed.robotType})`);
    }

    console.log('\n Seeding Traits...');
    for (const trait of traits) {
      await Trait.findOneAndUpdate(
        { code: trait.code },
        trait,
        { upsert: true, new: true }
      );
      console.log(`  ✅ ${trait.name} (${trait.code})`);
    }

    console.log('\n✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
