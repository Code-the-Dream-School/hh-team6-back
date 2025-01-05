require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const favicon = require('express-favicon');
const logger = require('morgan');
const http = require('http');
const socketIO = require('socket.io');

const userRouter = require('./routes/userRouter.js');
const booksRouter = require('./routes/booksRouter.js');
const cartRouter = require('./routes/cartRouter.js');
const savedBooksRouter = require('./routes/savedBooksRouter.js');
const messagesRouter = require('./routes/MessagesRouter.js');
const errorHandlerMiddleware = require('./middleware/error-handler.js');
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
const connectDB = require('./db/db.js');
connectDB();

const app = express();

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
app.set('socketio', io);

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));

//static files
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static('public'));

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))
// routes
app.use('/api/v1', userRouter);
app.use('/api/v1/books', booksRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/saved-books', savedBooksRouter);
app.use('/api/v1/chats', messagesRouter);

app.use((req, res, next) => {
    const error = new Error(`Cannot ${req.method} ${req.originalUrl}`);
    error.statusCode = 404;
    error.type = 'GeneralError'; 
    next(error); 
});

// error handler middleware
app.use(errorHandlerMiddleware); 

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat: ${chatId}`);
  });

  socket.on('sendMessage', (data) => {
    const { chatId, message, senderId } = data;

    io.to(chatId).emit('newMessage', {
      chatId,
      senderId,
      message,
      timestamp: new Date(),
    });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

module.exports = { app, server };