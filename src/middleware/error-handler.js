const { StatusCodes } = require('http-status-codes');
const { UnauthenticatedError } = require('../errors');

const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: 'Something went wrong, try again later.',
    type: 'GeneralError',
    errors: null,
  };

  if (err instanceof UnauthenticatedError) {
    customError.statusCode = StatusCodes.UNAUTHORIZED;
    customError.msg = err.message || 'Authentication invalid';
    customError.type = 'UnauthenticatedError';
  }

  if (err.name === 'ValidationError') {
    customError.errors = Object.keys(err.errors).reduce((acc, key) => {
      const message = err.errors[key].message.replace(/^Path `\w+`/, key); 
      acc[key] = message.charAt(0).toUpperCase() + message.slice(1); 
      return acc;
    }, {});
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.msg = 'Validation failed';
    customError.type = 'ValidationError';
  }

  if (err.code && err.code === 11000) {
    customError.errors = Object.keys(err.keyValue).reduce((acc, key) => {
      acc[key] = `Duplicate value entered for ${key}. Please choose another value.`;
      return acc;
    }, {});
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.msg = 'Duplicate value error';
    customError.type = 'DuplicateKeyError';
  }

  if (err.name === 'CastError') {
    customError.errors = { id: `No item found with id: ${err.value}` };
    customError.statusCode = StatusCodes.NOT_FOUND;
    customError.msg = 'Invalid ID';
    customError.type = 'CastError';
  }

  if (!customError.statusCode || !customError.msg) {
    customError.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    customError.msg = 'An unexpected error occurred.';
    customError.type = 'GeneralError';
  }

  return res.status(customError.statusCode).json({
    type: customError.type,
    msg: customError.msg,
    errors: customError.errors,
  });
};

module.exports = errorHandlerMiddleware;