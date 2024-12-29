const express = require('express');
const auth = require('../middleware/authentication');
const { createChat, getAllUserChats, sendMessage, getChatWithMessages } = require('../controllers/MessagesController');
const router = express.Router();

router.post('/', auth, createChat);
router.get('/', auth, getAllUserChats);
router.post('/:chatId/messages', auth, sendMessage);
router.get('/:chatId/messages', auth, getChatWithMessages);

module.exports = router;