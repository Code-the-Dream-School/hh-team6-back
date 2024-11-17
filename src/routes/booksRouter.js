const express = require('express');
const router = express.Router();
const auth = require('../middleware/authentication');
const { createBook } = require('../controllers/bookController');

//add a new book
router.route('/').post(auth, createBook); 

module.exports = router;
