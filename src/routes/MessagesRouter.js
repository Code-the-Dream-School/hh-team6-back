const express = require('express');
const auth = require('../middleware/authentication');
const { createChat, getAllUserChats, sendMessage, getChatWithMessages } = require('../controllers/MessagesController');
const router = express.Router();

router.post('/create-chat', auth, createChat);
router.get('/chats', auth, getAllUserChats);
router.post('/send', auth, sendMessage);
router.get('/:chatId', auth, getChatWithMessages);

module.exports = router;