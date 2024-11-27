const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const DEFAULT_IMAGE_URL =
  'https://res.cloudinary.com/dmbwryeam/image/upload/default_cover.jpg';
const DEFAULT_IMAGE_PUBLIC_ID = 'default_cover';

module.exports = {
  cloudinary,
  DEFAULT_IMAGE_URL,
  DEFAULT_IMAGE_PUBLIC_ID,
};