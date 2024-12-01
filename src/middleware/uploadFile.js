const multer = require('multer');
const { BadRequestError } = require('../errors');

const MAX_FILE_SIZE = 1 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
            return cb(new BadRequestError(`Allowed file types are: ${ALLOWED_FILE_TYPES.join(', ')}`));
        }
        cb(null, true);
    },
}).single('file'); // field name 'file'

module.exports = upload;