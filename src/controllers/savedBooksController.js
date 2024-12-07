const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');
const SavedBooks = require('../models/SavedBooks');
const Book = require('../models/Book');

const addBookToSavedBooks = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { isbn10, isbn13 } = req.body;

    if (!isbn10 && !isbn13) {
      return next(
        new BadRequestError(
          'At least one ISBN (ISBN-10 or ISBN-13) must be provided.'
        )
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

const getSavedBooks = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const savedBooks = await SavedBooks.findOne({ user: userId });

    if (!savedBooks) {
      return next(new NotFoundError('No saved books found for this user.'));
    }

    const booksWithDetails = [];
    
    for (const savedBook of savedBooks.books) {
      const bookDetails = await Book.find({
        $or: [
          { isbn10: savedBook.isbn10 },
          { isbn13: savedBook.isbn13 },
        ],
      });

      if (bookDetails.length > 0) {
        const bookData = {
          isbn10: savedBook.isbn10,
          isbn13: savedBook.isbn13,
          title: bookDetails[0].title,
          author: bookDetails[0].author,
          listings: [],
        };

        bookDetails.forEach((book) => {
          bookData.listings.push({
            userId: book.createdBy,
            bookIdOriginal: book._id,
            bookIdInSaved: savedBook._id,
            price: book.price,
            isAvailable: book.isAvailable,
            condition: book.condition,
            coverImageUrl: book.coverImageUrl,
          });
        });

        booksWithDetails.push(bookData);
      }
    }

    res.status(StatusCodes.OK).json({
      msg: 'Saved books fetched successfully.',
      savedBooks: {
        books: booksWithDetails,
      },
    });
  } catch (error) {
    console.error('Error fetching saved books:', error);
    next(error);
  }
};

const deleteBookFromSavedBooks = async (req, res, next) => {
  try {
    const { userId } = req.user; 
    const { savedBookId } = req.body; 

    if (!savedBookId) {
      return next(new BadRequestError('Book ID is required to remove a book.'));
    }

    const updatedSavedBooks = await SavedBooks.findOneAndUpdate(
      { user: userId }, 
      { $pull: { books: { _id: savedBookId } } },
      { new: true } 
    );

    if (!updatedSavedBooks) {
      return next(new NotFoundError('No saved books found for this user.'));
    }

    const wasBookRemoved = !updatedSavedBooks.books.some(
      (book) => book._id.toString() === savedBookId
    );

    if (!wasBookRemoved) {
      return next(new NotFoundError('Book not found in saved list.'));
    }

    res.status(StatusCodes.OK).json({
      msg: 'Book removed from saved list successfully.',
      savedBooks: updatedSavedBooks,
    });
  } catch (error) {
    console.error('Error removing book:', error);
    next(error);
  }
};

module.exports = {
  addBookToSavedBooks,
  getSavedBooks,
  deleteBookFromSavedBooks
};
