const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // Extract Bearer token from Authorization header
  const authHeader = req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Verify with jwt.verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      console.warn('[AUTH] Token expired:', err.expiredAt);
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('[AUTH] JWT Verification Failed:', err.message, '| Secret used snippet:', process.env.JWT_SECRET?.substring(0, 4) + '...');
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { auth };
