const mongoose = require('mongoose');

const RobotTypeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

const RobotType = mongoose.model('RobotType', RobotTypeSchema);

module.exports = RobotType;
