const { StatusCodes } = require('http-status-codes');
const { BadRequestError } = require('../errors');
const SavedBooks = require('../models/SavedBooks');

const addBookToSavedBooks = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { isbn10, isbn13 } = req.body;

    if (!isbn10 && !isbn13) {
      throw new BadRequestError(
        'At least one ISBN (ISBN-10 or ISBN-13) must be provided.'
      );
    }

    let savedBooks = await SavedBooks.findOne({ user: userId });

    if (!savedBooks) {
      savedBooks = new SavedBooks({
        user: userId,
        books: [],
      });
    }

    const bookExists = savedBooks.books.some(
      (book) => book.isbn10 === isbn10 || book.isbn13 === isbn13
    );

    if (bookExists) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: 'This book is already saved.' });
    }

    const newBook = {
      isbn10,
      isbn13,
      addedAt: new Date(),
    };

    savedBooks.books.push(newBook);

    await savedBooks.save();

    res
      .status(StatusCodes.CREATED)
      .json({ msg: 'Book added successfully', savedBooks });
  } catch (error) {
    console.error('Error adding book:', error);
    next(error);
  }
};

module.exports = {
  addBookToSavedBooks,
};
