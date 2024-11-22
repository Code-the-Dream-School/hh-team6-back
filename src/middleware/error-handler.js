const { StatusCodes } = require('http-status-codes');
const { UnauthenticatedError, CustomAPIError, BadRequestError } = require('../errors');

const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: 'Something went wrong, try again later.',
    type: 'GeneralError',
    errors: null,
  };

  console.error('Error occurred:', {
    type: err.type || 'GeneralError',
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  // Handle BadRequestError (e.g., invalid cover image URL)
  if (err instanceof BadRequestError) {
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.msg = err.message || 'Invalid cover image URL format.';
    customError.type = 'BadRequestError';
  }
  
  // Handle GeneralError (404 Not Found routes)
  if (err.type === 'GeneralError') {
    customError.statusCode = 404;
    customError.msg = `Cannot ${req.method} ${req.originalUrl}`;
    customError.type = 'GeneralError';
  }

  // Handling custom errors (CustomAPIError descendants)
  if (err instanceof CustomAPIError) {
    customError.statusCode = err.statusCode;
    customError.msg = err.message;
    customError.type = err.constructor.name;
  }

  // Handle authentication error
  if (err instanceof UnauthenticatedError) {
    customError.statusCode = StatusCodes.UNAUTHORIZED;
    customError.msg = err.message || 'Authentication invalid';
    customError.type = 'UnauthenticatedError';
  }

  // Handling validation errors
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

  // Handling duplicate errors
  if (err.code && err.code === 11000) {
    customError.errors = Object.keys(err.keyValue).reduce((acc, key) => {
      acc[key] =
        `Duplicate value entered for ${key}. Please choose another value.`;
      return acc;
    }, {});
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.msg = 'Duplicate value error';
    customError.type = 'DuplicateKeyError';
  }

  if (err.name === 'CastError') {
    const invalidId = err.value || 'Unknown ID';
    customError.errors = { id: `Invalid ID format: ${invalidId}` };
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.msg = 'Invalid ID';
    customError.type = 'CastError';
  }

  return res.status(customError.statusCode).json({
    type: customError.type,
    msg: customError.msg,
    errors: customError.errors,
  });
};

module.exports = errorHandlerMiddleware;