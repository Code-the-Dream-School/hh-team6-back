const express = require('express');
const router = express.Router();
const { register, login, logout, updateUser } = require('../controllers/userController.js');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.patch('/update', updateUser);

module.exports = router;
