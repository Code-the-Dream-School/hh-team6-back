require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const favicon = require('express-favicon');
const logger = require('morgan');

const userRouter = require('./routes/userRouter.js');
const booksRouter  = require('./routes/booksRouter.js');
const errorHandlerMiddleware = require('./middleware/error-handler.js');
const connectDB = require('./db/db.js');
connectDB();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use(express.static('public'));
app.use(favicon(__dirname + '/public/favicon.ico'));

// routes
app.use('/api/v1', userRouter);
app.use('/api/v1/books', booksRouter);

// error handler middleware
app.use(errorHandlerMiddleware); 

module.exports = app;
