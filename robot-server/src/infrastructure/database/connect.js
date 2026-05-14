const mongoose = require('mongoose');

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/robot-platform';

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
    console.log('🍃 MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('⚠️ MongoDB connection error:', error.message);
    console.log('📦 使用 Mock 模式运行（无数据库）');
    return false;
  }
}

module.exports = connectDB;
