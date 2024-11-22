const Book = require('../models/Book');
const { NotFoundError, BadRequestError } = require('../errors');
const { StatusCodes } = require('http-status-codes');
const { validateImageURL } = require('../utils/validateImageUrl');

const getAllBooks = async (req, res, next) => {
  try {
    const {
      query, //general search
      title,
      author,
      isbn,
      limit = 12,
      skip = 0,
      ageCategory,
      condition,
      genre,
      coverType,
      sort = '-createdAt',
      userId,
    } = req.query;

    const queryObj = {};

    //filter by user
    if (userId) {
      queryObj.createdBy = userId;
    }

    //General search by "query"
    if (query) {
      queryObj.$or = [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } },
        { isbn10: { $regex: query, $options: 'i' } },
        { isbn13: { $regex: query, $options: 'i' } },
      ];
    }

    // Combine conditions from the form on the main page
    const searchConditions = [];
    if (title) {
      searchConditions.push({ title: { $regex: title, $options: 'i' } });
    }
    if (author) {
      searchConditions.push({ author: { $regex: author, $options: 'i' } });
    }
    if (isbn) {
      searchConditions.push(
        { isbn10: { $regex: isbn, $options: 'i' } },
        { isbn13: { $regex: isbn, $options: 'i' } }
      );
    }

    if (searchConditions.length > 0) {
      queryObj.$and = searchConditions;
    }

    // Filter by multiple choice
    if (ageCategory) {
      queryObj.ageCategory = { $in: ageCategory.split(',') };
    }
    if (condition) {
      queryObj.condition = { $in: condition.split(',') };
    }
    if (genre) {
      queryObj.genre = { $in: genre.split(',') };
    }
    if (coverType) {
      queryObj.coverType = { $in: coverType.split(',') };
    }

    const books = await Book.find(queryObj)
      .sort(sort)
      .limit(Number(limit))
      .skip(Number(skip));

    res.status(StatusCodes.OK).json({ books, count: books.length });
  } catch (error) {
    console.error('Error fetching books:', error);
    next(error);
  }
};

const getBook = async (req, res, next) => {
  try {
    const { id: bookId } = req.params;

    const book = await Book.findById(bookId);

    if (!book) {
      return next(new NotFoundError(`No book with id ${bookId}`));
    }

    res.status(StatusCodes.OK).json({ book });
  } catch (error) {
    console.error('Error fetching book:', error);
    next(error);
  }
};

const createBook = async (req, res, next) => {
  try {
    const { coverImageUrl, ...bookData } = req.body;

    if (coverImageUrl && !(await validateImageURL(coverImageUrl))) {
      return next(new BadRequestError('Invalid cover image URL format.'));
    }
    
    bookData.createdBy = req.user.userId;
    bookData.language = req.body.language || 'English';
    bookData.coverImageUrl =
      coverImageUrl || process.env.DEFAULT_COVER_IMAGE_URL;
    
    const book = await Book.create(bookData);
    res
      .status(StatusCodes.CREATED)
      .json({ msg: 'The book has been successfully created.', book });
  } catch (error) {
    next(error);
  }
};

const updateBook = async (req, res, next) => {
  try {
    const { coverImageUrl, ...updateData } = req.body;
    const { id: bookId } = req.params;
    const {
      user: { userId },
    } = req;
    
    const book = await Book.findById(bookId);
    if (!book) {
      return next(new NotFoundError(`No book found with id: ${bookId}`));
    }

    if (book.createdBy.toString() !== userId) {
      return next(
        new BadRequestError('You are not authorized to update this book')
      );
    }

    if (
      coverImageUrl &&
      coverImageUrl !== process.env.DEFAULT_COVER_IMAGE_URL &&
      !(await validateImageURL(coverImageUrl))
    ) {
      return next(new BadRequestError('Invalid cover image URL format.'));
    }
    
    if (coverImageUrl && coverImageUrl !== process.env.DEFAULT_COVER_IMAGE_URL) {
      updateData.coverImageUrl = coverImageUrl;
    } else if (!coverImageUrl) {
      updateData.coverImageUrl = book.coverImageUrl;
    }    

    const updatedBook = await Book.findByIdAndUpdate(bookId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedBook) {
      console.log('Failed to update book');
      return next(new Error('Book update failed.'));
    }

    res.status(StatusCodes.OK).json({ msg: 'The book has been successfully updated.', updatedBook });
  } catch (error) {
    console.error('Error updating book:', error);
    next(error);
  }
};

const deleteBook = async (req, res, next) => {
  try {
    const {
      user: { userId },
      params: { id: bookId },
    } = req;

    const book = await Book.findByIdAndDelete({
      _id: bookId,
      createdBy: userId,
    });

    if (!book) {
      return next(new NotFoundError(`No book found with id: ${bookId}`));
    }

    res.status(StatusCodes.OK).json({
      msg: `Book with id ${bookId} has been successfully deleted.`,
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    next(error);
  }
};

module.exports = {
  createBook,
  getAllBooks,
  getBook,
  updateBook,
  deleteBook
};