const Book = require('../models/Book');
const { NotFoundError, BadRequestError } = require('../errors');
const { StatusCodes } = require('http-status-codes');
const { validateImageURL } = require('../utils/validateImageUrl');
const { uploadImage, deleteImage } = require('../utils/cloudinaryService');
const { DEFAULT_IMAGE_PUBLIC_ID, DEFAULT_IMAGE_URL } = require('../config/cloudinary');

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
      isAvailable,
    } = req.query;

    const validatedLimit = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100);
    const validatedSkip = Math.max(parseInt(skip, 10) || 0, 0);

    const queryObj = {};

    // Filter by availability
    if (isAvailable !== undefined) {
      if (isAvailable === 'true') {
        queryObj.isAvailable = true; // Available books
      } else if (isAvailable === 'false') {
        queryObj.isAvailable = false; // Sold books
      }
    }

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
      searchConditions.push({
        $or: [
          { isbn10: { $regex: isbn, $options: 'i' } },
          { isbn13: { $regex: isbn, $options: 'i' } }
        ]
      });
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
      .limit(validatedLimit) 
      .skip(validatedSkip);  

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
    const { coverImageUrl, isbn10, isbn13, ...bookData } = req.body;

    if (!isbn10 && !isbn13) {
      return next(
        new BadRequestError(
          'At least one ISBN (ISBN-10 or ISBN-13) must be provided.'
        )
      );
    }

    if (coverImageUrl && !(await validateImageURL(coverImageUrl))) {
      return next(new BadRequestError('Invalid cover image URL format.'));
    }

    bookData.createdBy = req.user.userId;
    bookData.language = req.body.language || 'English';

    try {
      const imageData = await uploadImage(req.file, coverImageUrl);
      bookData.coverImageUrl = imageData.coverImageUrl;
      bookData.coverImagePublicId = imageData.coverImagePublicId;
    } catch (error) {
      return next(error);
    }

    const book = await Book.create({
      ...bookData,
      isbn10: isbn10 || undefined,
      isbn13: isbn13 || undefined,
    });
    res
      .status(StatusCodes.CREATED)
      .json({ msg: 'The book has been successfully created.', book });
  } catch (error) {
    next(error);
  }
};

const updateBook = async (req, res, next) => {
  try {
    const {
      title, author, publisher, publishedYear, pages, isbn10, isbn13,
      description, genre, ageCategory, condition, coverType, language,
      price, coverImageUrl, isAvailable
    } = req.body;
    const { id: bookId } = req.params;
    const { user: { userId } } = req;

    let newImageData = {};

    if (req.file || (coverImageUrl && coverImageUrl !== DEFAULT_IMAGE_URL)){
      const book = await Book.findById(bookId);
      if (!book) {
        return next(new NotFoundError(`No book found with id: ${bookId}`));
      }

      const oldPublicId = book.coverImagePublicId;
      if (oldPublicId && oldPublicId !== DEFAULT_IMAGE_PUBLIC_ID) {
        await deleteImage(oldPublicId);
      }
      
      if (req.file) {
        newImageData = await uploadImage(req.file);
      } else if (coverImageUrl !== book.coverImageUrl) {
        if (!(await validateImageURL(coverImageUrl))) {
          return next(new BadRequestError('Invalid cover image URL format.'));
        }
        newImageData = await uploadImage(null, coverImageUrl);
      }
    }

    const updateData = {
      title, author, publisher, publishedYear, pages, isbn10, isbn13,
      description, genre, ageCategory, condition, coverType, language,
      price, isAvailable, ...newImageData,
    };

    //Remove fields with undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });
    
    const updatedBook = await Book.findByIdAndUpdate(
      bookId,
      { ...updateData, createdBy: userId }, 
      {
        new: true, 
        runValidators: true, 
      }
    );

    if (!updatedBook) {
      return next(new NotFoundError(`No book found with id: ${bookId}`));
    }

    res.status(StatusCodes.OK).json({
      msg: 'The book has been successfully updated.',
      updatedBook,
    });
  } catch (error) {
    console.error('Error updating book:', error);
    next(error);
  }
};

const deleteBook = async (req, res, next) => {
  try {
    const { id: bookId } = req.params;

    const book = await Book.findByIdAndDelete(bookId);

    if (!book) {
      return next(new NotFoundError(`No book found with id: ${bookId}`));
    }

    if (book.coverImagePublicId && book.coverImagePublicId !== DEFAULT_IMAGE_PUBLIC_ID) {
      await deleteImage(book.coverImagePublicId);
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