const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'machinecat-jwt-secret-key-change-in-production';
const JWT_EXPIRATION = '7d';

function generateToken(user) {
  const payload = {
    userId: user._id.toString(),
    authType: user.authIdentity.type,
    providerId: user.authIdentity.providerId,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

function authMiddleware(ctx, next) {
  const authHeader = ctx.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    ctx.status = 401;
    ctx.body = { error: 'Unauthorized: Missing or invalid token' };
    return;
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    ctx.status = 401;
    ctx.body = { error: 'Unauthorized: Invalid or expired token' };
    return;
  }

  ctx.state.user = decoded;
  return next();
}

module.exports = {
  generateToken,
  verifyToken,
  authMiddleware,
  JWT_SECRET,
};
