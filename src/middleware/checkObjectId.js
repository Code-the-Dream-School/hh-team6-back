const mongoose = require('mongoose');
const { BadRequestError } = require('../errors');

const checkObjectId = (req, res, next) => {
  const { id: bookId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return next(new BadRequestError(`Invalid ID format: ${bookId}`));
  }

  next();
};

module.exports = checkObjectId;