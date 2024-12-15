const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const DEFAULT_IMAGE_URL = process.env.DEFAULT_IMAGE_URL;
const DEFAULT_IMAGE_PUBLIC_ID = process.env.DEFAULT_IMAGE_PUBLIC_ID;

module.exports = {
  cloudinary,
  DEFAULT_IMAGE_URL,
  DEFAULT_IMAGE_PUBLIC_ID,
};