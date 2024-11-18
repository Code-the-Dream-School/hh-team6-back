const express = require('express');
const router = express.Router();
const auth = require('../middleware/authentication');
const { createBook, getAllBooks } = require('../controllers/bookController');

//add a new book
router.route('/').post(auth, createBook); 

//get all books
router.route('/').get(getAllBooks);

module.exports = router;
