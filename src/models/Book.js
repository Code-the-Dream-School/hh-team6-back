const mongoose = require('mongoose');
const { validateImageURL } = require('../utils/validateImageUrl');
const { validateISBN13, validateISBN10 } = require('../utils/validateISBN');

const BookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: [2, 'Title must be at least 2 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    author: {
      type: String,
      required: true,
      minlength: [2, 'Author must be at least 2 characters long'],
      maxlength: [100, 'Author cannot exceed 100 characters'],
    },
    publisher: {
      type: String,
      required: true,
      minlength: [2, 'Publisher must be at least 2 characters long'],
      maxlength: [100, 'Publisher cannot exceed 100 characters'],
    },
    publishedYear: {
      type: Number,
      required: true,
      min: [1440, 'Published year must be a valid year'],
      max: [new Date().getFullYear(), 'Published year cannot be in the future'],
    },
    pages: {
      type: Number,
      required: true,
      min: [2, 'Minimum number of pages must be at least 2'],
    },
    isbn10: {
      type: String,
      validate: {
        validator: validateISBN10,
        message: 'Invalid ISBN-10 format. It should be 10 characters long, with optional dashes.',
      },
    },
    isbn13: {
      type: String,
      validate: {
        validator: validateISBN13,
        message: 'Invalid ISBN-13 format. It should be 13 characters long, with optional dashes.',
      },
      required: function () {
        return !this.isbn10;
      },
    },
    description: {
      type: String,
      minlength: [2, 'Description must be at least 2 characters long'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
      required: true,
    },
    genre: {
      type: [String],
      enum: [
        'Adventure',
        'Animal Stories',
        'Art & Architecture',
        'Biographies & Memoirs',
        'Business & Economics',
        'Chapter Books',
        'Classics',
        'Comics And Graphic Novels',
        'Coming of Age',
        'Cooking & Food',
        'Crafts',
        'Crime & Detective',
        'Cultural Studies',
        'Diaries & Journals',
        'Dystopia',
        'Education',
        'Entertainment & Performing Arts',
        'Fairy Tales, Myths & Fables',
        'Fantasy',
        'Fiction & Literature',
        'Games & Activities',
        'Gardening & Outdoors',
        'Halloween',
        'Harry Potter',
        'Health & Medicine',
        'History',
        'Holiday & Festivals',
        'Horror',
        'Humor',
        'Insects',
        'Language & Linguistics',
        'Mystery',
        'Nature',
        'Nonfiction',
        'Parenting & Family',
        'Philosophy',
        'Photography',
        'Picture Books',
        'Poetry',
        'Politics, Government & Law',
        'Religion & Beliefs',
        'Romance',
        'Science & Technology',
        'Science Fiction',
        'Self-help',
        'Short Stories',
        'Sports & Adventure',
        'Thriller',
        'True Crime',
        'Transportation',
        'Travel & Adventure',
        'War & Military',
        'Western',
        'Workbooks',
        'Young Adult Fiction',
      ],
      required: true,
    },
    ageCategory: {
      type: String,
      enum: ['Children', 'Teens & Young Adult', 'Adult'],
      required: true,
    },
    condition: {
      type: String,
      enum: ['New', 'Like New', 'Very Good', 'Good', 'Acceptable'],
      required: true,
    },
    coverType: {
      type: String,
      enum: ['Hardcover', 'Softcover'],
      required: true,
    },
    language: {
      type: String,
      enum: ['English', 'Spanish', 'French', 'German', 'Russian', 'Other'],
      default: 'English',
    },
    price: {
      type: Number,
      required: true,
      min: [0.1, 'The price must be no less than 10 cents'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    coverImageUrl: {
      type: String,
      default: process.env.DEFAULT_COVER_IMAGE_URL,
      validate: {
        validator: validateImageURL,
        message: 'Invalid image URL. It must end with .jpg, .jpeg, .png, .webp or .bmp.',
      },
    },
    coverImagePublicId: {
      type: String,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { 
    timestamps: true 
  }
);

module.exports = mongoose.model('Book', BookSchema);