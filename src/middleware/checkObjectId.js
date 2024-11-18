const mongoose = require('mongoose');

const checkObjectId = (req, res, next) => {
  const { id: bookId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    const error = new Error(`Invalid ID format: ${bookId}`);
    error.name = 'CastError';
    return next(error);
  }

  next();
};

module.exports = checkObjectId;