// backend/src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Verifies the Bearer token in the Authorization header.
 * On success, attaches the decoded payload to req.user and calls next().
 * On failure, responds with 401.
 *
 * Usage: router.get('/protected', authenticate, controller)
 */
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Pristup odbijen. Token nije pronađen.',
    });
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Vaša sesija je istekla. Prijavite se ponovo.',
      });
    }
    return res.status(401).json({
      message: 'Nevažeći token. Prijavite se ponovo.',
    });
  }
}

module.exports = { authenticate };