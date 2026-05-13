const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  authIdentity: {
    type: {
      type: String,
      required: true,
      enum: ['google', 'solana', 'ethereum', 'email', 'github', 'ton', 'sui'],
    },
    providerId: {
      type: String,
      required: true,
    },
    email: String,
    avatar: String,
    username: String,
    passwordHash: String,
  },

  linkedIdentities: [{
    type: String,
    providerId: String,
    email: String,
    avatar: String,
    username: String,
    linkedAt: {
      type: Date,
      default: Date.now,
    },
  }],

  nickname: {
    type: String,
    maxlength: 50,
  },

  avatar: String,

  email: {
    type: String,
    lowercase: true,
    trim: true,
  },

  currentRobotId: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre('save', async function() {
  this.updatedAt = new Date();
});

userSchema.methods.addLinkedIdentity = function(identity) {
  const exists = this.linkedIdentities.some(
    (item) => item.type === identity.type && item.providerId === identity.providerId
  );

  if (!exists) {
    this.linkedIdentities.push(identity);
  }

  return this.save();
};

userSchema.methods.removeLinkedIdentity = function(type, providerId) {
  this.linkedIdentities = this.linkedIdentities.filter(
    (item) => !(item.type === type && item.providerId === providerId)
  );

  return this.save();
};

userSchema.statics.findByAuthIdentity = function(type, providerId) {
  return this.findOne({
    'authIdentity.type': type,
    'authIdentity.providerId': providerId,
  });
};

userSchema.statics.findByLinkedIdentity = function(type, providerId) {
  return this.findOne({
    'linkedIdentities.type': type,
    'linkedIdentities.providerId': providerId,
  });
};

module.exports = mongoose.model('User', userSchema);
