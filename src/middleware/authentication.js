const jwt = require('jsonwebtoken');
const { UnauthenticatedError } = require('../errors');

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthenticatedError('Authentication invalid'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: payload.userId, firstName: payload.firstName };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new UnauthenticatedError('Token has expired. Please log in again.'));
    }
    return next(new UnauthenticatedError('Authentication invalid'));
  }
};

module.exports = auth;