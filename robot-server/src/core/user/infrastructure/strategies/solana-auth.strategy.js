const nacl = require('tweetnacl');
const bs58 = require('bs58').default;
const User = require('../../domain/user.model');

class SolanaAuthStrategy {
  async authenticate({ walletAddress, signature, message }) {
    const signatureBytes = bs58.decode(signature);
    const messageBytes = Buffer.from(message);
    const publicKeyBytes = bs58.decode(walletAddress);

    const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);

    if (!isValid) {
      throw new Error('Invalid signature');
    }

    let user = await User.findByAuthIdentity('solana', walletAddress);

    if (!user) {
      user = await User.findByLinkedIdentity('solana', walletAddress);
    }

    if (!user) {
      user = await User.create({
        authIdentity: {
          type: 'solana',
          providerId: walletAddress,
        },
        nickname: walletAddress.substring(0, 6),
      });
    }

    return user;
  }

  getStrategyName() {
    return 'solana';
  }

  getType() {
    return 'wallet';
  }
}

module.exports = SolanaAuthStrategy;
