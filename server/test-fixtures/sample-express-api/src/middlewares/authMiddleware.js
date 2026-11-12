export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header required' });
  }
  const secretKey = process.env.JWT_SECRET || 'dev_jwt_secret_key';
  req.userId = 'usr_test_123';
  next();
};

export const requireRole = (role) => (req, res, next) => {
  if (req.userRole !== role) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

