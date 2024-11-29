const { CloudinaryError, CustomAPIError } = require('../errors');

const cloudinary = require('cloudinary').v2;
const {
  DEFAULT_IMAGE_URL,
  DEFAULT_IMAGE_PUBLIC_ID,
} = require('../config/cloudinary');

const uploadFile = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'books', resource_type: 'auto' },
      (error, result) => {
        if (error) {
          return reject(
            new CloudinaryError('Failed to upload image to Cloudinary.')
          );
        }
        resolve(result);
      }
    );
    uploadStream.end(file.buffer);
  });
};

const deleteImage = async (coverImagePublicId) => {
  if (!coverImagePublicId || coverImagePublicId === DEFAULT_IMAGE_PUBLIC_ID) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(coverImagePublicId);
    console.log(`Image with ID ${coverImagePublicId} successfully deleted.`);
  } catch (error) {
    console.error(`Error deleting image with ID ${coverImagePublicId}:`, error);
    throw new CloudinaryError('Failed to delete image from Cloudinary.');
  }
};

const uploadImage = async (file, url, folder = 'books') => {
  try {
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
  } catch (error) {
    console.error('Error in uploadImage:', {
      message: error.message,
      file: file ? 'Provided' : 'None',
      url,
    });
    throw error instanceof CustomAPIError
      ? error
      : new CloudinaryError('Unexpected error during image upload.');
  }
};

module.exports = { uploadFile, deleteImage, uploadImage };