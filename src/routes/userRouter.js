const express = require('express');
const router = express.Router();
const { register, login, logout, updateUser } = require('../controllers/userController.js');
const { requestPasswordReset, resetPassword } = require('../controllers/passwordRecoveryController.js');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.patch('/update', updateUser);

//password recovery
router.post('/forgot-password', requestPasswordReset);
router.post('/password-reset', resetPassword);

module.exports = router;
