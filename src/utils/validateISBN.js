const isbn10Pattern = /^(?:\d{9}[\dXx]|\d{1,5}-\d{1,7}-\d{1,7}-[\dXx])$/;
const isbn13Pattern = /^(97[89])(-?\d){10}$/;

const validateISBN10 = (isbn10) => {
  return !isbn10 || isbn10Pattern.test(isbn10);
};

const validateISBN13 = (isbn13) => {
  return !isbn13 || isbn13Pattern.test(isbn13);
};

module.exports = { validateISBN10, validateISBN13 };