const isbn10Pattern = /^(?:\d{9}[\dXx]|\d{10})$/;
const isbn13Pattern = /^(97[89])(\d{1,5})(\d{1,7})(\d{1,7})(\d{1})$/;

const validateISBN10 = (isbn10) => {
  const cleanedIsbn10 = isbn10.replace(/-/g, '');
  return cleanedIsbn10.length === 10 && isbn10Pattern.test(cleanedIsbn10); 
};

const validateISBN13 = (isbn13) => {
  const cleanedIsbn13 = isbn13.replace(/-/g, '');
  return cleanedIsbn13.length === 13 && isbn13Pattern.test(cleanedIsbn13); 
};

module.exports = { validateISBN10, validateISBN13 };