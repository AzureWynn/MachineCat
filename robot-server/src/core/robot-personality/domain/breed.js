const mongoose = require('mongoose');

const BreedSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  robotType: {
    type: String,
    required: true,
    ref: 'RobotType',
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

BreedSchema.index({ robotType: 1, code: 1 }, { unique: true });

const Breed = mongoose.model('Breed', BreedSchema);

module.exports = Breed;
