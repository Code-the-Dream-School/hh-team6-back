const express = require('express');
const router = express.Router();
const auth = require('../middleware/authentication');
const { addBookToSavedBooks,  } = require('../controllers/savedBooksController');

router.post('/', auth, addBookToSavedBooks);

module.exports = router;