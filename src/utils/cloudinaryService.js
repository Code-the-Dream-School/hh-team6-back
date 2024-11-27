const { BadRequestError } = require('../errors');

const cloudinary = require('cloudinary').v2;

const uploadFile = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'books', resource_type: 'auto' },
      (error, result) => {
        if (error) {
          return reject(
            new BadRequestError('Failed to upload image to Cloudinary.')
          );
        }
        resolve(result);
      }
    );
    uploadStream.end(file.buffer);
  });
};

module.exports = { uploadFile };
