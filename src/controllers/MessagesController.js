const Chat = require('../models/Chat');
const Message = require('../models/Message');
const { NotFoundError, BadRequestError } = require('../errors');
const { StatusCodes } = require('http-status-codes');

const createChat = async (req, res, next) => {
  try {
    const { userId: currentUserId } = req.user;
    const { userId: otherUserId } = req.body;

    if (!otherUserId) {
      return next(
        new BadRequestError('User ID of the other participant must be provided')
      );
    }

    let chat = await Chat.findOne({
      participants: { $all: [currentUserId, otherUserId] },
    });

    if (!chat) {
      chat = new Chat({
        participants: [currentUserId, otherUserId],
      });
      await chat.save();
    }

    res.status(StatusCodes.OK).json({
      msg: 'Chat created successfully',
      chat,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createChat,
};
