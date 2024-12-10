const express = require('express');
const router = express.Router();
const auth = require('../middleware/authentication');
const { addBookToSavedBooks, getSavedBooks, deleteBookFromSavedBooks } = require('../controllers/savedBooksController');

router.post('/', auth, addBookToSavedBooks);
router.get('/', auth, getSavedBooks);
router.delete('/', auth, deleteBookFromSavedBooks);

module.exports = router;