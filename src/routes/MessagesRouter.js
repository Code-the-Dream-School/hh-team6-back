const express = require('express');
const auth = require('../middleware/authentication');
const { createChat } = require('../controllers/MessagesController');
const router = express.Router();

router.post('/create-chat', auth, createChat);

module.exports = router;