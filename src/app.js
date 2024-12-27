require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const favicon = require('express-favicon');
const logger = require('morgan');

const userRouter = require('./routes/userRouter.js');
const booksRouter = require('./routes/booksRouter.js');
const cartRouter = require('./routes/cartRouter.js');
const savedBooksRouter = require('./routes/savedBooksRouter.js');
const messagesRouter = require('./routes/MessagesRouter.js');
const errorHandlerMiddleware = require('./middleware/error-handler.js');
const connectDB = require('./db/db.js');
connectDB();

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));

//static files
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static('public'));

// routes
app.use('/api/v1', userRouter);
app.use('/api/v1/books', booksRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/saved-books', savedBooksRouter);
app.use('/api/v1/messages', messagesRouter);

app.use((req, res, next) => {
    const error = new Error(`Cannot ${req.method} ${req.originalUrl}`);
    error.statusCode = 404;
    error.type = 'GeneralError'; 
    next(error); 
});

// error handler middleware
app.use(errorHandlerMiddleware); 

module.exports = app;
