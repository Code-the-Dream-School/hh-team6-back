const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors');

const register = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'Email is required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: 'Invalid credentials' });
    }

    const user = await User.create({ ...req.body });
    const token = user.createJWT();

    const { password, _id, __v, ...userData } = user.toObject();

    res.status(StatusCodes.CREATED).json({ userData, token });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: error.message });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError('Please provide email and password');
    }

    const user = await User.findOne({ email });
    if(!user) {
        throw new UnauthenticatedError('Invalid Credentials');
    };
  
    const isPasswordCorrect = await user.comparePassword(password);
    if(!isPasswordCorrect){
        throw new UnauthenticatedError('Invalid Credentials');
    };
    const token = user.createJWT();
    const {password:_, _id, __v, ...userData } = user.toObject();

    res.status(StatusCodes.OK).json({ user: userData, token });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const logout = (req, res) => {
  try {
  res
  .clearCookie('sessionToken', { httpOnly: true, secure: true, sameSite: 'strict' }) 
  .json({ message: 'Logout successful' });
  } catch (error) {
  console.error('Error during logout:', error);
  res
  .status(StatusCodes.INTERNAL_SERVER_ERROR)
  .json({ error: 'Logout failed' });
  }
  };

const updateUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthenticatedError('Unauthorized');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const { firstName, lastName, location } = req.body;
    const updates = {};

    // Only add fields to updates if they are not undefined
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (location !== undefined) {
      if (location.trim() === '') {
        throw new BadRequestError('Location cannot be empty');
      }
      updates.location = location;
    }

    
    if (Object.keys(updates).length === 0) {
      throw new BadRequestError('No valid fields to update');
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new BadRequestError('User not found');
    }
    const { password, _id, __v, ...userData } = updatedUser.toObject();


    res.status(StatusCodes.OK).json({ user: userData});
  } catch (error) {
    console.error('Error updating user:', error.message);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message || 'Error updating user' });
  }
};

module.exports = {
  register,
  login,
  logout,
  updateUser,
};
