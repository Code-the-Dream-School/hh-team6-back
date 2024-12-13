const { BadRequestError } = require('../errors');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new BadRequestError('Please provide an email');
    }

    const user = await User.findOne({ email });
    if (!user) {console.log('User not found for email:', email);
      throw new BadRequestError('User with this email does not exist');
    }

    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    const resetLink = `${process.env.FRONTEND_URL}/password/reset?token=${resetToken}`;
    if (!process.env.FRONTEND_URL) {
      throw new BadRequestError('FRONTEND_URL is not available in .env');
    }

    const resetMessage = `
            <h3>Password Reset Request</h3>
            <p>You are receiving this email because you (or someone else) have requested the reset of a password.</p>
            <p>If you did not request this, please ignore this email.</p>
            <p>Please click the link below to reset your password.</p>
            <p>This link is valid for 1 hour:</p>
            <a href="${resetLink}">Reset Password</a>
          `;

    await sendEmail(user.email, 'Password Reset Request', resetMessage);

    res.status(StatusCodes.OK).json({ msg: 'Reset link sent to email' });
  } catch (error) {
    console.error('Error sending reset email:', error.message);
    next(error);
  }
};

module.exports = {
  requestPasswordReset,
};
