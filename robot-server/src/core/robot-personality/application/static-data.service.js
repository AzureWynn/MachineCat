const RobotType = require('../domain/robot-type');
const Breed = require('../domain/breed');
const Trait = require('../domain/trait');

class StaticDataService {
  static async getAllRobotTypes() {
    return RobotType.find().sort({ sortOrder: 1 });
  }

  static async getAllBreeds(robotType) {
    const query = robotType ? { robotType } : {};
    return Breed.find(query).sort({ sortOrder: 1 });
  }

  static async getAllTraits() {
    return Trait.find().sort({ sortOrder: 1 });
  }

  static async getStaticData() {
    const [robotTypes, breeds, traits] = await Promise.all([
      this.getAllRobotTypes(),
      this.getAllBreeds(),
      this.getAllTraits(),
    ]);

    return { robotTypes, breeds, traits };
  }
}

module.exports = StaticDataService;
