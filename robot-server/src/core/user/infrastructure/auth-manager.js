const GoogleAuthStrategy = require('./strategies/google-auth.strategy');
const SolanaAuthStrategy = require('./strategies/solana-auth.strategy');
const EmailAuthStrategy = require('./strategies/email-auth.strategy');

class AuthManager {
  constructor() {
    this.strategies = new Map();
  }

  registerStrategy(name, strategy) {
    this.strategies.set(name, strategy);
  }

  async authenticate(strategyName, credentials) {
    const strategy = this.strategies.get(strategyName);
    if (!strategy) {
      throw new Error(`Unknown auth strategy: ${strategyName}`);
    }
    return await strategy.authenticate(credentials);
  }

  getAvailableStrategies() {
    return Array.from(this.strategies.keys());
  }

  getStrategiesByType(type) {
    return Array.from(this.strategies.values())
      .filter((s) => s.getType() === type);
  }
}

const authManager = new AuthManager();

authManager.registerStrategy('google', new GoogleAuthStrategy());
authManager.registerStrategy('solana', new SolanaAuthStrategy());
authManager.registerStrategy('email', new EmailAuthStrategy());

module.exports = authManager;
