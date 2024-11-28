const { BadRequestError } = require('../errors');

const cloudinary = require('cloudinary').v2;
const { DEFAULT_IMAGE_URL, DEFAULT_IMAGE_PUBLIC_ID } = require('../config/cloudinary');

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

const uploadImage = async (file, url, folder = 'books') => {
  if (file) {
    const result = await uploadFile(file);
    return {
      coverImageUrl: result.secure_url,
      coverImagePublicId: result.public_id,
    };
  } else if (url) {
    const result = await cloudinary.uploader.upload(url, { folder });
    return {
      coverImageUrl: result.secure_url,
      coverImagePublicId: result.public_id,
    };
  } else {
    return {
      coverImageUrl: DEFAULT_IMAGE_URL,
      coverImagePublicId: DEFAULT_IMAGE_PUBLIC_ID,
    };
  }
};

module.exports = { uploadFile, uploadImage};
