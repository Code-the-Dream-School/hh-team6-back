const { BadRequestError, UnauthenticatedError } = require('../errors');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new BadRequestError('Please provide an email.');
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new BadRequestError('Invalid Credentials.');
    }

    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    console.log(resetToken);

    user.resetToken = resetToken;
    user.resetTokenExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/password/reset?token=${resetToken}`;
    if (!process.env.FRONTEND_URL) {
      throw new BadRequestError('Frontend URL is not available in .env');
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

    res
       .status(StatusCodes.OK)
       .json({ msg: 'Reset link sent to email' });
  } catch (error) {
    console.error('Error sending reset email:', error.message);
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw new BadRequestError('Token and new password are required');
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new UnauthenticatedError('Invalid or expired token');
    }

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;

    await user.save();

    res
      .status(StatusCodes.OK)
      .json({ msg: 'Password has been successfully reset' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestPasswordReset,
  resetPassword,
};
