const express = require('express');
const router = express.Router();
const auth = require('../middleware/authentication');
const checkObjectId = require('../middleware/checkObjectId');
const { createBook, getAllBooks, getBook, deleteBook, updateBook } = require('../controllers/bookController');
const upload = require('../middleware/uploadFile');

//add a new book
router.route('/').post(auth, upload, createBook); 

//get all books
router.route('/').get(getAllBooks);

//single book
router.route('/:id')
    .get(checkObjectId, getBook)         
    .patch(auth, checkObjectId, updateBook)   
    .delete(auth, checkObjectId, deleteBook); 

module.exports = router;
