const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors');

const register = async (req, res) => {
  try {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'User with this email already exists' });
    }

    const user = await User.create({ ...req.body });
    const token = user.createJWT();
    res.status(StatusCodes.CREATED).json({ user, token });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError('Please provide email and password');
    }
    const user = await User.findOne({ email });

    if (!user) {
      throw new UnauthenticatedError('Invalid email');
    }
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new UnauthenticatedError('Invalid Credentials');
    }

    const token = user.createJWT();

    const { email: userEmail, firstName, lastName } = user;
    delete userInfo.password;

    res.status(StatusCodes.OK).json({ userEmail, firstName, lastName, token });
  } catch (error) {
    console.error('Error logging in:', error);
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const errorMessage = error.message || 'Error logging in';
    res.status(statusCode).json({ message: errorMessage });
  }
};
const logout = async (req, res) => {
  try {
    res.status(StatusCodes.OK).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error during logout:', error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Logout failed' });
  }
};

module.exports = {
  register,
  login,
  logout,
};
