const mongoose = require('mongoose');

const TraitSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  defaultValue: {
    type: Number,
    default: 50,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

const Trait = mongoose.model('Trait', TraitSchema);

module.exports = Trait;
