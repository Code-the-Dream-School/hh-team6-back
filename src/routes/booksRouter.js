const express = require('express');
const router = express.Router();
const auth = require('../middleware/authentication');
const { createBook, getAllBooks, getBook, deleteBook } = require('../controllers/bookController');

//add a new book
router.route('/').post(auth, createBook); 

//get all books
router.route('/').get(getAllBooks);

//single book
router.route('/:id')
        .get(getBook)
        .delete(auth, deleteBook); 

module.exports = router;
