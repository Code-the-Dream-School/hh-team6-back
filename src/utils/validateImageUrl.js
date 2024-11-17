const urlValidationPattern = /^(https?:\/\/.*\.(?:jpg|jpeg|png|webp|bmp))$/i;

const validateImageURL = (url) => {
  if (url === null) {
    return true;
  }
  return urlValidationPattern.test(url);
};

module.exports = { validateImageURL };