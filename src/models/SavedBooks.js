const mongoose = require('mongoose');
const { validateISBN10, validateISBN13 } = require('../utils/validateISBN');

const SavedBooksSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    books: [
      {
        isbn10: {
          type: String,
          validate: {
            validator: validateISBN10,
            message: 'Invalid ISBN-10 format.',
          },
        },
        isbn13: {
          type: String,
          validate: {
            validator: validateISBN13,
            message: 'Invalid ISBN-13 format.',
          },
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

SavedBooksSchema.path('books').validate(function (value) {
  return value.some((book) => book.isbn10 || book.isbn13);
}, 'At least one ISBN (ISBN-10 or ISBN-13) must be provided.');

module.exports = mongoose.model('SavedBooks', SavedBooksSchema);