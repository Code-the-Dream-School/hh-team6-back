const https = require('https');
const http = require('http');
const { BadRequestError } = require('../errors'); 

const isValidUrl = (url) => {
  try {
    new URL(url); 
    return true;
  } catch (e) {
    return false;
  }
};

const urlValidationPattern = /^(https?:\/\/.*\.(jpg|jpeg|png|webp|bmp))$/i;

const validateImageURL = (url) => {
  return new Promise((resolve, reject) => {

    if (!url || !isValidUrl(url)) {
      console.error(`Invalid URL format: ${url}`);
      return reject(new BadRequestError('Invalid cover image URL format.'));
    }

    if (!urlValidationPattern.test(url)) {
      console.error(`Invalid image URL format: ${url}`);
      return reject(new BadRequestError('The URL does not point to a valid image.'));
    }

    const protocol = url.startsWith('https') ? https : http;

    const req = protocol.request(
      url,
      { method: 'HEAD', timeout: 5000 },
      (res) => {
        const contentType = res.headers['content-type'];

        if (res.statusCode === 200 && contentType && contentType.startsWith('image/')) {
          console.log(`URL validated successfully: ${url}`);
          resolve(true); 
        } else {
          console.error(`Validation failed for URL: ${url}. Status code: ${res.statusCode}, Content-Type: ${contentType}`);
          reject(new BadRequestError('The URL is not a valid image or not reachable.'));
        }
      }
    );

    req.on('timeout', () => {
      req.abort();
      console.error(`Validation timed out for URL: ${url}`);
      reject(new BadRequestError('URL validation timed out.'));
    });

    req.on('error', (err) => {
      console.error(`Error validating URL: ${url}. Reason: ${err.message}`);
      reject(new BadRequestError(`Error validating the URL: ${err.message}`));
    });

    req.end();
  });
};

module.exports = { validateImageURL };
