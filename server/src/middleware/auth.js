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
    console.error('JWT Verification Error:', err.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { auth };
