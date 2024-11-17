const Book = require('../models/Book');
const { NotFoundError, BadRequestError } = require('../errors');
const { StatusCodes } = require('http-status-codes');

const createBook = async (req, res, next) => {
    try {
      const { coverImageUrl, ...bookData } = req.body;
      bookData.createdBy = req.user.userId;
      bookData.language = req.body.language || 'English';
      bookData.coverImageUrl = coverImageUrl || process.env.DEFAULT_COVER_IMAGE_URL;
  
      const book = await Book.create(bookData);
      res.status(StatusCodes.CREATED).json({ msg: 'The book has been successfully created.', book });
    } catch (error) {
      next(error); 
    }
  };

module.exports = {
    createBook,
};