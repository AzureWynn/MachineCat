const mongoose = require('mongoose');

const TraitMapSchema = new mongoose.Schema({
  // 使用 Map 类型来存储动态的性格特征及其百分比
  // 例如：{ "活泼": 80, "傲娇": 50 }
  type: Map,
  of: Number,
  default: {},
});

const RobotPersonalitySchema = new mongoose.Schema({
  robotId: {
    type: String,
    required: true,
    unique: true, // 每个机器人 ID 对应一个个性档案
    index: true,
  },
  name: {
    type: String,
    required: true,
    default: '小机器人',
  },
  type: {
    type: String,
    required: true,
    enum: ['CAT', 'DOG', 'SNAKE', 'CUSTOM'],
    default: 'CAT',
  },
  traits: TraitMapSchema,
}, { timestamps: true });

// 领域方法可以定义在 Schema 的 methods 或 statics 中，或者在单独的领域类中管理

RobotPersonalitySchema.methods.updateName = function (newName) {
  this.name = newName;
  return this.save();
};

RobotPersonalitySchema.methods.adjustTrait = function (traitName, percentage) {
  if (percentage >= 0 && percentage <= 100) {
    this.traits.set(traitName, percentage);
  } else {
    // 或者可以抛出一个领域错误
    console.error('Percentage must be between 0 and 100.');
  }
  return this.save();
};

const RobotPersonality = mongoose.model('RobotPersonality', RobotPersonalitySchema);

module.exports = RobotPersonality;
