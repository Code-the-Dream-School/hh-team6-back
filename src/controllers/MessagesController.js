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
        lastMessage: { timestamp: new Date() }, 
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

const getAllUserChats = async (req, res, next) => {
  try {
    const { userId } = req.user;

    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'firstName lastName')
      .select('-__v')
      .sort({ 'lastMessage.timestamp': -1, createdAt: -1 });

    if (!chats || chats.length === 0) {
      return res
        .status(StatusCodes.OK)
        .json(chats);
    }

    const chatsData = chats.map((chat) => {
      const otherParticipant = chat.participants.find(
        (participant) => participant._id.toString() !== userId
      );

      return {
        id: chat._id,
        peerId: otherParticipant._id,
        peerName: `${otherParticipant.firstName} ${otherParticipant.lastName}`,
      };
    });

    res.status(StatusCodes.OK).json(chatsData);
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { userId: senderId } = req.user;
    const { message } = req.body;
    const { chatId } = req.params;

    if (!chatId || !message) {
      return next(new BadRequestError('Chat ID and message are required'));
    }

    const newMessage = new Message({
      chat: chatId,
      sender: senderId,
      message: message,
    });

    await Chat.findByIdAndUpdate(
      chatId,
      { 'lastMessage.timestamp': newMessage.timestamp },
      { new: true }
    );

    await newMessage.save();

    const populatedMessage = await Message.findById(newMessage._id)
      .select('-__v')
      .populate('sender', 'firstName lastName');

    res.status(StatusCodes.CREATED).json(populatedMessage);
  } catch (error) {
    next(error);
  }
};

const getChatWithMessages = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { chatId } = req.params;

    if (!chatId) {
      return next(new BadRequestError('Chat ID is required'));
    }

    const chat = await Chat.findById(chatId).select('-__v').populate({
      path: 'participants',
      select: 'firstName lastName',
    });

    if (!chat) {
      return next(new NotFoundError('Chat not found'));
    }

    if (
      !chat.participants.some((participant) => participant._id.equals(userId))
    ) {
      return next(new NotFoundError('User is not a participant of this chat'));
    }

    const messages = await Message.find({ chat: chatId })
      .select('-__v')
      .populate({
        path: 'sender',
        select: '_id',
      })
      .sort({ timestamp: 1 });

    const messagesData = messages.map((message) => ({
      _id: message._id,
      senderId: message.sender._id,
      text: message.message,
      timestamp: message.timestamp,
    }));

    res.status(StatusCodes.OK).json({ chat, messages: messagesData });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createChat,
  getAllUserChats,
  sendMessage,
  getChatWithMessages,
};
