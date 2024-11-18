const Book = require('../models/Book');
const { NotFoundError, BadRequestError } = require('../errors');
const { StatusCodes } = require('http-status-codes');

const getAllBooks = async (req, res, next) => {
  try {
    const {
      query,
      limit = 12,
      skip = 0,
      ageCategory,
      condition,
      genre,
      coverType,
      sort = '-createdAt',
      userId
    } = req.query;
    const queryObj = {};

    if (userId) {
        queryObj.createdBy = userId; 
    }

    //search by title, author, isbn
    if (query) {
      queryObj.$or = [
        { title: { $regex: query, $options: 'i' } },
        { author: { $regex: query, $options: 'i' } },
        { isbn10: { $regex: query, $options: 'i' } },
        { isbn13: { $regex: query, $options: 'i' } },
      ];
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
    console.log('Error fetching books:', error);
    next(error);
  }
};

const createBook = async (req, res, next) => {
  try {
    const { coverImageUrl, ...bookData } = req.body;
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

module.exports = {
  createBook,
  getAllBooks,
};