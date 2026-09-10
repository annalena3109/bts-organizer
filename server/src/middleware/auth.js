import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bts_cozy_secret_key_change_in_prod';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication token required.' });
  }

  const token = authHeader.split(' ')[1];

  // Demo / fallback token support
  if (token === 'demo-token') {
    req.user = { id: 'demo-user-1', email: 'annalena@school.edu' };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication session.' });
  }
}

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export default { requireAuth, generateToken };
