const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  lastMessage: {
    timestamp: { type: Date },
  },
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
