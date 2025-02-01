const jwt = require('jsonwebtoken');

// Middleware for JWT validation
const verifyTokenMiddleware = (req, res, next) => {
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }

      // Attach the decoded payload to the request object
      req.user = decoded;

      // Proceed to the next middleware
      next();
    });
  } catch (error) {
    console.error('Error in verifyToken middleware:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = verifyTokenMiddleware;