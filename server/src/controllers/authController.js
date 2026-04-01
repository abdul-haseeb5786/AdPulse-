const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');

const generateTokens = (user) => {
  const payload = { userId: user.id, email: user.email, role: user.role };
  
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    res.status(200).json({
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const refresh = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // In a real app, you might check a whitelist/database for revoked tokens here.
    // For this project, we just sign a new access token.
    
    const accessToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ token: accessToken, refreshToken });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

module.exports = { login, refresh };
