const CustomAPIError = require('./custom-api');
const { StatusCodes } = require('http-status-codes');

class CloudinaryError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  }
}

module.exports = CloudinaryError;
