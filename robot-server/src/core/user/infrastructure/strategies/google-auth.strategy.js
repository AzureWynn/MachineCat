const User = require('../../domain/user.model');

class GoogleAuthStrategy {
  async authenticate({ googleToken }) {
    const axios = require('axios');

    const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${googleToken}`,
      },
    });

    const { sub: googleId, email, name, picture } = response.data;

    let user = await User.findByAuthIdentity('google', googleId);

    if (!user) {
      user = await User.findByLinkedIdentity('google', googleId);
    }

    if (!user) {
      user = await User.create({
        authIdentity: {
          type: 'google',
          providerId: googleId,
          email,
          avatar: picture,
          username: name,
        },
        nickname: name,
        email,
        avatar: picture,
      });
    }

    return user;
  }

  getStrategyName() {
    return 'google';
  }

  getType() {
    return 'oauth';
  }
}

module.exports = GoogleAuthStrategy;
