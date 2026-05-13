const bcrypt = require('bcryptjs');
const User = require('../../domain/user.model');

class EmailAuthStrategy {
  async authenticate({ email, password, nickname }) {
    const normalizedEmail = email.toLowerCase().trim();

    let user = await User.findOne({ 'authIdentity.type': 'email', 'authIdentity.providerId': normalizedEmail });

    if (!user) {
      user = await User.findOne({ 'linkedIdentities.type': 'email', 'linkedIdentities.providerId': normalizedEmail });
    }

    if (user) {
      const isValidPassword = await bcrypt.compare(password, user.authIdentity.passwordHash);
      if (!isValidPassword) {
        throw new Error('Invalid password');
      }
      return user;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    user = await User.create({
      authIdentity: {
        type: 'email',
        providerId: normalizedEmail,
        email: normalizedEmail,
        passwordHash,
      },
      nickname: nickname || normalizedEmail.split('@')[0],
      email: normalizedEmail,
    });

    return user;
  }

  getStrategyName() {
    return 'email';
  }

  getType() {
    return 'email';
  }
}

module.exports = EmailAuthStrategy;
