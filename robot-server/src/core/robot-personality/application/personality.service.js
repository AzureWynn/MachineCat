const RobotPersonality = require('../domain/robot-personality');

class PersonalityService {
  /**
   * 创建或更新一个机器人的个性档案
   * @param {string} robotId - 机器人的唯一 ID
   * @param {object} personalityData - 个性数据，例如 { name, type, traits }
   * @returns {Promise<RobotPersonality>}
   */
  static async createOrUpdatePersonality(robotId, personalityData) {
    try {
      const personality = await RobotPersonality.findOneAndUpdate(
        { robotId },
        { robotId, ...personalityData },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      return personality;
    } catch (error) {
      console.error('Error in createOrUpdatePersonality:', error);
      throw new Error('Failed to save personality.');
    }
  }

  /**
   * 根据机器人 ID 获取其个性档案
   * @param {string} robotId - 机器人的唯一 ID
   * @returns {Promise<RobotPersonality|null>}
   */
  static async getPersonalityByRobotId(robotId) {
    try {
      const personality = await RobotPersonality.findOne({ robotId });
      return personality;
    } catch (error) {
      console.error('Error in getPersonalityByRobotId:', error);
      throw new Error('Failed to retrieve personality.');
    }
  }
}

module.exports = PersonalityService;
